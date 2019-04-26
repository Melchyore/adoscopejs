'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
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
