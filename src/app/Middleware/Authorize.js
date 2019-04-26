/*
 * File:          Adoscope.js
 * Project:       adoscopejs
 * Created Date:  27/04/2019 12:35:06
 * Author:        Paradox
 *
 * Last Modified: 27/04/2019 12:52:20
 * Modified By:   Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

'use strict'

const Adoscope = use('Adonis/Adoscope')

class Authorize {
  async handle (context, next) {
    Adoscope.recordingRequest = true
    Adoscope.incomingRequest(context)

    await next()
  }
}

module.exports = Authorize
