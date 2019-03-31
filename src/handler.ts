import { IncomingMessage, ServerResponse } from 'http'

import { send } from 'micro'
import { handleCorsRequest } from './cors'
import { NotFoundError, isRespError, ServerError } from './errors'
import { Route, RouteResponse } from './route'
import { Context } from './context'
import { isObj, isStr, isFn, MaybePromise } from './is_type'

interface Options {
  routes: Route[]

  /**
   * array of valid origin values for cors preflight requests
   */
  corsAllowOrigins?: string[]

  /**
   * global request handler, if a response is returned it takes over the request
   */
  onRequest?: (ctx: Context) => MaybePromise<RouteResponse | void>
}

export function createRootHandler(options: Options) {
  async function routeReq(req: Context) {
    if (options.onRequest) {
      const resp = await options.onRequest(req)
      if (resp) {
        return resp
      }
    }

    if (
      options.corsAllowOrigins &&
      req.method === 'OPTIONS' &&
      req.header('Access-Control-Request-Method')
    ) {
      return await handleCorsRequest(req, options.corsAllowOrigins)
    }

    for (const route of options.routes) {
      if (route.match(req)) {
        return await route.exec(req)
      }
    }

    throw new NotFoundError()
  }

  async function handleRequest(
    request: IncomingMessage,
    response: ServerResponse,
  ) {
    let ctx
    let resp

    try {
      ctx = Context.parse(request)
      resp = await routeReq(ctx)
    } catch (error) {
      resp = (isRespError(error)
        ? error
        : new ServerError(error.message, error)
      ).toResponse()

      if (resp.status !== 404) {
        const stringHeaders = Object.entries(resp.headers || {}).reduce(
          (acc, [key, value]) => `${acc}    ${key}:${value}\n`,
          '',
        )

        let stringRespBody: string
        if (isObj(resp.body) && 'on' in resp.body && isFn(resp.body.on)) {
          stringRespBody = '<stream>'
        } else if (isObj(resp.body) || isStr(resp.body)) {
          stringRespBody = JSON.stringify(resp.body)
        } else {
          stringRespBody = '<unknown>'
        }

        // tslint:disable-next-line no-console
        console.error(
          'RESPONSE ERROR:\n' +
            `  url: ${ctx ? ctx.url : request.url}\n` +
            `  status: ${resp.status}\n` +
            `  headers: ${stringHeaders}\n` +
            `  body: ${stringRespBody}`,
        )
      }
    }

    const { status = 200, body, headers = {} } = resp

    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined) {
        response.setHeader(key, value)
      }
    }

    send(response, status, body)
  }

  return (request: IncomingMessage, response: ServerResponse) => {
    handleRequest(request, response).catch(error => {
      console.error(`UNHANDLED ERROR: ${error.stack || error.message}`)
      process.exit(1)
    })
  }
}
