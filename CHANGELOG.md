# changelog

## 0.2.0

- Use query naming instead of "search param" naming
- Support default values in query param getters

## 0.1.0

- Dropped support for `ctx.url`, only expose `ctx.pathname` and `ctx.query` so that we no longer require `x-forwarded*` headers.
