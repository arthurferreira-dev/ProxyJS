import { App, TesteApp } from "./app.js";
import { createRoot, createRouter } from "./src/index.js";

const root = createRoot("#proxy");

const router = createRouter([
  { path: "/", component: App },
  { path: "/teste", component: TesteApp },
]);

root.render(router);