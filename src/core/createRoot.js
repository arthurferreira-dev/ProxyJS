import { render } from "../dom/render.js";
import { effect } from "./reactive.js";
import { isFunction } from "../utils/is.js";
import { setCurrentComponent } from "../hooks/newState.js";

export function createRoot(container) {
  const el =
    typeof container === "string"
      ? document.querySelector(container)
      : container;
  if (!el) throw new Error("Root container not found!");
  return {
    render(component) {
      const instance = { __hooks: [], __hookIndex: 0 };
      effect(() => {
        instance.__hookIndex = 0;
        setCurrentComponent(instance);
        const vnode = isFunction(component) ? component() : component;
        setCurrentComponent(null);
        render(vnode, el);
      });
    },
  };
}

export function renderToRoot(component, container) {
  createRoot(container).render(component);
}