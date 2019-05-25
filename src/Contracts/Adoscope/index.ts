import { WatcherConfig } from '../Watchers'

export type AdoscopeConfig = {
  enabled?: boolean,
  domain?: string,
  path?: string,
  ignore_paths?: Array<string>,
  ignore_commands?: Array<string>,
  mime_types?: Array<string>,
  middleware?: Array<string>,
  watchers?: {
    [key: string]: WatcherConfig
  }
} & object
