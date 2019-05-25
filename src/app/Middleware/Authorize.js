/*
 * File:          Adoscope.js
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */


'use strict'

const Adoscope = use('Adonis/Adoscope')

class Authorize {
  async handle (context, next) {
    if (Adoscope.enabled() && Adoscope.hasWatcher('request')) {
      Adoscope.recordingRequest = true
      Adoscope.incomingRequest(context)
    }

    await next()
  }
}

module.exports = Authorize
