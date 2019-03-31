import { URLSearchParams } from 'url'
import { BadRequestError } from './errors'

export function parseBooleanSearchParam(params: URLSearchParams, name: string) {
  if (!params.has(name)) {
    return false
  }

  const param = params.get(name)
  if (param === 'false') {
    return false
  }
  if (param === 'true') {
    return true
  }

  throw new BadRequestError(
    `invalid search param '${name}': expected 'true' or 'false'`,
  )
}
