import { CURTAIN_TIMINGS, MOTION_MEDIA, SETTLE_MS } from '@/design-system/tokens/motion';

import { MOTION_SELECTORS } from '../attributes';

import { scrollingElementOf } from './dom';
import type { FrameState, MotionSettings } from './FrameState';
import { IntroClock } from './IntroClock';
import type { MotionEffect } from './MotionEffect';
import type { PointerTracker } from './PointerTracker';
import { ScrollTracker } from './ScrollTracker';

/** Configuración del motor. La arma `createMotionEngine` a partir de los tokens. */
export type MotionEngineConfig = {
  /** Multiplicador `k` del nivel de animaciones (ver `MOTION_LEVELS`). 0 apaga el movimiento. */
  readonly intensity: number;
  /** Si `prefers-reduced-motion: reduce` apaga el movimiento (ver `RESPECT_OS_REDUCED_MOTION`). */
  readonly respectReducedMotion: boolean;
};

/**
 * Un cambio en el DOM obliga a re-escanear solo si agregó o sacó elementos,
 * y no fue adentro de un contador: el contador reescribe su propio texto en
 * cada frame, y sin este filtro el motor se re-escanearía sin parar
 * (`dc.html:427`).
 */
function changesElements(record: MutationRecord): boolean {
  if (record.type !== 'childList') return false;
  if (record.target instanceof Element && record.target.closest(MOTION_SELECTORS.count)) {
    return false;
  }
  return [...record.addedNodes, ...record.removedNodes].some(
    (node) => node.nodeType === Node.ELEMENT_NODE,
  );
}

/**
 * El motor de animación: **un solo loop de `requestAnimationFrame`** para toda
 * la página. Port de `componentDidMount`/`componentWillUnmount`/`frame()` del
 * motor del diseño (`dc.html:421-598`).
 *
 * No sabe qué anima: recibe la lista de efectos por constructor y los recorre
 * por fases (ver `MotionEffect`). Un efecto nuevo es una clase nueva registrada
 * en `createMotionEngine`; este archivo no se toca.
 *
 * Cada frame:
 *
 * 1. Si el DOM cambió, cada efecto re-escanea (`collect`).
 * 2. Arma el `FrameState` (scroll, velocidad, viewport, intro, puntero).
 * 3. `tick` de todos: el trabajo de cada frame (cursor, cintas, imanes).
 * 4. Firma del frame: si scroll, viewport, intro, intensidad y velocidad son
 *    los mismos que en el frame anterior **y ya pasó la ventana de
 *    asentamiento** (`SETTLE_MS` desde el último cambio), termina acá. Con la
 *    página quieta el motor no lee ni escribe layout.
 * 5. `measure` de todos (solo lecturas) y después `apply` de todos (solo
 *    escrituras). Mezclarlas obligaría al navegador a recalcular el layout en
 *    el medio, una vez por elemento.
 *
 * La ventana de asentamiento no está en el original (CLAUDE.md §9): sin ella,
 * lo que se mide mientras una transición CSS todavía corre queda congelado en
 * un valor intermedio cuando la firma deja de cambiar (ver `SETTLE_MS`).
 *
 * `start()` y `dispose()` son idempotentes: React StrictMode monta, desmonta y
 * vuelve a montar en desarrollo, y el motor tiene que sobrevivirlo sin dejar
 * listeners colgados.
 */
export class MotionEngine {
  private readonly scroll = new ScrollTracker();
  private readonly intro = new IntroClock(CURTAIN_TIMINGS.introDurationMs);

  private running = false;
  private frameId = 0;
  private reducedMotion: MediaQueryList | null = null;
  private observer: MutationObserver | null = null;

  /** El DOM cambió: hay que re-escanear antes del próximo frame. */
  private dirty = true;
  /** Hubo re-escaneo: el próximo frame mide y escribe aunque la firma no haya cambiado. */
  private force = false;
  private signature: string | null = null;
  /** Hasta cuándo (timestamp del frame) se sigue midiendo aunque la firma no cambie. */
  private settleUntil = Number.NEGATIVE_INFINITY;

  /**
   * @param config  Intensidad y política de reduced motion.
   * @param effects Efectos a correr, **en orden**: es el orden de cada fase (ver `createMotionEngine`).
   * @param pointer Estado del puntero, compartido con los efectos que lo necesitan.
   */
  constructor(
    private readonly config: MotionEngineConfig,
    private readonly effects: readonly MotionEffect[],
    private readonly pointer: PointerTracker,
  ) {}

  /** Multiplicador `k` del nivel de animaciones. */
  get intensity(): number {
    return this.config.intensity;
  }

  /**
   * El movimiento está apagado (nivel `apagado`, o reduced motion si la política lo respeta).
   *
   * Vale también antes de `start()`: el telón lo lee para decidir si espera
   * (`IntroTarget`), y con reduced motion no puede esperar 1,3 s solo porque
   * lo arrancaron antes que el motor.
   */
  get motionOff(): boolean {
    if (this.config.intensity === 0) return true;
    return this.config.respectReducedMotion && this.reducedMotionQuery().matches;
  }

  /** Engancha los listeners y arranca el loop. Llamarlo con el motor andando no hace nada. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.dirty = true;

    document.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    this.observer = new MutationObserver(this.handleMutations);
    this.observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', this.handleResize);
    this.frameId = requestAnimationFrame(this.loop);
  }

  /**
   * Frena el loop, suelta todos los listeners y deja que cada efecto limpie lo
   * suyo. Llamarlo dos veces no hace nada; después se puede volver a `start()`.
   */
  dispose(): void {
    if (!this.running) return;
    this.running = false;

    cancelAnimationFrame(this.frameId);
    document.removeEventListener('pointermove', this.handlePointerMove);
    this.observer?.disconnect();
    this.observer = null;
    window.removeEventListener('resize', this.handleResize);
    for (const effect of this.effects) effect.dispose();
  }

  /**
   * Programa el arranque de la intro. Lo llama el telón al abrirse.
   *
   * @param atMs Momento en la base de `performance.now()`; puede estar en el futuro.
   */
  beginIntro(atMs: number): void {
    this.intro.begin(atMs);
  }

  /** Marca el DOM como sucio: el próximo frame re-escanea los elementos. */
  invalidate(): void {
    this.dirty = true;
  }

  private readonly loop = (time: number): void => {
    this.frame(time);
    if (this.running) this.frameId = requestAnimationFrame(this.loop);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    this.pointer.track(event);
    const settings = this.settings();
    for (const effect of this.effects) effect.onPointerMove(event, settings);
  };

  private readonly handleMutations = (records: MutationRecord[]): void => {
    if (records.some(changesElements)) this.invalidate();
  };

  private readonly handleResize = (): void => {
    this.invalidate();
  };

  /**
   * La media query de reduced motion, creada la primera vez que se pide (nunca
   * en el servidor: solo la piden `motionOff` y el loop). `matches` es en vivo,
   * como el `window.matchMedia(…)` que el original evaluaba en cada `off()`.
   */
  private reducedMotionQuery(): MediaQueryList {
    this.reducedMotion ??= window.matchMedia(MOTION_MEDIA.reducedMotion);
    return this.reducedMotion;
  }

  private settings(): MotionSettings {
    return { intensity: this.config.intensity, off: this.motionOff };
  }

  private collect(): void {
    for (const effect of this.effects) effect.collect(document);
    this.dirty = false;
    this.force = true;
  }

  private frame(time: number): void {
    if (this.dirty) this.collect();

    const { intensity, off } = this.settings();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const { scrollY, velocity } = this.scroll.sample(scrollingElementOf(document));
    const intro = this.intro.progress(time);

    const frame: FrameState = {
      intensity,
      off,
      time,
      scrollY,
      viewportWidth,
      viewportHeight,
      velocity,
      intro,
      pointer: this.pointer.snapshot(),
    };

    for (const effect of this.effects) effect.tick(frame);

    // La firma no incluye `off` a propósito, igual que el original: si cambia
    // la preferencia del sistema, se aplica en el próximo frame que se mueva algo.
    const signature = `${scrollY}|${viewportWidth}|${viewportHeight}|${intro}|${intensity}|${Math.round(velocity)}`;
    if (!this.needsLayout(signature, time)) return;

    for (const effect of this.effects) effect.measure(frame);
    for (const effect of this.effects) effect.apply(frame);
  }

  /**
   * Si este frame mide y escribe. Sí cuando cambió la firma o hubo re-escaneo
   * (como en el original, `dc.html:514-516`), y cada uno de esos frames abre
   * una ventana de `SETTLE_MS` en la que se sigue midiendo con la firma quieta.
   *
   * Por qué la ventana: los efectos leen posiciones que una transición CSS
   * todavía está moviendo (un contador dentro de un reveal que termina de
   * entrar). Sin ella, el último valor medido es uno intermedio y queda así
   * hasta el próximo scroll. Con ella, cada efecto vuelve a medir hasta que
   * el layout se asentó, con las mismas fórmulas: durante la ventana corre el
   * mismo frame que el original corre, por ejemplo, durante la intro con el
   * scroll quieto.
   */
  private needsLayout(signature: string, time: number): boolean {
    if (this.force || signature !== this.signature) {
      this.signature = signature;
      this.force = false;
      this.settleUntil = time + SETTLE_MS;
      return true;
    }
    return time < this.settleUntil;
  }
}
