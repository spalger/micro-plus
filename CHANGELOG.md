# changelog

## 0.4

- added repo/author info
- extract [next.js](https://nextjs.org) helper to [@spalger/next-plus](https://github.com/spalger/next-plus)

## 0.3.1

- Expose request headers at `ctx.headers`

## 0.3.0

- Trim trailing slashes from `ctx.pathname` if it's found

## 0.2.1

- Add [next.js](https://nextjs.org) handler/routing support

## 0.2.0

- Use query naming instead of "search param" naming
- Support default values in query param getters

## 0.1.0

- Dropped support for `ctx.url`, only expose `ctx.pathname` and `ctx.query` so that we no longer require `x-forwarded*` headers.
