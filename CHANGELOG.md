# changelog

## 0.1.0

- Dropped support for `ctx.url`, only expose `ctx.pathname` and `ctx.query` so that we no longer require `x-forwarded*` headers.
