import { ReqContext } from './req_context'

describe('pathname', () => {
  it('strips trailing slashes', () => {
    const ctx = new ReqContext('/foo/bar/?a=b', 'GET', {}, undefined as any)
    expect(ctx.pathname).toBe('/foo/bar')
  })

  it('ensures pathname starts with a slash', () => {
    const ctx = new ReqContext('foo/bar/?a=b', 'GET', {}, undefined as any)
    expect(ctx.pathname).toBe('/foo/bar')
  })
})

describe('query', () => {
  it('parses query string values', () => {
    const ctx = new ReqContext('foo/bar/?a=b', 'GET', {}, undefined as any)
    expect(ctx.query).toMatchInlineSnapshot(`
      Object {
        "a": "b",
      }
    `)
  })

  it('parses multiple query string values', () => {
    const ctx = new ReqContext('foo/bar/?a=b&a=c', 'GET', {}, undefined as any)
    expect(ctx.query).toMatchInlineSnapshot(`
      Object {
        "a": Array [
          "b",
          "c",
        ],
      }
    `)
  })

  it('makes all values readonly', () => {
    const ctx = new ReqContext('foo/bar/?a=b&a=c', 'GET', {}, undefined as any)
    expect(
      () => ((ctx as any).query.a = 'x'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot assign to read only property 'a' of object '#<Object>'"`,
    )

    expect(() =>
      (ctx as any).query.a.push('x'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot add property 2, object is not extensible"`,
    )
  })
})

describe('method', () => {
  it('is always capitalized', () => {
    const ctx = new ReqContext('foo/bar/?a=b&a=c', 'get', {}, undefined as any)
    expect(ctx.method).toBe('GET')
  })
})
