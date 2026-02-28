import { effect, reactive } from "../core/reactive";
import { getCurrentComponent } from "./newState";

export function newMemo(fn) {
  const component = getCurrentComponent();
  if (!component) {
    throw new Error("newMemo deve ser chamado dentro de um componente funcional.");
  }

  const index = component.__hookIndex++;
  if (component.__hooks[index] === undefined) {
    const state = reactive({ value: undefined });
    effect(() => {
      state.value = fn();
    });
    component.__hooks[index] = state;
  }

  const state = component.__hooks[index];
  return () => state.value;
}