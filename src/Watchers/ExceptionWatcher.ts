/*
 * File:          ExceptionWatcher.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import { promises } from 'fs'
import * as path from 'path'
import * as _ from 'lodash'

import { RequestContract as Request } from '../Contracts/Request'

import BaseException from '../Exceptions/BaseException'
import EntryType from '../EntryType'
import Adoscope from '../Adoscope'
import Utils from '../lib/Utils'
import Watcher from './Watcher'

export default class ExceptionWatcher extends Watcher {

  constructor (
    private _app: Adoscope,
    private _stdWrite = process.stderr.write,
    private _exceptions: Array<BaseException> = []
  ) {
    super(_app.config)

    this._setupWriter()
  }

  /**
   * Overrides **stderr** `write` function with custom writer.
   *
   * @private
   *
   * @method _setupWriter
   *
   * @returns {*}
   *
   * @memberof ExceptionWatcher
   */
  private _setupWriter (): any {
    // @ts-ignore
    process.stderr.write = (string: string, encoding: string, fd: any) => {
      let args = _.toArray(arguments)
      args[0] = this._interceptConsoleExceptions(string)

      this._stdWrite.apply(process.stderr, args)
    }
  }

  private _interceptConsoleExceptions (string: string): string {
    this.add(string)

    return string
  }

  private async _adoscopeExceptions (): Promise<Array<string>> {
    const exceptionsPath = path.join(__dirname, '../', 'Exceptions')
    const exceptions = await promises.readdir(exceptionsPath)

    return _.pull(_.map(exceptions, (file: string) => file.replace('.ts', '')), 'BaseException')
  }

  private _reset (): void {
    process.stderr.write = this._stdWrite
  }

  private async _approveException (exception: BaseException): Promise<boolean> {
    if (exception) {
      const adoscopeExceptions = await this._adoscopeExceptions()

      if (_.includes([...this._watcherConfig.options.ignore, ...adoscopeExceptions], exception.name)) {
        return false
      }

      return true
    }

    return false
  }

  public get type (): EntryType {
    return EntryType.EXCEPTION
  }

  public async add (exception: BaseException | string, request?: Request): Promise<void> {
    // TODO: attach exceptions to requests.
    try {
        const exceptionObject = typeof exception === 'string' ? Utils.parseStringException(exception) : exception

        if (await this._approveException(exceptionObject)) {
          // TODO: remove this shit later.
          this._exceptions.push(exceptionObject)

          if (await this._app.isRecording()) {
            await this._store(this.type, _.pick(exceptionObject, ['name', 'code', 'status', 'message', 'stack']))
          }
      }
    } catch (e) {
      console.error(e)
    }
  }

  public get exceptions (): BaseException[] {
    return this._exceptions
  }

  public record (): void {}

}
