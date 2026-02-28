import { getCurrentComponent } from "./newState";

export function newRef(initialValue = null) {
  const component = getCurrentComponent();
  if (!component) {
    throw new Error("newRef deve ser chamado dentro de um componente funcional.");
  }

  const index = component.__hookIndex++;
  if (component.__hooks[index] === undefined) {
    component.__hooks[index] = { current: initialValue };
  }

  return component.__hooks[index];
}