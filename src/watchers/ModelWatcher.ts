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
   *
   * @private
   *
   * @method _process
   *
   * @param {(string | Function)} _model
   *
   * @returns {Promise<void>}
   *
   * @memberof ModelWatcher
   */
  private async _process (_model: string | Function): Promise<void> {
    const name = this._getFileName(_model)

    if (!this._checkAndRegister(name)) {
      return
    }

    // @ts-ignore
    const model = typeof _model === 'function' ? _model : use(name)
    model.onQuery(async (builder: Database.Sql) => {
      return await this._store(EntryType.MODEL, {
        ..._.update(_.pick(builder, ['method', 'options', 'bindings', 'sql']), 'method', (value: string) => {
          return value === 'del' ? 'delete' : value === 'first' ? 'select' : value
        }),
        model: name
      })
    })
  }


  /**
   * Get model name and replace extension if it's a string.
   * Otherwise, get name from constructor.
   *
   * @private
   *
   * @method _getFileName
   *
   * @param {(string | Function)} model
   *
   * @returns {string}
   *
   * @memberof ModelWatcher
   */
  private _getFileName (model: string | Function): string {
    return typeof model === 'string' ? `${this.namespace}/${model.replace('.js', '').replace('.ts', '')}` : model.name
  }

  /**
   * Checks if model is not registered and register it.
   *
   * @private
   *
   * @method _checkAndRegister
   *
   * @param {string} filePath
   *
   * @returns {boolean}
   *
   * @memberof ModelWatcher
   */
  private _checkAndRegister (filePath: string): boolean {
    if (this._isRegistered(filePath)) {
      throw new AlreadyRegisteredModelException(`${filePath} is already registered model to watch.`)
    } else {
      this._register(filePath)

      return true
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
  private _register (filePath: string) {
    this._models.add(filePath)
  }

  /**
   * Getter for default models namespace.
   *
   * @readonly
   *
   * @private
   *
   * @getter namespace
   *
   * @type {string}
   *
   * @memberof ModelWatcher
   */
  private get namespace(): string {
    return 'App/Models'
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
    this._process(model)
  }

  /**
   * Getter for @_models registered models.
   *
   * @readonly
   *
   * @getter registeredModels
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
          this._process(model)
        }
      })
    }
  }

}
