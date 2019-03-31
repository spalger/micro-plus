import { ReqContext } from './req_context'
import { isStr } from './is_type'
import { BadRequestError } from './errors'

export class SearchParamError extends BadRequestError {
  public constructor(name: string, reason: string) {
    super(`invalid search param [${name}]: ${reason}`)
  }
}

export function parseBoolSearchParam(query: ReqContext['query'], name: string) {
  if (!query.hasOwnProperty(name)) {
    return false
  }

  const param = query[name]
  if (param === 'false') {
    return false
  }
  if (param === 'true') {
    return true
  }

  throw new SearchParamError(name, 'expected true or false')
}

export function parseIntSearchParam(query: ReqContext['query'], name: string) {
  if (!query.hasOwnProperty(name)) {
    return undefined
  }

  const raw = query[name]

  if (!isStr(raw)) {
    throw new SearchParamError(name, 'expected a single value')
  }

  if (!/^\d+$/.test(raw)) {
    throw new SearchParamError(name, 'expected an integer')
  }

  return parseFloat(raw)
}

export function parseOptionSearchParam(
  query: ReqContext['query'],
  name: string,
  options: string[],
) {
  if (!query.hasOwnProperty(name)) {
    return undefined
  }

  const raw = query[name]

  if (!isStr(raw)) {
    throw new SearchParamError(name, 'expected a single value')
  }

  if (options.includes(raw)) {
    throw new SearchParamError(name, `expected one of "${options.join('","')}"`)
  }

  return raw
}
