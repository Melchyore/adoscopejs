/*
 * File:          Utils.ts
 * Project:       adoscopejs
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import * as _ from 'lodash'

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

}
