/*
 * File:          NotFoundModelException.ts
 * Project:       adoscope
 * Author:        Paradox
 * Copyright (c) 2019 Paradox.
 */

import BaseException from './BaseException'

export default class NotFoundModelException extends BaseException {

  constructor (name: string) {
    super(`${name} model not found`, 'E_NOT_FOUND_MODEL')
  }

}
