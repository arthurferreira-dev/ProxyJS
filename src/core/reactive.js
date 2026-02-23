let activeEffect = null;
const targetMap = new WeakMap();

const effectStack = [];

export function effect(fn) {
  const run = () => {
    effectStack.push(run);
    activeEffect = run;
    try {
      fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1] ?? null;
    }
  };
  run();
  return run;
}

export function reactive(target) {
  return new Proxy(target, {
    get(obj, key) {
      const current = effectStack[effectStack.length - 1];
      if (current) {
        let depsMap = targetMap.get(obj);
        if (!depsMap) {
          depsMap = new Map();
          targetMap.set(obj, depsMap);
        }
        let dep = depsMap.get(key);
        if (!dep) {
          dep = new Set();
          depsMap.set(key, dep);
        }
        dep.add(current);
      }
      return obj[key];
    },
    set(obj, key, value) {
      obj[key] = value;
      const depsMap = targetMap.get(obj);
      if (!depsMap) return true;
      const dep = depsMap.get(key);
      if (!dep) return true;
      [...dep].forEach((eff) => eff());
      return true;
    },
  });
}