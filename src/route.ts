import { Readable } from 'stream'

import { Context } from './context'

export interface RouteResponse {
  status?: number
  headers?: {
    [name: string]: string
  }
  body?: Readable | Buffer | object | number | string
}

export class Route {
  public constructor(
    private readonly method: string,
    private readonly path: string,
    private readonly handler: (
      ctx: Context,
    ) => Promise<RouteResponse> | RouteResponse,
  ) {}

  public match(ctx: Context) {
    return ctx.method === this.method && ctx.pathname === this.path
  }

  public async exec(ctx: Context) {
    return await this.handler(ctx)
  }
}
