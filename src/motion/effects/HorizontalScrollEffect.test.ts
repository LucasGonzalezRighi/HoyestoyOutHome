import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MOTION_SELECTORS } from '../attributes';
import type { FrameState } from '../core/FrameState';
import { StyleWriter } from '../core/StyleWriter';

import { HorizontalScrollEffect } from './HorizontalScrollEffect';

type FocusListener = (event: FocusEvent) => void;

/**
 * Elemento falso: árbol, rect fijo (en coordenadas del viewport), ancho de
 * layout, scroll en X y listeners. Es lo único que el efecto lee o escribe.
 */
class FakeElement {
  parentElement: FakeElement | null = null;
  readonly children: FakeElement[] = [];
  readonly style: Record<string, string> = {};
  readonly listeners = new Set<FocusListener>();
  /** Lo que devuelve `querySelector` para cada selector. */
  readonly found = new Map<string, FakeElement>();
  scrollLeft = 0;
  scrollWidth = 0;
  ownerDocument: Document | null = null;

  constructor(
    private readonly left = 0,
    readonly offsetWidth = 0,
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
    return { left: this.left, right: this.left + this.offsetWidth, top: this.top() };
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
}

/**
 * Próximos viajes en un viewport de 800 px, con la página scrolleada justo al
 * comienzo de la sección (a 3000 px): riel sin trasladar, gutter de 40 px,
 * columna de intro de 380 y cards de 400 separadas por 26 (`TripsShowcase`).
 * El riel mide 2400: recorre 1600.
 */
function scene() {
  const scroller = { scrollTop: 3000 };
  const root = new FakeElement(0, 800);
  const section = new FakeElement(0, 800, () => 3000 - scroller.scrollTop);
  const stage = new FakeElement(0, 800);
  const track = new FakeElement(0, 2400);
  track.scrollWidth = 2400;
  section.found.set(MOTION_SELECTORS.horizontalTrack, track);
  const intro = new FakeElement(40, 380);
  const cards = new FakeElement(446, 1678);
  const firstCard = new FakeElement(446, 400);
  const firstButton = new FakeElement(600, 150);
  const secondCard = new FakeElement(872, 400);
  const article = new FakeElement(872, 400);
  const button = new FakeElement(1100, 150);
  const outside = new FakeElement(40, 720);

  root.append(section.append(stage.append(track.append(intro, cards), outside)));
  cards.append(firstCard.append(firstButton), secondCard.append(article.append(button)));

  const frames: FrameRequestCallback[] = [];
  const view = {
    innerWidth: 800,
    innerHeight: 800,
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => frames.push(callback)),
    cancelAnimationFrame: vi.fn(),
    scrollTo: vi.fn(),
  };
  const doc = {
    defaultView: view,
    scrollingElement: scroller,
    querySelectorAll: () => [section],
  } as unknown as Document;
  section.ownerDocument = doc;

  const effect = new HorizontalScrollEffect(new StyleWriter());
  effect.collect(doc);

  return {
    effect,
    doc,
    view,
    root,
    section,
    stage,
    firstButton,
    button,
    outside,
    /** Despacha `focusin` en la sección, como si el foco hubiera caído en `target`. */
    focus(target: FakeElement): void {
      for (const listener of section.listeners) listener({ target } as unknown as FocusEvent);
    },
    /** Corre los frames pendientes. */
    nextFrame(): void {
      for (const callback of frames.splice(0)) callback(0);
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

  it('una card fuera de la vista: scrollea (suave) hasta dejarla en el gutter', () => {
    const { view, button, focus, nextFrame } = scene();
    focus(button);
    expect(view.scrollTo).not.toHaveBeenCalled(); // espera al frame siguiente
    nextFrame();
    // La card está a 872 − 40 = 832 px del comienzo del riel: 3000 + 832.
    expect(view.scrollTo).toHaveBeenCalledWith({ top: 3832, behavior: 'smooth' });
  });

  it('con el movimiento apagado, el scroll es instantáneo', () => {
    const { effect, view, button, focus, nextFrame } = scene();
    effect.measure();
    effect.apply(frame(true));
    focus(button);
    nextFrame();
    // `instant` y no `auto`: `auto` tomaría el `scroll-behavior: smooth` del <html>.
    expect(view.scrollTo).toHaveBeenCalledWith({ top: 3832, behavior: 'instant' });
  });

  it('deshace el corrimiento en X que el navegador le haya hecho a la escena y a la página', () => {
    const { root, stage, button, focus, nextFrame } = scene();
    focus(button);
    // El "scroll a la vista" del navegador, que llega después del focusin.
    stage.scrollLeft = 500;
    root.scrollLeft = 127;
    nextFrame();
    expect(stage.scrollLeft).toBe(0);
    expect(root.scrollLeft).toBe(0);
  });

  it('si la card ya se ve entera, no mueve la página', () => {
    const { view, firstButton, focus, nextFrame } = scene();
    view.innerWidth = 1280; // la primera card (446–846 px) entra entera
    focus(firstButton);
    nextFrame();
    expect(view.scrollTo).not.toHaveBeenCalled();
  });

  it('un foco fuera del riel no hace nada', () => {
    const { view, outside, focus, nextFrame } = scene();
    focus(outside);
    nextFrame();
    expect(view.requestAnimationFrame).not.toHaveBeenCalled();
    expect(view.scrollTo).not.toHaveBeenCalled();
  });

  it('re-escanear no duplica listeners, y dispose los suelta y cancela el scroll pendiente', () => {
    const { effect, doc, view, section, button, focus } = scene();
    effect.collect(doc);
    expect(section.listeners.size).toBe(1);

    focus(button);
    effect.dispose();
    expect(section.listeners.size).toBe(0);
    expect(view.cancelAnimationFrame).toHaveBeenCalled();
  });
});
