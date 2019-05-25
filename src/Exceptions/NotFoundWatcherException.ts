/*
 * File:          NotFoundWatcherException.ts
 * Project:       adoscope
 * Author:        Paradox
 * Copyright (c) 2019 Paradox.
 */

import BaseException from './BaseException'

export default class NotFoundWatcherException extends BaseException {

  constructor (name: string) {
    super(`${name} watcher not found, not registered or is OFF`, 'E_NOT_FOUND_WATCHER')
  }

}
