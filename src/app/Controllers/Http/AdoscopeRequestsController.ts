/*
 * File:          AdoscopeRequestController
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import RequestWatcher from '../../../Watchers/RequestWatcher'
import BaseController from './BaseController'
import EntryType from '../../../EntryType'

class AdoscopeRequestController extends BaseController {

  protected entryType (): string {
    return EntryType.REQUEST
  }

  protected watcher (): string {
    return RequestWatcher.prototype.type
  }

}

module.exports = AdoscopeRequestController
