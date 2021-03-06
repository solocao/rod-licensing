import { start, stop, initialize, injectWithCookies } from '../../__mocks__/test-utils-system.js'
import { CONTROLLER, DATE_OF_BIRTH, ADD_PERMISSION, NEW_TRANSACTION } from '../../uri.js'

beforeAll(d => start(d))
beforeAll(d => initialize(d))
afterAll(d => stop(d))

describe('The controller handler', () => {
  it('If there is no transaction then initialize redirect to the controller', async () => {
    const data = await injectWithCookies('GET', '/')
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(CONTROLLER.uri)
  })

  it('Adding a new transaction returns a redirect to the start of the journey', async () => {
    const data = await injectWithCookies('GET', NEW_TRANSACTION.uri)
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(CONTROLLER.uri)
  })

  it('Adding a new permission returns a redirect to the controller', async () => {
    const data = await injectWithCookies('GET', ADD_PERMISSION.uri)
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(CONTROLLER.uri)
  })

  it('The controller returns a redirect to the start of the journey', async () => {
    const data = await injectWithCookies('GET', CONTROLLER.uri)
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(DATE_OF_BIRTH.uri)
  })
})
