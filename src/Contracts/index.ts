import * as Schedule from 'node-schedule'

export type ValueOf<T> = T[keyof T]

export type Job = {
  uuid?: string
} & Schedule.Job

declare global {
  function use<T extends any = any> (namespace: string): T
  function make<T extends any = any> (namespace: string): T
}
