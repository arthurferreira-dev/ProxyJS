# ProxyJS

<img src="https://img.shields.io/badge/Version-0.1.0%20(Beta)-6320d6" alt="Version - Badge">
<img alt="NPM Version" src="https://img.shields.io/npm/v/proxyjs-web">
<svg xmlns="http://www.w3.org/2000/svg" width="133.5" height="28" role="img" aria-label="PROXYJSWEB"><title>PROXYJSWEB</title><g shape-rendering="crispEdges"><rect width="133.5" height="28" fill="#e05d44"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="100"><image x="9" y="7" width="14" height="14" href="data:image/svg+xml;base64,PHN2ZyBmaWxsPSJ3aGl0ZXNtb2tlIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+bnBtPC90aXRsZT48cGF0aCBkPSJNMS43NjMgMEMuNzg2IDAgMCAuNzg2IDAgMS43NjN2MjAuNDc0QzAgMjMuMjE0Ljc4NiAyNCAxLjc2MyAyNGgyMC40NzRjLjk3NyAwIDEuNzYzLS43ODYgMS43NjMtMS43NjNWMS43NjNDMjQgLjc4NiAyMy4yMTQgMCAyMi4yMzcgMHpNNS4xMyA1LjMyM2wxMy44MzcuMDE5LS4wMDkgMTMuODM2aC0zLjQ2NGwuMDEtMTAuMzgyaC0zLjQ1NkwxMi4wNCAxOS4xN0g1LjExM3oiLz48L3N2Zz4="/><text transform="scale(.1)" x="767.5" y="175" textLength="895" fill="#fff" font-weight="bold">PROXYJS-WEB</text></g></svg>

<p align="center">
  <img src="https://i.postimg.cc/2ydY08wy/proxyjs-logo-nobg.png" width="80" alt="ProxyJS logo" />
</p>

ProxyJS é uma biblioteca JavaScript reativa minimalista inspirada no Vue e no React. Ela usa `Proxy` nativo do JS para rastrear dependências automaticamente e atualizar o DOM quando o estado muda — sem compilador, sem build step obrigatório.

---

## Instalação

### Via NPM

```shell
npm install proxyjs-web
```

ProxyJS é usado diretamente via módulos ES. Basta importar do `index.js`:

```js
import Proxy, {
  html,
  newState,
  renderToRoot,
  registerComponent,
} from "./src/index.js";
```

> Certifique-se de que seu servidor serve os arquivos com MIME type correto (`text/javascript`). O Live Server do VSCode funciona bem.

---

## Estrutura de arquivos

```
src/
├── index.js
├── core/
│   ├── reactive.js
│   ├── createRoot.js
│   ├── createStyle.js
│   ├── computed.js
│   ├── errorBoundary.js
├── hooks/
│   └── newState.js
│   └── newNavigate.js
├── dom/
│   ├── createElement.js
│   ├── html.js
│   └── render.js
└── utils/
    └── is.js
```

---

## Conceitos principais

O sistema reativo é baseado em três peças: `reactive` envolve um objeto em um Proxy que rastreia leituras e dispara atualizações nas escritas. `effect` executa uma função e registra quais propriedades reativas ela leu — quando qualquer uma mudar, a função é re-executada automaticamente. `newState` é o açúcar em cima disso, retornando um getter e um setter prontos pra usar dentro de componentes.

O fluxo é: `effect` lê um reativo → leitura registra dependência → escrita dispara o `effect` novamente.

---

## Componentes

Componentes são funções que retornam vnodes. Todo estado local deve ser declarado com `newState` — que é um hook e segue as [regras de hooks](./hooks.md).

```js
function Contador() {
  const [count, setCount] = newState(0);

  return html.div(
    html.p(count),
    html.button({ onClick: () => setCount(count() + 1) }, "+"),
    html.button({ onClick: () => setCount(count() - 1) }, "-"),
  );
}
```

Dois `Contador` montados na tela terão estados completamente independentes.

---

## API

### `html`

Proxy que gera vnodes para qualquer tag HTML ou componente registrado.

```js
html.div(props?, ...children)
html.button(props?, ...children)
html.span(props?, ...children)
```

Props são passadas como primeiro argumento quando são um objeto:

```js
html.div({ class: "container", id: "app" }, "Olá mundo");
```

Eventos seguem a convenção `onClick`, `onInput`, `onChange` etc:

```js
html.button({ onClick: () => setCount(count() + 1) }, "Incrementar");
```

Filhos reativos — passe o getter diretamente sem chamar:

```js
html.p(count); // ✅ reativo — atualiza automaticamente
html.p(count()); // ❌ estático — captura o valor na criação
```

Filhos podem ser strings, números, outros vnodes ou funções getter.

---

### `Proxy.fragment(...children)`

Agrupa múltiplos elementos sem criar um wrapper no DOM. Útil quando um componente precisa retornar mais de um elemento raiz.

```js
import Proxy, { html } from "./src/index.js";

function App() {
  return Proxy.fragment(
    html.h1("Título"),
    html.p("Parágrafo"),
    html.span("Outro elemento"),
  );
}
```

> O `fragment` fica no objeto `Proxy` default para não colidir com o `Proxy` nativo do JavaScript.

---

### `renderToRoot(component, container)`

Forma simplificada de montar a aplicação.

```js
import { renderToRoot } from "./src/index.js";

renderToRoot(App, "#app");
```

`container` pode ser um seletor CSS string ou um elemento DOM direto.

---

### `createRoot(container)`

Versão explícita do `renderToRoot`, útil quando você precisa de mais controle.

```js
createRoot("#app").render(App);
```

---

### `registerComponent(name, component)`

Registra um componente para usar via `html.NomeDoComponente`.

```js
function Card({ title, children }) {
  return html.div({ class: "card" }, html.h2(title), ...children);
}

registerComponent("Card", Card);

html.Card({ title: "Meu Card" }, html.p("Conteúdo aqui"));
```

> `children` chega como array. Use spread `...children` ao passá-los para outra tag.

---

### `computed(fn)`

Valor derivado de outros reativos. Só recalcula quando as dependências mudam. Retorna um getter reativo.

```js
import { computed } from "./src/index.js";

function App() {
  const [count, setCount] = newState(0);
  const dobro = computed(() => count() * 2);

  return html.div(
    html.p(count),
    html.p(dobro),
    html.button({ onClick: () => setCount(count() + 1) }, "+"),
  );
}
```

Assim como getters do `newState`, passe o `computed` diretamente para filhos reativos sem chamar com `()`.

---

### `createStyle(css)`

Injeta CSS com escopo por componente. Gera um atributo único baseado no hash do CSS e prefixa todos os seletores com ele — os estilos não vazam para outros componentes.

```js
import { createStyle } from "./src/index.js";

function Card({ title }) {
  const scope = createStyle(`
    .card { background: white; padding: 1rem; border-radius: 8px; }
    .card h2 { font-size: 1.5rem; color: navy; }
  `);

  return html.div({ class: "card", ...scope }, html.h2(title));
}
```

Espalhe `...scope` nas props do elemento raiz. O CSS é injetado no `<head>` uma única vez, mesmo que o componente seja montado várias vezes.

---

### `html.ErrorBoundary`

Captura erros em componentes filhos e renderiza um fallback. Já vem registrado automaticamente no `html`.

```js
html.ErrorBoundary(
  { fallback: (err) => html.p(`Erro: ${err.message}`) },
  html.MeuComponente(),
);
```

Sem `fallback`, renderiza uma mensagem padrão em vermelho:

```js
html.ErrorBoundary({}, html.MeuComponente());
```

---

### `createRouter(routes)`

Cria um router client-side baseado em hash routing (`/#/rota`). Recebe um array de rotas e retorna um componente.

```js
import { createRouter, renderToRoot } from "./src/index.js";

const router = createRouter([
  { path: "/", component: Home },
  { path: "/sobre", component: Sobre },
  { path: "/user/:id", component: User },
  { path: "*", component: NotFound },
]);

renderToRoot(router, "#app");
```

Parâmetros de rota são acessados via `params`:

```js
function User({ params }) {
  return html.div(html.h1(`Usuário: ${params.id}`));
}
```

> O router usa hash routing — as URLs ficam no formato `/#/rota`. Isso funciona em qualquer servidor, incluindo o Live Server do VSCode, sem nenhuma configuração extra.

---

### `navigate(path)`

Navega para uma rota sem recarregar a página.

```js
import { navigate } from "./src/index.js";

html.button({ onClick: () => navigate("/sobre") }, "Ir para Sobre");
```

---

### `reactive(obj)`

API de baixo nível. Envolve qualquer objeto em um Proxy reativo.

```js
import { reactive, effect } from "./src/index.js";

const state = reactive({ nome: "Arthur", idade: 20 });

effect(() => {
  console.log(`${state.nome}, ${state.idade}`);
});

state.nome = "João"; // re-executa o effect automaticamente
```

Prefira `newState` para estados dentro de componentes. Use `reactive` para objetos compartilhados com múltiplas propriedades relacionadas.

---

### `effect(fn)`

Executa `fn` imediatamente e a re-executa sempre que uma dependência reativa mudar.

```js
const state = reactive({ x: 1 });

effect(() => {
  document.title = `x = ${state.x}`;
});

state.x = 42; // → document.title vira "x = 42"
```

---

## Listas com key

Use a prop `key` em listas dinâmicas para que o ProxyJS reutilize e reordene os elementos certos em vez de recriar tudo.

```js
function Lista() {
  const [items, setItems] = newState(["maçã", "banana", "laranja"]);

  return html.ul(...items().map((item) => html.li({ key: item }, item)));
}
```

Sem `key`, remover ou reordenar itens pode causar comportamentos inesperados no DOM.

---

## Exemplo completo

```js
import Proxy, {
  html,
  newState,
  renderToRoot,
  registerComponent,
  createStyle,
  computed,
  createRouter,
  navigate,
} from "./src/index.js";

function Card({ title, children }) {
  const scope = createStyle(`
    .card { background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .card h3 { margin: 0 0 0.5rem; }
  `);
  return html.div({ class: "card", ...scope }, html.h3(title), ...children);
}
registerComponent("Card", Card);

function Home() {
  const [count, setCount] = newState(0);
  const dobro = computed(() => count() * 2);

  return Proxy.fragment(
    html.h1("Home"),
    html.ErrorBoundary(
      { fallback: (err) => html.p(`Erro: ${err.message}`) },
      html.Card(
        { title: "Contador" },
        html.p(count),
        html.p(dobro),
        html.button({ onClick: () => setCount(count() + 1) }, "+"),
        html.button({ onClick: () => setCount(count() - 1) }, "-"),
      ),
    ),
    html.button({ onClick: () => navigate("/sobre") }, "Ir para Sobre"),
  );
}

function Sobre() {
  return html.div(
    html.h1("Sobre o ProxyJS"),
    html.button({ onClick: () => navigate("/") }, "Voltar"),
  );
}

function NotFound() {
  return html.div(html.h1("404 — Página não encontrada"));
}

const router = createRouter([
  { path: "/", component: Home },
  { path: "/sobre", component: Sobre },
  { path: "*", component: NotFound },
]);

renderToRoot(router, "#app");
```

## Usar o ProxyJS via cdn:

### Versão Fixa:

```javascript
import Proxy, { html, newState, renderToRoot } from "https://cdn.jsdelivr.net/gh/arthurferreira-dev/ProxyJS/src/index.js";
```

### Versão Atual:

```javascript
import Proxy, { html, newState, renderToRoot } from "https://cdn.jsdelivr.net/gh/arthurferreira-dev/ProxyJS@6a9e0a4/src/index.js"; /* Versão atual (v0.1.0-beta) */
```