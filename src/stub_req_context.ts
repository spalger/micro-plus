import { IncomingHttpHeaders } from 'http'
import { Readable } from 'stream'

import { ReqContext } from './req_context'

export class StubReqContext extends ReqContext {
  private readonly stubBody: string

  public constructor(
    path = '/',
    options: {
      method?: string
      headers?: IncomingHttpHeaders
      stubBody?: string
    } = {},
  ) {
    const method = (options.method || 'GET').toUpperCase()
    const headers = Object.entries(options.headers || {})
      .map(entry => {
        entry[0] = entry[0].toLowerCase()
        return entry
      })
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

    super(path, method, headers, undefined as any)

    this.stubBody = options.stubBody || ''
  }

  public async readBodyAsText() {
    return this.stubBody
  }

  public async readBodyAsJson() {
    return JSON.parse(this.stubBody)
  }

  public readBodyAsStream() {
    let buffer = this.stubBody

    return new Readable({
      read(size) {
        const chunk = buffer.slice(0, size)
        this.push(chunk)

        if (chunk.length < buffer.length) {
          buffer = buffer.slice(chunk.length)
        } else {
          buffer = ''
          this.push(null)
        }
      },
    })
  }
}
