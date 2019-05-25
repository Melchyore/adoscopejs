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

import { HttpContextContract as HttpContext } from '../src/Contracts/Server'

import Adoscope from '../src/Adoscope'
import Utils from '../src/lib/Utils'
// @ts-ignore
process.env.SILENT_ENV = true

export async function wire (): Promise<any> {
  setupResolver()
  ioc.bind('Adonis/Src/Helpers', () => new Helpers(path.join(__dirname, '../app')))
  ioc.alias('Adonis/Src/Helpers', 'Helpers')

  ioc.alias('Adonis/Addons/Cache', 'Cache')

  ioc.singleton('Adonis/Adoscope', (app: any) => {
    return new Adoscope(app, Utils.parseBooleanString(app.use('Config').get('adoscope')), app.use('Route'), app.use('Cache'), app.use('Helpers'))
  })

  ioc.autoload(path.join(__dirname, '../config'), 'Adoscope/Config')
  ioc.autoload(path.join(__dirname, '../src/app'), 'Adoscope/App')
  ioc.autoload(path.join(__dirname, '../src/Services'), 'Adoscope/Services')
  ioc.autoload(path.join(__dirname, '../app'), 'App')

  await registrar.providers([
    '@adonisjs/framework/providers/AppProvider',
    '@adonisjs/lucid/providers/LucidProvider',
    '@adonisjs/lucid/providers/MigrationsProvider',
    '@adonisjs/session/providers/SessionProvider',
    '@adonisjs/framework/providers/ViewProvider',
    '@adonisjs/websocket/providers/WsProvider',
    'adonis-cache/providers/CacheProvider'
  ]).registerAndBoot()

  const GE = require('@adonisjs/generic-exceptions')
  const Server = require('@adonisjs/framework/src/Server')
  const _Adoscope = ioc.use('Adonis/Adoscope')

  Server.prototype._handleException = async function (error: Error, ctx: HttpContext) {
    // @ts-ignore
    error.status = error.status || 500

    _Adoscope.getWatcher('exception').add(error, ctx.request)

    try {
      // @ts-ignore
      const handler = ioc.make(ioc.use(this._exceptionHandlerNamespace))

      if (typeof (handler.handle) !== 'function' || typeof (handler.report) !== 'function') {
        throw GE
          .RuntimeException
          .invoke(`${this._exceptionHandlerNamespace} class must have handle and report methods on it`)
      }

      handler.report(error, { request: ctx.request, auth: ctx.auth })
      await handler.handle(error, ctx)
    } catch (error) {
      ctx.response.status(500).send(`${error.name}: ${error.message}\n${error.stack}`)
    }

    this._endResponse(ctx.response)
  }

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
