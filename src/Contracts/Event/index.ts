import { ConfigContract as Config } from '../Config'

export interface Event {
  new (Config: Config): Event
  _resolveListener(listener: string | Function): Function
  getListeners(event: string): Array<string | Function>
  hasListeners(event: string): boolean
  getListenersAny(): Array<string | Function>
  listenersCount(event: string): number
  when(event: string, listeners: EventListener): void
  emit(event: string, ...args: any[]): void
  fire(event: string, ...args: any[]): any
  times(number: number): Event
  on(event: string, listeners: EventListener): void
  onAny(listeners: EventListener): void
  any(listeners: EventListener): void
  once(event: string, listeners: EventListener): void
  off(event: string, listeners: EventListener): void
  offAny(listeners: EventListener): void
  removeListener(event: string, listeners: EventListener): void
  removeAllListeners(event: string): void
  setMaxListeners(number: number): void
  fake(): void
  restore(): void
}
