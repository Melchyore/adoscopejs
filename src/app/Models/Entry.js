/*
 * File:          Entry.js
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

'use strict'

const Model = use('Model')

class Entry extends Model {
  static get table() {
    return 'adoscope_entries'
  }

  static get primaryKey () {
    return 'uuid'
  }

  static get incrementing () {
    return false
  }

  static get updatedAtColumn () {
    return null
  }

  getContent (content) {
    return JSON.parse(content)
  }

  setContent (content) {
    return JSON.stringify(content)
  }
}

module.exports = Entry
