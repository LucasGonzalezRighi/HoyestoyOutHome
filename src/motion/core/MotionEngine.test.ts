import { afterEach, describe, expect, it, vi } from 'vitest';

import { SETTLE_MS } from '@/design-system/tokens/motion';

import { MOTION_ATTRIBUTES } from '../attributes';
import { CounterEffect } from '../effects/CounterEffect';

import type { FrameState } from './FrameState';
import { ScrollEffect } from './MotionEffect';
import { MotionEngine } from './MotionEngine';
import { PointerTracker } from './PointerTracker';

/** Un `window` mínimo: lo único que el motor consulta antes de arrancar es `matchMedia`. */
function stubWindow(reducedMotion: boolean) {
  const matchMedia = vi.fn((query: string) => ({
    matches: query.includes('reduce') ? reducedMotion : true,
  }));
  vi.stubGlobal('window', { innerWidth: 1280, innerHeight: 800, matchMedia });
  return matchMedia;
}

function engine(intensity: number, respectReducedMotion: boolean): MotionEngine {
  const pointer = new PointerTracker(window);
  return new MotionEngine({ intensity, respectReducedMotion }, [], pointer);
}

describe('MotionEngine.motionOff', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('con reduced motion ya está apagado antes de start() (el telón lo lee para no esperar)', () => {
    stubWindow(true);
    expect(engine(1.8, true).motionOff).toBe(true);
  });

  it('sin reduced motion y con intensidad, el movimiento está prendido', () => {
    stubWindow(false);
    expect(engine(1.8, true).motionOff).toBe(false);
  });

  it('el nivel apagado lo apaga aunque el sistema no pida nada', () => {
    stubWindow(false);
    expect(engine(0, true).motionOff).toBe(true);
  });

  it('si la política no respeta reduced motion, ni siquiera consulta la media query', () => {
    const matchMedia = stubWindow(true);
    const subject = engine(1, false);
    matchMedia.mockClear(); // el PointerTracker consulta `pointer: fine` al construirse
    expect(subject.motionOff).toBe(false);
    expect(matchMedia).not.toHaveBeenCalled();
  });
});

/** Duración de un frame a 60 Hz, redondeada: los timestamps de los frames del test. */
const FRAME_MS = 16;

/**
 * Un navegador mínimo para correr el loop a mano: `requestAnimationFrame`
 * guarda el callback y el test decide el timestamp de cada frame. El scroll
 * queda quieto salvo que el test lo mueva.
 */
function stubBrowser(nodes: readonly object[]) {
  let pending: FrameRequestCallback | null = null;
  const view = {
    innerWidth: 1280,
    innerHeight: 800,
    matchMedia: () => ({ matches: false }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('window', view);
  vi.stubGlobal('document', {
    body: {},
    scrollingElement: { scrollTop: 0 },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    querySelectorAll: () => nodes,
  });
  vi.stubGlobal(
    'MutationObserver',
    class {
      observe(): void {
        // El test no muta el DOM.
      }
      disconnect(): void {
        // Nada que soltar.
      }
    },
  );
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    pending = callback;
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {
    pending = null;
  });

  return {
    view,
    /** Corre los frames de `from` a `to` (inclusive), uno cada `FRAME_MS`; `beforeFrame` prepara cada uno. */
    run(from: number, to: number, beforeFrame: (time: number) => void = () => undefined): void {
      for (let time = from; time <= to; time += FRAME_MS) {
        beforeFrame(time);
        const callback = pending;
        pending = null;
        callback?.(time);
      }
    },
  };
}

/** Efecto espía: anota el timestamp de cada frame en que el motor midió. */
class MeasureSpy extends ScrollEffect {
  readonly measuredAt: number[] = [];

  override measure(frame: FrameState): void {
    this.measuredAt.push(frame.time);
  }

  override apply(): void {
    // Solo interesa cuándo se mide.
  }
}

/** Los timestamps de `run(from, to)` que caen antes de `until`. */
function framesBetween(from: number, to: number, until: number): number[] {
  const times: number[] = [];
  for (let time = from; time <= to && time < until; time += FRAME_MS) times.push(time);
  return times;
}

describe('MotionEngine: ventana de asentamiento', () => {
  let subject: MotionEngine | null = null;

  afterEach(() => {
    subject?.dispose();
    subject = null;
    vi.unstubAllGlobals();
  });

  function startEngine(effects: ConstructorParameters<typeof MotionEngine>[1]): MotionEngine {
    subject = new MotionEngine(
      { intensity: 1.8, respectReducedMotion: true },
      effects,
      new PointerTracker(window),
    );
    subject.start();
    return subject;
  }

  it('un contador dentro de un reveal que termina de entrar llega a su valor final (la QA: "3 días" en vez de "4")', () => {
    // El contador de "4 días" de Lolog: su contenedor (reveal 'scale') todavía
    // lo tiene 260 px más abajo y lo sube en 750 ms, con el scroll quieto.
    let now = 0;
    const top = () => (now >= 750 ? 300 : 560 - (260 * now) / 750);
    const counter = {
      textContent: '4',
      getAttribute: (name: string) => (name === MOTION_ATTRIBUTES.count ? '4' : null),
      getBoundingClientRect: () => ({ top: top() }),
    };
    const browser = stubBrowser([counter]);
    startEngine([new CounterEffect()]);

    browser.run(0, 0);
    // Medido a mitad de la transición: ease((800 − 560) / 400) × 4 ≈ 2,98.
    expect(counter.textContent).toBe('3');

    browser.run(FRAME_MS, 2000, (time) => {
      now = time;
    });
    expect(counter.textContent).toBe('4');
  });

  it(`con la firma quieta mide durante ${SETTLE_MS} ms y después deja de leer layout`, () => {
    const browser = stubBrowser([]);
    const spy = new MeasureSpy();
    startEngine([spy]);

    browser.run(0, 3000);

    // El primer frame (re-escaneo) cambia la firma; nada más la cambia después.
    expect(spy.measuredAt).toEqual(framesBetween(0, 3000, SETTLE_MS));
  });

  it('un cambio de firma reabre la ventana', () => {
    const browser = stubBrowser([]);
    const spy = new MeasureSpy();
    startEngine([spy]);
    browser.run(0, 2000);
    spy.measuredAt.length = 0;

    // El viewport se angosta sin `resize` (sin re-escaneo): solo cambia la firma.
    browser.view.innerWidth = 1000;
    browser.run(2000 + FRAME_MS, 5000);

    const changedAt = 2000 + FRAME_MS;
    expect(spy.measuredAt).toEqual(framesBetween(changedAt, 5000, changedAt + SETTLE_MS));
  });

  it('mientras la firma cambia, mide en cada frame (igual que el original)', () => {
    const browser = stubBrowser([]);
    const spy = new MeasureSpy();
    startEngine([spy]);

    browser.run(0, 5000, (time) => {
      browser.view.innerHeight = 800 + time; // un cambio por frame
    });

    expect(spy.measuredAt).toEqual(framesBetween(0, 5000, Number.POSITIVE_INFINITY));
  });
});
