import { IncomingMessage, IncomingHttpHeaders } from 'http'
import * as Url from 'url'

import { json, text } from 'micro'

import { isArr } from './is_type'
import { BadRequestError } from './errors'
import { makeReadOnlyStream } from './read_only_stream'

export class ReqContext {
  public readonly pathname: string
  public readonly query: Readonly<{
    [name: string]: string | readonly string[] | undefined
  }>

  public constructor(
    path: string,
    public readonly method: string,
    private readonly headers: IncomingHttpHeaders,
    private readonly requestForBodyOnly: IncomingMessage,
  ) {
    // assign method
    this.method = this.method.toUpperCase()

    // assign pathname
    const parsedPath = Url.parse(path, true)
    this.pathname = parsedPath.pathname || '/'
    while (this.pathname !== '/' && this.pathname.endsWith('/')) {
      this.pathname = this.pathname.slice(0, this.pathname.length - 1)
    }
    if (!this.pathname.startsWith('/')) {
      this.pathname = `/${this.pathname}`
    }

    // assign query
    const query: Record<string, string | string[] | undefined> = {}
    for (const [name, value] of Object.entries(parsedPath.query || {})) {
      query[name] = value
      if (typeof value === 'object') {
        Object.freeze(query[name])
      }
    }
    this.query = Object.freeze(query)
  }

  public static parse(request: IncomingMessage) {
    return new ReqContext(
      request.url || '/',
      request.method || 'GET',
      request.headers,
      request,
    )
  }

  public header(name: string) {
    const value = this.headers[name.toLowerCase()]
    if (isArr(value)) {
      throw new BadRequestError(
        `invalid [${name}] header, multi-value headers not allowed`,
      )
    }
    return value
  }

  public async readBodyAsText() {
    return await text(this.requestForBodyOnly)
  }

  public async readBodyAsJson() {
    return (await json(this.requestForBodyOnly)) as unknown
  }

  public readBodyAsStream() {
    return makeReadOnlyStream(this.requestForBodyOnly)
  }

  public getUrl() {
    return Url.format({
      pathname: this.pathname,
      query: this.query,
    })
  }
}
