/*
 * File:          AdoscopeProvider.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import * as path from 'path'

import * as _ from 'lodash'
import * as pluralize from 'pluralize'

import { ServiceProvider } from '@adonisjs/fold'

import { ValueOf, Fold, Route, Config } from '../src/Contracts'
import Adoscope from '../src/Adoscope'
import EntryType from '../src/EntryType'
import Utils from '../src/lib/Utils'

class AdoscopeProvider extends ServiceProvider implements Fold.ServiceProvider {
  app: Fold.Ioc

  private _addRoutes () {
    // @ts-ignore
    const route: Route.Manager = this.app.use('Route')

    // @ts-ignore
    const config: Config = this.app.use('Config')

    // NOTE: when publising.
    const CONTROLLERS_PATH = '@provider:Adoscope/App/Controllers/Http'

    // NOTE: local mode.
    //const CONTROLLERS_PATH = 'App/Adoscope/Controllers'

    if ([true, 'true'].includes(config.get('adoscope.enabled'))) {
      route.group(() => {
        _.each(_.values(EntryType), (entry: ValueOf<EntryType>) => {
          const _route = pluralize.plural(entry.toString())
          const controllerName = `Adoscope${this.capitalize(_route)}Controller`

          route.post(`/api/${_route}`, `${CONTROLLERS_PATH}/${controllerName}.index`)
          route.get(`/api/${_route}/:entryId`, `${CONTROLLERS_PATH}/${controllerName}.show`)
        })

        route.get('/:view?', `${CONTROLLERS_PATH}/AdoscopeController.index`)
      }).prefix(config.get('adoscope.path', 'adoscope'))
    }
  }

  private capitalize (s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  private _monkeyPatch() {
    const Event = this.app.use('Event')
    const { Command } = require(path.join(process.cwd(), 'node_modules', '@adonisjs/ace'))
    //const { Command } = require('@adonisjs/ace')

    Command.exec = function (args: object, options: object, viaAce: boolean) {
      const commandInstance = typeof (global.make) === 'function' ? global.make(this) : new this()
      commandInstance.viaAce = viaAce

      const EntryService = use('Adoscope/Services/EntryService')
      EntryService.store({
        type: 'command',
        content: {
          name: this.commandName,
          args,
          options
        }
      })

      return new Promise(async (resolve, reject) => {
        try {
          console.log(this.commandName)
          const response = await commandInstance.handle(args, options)
          resolve(response)
        } catch (error) {
          reject(error)
        }
      })
    }
  }

  register () {
    this.app.singleton('Adonis/Adoscope', (app: any) => {
      // @ts-ignore
      const config: Config = app.use('Config')

      return new Adoscope(app, Utils.strToBool(config.merge('adoscope', app.use('Adoscope/Config/adoscope'))), app.use('Route'), app.use('Logger'))
    })
  }

  boot () {
    this.app.autoload(path.join(__dirname, '../../config'), 'Adoscope/Config')

    // We MUST autoload this namepace to avoid E_UNDEFINED_METHOD exception when calling Adoscope controller's methods.
    this.app.autoload(path.join(__dirname, '../src/app'), 'Adoscope/App')
    this.app.autoload(path.join(__dirname, '../src/Services'), 'Adoscope/Services')
    this._addRoutes()
    //this._monkeyPatch()
  }
}

export = AdoscopeProvider
