import { ReqContext } from './req_context'
import { isStr } from './is_type'
import { BadRequestError } from './errors'

export class SearchParamError extends BadRequestError {
  public constructor(name: string, reason: string) {
    super(`invalid search param [${name}]: ${reason}`)
  }
}

export function parseBooleanSearchParam(
  query: ReqContext['query'],
  name: string,
) {
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
  const value = isStr(raw) && parseFloat(raw)

  if (!Number.isInteger(value as any)) {
    throw new SearchParamError(name, 'expected an integer')
  }

  return value
}
