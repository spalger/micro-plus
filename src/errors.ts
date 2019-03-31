import { RouteResponse } from './route'

abstract class RespError extends Error {
  public static defaults: {
    message: string
    status: number
    code: string
  }

  public readonly status: number
  public readonly code: string

  public constructor(message?: string, public readonly originalError?: Error) {
    super(message || (originalError && originalError.message))

    const defaults = (this.constructor as typeof RespError).defaults

    this.message = this.message || defaults.message
    this.status = defaults.status
    this.code = defaults.code
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
  public static defaults = {
    message: 'Bad Request',
    status: 400,
    code: 'bad_request',
  }
}

export class UnauthorizedError extends RespError {
  public static defaults = {
    message: 'Unauthorized',
    status: 401,
    code: 'unauthorized',
  }
}

export class NotFoundError extends RespError {
  public static defaults = {
    message: 'Not Found',
    status: 404,
    code: 'not_found',
  }
}

export class ServerError extends RespError {
  public static defaults = {
    message: 'Server Error',
    status: 500,
    code: 'server',
  }
}

export const isRespError = (x: any): x is RespError => x instanceof RespError

export const toRespError = (error: Error) =>
  isRespError(error) ? error : new ServerError(error.message, error)
