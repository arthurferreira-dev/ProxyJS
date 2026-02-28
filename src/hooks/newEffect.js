import { effect } from "../core/reactive.js";
import { getCurrentComponent } from "./newState.js";

export function newEffect(fn) {
  const component = getCurrentComponent();
  if (!component) {
    throw new Error("newEffect deve ser chamado dentro de um componente funcional.");
  }

  const index = component.__hookIndex++;
  if (component.__hooks[index] === undefined) {
    component.__hooks[index] = { cleanup: null };
    effect(() => {
      if (component.__hooks[index].cleanup) {
        component.__hooks[index].cleanup();
      }
      component.__hooks[index].cleanup = fn() || null;
    });
  }
}