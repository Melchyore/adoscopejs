import {
  TransactionContract as Transaction,
  DatabaseContract as Database,
  BuilderContract as Builder,
  QueryContract as Query,
  QueryCallback,
  NumberResult
} from '../Database'
import { SuiteContract } from '../Test'

type Omit<T, K extends keyof T> = T extends any ? Pick<T, Exclude<keyof T, K>> : never
type Overwrite<T, U> = Omit<T, Extract<keyof T, keyof U>> & U
export type Serializer = VanillaSerializerContract
export type DatabaseTransactions = (suite: SuiteContract) => void

interface Hooks {
  addHandler(event: string, handler: Function | string, name?: string): void
  removeHandler(event: string, name: string): void
  removeAllHandlers(event: string): void
  exec(event: string, ...args: any[]): Promise<void>
}

export interface VanillaSerializerContract {
  rows: Array<object>
  pages: object
  isOne: boolean
  new(rows: Array<object>, pages?: null, isOne?: false): this
  addRow(row: ModelContract): void
  first(): ModelContract
  nth(index: number): ModelContract | null
  last(): ModelContract
  size(): number
  toJSON(): Array<object> | object
}

export interface BaseModel {
  $hooks: object
  $queryListeners: Function
  $globalScopes: object
  QueryBuilder: QueryBuilder
  isNew: boolean
  isDeleted: boolean
  fill(attributes: object): void
  merge(attributes: object): void
  freeze(): void
  unfreeze(): void
  toJSON(): object
  dates: Array<any>
  createdAtColumn: string | null
  updatedAtColumn: string | null
  connection: string
  Serializer: Serializer
  visible: Array<string>
  hidden : Array<string>
  formatDates(key: string, value: string | Date): string
  resolveSerializer(): Serializer
  castDates(key: string, value: any): string
  boot(): void
  hydrate(): void
  $attributes   : object
  $persisted    : object
  $originalAttributes : object
  $relations    : object
  $sideLoaded   : object
  $parent     : object
  $frozen     : boolean
  $visible      : Array<string>
  $hidden     : Array<string>
}

type aggregates =
  'sum'              |
  'sumDistinct'      |
  'avg'              |
  'avgDistinct'      |
  'min'              |
  'max'              |
  'count'            |
  'countDistinct'    |
  'getSum'           |
  'getSumDistinct'   |
  'getAvg'           |
  'getAvgDistinct'   |
  'getMin'           |
  'getMax'           |
  'getCount'         |
  'getCountDistinct' |
  'pluck'            |
  'toSQL'            |
  'toString'

export interface QueryBuilder extends Pick<Builder, aggregates> {
  new (ModelContract: ModelContract, connection: Database): QueryBuilder
  formatter(): object
  ignoreScopes(scopes?: Array<string>): QueryBuilder
  fetch(): Promise<Serializer>
  first(): Promise<ModelContract>
  last(field: string): Promise<ModelContract>
  firstOrFail(): Promise<ModelContract>
  paginate(page?: 1, limit?: 20): Promise<Serializer>
  update(valuesOrModelInstance: object | ModelContract): NumberResult
  delete(): NumberResult
  ids<T>(): Promise<T[]>
  pair(lhs: string, rhs: string): Promise<object>
  pickInverse(limit?: 1): Promise<Serializer>
  pick(limit?: 1): Promise<Serializer>
  with(relation: string, callback?: Function): QueryBuilder
  has(relation: string, expression: string, value: any): QueryBuilder
  orHas(relation: string, expression: string, value: any): QueryBuilder
  doesntHave(relation: string): QueryBuilder
  orDoesntHave(relation: string): QueryBuilder
  whereHas(relation: string, callback: Function, expression: string, value: string): QueryBuilder
  orWhereHas(relation: string, callback: Function, expression: string, value: any): QueryBuilder
  whereDoesntHave(relation: string, callback: Function): QueryBuilder
  orWhereDoesntHave(relation: string, callback: Function): QueryBuilder
  withCount(relation: string, callback: Function): QueryBuilder
  setVisible(fields: Array<string>): QueryBuilder
  setHidden(fields: Array<string>): QueryBuilder
  _eagerLoads: object
  _sideLoaded: Array<string>
  _visibleFields: Array<string>
  _hiddenFields: Array<string>
  _withCountCounter: number
  ModelContract: ModelContract
  db: Database
  query: Builder
}

export namespace Relations {
  type methodsList =
    'increment'        |
    'decrement'        |
    'sum'              |
    'sumDistinct'      |
    'avg'              |
    'avgDistinct'      |
    'min'              |
    'max'              |
    'count'            |
    'countDistinct'    |
    'getSum'           |
    'getSumDistinct'   |
    'getAvg'           |
    'getAvgDistinct'   |
    'getMin'           |
    'getMax'           |
    'getCount'         |
    'getCountDistinct' |
    'truncate'         |
    'ids'              |
    'paginate'         |
    'pair'             |
    //'pluckFirst'     |
    //'pluckId'        |
    'pick'             |
    'pickInverse'      |
    'delete'           |
    'update'           |
    'first'            |
    'fetch'            |
    'toSQL'            |
    'toString'

  export interface BaseRelation extends QueryProxy {
    new(parentInstance: ModelContract, RelatedModel: ModelContract, primaryKey?: string, foreignKey?: string): BaseRelation
    parentInstance: ModelContract
    RelatedModel  : ModelContract
    primaryKey  : string
    foreignKey  : string
    relatedQuery  : QueryProxy
    eagerLoadQuery(fn: <T>(query: object, fk: string, values: Array<T>) => void): void
    $primaryTable: string
    $foreignTable: string
    applyRelatedScopes(): void
    eagerLoad(rows: Array<any>): Promise<object>
    load(): ModelContract | object
    columnize(column: string): string
  }

  export interface HasOne extends BaseRelation {
    mapValues(modelInstances: Array<any>): Array<object>
    group(relatedInstances:  Array<any>): object
    fetch<T>(): Promise<T>
    relatedWhere(count: boolean): Builder
    addWhereOn(context: any): object
    save(relatedInstance:object, trx?: Transaction): Promise<boolean>
    create(payload: object, trx?: Transaction): Promise<ModelContract>
    createMany(): void
    saveMany(): void
  }

  export interface BelongsTo extends BaseRelation {
    first<T>(): Promise<T>
    mapValues(modelInstances: Array<object>): Array<object>
    group(relatedInstances: Array<object>): object
    fetch<T>(): Promise<T>
    relatedWhere(count: boolean, counter: number): Builder
    addWhereOn(context: object): void
    create(): void
    save(): void
    createMany(): void
    saveMany(): void
    associate(relatedInstance: object, trx?: Transaction): Promise<boolean>
  }

  type pivotCallback = (ModelContract: ModelContract) => void

  export interface BelongsToMany extends BaseRelation {
    new(parentInstance: object, relatedModel: object, primaryKey: string, foreignKey: string, relatedPrimaryKey: string, relatedForeignKey: string): this
    relatedForeignKey: string
    relatedPrimaryKey: string
    relatedTableAlias: string
    $pivotTable: string
    $pivotColumns: Array<string>
    select(...columns: Array<string> ): this
    pivotModel(pivotModel: ModelContract): this
    pivotTable(table: string): this
    withTimestamps(): this
    withPivot(fields: string | Array<string>): this
    mapValues(modelInstances: object): Array<object>
    whereInPivot(key: string, ...args: Array<any>): this
    orWherePivot(key: string, ...args: Array<any>): this
    andWherePivot(key: string, ...args: Array<any>): this
    wherePivot(key: string, ...args: Array<any>): this
    eagerLoad(rows: Array<any>): Promise<object>
    load(): Promise<Serializer>
    ids<T>(): Promise<T[]>
    fetch(): Promise<Serializer>
    group(relatedInstances: Array<object>): object
    pivotQuery(selectFields?: true): QueryBuilder
    relatedWhere(count: boolean, counter: number): Builder
    addWhereOn(context: object): void
    attach(references: Number | String | Array<String>, pivotCallback?: pivotCallback, trx?: Transaction): Promise<object>
    delete(): NumberResult
    update(values: Object): NumberResult
    detach(references: Array<String>, trx: Transaction): number
    sync(references: Number|String|Array<String>, pivotCallback?: pivotCallback, trx?: Transaction): Promise<void>
    save(relatedInstance: object, pivotCallback: pivotCallback): Promise<void>
    saveMany(arrayOfRelatedInstances: Array<object>, pivotCallback?: pivotCallback): Promise<void>
    create(row: object, pivotCallback?: pivotCallback): Promise<object>
    createMany(rows: Array<object>, pivotCallback: pivotCallback): Promise<Array<object>>
  }

  export interface HasMany extends BaseRelation {
    mapValues(modelInstances: Array<object>): Array<object>
    group(relatedInstances: Array<object>): object
    relatedWhere(count: boolean, counter: number): Builder
    addWhereOn(context: object): void
    save(relatedInstance: object, trx?: Transaction): Promise<boolean>
    create(payload: object, trx?: Transaction): Promise<boolean>
    createMany(arrayOfPayload: Array<object>, trx?: Transaction): Promise<boolean>
    saveMany(arrayOfRelatedInstances: Array<object>, trx?: Transaction): Promise<boolean>
  }

  export interface HasManyThrough extends BaseRelation {
    new(parentInstance: object, RelatedModel: object, relatedMethod: string, primaryKey: string, foreignKey: string): HasManyThrough
    _relatedModelRelation: object
    relatedQuery   : QueryProxy
    _relatedFields   : Array<string>
    _throughFields   : Array<string>
    _fields      : Array<string>
    select(...columns: Array<string>): this
    selectThrough(...columns: Array<string>): this
    selectRelated(...columns: Array<string>): this
    mapValues(modelInstances:  Array<object>): Array<object>
    eagerLoad(rows: Array<any>): Promise<object>
    group(relatedInstances: Array<object>): object
    relatedWhere(count: boolean): Builder
    create(): void
    save(): void
    createMany(): void
    saveMany(): void
  }
}

type QueryProxy = Overwrite<QueryBuilder, Overwrite<Query, Builder>>
type ModelEvent =
    "beforeCreate" |
    "afterCreate"  |
    "beforeUpdate" |
    "afterUpdate"  |
    "beforeSave"   |
    "afterSave"  |
    "beforeDelete" |
    "afterDelete"  |
    "afterFind"  |
    "afterFetch"   |
    "afterPaginate"

export interface ModelContract extends BaseModel {
  new(): this
  [property: string]: any
  dirty: any
  isDirty: boolean
  hasParent: boolean
  _insert(trx: Transaction): boolean
  _update(trx: Transaction): boolean
  set(name: string, value: any): void
  toobject(): object
  save(trx?: Transaction): Promise<boolean>
  delete(): Promise<boolean>
  newUp(row: object): void
  setRelated(key: string, value: object | Array<any>): void
  getRelated(key: string): object
  load(relation: string, callback: Function): Promise<void>
  loadMany(eagerLoadMap: object): void
  hasOne(relatedModel: string | ModelContract, primaryKey?: string, foreignKey?: string): Relations.HasOne
  hasMany(relatedModel: string | ModelContract, primaryKey?: string, foreignKey?: string): Relations.HasMany
  belongsTo(relatedModel: string | ModelContract, primaryKey?: string, foreignKey?: string): Relations.BelongsTo
  belongsToMany(relatedModel: ModelContract | string, foreignKey?: string, relatedForeignKey?: string, primaryKey?: string, relatedPrimaryKey?: string): Relations.BelongsToMany
  manyThrough(relatedModel: ModelContract | string, relatedMethod: string, primaryKey?: string, foreignKey?: string): Relations.HasManyThrough
  reload(): Promise<void>
  _bootIfNotBooted(): void
  iocHooks: Array<string>
  makePlain: boolean
  primaryKey: string
  foreignKey: string
  incrementing: boolean
  primaryKeyValue: any
  table: string
  query(): QueryProxy
  queryWithOutScopes(): QueryProxy
  queryMacro(name: string, fn: (params: object) => this): this
  addHook(forEvent: ModelEvent, handlers: ((params: any) => void) | String | Array<any>): this
  addGlobalScope(callback: QueryCallback, name?: string): this
  onQuery(callback: QueryCallback): this
  addTrait(trait: string | Function, options?: {}): void
  create(payload: object, trx?: Transaction): Promise<ModelContract>
  last(field?: string): Promise<ModelContract>
  createMany(payloadArray: Array<object>, trx?: Transaction): Promise<Array<ModelContract>>
  truncate(): void
  find(value: string | number): Promise<ModelContract>
  findOrFail(value: string | number): Promise<ModelContract>
  findBy(key: string, value: string | number): Promise<ModelContract>
  findByOrFail(key: string, value: string | number): Promise<ModelContract>
  first(): Promise<ModelContract>
  firstOrFail(): Promise<ModelContract>
  findOrCreate(whereClause: object, payload: object, trx?: Transaction): Promise<ModelContract>
  findOrNew(whereClause: object, payload: object): Promise<ModelContract>
  all(): Promise<Serializer>
  pick(limit?: 1): Promise<Serializer>
  pickInverse(limit?: 1): Promise<Serializer>
  ids<T>(): Promise<T[]>
  pair(lhs: string, rhs: string): Promise<object>
  getCount(columnName?: '*'): Promise<number>
  getCountDistinct(columnName: string): Promise<number>
  getAvg(columnName: string): Promise<number>
  getAvgDistinct(columnName: string): Promise<number>
  getMin(columnName: string): Promise<number>
  getMax(columnName: string): Promise<number>
  getSum(columnName: string): Promise<number>
  getSumDistinct(columnName: string): Promise<number>
  $booted: boolean
}

interface PivotModel extends BaseModel {
  new (): PivotModel
  [property: string]: any
  $table: string
  $withTimestamps: boolean
  $connection: Database
  newUp(row: object): void
  toobject(): void
  set(name: string, value: any): void
  query(table: string, connection: Database): Builder
  save(trx: Transaction): void
}
