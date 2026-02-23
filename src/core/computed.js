import { reactive, effect } from "./reactive.js";

export function computed(fn) {
  const state = reactive({ value: undefined });

  effect(() => {
    state.value = fn();
  });

  return () => state.value;
}