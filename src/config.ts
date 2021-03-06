export function getConfigVar(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} config missing`)
  }
  return value
}
