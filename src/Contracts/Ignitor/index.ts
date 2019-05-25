import { ServerContract as Server } from '../Server'
import { IocContract as Ioc } from '../Fold'

export interface Ignitor {
  new (fold: Ioc): this
  preLoad(filePath : string): this
  preLoadAfter(afterFilePath : string, filePath : string): this
  preLoadBefore(afterFilePath : string, filePath : string): this
  appRoot(location : string): this
  appFile(location : string): this
  loadCommands(): this
  fire(): Promise<void>
  wsServer(httpServer? : Server): this
  fireHttpServer(httpServerCallback? : Function): Promise<void>
  fireAce(): Promise<void>
  appNamespace : string | null
}
