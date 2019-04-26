/*
 * File:          adoscope.js
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

'use strict'

const Env = use('Env')

module.exports = {
  elabled: Env.get('ADOSCOPE_ENABLED', true),

  domain: null,

  /*
  |--------------------------------------------------------------------------
  | Adoscope Path
  |--------------------------------------------------------------------------
  |
  | This is the URI path where Adoscope will be accessible from. You can
  | change this path to anything you like.
  |
  */
  path: 'adoscope',

  mime_types: [
    //
  ],

  ignore_paths: [
    //
  ],

  middleware: [
    //
  ]
}
