/*
 * File:          InvalidModelException.ts
 * Project:       adoscope
 * Author:        Paradox
 * Copyright (c) 2019 Paradox.
 */

import BaseException from './BaseException'

export default class InvalidModelException extends BaseException {

  constructor (name: string) {
    super(`${name} is not a valid model. Maybe it does not inherit Model?`, 'E_INVALID_MODEL')
  }

}
