/*
 * File:          InvalidMimeTypeException.ts
 * Project:       adoscopejs
 * Created Date:  16/05/2019 10:28:48
 * Author:        Paradox
 *
 * Last Modified: 16/05/2019 11:52:07
 * Modified By:   Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import BaseException from './BaseException'

export default class InvalidMimeTypeException extends BaseException {

  /**
   * Creates an instance of InvalidMimeTypeException.
   *
   * @param {string} message
   *
   * @memberof InvalidMimeTypeException
   */
  constructor (message: string) {
    super(message, 'E_INVALID_MIME_TYPE')
  }

}
