# @spalger/micro-plus

A couple helpers for working with [`micro`](https://github.com/zeit/micro)

## Routing

### `createMicroHandler`

Create a micro handler.

Signature:
```ts
interface Options {
  routes: Route[],

  /**
   * global request handler that can return a response to take over requests
   */
  onRequest?: (ctx: ReqContext) => Promise<RouteResponse | void> | RouteResponse | void,

  /**
   * Array of exact origin header values that will authorize cors pre-flight requests
   */
  corsAllowOrigins?: string[]

  /**
   * Object with methods that will be called while a request is processed, see `./src/hooks.ts`
   */
  hooks?: Hooks
}

function createMicroHandler(options: Options | Route[]): (req: IncomingMessage, res: ServerResponse) => void
```

Example:
```js
import { createMicroHandler, assertValidJwtAuthrorization, getConfigVar } from '@spalger/micro-plus'

module.exports = createMicroHandler({
  onRequest(ctx) {
    assertValidJwtAuthrorization(ctx, getConfigVar('JWT_SECRET'))
  },

  routes: [
    new Route('GET', '/foo', (ctx) => ({
      status: 200,
      body: 'bar'
    }))
  ],
})
```


### `Route`

Signature:
```ts
new Route(
  // valid request method for this route
  method: string,
  // path to match against requests
  path: string,
  // function to execute when requests are received
  handler: (ctx: ReqContext) => Promise<RouteResponse> | RouteResponse,
)
```

Defines a function that will be called when requests with a matching method + path are received. The handler function recives a [`ReqContext`](#reqcontext) object and must return a [`RouteResponse`](#routeresponse), or a promise for a [`RouteResponse`](#routeresponse). Paths are matched exactly, but a single trailing slash will be stripped from both route and request paths before matching. Paths can't contain variables, use query string params instead.


### `createNextHandler`

Create a next.js handler, which is just a microhandler that takes `NextRoute` objects instead. `NextRoute` objects are just `Route` objects that don't specify their route, since next.js routes are just micro routes with their path defined by the file-system instead.

Signature:
```ts
interface Options {
  routes: NextRoute[],

  /**
   * global request handler that can return a response to take over requests
   */
  onRequest?: (ctx: ReqContext) => Promise<RouteResponse | void> | RouteResponse | void,

  /**
   * Array of exact origin header values that will authorize cors pre-flight requests
   */
  corsAllowOrigins?: string[]

  /**
   * Object with methods that will be called while a request is processed, see `./src/hooks.ts`
   */
  hooks?: Hooks
}

function createNextHandler(options: Options | NextRoute[]): (req: IncomingMessage, res: ServerResponse) => void
```

Example:
```js
import { createNextHandler, assertValidJwtAuthrorization, getConfigVar } from '@spalger/micro-plus'

module.exports = createNextHandler({
  onRequest(ctx) {
    assertValidJwtAuthrorization(ctx, getConfigVar('JWT_SECRET'))
  },

  routes: [
    new NextRoute('GET', (ctx) => ({
      status: 200,
      body: 'bar'
    }))
  ],
})
```


### `NextRoute`

Signature:
```ts
new NextRoute(
  // valid request method for this route
  method: string,
  // function to execute when requests are received
  handler: (ctx: ReqContext) => Promise<RouteResponse> | RouteResponse,
)
```

Simplified version of `Route` for use with [next.js dynamic routing](https://nextjs.org/docs#dynamic-routing).


### `ReqContext`

Interface:
```ts
interface ReqContext {
  /**
   * pathname of the request, starts with a /, trailing slashes are trimmed off,
   * does not include the query string
   */
  readonly pathname: string

  /**
   * parsed query string of the request
   */
  readonly query: Readonly<Record<string, string | ReadonlyArray<string> | undefined>>

  /**
   * http method of the request
   */
  readonly method: string

  /**
   * get a header from the request
   */
  header(name: string): string | string[] | undefined

  /**
   * read the request body and parse it as JSON
   */
  readBodyAsJson(): unknown

  /**
   * read the request body as a string
   */
  readBodyAsText(): string

  /**
   * get a readable stream of the request body content
   */
  readBodyAsStream(): Readable
}
```

### `RouteResponse`

Interface:
```ts
interface RouteResponse {
  /**
   * http status code of the response
   */
  status?: number

  /**
   * map of headers to send with the response
   */
  headers?: {
    [name: string]: string
  }

  /**
   * the response body
   *  - object/number send json with default application/json content-type
   *  - stream/buffer will send default application/octet-stream content-type
   */
  body?: Readable | Buffer | object | number | string
}
```

## Errors

Routes can throw special error object to trigger error responses, similar to [boom](https://github.com/hapijs/boom). Each error class accepts two optional constructor arguments:

```ts
new ErrorClass(message?: string, originalError?: Error)
```

Error objects will be automatically transformed into HTTP responses in the format:

```json
{
  "status_code": <number>,
  "code": <string>,
  "message" <string>
}
```

Error classes:

| name | status | code | default message |
| --- | --- | --- | --- |
| `BadRequestError` | 400 | 'bad_request' | 'Bad Request' |
| `UnauthorizedError` | 401 | 'unauthorized' | 'Unauthorized' |
| `NotFoundError` | 404 | 'not_found' | 'Not found' |
| `ServerError` | 500 | 'unknown' | 'Server Error' |

example:
```js
import { Route, SearchParamError } from '@spalger/micro-plus'

export const route = new Route('GET', '/echo', async (ctx) => {
  if (!ctx.query.input) {
    throw new SearchParamError('input', 'requires a value')
  }

  return {
    body: ctx.query.input
  }
})
```

## Config


### `getConfigVar(name: string)`

A helper for reading config values from `process.env` is included, which throws if the environment variable is not set.

> TODO: Read vars from a local config file once there is a local development story

## JWT

### `makeJwt({ payload: object, expiresIn: number, secret: string })`

Sign a payload object to create a [JWT](https://jwt.io) that expires in `expiresIn` milliseconds. For convenience `SECOND`, `MINUTE`, `HOUR`, and `DAY` constants are exposed for defining `expiresIn`.

Example:
```js
import { DAY, makeJwt, getConfigVar } from '@spalger/micro-plus'

const jwt = makeJwt({
  payload: { uid },
  expiresIn: 7 * DAY,
  secret: getConfigVar('JWT_SECRET')
})
```

### `parseJwt(token: string, secret: string)`

Parse the payload from a JWT, throws if the JWT is invalid or expired.

### `assertValidJwtAuthrorization(ctx: ReqContext, secret: string)`

Parse the Authorization header from the request and verify that it matches `jwt <token>` and that the token is valid and not expired.

### `getJwtPayload(ctx: ReqContext)`

Get the parsed JWT payload from a request context that was previously validated with `assertValidJwtAuthrorization()`. If the request was not successfully validated with `assertValidJwtAuthrorization()` then then `getJwtPayload()` will throw.


## Search Params

### `SearchParamError(name: string, reason: string)`

Specialized verison of `BadRequestError()` that formats errors in search param validation. Reuse to throw consistently formatted validation errors.

### `getBoolQueryValue(query: ReqContext['query'], name: string)`

Parse the query param `name` as a boolean, defaults to `false`, returns `true` if query param is present but has no value, throws if value is not `true`, `1`, `false` or `0`.

### `getIntQueryValue(query: ReqContext['query'], name: string, defaultValue: number | undefined)`

Parse the query param `name` as an integer, defaults to `undefined`, throws if value does not match `^\d+$`.

### `getEnumQueryValue(query: ReqContext['query'], name: string, options: string[], defaultValue: string | undefined)`

Parse the query param `name` as one of the supplied options, returns `undefined` or `defaultValue` if query param is not preset, throws if value is not in the list of options.
