import { Binding } from '../../binding.js'
import * as contactBindings from '../contact/contact.bindings.js'
import * as licenceBindings from '../licence/licence.bindings.js'
import * as concessionBindings from '../licence/concession.bindings.js'
import { POST_OFFICE_DATASOURCE } from '../../../../staging/constants.js'
import moment from 'moment'

/**
 * Sequential serial number
 * @type {Binding}
 */
export const SerialNumber = new Binding({ element: 'SERIAL_NO', transform: Binding.TransformTextOnly })

/**
 * Date of transaction
 *
 * @type {Binding}
 */
export const TransactionDate = new Binding({ element: 'SYSTEM_DATE', transform: Binding.TransformTextOnly })

/**
 * Time of transaction
 *
 * @type {Binding}
 */
export const TransactionTime = new Binding({ element: 'SYSTEM_TIME', transform: Binding.TransformTextOnly })

/**
 * Sales Channel – FAD Code
 * @type {Binding}
 */
export const ChannelId = new Binding({ element: 'CHANNEL_ID', transform: Binding.TransformTextOnly })

/**
 * Amount paid
 * @type {Binding}
 */
export const AmountPaid = new Binding({ element: 'AMOUNT', transform: Binding.TransformNumeric })
const paymentMethods = {
  1: 'Cash',
  2: 'Cheque',
  3: 'Stamps',
  4: 'Debit card',
  5: 'Credit card'
}

/**
 * Mopex - method of payment
 * @type {Binding}
 */
export const MethodOfPayment = new Binding({
  element: 'MOPEX',
  transform: context => paymentMethods[Binding.TransformTextOnly(context)] || 'Other'
})

/**
 * Transaction record (the <REC> element)
 * @type {Binding}
 */
export const Transaction = new Binding({
  children: [
    ...Object.values(contactBindings),
    ...Object.values(licenceBindings),
    ...Object.values(concessionBindings),
    SerialNumber,
    ChannelId,
    MethodOfPayment,
    AmountPaid,
    TransactionDate,
    TransactionTime
  ],
  element: 'REC',
  transform: ({ children }) => {
    const transactionDate = moment(
      children[TransactionDate.element] + children[TransactionTime.element],
      'DD/MM/YYYYHH:mm:ss',
      true
    ).toISOString()
    const email = children[contactBindings.NotifyEmail.element] || children[contactBindings.CommsEmail.element]
    const mobilePhone = children[contactBindings.NotifyMobilePhone.element] || children[contactBindings.CommsMobilePhone.element]
    const preferredNotifyMethod = getPreferredContactMethod(
      children,
      contactBindings.NotifyByEmail.element,
      contactBindings.NotifyBySms.element,
      contactBindings.NotifyByPost.element
    )
    const preferredCommsMethod = getPreferredContactMethod(
      children,
      contactBindings.CommsByEmail.element,
      contactBindings.CommsBySms.element,
      contactBindings.CommsByPost.element
    )

    return {
      id: children[SerialNumber.element],
      createTransactionPayload: {
        dataSource: POST_OFFICE_DATASOURCE,
        permissions: [
          {
            licensee: {
              firstName: children[contactBindings.Forename.element],
              lastName: children[contactBindings.Surname.element],
              birthDate: children[contactBindings.BirthDate.element],
              ...(email && { email }),
              ...(mobilePhone && { mobilePhone }),
              ...children[contactBindings.Address.element],
              preferredMethodOfConfirmation: preferredNotifyMethod,
              preferredMethodOfNewsletter: preferredCommsMethod,
              preferredMethodOfReminder: preferredNotifyMethod
            },
            issueDate: transactionDate,
            startDate: moment(
              children[licenceBindings.StartDate.element] + children[licenceBindings.StartTime.element],
              'DD/MM/YYYYHH:mm',
              true
            ).toISOString(),
            permitId: children[licenceBindings.ItemId.element],
            ...children[concessionBindings.SeniorConcession.element],
            ...children[concessionBindings.PipConcession.element],
            ...children[concessionBindings.BlueBadgeConcession.element]
          }
        ]
      },
      finaliseTransactionPayload: {
        payment: {
          timestamp: transactionDate,
          amount: children[AmountPaid.element],
          source: POST_OFFICE_DATASOURCE,
          channelId: children[ChannelId.element],
          method: children[MethodOfPayment.element]
        }
      }
    }
  }
})

const getPreferredContactMethod = (data, emailElement, smsElement, postElement) =>
  data[emailElement] || data[smsElement] || data[postElement] || 'Prefer not to be contacted'