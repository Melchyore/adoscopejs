import EntryType from '../../EntryType'

export type WatcherConfig = {
  enabled: boolean,
  options: {
    [key: string]: any
  }
}

export interface WatcherContract {
  readonly type: EntryType
  record (): any
}

export interface QueryWatcherContract extends WatcherContract {}

export interface RequestWatcherContract extends WatcherContract {}
