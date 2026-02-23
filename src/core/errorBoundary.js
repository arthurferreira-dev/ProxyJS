import { createElement } from "../dom/createElement.js";

export function ErrorBoundary({ fallback, children }) {
  return createElement("div", { __errorBoundary: true, __fallback: fallback }, ...children);
}