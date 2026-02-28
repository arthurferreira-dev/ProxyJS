import { isFunction, isPrimitive } from "../utils/is.js";
import { effect } from "../core/reactive.js";
import { setCurrentComponent } from "../hooks/newState.js";
import { Fragment } from "./createElement.js";

export function render(vnode, container) {
  const oldVnode = container.__vnode;
  if (oldVnode == null) {
    const el = mount(vnode, container);
    container.__vnode = vnode;
    container.appendChild(el);
  } else {
    patch(container, oldVnode, vnode);
    container.__vnode = vnode;
  }
}

function mount(vnode, parentEl, errorHandler) {
  if (vnode == null) return document.createTextNode("");

  if (isPrimitive(vnode)) {
    return document.createTextNode(String(vnode));
  }

  if (isFunction(vnode)) {
    const textNode = document.createTextNode("");
    effect(() => {
      textNode.textContent = vnode();
    });
    return textNode;
  }

  if (vnode.type === Fragment) {
    return mountFragment(vnode, parentEl, errorHandler);
  }

  if (isFunction(vnode.type)) {
    return mountComponent(vnode, parentEl, errorHandler);
  }

  return mountElement(vnode, errorHandler);
}

const voidTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function mountElement(vnode, errorHandler) {
  const el = document.createElement(vnode.type);
  patchProps(el, {}, vnode.props);

  if (vnode.props?.ref) {
    vnode.props.ref.current = el;
  }

  if (!voidTags.has(vnode.type)) {
    const children = normalizeChildren(vnode.children);
    children.forEach((child) => {
      if (child == null) return;
      el.appendChild(mount(child, el, errorHandler));
    });
  }

  el.__vnode = vnode;
  return el;
}

function mountFragment(vnode, parentEl, errorHandler) {
  const anchor = document.createComment("fragment");
  parentEl.appendChild(anchor);

  const children = normalizeChildren(vnode.children);
  children.forEach((child) => {
    if (child == null) return;
    parentEl.insertBefore(mount(child, parentEl, errorHandler), anchor);
  });

  anchor.__vnode = vnode;
  return anchor;
}

function mountComponent(vnode, parentEl, errorHandler) {
  const instance = {
    __hooks: [],
    __hookIndex: 0,
    vnode,
    el: null,
  };

  const el = runComponent(instance, vnode, parentEl, errorHandler);
  instance.el = el;
  el.__componentInstance = instance;
  return el;
}

function runComponent(instance, vnode, parentEl, errorHandler) {
  instance.__hookIndex = 0;
  setCurrentComponent(instance);
  try {
    const childVnode = vnode.type({ ...vnode.props, children: vnode.children });
    setCurrentComponent(null);
    return mount(childVnode, parentEl, errorHandler);
  } catch (err) {
    setCurrentComponent(null);
    if (errorHandler) {
      errorHandler(err);
      return document.createTextNode("");
    }
    console.error(
      `[ProxyJS] Erro no componente "${vnode.type.name || "Anônimo"}":`,
      err,
    );
    throw err;
  }
}

function patch(parentEl, oldVnode, newVnode) {
  if (sameVnode(oldVnode, newVnode)) {
    if (isPrimitive(newVnode) || isFunction(newVnode)) {
      const el = findDomNode(parentEl, oldVnode);
      if (el && el.nodeType === Node.TEXT_NODE && isPrimitive(newVnode)) {
        if (el.textContent !== String(newVnode)) {
          el.textContent = String(newVnode);
        }
      }
      return el;
    }
    if (isFunction(newVnode.type)) {
      return patchComponent(parentEl, oldVnode, newVnode);
    }
    return patchElement(parentEl, oldVnode, newVnode);
  }

  const oldEl = findDomNode(parentEl, oldVnode);
  const newEl = mount(newVnode, parentEl);

  if (
    oldEl &&
    oldEl.parentNode === parentEl &&
    oldEl.nodeType !== Node.COMMENT_NODE
  ) {
    parentEl.replaceChild(newEl, oldEl);
  } else if (oldEl && oldEl.nodeType === Node.COMMENT_NODE) {
    oldEl.parentNode.insertBefore(newEl, oldEl);
    oldEl.parentNode.removeChild(oldEl);
  } else {
    parentEl.appendChild(newEl);
  }
  return newEl;
}

function patchElement(parentEl, oldVnode, newVnode) {
  const el = parentEl.querySelector
    ? Array.from(parentEl.childNodes).find((n) => n.__vnode === oldVnode) ||
      parentEl.firstChild
    : parentEl;

  if (!el) return mount(newVnode, parentEl);

  patchProps(el, oldVnode.props || {}, newVnode.props || {});
  patchChildren(el, oldVnode.children || [], newVnode.children || []);

  el.__vnode = newVnode;
  return el;
}

function patchComponent(parentEl, oldVnode, newVnode) {
  const oldEl = findDomNode(parentEl, oldVnode);
  if (!oldEl) return mount(newVnode, parentEl);

  const instance = oldEl.__componentInstance;
  if (!instance) {
    const newEl = mount(newVnode, parentEl);
    parentEl.replaceChild(newEl, oldEl);
    return newEl;
  }

  instance.__hookIndex = 0;
  setCurrentComponent(instance);
  const childVnode = newVnode.type({
    ...newVnode.props,
    children: newVnode.children,
  });
  setCurrentComponent(null);

  const newEl = mount(childVnode, parentEl);
  parentEl.replaceChild(newEl, oldEl);
  newEl.__componentInstance = instance;
  instance.el = newEl;
  return newEl;
}

function patchChildren(parentEl, oldChildren, newChildren) {
  oldChildren = normalizeChildren(oldChildren);
  newChildren = normalizeChildren(newChildren);

  const hasKeys = newChildren.some((c) => c && c.props && c.props.key != null);

  if (hasKeys) {
    patchKeyedChildren(parentEl, oldChildren, newChildren);
  } else {
    patchUnkeyedChildren(parentEl, oldChildren, newChildren);
  }
}

function patchKeyedChildren(parentEl, oldChildren, newChildren) {
  const oldKeyMap = new Map();
  const oldDomNodes = Array.from(parentEl.childNodes);

  oldChildren.forEach((child, i) => {
    if (child && child.props && child.props.key != null) {
      oldKeyMap.set(child.props.key, { vnode: child, el: oldDomNodes[i] });
    }
  });

  const newDomNodes = [];

  newChildren.forEach((newChild) => {
    if (newChild == null) return;
    const key = newChild.props?.key;

    if (key != null && oldKeyMap.has(key)) {
      const { vnode: oldChild, el: oldEl } = oldKeyMap.get(key);
      if (sameVnode(oldChild, newChild)) {
        patchElement(parentEl, oldChild, newChild);
        newDomNodes.push(oldEl);
      } else {
        const newEl = mount(newChild, parentEl);
        parentEl.replaceChild(newEl, oldEl);
        newDomNodes.push(newEl);
      }
      oldKeyMap.delete(key);
    } else {
      const newEl = mount(newChild, parentEl);
      newDomNodes.push(newEl);
    }
  });

  oldKeyMap.forEach(({ el }) => {
    if (el && el.parentNode === parentEl) {
      parentEl.removeChild(el);
    }
  });

  newDomNodes.forEach((el) => {
    parentEl.appendChild(el);
  });
}

function patchUnkeyedChildren(parentEl, oldChildren, newChildren) {
  const domNodes = Array.from(parentEl.childNodes);
  const max = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < max; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (newChild == null) {
      if (domNodes[i] && domNodes[i].parentNode === parentEl) {
        parentEl.removeChild(domNodes[i]);
      }
    } else if (oldChild == null) {
      parentEl.appendChild(mount(newChild, parentEl));
    } else {
      patch(parentEl, oldChild, newChild);
    }
  }
}

function patchProps(el, oldProps, newProps) {
  for (const key in oldProps) {
    if (key === "key") continue;
    if (!(key in newProps)) {
      if (key.startsWith("on") && isFunction(oldProps[key])) {
        el.removeEventListener(key.slice(2).toLowerCase(), oldProps[key]);
      } else {
        el.removeAttribute(key);
      }
    }
  }

  for (const key in newProps) {
    if (key === "key" || key === "ref") continue;
    const newVal = newProps[key];
    const oldVal = oldProps[key];

    if (newVal === oldVal) continue;

    if (key.startsWith("on") && isFunction(newVal)) {
      if (oldVal) el.removeEventListener(key.slice(2).toLowerCase(), oldVal);
      el.addEventListener(key.slice(2).toLowerCase(), newVal);
    } else if (newVal == null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, newVal);
    }
  }
}

function sameVnode(a, b) {
  if (isPrimitive(a) && isPrimitive(b)) return true;
  if (isFunction(a) && isFunction(b)) return true;
  if (a == null || b == null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;
  return a.type === b.type && a.props?.key === b.props?.key;
}

function normalizeChildren(children) {
  if (!children) return [];
  return Array.isArray(children) ? children.flat(Infinity) : [children];
}

function findDomNode(parentEl, vnode) {
  const nodes = Array.from(parentEl.childNodes);
  return nodes.find((n) => n.__vnode === vnode) || nodes[0] || null;
}

export function renderTemplate(template, container) {
  container.innerHTML = template;
}
