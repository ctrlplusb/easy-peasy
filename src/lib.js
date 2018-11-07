export const isStateObject = x =>
  x !== null && typeof x === 'object' && !Array.isArray(x)
