type HeaderFn = (key: string, value: string) => void
type SessionFn = (name: string, value: string) => void

interface Encryption {
  new (appKey : string, options : Object): this
  encrypt(input : any): string
  decrypt(cipherText : string): any
  base64Encode(input : string): string
  base64Decode(encodedText : string): string
}

interface BaseScheme {
  uidField : string
  passwordField : string
  scheme : string
  primaryKey : string
  primaryKeyValue : string | null
  user : any
  setOptions(config : object, serializerInstance : object): this
  setCtx(ctx : object): this
  query(callback : Function): this
  validate(uid : string, password : string, returnUser? : boolean): Promise<boolean>
  getUser(): Promise<object>
  getAuthHeader(): string | null
  missingUserFor(uidValue : string | number, uid? : string, password? : string): any
  invalidPassword(password? : string): any
}

interface BaseTokenScheme extends BaseScheme {
  new (Encryption : Encryption): BaseTokenScheme
  revokeTokens(tokens? : Array<string> | null, deleteInstead? : boolean): Promise<number>
  revokeTokensForUser(user : any, tokens? : Array<string> | null, deleteInstead? : boolean): Promise<number>
  listTokens(): Promise<Array<object>>
}


interface ApiScheme extends BaseTokenScheme {
  attempt(uid : string, password : string): Promise<object>
  generate(user : object): Promise<object>
  check(): Promise<boolean>
  listTokensForUser(user : object): Promise<Array<object>>
  clientLogin(headerFn : HeaderFn, sessionFn : SessionFn, tokenOrUser : object): Promise<void>
}

interface BasicAuthScheme extends BaseScheme {
  check(): Promise<boolean>
  clientLogin(headerFn : HeaderFn, sessionFn : SessionFn, username : string, password : string): Promise<void>
}


interface JwtScheme extends BaseTokenScheme {
  new (Encryption : Encryption): JwtScheme
  jwtSecret : string | null
  jwtOptions : object | null
  withRefreshToken(): JwtScheme
  newRefreshToken(): JwtScheme
  attempt(uid : string, password : string, jwtPayload? : object | boolean, jwtOptions? : object): Promise<object>
  generate(user : object, jwtPayload? : object | boolean, jwtOptions? : object): Promise<object>
  generateForRefreshToken(refreshToken : string, jwtPayload? : object | boolean, jwtOptions? : object): Promise<object>
  check(): Promise<boolean>
  listTokensForUser(user : object): Promise<object>
  clientLogin(headerFn : HeaderFn, sessionFn : SessionFn, user : object): Promise<void>
}


interface SessionScheme extends BaseScheme {
  new (Config : object): SessionScheme
  sessionKey : String
  rememberTokenKey : string
  remember(duration? : string | number | boolean): this
  attempt(uid : string, password : string): Promise<object>
  login(user : object): Promise<object>
  loginViaId(id : number | string): Promise<object>
  logout(): Promise<void>
  check(): Promise<boolean>
  loginIfCan(): Promise<void>
  clientLogin(headerFn : HeaderFn, sessionFn : SessionFn, user : object): Promise<void>
}

export type Auth<T extends ApiScheme | BasicAuthScheme | JwtScheme | SessionScheme> = T
