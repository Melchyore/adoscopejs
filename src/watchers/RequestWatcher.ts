/*
 * File:          RequestWatcher.ts
 * Project:       adonis-fullstack-app
 * Created Date:  16/04/2019 10:28:59
 * Author:        Paradox
 *
 * Last Modified: 26/04/2019 10:06:04
 * Modified By:   Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import { ServerResponse } from 'http'

import * as _ from 'lodash'
import * as mime from 'mime-types'

import { Http, Route, AdoscopeConfig } from '../Contracts'

import EntryType from '../EntryType'
import Adoscope from '../Adoscope'
import Watcher from './Watcher'

/**
 * Class used to record incoming requests and store request/route details into database.
 *
 * @export
 *
 * @class RequestWatcher
 *
 * @extends {Watcher}
 */
export default class RequestWatcher extends Watcher {

  /**
   * Creates an instance of RequestWatcher.
   *
   * @param {AdoscopeConfig} _config
   * @param {Route.Manager} _route
   * @param {*} _logger
   *
   * @memberof RequestWatcher
   */
  constructor (
    private _config: AdoscopeConfig,
    private _route: Route.Manager,
    private _logger: any
  ) {
    super()
  }

  /**
   * Parses the request's handler. If the handler is a function/colsure, it will
   * return a string representation. If it's a string like "FooController.method"
   * it will return both controller and method name.
   *
   * @private
   *
   * @method _parseHandler
   *
   * @param {(Function | string)} handler
   *
   * @returns {object}
   *
   * @memberof RequestWatcher
   */
  private _parseHandler (handler: Function | string): object {
    let file = null
    let handlerData = {}

    if (typeof handler !== 'function') {
      const handlerSegments= handler.split('.')
      file = handlerSegments[0]

      handlerData = {
        controller: file,
        action: handlerSegments.length > 1 ? handlerSegments[1] : null
      }
    } else {
      handlerData = {
        controller: null,
        action: handler.toString()
      }
    }

    return handlerData
  }

  /**
   * Ensures the content type is not undefined and contains a valid MIME type.
   * Content type is defined like this : "MIME type; charset". It will check
   * user-defined **mime_types** Array in Adoscope's config file.
   *
   * @private
   *
   * @method _validateMimeType
   *
   * @param {(string | number | Array<string> | null)} contentType
   *
   * @returns {boolean}
   *
   * @memberof RequestWatcher
   */
  private _validateMimeType (contentType: string | number | Array<string> | null): boolean {
    if (!contentType) {
      return false
    }

    return _.includes(_.concat(this._config.mime_types, [
      'text/html',
      'application/json'
    ]), contentType.toString().split(';')[0])
  }

  /**
   *
   *
   * @private
   *
   * @method _validateRoute
   *
   * @param {string} url
   * @param {string} verb
   *
   * @returns {(object | null)}
   *
   * @memberof RequestWatcher
   */
  private _validateRoute (url: string, verb: string): Route.MatchedRoute | null {
    return this._route.match(url, verb)
  }

  /**
   *
   * @method record
   *
   * @param {Http.Request} request
   * @param {ServerResponse} response
   * @param {Http.Session} session
   *
   * @memberof RequestWatcher
   */
  public async record (request: Http.Request, response: ServerResponse, session: Http.Session): void {
    const url = request.url()
    const method = request.method()

    const _route = this._validateRoute(url, method)

    if (_route) {
      const contentType = response.getHeader('Content-Type')
      const route = _route.route
      const middleware = route.middlewareList

      if (session.initiated && this._validateMimeType(contentType)) {
         this._store(EntryType.REQUEST, {
          method,
          format: mime.extension(contentType.toString()),
          content_type: contentType,
          status_text: response.statusMessage,
          status_code: response.statusCode,
          payload: request.all(),
          headers: request.headers(),
          cookies: request.cookies(),
          response_headers: response.getHeaders(),
          path: request.url(),
          session_variables: session.all(),
          protocol: request.protocol().toUpperCase(),
          hostname: request.hostname(),
          route_details: {
            handler: this._parseHandler(route.handler),
            middleware: _.filter(middleware, (_middleware: string) => !_middleware.startsWith('av:')),
            validators: _.filter(middleware, (_middleware: string) => _middleware.startsWith('av:'))
          }
        })
      }
    }

    Adoscope.recordingRequest = false
  }
}
