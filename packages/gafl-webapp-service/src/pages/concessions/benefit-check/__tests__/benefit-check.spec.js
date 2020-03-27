import { start, stop, initialize, injectWithCookie } from '../../../../misc/test-utils.js'
import { BENEFIT_CHECK, CONTROLLER, NAME, CONCESSION, DATE_OF_BIRTH, LICENCE_LENGTH, LICENCE_TO_START } from '../../../../constants'
import moment from 'moment'

beforeAll(d => start(d))
beforeAll(d => initialize(d))
afterAll(d => stop(d))

const dob13Today = moment().add(-13, 'years')
const dob65Today = moment().add(-65, 'years')

const dobHelper = d => ({
  'date-of-birth-day': d.date().toString(),
  'date-of-birth-month': (d.month() + 1).toString(),
  'date-of-birth-year': d.year()
})

describe('The benefit check page', () => {
  it('returns success on requesting', async () => {
    const data = await injectWithCookie('GET', BENEFIT_CHECK.uri)
    expect(data.statusCode).toBe(200)
  })
  it('redirects back to itself on an empty response', async () => {
    const data = await injectWithCookie('POST', BENEFIT_CHECK.uri, {})
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(BENEFIT_CHECK.uri)
  })
  it('redirects back to itself on an invalid response', async () => {
    const data = await injectWithCookie('POST', BENEFIT_CHECK.uri, { 'benefit-check': 'false' })
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(BENEFIT_CHECK.uri)
  })
  it('the controller redirects to the name page when answering no', async () => {
    await injectWithCookie('POST', BENEFIT_CHECK.uri, { 'benefit-check': 'no' })
    const data = await injectWithCookie('GET', CONTROLLER.uri)
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(NAME.uri)
    const { payload } = await injectWithCookie('GET', '/buy/transaction')
    expect(JSON.parse(payload).permissions[0].concession).not.toBeTruthy()
  })
  it('the controller redirects to the ni page when answering yes', async () => {
    await injectWithCookie('POST', BENEFIT_CHECK.uri, { 'benefit-check': 'yes' })
    const data = await injectWithCookie('GET', CONTROLLER.uri)
    expect(data.statusCode).toBe(302)
    // expect(data.headers.location).toBe(NAME.uri)
    const { payload } = await injectWithCookie('GET', '/buy/transaction')
    expect(JSON.parse(payload).permissions[0].concession).toEqual(CONCESSION.DISABLED)
  })
  it('the controller redirects to the start of the journey if there already exists a junior concession', async () => {
    await injectWithCookie('POST', LICENCE_TO_START.uri, { 'licence-to-start': 'after-payment' })
    await injectWithCookie('GET', CONTROLLER.uri)
    await injectWithCookie('POST', DATE_OF_BIRTH.uri, dobHelper(dob13Today))
    await injectWithCookie('GET', CONTROLLER.uri)
    await injectWithCookie('POST', BENEFIT_CHECK.uri, { 'benefit-check': 'yes' })
    const data = await injectWithCookie('GET', CONTROLLER.uri)
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(LICENCE_LENGTH.uri)
  })
  it('the controller redirects to the start of the journey if there already exists a senior concession', async () => {
    await injectWithCookie('POST', LICENCE_TO_START.uri, { 'licence-to-start': 'after-payment' })
    await injectWithCookie('GET', CONTROLLER.uri)
    await injectWithCookie('POST', DATE_OF_BIRTH.uri, dobHelper(dob65Today))
    await injectWithCookie('GET', CONTROLLER.uri)
    await injectWithCookie('POST', BENEFIT_CHECK.uri, { 'benefit-check': 'yes' })
    const data = await injectWithCookie('GET', CONTROLLER.uri)
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(LICENCE_LENGTH.uri)
  })
})