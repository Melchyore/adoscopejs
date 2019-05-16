/*
 * File:          EntryService.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import { EntryStore, Entry } from '../Contracts'

// @ts-ignore
const Entry = use('Adoscope/App/Models/Entry')

/**
 * Class used to handle Adoscope's queries.
 *
 * @class EntryService
 */
class EntryService {

  /**
   * Creates an instance of EntryService.
   *
   * @memberof EntryService
   */
  constructor () {}

  /**
   * Insert new entry to database.
   *
   * @static
   *
   * @method store
   *
   * @param {EntryStore} data
   *
   * @returns {Promise<Entry>}
   *
   * @memberof EntryService
   */
  public static async store (data: EntryStore): Promise<Entry> {
    try {
      return await Entry.create(data)
    } catch (e) {
      throw e
    }
  }

  /**
   * Update entry using condition.
   *
   * @static
   *
   * @method update
   *
   * @param {[string, any]} condition
   * @param {EntryStore} data
   *
   * @returns {Promise<boolean>}
   *
   * @memberof EntryService
   */
  public static async update (condition: [string, any], data: EntryStore): Promise<boolean> {
    try {
      const entry = await EntryService.findBy(condition)

      if (entry) {
        entry.merge(data)

        return await entry.save()
      }
    } catch (e) {
      throw e
    }
  }

  /**
   * Find entry by UUID.
   *
   * @static
   *
   * @method find
   *
   * @param {string} uuid
   *
   * @returns {Promise<Entry>}
   *
   * @memberof EntryService
   */
  public static async find (uuid: string): Promise<Entry> {
    try {
      return await EntryService.findBy(['uuid', uuid])
    } catch (e) {
      throw e
    }
  }

  /**
   * Find entry using condition.
   *
   * @static
   *
   * @method findBy
   *
   * @param {[string, any]} condition
   *
   * @returns {Promise<Entry>}
   *
   * @memberof EntryService
   */
  public static async findBy (condition: [string, any]): Promise<Entry> {
    try {
      return await Entry.findBy(condition[0], condition[1])
    } catch (e) {
      throw e
    }
  }

}

module.exports = EntryService
