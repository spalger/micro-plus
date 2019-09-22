import { IncomingMessage, ServerResponse } from 'http'

import { send } from 'micro'
import { handleCorsRequest } from './cors'
import { NotFoundError, isRespError, ServerError } from './errors'
import { Route, RouteResponse } from './route'
import { ReqContext } from './req_context'
import { isObj, isStr, isFn } from './is_type'
import { Hooks, ParsedHooks } from './hooks'

type MaybePromise<T> = Promise<T> | T

interface Options {
  routes: Route[]

  /**
   * array of valid origin values for cors preflight requests
   */
  corsAllowOrigins?: string[]

  /**
   * global request handler, if a response is returned it takes over the request
   */
  onRequest?: (ctx: ReqContext) => MaybePromise<RouteResponse | void>

  /**
   * Object which will be called through the lifecycle of a request
   */
  hooks?: Hooks
}

export function createMicroHandler(options: Options) {
  const hooks = new ParsedHooks(options.hooks)

  async function routeReq(req: ReqContext) {
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
    hooks.onRequest(request, response)

    let ctx
    let resp

    try {
      ctx = ReqContext.parse(request)
      hooks.onRequestParsed(ctx, request, response)
      resp = await routeReq(ctx)
      hooks.onResponse(resp, ctx, request, response)
    } catch (error) {
      hooks.onError(error, ctx, request, response)

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
        if (isFn(resp.body)) {
          stringRespBody = '<dynamic>'
        } else if (
          isObj(resp.body) &&
          'on' in resp.body &&
          isFn(resp.body.on)
        ) {
          stringRespBody = '<stream>'
        } else if (isObj(resp.body) || isStr(resp.body)) {
          stringRespBody = JSON.stringify(resp.body)
        } else {
          stringRespBody = '<unknown>'
        }

        console.error(
          'RESPONSE ERROR:\n' +
            `  url: ${ctx ? ctx.getUrl() : request.url}\n` +
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

    response.statusCode = status

    hooks.beforeSend(request, response, body)

    if (typeof body === 'function') {
      body(response)
    } else {
      send(response, status, body)
    }
  }

  return (request: IncomingMessage, response: ServerResponse) => {
    handleRequest(request, response).catch(error => {
      console.error(`UNHANDLED ERROR: ${error.stack || error.message}`)
      process.exit(1)
    })
  }
}
