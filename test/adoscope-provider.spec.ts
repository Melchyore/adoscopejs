/*
 * File:          adoscope-provider.spec.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import * as path from 'path'
import * as test from 'japa'
import * as _ from 'lodash'
import * as request from 'supertest'

// @ts-ignore
import { ioc } from '@adonisjs/fold'

import { BuilderContract as Builder } from '../src/Contracts/Database'
import { ModelContract as Model } from '../src/Contracts/Lucid'
import { AdoscopeConfig } from '../src/Contracts/Adoscope'
import { WatcherConfig } from '../src/Contracts/Watchers'

import AdoscopeEntryOptions from '../src/AdoscopeEntryOptions'
import Utils from '../src/lib/Utils'
import * as setup from './setup'

let config: AdoscopeConfig = null
const appUrl = 'http://127.0.0.1:3334'

function getDatabase(): Builder {
  return ioc.use('Database').table('adoscope_entries')
}

async function testAllWatchers(): Promise<void> {
  await request(appUrl).get('/')

  const User: Model = ioc.use('App/Models/User')

  await User.create({
    username: 'Foo'
  })
}

test.group('Adoscope provider test', group => {
  group.before(async () => {
    await setup.wire()
    await setup.migrateUp()

    const Server = ioc.use('Server')
    Server.listen('localhost', 3334)
    Server
      .registerGlobal(['Adonis/Middleware/Session'])
      .use(['Adoscope/App/Middleware/Authorize'])

    ioc.use('Adonis/Adoscope')

    // @ts-ignore
    config = Utils.parseBooleanString(ioc.use('Config').get('adoscope'))
  })

  group.after(async () => {
    await setup.migrateDown()

    const Server = ioc.use('Server')
    Server.close()
  })

  group.afterEach(async () => {
    await ioc.use('Database').truncate('adoscope_entries')
  })

  test('Provider should exist', assert => {
    assert.property(ioc.getBindings(), 'Adonis/Adoscope')
  })

  test('Autloaded namespaces should exist', assert => {
    assert.property(ioc.getAutoloads(), 'Adoscope/Config')
    assert.property(ioc.getAutoloads(), 'Adoscope/App')
    assert.property(ioc.getAutoloads(), 'Adoscope/Services')
  })

  test('Registered routes should exist', assert => {
    const route = ioc.use('Route')
    const matchedRouteGET = route.match(`/adoscope/api/requests`, 'GET')
    const matchedRoutePOST = route.match(`/adoscope/api/requests`, 'POST')

    assert.exists(matchedRouteGET)
    assert.exists(matchedRoutePOST)
  })

  test('Enabled watchers should be registered', assert => {
    const Adoscope = ioc.use('Adonis/Adoscope')

    assert.includeMembers(_.keys(_.pickBy(config.watchers, (value: WatcherConfig) => value.enabled)), [...Adoscope.watchers.keys()])
  })

  test('Watchers should not/record when recording is disabled/enabled', async (assert) => {
    const Adoscope = ioc.use('Adonis/Adoscope')
    Adoscope.stopRecording()

    await testAllWatchers()

    const entries = await getDatabase().pluck('type')
    assert.equal(entries.length, 0)

    Adoscope.startRecording()

    await testAllWatchers()

    const _entries = await getDatabase().pluck('type')
    assert.isAbove(_entries.length, 0)
  })

  test('ExceptionWatcher should record Adonisjs exceptions but not Adoscope', async (assert) => {
    await request(appUrl).get('/zefzefz')

    const exceptions = await getDatabase().select('content').where('type', 'exception')
    assert.equal(exceptions.length, 1)
    assert.equal(JSON.parse(exceptions[0].content).name, 'HttpException')
  })

  test('RequestWatcher should record request details into databse', async (assert) => {
    assert.equal((await request(appUrl).get('/')).status, 200)

    const requests = await getDatabase().select('content').where('type', 'request')
    assert.equal(requests.length, 1)
    assert.equal(JSON.parse(requests[0].content).path, '/')
  })

  test('QueryWatcher should record query details into database', async (assert) => {
    const User: Model = ioc.use('App/Models/User')

    const user = await User.create({
      username: 'Paradox'
    })

    assert.isTrue(user.$persisted)
    assert.equal(user.username, 'Paradox')
    assert.isDefined(user.created_at)
    assert.isDefined(user.updated_at)

    const queries = await getDatabase().select('content').where('type', 'query')
    assert.equal(queries.length, 1)
    assert.equal(JSON.parse(queries[0].content).table, 'users')
  })

  test('ModelWatcher should record operations on models into database', async (assert) => {
    const User: Model = ioc.use('App/Models/User')

    // INSERT.
    await User.create({
      username: 'Foo'
    })

    // SELECT.
    const foundUser = await User.find(1)

    // UPDATE.
    foundUser.merge({
      username: 'Test'
    })
    await foundUser.save()

    const entry = await getDatabase().select('content').where('type', 'model')
    const insert = JSON.parse(entry[0].content)
    const select = JSON.parse(entry[1].content)
    const update = JSON.parse(entry[2].content)

    assert.equal(insert.method, 'insert')
    assert.includeMembers(insert.bindings, ['Foo'])
    assert.equal(insert.model, 'App/Models/User')

    assert.equal(select.method, 'select')
    assert.includeMembers(select.bindings, [1])
    assert.equal(select.model, 'App/Models/User')

    assert.equal(update.method, 'update')
    assert.includeMembers(update.bindings, ['Test'])
    assert.equal(update.model, 'App/Models/User')
  })

  test('ModelWatcher should register custom model', async (assert) => {
    // @ts-ignore
    const Test: Model = ioc.use('App/Test')

    const Adoscope = ioc.use('Adonis/Adoscope')
    Adoscope.getWatcher('model').register(Test)
    Adoscope.getWatcher('model').register('Adoscope/App/Models/AdoscopeEntry')

    assert.equal(Adoscope.getWatcher('model').registeredModels.has('Test'), true)
    assert.equal(Adoscope.getWatcher('model').registeredModels.has('AdoscopeEntry'), false)
  })

  test('ModelWatcher should record operations on custom registered model', async (assert) => {
    // @ts-ignore
    const Test: Model = ioc.use('App/Test')

    await Test.create({
      foo: 'Bar'
    })

    const entry = await getDatabase().select('content').where('type', 'model')
    const insert = JSON.parse(entry[0].content)

    assert.equal(insert.method, 'insert')
    assert.includeMembers(insert.bindings, ['Bar'])
    assert.equal(insert.model, 'Test')
  })

  test('EntryService should return data', async (assert) => {
    const Factory = ioc.use('Factory')

    Factory.blueprint('Adoscope/App/Models/AdoscopeEntry', async (faker: any, i: number, data: any) => {
      return {
        type: data.type,
        content: {
          [faker.word()]: faker.sentence()
        }
      }
    })

    await Factory.model('Adoscope/App/Models/AdoscopeEntry').createMany(20, { type: 'request' })
    await Factory.model('Adoscope/App/Models/AdoscopeEntry').createMany(2, { type: 'command' })

    const Service = ioc.use('Adoscope/Services/EntryService')
    const requests = await Service.get('request', AdoscopeEntryOptions.getQuery({ id: 0, take: 3, type: 'request' }))

    assert.includeMembers(_.map(requests.rows, (entry: any) => entry.id), [20, 19, 18])

    const _requests = await Service.get('request', AdoscopeEntryOptions.getQuery({ id: 18, take: 3, type: 'request' }))

    assert.includeMembers(_.map(_requests.rows, (entry: any) => entry.id), [17, 16, 15])
  }).timeout(5000)
})
