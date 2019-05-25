import { DatabaseContract as Database } from '../Database'
import { ModelContract as Model } from '../Lucid'

export interface Factory {
  new (): Factory
  blueprint(name: string, callback: Function): this
  getBlueprint(name: string): object
  model(name: string): ModelFactory
  get(name: string): DatabaseFactory
  clear(): void
}

interface ModelFactory {
  new (Model: Model, dataCallback: Function): this
  Model: Model
  dataCallback: Function
  _newup(attributes: object): object
  _makeOne(index: number, data: object): object
  make(data: {}, index?: 0): Promise<object>
  makeMany(instances: number, data?: {}): Promise<Array<object>>
  create(data?: {}, index?: 0): Promise<object>
  createMany(numberOfRows: number, data?: {}): Promise<Array<object>>
  reset(): Promise<number>
}

interface DatabaseFactory {
  new (tableName: string, dataCallback: Function): this
  tableName: string
  dataCallback: Function
  _returningColumn: string
  _connection: Database
  _getQueryBuilder(): object
  _makeOne(index: number, data: object): object
  table(tableName: string): this
  returning(column: string): this
  connection(connection: string): this
  make(data?: {}, index?: 0): object
  makeMany(instances: number, data?: {}): Promise<object>
  create(data?: {}, index?: 0): Promise<object>
  createMany(numberOfRows: number, data?: {}): Promise<Array<object>>
  reset(): Promise<number>
}
