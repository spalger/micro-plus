import * as jsonwebtoken from 'jsonwebtoken'
import { BadRequestError } from './errors'
import { isStr } from './is_type'
import { Context } from './context'

export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR
export const JWT_ALGORITHM = 'HS256'

export function sign(payload: object, secret: string) {
  return jsonwebtoken.sign({ ...payload }, secret, {
    algorithm: JWT_ALGORITHM,
  })
}

export function verify(token: string, secret: string) {
  return jsonwebtoken.verify(token, secret, {
    algorithms: [JWT_ALGORITHM],
  })
}

export function assertValidJwt(ctx: Context, secret: string) {
  const header = ctx.header('authorization')
  if (!isStr(header)) {
    throw new BadRequestError('missing authroization header')
  }

  const [type, ...tokenBits] = header.split(' ')
  if (type !== 'jwt') {
    throw new BadRequestError('invalid authorization type')
  }

  try {
    verify(tokenBits.join(' '), secret)
  } catch (error) {
    throw new BadRequestError(`invalid jwt: ${error.message}`)
  }
}
