/*
 * File:          Utils.ts
 * Project:       adoscopejs
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import * as _ from 'lodash'

export default abstract class Utils {
  static strToBool (obj: object): object {
    return _.transform(obj, (result: {[key: string]: any}, value: any, key: string) => {
      if (typeof value === 'string' && _.includes(['true', 'false'], value.toLowerCase())) {
        result[key] = value === 'true'
      } else {
        result[key] = value
      }
    }, {})
  }
}
