/** Propiedades de estilo que el motor escribe con caché. */
export type CachedStyleProperty =
  'transform' | 'opacity' | 'clipPath' | 'filter' | 'height' | 'backgroundColor';

/**
 * Un elemento con estilo inline: HTML, pero también SVG o MathML. El original
 * escribía `el.style` sin mirar qué era el nodo, y el port tampoco pregunta.
 */
export type StylableElement = Element & ElementCSSInlineStyle;

/**
 * Escribe un estilo inline solo si cambió desde la última vez (`set()` del
 * motor original, `dc.html:472`).
 *
 * Escribir `style.transform` con el mismo valor igual invalida el estilo del
 * elemento y obliga al navegador a recalcularlo. Con decenas de reveals por
 * pantalla, saltearse las escrituras repetidas es lo que mantiene el frame
 * barato cuando el scroll casi no se movió.
 *
 * La caché es por elemento y por propiedad, en un `WeakMap`: cuando React saca
 * un nodo del DOM, su entrada se libera sola. El original la guardaba en
 * propiedades pegadas al nodo (`el._transform`).
 *
 * **Hay una sola instancia por motor** (la crea `createMotionEngine`) y la
 * comparten todos los efectos: si dos escribieran la misma propiedad del mismo
 * elemento con cachés distintas, cada una creería que el valor es el suyo.
 *
 * Ojo: no todas las escrituras del motor pasan por acá. Donde el original
 * escribía directo (`el.style.transform = …`) sobre un elemento que el motor no
 * escribe también por la caché, el port también, para no cambiar cuándo se
 * reescribe cada cosa. La excepción son los reseteos con el movimiento apagado
 * del parallax, el drift y el skew (`dc.html:558`): esas capas se escriben por
 * la caché el resto del tiempo, y un reseteo directo la dejaría desactualizada
 * (al volver el movimiento, la misma pose se saltearía).
 */
export class StyleWriter {
  private readonly written = new WeakMap<StylableElement, Map<CachedStyleProperty, string>>();

  /** Escribe `value` en `element.style[property]` si difiere de lo último escrito. */
  set(element: StylableElement, property: CachedStyleProperty, value: string): void {
    let cache = this.written.get(element);
    if (!cache) {
      cache = new Map();
      this.written.set(element, cache);
    }
    if (cache.get(property) === value) return;
    cache.set(property, value);
    element.style[property] = value;
  }
}
