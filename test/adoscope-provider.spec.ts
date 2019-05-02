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

// @ts-ignore
import { ioc } from '@adonisjs/fold'

import { Lucid, AdoscopeConfig } from '../src/Contracts'
import Utils from '../src/lib/Utils'
import * as setup from './setup'

let config: AdoscopeConfig = null

test.group('Adoscope provider test', group => {
  group.before(async () => {
    await setup.wire()
    await setup.migrateUp()

    ioc.use('Adonis/Adoscope')

    // @ts-ignore
    config = Utils.strToBool(ioc.use('Config').get('adoscope'))
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

  test('QueryWatcher should record query details into database', async (assert) => {
    const User: Lucid.Model = ioc.use('App/Models/User')
    const user = await User.create({
      username: 'Paradox'
    })

    assert.isTrue(user.$persisted)
    assert.equal(user.username, 'Paradox')
    assert.isDefined(user.created_at)
    assert.isDefined(user.updated_at)

    const count = await ioc.use('Database').table('adoscope_entries').count('* as total')
    assert.equal(count[0].total, 1)
  })
})
