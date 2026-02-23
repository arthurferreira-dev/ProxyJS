const injectedStyles = new Set();

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).slice(0, 6);
}

function scopeCSS(css, attr) {
  return css.replace(/([^{}]+)\{/g, (match, selectors) => {
    const scoped = selectors
      .split(",")
      .map((sel) => {
        sel = sel.trim();
        if (!sel || sel.startsWith("@")) return sel;
        return `${sel}[${attr}]`;
      })
      .join(", ");
    return `${scoped} {`;
  });
}

export function createStyle(css) {
  const hash = hashString(css);
  const attr = `data-pjs-${hash}`;

  if (!injectedStyles.has(hash)) {
    const style = document.createElement("style");
    style.setAttribute("data-pjs-scope", hash);
    style.textContent = scopeCSS(css, attr);
    document.head.appendChild(style);
    injectedStyles.add(hash);
  }

  return { [attr]: "" };
}