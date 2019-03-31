import { Context } from './context'
import { BadRequestError } from './errors'
import { isStr } from './is_type'
import { RouteResponse } from './route'

const parseCslHeader = (ctx: Context, name: string) => {
  const header = ctx.header(name)

  if (!isStr(header)) {
    throw new BadRequestError(`invalid '${name}' header`)
  }

  return header
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
}

export function handleCorsRequest(ctx: Context): RouteResponse {
  const origin = ctx.header('origin')
  if (origin !== 'https://tests.kibana.dev') {
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
