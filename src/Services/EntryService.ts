/*
 * File:          EntryService.ts
 * Project:       adoscope
 * Created Date:  19/04/2019 5:47:00
 * Author:        Paradox
 *
 * Last Modified: 26/04/2019 7:54:49
 * Modified By:   Paradox
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
