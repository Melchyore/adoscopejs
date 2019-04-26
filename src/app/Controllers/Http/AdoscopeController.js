/*
 * File:          AdoscopeController
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

'use strict'

const path = require('path')

class AdoscopeController {
  async index ({ view }) {
    return view.render('adoscope/adoscope', { scriptVariables: Adoscope.scriptVariables() })
  }
}

module.exports = AdoscopeController
