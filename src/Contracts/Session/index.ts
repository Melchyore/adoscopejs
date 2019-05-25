import { ResponseContract } from '../Response'
import { RequestContract } from '../Request'
import { ConfigContract } from '../Config'

export interface SessionContract {
  new (request : RequestContract, response : ResponseContract, driverInstance : object, Config : ConfigContract): this
  initiated : boolean
  instantiate(freezed : boolean): Promise<void>
  commit(): Promise<void>
  put(key : string, value : any): void
  get(key : string, defaultValue? : any): any
  increment(key : string, steps? : number): void
  decrement(key : string, steps? : number): void
  forget(key : string): void
  all(): object
  pull(key : string, defaultValue? : any): any
  clear(): void
  flashAll(): this
  flashOnly(...fields : Array<string>): this
  flashExcept(...fields : Array<string>): this
  withErrors(errors : object): this
  flash(data : object): this
  toJSON(): { [key: string]: any }
}
