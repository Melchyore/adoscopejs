/*
 * File:          EntryType.ts
 * Project:       adoscope
 * Created Date:  20/04/2019 7:14:55
 * Author:        Paradox
 *
 * Last Modified: 21/04/2019 1:44:28
 * Modified By:   Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

enum EntryType {
  REQUEST = 'request',
  COMMAND = 'command',
  MAIL    = 'mail',
  LOG     = 'log',
  QUERY   = 'query',
  EVENT   = 'event',
  // More's coming!
}

export default EntryType
