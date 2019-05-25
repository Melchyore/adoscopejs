/*
 * File:          NoWatcherTypeSpecifiedException.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import BaseException from './BaseException'

export default class NoWatcherTypeSpecifiedException extends BaseException {

  constructor (name: string) {
    super(`${name} has no type`, 'E_NO_WATCHER_TYPE_SPECIFIED')
  }

}
