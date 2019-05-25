import { IncomingMessage, ServerResponse } from 'http'

import { ReqContext } from './req_context'

type NonOptArgs<T> = T extends ((...args: infer X) => any | undefined)
  ? X
  : never

export interface Hooks {
  onRequest?(request: IncomingMessage, response: ServerResponse): void
  onRequestParsed?(
    ctx: ReqContext,
    request: IncomingMessage,
    response: ServerResponse,
  ): void
  onResponse?(
    resp: any,
    ctx: ReqContext,
    request: IncomingMessage,
    response: ServerResponse,
  ): void
  onError?(
    error: any,
    ctx: ReqContext | undefined,
    request: IncomingMessage,
    response: ServerResponse,
  ): void
  beforeSend?(
    request: IncomingMessage,
    response: ServerResponse,
    body: any,
  ): void
}

export class ParsedHooks {
  public constructor(private hooks: Hooks = {}) {}
  public onRequest(...args: NonOptArgs<Hooks['onRequest']>): void {
    if (this.hooks.onRequest) {
      this.hooks.onRequest(...args)
    }
  }
  public onRequestParsed(...args: NonOptArgs<Hooks['onRequestParsed']>): void {
    if (this.hooks.onRequestParsed) {
      this.hooks.onRequestParsed(...args)
    }
  }
  public onResponse(...args: NonOptArgs<Hooks['onResponse']>): void {
    if (this.hooks.onResponse) {
      this.hooks.onResponse(...args)
    }
  }
  public onError(...args: NonOptArgs<Hooks['onError']>): void {
    if (this.hooks.onError) {
      this.hooks.onError(...args)
    }
  }
  public beforeSend(...args: NonOptArgs<Hooks['beforeSend']>): void {
    if (this.hooks.beforeSend) {
      this.hooks.beforeSend(...args)
    }
  }
}
