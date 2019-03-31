import { ReqContext } from './req_context'
import { BadRequestError } from './errors'
import { isStr } from './is_type'
import { RouteResponse } from './route'

const parseCslHeader = (ctx: ReqContext, name: string) => {
  const header = ctx.header(name)

  if (!isStr(header)) {
    throw new BadRequestError(`invalid '${name}' header`)
  }

  return header
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
}

export function handleCorsRequest(
  ctx: ReqContext,
  validOrigins: string[],
): RouteResponse {
  const origin = ctx.header('origin')
  if (!validOrigins.some(x => x === origin)) {
    return {
      status: 200,
    }
  }

  return {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Method': parseCslHeader(
        ctx,
        'Access-Control-Request-Method',
      ).join(','),
      'Access-Control-Allow-Headers': parseCslHeader(
        ctx,
        'Access-Control-Request-Headers',
      ).join(', '),
    },
  }
}
