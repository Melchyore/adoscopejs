/*
 * File:          AdoscopeRequestController
 * Project:       Adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

const BaseController = require('./BaseController')

class AdoscopeRequestController extends BaseController {
  constructor () {
    super()
  }

  async index ({ response }) {
    return response.json({
      foo: 'bar'
    })
  }

  async show ({}) {
    return 'Test'
  }
}

module.exports = AdoscopeRequestController
