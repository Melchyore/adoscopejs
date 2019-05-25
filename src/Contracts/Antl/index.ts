export interface Antl {
  new (locale : string, messages : object): Antl
  switchLocale(locale : string): void
  forLocale(locale : string): this
  formatnumber(value : number, options? : object, fallback? : string): string
  formatDate(value : string | Date | number, options : object, fallback : string): string
  formatRelative(value : string | Date | number, options? : object, fallback? : string): string
  formatAmount(value : number, currency : string, options? : object, fallback? : string): string
  formatMessage(message : string, values : object, formats? : object | Array<any>): string
  get(key : string, defaultValue? : any): any
  availableLocales(): Array<any>
  list(group? : string): object
  flatList(group? : string): object
}
