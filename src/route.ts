import { Readable } from 'stream'

import { Context } from './context'

export interface RouteResponse {
  status?: number
  headers?: {
    [name: string]: string | undefined
  }
  body?: Readable | Buffer | object | number | string
}

const trimTrailingSlash = (path: string) =>
  path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path

export class Route {
  public constructor(
    private readonly method: string,
    private readonly path: string,
    private readonly handler: (
      ctx: Context,
    ) => Promise<RouteResponse> | RouteResponse,
  ) {
    this.path = trimTrailingSlash(this.path)
  }

  public match(ctx: Context) {
    return (
      ctx.method === this.method &&
      this.path === trimTrailingSlash(ctx.pathname)
    )
  }

  public async exec(ctx: Context) {
    return await this.handler(ctx)
  }
}
