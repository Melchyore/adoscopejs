/*
 * File:          BaseController
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import { HttpContextContract as HttpContext } from '../../../Contracts/Server'

const EntryService = use('Adoscope/Services/EntryService')
const Adoscope = use('Adonis/Adoscope')

export default abstract class BaseController {

  protected abstract entryType (): string

  protected abstract watcher (): string

  protected async status (): Promise<string> {
    if (!Adoscope.enabled()) {
      return 'disabled'
    }

    if (!(await Adoscope.isRecording())) {
      return 'paused'
    }

    if (!Adoscope.hasWatcher(this.watcher())) {
      return 'off'
    }

    return 'enabled'
  }

  public async index ({ response }: HttpContext): Promise<void> {
    const entries = await EntryService.findAllBy(['type', this.entryType()])

    return response.json({
      entries,
      status: await this.status()
    })
  }

  async show ({ response, params }: HttpContext): Promise<void>  {
    const entry = await EntryService.find(params.id)

    return response.json({ entry })
  }

}
