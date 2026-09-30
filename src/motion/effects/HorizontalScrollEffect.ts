import { MOTION_SELECTORS } from '../attributes';
import { queryAll, scrollingElementOf } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import type { StyleWriter } from '../core/StyleWriter';
import {
  horizontalDistance,
  horizontalProgress,
  scrollTopToShowItem,
} from '../math/horizontalScroll';

type HorizontalMeasure = {
  readonly section: HTMLElement;
  readonly track: HTMLElement | null;
  readonly bar: HTMLElement | null;
  /** Ancho total del riel (`scrollWidth`). */
  readonly trackWidth: number;
  /** Borde superior de la sección respecto del viewport. */
  readonly top: number;
};

/**
 * El ítem del riel que hay que mostrar entero cuando el foco cae en `target`:
 * su ancestro más grande (sin llegar al riel) que entra en el viewport. En
 * Próximos viajes es el `<li>` de la card (el `<ul>` que las agrupa no entra);
 * en una pantalla donde entra la lista entera, es la lista. Así no depende de
 * cómo anide cada sección sus cards.
 */
function itemToShow(target: Element, track: HTMLElement, viewportWidth: number): Element {
  let item = target;
  let parent = target.parentElement;
  while (parent && parent !== track && parent.offsetWidth <= viewportWidth) {
    item = parent;
    parent = parent.parentElement;
  }
  return item;
}

/**
 * Deja en 0 el `scrollLeft` de todos los ancestros del riel, hasta la raíz.
 *
 * Al enfocar una card fuera de pantalla, el navegador desplaza en X todo lo
 * que pueda desplazar para mostrarla, y ese corrimiento se sumaría a la
 * traslación del motor: la escena, si recorta con `overflow: hidden`
 * (navegadores sin `clip`), y también la página. La landing no scrollea en X,
 * pero el `overflow-x: clip` del `<body>` se propaga al viewport como
 * `hidden`, que sí se puede desplazar por programa: con reveals corridos hacia
 * afuera (los `reveal('right')` del cronograma), el documento es más ancho
 * que el viewport, y a 790 px de ancho el foco llevaba la página a `scrollX` 127.
 *
 * `instant` y no asignar `scrollLeft`: el `<html>` tiene `scroll-behavior:
 * smooth`, y una asignación se vería deslizarse.
 */
function resetHorizontalScroll(track: HTMLElement): void {
  for (let element = track.parentElement; element; element = element.parentElement) {
    if (element.scrollLeft !== 0) element.scrollTo({ left: 0, behavior: 'instant' });
  }
}

/**
 * Sección con scroll horizontal fijado (`[data-hscroll]`, `dc.html:533-540`).
 *
 * La sección se estira hasta medir lo que le sobra al riel más un viewport; su
 * contenido es sticky, y mientras se scrollea ese alto extra el riel se
 * traslada en X. Scroll vertical → desplazamiento horizontal, 1 a 1.
 *
 * **Foco del teclado** (no está en el original, CLAUDE.md §9): el riel se
 * mueve con `transform`, así que tabular a una card que está fuera de la vista
 * no la trae (el navegador no sabe que el scroll vertical la movería). El
 * efecto escucha `focusin` en cada sección y, si el foco cae en el riel, hace
 * el scroll vertical que pone esa card a la vista (`scrollTopToShowItem`, el
 * inverso de la fórmula del efecto).
 */
export class HorizontalScrollEffect extends ScrollEffect {
  private sections: HTMLElement[] = [];
  private measures: HorizontalMeasure[] = [];
  /** El `focusin` de cada sección escuchada, para soltarlo al re-escanear y en `dispose`. */
  private readonly focusListeners = new Map<HTMLElement, (event: FocusEvent) => void>();
  /** El `window` del documento escaneado: viewport, `scrollTo` y `requestAnimationFrame`. */
  private view: Window | null = null;
  /** Frame pendiente del último foco (0 = ninguno). */
  private pendingFocus = 0;
  /** El movimiento está apagado, según el último frame aplicado: decide si el scroll al foco es suave. */
  private motionOff = false;

  constructor(private readonly styles: StyleWriter) {
    super();
  }

  override collect(doc: Document): void {
    this.detachFocusListeners();
    this.view = doc.defaultView;
    this.sections = queryAll(doc, MOTION_SELECTORS.horizontalScroll);
    for (const section of this.sections) {
      const listener = (event: FocusEvent): void => this.followFocus(section, event.target);
      section.addEventListener('focusin', listener);
      this.focusListeners.set(section, listener);
    }
  }

  /** El riel y la barra se buscan en cada medición, como el original: si React los re-renderiza, no quedan referencias viejas. */
  override measure(): void {
    this.measures = this.sections.map((section) => {
      const track = section.querySelector<HTMLElement>(MOTION_SELECTORS.horizontalTrack);
      return {
        section,
        track,
        bar: section.querySelector<HTMLElement>(MOTION_SELECTORS.horizontalBar),
        trackWidth: track ? track.scrollWidth : 0,
        top: section.getBoundingClientRect().top,
      };
    });
  }

  override apply(frame: FrameState): void {
    this.motionOff = frame.off;
    for (const { section, track, bar, trackWidth, top } of this.measures) {
      if (!track) continue;
      const distance = horizontalDistance(trackWidth, frame.viewportWidth);
      this.styles.set(section, 'height', `${Math.round(distance + frame.viewportHeight)}px`);
      const progress = horizontalProgress(-top, distance);
      track.style.transform = `translate3d(${(-progress * distance).toFixed(1)}px, 0, 0)`;
      if (bar) bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    }
  }

  override dispose(): void {
    this.detachFocusListeners();
    if (this.pendingFocus !== 0) this.view?.cancelAnimationFrame(this.pendingFocus);
    this.pendingFocus = 0;
  }

  private detachFocusListeners(): void {
    for (const [section, listener] of this.focusListeners) {
      section.removeEventListener('focusin', listener);
    }
    this.focusListeners.clear();
  }

  /**
   * El foco entró a la sección. Si cayó en el riel, lo sigue en el frame
   * siguiente y no en el momento: al enfocar, el navegador todavía tiene que
   * hacer su propio "scroll a la vista" (después de despachar `focusin`), que
   * cortaría un scroll suave empezado acá y podría volver a correr el
   * `scrollLeft` de la escena.
   */
  private followFocus(section: HTMLElement, target: EventTarget | null): void {
    const view = this.view;
    const track = section.querySelector<HTMLElement>(MOTION_SELECTORS.horizontalTrack);
    if (!view || !track || !(target instanceof Element) || !track.contains(target)) return;
    if (this.pendingFocus !== 0) view.cancelAnimationFrame(this.pendingFocus);
    this.pendingFocus = view.requestAnimationFrame(() => {
      this.pendingFocus = 0;
      this.bringIntoView(view, section, track, target);
    });
  }

  /**
   * Scrollea la página hasta que el ítem enfocado quede a la vista. Si ya se
   * ve entero no hace nada: tabular entre cards que ya están en pantalla (o
   * hacer clic en una) no mueve la página.
   *
   * Suave salvo con el movimiento apagado. Ahí `instant` y no `auto`: `auto`
   * toma el `scroll-behavior: smooth` del `<html>`, que `base.css` solo apaga
   * con reduced motion, no con el nivel `apagado`.
   */
  private bringIntoView(
    view: Window,
    section: HTMLElement,
    track: HTMLElement,
    target: Element,
  ): void {
    resetHorizontalScroll(track);
    const viewportWidth = view.innerWidth;
    const item = itemToShow(target, track, viewportWidth);
    const itemRect = item.getBoundingClientRect();
    if (itemRect.left >= 0 && itemRect.right <= viewportWidth) return;

    const first = track.firstElementChild ?? item;
    const top = scrollTopToShowItem({
      sectionTop:
        section.getBoundingClientRect().top + scrollingElementOf(section.ownerDocument).scrollTop,
      itemOffset: itemRect.left - first.getBoundingClientRect().left,
      distance: horizontalDistance(track.scrollWidth, viewportWidth),
    });
    view.scrollTo({ top, behavior: this.motionOff ? 'instant' : 'smooth' });
  }
}
