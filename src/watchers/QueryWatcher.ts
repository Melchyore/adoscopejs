/*
 * File:          QueryWatcher.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import * as pluralize from 'pluralize'
import * as _ from 'lodash'
import * as prettyMs from 'pretty-ms'
import onChange from 'on-change'

import { Database, AdoscopeConfig, AdoscopeQuery } from '../Contracts'
import EntryType from '../EntryType'
import Watcher from '../watchers/Watcher'
import Adoscope from '../Adoscope';

const now = require('performance-now')

/**
 * Class used to listen to all queries and store them into database.
 *
 * @export
 *
 * @class QueryWatcher
 *
 * @extends {Watcher}
 */
export default class QueryWatcher extends Watcher {
  private _statements: {[x: string]: object}

  constructor (
    private _app: Adoscope,
    private _database: Database,
    private _queries: Map<string, AdoscopeQuery> = new Map()
  ) {
    super()

    this._listen()
    this._onChange()
  }

  /**
   * Listens to all queries throughout application and stores them
   * into [this._queries].
   *
   * @private
   *
   * @method _listen
   *
   * @memberof QueryWatcher
   */
  private _listen (): void {
    this._database.on('query', (query: AdoscopeQuery) => {
      if (this._app.enabled()) {
        this._queries.set(
          query.__knexQueryUid, {
            start: now(),
            finished: false,
            method: query.method,
            bindings: query.bindings
          }
        )
      }
    })
  }

  /**
   * When query is added to [this._statements], store it into database.
   *
   * @private
   *
   * @method _onChange
   *
   * @memberof QueryWatcher
   */
  private _onChange (): void {
    this._statements = onChange({}, async (path: string, value: AdoscopeQuery) => {
      await this._store(EntryType.QUERY, value)
    })
  }

  /**
   * Checks if the query's table is not an Adoscope table.
   *
   * @private
   *
   * @method _approveQuery
   *
   * @param {string} table
   *
   * @returns {boolean}
   *
   * @memberof QueryWatcher
   */
  private _approveQuery (table: string): boolean {
    if (table === 'adoscope_entries') {
      return false
    }

    return true
  }

  /**
   * Stores query's details into [this._statements] when executed.
   *
   * @method record
   *
   * @memberof QueryWatcher
   */
  public record (): void {
    this._database.on('query-response', async (response: any, query: Database.Sql, builder: Database.Builder) => {
      const table = builder._single ? builder._single.table : null

      if (!this._approveQuery(table)) {
        return
      }

      const end = now()

      let _query: AdoscopeQuery = this._queries.get(query.__knexQueryUid)
      _query = {
        ..._query,
        end,
        time: Math.round(parseFloat((end - _query.start).toFixed(2))),
        finished: true,
        query: builder.toString(),
        table
      }

      _query.stringTime = prettyMs(_query.time)

      this._statements[query.__knexQueryUid] = _query

      /*if (Adoscope.recordingRequest) {
        Adoscope.data[pluralize.plural(entryType)].push(_query)
      }*/
    })
  }
}
