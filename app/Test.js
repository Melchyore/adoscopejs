/*
 * File:          User.js
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

'use strict'

const Model = use('Model')

class Test extends Model {}

Test._bootIfNotBooted()

module.exports = Test
