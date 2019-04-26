/*
 * File:          EntryService.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import { EntryStore } from '../Contracts'

const Entry = use('Adoscope/App/Models/Entry')

class EntryService {
  constructor () {}

  public static async store (data: EntryStore): Promise<object> {
    try {
      const entry = await Entry.create(data)

      return entry
    } catch (e) {
      throw e
    }
  }

}

module.exports = EntryService
