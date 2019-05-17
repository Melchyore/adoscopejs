/*
 * File:          NoModelSpecifiedException.ts
 * Project:       adoscope
 * Author:        Paradox
 * Copyright (c) 2019 Paradox.
 */

import BaseException from './BaseException'

export default class NoModelSpecifiedException extends BaseException {

  constructor (message: string) {
    super(message, 'E_NO_MODEL_SPECIFIED')
  }

}
