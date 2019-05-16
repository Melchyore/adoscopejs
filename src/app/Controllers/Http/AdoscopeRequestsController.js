/*
 * File:          AdoscopeRequestController
 * Project:       adoscope
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

  async show ({ response }) {
    return response.json({
      foo: 'bar'
    })
  }
}

module.exports = AdoscopeRequestController
