/*
 * File:          AdoscopeController
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

'use strict'

import { HttpContextContract as HttpContext } from '../../../Contracts/Server'
import { Entry } from '../../../Contracts/Entry'

const EntryService = use('Adoscope/Services/EntryService')
const Adoscope = use('Adonis/Adoscope')

class AdoscopeController {

  async index ({ view }: HttpContext): Promise<string> {
    return view.render('adoscope/adoscope', { scriptVariables: await Adoscope.scriptVariables() })
  }

  async entries ({ response }: HttpContext): Promise<Array<Entry>> {
    return await EntryService.getAll()
  }

}

module.exports = AdoscopeController
