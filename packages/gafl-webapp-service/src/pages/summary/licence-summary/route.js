import moment from 'moment-timezone'
import pageRoute from '../../../routes/page-route.js'
import GetDataRedirect from '../../../handlers/get-data-redirect.js'
import findPermit from '../find-permit.js'
import { displayStartTime, cacheDateFormat } from '../../../processors/date-and-time-display.js'
import * as concessionHelper from '../../../processors/concession-helper.js'
import { licenceTypeDisplay } from '../../../processors/licence-type-display.js'
import { getTrackingProductDetailsFromTransaction } from '../../../processors/analytics.js'
import {
  LICENCE_SUMMARY,
  LICENCE_LENGTH,
  LICENCE_TYPE,
  LICENCE_TO_START,
  DISABILITY_CONCESSION,
  DATE_OF_BIRTH,
  RENEWAL_START_DATE,
  NEW_TRANSACTION
} from '../../../uri.js'
import { START_AFTER_PAYMENT_MINUTES, SERVICE_LOCAL_TIME } from '@defra-fish/business-rules-lib'
import { LICENCE_SUMMARY_SEEN } from '../../../constants.js'
import { CONCESSION, CONCESSION_PROOF } from '../../../processors/mapping-constants.js'
import { nextPage } from '../../../routes/next-page.js'

// Extracted to keep sonar happy
const checkNavigation = permission => {
  if (!permission.licensee.birthDate) {
    throw new GetDataRedirect(DATE_OF_BIRTH.uri)
  }

  if (!permission.licenceStartDate) {
    throw new GetDataRedirect(LICENCE_TO_START.uri)
  }

  if (!permission.numberOfRods || !permission.licenceType) {
    throw new GetDataRedirect(LICENCE_TYPE.uri)
  }

  if (!permission.licenceLength) {
    throw new GetDataRedirect(LICENCE_LENGTH.uri)
  }
}

export const getData = async request => {
  const status = await request.cache().helpers.status.getCurrentPermission()
  const permission = await request.cache().helpers.transaction.getCurrentPermission()

  if (!status.renewal) {
    /*
     * Before we try and filter the permit it is necessary to check that the user has navigated through
     * the journey in such a way as to have gather all the required data. They may have manipulated the
     * journey by typing into the address bar in which case they will be redirected back to the
     * appropriate point in the journey. For a renewal this is not necessary.
     */
    checkNavigation(permission)
  }

  status.fromSummary = status.fromSummary || LICENCE_SUMMARY_SEEN
  await request.cache().helpers.status.setCurrentPermission(status)
  await findPermit(permission, request)
  const startTimeString = displayStartTime(permission)
  const transaction = await request.cache().helpers.transaction.get()
  await request.ga.ecommerce().detail(getTrackingProductDetailsFromTransaction(transaction))

  return {
    permission,
    startTimeString,
    startAfterPaymentMinutes: START_AFTER_PAYMENT_MINUTES,
    licenceTypeStr: licenceTypeDisplay(permission),
    isRenewal: status.renewal,
    isContinuing: !!(permission.renewedEndDate && permission.renewedEndDate === permission.licenceStartDate),
    hasExpired: moment(moment().tz(SERVICE_LOCAL_TIME)).isAfter(moment(permission.renewedEndDate, cacheDateFormat)),
    disabled: permission.concessions && permission.concessions.find(c => c.type === CONCESSION.DISABLED),
    concessionProofs: CONCESSION_PROOF,
    hasJunior: concessionHelper.hasJunior(permission),
    cost: permission.permit.cost,
    birthDateStr: moment(permission.licensee.birthDate, cacheDateFormat).format('Do MMMM YYYY'),
    uri: {
      licenceLength: LICENCE_LENGTH.uri,
      licenceType: LICENCE_TYPE.uri,
      licenceToStart: LICENCE_TO_START.uri,
      dateOfBirth: DATE_OF_BIRTH.uri,
      disabilityConcession: DISABILITY_CONCESSION.uri,
      licenceStartDate: status.renewal ? RENEWAL_START_DATE.uri : LICENCE_TO_START.uri,
      clear: NEW_TRANSACTION.uri
    }
  }
}

export default pageRoute(LICENCE_SUMMARY.page, LICENCE_SUMMARY.uri, null, nextPage, getData)
