import { ModelContract as Model } from '../Lucid'

import EntryType from '../../EntryType'

export type EntryContent = {
  [key: string]: any
}

export type Entry = {
  uuid: string,
  content: EntryContent
} & Model

export type EntryStore = {
  type: EntryType,
  content: EntryContent
}

export type EntryOptions = {
  id: number,
  type: string,
  take: number
}
