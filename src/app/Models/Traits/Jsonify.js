/*
 * File:          Jsonify.js
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

'use strict'

const _ = use('lodash')

class Jsonify {

  register (Model) {
    Model.addHook('beforeSave', this._beforeSave.bind(this))
    Model.addHook('afterFetch', this._afterFetch.bind(this))

    _.forEach(['afterSave', 'afterFind'], hook => {
      Model.addHook(hook, this._afterSaveOrFind.bind(this))
    })
  }

  async _beforeSave (instance) {
    if (instance.content) {
      instance.content = JSON.stringify(instance.content)
    }
  }

  async _afterSaveOrFind (instance) {
    if (instance.content && typeof instance.content === 'string') {
      instance.content = JSON.parse(instance.content)
    }
  }

  async _afterFetch (instances) {
    _.forEach(instances, instance => {
      if (instance.content && typeof instance.content === 'string') {
        instance.content = JSON.parse(instance.content)
      }
    })
  }

}

module.exports = Jsonify
