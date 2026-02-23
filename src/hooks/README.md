# Hooks — ProxyJS

Hooks são funções especiais que permitem usar estado e outros recursos do ProxyJS dentro de componentes funcionais. No ProxyJS, todos os hooks seguem uma convenção própria: **sempre começam com `new`**.

---

## Regras dos hooks

**1. Sempre começam com `new`**

Todo hook do ProxyJS começa com o prefixo `new`. Isso diferencia os hooks do ProxyJS de funções comuns e de hooks de outras bibliotecas.

```js
newState(0)       // ✅
newNavigate()     // ✅
useState(0)       // ❌ não é ProxyJS
useNavigate()     // ❌ não é ProxyJS
```

**2. Só podem ser chamados dentro de componentes funcionais**

Hooks dependem do contexto do componente atual. Chamá-los fora de um componente vai lançar um erro.

```js
// ✅ correto
function App() {
  const [count, setCount] = newState(0);
  return html.p(count);
}

// ❌ errado — fora de um componente
const [count, setCount] = newState(0);
```

**3. Sempre chamados no topo do componente**

Nunca chame hooks dentro de condicionais, loops ou funções aninhadas. A ordem de chamada precisa ser a mesma em todo render.

```js
// ✅ correto
function App() {
  const [count, setCount] = newState(0);
  const [nome, setNome] = newState("Arthur");
  return html.div(html.p(count), html.p(nome));
}

// ❌ errado — hook dentro de condicional
function App() {
  if (algumaCoisa) {
    const [count, setCount] = newState(0); // nunca faça isso
  }
}
```

---

## Hooks disponíveis

### `newState(initialValue)`

O hook principal do ProxyJS. Cria um estado local por instância de componente. Retorna `[getter, setter]`.

```js
function Contador() {
  const [count, setCount] = newState(0);

  return html.div(
    html.p(count),
    html.button({ onClick: () => setCount(count() + 1) }, "+"),
    html.button({ onClick: () => setCount(count() - 1) }, "-")
  );
}
```

O getter é uma função — sempre chame com `()` para ler o valor. Para passar o valor como filho reativo de um elemento, passe o getter sem chamar:

```js
html.p(count)     // ✅ reativo
html.p(count())   // ❌ estático
```

Multiplos estados no mesmo componente:

```js
function Formulario() {
  const [nome, setNome] = newState("");
  const [email, setEmail] = newState("");
  const [idade, setIdade] = newState(0);

  return html.div(
    html.input({ onInput: (e) => setNome(e.target.value) }),
    html.input({ onInput: (e) => setEmail(e.target.value) }),
    html.input({ type: "number", onInput: (e) => setIdade(Number(e.target.value)) })
  );
}
```

---

### `newNavigate()`

Retorna a função `navigate` do router. Permite navegar entre rotas de dentro de um componente.

```js
import { newNavigate, html } from "./src/index.js";

function Home() {
  const navigate = newNavigate();

  return html.div(
    html.h1("Home"),
    html.button({ onClick: () => navigate("/sobre") }, "Ir para Sobre"),
    html.button({ onClick: () => navigate("/user/42") }, "Ver usuário 42")
  );
}
```

> `newNavigate` só faz sentido quando a aplicação usa `createRouter`. Fora desse contexto, importe o `navigate` diretamente.

---

## Criando seus próprios hooks

Você pode compor hooks existentes para criar hooks reutilizáveis. A única regra é que o nome deve começar com `new` e o hook só pode ser chamado dentro de componentes.

```js
function newContador(inicial = 0) {
  const [count, setCount] = newState(inicial);
  const incrementar = () => setCount(count() + 1);
  const decrementar = () => setCount(count() - 1);
  const resetar = () => setCount(inicial);
  return { count, incrementar, decrementar, resetar };
}

function App() {
  const { count, incrementar, decrementar, resetar } = newContador(10);

  return html.div(
    html.p(count),
    html.button({ onClick: incrementar }, "+"),
    html.button({ onClick: decrementar }, "-"),
    html.button({ onClick: resetar }, "Reset")
  );
}
```

Outro exemplo — hook de toggle:

```js
function newToggle(inicial = false) {
  const [value, setValue] = newState(inicial);
  const toggle = () => setValue(!value());
  return [value, toggle];
}

function App() {
  const [aberto, toggleAberto] = newToggle();

  return html.div(
    html.button({ onClick: toggleAberto }, "Alternar"),
    html.p(() => aberto() ? "Aberto" : "Fechado")
  );
}
```

---

## Resumo

| Hook | Retorna | Onde usar |
|------|---------|-----------|
| `newState(initial)` | `[getter, setter]` | Dentro de componentes |
| `newNavigate()` | `navigate(path)` | Dentro de componentes com router |