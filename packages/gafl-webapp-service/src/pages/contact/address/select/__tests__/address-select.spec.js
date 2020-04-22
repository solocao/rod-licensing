import { ADDRESS_SELECT, CONTACT, ADDRESS_LOOKUP, CONTROLLER } from '../../../../../constants.js'
import { start, stop, initialize, injectWithCookie } from '../../../../../__mocks__/test-utils.js'

beforeAll(d => start(d))
beforeAll(d => initialize(d))
afterAll(d => stop(d))

describe('The address select page', () => {
  it('returns success on requesting', async () => {
    const data = await injectWithCookie('GET', ADDRESS_SELECT.uri)
    expect(data.statusCode).toBe(200)
  })

  it('redirects back to itself on posting an empty payload', async () => {
    const data = await injectWithCookie('POST', ADDRESS_SELECT.uri, {})
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(ADDRESS_SELECT.uri)
  })

  it('redirects back to itself on posting an no address', async () => {
    const data = await injectWithCookie('POST', ADDRESS_SELECT.uri, { address: '' })
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(ADDRESS_SELECT.uri)
  })

  it('the controller redirects to the contact page after success', async () => {
    process.env.ADDRESS_LOOKUP_URL = 'http://localhost:9002'
    process.env.ADDRESS_LOOKUP_KEY = 'bar'
    await injectWithCookie('POST', ADDRESS_LOOKUP.uri, { premises: 'Howecroft Court', postcode: 'BS9 1HJ' })
    await injectWithCookie('GET', CONTROLLER.uri)
    await injectWithCookie('GET', ADDRESS_SELECT.uri)
    await injectWithCookie('POST', ADDRESS_SELECT.uri, { address: '5' })
    const data = await injectWithCookie('GET', CONTROLLER.uri)
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(CONTACT.uri)
  })

  it('The contact information has been set in the transaction', async () => {
    const { payload } = await injectWithCookie('GET', '/buy/transaction')
    expect(JSON.parse(payload).permissions[0].licensee).toEqual({
      premises: '14 HOWECROFT COURT',
      street: 'EASTMEAD LANE',
      locality: null,
      town: 'BRISTOL',
      postcode: 'BS9 1HJ',
      countryCode: 'GB'
    })
  })
})