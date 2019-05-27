import { Logger } from "winston"

type Loglevels = {
  emerg   : 0,
  alert   : 1,
  crit    : 2,
  error   : 3,
  warning : 4,
  notice  : 5,
  info    : 6,
  debug   : 7,
}

type LogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

interface Driver {
  config: object
  logger: Logger
  setConfig(config: object): void
}

export interface LoggerContract {
  driver: Driver
  levels: Loglevels
  level: string
  log(level: LogLevel, message: string, ...options: any[]): void
  debug(message: string, ...options: any[]): void
  info(message: string, ...options: any[]): void
  notice(message: string, ...options: any[]): void
  warning(message: string, ...options: any[]): void
  error(message: string, ...options: any[]): void
  crit(message: string, ...options: any[]): void
  alert(message: string, ...options: any[]): void
  emerg(message: string, ...options: any[]): void
}
