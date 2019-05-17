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
  enabled: Env.get('ADOSCOPE_ENABLED', true),

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
    'text/plain'
  ],

  ignore_paths: [

  ],

  middleware: [
    //
  ],

  watchers: {
    query: {
      enabled: true
    },
    model: {
      enabled: true,
      options: {
        ignore: [

        ] // List of ignored models.
      }
    },
    request: {
      enabled: true,
      options: {
        mime_types: [

        ], // List of accepted mime types.

        ignore: [

        ] // List of ignored paths.
      }
    },
    schedule: {
      enabled: true
    },
    view: {
      enabled: true
    }
  }
}
