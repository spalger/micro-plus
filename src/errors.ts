import { RouteResponse } from './route'

export abstract class RespError extends Error {
  public static readonly MESSAGE: string
  public static readonly STATUS: number
  public static readonly CODE: string

  public readonly status: number
  public readonly code: string

  public constructor(message?: string, public readonly originalError?: Error) {
    super(message || (originalError && originalError.message))

    const constructor = this.constructor as typeof RespError

    this.message = this.message || constructor.MESSAGE
    this.status = constructor.STATUS
    this.code = constructor.CODE
    Error.captureStackTrace(this, this.constructor)
  }

  public toResponse(): RouteResponse {
    return {
      status: this.status,
      body: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        status_code: this.status,
        code: this.code,
        message: this.message,
      },
    }
  }
}

export class BadRequestError extends RespError {
  public static readonly MESSAGE = 'Bad Request'
  public static readonly STATUS = 400
  public static readonly CODE = 'bad_request'
}

export class UnauthorizedError extends RespError {
  public static readonly MESSAGE = 'Unauthorized'
  public static readonly STATUS = 401
  public static readonly CODE = 'unauthorized'
}

export class NotFoundError extends RespError {
  public static readonly MESSAGE = 'Not Found'
  public static readonly STATUS = 404
  public static readonly CODE = 'not_found'
}

export class ServerError extends RespError {
  public static readonly MESSAGE = 'Server Error'
  public static readonly STATUS = 500
  public static readonly CODE = 'server'
}

export const isRespError = (x: any): x is RespError => x instanceof RespError

export const toRespError = (error: Error) =>
  isRespError(error) ? error : new ServerError(error.message, error)
