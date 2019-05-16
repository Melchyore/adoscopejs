/*
 * File:          BaseException.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import { LogicalException } from 'node-exceptions'

/**
 * Base class for all exceptions.
 *
 * @export
 *
 * @class BaseException
 *
 * @extends {LogicalException}
 */
export default class BaseException extends LogicalException {

  /**
   * Creates an instance of BaseException.
   *
   * @param {string} message
   * @param {string} code
   *
   * @memberof BaseException
   */
  constructor (message: string, code: string) {
    super(message, null, code)
  }

}
