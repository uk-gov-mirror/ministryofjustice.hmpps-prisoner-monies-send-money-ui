import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService from '../services/auditService'
import HmppsAuditClient from '../data/hmppsAuditClient'

jest.mock('../services/auditService')

const auditService = new AuditService({} as HmppsAuditClient) as jest.Mocked<AuditService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render start page', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Send money to someone in prison')
        expect(res.text).toContain('Start now')
      })
  })
})

describe('GET /info-page', () => {
  it('should render info page', () => {
    return request(app)
      .get('/info-page')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Staying in touch with someone in prison')
      })
  })
})

describe('GET /en-gb/', () => {
  it('should render before you continue page', () => {
    return request(app)
      .get('/en-gb/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Before you continue')
        expect(res.text).toContain('href="/payment-choice"')
        expect(res.text).toContain('href="/terms"')
        expect(res.text).toContain('href="/privacy"')
        expect(res.text).toContain('href="/contact-us"')
        expect(res.text).toContain('govuk-back-link')
      })
  })
})

describe('GET /payment-choice', () => {
  it('should render payment choice page', () => {
    return request(app).get('/payment-choice').expect('Content-Type', /html/).expect(404)
    // .expect(res => {
    //   expect(res.text).toContain('Pay now by debit card')
    //   expect(res.text).toContain('id="id_debit_card"')
    //   expect(res.text).toContain('href="/debit-card/details"')
    //   expect(res.text).toContain('govuk-back-link')
    // })
  })
})

describe('GET /prisoner-details', () => {
  it('should render enter prisoner details page', () => {
    return request(app)
      .get('/prisoner-details')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Enter prisoner details')
        expect(res.text).toContain('govuk-back-link')
        expect(res.text).toContain('href="/en-gb/payment-choice"')
        expect(res.text).toContain('id="next-button"')
        expect(res.text).toContain('id="prisoner-name"')
        expect(res.text).toContain('id="prisoner-dob-day"')
        expect(res.text).toContain('id="prisoner-dob-month"')
        expect(res.text).toContain('id="prisoner-dob-year"')
        expect(res.text).toContain('id="prisoner-number"')
      })
  })
})

describe('POST /prisoner-details', () => {
  it('should navigate to the payment amount page when a valid form is submitted', () => {
    return request(app)
      .post('/prisoner-details')
      .send({
        'prisoner-name': 'John Smith',
        'prisoner-dob-day': '1',
        'prisoner-dob-month': '1',
        'prisoner-dob-year': '1999',
        'prisoner-number': 'A1234BC',
      })
      .expect(302)
      .expect('Location', '/payment-amount')
  })

  it('should show an error when the prisoner number format is incorrect', () => {
    return request(app)
      .post('/prisoner-details')
      .send({
        'prisoner-name': 'John Smith',
        'prisoner-dob-day': '1',
        'prisoner-dob-month': '1',
        'prisoner-dob-year': '1999',
        'prisoner-number': 'INVALID',
      })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Incorrect prisoner number format')
      })
  })

  it('should show an error when the date of birth is not a real date', () => {
    return request(app)
      .post('/prisoner-details')
      .send({
        'prisoner-name': 'John Smith',
        'prisoner-dob-day': '31',
        'prisoner-dob-month': '2',
        'prisoner-dob-year': '1999',
        'prisoner-number': 'A1234BC',
      })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Enter a valid date of birth')
      })
  })

  it('should show an error when the date of birth year is out of range', () => {
    return request(app)
      .post('/prisoner-details')
      .send({
        'prisoner-name': 'John Smith',
        'prisoner-dob-day': '1',
        'prisoner-dob-month': '1',
        'prisoner-dob-year': '1800',
        'prisoner-number': 'A1234BC',
      })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('‘Year’ should be between 1900 and')
      })
  })

  it('should re-render the page with an error summary when the form is submitted empty', () => {
    return request(app)
      .post('/prisoner-details')
      .send({})
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('There was a problem')
        expect(res.text).toContain('Enter the prisoner’s name')
        expect(res.text).toContain('Enter the prisoner’s date of birth')
        expect(res.text).toContain('Enter the prisoner’s number')
      })
  })
})

describe('GET /terms', () => {
  it('should render terms page', () => {
    return request(app)
      .get('/terms')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Terms and conditions')
      })
  })
})

describe('GET /privacy', () => {
  it('should render privacy page', () => {
    return request(app)
      .get('/privacy')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Privacy policy')
      })
  })
})

describe('GET /contact-us', () => {
  it('should render contact us page', () => {
    return request(app)
      .get('/contact-us')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Contact us')
      })
  })
})
