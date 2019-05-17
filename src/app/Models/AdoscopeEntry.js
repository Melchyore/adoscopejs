/*
 * File:          AdoscopeEntry.js
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

'use strict'

const uuid = use('uuid/v4')
const Model = use('Model')

class AdoscopeEntry extends Model {

  // NOTE: Hooks are NOT executed during bulk operations.
  static boot () {
    super.boot()

    this.addHook('beforeCreate', async (instance) => {
      instance.uuid = uuid()
    })
    this.addTrait('@provider:Adoscope/App/Models/Traits/Jsonify')
  }

  static get table () {
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

}

module.exports = AdoscopeEntry
