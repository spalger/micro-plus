import { Readable } from 'stream'

// @ts-ignore untyped simple module
import * as readOnlyStream from 'read-only-stream'

export function makeReadOnlyStream(stream: Readable): Readable {
  return readOnlyStream(stream)
}
