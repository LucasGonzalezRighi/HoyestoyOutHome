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
 * 2. Lee la configuración (`settings`) y el scroll (`ScrollTracker.sample`).
 * 3. Arma el `FrameState` (scroll, velocidad, viewport, intro, puntero).
 * 4. Decide si el frame toca layout (`needsLayout`): sí si cambió la firma de
 *    layout (scroll, viewport, intro, intensidad) o la velocidad redondeada,
 *    si hubo re-escaneo, o si sigue abierta la ventana de asentamiento
 *    (`SETTLE_MS` desde el último cambio de layout). Con la página quieta, no.
 * 5. Si toca layout, `measure` de todos: **solo lecturas**.
 * 6. `tick` de todos, en cada frame: el trabajo que no depende del scroll
 *    (imanes, cursor, cintas).
 * 7. Si toca layout, `apply` de todos: solo escrituras.
 *
 * El orden de 5 y 6 está dado vuelta respecto del original, que corría el
 * cursor y las cintas antes de medir (`dc.html:483-525`): sus escrituras de
 * `transform` dejaban el estilo sucio y la primera lectura de layout
 * (`scrollHeight` de la barra de progreso, los rects de los imanes) obligaba
 * al navegador a recalcularlo en el momento, en cada frame de scroll. Ningún
 * `tick` depende de lo que escribe un `apply` del mismo frame, y lo que lee
 * un `tick` de lo medido (la visibilidad de las cintas) sale más fresco así.
 * No cambia ningún valor: solo cuándo se lee.
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
  /** Firma de layout del último frame: scroll, viewport, intro e intensidad. */
  private layoutSignature: string | null = null;
  /** Velocidad redondeada del último frame (la otra mitad de la firma del original). */
  private velocityKey: number | null = null;
  /** Hasta cuándo (timestamp del frame) se sigue midiendo aunque la firma no cambie. */
  private settleUntil = Number.NEGATIVE_INFINITY;
  /** Se está imprimiendo: entre `beforeprint` y `afterprint` el movimiento cuenta como apagado. */
  private printing = false;

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
    window.addEventListener('beforeprint', this.handleBeforePrint);
    window.addEventListener('afterprint', this.handleAfterPrint);
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
    window.removeEventListener('beforeprint', this.handleBeforePrint);
    window.removeEventListener('afterprint', this.handleAfterPrint);
    this.printing = false;
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
   * Antes de imprimir, un frame **sincrónico** con el movimiento apagado: cada
   * efecto escribe su pose final, como con reduced motion. `print.css` ya pisa
   * transforms y opacidades con `!important`, pero el texto de los contadores
   * solo lo puede escribir el motor: sin esto, un contador al que nunca se
   * llegó scrolleando se imprimía en 0 ("$0.000", "0 km").
   *
   * No se espera al próximo `requestAnimationFrame` porque el navegador arma la
   * vista de impresión apenas termina de despachar `beforeprint`.
   */
  private readonly handleBeforePrint = (): void => {
    this.printing = true;
    this.force = true;
    this.frame(performance.now());
  };

  /** Después de imprimir, el próximo frame vuelve a medir y escribe el estado real del scroll. */
  private readonly handleAfterPrint = (): void => {
    this.printing = false;
    this.force = true;
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
    return { intensity: this.config.intensity, off: this.printing || this.motionOff };
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

    // La firma no incluye `off` a propósito, igual que el original: si cambia
    // la preferencia del sistema, se aplica en el próximo frame que se mueva algo.
    // Es la del original (`dc.html:514`) partida en dos: la velocidad va aparte
    // porque no abre la ventana de asentamiento (ver `needsLayout`).
    const layoutSignature = `${scrollY}|${viewportWidth}|${viewportHeight}|${intro}|${intensity}`;
    const layout = this.needsLayout(layoutSignature, Math.round(velocity), time);

    if (layout) for (const effect of this.effects) effect.measure(frame);
    for (const effect of this.effects) effect.tick(frame);
    if (layout) for (const effect of this.effects) effect.apply(frame);
  }

  /**
   * Si este frame mide y escribe:
   *
   * - **Re-escaneo o cambio de la firma de layout** (scroll, viewport, intro,
   *   intensidad): sí, y abre una ventana de `SETTLE_MS` en la que se sigue
   *   midiendo con todo quieto.
   * - **Cambio de la velocidad redondeada**: sí, pero **no** extiende la
   *   ventana. El skew de las cards y el de las cintas dependen de la
   *   velocidad, así que esos frames se miden y escriben como en el original
   *   (`dc.html:514-516`, donde la velocidad era parte de la firma).
   * - **Nada cambió**: solo si la ventana sigue abierta.
   *
   * Por qué la ventana: los efectos leen posiciones que una transición CSS
   * todavía está moviendo (un contador dentro de un reveal que termina de
   * entrar). Sin ella, el último valor medido es uno intermedio y queda así
   * hasta el próximo scroll. Con ella, cada efecto vuelve a medir hasta que
   * el layout se asentó, con las mismas fórmulas: durante la ventana corre el
   * mismo frame que el original corre, por ejemplo, durante la intro con el
   * scroll quieto.
   *
   * Por qué la velocidad no la extiende: después de un scroll, la velocidad
   * suavizada tarda ~0,6 s en llegar a 0 (más después de un salto), y cada
   * entero que cruza cambiaba la firma. Si reabriera la ventana, el motor
   * seguiría midiendo 1,1 s **después de que la velocidad se quedó quieta**:
   * ~1,7 s de frames completos por cada scroll, sin que nada del layout se
   * esté moviendo por la velocidad.
   */
  private needsLayout(layoutSignature: string, velocityKey: number, time: number): boolean {
    const velocityChanged = velocityKey !== this.velocityKey;
    this.velocityKey = velocityKey;
    if (this.force || layoutSignature !== this.layoutSignature) {
      this.layoutSignature = layoutSignature;
      this.force = false;
      this.settleUntil = time + SETTLE_MS;
      return true;
    }
    return velocityChanged || time < this.settleUntil;
  }
}
