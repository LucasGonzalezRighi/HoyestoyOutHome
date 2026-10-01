import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MOTION_SELECTORS } from '../attributes';
import type { FrameState } from '../core/FrameState';
import { StyleWriter } from '../core/StyleWriter';

import { HorizontalScrollEffect } from './HorizontalScrollEffect';

type FocusListener = (event: FocusEvent) => void;
type KeyListener = (event: KeyboardEvent) => void;

/**
 * Elemento falso: árbol, rect fijo (en coordenadas del viewport), ancho de
 * layout, `position` computado, scroll en X y listeners. Es lo único que el
 * efecto lee o escribe.
 */
class FakeElement {
  parentElement: FakeElement | null = null;
  readonly children: FakeElement[] = [];
  readonly style: Record<string, string> = {};
  readonly listeners = new Set<FocusListener>();
  /** Lo que devuelve `querySelector` para cada selector. */
  readonly found = new Map<string, FakeElement>();
  /** Lo que devuelve `getComputedStyle(…).position`. */
  position = 'static';
  scrollLeft = 0;
  scrollWidth = 0;
  ownerDocument: Document | null = null;

  constructor(
    private readonly left = 0,
    public offsetWidth = 0,
    private readonly top: () => number = () => 0,
  ) {}

  get firstElementChild(): FakeElement | null {
    return this.children[0] ?? null;
  }

  append(...children: FakeElement[]): this {
    for (const child of children) {
      child.parentElement = this;
      this.children.push(child);
    }
    return this;
  }

  contains(node: FakeElement): boolean {
    for (let current: FakeElement | null = node; current; current = current.parentElement) {
      if (current === this) return true;
    }
    return false;
  }

  getBoundingClientRect() {
    return {
      left: this.left,
      right: this.left + this.offsetWidth,
      width: this.offsetWidth,
      top: this.top(),
    };
  }

  querySelector(selector: string): FakeElement | null {
    return this.found.get(selector) ?? null;
  }

  addEventListener(_type: string, listener: FocusListener): void {
    this.listeners.add(listener);
  }

  removeEventListener(_type: string, listener: FocusListener): void {
    this.listeners.delete(listener);
  }

  scrollTo({ left }: ScrollToOptions): void {
    if (left !== undefined) this.scrollLeft = left;
  }

  readonly scrollBy = vi.fn();
}

/**
 * Próximos viajes en un viewport de 800 px, con la página scrolleada justo al
 * comienzo de la sección (a 3000 px): escena fijada, riel sin trasladar,
 * gutter de 40 px, columna de intro de 380 y cuatro cards de 400 separadas por
 * 26 (`TripsShowcase`): el `<ul>` mide 1678. El riel mide 2400: recorre 1600.
 */
function scene() {
  const scroller = { scrollTop: 3000 };
  const root = new FakeElement(0, 800);
  const section = new FakeElement(0, 800, () => 3000 - scroller.scrollTop);
  const stage = new FakeElement(0, 800);
  stage.position = 'sticky';
  const track = new FakeElement(0, 2400);
  track.scrollWidth = 2400;
  const bar = new FakeElement(40, 720);
  section.found.set(MOTION_SELECTORS.horizontalTrack, track);
  section.found.set(MOTION_SELECTORS.horizontalBar, bar);
  const intro = new FakeElement(40, 380);
  const cards = new FakeElement(446, 1678);
  const firstCard = new FakeElement(446, 400);
  const firstButton = new FakeElement(600, 150);
  const secondCard = new FakeElement(872, 400);
  const article = new FakeElement(872, 400);
  const button = new FakeElement(1100, 150);
  const lastCard = new FakeElement(1724, 400);
  const lastButton = new FakeElement(1950, 150);
  const outside = new FakeElement(40, 720);

  root.append(section.append(stage.append(track.append(intro, cards), bar, outside)));
  cards.append(
    firstCard.append(firstButton),
    secondCard.append(article.append(button)),
    lastCard.append(lastButton),
  );

  const frames: FrameRequestCallback[] = [];
  const timers = new Map<number, () => void>();
  let lastTimer = 0;
  const view = {
    innerWidth: 800,
    innerHeight: 800,
    getComputedStyle: (element: FakeElement) => ({ position: element.position }),
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => frames.push(callback)),
    cancelAnimationFrame: vi.fn(),
    setTimeout: vi.fn((callback: () => void) => {
      lastTimer += 1;
      timers.set(lastTimer, callback);
      return lastTimer;
    }),
    clearTimeout: vi.fn((id: number) => timers.delete(id)),
    scrollTo: vi.fn(),
  };
  const keyListeners = new Set<KeyListener>();
  const doc = {
    defaultView: view,
    scrollingElement: scroller,
    querySelectorAll: () => [section],
    addEventListener: (_type: string, listener: KeyListener) => keyListeners.add(listener),
    removeEventListener: (_type: string, listener: KeyListener) => keyListeners.delete(listener),
  } as unknown as Document;
  section.ownerDocument = doc;

  const effect = new HorizontalScrollEffect(new StyleWriter());
  effect.collect(doc);

  /** Despacha `focusin` en la sección, como si el foco hubiera caído en `target`. */
  const focus = (target: FakeElement): void => {
    for (const listener of section.listeners) listener({ target } as unknown as FocusEvent);
  };
  /** Despacha `keydown` en el documento. */
  const press = (key: string): void => {
    for (const listener of keyListeners) listener({ key } as KeyboardEvent);
  };

  return {
    effect,
    doc,
    view,
    root,
    section,
    stage,
    track,
    bar,
    firstButton,
    button,
    lastButton,
    outside,
    keyListeners,
    focus,
    press,
    /** Tab hasta `target`: el `keydown` y, en la misma tarea, el `focusin`. */
    tabTo(target: FakeElement): void {
      press('Tab');
      focus(target);
    },
    /** Corre los frames pendientes. */
    nextFrame(): void {
      for (const callback of frames.splice(0)) callback(0);
    },
    /** Termina la tarea actual: corren los timeouts pendientes. */
    nextTask(): void {
      const pending = [...timers.values()];
      timers.clear();
      for (const callback of pending) callback();
    },
  };
}

function frame(off: boolean): FrameState {
  return {
    intensity: off ? 0 : 1.8,
    off,
    time: 0,
    scrollY: 3000,
    viewportWidth: 800,
    viewportHeight: 800,
    velocity: 0,
    intro: 1,
    pointer: { x: 0, y: 0, moved: false, fine: true },
  };
}

describe('HorizontalScrollEffect: foco del teclado', () => {
  beforeEach(() => {
    // `instanceof Element` del efecto: en node no hay DOM.
    vi.stubGlobal('Element', FakeElement);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('una card fuera de la vista, con Tab: scrollea (suave) hasta dejarla en el gutter', () => {
    const { view, button, tabTo, nextFrame } = scene();
    tabTo(button);
    expect(view.scrollTo).not.toHaveBeenCalled(); // espera al frame siguiente
    nextFrame();
    // La card está a 872 − 40 = 832 px del comienzo del riel: 3000 + 832.
    expect(view.scrollTo).toHaveBeenCalledWith({ top: 3832, behavior: 'smooth' });
  });

  it('un foco que no llega con Tab (un clic, un toque) no mueve la página', () => {
    const { view, button, focus, nextFrame } = scene();
    focus(button);
    nextFrame();
    expect(view.requestAnimationFrame).not.toHaveBeenCalled();
    expect(view.scrollTo).not.toHaveBeenCalled();
  });

  it('otra tecla no cuenta como Tab', () => {
    const { view, button, press, focus, nextFrame } = scene();
    press('Enter');
    focus(button);
    nextFrame();
    expect(view.scrollTo).not.toHaveBeenCalled();
  });

  it('la marca del Tab dura una tarea: el focusin de volver a la ventana no mueve la página', () => {
    const { view, button, tabTo, focus, nextFrame, nextTask } = scene();
    tabTo(button);
    nextFrame();
    expect(view.scrollTo).toHaveBeenCalledTimes(1);

    nextTask();
    view.scrollTo.mockClear();
    // La persona cambió de pestaña y volvió: el navegador re-enfoca el link, sin keydown.
    focus(button);
    nextFrame();
    expect(view.scrollTo).not.toHaveBeenCalled();
  });

  it('con el movimiento apagado, el scroll es instantáneo', () => {
    const { effect, view, button, tabTo, nextFrame } = scene();
    effect.measure();
    effect.apply(frame(true));
    tabTo(button);
    nextFrame();
    // `instant` y no `auto`: `auto` tomaría el `scroll-behavior: smooth` del <html>.
    expect(view.scrollTo).toHaveBeenCalledWith({ top: 3832, behavior: 'instant' });
  });

  it('deshace el corrimiento en X que el navegador le haya hecho a la escena y a la página', () => {
    const { root, stage, button, tabTo, nextFrame } = scene();
    tabTo(button);
    // El "scroll a la vista" del navegador, que llega después del focusin.
    stage.scrollLeft = 500;
    root.scrollLeft = 127;
    nextFrame();
    expect(stage.scrollLeft).toBe(0);
    expect(root.scrollLeft).toBe(0);
  });

  it('si la card ya se ve entera, no mueve la página', () => {
    const { view, firstButton, tabTo, nextFrame } = scene();
    view.innerWidth = 1280; // la primera card (446–846 px) entra entera
    tabTo(firstButton);
    nextFrame();
    expect(view.scrollTo).not.toHaveBeenCalled();
  });

  it('si la lista entra en el viewport pero no con sus gutters, lleva a la vista la card y no la lista', () => {
    const { view, lastButton, tabTo, nextFrame } = scene();
    // 1678 ≤ 1700, pero 1678 > 1700 − 2 × 40: el ítem es el <li> de la última card.
    view.innerWidth = 1700;
    tabTo(lastButton);
    nextFrame();
    // La última card (a 1724 − 40 = 1684 px) no llega al gutter: riel al final
    // de su recorrido (2400 − 1700 = 700). Con la lista, el destino sería
    // 3000 + 406 y la card quedaría cortada a la derecha.
    expect(view.scrollTo).toHaveBeenCalledWith({ top: 3700, behavior: 'smooth' });
  });

  it('un foco fuera del riel no hace nada', () => {
    const { view, outside, tabTo, nextFrame } = scene();
    tabTo(outside);
    nextFrame();
    expect(view.requestAnimationFrame).not.toHaveBeenCalled();
    expect(view.scrollTo).not.toHaveBeenCalled();
  });

  it('re-escanear no duplica listeners, y dispose los suelta y cancela lo pendiente', () => {
    const { effect, doc, view, section, keyListeners, button, tabTo } = scene();
    effect.collect(doc);
    expect(section.listeners.size).toBe(1);
    expect(keyListeners.size).toBe(1);

    tabTo(button);
    effect.dispose();
    expect(section.listeners.size).toBe(0);
    expect(keyListeners.size).toBe(0);
    expect(view.cancelAnimationFrame).toHaveBeenCalled();
    expect(view.clearTimeout).toHaveBeenCalled();
  });
});

describe('HorizontalScrollEffect: escena sin fijar (pantallas bajas)', () => {
  beforeEach(() => {
    vi.stubGlobal('Element', FakeElement);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('no estira la sección ni traslada el riel o la barra, y borra lo que había escrito', () => {
    const { effect, section, stage, track, bar } = scene();
    effect.measure();
    effect.apply(frame(false));
    expect(section.style.height).toBe('2400px'); // 1600 de recorrido + 800 de viewport
    expect(track.style.transform).toMatch(/^translate3d/);

    stage.position = 'static'; // el `@media (max-height: 500px)` de la sección
    effect.measure();
    effect.apply(frame(false));
    expect(section.style.height).toBe('');
    expect(track.style.transform).toBe('');
    expect(bar.style.transform).toBe('');
  });

  it('al fijarse y soltarse de nuevo, vuelve a limpiar el riel', () => {
    const { effect, stage, track } = scene();
    for (const position of ['static', 'sticky', 'static']) {
      stage.position = position;
      effect.measure();
      effect.apply(frame(false));
    }
    expect(track.style.transform).toBe('');
  });

  /** La escena del `@media (max-height: 500px)`: sin fijar, con el riel del ancho del viewport. */
  function unpinnedScene() {
    const unpinned = scene();
    unpinned.stage.position = 'static';
    unpinned.track.offsetWidth = 800;
    return unpinned;
  }

  it('el foco con Tab no mueve la página: termina de entrar en el riel la card que asoma', () => {
    const { view, track, button, tabTo, nextFrame } = unpinnedScene();
    tabTo(button); // su card, 872–1272 px: le faltan 472 para entrar en el riel (0–800)
    nextFrame();
    expect(view.scrollTo).not.toHaveBeenCalled();
    expect(track.scrollBy).toHaveBeenCalledWith({ left: 472, behavior: 'smooth' });
  });

  it('una card que ya se ve entera no mueve el riel', () => {
    const { track, firstButton, tabTo, nextFrame } = unpinnedScene();
    track.offsetWidth = 1280; // la primera card (446–846 px) entra entera
    tabTo(firstButton);
    nextFrame();
    expect(track.scrollBy).not.toHaveBeenCalled();
  });

  it('sin Tab, tampoco toca el riel', () => {
    const { track, button, focus, nextFrame } = unpinnedScene();
    focus(button);
    nextFrame();
    expect(track.scrollBy).not.toHaveBeenCalled();
  });
});
