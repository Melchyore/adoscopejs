/*
 * File:          AlreadyRegisteredModelException.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import BaseException from './BaseException'

export default class AlreadyRegisteredModelException extends BaseException {

  /**
   * Creates an instance of AlreadyRegisteredModelException.
   *
   * @param {string} message
   *
   * @memberof AlreadyRegisteredModelException
   */
  constructor (name: string) {
    super(`${name} is already registered model to watch`, 'E_ALREADY_REGISTERED_MODEL')
  }

}
