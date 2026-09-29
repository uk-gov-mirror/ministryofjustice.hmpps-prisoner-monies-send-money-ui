import { Router } from 'express'

import config from '../config'
import startPageHandler from '../handlers/startPage'
import { Services } from '../services'
import SendMoneyToPrisonerService from '../services/sendMoneyToPrisonerService'
import { validatePrisonerDetails, PrisonerDetailsFormValues } from '../utils/prisonerDetailsValidation'

export default function routes(_services: Services): Router {
  const router = Router()

  router.get(
    '/',
    startPageHandler({
      production: config.production,
      productionStartPageUrl: config.productionStartPageUrl,
      sendMoneyUrl: config.sendMoneyUrl,
    }),
  )

  router.get('/info-page', async (_req, res, _next) => {
    return res.render('pages/info-page')
  })

  router.get('/en-gb/', async (_req, res, _next) => {
    return res.render('pages/before-you-continue', { continueUrl: '/payment-choice', backLinkHref: '/' })
  })

  router.get('/payment-choice', async (_req, res, _next) => {
    return res.status(404).send('Not Found')
    // return res.render('pages/payment-choice', { backLinkHref: '/en-gb/' })
  })

  router.get('/prisoner-details', async (_req, res, _next) => {
    return res.render('pages/prisoner-details', {
      backLinkHref: '/en-gb/payment-choice',
      errors: {},
      errorList: [],
      formValues: {},
    })
  })

  router.post('/prisoner-details', async (req, res, _next) => {
    const formValues: PrisonerDetailsFormValues = {
      prisonerName: req.body['prisoner-name'],
      prisonerDobDay: req.body['prisoner-dob-day'],
      prisonerDobMonth: req.body['prisoner-dob-month'],
      prisonerDobYear: req.body['prisoner-dob-year'],
      prisonerNumber: req.body['prisoner-number'],
    }

    const { errors, errorList } = validatePrisonerDetails(formValues)

    if (errorList.length > 0) {
      return res.render('pages/prisoner-details', {
        backLinkHref: '/en-gb/payment-choice',
        errors,
        errorList,
        formValues,
      })
    }

    const validPrisoner = await new SendMoneyToPrisonerService().getValidPrisoner(
      formValues.prisonerNumber,
      `${formValues.prisonerDobYear}-${formValues.prisonerDobMonth}-${formValues.prisonerDobDay}`,
    )
    if (validPrisoner) {
      return res.redirect('/payment-amount')
    }

    return res.render('pages/prisoner-details', {
      backLinkHref: '/en-gb/payment-choice',
      errors: {},
      errorList: [],
      formValues,
    })
  })

  router.get('/payment-amount', async (_req, res, _next) => {
    // return res.status(404).send('Not Found')
    return res.render('pages/payment-amount', {
      backLinkHref: '/en-gb/prisoner-details',
    })
  })

  router.get('/terms', async (_req, res, _next) => {
    return res.render('pages/terms')
  })

  router.get('/privacy', async (_req, res, _next) => {
    return res.render('pages/privacy')
  })

  router.get('/contact-us', async (_req, res, _next) => {
    return res.render('pages/contact-us')
  })

  return router
}
