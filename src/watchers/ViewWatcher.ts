/*
 * File:          ViewWatcher.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import * as _ from 'lodash'

import { View } from '../Contracts'
import Watcher from './Watcher'

/**
 * Class used to get compiled views.
 *
 * @export
 *
 * @class ViewWatcher
 *
 * @extends {Watcher}
 */
export default class ViewWatcher extends Watcher {

  /**
   * Creates an instance of ViewWatcher.
   *
   * @param {View} _template
   *
   * @memberof ViewWatcher
   */
  constructor (private _template: View) {
    super()
  }

  public get type (): string {
    return 'view'
  }

  /**
   * @public
   *
   * @method getCompiledViews
   *
   * @returns {Array<string>}
   *
   * @memberof ViewWatcher
   */
  public getCompiledViews (): Array<string> {
    let compiledViews = this._template.compiledViews

    return _.remove(compiledViews)
  }

}
