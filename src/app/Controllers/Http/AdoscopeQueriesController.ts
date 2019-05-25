/*
 * File:          AdoscopeQueryController
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import QueryWatcher from '../../../Watchers/QueryWatcher'
import BaseController from './BaseController'
import EntryType from '../../../EntryType'

class AdoscopeQueryController extends BaseController {

  protected entryType (): string {
    return EntryType.QUERY
  }

  protected watcher (): string {
    return QueryWatcher.prototype.type
  }

}

module.exports = AdoscopeQueryController
