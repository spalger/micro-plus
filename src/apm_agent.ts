import { IncomingMessage, ServerResponse } from 'http'

import { ReqContext } from './req_context'

export interface ApmAgent {
  onRequest(request: IncomingMessage, response: ServerResponse): void
  onRequestParsed(
    ctx: ReqContext,
    request: IncomingMessage,
    response: ServerResponse,
  ): void
  onResponse(
    resp: any,
    ctx: ReqContext,
    request: IncomingMessage,
    response: ServerResponse,
  ): void
  onError(
    error: any,
    ctx: ReqContext | undefined,
    request: IncomingMessage,
    response: ServerResponse,
  ): void
  beforeSend(
    request: IncomingMessage,
    response: ServerResponse,
    status: number,
    body: any,
  ): void
}
