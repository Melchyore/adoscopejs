/*
 * File:          database.js
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

const path = require('path')

module.exports = {
  connection: 'sqlite',

  mysql: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'adoscope'
    }
  },

  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '../database.sqlite')
    }
  }
}
