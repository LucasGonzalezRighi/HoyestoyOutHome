import type { StylableElement } from './StyleWriter';

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

/**
 * Si el motor puede escribirle estilos. Es el `if (!inner) return` del original
 * (`dc.html:543`): cualquier elemento sirve, no solo los HTML; un `instanceof
 * HTMLElement` dejaría quieta, por ejemplo, una card que fuera un `<svg>`.
 */
export function isStylable(element: Element | null): element is StylableElement {
  return element !== null && 'style' in element;
}

/** El elemento que scrollea la página (`document.scrollingElement || documentElement`). */
export function scrollingElementOf(doc: Document): Element {
  return doc.scrollingElement ?? doc.documentElement;
}
