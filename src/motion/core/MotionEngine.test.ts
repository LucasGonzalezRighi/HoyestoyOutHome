import { afterEach, describe, expect, it, vi } from 'vitest';

import { SETTLE_MS } from '@/design-system/tokens/motion';

import { MOTION_ATTRIBUTES } from '../attributes';
import { CounterEffect } from '../effects/CounterEffect';
import { DriftEffect } from '../effects/DriftEffect';
import { ParallaxEffect } from '../effects/ParallaxEffect';
import { SkewEffect } from '../effects/SkewEffect';

import type { FrameState } from './FrameState';
import { MotionEffect, ScrollEffect } from './MotionEffect';
import { MotionEngine } from './MotionEngine';
import { PointerTracker } from './PointerTracker';
import { StyleWriter } from './StyleWriter';

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
  const listeners = new Map<string, () => void>();
  const view = {
    innerWidth: 1280,
    innerHeight: 800,
    matchMedia: () => ({ matches: false }),
    addEventListener: vi.fn((type: string, listener: () => void) => listeners.set(type, listener)),
    removeEventListener: vi.fn((type: string) => listeners.delete(type)),
  };
  const scroller = { scrollTop: 0 };
  vi.stubGlobal('window', view);
  vi.stubGlobal('document', {
    body: {},
    scrollingElement: scroller,
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
    /** El elemento que scrollea: el test mueve `scrollTop` para simular scroll. */
    scroller,
    /** Despacha un evento de `window` que el motor escucha (`beforeprint`, `afterprint`, `resize`). */
    dispatch(type: string): void {
      listeners.get(type)?.();
    },
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
  /** Velocidad redondeada de cada frame, midiera o no (la anota `tick`, que corre siempre). */
  readonly velocityKeys = new Map<number, number>();

  override tick(frame: FrameState): void {
    this.velocityKeys.set(frame.time, Math.round(frame.velocity));
  }

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

/** Los frames en que la velocidad redondeada cambió respecto del frame anterior. */
function velocityChanges(keys: ReadonlyMap<number, number>): number[] {
  const changes: number[] = [];
  let previous: number | undefined;
  for (const [time, key] of keys) {
    if (previous !== undefined && key !== previous) changes.push(time);
    previous = key;
  }
  return changes;
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

  it('con el scroll quieto y la velocidad bajando, la medición termina a SETTLE_MS del último cambio de scroll', () => {
    const browser = stubBrowser([]);
    const spy = new MeasureSpy();
    startEngine([spy]);
    browser.run(0, 2000);
    spy.measuredAt.length = 0;

    // Un salto: el scroll cambia en un solo frame y la velocidad suavizada
    // tarda ~0,8 s en volver a 0, cambiando de entero en el camino.
    const changedAt = 2000 + FRAME_MS;
    browser.scroller.scrollTop = 3000;
    browser.run(changedAt, 6000);

    const lastVelocityChange = Math.max(...velocityChanges(spy.velocityKeys));
    expect(lastVelocityChange).toBeGreaterThan(changedAt + 500);
    // Si cada cambio de velocidad extendiera la ventana, seguiría hasta lastVelocityChange + SETTLE_MS.
    expect(spy.measuredAt).toEqual(framesBetween(changedAt, 6000, changedAt + SETTLE_MS));
  });

  it('un cambio de velocidad después de la ventana mide ese frame, pero no la vuelve a abrir', () => {
    const browser = stubBrowser([]);
    const spy = new MeasureSpy();
    startEngine([spy]);
    browser.run(0, 2000);
    spy.measuredAt.length = 0;

    // Un salto tan largo que la velocidad todavía cambia de entero pasada la ventana.
    const changedAt = 2000 + FRAME_MS;
    browser.scroller.scrollTop = 40_000;
    browser.run(changedAt, 6000);

    const lateChanges = velocityChanges(spy.velocityKeys).filter(
      (time) => time >= changedAt + SETTLE_MS,
    );
    expect(lateChanges).not.toHaveLength(0);
    expect(spy.measuredAt).toEqual([
      ...framesBetween(changedAt, 6000, changedAt + SETTLE_MS),
      ...lateChanges,
    ]);
  });
});

/** Efecto espía: anota en un registro compartido cada fase que le toca, con su nombre. */
class PhaseSpy extends MotionEffect {
  constructor(
    private readonly name: string,
    private readonly log: string[],
  ) {
    super();
  }

  override measure(): void {
    this.log.push(`${this.name}:measure`);
  }

  override tick(): void {
    this.log.push(`${this.name}:tick`);
  }

  override apply(): void {
    this.log.push(`${this.name}:apply`);
  }
}

describe('MotionEngine: orden de las fases', () => {
  let subject: MotionEngine | null = null;

  afterEach(() => {
    subject?.dispose();
    subject = null;
    vi.unstubAllGlobals();
  });

  function startWithSpies(log: string[]): ReturnType<typeof stubBrowser> {
    const browser = stubBrowser([]);
    subject = new MotionEngine(
      { intensity: 1.8, respectReducedMotion: true },
      [new PhaseSpy('a', log), new PhaseSpy('b', log)],
      new PointerTracker(window),
    );
    subject.start();
    return browser;
  }

  it('en un frame con layout, todos los measure corren antes que cualquier tick, y los apply al final', () => {
    const log: string[] = [];
    const browser = startWithSpies(log);

    browser.run(0, 0); // el primer frame re-escanea: toca layout

    expect(log).toEqual(['a:measure', 'b:measure', 'a:tick', 'b:tick', 'a:apply', 'b:apply']);
  });

  it('sin layout (página quieta, ventana cerrada) solo corre tick, en el orden de la lista', () => {
    const log: string[] = [];
    const browser = startWithSpies(log);
    browser.run(0, 2000);
    log.length = 0;

    browser.run(2000 + FRAME_MS, 2000 + FRAME_MS);

    expect(log).toEqual(['a:tick', 'b:tick']);
  });
});

describe('MotionEngine: impresión', () => {
  let subject: MotionEngine | null = null;

  afterEach(() => {
    subject?.dispose();
    subject = null;
    vi.unstubAllGlobals();
  });

  it('antes de imprimir escribe los contadores en su valor final aunque nunca se haya llegado a ellos', () => {
    // El precio del cierre, todavía muy por debajo del viewport: el motor lo muestra en 0.
    const counter = {
      textContent: '690.000',
      getAttribute: (name: string) => {
        if (name === MOTION_ATTRIBUTES.count) return '690';
        if (name === MOTION_ATTRIBUTES.countFormat) return 'thousands';
        return null;
      },
      getBoundingClientRect: () => ({ top: 5000 }),
    };
    const browser = stubBrowser([counter]);
    subject = new MotionEngine(
      { intensity: 1.8, respectReducedMotion: true },
      [new CounterEffect()],
      new PointerTracker(window),
    );
    subject.start();

    browser.run(0, 0);
    expect(counter.textContent).toBe('0.000');

    browser.dispatch('beforeprint');
    expect(counter.textContent).toBe('690.000');

    browser.dispatch('afterprint');
    browser.run(FRAME_MS, FRAME_MS);
    expect(counter.textContent).toBe('0.000');
  });

  it.each([
    ['parallax', (styles: StyleWriter) => new ParallaxEffect(styles)],
    ['drift', (styles: StyleWriter) => new DriftEffect(styles)],
    ['skew', (styles: StyleWriter) => new SkewEffect(styles, new PointerTracker(window))],
  ])(
    'después de imprimir, con el scroll quieto, la capa con %s vuelve a su pose',
    (_name, createEffect) => {
      // Como la foto del hero con la página arriba de todo: su marco, 66 px
      // debajo del borde del viewport, la deja en `translate3d(0, -34.5px, 0)`.
      const layer = {
        style: { transform: '' },
        parentElement: { getBoundingClientRect: () => ({ top: 66.35 }) },
        getAttribute: (name: string) => {
          if (name === MOTION_ATTRIBUTES.parallax) return '0.4';
          if (name === MOTION_ATTRIBUTES.drift) return '-0.2';
          return null;
        },
        hasAttribute: () => false,
      };
      const browser = stubBrowser([layer]);
      subject = new MotionEngine(
        { intensity: 1.8, respectReducedMotion: true },
        [createEffect(new StyleWriter())],
        new PointerTracker(window),
      );
      subject.start();

      browser.run(0, 0);
      const pose = layer.style.transform;
      expect(pose).not.toBe('');

      browser.dispatch('beforeprint');
      expect(layer.style.transform).toBe('');

      // La pose recalculada es la misma de antes: si el reseteo no hubiera
      // pasado por la caché del StyleWriter, esta escritura se saltearía.
      browser.dispatch('afterprint');
      browser.run(FRAME_MS, FRAME_MS);
      expect(layer.style.transform).toBe(pose);
    },
  );

  it('dispose suelta los listeners de impresión', () => {
    const browser = stubBrowser([]);
    subject = new MotionEngine(
      { intensity: 1, respectReducedMotion: true },
      [],
      new PointerTracker(window),
    );
    subject.start();
    subject.dispose();
    subject = null;

    const removed = browser.view.removeEventListener.mock.calls.map(([type]) => type);
    expect(removed).toEqual(expect.arrayContaining(['beforeprint', 'afterprint']));
  });
});
