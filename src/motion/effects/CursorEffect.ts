import { MOTION_SELECTORS, MOTION_STATE } from '../attributes';
import type { FrameState } from '../core/FrameState';
import { FrameEffect } from '../core/MotionEffect';

/**
 * El cursor montaña (`[data-cursor]`): sigue al mouse exacto, sin inercia
 * (`dc.html:492`).
 *
 * Arranca oculto por CSS. Si hay un mouse de verdad (`pointer: fine`), el
 * efecto lo muestra y marca `<html>` con `data-cursor-active`, que es lo que
 * `base.css` usa para esconder el cursor del sistema: si el JS no llega, el
 * usuario no se queda sin cursor. En touch lo deja oculto.
 *
 * La marca en `<html>` vive exactamente lo que vive el cursor custom: si el
 * nodo desaparece del DOM (un re-render que lo saca), se quita en el re-escaneo
 * siguiente. Si no, el cursor del sistema quedaría oculto sin nada que lo
 * reemplace.
 *
 * Corre aunque el movimiento esté apagado, como en el diseño: el cursor no es
 * una animación, es el puntero.
 */
export class CursorEffect extends FrameEffect {
  private root: HTMLElement | null = null;
  private cursor: HTMLElement | null = null;
  /** El cursor que ya se mostró (si React lo reemplaza, se muestra el nuevo). */
  private shown: HTMLElement | null = null;

  override collect(doc: Document): void {
    this.root = doc.documentElement;
    this.cursor = doc.querySelector<HTMLElement>(MOTION_SELECTORS.cursor);
    // El que estaba a la vista ya no es el cursor de la página (lo sacaron o lo
    // reemplazaron): se devuelve el del sistema. Si hay uno nuevo, `tick` lo
    // muestra en este mismo frame, antes de que el navegador pinte.
    if (this.shown && this.shown !== this.cursor) this.hide();
  }

  override tick(frame: FrameState): void {
    const cursor = this.cursor;
    if (!cursor || !frame.pointer.fine) return;
    if (cursor !== this.shown) this.show(cursor);
    cursor.style.transform = `translate3d(${frame.pointer.x}px, ${frame.pointer.y}px, 0)`;
  }

  /** Vuelve a esconder el cursor custom y le devuelve el suyo al sistema. */
  override dispose(): void {
    this.hide();
  }

  private show(cursor: HTMLElement): void {
    cursor.style.display = 'block';
    this.root?.setAttribute(MOTION_STATE.cursorActive, '');
    this.shown = cursor;
  }

  private hide(): void {
    this.root?.removeAttribute(MOTION_STATE.cursorActive);
    if (this.shown) this.shown.style.display = '';
    this.shown = null;
  }
}
