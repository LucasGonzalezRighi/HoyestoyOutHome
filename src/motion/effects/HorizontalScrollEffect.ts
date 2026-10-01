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
  /** La escena (el padre del riel) está fijada: si no, el efecto no estira ni traslada nada. */
  readonly pinned: boolean;
};

/**
 * Si la escena del riel (su padre) está fijada con `position: sticky`.
 *
 * En pantallas bajas el CSS de la sección la saca del pin y el riel pasa a
 * scrollear en X por su cuenta (CLAUDE.md §9, "Próximos viajes en pantallas
 * bajas"). Se le pregunta al CSS y no a un umbral repetido acá: el corte vive
 * en un solo lugar, el `@media` del módulo de la sección.
 */
function isPinned(track: HTMLElement, view: Window | null): boolean {
  const scene = track.parentElement;
  return scene !== null && view !== null && view.getComputedStyle(scene).position === 'sticky';
}

/**
 * El ítem del riel que hay que mostrar entero cuando el foco cae en `target`:
 * su ancestro más grande (sin llegar al riel) que entra en el ancho útil, el
 * viewport menos los dos gutters. En Próximos viajes es el `<li>` de la card;
 * en una pantalla donde la lista entera entra con sus gutters, es la lista.
 * Así no depende de cómo anide cada sección sus cards.
 *
 * Se compara contra el ancho útil y no contra el viewport porque el destino
 * deja el borde izquierdo del ítem en el gutter: un ítem que entra en el
 * viewport pero no en el ancho útil queda cortado a la derecha. El `<ul>` de
 * las cuatro cards mide 1678 px, y con viewports de 1678 a ~1776 px (una
 * MacBook Pro de 16" da 1728) se elegía la lista, y la card del final quedaba
 * 50 px afuera.
 *
 * @param usableWidth Dónde tiene que entrar: con la escena fijada, el viewport
 *                    menos el gutter de cada lado; sin fijar, el ancho visible
 *                    del riel.
 */
function itemToShow(target: Element, track: HTMLElement, usableWidth: number): Element {
  let item = target;
  let parent = target.parentElement;
  while (parent && parent !== track && parent.offsetWidth <= usableWidth) {
    item = parent;
    parent = parent.parentElement;
  }
  return item;
}

/**
 * Con la escena sin fijar, el riel es un contenedor de scroll común: termina
 * de entrar en él, en X, la card del foco (`itemToShow`), así se ven el precio
 * y el botón juntos. Lo mínimo, como un `scrollIntoView` con `inline:
 * 'nearest'`, pero solo en el riel: un `scrollIntoView` también movería la
 * página en Y, y cortaría el scroll suave con el que el navegador ya la está
 * llevando al foco.
 */
function revealInTrack(track: HTMLElement, target: Element, behavior: ScrollBehavior): void {
  const visible = track.getBoundingClientRect();
  const rect = itemToShow(target, track, visible.width).getBoundingClientRect();
  const overflow =
    rect.left < visible.left ? rect.left - visible.left : Math.max(0, rect.right - visible.right);
  if (overflow !== 0) track.scrollBy({ left: overflow, behavior });
}

/**
 * Deja en 0 el `scrollLeft` de todos los ancestros del riel, hasta la raíz.
 *
 * Al enfocar una card fuera de pantalla, el navegador desplaza en X todo lo
 * que pueda desplazar para mostrarla, y ese corrimiento se sumaría a la
 * traslación del motor. Con `overflow: clip` en la escena y `overflow-x: clip`
 * en el `<html>` no queda nada que desplazar, y esto no hace nada. Queda para
 * los navegadores sin `clip`: ahí la escena cae en su respaldo `hidden`, que
 * se desplaza por programa, y la página también se puede correr en X, porque
 * con reveals corridos hacia afuera (los `reveal('right')` del cronograma) es
 * más ancha que el viewport (cuando el `clip` estaba solo en el `<body>`, que
 * llega al viewport como `hidden`, a 790 px de ancho el foco la llevaba a
 * `scrollX` 127).
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
 * **Pantallas bajas** (no está en el original, CLAUDE.md §9): si el CSS saca
 * la escena del pin (viewport de menos de 500 px de alto), el efecto no estira
 * la sección ni traslada el riel o la barra, y borra lo que hubiera escrito: el
 * riel scrollea en X por su cuenta, como sin JS. Del foco solo termina de
 * entrar en el riel, en X, la card que asoma a medias (no mueve la página).
 *
 * **Foco del teclado** (no está en el original, CLAUDE.md §9): el riel se
 * mueve con `transform`, así que tabular a una card que está fuera de la vista
 * no la trae (el navegador no sabe que el scroll vertical la movería). El
 * efecto escucha `focusin` en cada sección y, si el foco cae en el riel, hace
 * el scroll vertical que pone esa card a la vista (`scrollTopToShowItem`, el
 * inverso de la fórmula del efecto). Solo sigue el foco que llega con Tab: un
 * clic o un toque también enfocan el link, y mover la página en ese momento
 * corría el botón debajo del puntero (el clic no llegaba a ocurrir) o pisaba el
 * salto al ancla; volver a la pestaña re-enfoca el último link y hacía saltar
 * la página desde donde estuviera.
 */
export class HorizontalScrollEffect extends ScrollEffect {
  private sections: HTMLElement[] = [];
  private measures: HorizontalMeasure[] = [];
  /** El `focusin` de cada sección escuchada, para soltarlo al re-escanear y en `dispose`. */
  private readonly focusListeners = new Map<HTMLElement, (event: FocusEvent) => void>();
  /** El documento donde se escucha el `keydown` del Tab, para soltarlo al re-escanear y en `dispose`. */
  private keydownTarget: Document | null = null;
  /** El `window` del documento escaneado: viewport, estilos, `scrollTo`, timers y `requestAnimationFrame`. */
  private view: Window | null = null;
  /** Frame pendiente del último foco (0 = ninguno). */
  private pendingFocus = 0;
  /** El foco que se está moviendo lo mueve un Tab: dura hasta la tarea siguiente al `keydown`. */
  private keyboardFocus = false;
  /** Timeout que apaga `keyboardFocus` (0 = ninguno). */
  private pendingKeyboardReset = 0;
  /** El movimiento está apagado, según el último frame aplicado: decide si el scroll al foco es suave. */
  private motionOff = false;

  constructor(private readonly styles: StyleWriter) {
    super();
  }

  override collect(doc: Document): void {
    this.detachListeners();
    this.view = doc.defaultView;
    this.sections = queryAll(doc, MOTION_SELECTORS.horizontalScroll);
    for (const section of this.sections) {
      const listener = (event: FocusEvent): void => this.followFocus(section, event.target);
      section.addEventListener('focusin', listener);
      this.focusListeners.set(section, listener);
    }
    if (this.sections.length > 0) {
      // En captura: lo ve aunque alguien frene el evento más abajo.
      doc.addEventListener('keydown', this.markKeyboardFocus, true);
      this.keydownTarget = doc;
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
        pinned: track !== null && isPinned(track, this.view),
      };
    });
  }

  override apply(frame: FrameState): void {
    this.motionOff = frame.off;
    for (const { section, track, bar, trackWidth, top, pinned } of this.measures) {
      if (!track) continue;
      if (!pinned) {
        this.styles.set(section, 'height', '');
        // Directo y no por `styles`, como la traslación de abajo: si la caché
        // guardara este '' y la escritura directa no, al volver a fijarse y
        // soltarse otra vez creería que el riel ya está en '' y no lo limpiaría.
        track.style.transform = '';
        if (bar) bar.style.transform = '';
        continue;
      }
      const distance = horizontalDistance(trackWidth, frame.viewportWidth);
      this.styles.set(section, 'height', `${Math.round(distance + frame.viewportHeight)}px`);
      const progress = horizontalProgress(-top, distance);
      track.style.transform = `translate3d(${(-progress * distance).toFixed(1)}px, 0, 0)`;
      if (bar) bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    }
  }

  override dispose(): void {
    this.detachListeners();
    if (this.pendingFocus !== 0) this.view?.cancelAnimationFrame(this.pendingFocus);
    this.pendingFocus = 0;
    if (this.pendingKeyboardReset !== 0) this.view?.clearTimeout(this.pendingKeyboardReset);
    this.pendingKeyboardReset = 0;
    this.keyboardFocus = false;
  }

  private detachListeners(): void {
    for (const [section, listener] of this.focusListeners) {
      section.removeEventListener('focusin', listener);
    }
    this.focusListeners.clear();
    this.keydownTarget?.removeEventListener('keydown', this.markKeyboardFocus, true);
    this.keydownTarget = null;
  }

  /**
   * Un Tab (o Shift+Tab) marca que el foco que viene lo mueve el teclado.
   *
   * El navegador mueve el foco como acción por defecto del `keydown`: en la
   * misma tarea, después de los listeners. La marca se apaga en una tarea
   * posterior (timeout 0) y no en una microtarea, que correría al volver de
   * este listener, antes de que el foco se mueva.
   */
  private readonly markKeyboardFocus = (event: KeyboardEvent): void => {
    const view = this.view;
    if (event.key !== 'Tab' || !view) return;
    this.keyboardFocus = true;
    if (this.pendingKeyboardReset !== 0) view.clearTimeout(this.pendingKeyboardReset);
    this.pendingKeyboardReset = view.setTimeout(() => {
      this.pendingKeyboardReset = 0;
      this.keyboardFocus = false;
    }, 0);
  };

  /**
   * El foco entró a la sección. Si llegó con Tab y cayó en el riel, lo sigue
   * en el frame siguiente y no en el momento: al enfocar, el navegador todavía
   * tiene que hacer su propio "scroll a la vista" (después de despachar
   * `focusin`), que cortaría un scroll suave empezado acá y podría volver a
   * correr el `scrollLeft` de la escena.
   */
  private followFocus(section: HTMLElement, target: EventTarget | null): void {
    const view = this.view;
    if (!this.keyboardFocus || !view) return;
    const track = section.querySelector<HTMLElement>(MOTION_SELECTORS.horizontalTrack);
    if (!track || !(target instanceof Element) || !track.contains(target)) return;
    if (this.pendingFocus !== 0) view.cancelAnimationFrame(this.pendingFocus);
    this.pendingFocus = view.requestAnimationFrame(() => {
      this.pendingFocus = 0;
      this.bringIntoView(view, section, track, target);
    });
  }

  /**
   * Scrollea la página hasta que el ítem enfocado quede a la vista. Si ya se
   * ve entero no hace nada: tabular entre cards que ya están en pantalla no
   * mueve la página.
   *
   * Con la escena sin fijar, la página no se toca: el riel es un contenedor de
   * scroll común y el navegador lo desplaza al enfocar, pero solo si el foco
   * cae entero fuera de la vista, y lo centra sin mirar la card. Chrome deja
   * como está un botón que asoma a medias (a 844×390, el CTA de la tercera
   * card quedaba con 47 de sus 94 px afuera), y a 320 px el precio, a la
   * izquierda del botón centrado, quedaba cortado. `revealInTrack` termina de
   * entrar la card.
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
    const behavior: ScrollBehavior = this.motionOff ? 'instant' : 'smooth';
    // Se lee de nuevo y no se toma de la última medición: este frame corre
    // fuera del loop, y puede llegar antes de que el motor mida un resize.
    if (!isPinned(track, view)) {
      revealInTrack(track, target, behavior);
      return;
    }
    resetHorizontalScroll(track);
    const first = track.firstElementChild;
    if (!first) return;
    const viewportWidth = view.innerWidth;
    const firstLeft = first.getBoundingClientRect().left;
    // El padding con el que arranca el riel; el riel y su primer hijo se trasladan juntos.
    const gutter = firstLeft - track.getBoundingClientRect().left;
    const item = itemToShow(target, track, viewportWidth - 2 * gutter);
    const itemRect = item.getBoundingClientRect();
    if (itemRect.left >= 0 && itemRect.right <= viewportWidth) return;

    const top = scrollTopToShowItem({
      sectionTop:
        section.getBoundingClientRect().top + scrollingElementOf(section.ownerDocument).scrollTop,
      itemOffset: itemRect.left - firstLeft,
      distance: horizontalDistance(track.scrollWidth, viewportWidth),
    });
    view.scrollTo({ top, behavior });
  }
}
