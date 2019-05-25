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

// @ts-ignore
import { ServiceProvider } from '@adonisjs/fold'

import { ValueOf } from '../src/Contracts'
import { HttpContextContract as HttpContext } from '../src/Contracts/Server'
import { IocContract as Ioc, Provider } from '../src/Contracts/Fold'
import { ConfigContract as Config } from '../src/Contracts/Config'
import { RouterContract as Route } from '../src/Contracts/Route'
import Adoscope from '../src/Adoscope'
import EntryType from '../src/EntryType'
import Utils from '../src/lib/Utils'

const Template = require('edge.js/src/Template')
const TemplateCompiler = require('edge.js/src/Template/Compiler')
const AdonisScheduler = require('adonis-scheduler/src/Scheduler/')

class AdoscopeProvider extends ServiceProvider implements Provider {

  app: Ioc

  private _addRoutes () {
    // @ts-ignore
    const route: Route = this.app.use('Route')

    // @ts-ignore
    const config: Config = this.app.use('Config')

    // NOTE: when publising.
    const CONTROLLERS_PATH = '@provider:Adoscope/App/Controllers/Http'

    // NOTE: local mode.
    //const CONTROLLERS_PATH = 'App/Adoscope/Controllers'

    route.group(() => {
      _.each(_.values(EntryType), (entry: ValueOf<EntryType>) => {
        const _route = pluralize.plural(entry.toString())
        const controllerName = `Adoscope${_.capitalize(_route)}Controller`

        route.post(`/api/${_route}`, `${CONTROLLERS_PATH}/${controllerName}.index`)
        route.get(`/api/${_route}/:id`, `${CONTROLLERS_PATH}/${controllerName}.show`)
      })

      route.post('/api/entries', `${CONTROLLERS_PATH}/AdoscopeController.entries`)
      route.get('/:view?', `${CONTROLLERS_PATH}/AdoscopeController.index`)
    }).prefix(config.get('adoscope.path', 'adoscope'))
  }

  private _monkeyPatchServer () {
    const { ioc } = require('@adonisjs/fold')
    const GE = require('@adonisjs/generic-exceptions')
    const Server = require('@adonisjs/framework/src/Server')

    Server.prototype._handleException = async function (error: Error, ctx: HttpContext) {
      // @ts-ignore
      error.status = error.status || 500

      if (!ctx.request.adoscope) {
        ctx.request.adoscope = {}
      }

      ctx.request.adoscope.exception = error

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
  }

  private _monkeyPatchAdonisScheduler () {
    const debug = require('debug')('adonis:scheduler')
    const { ioc } = require('@adonisjs/fold')
    const CE = require('adonis-scheduler/src/Exceptions')
    const Task = require('adonis-scheduler/src/Scheduler/Task')

    AdonisScheduler.prototype._fetchTask = async function (file: string) {
      const filePath = path.join(this.tasksPath, file)
      let task
      try {
        task = require(filePath)
      } catch (e) {
        if (e instanceof ReferenceError) {
          debug('Unable to import task class <%s>. Is it a valid javascript class?', file)
          return
        } else {
          throw e
        }
      }

      // Get instance of task class
      const taskInstance = ioc.make(task)

      // Every task must expose a schedule
      if (!('schedule' in task)) {
        throw CE.RuntimeException.undefinedTaskSchedule(file)
      }

      // Every task must expose a handle function
      if (!('handle' in taskInstance)) {
        throw CE.RuntimeException.undefinedTaskHandle(file)
      }

      if (!(taskInstance instanceof Task)) {
        throw CE.RuntimeException.undefinedInstanceTask(file)
      }

      // Track currently registered tasks in memory
      this.registeredTasks.push(taskInstance)

      // Before add task to schedule need check & unlock file if exist
      const locked = await taskInstance.locker.check()
      if (locked) {
        await taskInstance.locker.unlock()
      }

      // Register task handler
      this.instance.scheduleJob(task.name, task.schedule, taskInstance._run.bind(taskInstance))
    }
  }

  private _monkeyPatchViews () {
    const debug = require('debug')('edge:template')

    Template.prototype.compiledViews = []
    Template.prototype._compileView = function (view: string, asFunction: boolean = true) {
      const preCompiledView = this._getFromCache(view)

      /**
       * Return the precompiled view from the cache if
       * it exists.
       */
      if (preCompiledView) {
        debug('resolving view %s from cache', view)
        return preCompiledView
      }

      const compiler = new TemplateCompiler(this._tags, this._loader, asFunction)

      try {
        const compiledView = compiler.compile(view)
        this._saveToCache(view, compiledView)
        this.compiledViews.push(view)

        return compiledView
      } catch (error) {
        throw this._prepareStack(view, error)
      }
    }
  }

  private _monkeyPatch () {
    const Event = this.app.use('Event')
    const { Command } = require(path.join(process.cwd(), 'node_modules', '@adonisjs/ace'))
    //const { Command } = require('@adonisjs/ace')

    Command.exec = function (args: object, options: object, viaAce: boolean) {
      const commandInstance = typeof (make) === 'function' ? make(this) : new this()
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

      return new Adoscope(app, Utils.parseBooleanString(config.merge('adoscope', app.use('Adoscope/Config/adoscope'))), app.use('Route'), app.use('Cache'), app.use('Helpers'))
    })
  }

  boot () {
    this.app.autoload(path.join(__dirname, '../../config'), 'Adoscope/Config')

    // We MUST autoload this namepace to avoid E_UNDEFINED_METHOD exception when calling Adoscope controller's methods.
    this.app.autoload(path.join(__dirname, '../src/app'), 'Adoscope/App')
    this.app.autoload(path.join(__dirname, '../src/Services'), 'Adoscope/Services')
    this._addRoutes()
    this._monkeyPatchServer()
    this._monkeyPatchViews()
    this._monkeyPatchAdonisScheduler()
    //this._monkeyPatch()
  }

}

export = AdoscopeProvider
