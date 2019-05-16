/*
 * File:          RequestWatcher.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import { ServerResponse } from 'http'

import * as _ from 'lodash'
import * as mime from 'mime-types'

import { Http, Route, AdoscopeConfig } from '../Contracts'

import InvalidMimeTypeException from '../Exceptions/InvalidMimeTypeException'
import ViewWatcher from './ViewWatcher'
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
   *
   * @memberof RequestWatcher
   */
  constructor (
    private _config: AdoscopeConfig,
    private _route: Route.Manager
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

    const acceptedMimeTypes = _.concat(this._config.mime_types, [
      'text/html',
      'application/json'
    ])
    const type = contentType.toString().split(';')[0]

    if (_.includes(acceptedMimeTypes, type)) {
      return true
    } else {
      throw new InvalidMimeTypeException(`"${type}" mime type is not registered. You can add it to Adoscope's config file in mime_types array.`)
    }
  }

  /**
   * Resolves and return the route that matches the given **url** and **verb**.
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
   * @param {ViewWatcher} viewWatcher
   *
   * @memberof RequestWatcher
   */
  public async record (
    request: Http.Request,
    response: ServerResponse,
    session: Http.Session,
    viewWatcher: ViewWatcher
  ): Promise<any> {
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
          },
          views: viewWatcher.getCompiledViews()
        })
      }
    }

    // @ts-ignore
    Adoscope.recordingRequest = false
  }
}
