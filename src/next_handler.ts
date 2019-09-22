import { NextRoute } from './next_route'
import { CreateMicroHandlerOptions, createMicroHandler } from './micro_handler'

interface CreateNextHandlerOptions extends CreateMicroHandlerOptions {
  routes: NextRoute[]
}

export function makeNextHandler(options: CreateNextHandlerOptions) {
  return createMicroHandler(options)
}
