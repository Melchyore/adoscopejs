/*
 * File:          ViewWatcher.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import * as _ from 'lodash'

import { ViewContract as View } from '../Contracts/View'

import EntryType from '../EntryType'
import Adoscope from '../Adoscope'
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
   * @param {View} _view
   *
   * @memberof ViewWatcher
   */
  constructor (private _app: Adoscope, private _view: View) {
    super(_app.config)
  }

  public get type (): EntryType {
    return EntryType.VIEW
  }

  public record (): void {}

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
    let compiledViews = this._view.compiledViews

    return _.remove(compiledViews)
  }

}
