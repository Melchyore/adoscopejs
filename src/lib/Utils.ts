/*
 * File:          Utils.ts
 * Project:       adoscopejs
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import * as _ from 'lodash'

import BaseException from '../Exceptions/BaseException'

/**
 * Collection of useful functions.
 *
 * @export
 *
 * @abstract
 *
 * @class Utils
 */
export default abstract class Utils {

  /**
   * Converts string boolean into boolean.
   *
   * @static
   *
   * @param {object} obj
   *
   * @returns {*}
   *
   * @memberof Utils
   */
  static parseBooleanString (obj: object): object {
    return _.transform(obj, (result: {[key: string]: any}, value: any, key: string) => {
        result[key] = typeof value === 'string' ? Utils.stringToBoolean(value) : value
    }, {})
  }

  static stringToBoolean (value: string): boolean | string {
    const lowerCasedValue = value.toLowerCase()

    return _.includes(['true', 'false'], lowerCasedValue) ? lowerCasedValue === 'true' : value
  }

  static parseStringException (exception: string): BaseException {
    if (exception) {
      exception = exception.replace(/(?:\(node:\d+\)+\s(\[.+\]\s)?)?/giu, '')
                            .replace('UnhandledPromiseRejectionWarning:', '')
                            .trim()

      const lines = exception.split('\n')
      const error = lines[0].replace(/\(rejection id: \d+\)+/u, '')
      const pattern = /(?<name>[a-zA-Z0-9_]+){1}(?::\s(?<code>[A-Z0-9_]+)?)?:\s(?<message>.+)/u
      const { groups: { name, code, message } } = pattern.exec(error)

      if (name) {
        const exceptionClass = new BaseException(message, code)
        exceptionClass.name = name
        exceptionClass.stack = lines.join('\n')

        return exceptionClass
      }
    }
  }

  static stripANSIColor (string: string): object | string {
    const pattern = /\x1B[[(?);]{0,2}(;?\d)*./g

    if (pattern.exec(string)) {
      const strippedString = string.replace(pattern, '').trim().split(': ')

      return {
        level: strippedString[0],
        text: strippedString[1]
      }
    }

    return string
  }

}
