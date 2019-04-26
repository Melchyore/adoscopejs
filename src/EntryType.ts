/*
 * File:          EntryType.ts
 * Project:       adoscope
 * Author:        Paradox
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
