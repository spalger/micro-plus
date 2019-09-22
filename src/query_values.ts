import { ReqContext } from './req_context'
import { isStr } from './is_type'
import { BadRequestError } from './errors'

export class SearchParamError extends BadRequestError {
  public constructor(name: string, reason: string) {
    super(`invalid search param [${name}]: ${reason}`)
  }
}

export function parseBoolQueryValue(query: ReqContext['query'], name: string) {
  if (!query.hasOwnProperty(name)) {
    return false
  }

  const raw = query[name]

  if (raw !== undefined && !isStr(raw)) {
    throw new SearchParamError(name, 'expected a single value')
  }

  if (raw === 'false' || raw === '0') {
    return false
  }
  if (raw === undefined || raw === 'true' || raw === '1') {
    return true
  }

  throw new SearchParamError(name, 'expected true, 1, false, or 0')
}

export function parseIntQueryValue(
  query: ReqContext['query'],
  name: string,
  defaultValue: number | undefined = undefined,
) {
  if (!query.hasOwnProperty(name)) {
    return defaultValue
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

type ValueOf<T> = T extends readonly (infer x)[] ? x : never

export function parseEnumQueryValue<T extends readonly string[]>(
  query: ReqContext['query'],
  name: string,
  options: T,
  defaultValue: ValueOf<T> | undefined = undefined,
) {
  if (!query.hasOwnProperty(name)) {
    return defaultValue
  }

  const raw = query[name]

  if (!isStr(raw)) {
    throw new SearchParamError(name, 'expected a single value')
  }

  if (!options.includes(raw)) {
    throw new SearchParamError(
      name,
      `invalid option [${raw}], expected one of "${options.join('","')}"`,
    )
  }

  return raw
}
