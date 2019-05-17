/*
 * File:          AlreadyRegisteredWatcherException.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import BaseException from './BaseException'

export default class AlreadyRegisteredWatcherException extends BaseException {

  /**
   * Creates an instance of AlreadyRegisteredWatcherException.
   *
   * @param {string} message
   *
   * @memberof AlreadyRegisteredWatcherException
   */
  constructor (name: string) {
    super(`${name} is already registered watcher`, 'E_ALREADY_REGISTERED_WATCHER')
  }

}
