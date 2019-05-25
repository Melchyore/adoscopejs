/*
 * File:          AdoscopeEntryOptions.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import { EntryOptions } from './Contracts/Entry'

export default class AdoscopeEntryOptions {

  public id: number

  public type: string

  public limit: number

  public static getQuery (params: EntryOptions): AdoscopeEntryOptions {
    return (new this)
            .before(params.id || 0)
            .setType(params.type)
            .setLimit(params.take || 50)
  }

  public before (id: number): AdoscopeEntryOptions {
    this.id = id

    return this
  }

  public setType (type: string): AdoscopeEntryOptions {
    this.type = type

    return this
  }

  public setLimit(limit: number): AdoscopeEntryOptions {
    this.limit = limit

    return this
  }

}
