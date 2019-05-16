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

import { ValueOf, Config, Route, Http, Logger, AdoscopeConfig, Helpers } from '../src/Contracts'

import ScheduleWatcher from './Watchers/ScheduleWatcher'
import RequestWatcher from './Watchers/RequestWatcher'
import QueryWatcher from './Watchers/QueryWatcher'
import ModelWatcher from './Watchers/ModelWatcher'
import ViewWatcher from './Watchers/ViewWatcher'

import EntryType from './EntryType'

const pathToRegexp = require('path-to-regexp')

/**
 * Main application class.
 *
 * @export
 *
 * @class Adoscope
 */
export default class Adoscope {

  private _onFinished: any
  private _scheduleWatcher: ScheduleWatcher
  private _requestWatcher: RequestWatcher
  private _queryWatcher: QueryWatcher
  private _modelWatcher: ModelWatcher

  public data: {[x: string]: any} = {}

  /**
   * Creates an instance of Adoscope and registers the global variable Adoscope.
   *
   * @param {*} _app
   * @param {AdoscopeConfig} _config
   * @param {Route.Manager} _route
   * @param {Helpers} _helpers
   * @param {boolean} [_recordingRequest=false]
   *
   * @memberof Adoscope
   */
  constructor (
    private _app: any,
    private _config: AdoscopeConfig,
    private _route: Route.Manager,
    private _helpers: Helpers,
    private _recordingRequest: boolean = false
  ) {
    this._onFinished = this._app.use('on-finished')
    this._scheduleWatcher = new ScheduleWatcher(this._helpers)
    this._requestWatcher = new RequestWatcher(this._config, this._route)
    this._queryWatcher = new QueryWatcher(this, this._app.use('Database'))
    this._modelWatcher = new ModelWatcher(this._config)

    if (this.enabled()) {
      this._scheduleWatcher.record()
      this._queryWatcher.record()
      this._modelWatcher.record()
    }

    _.each(_.values(EntryType), (entry: ValueOf<EntryType>) => {
      this.data[pluralize.plural(entry.toString())] = []
    })

    // @ts-ignore
    global.Adoscope = this
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
  private _approveRequest(url: string): boolean {
    let approved: boolean = true

    _.each(_.concat(this._config.ignore_paths, [
      `${this._config.path}/(.*)?`
      ]), (path: string) => {
      path = path.replace(/\/\*/g, '/(.*)').replace(/^\/|\/$/g, '')

      if (pathToRegexp(path).exec(url.replace(/^\/|\/$/g, ''))) {
        approved = false

        return false
      }
    })

    return approved
  }

  /**
   * Getter for @_recordingRequest property
   *
   * @type {boolean}
   *
   * @memberof Adoscope
   */
  get recordingRequest (): boolean {
    return this._recordingRequest
  }

  /**
   * Setter for @_recordingRequest property
   *
   * @memberof Adoscope
   */
  set recordingRequest (value: boolean) {
    this._recordingRequest = value
  }

  /**
   * Sets client-side script variables.
   *
   * @method scriptVariables
   *
   * @returns {object}
   * @memberof Adoscope
   */
  public scriptVariables (): object {
    return {
      path: this._config.path,
      recording: false
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
  public async incomingRequest (context: Http.Context): Promise<void> {
    const request = context.request
    const response = context.response
    const session = context.session

    if (!this._approveRequest(request.url())) {
      return
    }

    this._onFinished(response.response, (err: Error, res: ServerResponse) => {
      if (err) {
        console.error(err)
      }

      this._requestWatcher.record(request, res, session, new ViewWatcher(context.view))
    })
  }

}
