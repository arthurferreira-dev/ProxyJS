import { reactive } from "../core/reactive.js";

function normalizePath() {
  const hash = window.location.hash;
  if (hash.startsWith("#/")) return hash.slice(1);
  if (hash.startsWith("#")) return "/" + hash.slice(1);
  return "/";
}

const state = reactive({
  path: normalizePath(),
});

window.addEventListener("hashchange", () => {
  state.path = normalizePath();
});

function navigate(path) {
  window.location.hash = "#" + path;
  state.path = path;
}

function matchRoute(pattern, path) {
  const paramNames = [];
  const regexStr = pattern
    .replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    })
    .replace(/\*/g, ".*");

  const regex = new RegExp(`^${regexStr}$`);
  const match = path.match(regex);
  if (!match) return null;

  const params = {};
  paramNames.forEach((name, i) => {
    params[name] = match[i + 1];
  });
  return params;
}

export function createRouter(routes) {
  return function Router() {
    const path = state.path;
    console.log("Router executou, path:", path);
    for (const route of routes) {
      const params = matchRoute(route.path, path);
      if (params !== null) {
        return route.component({ params });
      }
    }
    return null;
  };
}

export { navigate };

export function newNavigate() {
  return navigate;
}

export function currentPath() {
  return state.path;
}