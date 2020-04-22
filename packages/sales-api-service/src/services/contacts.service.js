import { Contact, findByExample, findById } from '@defra-fish/dynamics-lib'
import { getGlobalOptionSetValue } from './reference-data.service.js'
import db from 'debug'
const debug = db('sales:transformers')

/**
 * Transform a contact payload into a {@link Contact} entity.  Attempts to resolve an existing contact record for either the given contactId
 * or based on a lookup against the data in certain fields.
 *
 * @typedef ContactPayload
 * @property {string} [contactId] The id of an existing contact record. If present the existing record for the given id will be retrieved and updated.
 * @property {!string} firstName The first name of the contact
 * @property {!string} lastName The last name of the contact
 * @property {!string} birthDate The date of birth for the contact
 * @property {string} email The email address of the contact
 * @property {string} mobilePhone The mobile phone number of the contact
 * @property {!string} premises The premises for the contact's address
 * @property {string} street The street for the contact's address
 * @property {string} locality The locality for the contact's address
 * @property {string} town The town for the contact's address
 * @property {!string} postcode The postcode for the contact's address
 * @property {!string} country The country for the contact's address
 * @property {!string} preferredMethodOfConfirmation The preferred method for confirmation communications
 * @property {!string} preferredMethodOfNewsletter The preferred method for newsletter communications
 * @property {!string} preferredMethodOfReminder The preferred method for reminder communications
 *
 * @param {!ContactPayload} payload The payload to be transformed
 * @returns {Promise<Contact>}
 */
export const resolveContactPayload = async payload => {
  const {
    contactId,
    country,
    preferredMethodOfConfirmation,
    preferredMethodOfNewsletter,
    preferredMethodOfReminder,
    ...primitives
  } = payload
  /** @type Contact */ let contact
  if (contactId) {
    // Resolve an existing contact id
    contact = await findById(Contact, contactId)
  } else {
    const lookup = new Contact()
    lookup.firstName = payload.firstName
    lookup.lastName = payload.lastName
    lookup.birthDate = payload.birthDate
    lookup.premises = payload.premises
    lookup.postcode = payload.postcode

    const candidates = await findByExample(lookup)
    if (candidates.length) {
      contact = candidates[0]
    }
  }
  contact = Object.assign(contact || new Contact(), primitives)

  contact.preferredMethodOfConfirmation = await getGlobalOptionSetValue('defra_preferredcontactmethod', preferredMethodOfConfirmation)
  contact.preferredMethodOfNewsletter = await getGlobalOptionSetValue('defra_preferredcontactmethod', preferredMethodOfNewsletter)
  contact.preferredMethodOfReminder = await getGlobalOptionSetValue('defra_preferredcontactmethod', preferredMethodOfReminder)
  contact.country = await getGlobalOptionSetValue('defra_country', country)

  debug('Transformed licensee to contact: %O', contact)
  return contact
}