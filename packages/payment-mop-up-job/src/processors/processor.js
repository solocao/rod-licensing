import { salesApi, govUkPayApi } from '@defra-fish/connectors-lib'
import {
  GOVUK_PAY_ERROR_STATUS_CODES,
  PAYMENT_JOURNAL_STATUS_CODES,
  TRANSACTION_SOURCE,
  PAYMENT_TYPE
} from '@defra-fish/business-rules-lib'

import Bottleneck from 'bottleneck'
import moment from 'moment'
import db from 'debug'
import { RATE_LIMIT_MS_DEFAULT, CONCURRENCY_DEFAULT } from '../constants.js'
const debug = db('payment-mop-up-job:execute')

const limiter = new Bottleneck({
  minTime: process.env.RATE_LIMIT_MS || RATE_LIMIT_MS_DEFAULT,
  maxConcurrent: process.env.CONCURRENCY || CONCURRENCY_DEFAULT
})

const processPaymentResults = async transaction => {
  if (transaction.paymentStatus.state.status === 'error') {
    await salesApi.updatePaymentJournal(transaction.id, { paymentStatus: PAYMENT_JOURNAL_STATUS_CODES.Failed })
  }

  if (transaction.paymentStatus.state.status === 'success') {
    debug(`Completing mop up finalization for transaction id: ${transaction.id}`)
    await salesApi.finaliseTransaction(transaction.id, {
      payment: {
        amount: transaction.paymentStatus.amount / 100,
        timestamp: transaction.paymentStatus.transactionTimestamp,
        source: TRANSACTION_SOURCE.govPay,
        method: PAYMENT_TYPE.debit
      }
    })
    await salesApi.updatePaymentJournal(transaction.id, { paymentStatus: PAYMENT_JOURNAL_STATUS_CODES.Completed })
  } else {
    // The payment expired
    if (transaction.paymentStatus.state.code === GOVUK_PAY_ERROR_STATUS_CODES.EXPIRED) {
      await salesApi.updatePaymentJournal(transaction.id, { paymentStatus: PAYMENT_JOURNAL_STATUS_CODES.Expired })
    }

    // The user cancelled the payment
    if (transaction.paymentStatus.state.code === GOVUK_PAY_ERROR_STATUS_CODES.USER_CANCELLED) {
      await salesApi.updatePaymentJournal(transaction.id, { paymentStatus: PAYMENT_JOURNAL_STATUS_CODES.Cancelled })
    }

    // The payment was rejected
    if (transaction.paymentStatus.state.code === GOVUK_PAY_ERROR_STATUS_CODES.REJECTED) {
      await salesApi.updatePaymentJournal(transaction.id, { paymentStatus: PAYMENT_JOURNAL_STATUS_CODES.Failed })
    }
  }
}

const getStatus = async paymentReference => {
  const paymentStatusResponse = await govUkPayApi.fetchPaymentStatus(paymentReference)
  const paymentStatus = await paymentStatusResponse.json()
  if (paymentStatus.state.status === 'success') {
    const eventsResponse = await govUkPayApi.fetchPaymentEvents(paymentReference)
    const { events } = await eventsResponse.json()
    paymentStatus.transactionTimestamp = events.find(e => e.state.status === 'success')?.updated
  }
  return paymentStatus
}

const getStatusWrapped = limiter.wrap(getStatus)

export const execute = async (ageMinutes, scanDurationHours) => {
  debug(
    `Running payment mop up processor with a payment age of ${ageMinutes} minutes ` + `and a scan duration of ${scanDurationHours} hours`
  )

  const toTimestamp = moment().add(-1 * ageMinutes, 'minutes')
  const fromTimestamp = toTimestamp.clone().add(-1 * scanDurationHours, 'hours')

  console.log(`Scanning the payment journal for payments created between ${fromTimestamp} and ${toTimestamp}`)

  const paymentJournals = await salesApi.paymentJournals.getAll({
    paymentStatus: PAYMENT_JOURNAL_STATUS_CODES.InProgress,
    from: fromTimestamp.toISOString(),
    to: toTimestamp.toISOString()
  })

  // Get the status for each payment from the GOV.UK Pay API.
  const transactions = await Promise.all(
    paymentJournals.map(async p => ({
      ...p,
      paymentStatus: await getStatusWrapped(p.paymentReference)
    }))
  )

  // Process each result
  await Promise.all(transactions.map(async t => processPaymentResults(t)))
}
