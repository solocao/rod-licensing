import { CONTACT } from '../../../uri.js'
import { HOW_CONTACTED } from '../../../processors/mapping-constants.js'
import { isPhysical } from '../../../processors/licence-type-display.js'

export default async request => {
  const { payload } = await request.cache().helpers.page.getCurrentPermission(CONTACT.page)
  const permission = await request.cache().helpers.transaction.getCurrentPermission()
  const { licensee } = permission

  licensee.preferredMethodOfNewsletter = licensee.preferredMethodOfNewsletter || HOW_CONTACTED.none

  switch (payload['how-contacted']) {
    case 'email':
      licensee.preferredMethodOfConfirmation = HOW_CONTACTED.email
      licensee.preferredMethodOfReminder = HOW_CONTACTED.email
      licensee.email = payload.email
      licensee.mobilePhone = null
      break

    case 'text':
      licensee.preferredMethodOfConfirmation = HOW_CONTACTED.text
      licensee.preferredMethodOfReminder = HOW_CONTACTED.text
      licensee.mobilePhone = payload.text
      licensee.email = licensee.preferredMethodOfNewsletter === HOW_CONTACTED.email ? licensee.email : null
      break

    default:
      if (isPhysical(permission)) {
        licensee.preferredMethodOfConfirmation = HOW_CONTACTED.letter
        licensee.preferredMethodOfReminder = HOW_CONTACTED.letter
      } else {
        licensee.preferredMethodOfConfirmation = HOW_CONTACTED.none
        licensee.preferredMethodOfReminder = HOW_CONTACTED.none
      }

      licensee.mobilePhone = null
      licensee.email = licensee.preferredMethodOfNewsletter === HOW_CONTACTED.email ? licensee.email : null
  }

  await request.cache().helpers.transaction.setCurrentPermission(permission)
}
