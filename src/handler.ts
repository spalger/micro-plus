import { IncomingMessage, ServerResponse } from 'http'

import { send } from 'micro'
import { handleCorsRequest } from './cors'
import { NotFoundError, isRespError, ServerError } from './errors'
import { Route, RouteResponse } from './route'
import { Context } from './context'
import { isObj, isStr, isFn, MaybePromise } from './is_type'

export function createRootHandler(
  routes: Route[],
  globalHandler: (ctx: Context) => MaybePromise<RouteResponse | void>,
) {
  async function handleRequest(request: IncomingMessage) {
    let req
    try {
      req = Context.parse(request)

      if (globalHandler) {
        const resp = await globalHandler(req)
        if (resp) {
          return resp
        }
      }

      if (
        req.method === 'OPTIONS' &&
        req.header('Access-Control-Request-Method')
      ) {
        return await handleCorsRequest(req)
      }

      for (const route of routes) {
        if (route.match(req)) {
          return await route.exec(req)
        }
      }

      throw new NotFoundError()
    } catch (error) {
      const resp = (isRespError(error)
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
            `  url: ${req ? req.url.href : request.url}\n` +
            `  status: ${resp.status}\n` +
            `  headers: ${stringHeaders}\n` +
            `  body: ${stringRespBody}`,
        )
      }

      return resp
    }
  }

  return async (request: IncomingMessage, response: ServerResponse) => {
    const { status = 200, body, headers = {} } = await handleRequest(request)

    for (const [key, value] of Object.entries(headers)) {
      response.setHeader(key, value)
    }

    send(response, status, body)
  }
}
