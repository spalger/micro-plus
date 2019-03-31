import { BadRequestError } from './errors'
import { Context } from './context'

export function parseBooleanSearchParam(query: Context['query'], name: string) {
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

  throw new BadRequestError(
    `invalid search param '${name}': expected 'true' or 'false'`,
  )
}
