/*
 * File:          AdoscopeController.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import { HttpContextContract as HttpContext } from '../../../Contracts/Server'

const Ws = use('Ws')
const Adoscope = use('Adonis/Adoscope')

class AdoscopeController {

  private socket: any
  private request: any

  constructor ({ socket, request }: HttpContext) {
    this.socket = socket
    this.request = request
  }

  async onToggleRecording () {
    if (await Adoscope.isRecording()) {
      await Adoscope.stopRecording()
    } else {
      await Adoscope.startRecording()
    }

    this.socket.broadcastToAll('recordingStateChanged', await Adoscope.isRecording())
  }

}

module.exports = AdoscopeController
