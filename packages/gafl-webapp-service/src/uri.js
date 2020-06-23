/*
 * Page locations, templates
 */
export const LICENCE_LENGTH = { uri: '/buy/licence-length', page: 'licence-length' }
export const LICENCE_TYPE = { uri: '/buy/licence-type', page: 'licence-type' }
export const NUMBER_OF_RODS = { uri: '/buy/number-of-rods', page: 'number-of-rods' }
export const LICENCE_TO_START = { uri: '/buy/start-kind', page: 'licence-to-start' }
export const LICENCE_START_DATE = { uri: '/buy/start-date', page: 'licence-start-date' }
export const LICENCE_START_TIME = { uri: '/buy/start-time', page: 'licence-start-time' }

export const NO_LICENCE_REQUIRED = { uri: '/buy/no-licence-required', page: 'no-licence-required' }
export const JUNIOR_LICENCE = { uri: '/buy/junior-licence', page: 'junior-licence' }

export const BENEFIT_CHECK = { uri: '/buy/benefit-check', page: 'benefit-check' }
export const BENEFIT_NI_NUMBER = { uri: '/buy/benefit-ni-number', page: 'benefit-ni-number' }
export const BLUE_BADGE_CHECK = { uri: '/buy/blue-badge-check', page: 'blue-badge-check' }
export const BLUE_BADGE_NUMBER = { uri: '/buy/blue-badge-number', page: 'blue-badge-number' }
export const DATE_OF_BIRTH = { uri: '/buy/date-of-birth', page: 'date-of-birth' }

export const NAME = { uri: '/buy/name', page: 'name' }
export const ADDRESS_LOOKUP = { uri: '/buy/find-address', page: 'address-lookup' }
export const ADDRESS_SELECT = { uri: '/buy/select-address', page: 'address-select' }
export const ADDRESS_ENTRY = { uri: '/buy/address', page: 'address-entry' }
export const CONTACT = { uri: '/buy/contact', page: 'contact' }
export const NEWSLETTER = { uri: '/buy/newsletter', page: 'newsletter' }

export const CONTACT_SUMMARY = { uri: '/buy/contact-summary', page: 'contact-summary' }
export const LICENCE_SUMMARY = { uri: '/buy/licence-summary', page: 'licence-summary' }

export const PAYMENT_CANCELLED = { uri: '/buy/payment-cancelled', page: 'payment-cancelled' }
export const PAYMENT_FAILED = { uri: '/buy/payment-failed', page: 'payment-failed' }

export const TERMS_AND_CONDITIONS = { uri: '/buy/terms-conditions', page: 'terms-and-conditions' }
export const ORDER_COMPLETE = { uri: '/buy/order-complete', page: 'order-complete' }
export const ORDER_COMPLETE_PDF = { uri: '/buy/order-complete-pdf' }

/**
 * Renewals pages
 * @type {{uri: string}}
 */
export const IDENTIFY = { uri: '/buy/renew/identify/{referenceNumber}', page: 'identify' }
export const AUTHENTICATE = { uri: '/buy/renew/authenticate' }
export const RENEWAL_START_DATE = { uri: '/buy/renew/renewal-start-date', page: 'renewal-start-date' }
export const RENEWAL_START_VALIDATE = { uri: '/buy/renew/renewal-start-date/validate' }
export const RENEWAL_PUBLIC = { uri: '/renew/{referenceNumber}' }

export const CONTROLLER = { uri: '/buy' }
export const NEW_TRANSACTION = { uri: '/buy/new' }
export const ADD_PERMISSION = { uri: '/buy/add' }
export const AGREED = { uri: '/buy/agreed' }

export const CLIENT_ERROR = { uri: '/buy/client-error', page: 'client-error' }
export const SERVER_ERROR = { uri: '/buy/server-error', page: 'server-error' }

/**
 * These are informational static pages
 */
export const COOKIES = { uri: '/cookies', page: 'cookies' }
export const ACCESSIBILITY_STATEMENT = { uri: '/accessibility-statement', page: 'accessibility-statement' }
export const PRIVACY_POLICY = { uri: '/privacy-policy', page: 'privacy-policy' }
export const REFUND_POLICY = { uri: '/refund-policy', page: 'refund-policy' }

/**
 * These are inserted at runtime by the test framework but the session manager needs to know about them
 */
export const TEST_STATUS = { uri: '/buy/status' }
export const TEST_TRANSACTION = { uri: '/buy/transaction' }
