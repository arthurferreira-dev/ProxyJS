import { reactive } from "../core/reactive.js";

let currentComponent = null;

export function setCurrentComponent(component) {
  currentComponent = component;
}

export function getCurrentComponent() {
  return currentComponent;
}
export function newState(initial) {
  const component = currentComponent;
  if (!component) {
    throw new Error("newState deve ser chamado dentro de um componente funcional.");
  }

  const index = component.__hookIndex++;
  if (component.__hooks[index] === undefined) {
    const state = reactive({ value: initial });
    component.__hooks[index] = state;
  }

  const state = component.__hooks[index];
  const get = () => state.value;
  const set = (newValue) => { state.value = newValue; };
  return [get, set];
}