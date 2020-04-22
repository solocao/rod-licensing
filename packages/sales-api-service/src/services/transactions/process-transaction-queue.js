import {
  persist,
  Permission,
  Permit,
  Concession,
  ConcessionProof,
  FulfilmentRequest,
  Transaction,
  TransactionCurrency,
  TransactionJournal,
  RecurringPayment,
  RecurringPaymentInstruction
} from '@defra-fish/dynamics-lib'
import { getReferenceDataForEntityAndId, getGlobalOptionSetValue, getReferenceDataForEntity } from '../reference-data.service.js'
import { resolveContactPayload } from '../contacts.service.js'
import Boom from '@hapi/boom'
import AWS from '../aws.js'
import db from 'debug'
const { docClient } = AWS()
const debug = db('sales:transactions')
const STAGING_HISTORY_TTL_DELTA = process.env.TRANSACTION_STAGING_HISTORY_TABLE_TTL || 60 * 60 * 24 * 28

/**
 * Process messages from the transactions queue
 *
 * The payload from the queue will just include an id which is used to retrieve the payload of the transaction from DynamoDB
 *
 * @param id
 * @returns {Promise<void>}
 */
export async function processQueue ({ id }) {
  debug('Processing message from queue for staging id %s', id)
  const entities = []
  const transactionRecord = await retrieveTransaction(id)
  const { transaction, chargeJournal, paymentJournal } = await createTransactionEntities(transactionRecord)
  entities.push(transaction, chargeJournal, paymentJournal)

  const { recurringPayment, payer } = await processRecurringPayment(transactionRecord)
  recurringPayment && entities.push(recurringPayment, payer)

  let totalTransactionValue = 0.0
  const dataSource = await getGlobalOptionSetValue('defra_datasource', transactionRecord.dataSource)
  for (const { licensee, concession, permitId, referenceNumber, issueDate, startDate, endDate } of transactionRecord.permissions) {
    const contact = await resolveContactPayload(licensee)
    const permit = await getReferenceDataForEntityAndId(Permit, permitId)

    totalTransactionValue += permit.cost

    const permission = new Permission()
    permission.referenceNumber = referenceNumber
    permission.stagingId = transactionRecord.id
    permission.issueDate = issueDate
    permission.startDate = startDate
    permission.endDate = endDate
    permission.dataSource = dataSource

    permission.bindToContact(contact)
    permission.bindToPermit(permit)
    permission.bindToTransaction(transaction)

    entities.push(contact, permission)

    if (recurringPayment) {
      const paymentInstruction = new RecurringPaymentInstruction()
      // TODO: Discuss with Graham/Jai - this feels like it is obsolete
      paymentInstruction.referenceNumber = transactionRecord.recurringPayment.referenceNumber
      paymentInstruction.bindToContact(contact)
      paymentInstruction.bindToPermit(permit)
      paymentInstruction.bindToRecurringPayment(recurringPayment)
      entities.push(paymentInstruction)
    }

    concession && entities.push(await createConcessionProof(concession, permission))
    permit.isForFulfilment && entities.push(await createFulfilmentRequest(permission))
  }

  transaction.total = totalTransactionValue
  chargeJournal.total = -totalTransactionValue
  paymentJournal.total = totalTransactionValue

  debug('Persisting entities for staging id %s: %O', id, entities)
  await persist(...entities)
  debug('Moving staging data to history table for staging id %s', id)
  await docClient.delete({ TableName: process.env.TRANSACTIONS_STAGING_TABLE, Key: { id } }).promise()
  await docClient
    .put({
      TableName: `${process.env.TRANSACTIONS_STAGING_TABLE}History`,
      Item: Object.assign(transactionRecord, { expires: Math.floor(Date.now() / 1000) + STAGING_HISTORY_TTL_DELTA }),
      ConditionExpression: 'attribute_not_exists(id)'
    })
    .promise()
}

const retrieveTransaction = async id => {
  const result = await docClient.get({ TableName: process.env.TRANSACTIONS_STAGING_TABLE, Key: { id }, ConsistentRead: true }).promise()
  const record = result.Item
  if (!record) {
    debug('Failed to retrieve a transaction with staging id %s', id)
    throw Boom.notFound('A transaction for the specified identifier was not found')
  }
  debug('Retrieved transaction record for staging id %s: %O', id, record)
  return record
}

const processRecurringPayment = async transactionRecord => {
  let recurringPayment = null
  let payer = null
  if (transactionRecord.recurringPayment) {
    recurringPayment = new RecurringPayment()
    recurringPayment.referenceNumber = transactionRecord.recurringPayment.referenceNumber
    recurringPayment.mandate = transactionRecord.recurringPayment.mandate
    recurringPayment.inceptionDate = transactionRecord.paymentTimestamp
    payer = await resolveContactPayload(transactionRecord.recurringPayment.payer)
    recurringPayment.bindToContact(payer)
  }
  return { recurringPayment, payer }
}

const createTransactionEntities = async transactionRecord => {
  // Currently only a single currency (GBP) is supported
  const currency = (await getReferenceDataForEntity(TransactionCurrency))[0]

  const transaction = new Transaction()
  transaction.referenceNumber = transactionRecord.id
  transaction.description = `Transaction for ${transactionRecord.permissions.length} permission(s) recorded on ${transactionRecord.paymentTimestamp}`
  transaction.timestamp = transactionRecord.paymentTimestamp
  transaction.source = await getGlobalOptionSetValue('defra_financialtransactionsource', transactionRecord.paymentSource)
  transaction.paymentType = await getGlobalOptionSetValue('defra_paymenttype', transactionRecord.paymentMethod)
  transaction.bindToTransactionCurrency(currency)

  const chargeJournal = await createTransactionJournal(transactionRecord, transaction, 'Charge', currency)
  const paymentJournal = await createTransactionJournal(transactionRecord, transaction, 'Payment', currency)

  return { transaction, chargeJournal, paymentJournal }
}

const createTransactionJournal = async (transactionRecord, transactionEntity, type, currency) => {
  const journal = new TransactionJournal()
  journal.referenceNumber = transactionRecord.id
  journal.description = `${type} for ${transactionRecord.permissions.length} permission(s) recorded on ${transactionRecord.paymentTimestamp}`
  journal.timestamp = transactionRecord.paymentTimestamp
  journal.type = await getGlobalOptionSetValue('defra_financialtransactiontype', type)
  journal.bindToTransactionCurrency(currency)
  journal.bindToTransaction(transactionEntity)
  return journal
}

const createFulfilmentRequest = async permission => {
  const today = new Date()
  const refNumberExt = permission.referenceNumber.substring(permission.referenceNumber.lastIndexOf('-'))
  const fulfilmentRequest = new FulfilmentRequest()
  fulfilmentRequest.referenceNumber = today.toISOString() + refNumberExt
  fulfilmentRequest.requestTimestamp = today
  fulfilmentRequest.status = await getGlobalOptionSetValue('defra_fulfilmentrequeststatus', 'Pending')
  fulfilmentRequest.bindToPermission(permission)
  return fulfilmentRequest
}

const createConcessionProof = async (concession, permission) => {
  const proof = new ConcessionProof()
  const concessionEntity = await getReferenceDataForEntityAndId(Concession, concession.concessionId)
  proof.proofType = await getGlobalOptionSetValue('defra_concessionproof', concession.proof.type)
  proof.referenceNumber = concession.proof.referenceNumber
  proof.bindToPermission(permission)
  proof.bindToConcession(concessionEntity)
  return proof
}