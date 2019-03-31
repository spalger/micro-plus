import * as jsonwebtoken from 'jsonwebtoken'
import { BadRequestError } from './errors'
import { isStr } from './is_type'
import { ReqContext } from './req_context'

export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR
export const JWT_ALGORITHM = 'HS256'

export function makeJwt({
  payload,
  expiresIn,
  secret,
}: {
  payload: object
  expiresIn: number
  secret: string
}) {
  return jsonwebtoken.sign({ ...payload }, secret, {
    algorithm: JWT_ALGORITHM,
    expiresIn,
  })
}

export function parseJwt(token: string, secret: string) {
  return jsonwebtoken.verify(token, secret, {
    algorithms: [JWT_ALGORITHM],
  })
}

export function assertValidJwtAuthrorization(ctx: ReqContext, secret: string) {
  const header = ctx.header('authorization')
  if (!isStr(header)) {
    throw new BadRequestError('missing authroization header')
  }

  const [type, ...tokenBits] = header.split(' ')
  if (type !== 'jwt') {
    throw new BadRequestError('invalid authorization type')
  }

  try {
    parseJwt(tokenBits.join(' '), secret)
  } catch (error) {
    throw new BadRequestError(`invalid jwt: ${error.message}`)
  }
}
