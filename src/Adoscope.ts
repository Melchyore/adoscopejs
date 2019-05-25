/*
 * File:          Adoscope.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import { ServerResponse } from 'http'
import * as _ from 'lodash'
import * as pluralize from 'pluralize'

import { ValueOf } from '../src/Contracts'
import { HttpContextContract as HttpContext } from './Contracts/Server'
import { HelpersContract as Helpers } from './Contracts/Helpers'
import { RouterContract as Route } from './Contracts/Route'
import { AdoscopeConfig } from './Contracts/Adoscope'

import AlreadyRegisteredWatcherException from './Exceptions/AlreadyRegisteredWatcherException'
import NoWatcherTypeSpecifiedException from './Exceptions/NoWatcherTypeSpecifiedException'
import NotFoundWatcherException from './Exceptions/NotFoundWatcherException'
import ExceptionWatcher from './Watchers/ExceptionWatcher'
import ScheduleWatcher from './Watchers/ScheduleWatcher'
import RequestWatcher from './Watchers/RequestWatcher'
import QueryWatcher from './Watchers/QueryWatcher'
import ModelWatcher from './Watchers/ModelWatcher'
import ViewWatcher from './Watchers/ViewWatcher'
import LogWatcher from './Watchers/LogWatcher'
import EntryType from './EntryType'

type Watcher = RequestWatcher | QueryWatcher | ModelWatcher | ScheduleWatcher | ExceptionWatcher | LogWatcher

const pathToRegexp = require('path-to-regexp')
const now = require('performance-now')

/**
 * Main application class.
 *
 * @export
 *
 * @class Adoscope
 */
export default class Adoscope {

  private _onFinished: any

  public data: {[x: string]: any} = {}

  /**
   *Creates an instance of Adoscope and registers the global variable Adoscope.

   * @param {*} _app
   * @param {AdoscopeConfig} _config
   * @param {Route.Manager} _route
   * @param {Helpers} _helpers
   * @param {boolean} [_booted=false]
   * @param {Map<string, Watcher>} [_watchers=new Map()]
   * @param {RequestWatcher} [_requestWatcher=null]
   * @param {boolean} [_recordingRequest=false]
   *
   * @memberof Adoscope
   */
  constructor (
    private _app: any,
    private _config: AdoscopeConfig,
    private _route: Route,
    private _cache: any,
    private _helpers: Helpers,
    private _booted: boolean = false,
    private _cacheKey = 'adoscope:paused',
    private _shouldRecord: boolean = false,
    private _watchers: Map<string, Watcher> = new Map(),
    private _requestWatcher: RequestWatcher = null,
    private _recordingRequest: boolean = false,
  ) {
    this._onFinished = this._app.use('on-finished')

    if (this.enabled()) {
      this._boot()
    }

    _.each(_.values(EntryType), (entry: ValueOf<EntryType>) => {
      this.data[pluralize.plural(entry.toString())] = []
    })

    // @ts-ignore
    global.Adoscope = this
  }

  /**
   * Boot application and register watchers.
   *
   * @private
   *
   * @method _boot
   *
   * @memberof Adoscope
   */
  private _boot (): void {
    if (this._booted) {
      return
    }

    this._booted = true
    this.startRecording()

    if (this._shouldWatch('request')) {
      this._requestWatcher = new RequestWatcher(this, this._route)

      this._addWatcher(this._requestWatcher)
    }

    if (this._shouldWatch('query')) {
      const queryWatcher = new QueryWatcher(this, this._app.use('Database'))

      this._addWatcher(queryWatcher)

      queryWatcher.record()
    }

    if (this._shouldWatch('model')) {
      const modelWatcher = new ModelWatcher(this)

      this._addWatcher(modelWatcher)

      modelWatcher.record()
    }

    if (this._shouldWatch('schedule')) {
      const scheduleWatcher = new ScheduleWatcher(this, this._helpers)

      this._addWatcher(scheduleWatcher)

      scheduleWatcher.record()
    }

    if (this._shouldWatch('exception')) {
      this._addWatcher(new ExceptionWatcher(this))
    }

    if (this._shouldWatch('log')) {
      this._addWatcher(new LogWatcher(this))
    }
  }

  /**
   * Checks whether a watcher should be registered.
   *
   * @private
   *
   * @method _shouldWatch
   *
   * @param {string} watcher
   *
   * @returns {boolean}
   *
   * @memberof Adoscope
   */
  private _shouldWatch(watcher: string): boolean {
    return this._config.watchers[watcher].enabled
  }

  /**
   * Checks whether a watcher is registered and add it.
   *
   * @private
   *
   * @method _addWatcher
   *
   * @param {Watcher} watcher
   *
   * @memberof Adoscope
   */
  private _addWatcher(watcher: Watcher): void {
    if (this.hasWatcher(watcher.type)) {
      throw new AlreadyRegisteredWatcherException(watcher.constructor.name)
    }

    if (!watcher.type || watcher.type === 'watcher') {
      throw new NoWatcherTypeSpecifiedException(watcher.constructor.name)
    }

    this._watchers.set(watcher.type, watcher)
  }

  /**
   * Approves or refuses the current request using url. It will check
   * user-defined **ignore_paths** Array in Adoscope's config file.
   *
   * @private
   *
   * @method _approveRequest
   *
   * @param {string} url
   *
   * @returns {boolean}
   *
   * @memberof Adoscope
   */
  private _approveRequest (url: string): boolean {
    let approved: boolean = true

    _.each([...this._config.watchers.request.options.ignore, `${this._config.path}/(.*)?`], (path: string) => {
      path = path.replace(/\/\*/g, '/(.*)').replace(/^\/|\/$/g, '')

      if (pathToRegexp(path).exec(url.replace(/^\/|\/$/g, ''))) {
        approved = false

        return false
      }
    })

    return approved
  }

  public get config (): AdoscopeConfig {
    return this._config
  }

  public async startRecording (): Promise<void> {
    if (await this._cache.get(this._cacheKey, false)) {
      await this._cache.forget(this._cacheKey)
    }
  }

  public async stopRecording (): Promise<void> {
    await this._cache.put('adoscope:paused', true, +new Date() + 60 * 60 * 24 * 30 * 1000)
  }

  public async isRecording (): Promise<boolean> {
    return !(await this._cache.get(this._cacheKey, false))
  }

  public get watchers (): Map<string, Watcher> {
    return this._watchers
  }

  public hasWatcher (watcher: string): boolean {
    return this._watchers.has(watcher)
  }

  public getWatcher (watcher: string): any {
    if (!this.hasWatcher(watcher)) {
      throw new NotFoundWatcherException(watcher)
    }

    return this._watchers.get(watcher)
  }

  /**
   * Getter for _recordingRequest property
   *
   * @type {boolean}
   *
   * @member recordingRequest
   *
   * @memberof Adoscope
   */
  get recordingRequest (): boolean {
    return this._recordingRequest
  }

  /**
   * Setter for _recordingRequest property
   *
   * @member recordingRequest
   *
   * @param {boolean} value
   *
   * @memberof Adoscope
   */
  set recordingRequest (value: boolean) {
    this._recordingRequest = value
  }

  /**
   * Checks if Adoscope is enabled or not.
   *
   * @method enabled
   *
   * @returns {boolean}
   *
   * @memberof Adoscope
   */
  public enabled (): boolean {
    return this._config.enabled
  }

  /**
   * Sets client-side script variables.
   *
   * @method scriptVariables
   *
   * @returns {object}
   *
   * @memberof Adoscope
   */
  public async scriptVariables (): Promise<object> {
    return {
      path: this._config.path,
      recording: await this.isRecording()
    }
  }

  /**
   * Tells to @RequestWatcher to record the current request if approved.
   *
   * @method incomingRequest
   *
   * @param {Http.Context} context
   *
   * @returns {Promise<void>}
   *
   * @memberof Adoscope
   */
  public async incomingRequest (context: HttpContext): Promise<void> {
    if (!(await this.isRecording())) {
      return
    }

    const request = context.request
    const response = context.response
    const session = context.session

    if (request.adoscope && request.adoscope.exception) {
      this.getWatcher('exception').add(request.adoscope.exception, request)
    }

    if (!this._approveRequest(request.url())) {
      return
    }

    const start = now()

    this._onFinished(response.response, (err: Error, res: ServerResponse) => {
      if (err) {
        console.error(err)
      }

      this._requestWatcher.record(request, res, session, new ViewWatcher(this, context.view), start)
    })
  }

}
