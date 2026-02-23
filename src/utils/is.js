export function isFunction(value) {
  return typeof value === "function";
}

export function isObject(value) {
  return value !== null && typeof value === "object";
}

export function isPrimitive(value) {
  return typeof value === "string" || typeof value === "number";
}