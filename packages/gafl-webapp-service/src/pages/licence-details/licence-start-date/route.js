import { ADVANCED_PURCHASE_MAX_DAYS } from '@defra-fish/business-rules-lib'
import { LICENCE_START_DATE, CONTROLLER } from '../../../uri.js'
import { dateFormats } from '../../../constants.js'

import pageRoute from '../../../routes/page-route.js'
import Joi from '@hapi/joi'
import JoiDate from '@hapi/joi-date'
import moment from 'moment'
const JoiX = Joi.extend(JoiDate)

const schema = Joi.object({
  'licence-start-date': JoiX.date()
    .format(dateFormats)
    .min(moment().add(-1, 'days'))
    .max(moment().add(ADVANCED_PURCHASE_MAX_DAYS, 'days'))
    .required()
})

const validator = payload => {
  const licenceStartDate = `${payload['licence-start-date-year']}-${payload['licence-start-date-month']}-${payload['licence-start-date-day']}`
  Joi.assert({ 'licence-start-date': licenceStartDate }, schema)
}

const getData = () => ({
  exampleStartDate: moment()
    .add(1, 'days')
    .format('DD MM YYYY'),
  maxStartDate: moment()
    .add(ADVANCED_PURCHASE_MAX_DAYS, 'days')
    .format('DD MM YYYY'),
  advancedPurchaseMaxDays: ADVANCED_PURCHASE_MAX_DAYS
})

export default pageRoute(LICENCE_START_DATE.page, LICENCE_START_DATE.uri, validator, CONTROLLER.uri, getData)
