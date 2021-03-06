import { LICENCE_TYPE } from '../../../uri.js'
import * as constants from '../../../processors/mapping-constants.js'
import { licenseTypes } from './route.js'
import { onLengthChange } from '../licence-length/update-transaction.js'

/**
 * Transfer the validate page object
 * @param request
 * @returns {Promise<void>}
 */
export default async request => {
  const { payload } = await request.cache().helpers.page.getCurrentPermission(LICENCE_TYPE.page)
  const permission = await request.cache().helpers.transaction.getCurrentPermission()

  if (payload['licence-type'] === licenseTypes.troutAndCoarse2Rod) {
    permission.licenceType = constants.LICENCE_TYPE['trout-and-coarse']
    permission.numberOfRods = '2'
  } else if (payload['licence-type'] === licenseTypes.troutAndCoarse3Rod) {
    permission.licenceType = constants.LICENCE_TYPE['trout-and-coarse']
    permission.numberOfRods = '3'
    permission.licenceLength = '12M'
    permission.licenceStartTime = null
    onLengthChange(permission)
  } else {
    permission.licenceType = constants.LICENCE_TYPE['salmon-and-sea-trout']
    permission.numberOfRods = '1'
  }

  await request.cache().helpers.transaction.setCurrentPermission(permission)
}
