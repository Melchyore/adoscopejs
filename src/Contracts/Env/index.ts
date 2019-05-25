export interface Env {
  new (appRoot : string): Env
  _interpolate(env : string, envConfig : any): string
  load(filePath : string, overwrite? : true, encoding? : 'utf-8'): void
  getEnvPath(): string
  get(key : string, defaultValue? : any): any
  getOrFail(key : string): any
  set(key : string, value : any): void
}
