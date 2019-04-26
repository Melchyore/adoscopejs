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

import { ValueOf, Config, Route, Http, Logger, AdoscopeConfig } from '../src/Contracts'

import RequestWatcher from './watchers/RequestWatcher'
import QueryWatcher from './watchers/QueryWatcher'

import EntryType from './EntryType'

const pathToRegexp = use('path-to-regexp')

/**
 * Main application class.
 *
 * @export
 * @class Adoscope
 */
export default class Adoscope {

  private _onFinished: any
  private _adoscopeConfig: AdoscopeConfig
  private _requestWatcher: RequestWatcher
  private _queryWatcher: QueryWatcher

  public data: {[x: string]: any} = {}

  /**
   * Creates an instance of Adoscope and registers the global variable Adoscope.
   *
   * @constructor
   *
   * @param @private {*} _app
   * @param @private {Config} _config
   * @param @private {Route.Manager} _route
   * @param @private {Logger} _logger
   * @param @private {boolean} [_recordingRequest=false]
   *
   * @memberof Adoscope
   */
  constructor (
    private _app: any,
    private _config: Config,
    private _route: Route.Manager,
    private _logger: Logger,
    private _recordingRequest: boolean = false
  ) {
    this._onFinished = this._app.use('on-finished')
    this._adoscopeConfig = this._config.merge('adoscope', this._app.use('Adoscope/Config/adoscope'))
    this._requestWatcher = new RequestWatcher(this._adoscopeConfig, this._route, this._logger)
    this._queryWatcher = new QueryWatcher(this._app.use('Database'))
    this._queryWatcher.record()

    _.each(_.values(EntryType), (entry: ValueOf<EntryType>) => {
      this.data[pluralize.plural(entry)] = []
    })

    global.Adoscope = this
  }

  /**
   * Approves or refuses the current request using url. It will check
   * user-defined **ignore_paths** Array in Adoscope's config file.
   *
   * @private
   *
   * @method _handleApprovedRequests
   *
   * @param {string} url
   *
   * @returns {boolean}
   *
   * @memberof Adoscope
   */
  private _approveRequest(url: string): boolean {
    let approved: boolean = true

    _.each(_.concat(this._adoscopeConfig.ignore_paths, [
      `${this._adoscopeConfig.path}/(.*)?`
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
   * Getter of @_recordingRequest property
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
      path: this._adoscopeConfig.path,
      recording: false
    }
  }

  /**
   * Tells to @RequestWatcher to record the current request is approved.
   *
   * @method incomingRequest
   *
   * @param {Http.Context} context
   *
   * @memberof Adoscope
   */
  public incomingRequest (context: Http.Context): void {
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

      this._requestWatcher.record(request, res, session)
    })
  }
}
