import { getData } from '../route.js'
import { DATE_OF_BIRTH, LICENCE_LENGTH, LICENCE_TYPE, LICENCE_TO_START } from '../../../../uri.js'

const mockProductDetails = [
  {
    id: 'Salmon 1 Year 5 Rod Licence (Full)',
    name: 'Salmon and sea trout - 5 rod(s) licence',
    brand: 'Rod Fishing Licence',
    category: 'Salmon and sea trout/5 rod(s)/Full',
    variant: '12 Month(s)',
    quantity: 1,
    price: 1
  }
]
jest.mock('../../../../processors/analytics.js', () => ({
  getTrackingProductDetailsFromTransaction: () => mockProductDetails
}))
jest.mock('../../../../processors/date-and-time-display.js')
jest.mock('../../find-permit.js')
jest.mock('../../../../processors/concession-helper.js')

describe('Analytics for licence summary', () => {
  it('sends ecommerce detail view', async () => {
    const request = getMockRequest()

    await getData(request)

    expect(request.ga.ecommerce.mock.results[0].value.detail).toHaveBeenCalledWith(mockProductDetails)
  })
})

const getMockRequest = () => ({
  cache: () => ({
    helpers: {
      status: {
        getCurrentPermission: () =>
          Promise.resolve({
            [DATE_OF_BIRTH.page]: true,
            [LICENCE_TO_START.page]: true,
            [LICENCE_LENGTH.page]: true,
            [LICENCE_TYPE.page]: true
          }),
        setCurrentPermission: () => Promise.resolve()
      },
      transaction: {
        get: () => Promise.resolve(),
        getCurrentPermission: () =>
          Promise.resolve({
            numberOfRods: 1,
            licenceLength: '12M',
            licenceStartDate: '2020-01-01T00:00:00.000Z',
            licenceType: 'Salmon and sea trout',
            permit: { cost: 0 },
            licensee: {
              birthDate: '01-01-1970'
            }
          })
      }
    }
  }),
  ga: {
    ecommerce: jest.fn(() => ({
      detail: jest.fn()
    }))
  }
})
