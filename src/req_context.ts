import { IncomingMessage, IncomingHttpHeaders } from 'http'
import { URL } from 'url'

import { json, text } from 'micro'

import { isStr, isArr } from './is_type'
import { BadRequestError } from './errors'
import { makeReadOnlyStream } from './read_only_stream'

function getBaseUrl(request: IncomingMessage) {
  const protocol = request.headers['x-forwarded-proto']
  if (!isStr(protocol)) {
    throw new Error('x-forwarded-proto header missing')
  }

  const host = request.headers['x-forwarded-host']
  if (!isStr(host)) {
    throw new Error('x-forwarded-host header missing')
  }

  return new URL(`${protocol}://${host}`).href
}

export class ReqContext {
  public readonly pathname: string
  public readonly query: Readonly<{
    [name: string]: string | readonly string[] | undefined
  }>

  public constructor(
    public readonly baseUrl: string,
    public readonly url: string,
    public readonly method: string,
    private readonly headers: IncomingHttpHeaders,
    private readonly requestForBodyOnly: IncomingMessage,
  ) {
    const parsedUrl = new URL(this.url)
    this.pathname = parsedUrl.pathname

    const query: Record<string, string | string[]> = {}
    for (const [name, value] of parsedUrl.searchParams.entries()) {
      query[name] = value
      if (typeof value !== 'string') {
        Object.freeze(query[name])
      }
    }
    this.query = Object.freeze(query)
  }

  public static parse(request: IncomingMessage) {
    const baseUrl = getBaseUrl(request)
    const url = new URL(request.url || '/', baseUrl).href
    const method = (request.method || 'GET').toUpperCase()
    return new ReqContext(baseUrl, url, method, request.headers, request)
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
}
