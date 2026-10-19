/**
 * Helpers de lectura del DOM que comparten los efectos.
 */

/** Todos los elementos que matchean `selector`, como array (para indexar en paralelo con las medidas). */
export function queryAll(root: ParentNode, selector: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector));
}

/**
 * Número de un atributo, con la semántica de `parseFloat(el.dataset.x)` del
 * original: si falta o no es un número, devuelve `NaN`, y cada efecto decide
 * su default con `||` como hacía el diseño.
 */
export function readNumber(element: Element, attribute: string): number {
  return Number.parseFloat(element.getAttribute(attribute) ?? '');
}

/** El elemento que scrollea la página (`document.scrollingElement || documentElement`). */
export function scrollingElementOf(doc: Document): Element {
  return doc.scrollingElement ?? doc.documentElement;
}
