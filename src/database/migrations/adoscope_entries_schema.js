/*
 * File:          adoscope_entries_schema.js
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

'use strict'

const Schema = use('Schema')

class AdoscopeEntriesSchema extends Schema {
  up () {
    this.create('adoscope_entries', (table) => {
      table.increments()
      table.timestamps()
      table.uuid('uuid').unique().index()
      table.string('family_hash').nullable().index()
      table.boolean('should_display_on_index').default(true)
      table.string('type', 20)
      table.text('content', 'longtext')

      table.index(['type', 'should_display_on_index'])
    })
  }

  down () {
    this.drop('adoscope_entries')
  }
}

module.exports = AdoscopeEntriesSchema
