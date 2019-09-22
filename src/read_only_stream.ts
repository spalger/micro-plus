import { Readable } from 'stream'

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore untyped simple module
import * as readOnlyStream from 'read-only-stream'

export function makeReadOnlyStream(stream: Readable): Readable {
  return readOnlyStream(stream)
}
