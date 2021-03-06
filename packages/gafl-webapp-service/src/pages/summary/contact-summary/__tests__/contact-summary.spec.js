import { salesApi } from '@defra-fish/connectors-lib'
import mockDefraCountries from '../../../../__mocks__/data/defra-country.js'
import { start, stop, initialize, injectWithCookies, mockSalesApi } from '../../../../__mocks__/test-utils-system.js'

import {
  CONTACT_SUMMARY,
  LICENCE_SUMMARY,
  NAME,
  CONTROLLER,
  ADDRESS_ENTRY,
  ADDRESS_LOOKUP,
  CONTACT,
  LICENCE_TO_START,
  DATE_OF_BIRTH,
  NEWSLETTER,
  LICENCE_LENGTH,
  LICENCE_TYPE,
  NEW_TRANSACTION
} from '../../../../uri.js'

import { ADULT_TODAY, dobHelper } from '../../../../__mocks__/test-utils-business-rules'
import { licenceToStart } from '../../../licence-details/licence-to-start/update-transaction'
import { licenseTypes } from '../../../licence-details/licence-type/route'

jest.mock('node-fetch')

mockSalesApi()
salesApi.countries.getAll = jest.fn(async () => new Promise(resolve => resolve(mockDefraCountries)))

beforeAll(() => {
  process.env.ANALYTICS_PRIMARY_PROPERTY = 'UA-123456789-0'
  process.env.ANALYTICS_XGOV_PROPERTY = 'UA-987654321-0'
})
beforeAll(d => start(d))
beforeAll(d => initialize(d))
afterAll(d => stop(d))
afterAll(() => {
  delete process.env.ANALYTICS_PRIMARY_PROPERTY
  delete process.env.ANALYTICS_XGOV_PROPERTY
})

const goodAddress = {
  premises: '14 HOWECROFT COURT',
  street: 'EASTMEAD LANE',
  locality: '',
  town: 'BRISTOL',
  postcode: 'BS9 1HJ',
  'country-code': 'GB'
}

describe('The contact summary page', () => {
  describe('where the prerequisite are not fulfilled', async () => {
    beforeAll(async d => {
      await injectWithCookies('GET', NEW_TRANSACTION.uri)
      await injectWithCookies('GET', CONTROLLER.uri)
      d()
    })

    it('redirects to the name page if it has not been visited', async () => {
      const data = await injectWithCookies('GET', CONTACT_SUMMARY.uri)
      expect(data.statusCode).toBe(302)
      expect(data.headers.location).toBe(NAME.uri)
    })

    it('redirects to the address lookup page if the address entry or address select page has not been visited', async () => {
      await injectWithCookies('POST', NAME.uri, { 'last-name': 'Graham', 'first-name': 'Willis' })
      const response = await injectWithCookies('GET', CONTACT_SUMMARY.uri)
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(ADDRESS_LOOKUP.uri)
    })

    it('redirects to the contact page if it has not been visited', async () => {
      await injectWithCookies('POST', NAME.uri, { 'last-name': 'Graham', 'first-name': 'Willis' })
      await injectWithCookies('POST', ADDRESS_ENTRY.uri, goodAddress)
      const response = await injectWithCookies('GET', CONTACT_SUMMARY.uri)
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(CONTACT.uri)
    })

    it('redirects to the newsletter page if it has not been visited', async () => {
      await injectWithCookies('POST', NAME.uri, { 'last-name': 'Graham', 'first-name': 'Willis' })
      await injectWithCookies('POST', ADDRESS_ENTRY.uri, goodAddress)
      await injectWithCookies('POST', CONTACT.uri, { 'how-contacted': 'email', email: 'graham@gmail.com' })
      const response = await injectWithCookies('GET', CONTACT_SUMMARY.uri)
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(NEWSLETTER.uri)
    })
  })

  describe('when purchasing a 12 month adult licence', async () => {
    beforeAll(async d => {
      await injectWithCookies('GET', NEW_TRANSACTION.uri)
      await injectWithCookies('GET', CONTROLLER.uri)

      // Set up the licence details
      await injectWithCookies('POST', DATE_OF_BIRTH.uri, dobHelper(ADULT_TODAY))
      await injectWithCookies('POST', LICENCE_TO_START.uri, { 'licence-to-start': licenceToStart.AFTER_PAYMENT })
      await injectWithCookies('POST', LICENCE_TYPE.uri, { 'licence-type': licenseTypes.troutAndCoarse2Rod })
      await injectWithCookies('POST', LICENCE_LENGTH.uri, { 'licence-length': '12M' })
      await injectWithCookies('POST', LICENCE_SUMMARY.uri)

      // Set up the contact details
      await injectWithCookies('POST', NAME.uri, { 'last-name': 'Graham', 'first-name': 'Willis' })
      await injectWithCookies('POST', ADDRESS_ENTRY.uri, goodAddress)
      await injectWithCookies('POST', CONTACT.uri, { 'how-contacted': 'email', email: 'new3@example.com' })
      await injectWithCookies('POST', NEWSLETTER.uri, { newsletter: 'yes', 'email-entry': 'no' })
      d()
    })

    it('displays the contact summary page', async () => {
      const response = await injectWithCookies('GET', CONTACT_SUMMARY.uri)
      expect(response.statusCode).toBe(200)
    })
  })
})
