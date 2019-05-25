/*
 * File:          EntryType.ts
 * Project:       adoscope
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

enum EntryType {
  DEFAULT   = 'watcher',
  REQUEST   = 'request',
  COMMAND   = 'command',
  MODEL     = 'model',
  MAIL      = 'mail',
  LOG       = 'log',
  QUERY     = 'query',
  EVENT     = 'event',
  SCHEDULE  = 'schedule',
  EXCEPTION = 'exception',
  VIEW      = 'view'
  // TODO: More types.
}

export default EntryType
