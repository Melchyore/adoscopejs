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
  ioc.bind('Adonis/Src/Helpers', () => new Helpers(path.join(__dirname, 'app')))

  ioc.singleton('Adonis/Adoscope', (app: any) => {
    return new Adoscope(app, Utils.strToBool(app.use('Config').get('adoscope')), app.use('Route'))
  })

  ioc.singleton('App/Models/User', (app: any) => {
    const Model = app.use('Model')
    class User extends Model {
    }
    User._bootIfNotBooted()
    return User
  })

  ioc.autoload(path.join(__dirname, '../config'), 'Adoscope/Config')
  ioc.autoload(path.join(__dirname, '../src/app'), 'Adoscope/App')
  ioc.autoload(path.join(__dirname, '../src/Services'), 'Adoscope/Services')

  await registrar.providers([
    '@adonisjs/framework/providers/AppProvider',
    '@adonisjs/lucid/providers/LucidProvider'
  ]).registerAndBoot()

  const route = ioc.use('Route')
  route.get('/adoscope/api/requests', '@provider:Adoscope/App/Controllers/Http/AdoscopeRequestsController.show')
  route.post('/adoscope/api/requests', '@provider:Adoscope/App/Controllers/Http/AdoscopeRequestsController.index')
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

  await ioc.use('Database').schema.createTable('users', (table: any) => {
    table.increments()
    table.timestamps()
    table.string('username').notNullable()
  })
}

export async function migrateDown () {
  await ioc.use('Database').schema.dropTableIfExists('adoscope_entries')
  await ioc.use('Database').schema.dropTableIfExists('users')
}
