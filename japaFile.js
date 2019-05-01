/*
 * File:          japaFile.js
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

require('ts-node').register()

const { configure } = require('japa')
configure({
  files: ['test/*.ts']
})
