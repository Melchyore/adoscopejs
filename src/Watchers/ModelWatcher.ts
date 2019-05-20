/*
 * File:          ModelWatcher.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import { promises } from 'fs'
import * as path from 'path'
import * as _ from 'lodash'

import { Database, AdoscopeConfig, Lucid } from '../Contracts'

import AlreadyRegisteredModelException from '../Exceptions/AlreadyRegisteredModelException'
import NoModelSpecifiedException from '../Exceptions/NoModelSpecifiedException'
import NotFoundModelException from '../Exceptions/NotFoundModelException'
import InvalidModelException from '../Exceptions/InvalidModelException'
import EntryType from '../EntryType'
import Watcher from './Watcher'

/**
 * Class used to listen to models queries.
 *
 * @export
 *
 * @class ModelWatcher
 *
 * @extends {Watcher}
 */
export default class ModelWatcher extends Watcher {

  /**
   * Creates an instance of ModelWatcher.
   *
   * @param {AdoscopeConfig} _config
   * @param {Set<string>} [_models=new Set()]
   *
   * @memberof ModelWatcher
   */
  constructor (private _config: AdoscopeConfig, private _models: Set<string> = new Set() ) {
    super()
  }

  /**
   * Listens to models queries.
   * [custom=true] means the model does not exist under
   * model's namespace definied in @member [namespace] .
   *
   * @private
   *
   * @method _process
   *
   * @param {(string | Lucid.Model)} _model
   *
   * @param {boolean} custom
   *
   * @returns {Promise<void>}
   *
   * @memberof ModelWatcher
   */
  private async _process (_model: string | Lucid.Model, custom: boolean): Promise<void> {
    const modelPath = this._getModelPath(_model, custom)

    let model = null

    if (typeof _model === 'function') {
      model = _model
    } else {
      try {
        // @ts-ignore
        model = use(modelPath)
      } catch {
        throw new NotFoundModelException(modelPath)
      }
    }

    if (_.includes([...this._config.watchers[this.type].options.ignore, 'AdoscopeEntry'], model.name)) {
      return
    }

    if (!(model.prototype instanceof use('Model'))) {
      throw new InvalidModelException(modelPath)
    }

    this._checkAndRegister(model)

    model.onQuery(async (builder: Database.QueryInterface) => {
      return await this._store(EntryType.MODEL, {
        ..._.update(_.pick(builder, ['method', 'options', 'bindings', 'sql']), 'method', (value: string) => {
          return value === 'del' ? 'delete' : value === 'first' ? 'select' : value
        }),
        model: modelPath
      })
    })
  }


  /**
   * Get model name and replace extension if it's a string.
   * Otherwise, get name from constructor.
   * If it's a custom model, leave it as it is.
   *
   * @private
   *
   * @method _getModelPath
   *
   * @param {(string | Lucid.Model)} model
   *
   * @param {boolean} [custom=false]
   *
   * @returns {string}
   *
   * @memberof ModelWatcher
   */
  private _getModelPath (model: string | Lucid.Model, custom: boolean = false): string {
    if (model) {
      if (typeof model === 'string') {
        if (!custom) {
          return `${this.namespace}/${model.replace('.js', '').replace('.ts', '')}`
        } else {
          return model
        }
      } else if (typeof model === 'function') {
        return model.name
      } else {
        // @ts-ignore Instance of object
        throw new InvalidModelException(model.constructor.name)
      }
    } else {
      throw new NoModelSpecifiedException('No model specified to be registered.')
    }
  }

  /**
   * Checks if model is not already registered and register it.
   *
   * @private
   *
   * @method _checkAndRegister
   *
   * @param {Lucid.Model} model
   *
   * @returns {boolean}
   *
   * @memberof ModelWatcher
   */
  private _checkAndRegister (model: Lucid.Model): void {
    const name = model.name

    if (!this._isRegistered(name)) {
      this._register(name)
    } else {
      throw new AlreadyRegisteredModelException(`${name} is already registered model to watch.`)
    }
  }

  /**
   * Checks if model is registered.
   *
   * @private
   *
   * @method _isRegistered
   *
   * @param {string} filePath
   *
   * @returns {boolean}
   *
   * @memberof ModelWatcher
   */
  private _isRegistered (filePath: string): boolean {
    return this._models.has(filePath)
  }

  /**
   * Registers model.
   *
   * @private
   *
   * @method _register
   *
   * @param {string} filePath
   *
   * @memberof ModelWatcher
   */
  private _register (filePath: string): void {
    this._models.add(filePath)
  }

  /**
   * Getter for default models namespace.
   *
   * @readonly
   *
   * @private
   *
   * @member namespace
   *
   * @type {string}
   *
   * @memberof ModelWatcher
   */
  private get namespace(): string {
    return 'App/Models'
  }

  public get type (): string {
    return 'model'
  }

  /**
   * Registers custom model. Can be either a file instance or a namespace.
   *
   * @method register
   *
   * @param {(Lucid.Model | string)} model
   *
   * @memberof ModelWatcher
   */
  public register (model: Lucid.Model | string): void {
    this._process(model, true)
  }

  /**
   * Getter for [_models] registered models.
   *
   * @readonly
   *
   * @member registeredModels
   *
   * @type {Set<string>}
   *
   * @memberof ModelWatcher
   */
  public get registeredModels (): Set<string> {
    return this._models
  }

  /**
   * Reads models directories and registers them.
   *
   * @returns {Promise<void>}
   *
   * @memberof ModelWatcher
   */
  public async record (): Promise<void> {
    const modelsPath = path.join(process.cwd(), this.namespace)
    const models = await promises.readdir(modelsPath)

    if (models.length > 0) {
      _.forEach(models, async (model: string) => {
        if (typeof model === 'string' && !(await promises.stat(path.join(modelsPath, model))).isDirectory()) {
          this._process(model, false)
        }
      })
    }
  }

}
