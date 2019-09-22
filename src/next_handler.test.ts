import * as Shot from '@hapi/shot'

import { makeNextHandler } from './next_handler'
import { NextRoute } from './next_route'

it('creates a handler function that routes by method, but not path', async () => {
  const handler: any = makeNextHandler({
    routes: [
      new NextRoute('GET', () => ({
        body: 'GET route',
      })),
      new NextRoute('POST', () => ({
        body: 'POST route',
      })),
    ],
  })

  const resp = await Shot.inject(handler, {
    method: 'GET',
    url: '/hello/world',
  })

  expect(resp.payload).toMatchInlineSnapshot(`"GET route"`)
  expect(resp.statusCode).toMatchInlineSnapshot(`200`)

  const resp2 = await Shot.inject(handler, {
    method: 'POST',
    url: '/hello/world/2',
  })

  expect(resp2.payload).toMatchInlineSnapshot(`"POST route"`)
  expect(resp2.statusCode).toMatchInlineSnapshot(`200`)

  const resp3 = await Shot.inject(handler, {
    method: 'DELETE',
    url: '/hello/world/3',
  })

  expect(resp3.payload).toMatchInlineSnapshot(
    `"{\\"status_code\\":404,\\"code\\":\\"not_found\\",\\"message\\":\\"Not Found\\"}"`,
  )
  expect(resp3.statusCode).toMatchInlineSnapshot(`404`)
})
