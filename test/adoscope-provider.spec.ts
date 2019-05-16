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

import { Lucid, AdoscopeConfig, Database } from '../src/Contracts'
import Utils from '../src/lib/Utils'
import * as setup from './setup'
import RequestWatcher from '../src/watchers/RequestWatcher';

let config: AdoscopeConfig = null
const appUrl = 'http://127.0.0.1:3333'

function getDatabase(): Database.Builder {
  return ioc.use('Database').table('adoscope_entries')
}

test.group('Adoscope provider test', group => {
  group.before(async () => {
    await setup.wire()
    await setup.migrateUp()

    ioc.use('Adonis/Adoscope')

    // @ts-ignore
    config = Utils.parseBooleanString(ioc.use('Config').get('adoscope'))
  })

  group.after(async () => {
    await setup.migrateDown()
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

  test('RequestWatcher should record request details into databse', async (assert) => {
    const Server = ioc.use('Server')
    Server.listen('localhost', 3333)
    Server
      .registerGlobal(['Adonis/Middleware/Session'])
      .use(['Adoscope/App/Middleware/Authorize'])

    assert.equal((await request(appUrl).get('/')).status, 200)

    Server.close()

    const requests = await getDatabase().select('content').where('type', 'request')
    assert.equal(requests.length, 1)
    assert.equal(JSON.parse(requests[0].content).path, '/')
  })

  test('QueryWatcher should record query details into database', async (assert) => {
    const User: Lucid.Model = ioc.use('App/Models/User')

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
    const User: Lucid.Model = ioc.use('App/Models/User')
    await User.create({
      username: 'Foo'
    })

    const foundUser = await User.find(1)
    foundUser.merge({
      username: 'Test'
    })
    await foundUser.save()

    const entry = await getDatabase().select('content').where('type', 'model')
    // NOTE: entry[0] contains the content of the first query in the previous test.
    const insert = JSON.parse(entry[1].content)
    const select = JSON.parse(entry[2].content)
    const update = JSON.parse(entry[3].content)

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
    const Test: Lucid.Model = ioc.use('App/Test')

    const ModelWatcher = ioc.make(ioc.use('Adoscope/Watchers/ModelWatcher').default)
    ModelWatcher.register(Test)

    assert.equal(ModelWatcher.registeredModels.has('Test'), true)
  })

  test('ModelWatcher should record operations on custom registered model', async (assert) => {
    // @ts-ignore
    const Test: Lucid.Model = ioc.use('App/Test')

    await Test.create({
      foo: 'Bar'
    })

    const entry = await getDatabase().select('content').where('type', 'model')
    const insert = JSON.parse(entry[4].content)

    assert.equal(insert.method, 'insert')
    assert.includeMembers(insert.bindings, ['Bar'])
    assert.equal(insert.model, 'Test')
  })
})
