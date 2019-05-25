export interface SuiteContract {
  new (title : string): this
  group: Object
  traits: Array<Object>
  Context: Object
  Request: Object
  Response: Object
  hasTrait(name : string): boolean
  beforeEach(callback : Function): void
  afterEach(callback : Function): void
  after(callback : Function): void
  before(callback : Function): void
  test(title : string, callback : Function): Object
  failing(title : string, callback : Function): Object
  skip(title : string, callback : Function): Object
  timeout(timeout : number): this
  trait(action : Function | String | Object, options? : Object): void
}
