import * as ioredis from 'ioredis'

interface Core {
  new (Config: ioredis.RedisOptions, Factory: RedisFactory): RedisContract
  Config: ioredis.RedisOptions
  Factory: RedisFactory
  connectionPools: { [key: string]: RedisFactory }
  _isCluster(config: ioredis.RedisOptions): boolean
  _closeConnection(connection: string): void
  connection(connection?: string): RedisFactory
  namedConnection(name: string, config: ioredis.RedisOptions): RedisFactory
  getConnections(): object
  quit(...name: Array<string>): Promise<string>
}

interface RedisFactory {
  new (config: ioredis.RedisOptions, useCluster?: boolean): this
  connection: object
  subscribers: Array<object>
  psubscribers: Array<object>
  subscriberConnection: object
  // connect(): void
  subscribe(channel: string, handler: Function | string): Promise<void>
  psubscribe(pattern: string, handler: Function | string): Promise<void>
  unsubscribe(channel: string): Promise<void>
  punsubscribe(pattern: string): Promise<void>
  quit(): Promise<void>
}

export type RedisContract = Core & RedisFactory & ioredis.Redis
