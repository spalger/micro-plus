import { Readable } from 'stream'

import { StubReqContext } from './stub_req_context'

it('exposes pathname', () => {
  expect(new StubReqContext('/foo/bar?baz=1&box=yes')).toHaveProperty(
    'pathname',
    '/foo/bar',
  )
})

it('exposes query', () => {
  expect(new StubReqContext('/?baz=1&box=yes')).toHaveProperty('query', {
    baz: '1',
    box: 'yes',
  })
})

it('uppercases method', () => {
  expect(new StubReqContext('/', { method: 'post' })).toHaveProperty(
    'method',
    'POST',
  )
})

it('exposes stub body', async () => {
  const stub = new StubReqContext('/', { stubBody: '{"foo": "bar"}' })

  await expect(stub.readBodyAsText()).resolves.toMatchInlineSnapshot(
    `"{\\"foo\\": \\"bar\\"}"`,
  )
  await expect(stub.readBodyAsJson()).resolves.toMatchInlineSnapshot(`
                        Object {
                          "foo": "bar",
                        }
                  `)
  const stream = stub.readBodyAsStream()
  expect(stream).toBeInstanceOf(Readable)

  let buffer = ''
  stream.on('data', chunk => (buffer = buffer + chunk))
  await new Promise(resolve => stream.once('end', resolve))

  expect(buffer).toMatchInlineSnapshot(`"{\\"foo\\": \\"bar\\"}"`)
})

it('exposes headers', () => {
  const stub = new StubReqContext('/', {
    headers: {
      'Content-Length': '10',
      foo: 'bar',
    },
  })

  expect(stub.header('foo')).toBe('bar')
  expect(stub.header('content-LENGTH')).toBe('10')
})
