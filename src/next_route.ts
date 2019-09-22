import { Route, RouteHandler } from './route'
import { ReqContext } from './req_context'

export class NextRoute extends Route {
  constructor(method: string, handler: RouteHandler) {
    super(method, '*', handler)
  }

  match(ctx: ReqContext) {
    return ctx.method === this.method
  }
}
