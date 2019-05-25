export interface ViewContract {
  compiledViews: Array<string>
  engine: EngineContract
  BasePresenter: BasePresenterContract
  global(name: string, value: any): void
  share(locals: object): EngineContract
  render(view: string, data?: {}): string
  renderString(statement: string, data?: {}): string
  presenter(presenter: string): EngineContract
  tag(tag: TagContract): void
}

export interface EngineContract {
  new(): this
  tag(tag: TagContract): void
  configure(options: object): void
  global(name: string, value: any): void
  registerViews(location: string): void
  registerPresenters(location: string): void
  renderString(statement: string, data?: {}): string
  compileString(statement: string, asFunction?: true): string
  render(view: string, data?: {}): string
  compile(view: string, asFunction?: true): string
  presenter(presenter: string): this
  share(locals: object): this
}

export interface TemplateContract {
  runtimeViewName: string
  _prepareStack(view: string, error: object): object
  _makeContext(data: object): object
  _addRunTimeView(view: string): void
  _removeRunTimeView(): void
  _getFromCache(view: string): string | null
  _saveToCache(view: string, output: string): void
  _compileView(view: string, asFunction?: true): string
  presenter(presenter: string): this
  share(locals: object): this
  setView(viewName: string): this
  compile(view: string, asFunction?: true): string
  compileString(statement: string, asFunction: boolean): string
  render(view: string, data: object): string
  renderString(statement: string, data: object): string
  runTimeRender(view: string): string
  isolate(callback: Function): void
  newContext(...props: Array<object>): this
  renderWithContext(view: string): string
}

export interface TagContract {
  tagName: string
  compile(
    compiler: object,
    lexer: object,
    buffer: object,
    options: {
    body: string
    childs: any[]
    lineno: number
    }
  ): void
  run(Context: ContextContract): void
}

export interface BasePresenterContract {
  $data: any
}

export interface ContextContract {
  newFrame(): void
  setOnFrame(key: string, value: any): void
  clearFrame(): void
  accessChild(hash: Array<any> | object, childs: Array<String>, i?: number): any
  escape(input: string): string
  resolve(key: string): any
  callFn(name: string, args: Array<any>): any
  macro(name: string, fn: Function): void

  $viewName: string
  $globals: object
  $presenter: BasePresenterContract
}
