import Proxy, {
  html,
  navigate,
  newState,
  registerComponent,
} from "./src/index.js";

function Card({ title, children }) {
  return html.div(html.h2(title), ...children);
}
registerComponent("Card", Card);

export function App() {
  const [count, setCount] = newState(0);
  const [bool, setBool] = newState(false);
  const [text, setText] = newState("Hello World");

  return Proxy.fragment(
    html.div(
      { class: "flex flex-col items-center gap-3" },
      html.h1("Hello ProxyJS!"),
      html.button(
        { onClick: () => setCount(count() + 1), class: "btn bg-blue-500" },
        "Incrementar",
      ),
      html.p(count),
      html.button({ onClick: () => setBool(!bool()) }, "Toggle Boolean"),
      html.p(bool),
      html.button(
        {
          onClick: () =>
            setText(
              text() === "Hello World" ? "Hello ProxyJS!" : "Hello World",
            ),
        },
        "Toggle Text",
      ),
      html.p(text),
      html.Card({ title: "Título" }, html.p("Conteúdo")),
      html.button(
        {
          onClick: () => navigate("/teste"),
        },
        "Ir para Teste",
      ),
    ),
  );
}

export function TesteApp() {
  return Proxy.fragment(html.h1("Teste App"));
}
