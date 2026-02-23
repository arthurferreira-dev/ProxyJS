export { reactive, effect } from "./core/reactive.js";
export { createStyle } from "./core/createStyle.js";
export { computed } from "./core/computed.js";
export { ErrorBoundary } from "./core/errorBoundary.js";
export { createRoot, renderToRoot } from "./core/createRoot.js";
export { createElement, Fragment } from "./dom/createElement.js";
export { default as html, registerComponent } from "./dom/html.js";
export {
  createRouter,
  navigate,
  newNavigate,
  currentPath,
} from "./hooks/newNavigate.js";
export { newState } from "./hooks/newState.js";

import { createElement, Fragment } from "./dom/createElement.js";
import { ErrorBoundary } from "./core/errorBoundary.js";
import { registerComponent } from "./dom/html.js";

registerComponent("ErrorBoundary", ErrorBoundary);

const ProxyJS = {
  fragment: (...children) => createElement(Fragment, {}, ...children),
};

export default ProxyJS;