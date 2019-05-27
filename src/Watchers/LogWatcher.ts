/*
 * File:          LogWatcher.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import * as _ from 'lodash'
import * as Transport from 'winston-transport'
import { LEVEL } from 'triple-beam'

import { Logger as WinstonLogger, LogEntry } from 'winston'
import { LoggerContract as Logger } from '../Contracts/Logger'

import EntryType from '../EntryType'
import Adoscope from '../Adoscope'
import Watcher from './Watcher'

export default class LogWatcher extends Watcher {

  constructor (
    private _app: Adoscope,
    private _logger: Logger,
    private _logs: Array<string> = [],
  ) {
    super(_app.config)
    this.winstonLogger.add(new AdoscopeTransport())
  }

  private get winstonLogger (): WinstonLogger {
    return this._logger.driver.logger
  }

  public get type (): EntryType {
    return EntryType.LOG
  }


  public get logs (): Array<string> {
    return this._logs
  }

  public record (): void {
    _.last(this.winstonLogger.transports).on('logged', async (log: LogEntry) => {
      if (!(await this._app.isRecording())) {
        return
      }

      // For testing only.
      this._logs.push(log.message)

      await this._store(this.type, {
        level: log[LEVEL],
        text: log.message
      })
    })
  }

}

class AdoscopeTransport extends Transport {
  constructor (opts?: object) {
    super(opts)
  }

  log (info: any, callback: Function) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    callback()
  }
}
