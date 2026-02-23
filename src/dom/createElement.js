export const Fragment = Symbol("Fragment");

export function createElement(type, props = {}, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat(Infinity).filter((c) => c != null),
  };
}