/*
 * File:          instructions.js
 * Project:       adonis-fullstack-app
 * Created Date:  18/04/2019 5:04:06
 * Author:        Paradox
 *
 * Last Modified: 24/04/2019 1:45:22
 * Modified By:   Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

const fs = require('fs')
const path = require('path')

const _ = require('lodash')

async function copyConfigFile (cli) {
  try {
    const configFile = 'adoscope.js'

    await cli.copy(
      path.join(__dirname, 'config', configFile),
      path.join(cli.helpers.configPath(), configFile)
    )

    cli.command.completed('create', `config/${configFile}`)
  } catch (error) {
    // ignore error
  }
}

async function copyMigrationFile (cli) {
  try {
    const migrationFile = 'adoscope_entries_schema.js'
    const outFile = `${new Date().getTime()}_${migrationFile}`

    await cli.copy(
      path.join(__dirname, 'dist', 'src', 'database', 'migrations', migrationFile),
      path.join(cli.helpers.migrationsPath(), outFile)
    )

    cli.command.completed('create', `database/migrations/${outFile}`)
  } catch (error) {
    // ignore error
  }
}

async function copyControllersDirectory (cli) {
  try {
    const controllersPath = 'app/Controllers/Http'

    await cli.copy(
      path.join(__dirname, 'dist', 'src', controllersPath),
      path.join(cli.helpers.appRoot(), controllersPath, 'Adoscope')
    )

    cli.command.completed('create', `${controllersPath}/Adoscope`)
  } catch (error) {
    // ignore error
  }
}

async function copyModelFile (cli) {
  try {
    const modelFile = 'app/Models/Entry.js'

    await cli.copy(
      path.join(__dirname, 'dist', 'src', modelFile),
      path.join(cli.helpers.appRoot(), modelFile)
    )

    cli.command.completed('create', modelFile)
  } catch (error) {
    // ignore error
  }
}

async function copyViewFile (cli) {
  try {
    const viewFile = 'adoscope.edge'

    await cli.copy(
      path.join(__dirname, 'resources', 'views', viewFile),
      path.join(cli.helpers.viewsPath(), 'adoscope', viewFile)
    )

    cli.command.completed('create', `resources/views/adoscope/${viewFile}`)
  } catch (error) {
    // ignore error
  }
}

module.exports = async (cli) => {
  await copyConfigFile(cli)
  await copyMigrationFile(cli)
  //await copyModelFile(cli)
  //await copyControllersDirectory(cli)
  await copyViewFile(cli)
}
