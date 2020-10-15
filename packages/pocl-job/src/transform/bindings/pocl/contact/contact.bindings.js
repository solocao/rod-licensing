import { Binding } from '../../binding.js'

/**
 * Forename of Licensee
 * @type {Binding}
 */
export const Forename = new Binding({ element: 'LICENSEE_FORENAME', transform: Binding.TransformTextOnly })

/**
 * Surname of Licensee
 * @type {Binding}
 */
export const Surname = new Binding({ element: 'LICENSEE_SURNAME', transform: Binding.TransformTextOnly })

/**
 * Date of Birth of Licensee
 * @type {Binding}
 */
export const BirthDate = new Binding({ element: 'DOB', transform: Binding.TransformUKDate })

/**
 * Notify email address
 * @type {Binding}
 */
export const NotifyEmail = new Binding({ element: 'NOTIFY_EMAIL_ADDRESS', transform: Binding.TransformTextOnly })

/**
 * Newsletter email address
 * @type {Binding}
 */
export const NewsletterEmail = new Binding({ element: 'NEWSLETTER_EMAIL_ADDRESS', transform: Binding.TransformTextOnly })

/**
 * Newsletter opt in
 * @type {Binding}
 */
export const NewsletterOption = new Binding({ element: 'NEWSLETTER_OPTION', transform: Binding.TransformYesNo('Email') })

/**
 * Notify mobile phone number
 * @type {Binding}
 */
export const NotifyMobilePhone = new Binding({ element: 'NOTIFY_SMS_NUMBER', transform: Binding.TransformTextOnly })

/**
 * Preferred Method for the Environment Agency to Notify you about your licence, confirm your licence number, your licence has expired,
 * licence needs renewing, Licence can be upgraded, Licence has been despatched – Post
 * @type {Binding}
 */
export const NotifyByPost = new Binding({ element: 'NOTIFY_POST', transform: Binding.TransformYesNo('Letter') })

/**
 * Preferred Method for the Environment Agency to Notify you about your licence, confirm your licence number, your licence has expired,
 * licence needs renewing, Licence can be upgraded, Licence has been despatched – Email
 * @type {Binding}
 */
export const NotifyByEmail = new Binding({ element: 'NOTIFY_EMAIL', transform: Binding.TransformYesNo('Email') })

/**
 * Preferred Method for the Environment Agency to Notify you about your licence, confirm your licence number, your licence has expired,
 * licence needs renewing, Licence can be upgraded, Licence has been despatched - SMS
 * @type {Binding}
 */
export const NotifyBySms = new Binding({ element: 'NOTIFY_SMS', transform: Binding.TransformYesNo('Text') })

export { Address } from './address/address.bindings.js'
