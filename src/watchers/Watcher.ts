/*
 * File:          Watcher.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */
import { Entry, EntryContent } from '../Contracts'

import EntryType from '../EntryType'

/**
 * Base class for all watchers.
 *
 * @export
 *
 * @class Watcher
 */
export default class Watcher {

  // @ts-ignore
  constructor (private entryService = use('Adoscope/Services/EntryService')) {}

  protected async _store (type: EntryType, data: EntryContent): Promise<Entry> {
    try {
      return await this.entryService.store({
        type,
        content: data
      })
    } catch (e) {
      throw e
    }
  }

  protected async _update (condition: [string, any], data: EntryContent): Promise<boolean> {
    try {
      return await this.entryService.update(condition, data)
    } catch (e) {
      throw e
    }
  }

  protected async _find (uuid: string): Promise<Entry> {
    try {
      return await this.entryService.find(uuid)
    } catch (e) {
      throw e
    }
  }

}
