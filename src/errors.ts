import { RouteResponse } from './route'

export class ServerError extends Error {
  public statusCode = 500
  public code = 'unknown'
  public static defaultMessage = 'Server Error'

  public constructor(message?: string, public readonly originalError?: Error) {
    super(message || (originalError && originalError.message))

    if (!this.message) {
      this.message = (this.constructor as typeof ServerError).defaultMessage
    }

    Error.captureStackTrace(this, this.constructor)
  }

  public toResponse(): RouteResponse {
    return {
      status: this.statusCode,
      body: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        status_code: this.statusCode,
        code: this.code,
        message: this.message,
      },
    }
  }
}

export class NotFoundError extends ServerError {
  public static defaultMessage = 'Not Found'
  public statusCode = 404
  public code = 'not_found'
}

export class UnauthorizedError extends ServerError {
  public static defaultMessage = 'Unauthorized'
  public statusCode = 401
  public code = 'unauthorized'
}

export class BadRequestError extends ServerError {
  public static defaultMessage = 'Bad Request'
  public statusCode = 400
  public code = 'bad_request'
}

export type RespError =
  | ServerError
  | NotFoundError
  | UnauthorizedError
  | BadRequestError

export const isRespError = (x: any): x is RespError =>
  x instanceof ServerError ||
  x instanceof NotFoundError ||
  x instanceof UnauthorizedError ||
  x instanceof BadRequestError

export const toRespError = (error: Error) =>
  exports.isRespError(error) ? error : new ServerError(error.message, error)
