import { URL } from 'url'

export type AnyFn = (...args: any[]) => any
export type MaybePromise<T> = Promise<T> | T

export const isArr = (x: any): x is any[] => Array.isArray(x)

export const isObj = (x: any): x is object => x && typeof x === 'object'

export const isStr = (x: any): x is string => typeof x === 'string'

export const isFn = (x: any): x is AnyFn => typeof x === 'function'

export const isInt = (x: any): x is number => Number.isInteger(x)

export const isAbsoluteUrl = (x: any): x is string => {
  try {
    const url = new URL(x)
    return !!(url.protocol && url.hostname && url.pathname)
  } catch (error) {
    return false
  }
}
