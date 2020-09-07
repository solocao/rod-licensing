import moment from 'moment'
import { LICENCE_TO_START, LICENCE_START_TIME } from '../../../uri.js'
import { ageConcessionHelper } from '../../../processors/concession-helper.js'
import { SERVICE_LOCAL_TIME } from '@defra-fish/business-rules-lib'
import { cacheDateFormat } from '../../../processors/date-and-time-display.js'

/**
 * Transfer the validate page object
 * @param request
 * @returns {Promise<void>}
 */
export const licenceToStart = {
  AFTER_PAYMENT: 'after-payment',
  ANOTHER_DATE: 'another-date'
}

// If the licence start date has be chosen as today, and the licence is changed to a 12 month
// then set the start after payment flag
export const checkAfterPayment = permission => {
  if (
    permission.licenceLength === '12M' &&
    moment(permission.licenceStartDate, cacheDateFormat)
      .tz(SERVICE_LOCAL_TIME)
      .isSame(moment(), 'day')
  ) {
    permission.licenceToStart = licenceToStart.AFTER_PAYMENT
    permission.licenceStartTime = null
  }
}

export default async request => {
  const { payload } = await request.cache().helpers.page.getCurrentPermission(LICENCE_TO_START.page)
  const permission = await request.cache().helpers.transaction.getCurrentPermission()

  if (payload['licence-to-start'] === 'after-payment') {
    permission.licenceToStart = licenceToStart.AFTER_PAYMENT
    permission.licenceStartDate = moment().format(cacheDateFormat)
    delete permission.licenceStartTime
  } else {
    permission.licenceToStart = licenceToStart.ANOTHER_DATE
    permission.licenceStartDate = moment({
      year: payload['licence-start-date-year'],
      month: Number.parseInt(payload['licence-start-date-month']) - 1,
      day: payload['licence-start-date-day']
    }).format(cacheDateFormat)
  }

  // Write the age concessions into the cache
  ageConcessionHelper(permission)
  checkAfterPayment(permission)

  await request.cache().helpers.transaction.setCurrentPermission(permission)

  // Clear the start time always here otherwise it can end up being set incorrectly
  await request.cache().helpers.page.setCurrentPermission(LICENCE_START_TIME.page, {})
}
