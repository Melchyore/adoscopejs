/*
 * File:          LogWatcher.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import * as _ from 'lodash'

import EntryType from '../EntryType'
import Adoscope from '../Adoscope'
import Utils from '../lib/Utils'
import Watcher from './Watcher'

const intercept = require('intercept-stdout')

export default class LogWatcher extends Watcher {

  constructor (
    private _app: Adoscope,
    private _stdWrite = process.stdout.write,
    private _logs: Array<string> = [],
  ) {
    super(_app.config)

    intercept(async (text: string) => {
      if (await this._app.isRecording()) {
        if (!text.trim().startsWith('\u001b[32m✓')) {
          const log = Utils.stripANSIColor(text)
          let data = {}

          if (typeof log === 'string') {
            data = {
              level: 'log',
              text: log
            }
          } else {
            data = log
          }

          this._store(this.type, data)
        }
      }
    })
  }

  public get type (): EntryType {
    return EntryType.LOG
  }


  public record (): void {}

}
