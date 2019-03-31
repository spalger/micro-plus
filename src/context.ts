import { IncomingMessage } from 'http'
import { URL } from 'url'

import { isStr } from './is_type'

function getBaseUrl(request: IncomingMessage) {
  const protocol = request.headers['x-forwarded-proto']
  if (!isStr(protocol)) {
    throw new Error('x-forwarded-proto header missing')
  }

  const host = request.headers['x-forwarded-host']
  if (!isStr(host)) {
    throw new Error('x-forwarded-host header missing')
  }

  return new URL(`${protocol}://${host}`)
}

export class Context {
  public constructor(
    public readonly baseUrl: URL,
    public readonly url: URL,
    public readonly method: string,
    public readonly request: IncomingMessage,
  ) {}

  public static parse(request: IncomingMessage) {
    const baseUrl = getBaseUrl(request)
    const url = new URL(request.url || '/', baseUrl)
    const method = (request.method || 'GET').toUpperCase()
    return new Context(baseUrl, url, method, request)
  }

  public header(name: string) {
    return this.request.headers[name.toLowerCase()]
  }

  public redirect(newUrl: URL) {
    return {
      status: 302,
      headers: {
        Location: newUrl.href,
      },
    }
  }
}
