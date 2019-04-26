/*
 * File:          Watcher.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */
import { EntryContent } from '../Contracts'

import EntryType from '../EntryType'

/**
 * Base class for all watchers.
 *
 * @export
 *
 * @class Watcher
 */
export default class Watcher {

  constructor () {}

  /**
   * Stores entry into database.
   *
   * @protected
   *
   * @param {{[key: string]: any}} content
   *
   * @memberof Watcher
   */
  protected async _store (type: EntryType, content: EntryContent): Promise<object> {
    // We MUST require it here, otherwise we'll get "Cannot find module Adoscope/Services/EntryService" error.
    const EntryService = use('Adoscope/Services/EntryService')

    return await EntryService.store({
      type: type,
      content
    })
  }

}
