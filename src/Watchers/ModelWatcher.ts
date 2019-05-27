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

import { QueryContract as Query } from '../Contracts/Database'
import { ModelContract as Model } from '../Contracts/Lucid'

import AlreadyRegisteredModelException from '../Exceptions/AlreadyRegisteredModelException'
import NoModelSpecifiedException from '../Exceptions/NoModelSpecifiedException'
import NotFoundModelException from '../Exceptions/NotFoundModelException'
import InvalidModelException from '../Exceptions/InvalidModelException'
import EntryType from '../EntryType'
import Adoscope from '../Adoscope'
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
  constructor (private _app: Adoscope, private _models: Set<string> = new Set() ) {
    super(_app.config)
  }

  /**
   * Listens to models queries.
   * `custom=true` means the model does not exist under
   * model's namespace definied in `namespace` .
   *
   * @private
   *
   * @method _process
   *
   * @param {(string | Model)} _model
   *
   * @param {boolean} custom
   *
   * @returns {Promise<void>}
   *
   * @memberof ModelWatcher
   */
  private async _process (_model: string | Model, custom: boolean): Promise<void> {
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

    if (_.includes([...this._watcherConfig.options.ignore, 'AdoscopeEntry'], model.name)) {
      return
    }

    if (!(model.prototype instanceof use('Model'))) {
      throw new InvalidModelException(modelPath)
    }

    this._checkAndRegister(model)

    model.onQuery(async (builder: Query) => {
      if (!(await this._app.isRecording())) {
        return
      }

      return await this._store(this.type, {
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
   * @param {(string | Model)} model
   *
   * @param {boolean} [custom=false]
   *
   * @returns {string}
   *
   * @memberof ModelWatcher
   */
  private _getModelPath (model: string | Model, custom: boolean = false): string {
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
   * @param {Model} model
   *
   * @returns {boolean}
   *
   * @memberof ModelWatcher
   */
  private _checkAndRegister (model: Model): void {
    const name = model.name

    if (!this._isRegistered(name)) {
      this._register(name)
    } else {
      throw new AlreadyRegisteredModelException(name)
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

  public get type (): EntryType {
    return EntryType.MODEL
  }

  /**
   * Registers custom model. Can be either a file instance or a namespace.
   *
   * @method register
   *
   * @param {(Model | string)} model
   *
   * @memberof ModelWatcher
   */
  public register (model: Model | string): void {
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
    const modelsPath = path.join(process.cwd(), this.namespace).replace('App', 'app')
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
