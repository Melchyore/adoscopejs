import * as events from 'events'
import * as Bluebird from 'bluebird'

import { ConfigContract } from '../Config'

export type Direction = 'asc' | 'desc'
export type SimpleAny = number | string | Date
export type AggragationResult = Promise<Array<object>[]>
export type NumberResult = Promise<number>
export type NumberResults = Promise<Array<number>>

export type Value = string | number | boolean | Date | Array<string> | Array<number> | Array<Date> | Array<boolean> | Raw
export type ValueMap = { [key: string]: Value | QueryContract }
export type ColumnName = string | Raw | QueryContract | {[key: string]: string }
export type TableName = string | Raw | QueryContract

export interface DatabaseManagerContract {
  connection(name? : string): DatabaseContract
  close(names? : string | Array<string>): void
}

export interface DatabaseContract extends DatabaseManagerContract, BuilderContract {
  schema: SchemaBuilderContract
  fn: FunctionHelper
  beginTransaction(): Promise<TransactionContract>
  transaction(callback: (trx: TransactionContract) => void): void
  beginGlobalTransaction(): Promise<void>
  rollbackGlobalTransaction(): void
  commitGlobalTransaction(): void
  query(): BuilderContract
  close(): Promise<void>
}

export interface PaginationPages {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

export interface PaginationResult<T> {
  pages: PaginationPages
  row: T[]
}

export interface QueryContract {
  select: Select
  as: As
  columns: Select
  column: Select
  from: Table
  into: Table
  table: Table
  distinct: Distinct

  // Joins
  join: Join
  joinRaw: JoinRaw
  innerJoin: Join
  leftJoin: Join
  leftOuterJoin: Join
  rightJoin: Join
  rightOuterJoin: Join
  outerJoin: Join
  fullOuterJoin: Join
  crossJoin: Join

  // Withs
  with: With
  withRaw: WithRaw
  withSchema: WithSchema
  withWrapped: WithWrapped

  // Wheres
  where: Where
  andWhere: Where
  orWhere: Where
  whereNot: Where
  andWhereNot: Where
  orWhereNot: Where
  whereRaw: WhereRaw
  orWhereRaw: WhereRaw
  andWhereRaw: WhereRaw
  whereWrapped: WhereWrapped
  havingWrapped: WhereWrapped
  whereExists: WhereExists
  orWhereExists: WhereExists
  whereNotExists: WhereExists
  orWhereNotExists: WhereExists
  whereIn: WhereIn
  orWhereIn: WhereIn
  whereNotIn: WhereIn
  orWhereNotIn: WhereIn
  whereNull: WhereNull
  orWhereNull: WhereNull
  whereNotNull: WhereNull
  orWhereNotNull: WhereNull
  whereBetween: WhereBetween
  orWhereBetween: WhereBetween
  andWhereBetween: WhereBetween
  whereNotBetween: WhereBetween
  orWhereNotBetween: WhereBetween
  andWhereNotBetween: WhereBetween

  // Group by
  groupBy: GroupBy
  groupByRaw: RawQueryBuilder

  // Order by
  orderBy: OrderBy
  orderByRaw: RawQueryBuilder

  // Union
  union: Union
  unionAll(callback: QueryCallback): QueryContract

  // Having
  having: Having
  andHaving: Having
  havingRaw: RawQueryBuilder
  orHaving: Having
  orHavingRaw: RawQueryBuilder
  havingIn: HavingIn

  // Clear
  clearSelect(): QueryContract
  clearWhere(): QueryContract

  // Paging
  offset(offset: number): QueryContract
  limit(limit: number): QueryContract

  // Aggregation
  count(columnName?: string): QueryContract
  countDistinct(columnName?: string): QueryContract
  min(columnName: string): QueryContract
  max(columnName: string): QueryContract
  sum(columnName: string): QueryContract
  sumDistinct(columnName: string): QueryContract
  avg(columnName: string): QueryContract
  avgDistinct(columnName: string): QueryContract
  increment(columnName: string, amount?: number): QueryContract
  decrement(columnName: string, amount?: number): QueryContract

  // Others
  first: Select

  debug(enabled?: boolean): QueryContract
  pluck(column: string): QueryContract

  insert(data: any, returning?: string | Array<string>): QueryContract
  modify(callback: QueryCallbackWithArgs, ...args: any[]): QueryContract
  update(data: any, returning?: string | Array<string>): QueryContract
  update(columnName: string, value: Value, returning?: string | Array<string>): QueryContract
  returning(column: string | Array<string>): QueryContract

  del(returning?: string | Array<string>): QueryContract
  delete(returning?: string | Array<string>): QueryContract
  truncate(): QueryContract

  transacting(trx?: TransactionContract): QueryContract

  clone(): QueryContract
  toSQL(): SqlContract
}

export interface TransactionContract extends QueryContract {
  savepoint(transactionScope: (trx: this) => any): Bluebird<any>
  commit(value?: any): QueryContract
  rollback(error?: any): QueryContract
}

export interface As {
  (columnName: string): QueryContract
}

export interface Select extends ColumnNameQueryBuilder {
  (aliases: { [alias: string]: string }): QueryContract
}

export interface Table {
  (tableName: TableName): QueryContract
  (callback: Function): QueryContract
  (raw: Raw): QueryContract
}

export interface Distinct extends ColumnNameQueryBuilder {}

export interface Join {
  (raw: Raw): QueryContract
  (tableName: TableName | QueryCallback, clause: (this: JoinClause, join: JoinClause) => void): QueryContract
  (tableName: TableName | QueryCallback, columns: { [key: string]: string | number | Raw }): QueryContract
  (tableName: TableName | QueryCallback, raw: Raw): QueryContract
  (tableName: TableName | QueryCallback, column1: string, column2: string): QueryContract
  (tableName: TableName | QueryCallback, column1: string, raw: Raw): QueryContract
  (tableName: TableName | QueryCallback, column1: string, operator: string, column2: string): QueryContract
}

export interface JoinClause {
  on(raw: Raw): JoinClause
  on(callback: QueryCallback): JoinClause
  on(columns: { [key: string]: string | Raw }): JoinClause
  on(column1: string, column2: string): JoinClause
  on(column1: string, raw: Raw): JoinClause
  on(column1: string, operator: string, column2: string | Raw): JoinClause
  andOn(raw: Raw): JoinClause
  andOn(callback: QueryCallback): JoinClause
  andOn(columns: { [key: string]: string | Raw }): JoinClause
  andOn(column1: string, column2: string): JoinClause
  andOn(column1: string, raw: Raw): JoinClause
  andOn(column1: string, operator: string, column2: string | Raw): JoinClause
  orOn(raw: Raw): JoinClause
  orOn(callback: QueryCallback): JoinClause
  orOn(columns: { [key: string]: string | Raw }): JoinClause
  orOn(column1: string, column2: string): JoinClause
  orOn(column1: string, raw: Raw): JoinClause
  orOn(column1: string, operator: string, column2: string | Raw): JoinClause
  onIn(column1: string, values: any[]): JoinClause
  andOnIn(column1: string, values: any[]): JoinClause
  orOnIn(column1: string, values: any[]): JoinClause
  onNotIn(column1: string, values: any[]): JoinClause
  andOnNotIn(column1: string, values: any[]): JoinClause
  orOnNotIn(column1: string, values: any[]): JoinClause
  onNull(column1: string): JoinClause
  andOnNull(column1: string): JoinClause
  orOnNull(column1: string): JoinClause
  onNotNull(column1: string): JoinClause
  andOnNotNull(column1: string): JoinClause
  orOnNotNull(column1: string): JoinClause
  onExists(callback: QueryCallback): JoinClause
  andOnExists(callback: QueryCallback): JoinClause
  orOnExists(callback: QueryCallback): JoinClause
  onNotExists(callback: QueryCallback): JoinClause
  andOnNotExists(callback: QueryCallback): JoinClause
  orOnNotExists(callback: QueryCallback): JoinClause
  onBetween(column1: string, range: [any, any]): JoinClause
  andOnBetween(column1: string, range: [any, any]): JoinClause
  orOnBetween(column1: string, range: [any, any]): JoinClause
  onNotBetween(column1: string, range: [any, any]): JoinClause
  andOnNotBetween(column1: string, range: [any, any]): JoinClause
  orOnNotBetween(column1: string, range: [any, any]): JoinClause
  using(column: string | Array<string> | Raw | { [key: string]: string | Raw }): JoinClause
  type(type: string): JoinClause
}

export interface JoinRaw {
  (tableName: string, binding?: Value): QueryContract
}

export interface With extends WithRaw, WithWrapped {
}

export interface WithRaw {
  (alias: string, raw: Raw): QueryContract
  (alias: string, sql: string, bindings?: Value[] | object): QueryContract
}

export interface WithSchema {
  (schema: string): QueryContract
}

export interface WithWrapped {
  (alias: string, callback: (queryBuilder: QueryContract) => any): QueryContract
}

export interface Where extends WhereRaw, WhereWrapped, WhereNull {
  (raw: Raw): QueryContract
  (callback: QueryCallback): QueryContract
  (object: object): QueryContract
  (columnName: string, value: Value | null): QueryContract
  (columnName: string, operator: string, value: Value | QueryContract | null): QueryContract
  (left: Raw, operator: string, right: Value | QueryContract | null): QueryContract
}

export interface WhereRaw extends RawQueryBuilder {
  (condition: boolean): QueryContract
}

export interface WhereWrapped {
  (callback: QueryCallback): QueryContract
}

export interface WhereNull {
  (columnName: string): QueryContract
}

export interface WhereIn {
  (columnName: string, values: Value[]): QueryContract
  (columnName: string, callback: QueryCallback): QueryContract
  (columnName: string, query: QueryContract): QueryContract
}

export interface WhereBetween {
  (columnName: string, range: [Value, Value]): QueryContract
}

export interface WhereExists {
  (callback: QueryCallback): QueryContract
  (query: QueryContract): QueryContract
}

export interface WhereNull {
  (columnName: string): QueryContract
}

export interface WhereIn {
  (columnName: string, values: Value[]): QueryContract
}

export interface GroupBy extends RawQueryBuilder, ColumnNameQueryBuilder {
}

export interface OrderBy {
  (columnName: string, direction?: string): QueryContract
}

export interface Union {
  (callback: QueryCallback, wrap?: boolean): QueryContract
  (callbacks: QueryCallback[], wrap?: boolean): QueryContract
  (...callbacks: QueryCallback[]): QueryContract
  // (...callbacks: QueryCallback[], wrap?: boolean): QueryContract
}

export interface Having extends RawQueryBuilder, WhereWrapped {
  (tableName: string, column1: string, operator: string, column2: string): QueryContract
}

export interface HavingIn {
  (columnName: string, values: Value[]): QueryContract
}

// commons

export interface ColumnNameQueryBuilder {
  (...columnNames: ColumnName[]): QueryContract
  (columnNames: ColumnName[]): QueryContract
}

export interface RawQueryBuilder {
  (sql: string, ...bindings: (Value | QueryContract)[]): QueryContract
  (sql: string, bindings: (Value | QueryContract)[] | ValueMap): QueryContract
  (raw: Raw): QueryContract
}

export interface Raw extends events.EventEmitter {
  wrap(before: string, after: string): Raw
}

export interface RawBuilder {
  (value: Value): Raw
  (sql: string, ...bindings: (Value | QueryContract)[]): Raw
  (sql: string, bindings: (Value | QueryContract)[] | ValueMap): Raw
}

export type QueryCallback = (this: QueryContract, builder: QueryContract) => void
export type QueryCallbackWithArgs = (this: QueryContract, builder: QueryContract, ...args: any[]) => void

export interface SqlContract {
  __knexQueryUid?: string
  method?: string
  options?: any
  bindings?: Value[]
  sql?: string
}

export interface SchemaBuilderContract extends Bluebird<any> {
  createTable(tableName: string, callback: (tableBuilder: CreateTableBuilderContract) => any): this
  createTableIfNotExists(tableName: string, callback: (tableBuilder: CreateTableBuilderContract) => any): this
  alterTable(tableName: string, callback: (tableBuilder: CreateTableBuilderContract) => any): this
  renameTable(oldTableName: string, newTableName: string): Bluebird<void>
  dropTable(tableName: string): this
  hasTable(tableName: string): Bluebird<boolean>
  hasColumn(tableName: string, columnName: string): Bluebird<boolean>
  table(tableName: string, callback: (tableBuilder: AlterTableBuilderContract) => any): Bluebird<void>
  dropTableIfExists(tableName: string): this
  raw(statement: string): this
  withSchema(schemaName: string): this
}

export interface TableBuilderContract {
  increments(columnName?: string): ColumnBuilderContract
  bigIncrements(columnName?: string): ColumnBuilderContract
  dropColumn(columnName: string): this
  dropColumns(...columnNames: Array<string>): this
  renameColumn(from: string, to: string): ColumnBuilderContract
  integer(columnName: string): ColumnBuilderContract
  bigInteger(columnName: string): ColumnBuilderContract
  text(columnName: string, textType?: string): ColumnBuilderContract
  string(columnName: string, length?: number): ColumnBuilderContract
  float(columnName: string, precision?: number, scale?: number): ColumnBuilderContract
  decimal(columnName: string, precision?: number | null, scale?: number): ColumnBuilderContract
  boolean(columnName: string): ColumnBuilderContract
  date(columnName: string): ColumnBuilderContract
  dateTime(columnName: string): ColumnBuilderContract
  time(columnName: string): ColumnBuilderContract
  timestamp(columnName: string, standard?: boolean): ColumnBuilderContract
  timestamps(useTimestampType?: boolean, makeDefaultNow?: boolean): ColumnBuilderContract
  binary(columnName: string, length?: number): ColumnBuilderContract
  enum(columnName: string, values: Value[]): ColumnBuilderContract
  enu(columnName: string, values: Value[]): ColumnBuilderContract
  json(columnName: string): ColumnBuilderContract
  jsonb(columnName: string): ColumnBuilderContract
  uuid(columnName: string): ColumnBuilderContract
  comment(val: string): this
  specificType(columnName: string, type: string): ColumnBuilderContract
  primary(columnNames: Array<string>): this
  index(columnNames: (string | Raw)[], indexName?: string, indexType?: string): this
  unique(columnNames: (string | Raw)[], indexName?: string): this
  foreign(column: string, foreignKeyName?: string): ForeignConstraintBuilder
  foreign(columns: Array<string>, foreignKeyName?: string): MultikeyForeignConstraintBuilder
  dropForeign(columnNames: Array<string>, foreignKeyName?: string): this
  dropUnique(columnNames: (string | Raw)[], indexName?: string): this
  dropPrimary(constraintName?: string): this
  dropIndex(columnNames: (string | Raw)[], indexName?: string): this
  dropTimestamps(): ColumnBuilderContract
}

export interface CreateTableBuilderContract extends TableBuilderContract {}

export interface AlterTableBuilderContract extends TableBuilderContract {}

export interface MySqlAlterTableBuilderContract extends AlterTableBuilderContract {}

export interface ColumnBuilderContract {
  index(indexName?: string): ColumnBuilderContract
  primary(constraintName?: string): ColumnBuilderContract
  unique(indexName?: string): ColumnBuilderContract
  references(columnName: string): ReferencingColumnBuilderContract
  onDelete(command: string): ColumnBuilderContract
  onUpdate(command: string): ColumnBuilderContract
  defaultTo(value: Value): ColumnBuilderContract
  unsigned(): ColumnBuilderContract
  notNullable(): ColumnBuilderContract
  nullable(): ColumnBuilderContract
  comment(value: string): ColumnBuilderContract
  alter(): ColumnBuilderContract
}

export interface ForeignConstraintBuilder {
  references(columnName: string): ReferencingColumnBuilderContract
}

export interface MultikeyForeignConstraintBuilder {
  references(columnNames: Array<string>): ReferencingColumnBuilderContract
}

export interface PostgreSqlColumnBuilderContract extends ColumnBuilderContract {
  index(indexName?: string, indexType?: string): ColumnBuilderContract
}

export interface ReferencingColumnBuilderContract extends ColumnBuilderContract {
  inTable(tableName: string): ColumnBuilderContract
}

export interface AlterColumnBuilderContract extends ColumnBuilderContract {
}

export interface MySqlAlterColumnBuilderContract extends AlterColumnBuilderContract {
  first(): AlterColumnBuilderContract
  after(columnName: string): AlterColumnBuilderContract
}

export interface ColumnInfo {
  defaultValue: Value
  type: string
  maxLength: number
  nullable: boolean
}

export interface FunctionHelper {
  now(): Raw
}

export interface BuilderContract {
  _single: {
    table: string
  }

  returning(column: string | Array<string>): this
  from(table: string): this
  table(table: string): this
  into(table: string): this
  withOutPrefix(): this

  select(column: string): this
  select(...columns: Array<string>): this

  where(column: string, value: any): this
  where(column: string, operator: string, value: any): this
  where(condition: object): this
  where(callback: QueryCallback): this
  where(subquery: this): this
  whereNot(column: string, value: any): this
  whereNot(column: string, operator: string, value: any): this
  whereNot(condition: object): this
  whereNot(subquery: this): this
  whereIn(column: string, params: any[]): this
  whereIn(column: string, subquery: this): this
  whereNotIn(column: string, params: any[]): this
  whereNotIn(column: string, subquery: this): this
  whereNull(column: string): this
  whereNotNull(column: string): this
  whereExists(callback: Function): this
  whereNotExists(callback: Function): this
  whereBetween(column: string, params: Array<number>): this
  whereNotBetween(column: string, params: Array<number>): this
  whereRaw(exp: string, params?: SimpleAny[]): this

  innerJoin(table: string, leftSideCondition: string, rightSideCondition: string): this
  innerJoin(table: string, callback: Function): this
  leftJoin(table: string, leftSideCondition: string, rightSideCondition: string): this
  leftOuterJoin(table: string, leftSideCondition: string, rightSideCondition: string): this
  rightJoin(table: string, leftSideCondition: string, rightSideCondition: string): this
  rightOuterJoin(table: string, leftSideCondition: string, rightSideCondition: string): this
  outerJoin(table: string, leftSideCondition: string, rightSideCondition: string): this
  fullOuterJoin(table: string, leftSideCondition: string, rightSideCondition: string): this
  crossJoin(table: string, leftSideCondition: string, rightSideCondition: string): this
  joinRaw(condition: string): this

  distinct(column: string): this
  groupBy(column: string): this
  groupByRaw(exp: string): this

  orderBy(column: string, direction?: Direction): this
  orderByRaw(exp: string): this

  having(column: string, operator: string, value: any): this
  havingIn(column: string, params: any[]): this
  havingNotIn(column: string, params: any[]): this
  havingNull(column: string): this
  havingNotNull(column: string): this
  havingExists(subquery:this): this
  havingExists(callback: Function): this
  havingNotExists(subquery:this): this
  havingNotExists(callback: Function): this
  havingRaw(column: string, operator: string, value: SimpleAny[]): this

  offset(offset: number): this
  limit(limit: number): this

  insert(row: object): NumberResults
  insert(rows: Array<object>): NumberResults
  returning(column: string): NumberResult

  update(column: string, value: SimpleAny): NumberResult
  update(row: object): NumberResult

  increment(column: string, value?: number): Promise<void>
  decrement(column: string, value?: number): Promise<void>

  delete(): NumberResult
  truncate(table: string): NumberResult

  forPage(page: number, limit?: number): Promise<Array<object>>
  forPage<T>(page: number, limit?: number): Promise<T[]>
  paginate(page: number, limit?: number): Promise<PaginationResult<object>>
  paginate<T>(page: number, limit?: number): Promise<PaginationResult<T>>

  count(): AggragationResult
  count(column: string): AggragationResult
  countDistinct(): AggragationResult
  min(column: string): AggragationResult
  max(column: string): AggragationResult
  sum(column: string): AggragationResult
  sumDistinct(column: string): AggragationResult
  avg(column: string): AggragationResult
  avgDistinct(column: string): AggragationResult

  // helpers
  getCount(column?: string): NumberResult
  getCountDistinct(column?: string): NumberResult
  getMin(column: string): NumberResult
  getMax(colum: string): NumberResult
  getSum(column: string): NumberResult
  getSumDistinct(column: string): NumberResult
  getAvg(column: string): NumberResult
  getAvgDistinct(column: string): NumberResult

  last<T>(field?: string): Promise<T>
  pluck<T>(colum: string): Promise<T[]>
  first<T>(): Promise<T>
  map<T, R>(callback: (row: T | object) => R): Promise<R[]>
  reduce<T, S>(reducer: (acc: S, row: T) => S, initValue: S): Promise<S>

  clone(): this
  columnInfo(): Promise<ColumnInfo>

  raw<T>(expression: string, params?: SimpleAny[]): Promise<T[]>

  asCallback<T>(callback: (err: object, rows: T[]) => void): void
  stream(callback: any): object
  on(event: string, callback: Function): this
  toSQL(): SqlContract
  toString(): string

  then(callback: (response: any) => void): this
  catch(callback: (error: any) => void): this
}

export interface SchemaContract {
  new(Database: DatabaseContract): this
  hasTable(tableName : string): boolean
  hasColumn(tableName : string, columnName : string): boolean
  connection : string
  create(table: string, callback: (table: TableBuilderContract) => void) :void
  createIfNotExists(tableName : string, callback: (table: TableBuilderContract) => void): void
  rename(fromTable : string, toTable : string): void
  drop(table: string) :void
  dropIfExists(tableName : string): void
  raw(statement : string):  void
  schedule(fn : Function): void
}

export interface MigrationContract {
  new (Config : ConfigContract, Database : DatabaseContract): this
  db: DatabaseContract
  _migrationsTable: string
  _lockTable: string
  isKeepAliveEnabled: boolean
  keepAlive(enabled?: true): void
  up(schemas: object, toSQL : Boolean): Promise<object>
  down(schemas: object, batch : number, toSQL : boolean): Promise<object>
  status(schemas: object): Promise<object>
}
