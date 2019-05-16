/*
 * File:          setup.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import * as path from 'path'

// @ts-ignore
import { ioc, registrar } from '@adonisjs/fold'

// @ts-ignore
import { setupResolver, Helpers } from '@adonisjs/sink'

import Adoscope from '../src/Adoscope'
import Utils from '../src/lib/Utils'

// @ts-ignore
process.env.SILENT_ENV = true

export async function wire (): Promise<any> {
  setupResolver()
  ioc.bind('Adonis/Src/Helpers', () => new Helpers(path.join(__dirname, '../app')))
  ioc.alias('Adonis/Src/Helpers', 'Helpers')

  ioc.singleton('Adonis/Adoscope', (app: any) => {
    return new Adoscope(app, Utils.parseBooleanString(app.use('Config').get('adoscope')), app.use('Route'), app.use('Helpers'))
  })
  /*ioc.singleton('App/Models/User', (app: any) => {
    const Model = app.use('Model')
    class User extends Model {
    }
    User._bootIfNotBooted()
    return User
  })*/

  ioc.autoload(path.join(__dirname, '../config'), 'Adoscope/Config')
  ioc.autoload(path.join(__dirname, '../src/app'), 'Adoscope/App')
  ioc.autoload(path.join(__dirname, '../src/Services'), 'Adoscope/Services')
  ioc.autoload(path.join(__dirname, '../src/Watchers'), 'Adoscope/Watchers')
  ioc.autoload(path.join(__dirname, '../app'), 'App')

  await registrar.providers([
    '@adonisjs/framework/providers/AppProvider',
    '@adonisjs/lucid/providers/LucidProvider',
    '@adonisjs/session/providers/SessionProvider',
    '@adonisjs/framework/providers/ViewProvider'
  ]).registerAndBoot()

  const adoscopePath = ioc.use('Config').get('adoscope.path')
  const Route = ioc.use('Route')
  Route.get(`/${adoscopePath}/api/requests`, '@provider:Adoscope/App/Controllers/Http/AdoscopeRequestsController.show')
  Route.post(`/${adoscopePath}/api/requests`, '@provider:Adoscope/App/Controllers/Http/AdoscopeRequestsController.index')

  Route.get('/', () => 'Test')
}

export async function migrateUp () {
  await ioc.use('Database').schema.createTable('adoscope_entries', async (table: any) => {
    table.increments()
    table.timestamps()
    table.uuid('uuid').unique().index()
    table.string('family_hash').nullable().index()

    // @ts-ignore
    table.boolean('should_display_on_index').default(true)
    table.string('type', 20)
    table.text('content', 'longtext')

    table.index(['type', 'should_display_on_index'])
  })

  await ioc.use('Database').schema.createTable('users', async (table: any) => {
    table.increments()
    table.timestamps()
    table.string('username').notNullable()
  })

  await ioc.use('Database').schema.createTable('tests', async (table: any) => {
    table.increments()
    table.timestamps()
    table.string('foo').notNullable()
  })
}

export async function migrateDown () {
  await ioc.use('Database').schema.dropTableIfExists('users')
  await ioc.use('Database').schema.dropTableIfExists('tests')
  await ioc.use('Database').schema.dropTableIfExists('adoscope_entries')
}
