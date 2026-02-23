import { createElement } from "./createElement.js";

const components = {};

function registerComponent(name, component) {
  components[name] = component;
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function base(type, ...args) {
  let props = {};
  let children = [];

  if (isObject(args[0])) {
    props = args[0];
    children = args.slice(1);
  } else {
    children = args;
  }

  return createElement(type, props, ...children);
}

const html = new Proxy({}, {
  get(_, tag) {
    return (...args) => {
      const type = components[tag] || tag;
      return base(type, ...args);
    };
  }
});

export default html;
export { registerComponent };