import { CommonResults } from '../../../constants.js'
import { ageConcessionResults } from '../../concessions/date-of-birth/result-function.js'
import { licenceToStart } from './update-transaction.js'

export const licenceToStartResults = {
  AND_START_TIME: 'and-start-time'
}

export default async request => {
  const permission = await request.cache().helpers.transaction.getCurrentPermission()
  const status = await request.cache().helpers.status.getCurrentPermission()

  if (permission.licensee.noLicenceRequired) {
    return ageConcessionResults.NO_LICENCE_REQUIRED
  }

  // If we already know its a 1 or 8 day licence then always jump to the time-of-day
  if (permission.licenceToStart === licenceToStart.ANOTHER_DATE && permission.licenceLength && permission.licenceLength !== '12M') {
    return licenceToStartResults.AND_START_TIME
  }

  return status.fromSummary ? CommonResults.SUMMARY : CommonResults.OK
}
