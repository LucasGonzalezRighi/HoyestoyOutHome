import { CURTAIN_POSE, CURTAIN_TIMINGS } from '@/design-system/tokens/motion';

import { MOTION_ATTRIBUTES, MOTION_SELECTORS, MOTION_STATE } from '../attributes';

/**
 * Nombre de la entrada de Paint Timing del First Contentful Paint. Es el
 * momento en que el telón (que viene en el HTML del servidor) empieza a verse.
 */
const FIRST_CONTENTFUL_PAINT = 'first-contentful-paint';

/**
 * Lo que el telón necesita del motor: saber si el movimiento está apagado y
 * avisarle cuándo arranca la intro. `MotionEngine` lo cumple; se tipa angosto
 * para que el telón no dependa del motor entero.
 */
export type IntroTarget = {
  readonly motionOff: boolean;
  beginIntro(atMs: number): void;
};

/**
 * La coreografía del telón de entrada (`lift()` del original, `dc.html:429-443`).
 *
 * 1. Espera a que el logo se lea: 1,3 s a la vista (`dc.html:442`), contados
 *    desde que se pintó y no desde que hidrató la página (ver `liftDelayMs`).
 * 2. El logo se achica y se desvanece.
 * 3. 450 ms después, las dos hojas giran hacia afuera como puertas y se
 *    oscurecen; la intro del motor queda programada para 500 ms más tarde.
 * 4. A los 2,4 s del paso 2 el telón deja de tapar y de recibir clics.
 *
 * Dos casos se saltean los pasos 1–3 y ocultan el telón de una vez, con la
 * intro arrancando en el acto (`revealNow`):
 * - **Movimiento apagado** (nivel `apagado` o `prefers-reduced-motion`): el
 *   diseño solo pone la espera en 0, pero el fundido del logo y el giro 3D de
 *   las hojas a pantalla completa son justo lo que molesta con sensibilidad
 *   vestibular (CLAUDE.md §6.2).
 * - **La primera tecla** mientras el telón tapa: si no, el segundo Tab enfoca
 *   la marca del nav, que queda escondida detrás del telón (WCAG 2.4.11).
 *
 * Las duraciones de cada movimiento las ponen las transiciones CSS del telón
 * (`features/site-chrome/Curtain`); acá solo se decide **cuándo**.
 */
export class CurtainController {
  private readonly timers: number[] = [];
  private started = false;
  /** La intro ya se programó en el motor: `beginIntro` va una sola vez por apertura. */
  private introScheduled = false;

  /**
   * @param target El motor (o cualquier cosa que reciba la intro).
   * @param doc    Documento donde vive el telón.
   */
  constructor(
    private readonly target: IntroTarget,
    private readonly doc: Document,
  ) {}

  /** Programa la apertura. Llamarlo de nuevo sin `dispose()` no hace nada. */
  start(): void {
    if (this.started) return;
    this.started = true;
    this.takeOverFromFailsafe();
    if (this.target.motionOff) {
      this.revealNow();
      return;
    }
    this.doc.addEventListener('keydown', this.handleKeyDown);
    this.schedule(() => this.lift(), this.liftDelayMs());
  }

  /**
   * Cancela todo lo que falte de la coreografía. A diferencia del original
   * (que solo cancelaba la primera espera), limpia también los pasos internos
   * y el listener de teclado: en StrictMode el telón de un montaje descartado
   * no puede tocar el DOM.
   */
  dispose(): void {
    this.cancelTimers();
    this.doc.removeEventListener('keydown', this.handleKeyDown);
    this.started = false;
    this.introScheduled = false;
    this.doc.documentElement.removeAttribute(MOTION_STATE.curtainControlled);
  }

  /**
   * Le saca el telón al failsafe de CSS (`Curtain.module.css`), que lo oculta
   * solo si el JS no llega. Marcar `<html>` cancela esa animación.
   *
   * Caso borde: si la hidratación tardó tanto que el failsafe ya disparó, al
   * cancelarlo el telón volvería a aparecer y a taparlo todo por un segundo.
   * Por eso, si ya estaba oculto, se lo deja oculto con estilos inline antes
   * de marcar `<html>` (la intro del motor corre igual).
   */
  private takeOverFromFailsafe(): void {
    const curtain = this.curtain();
    const view = this.doc.defaultView;
    if (curtain && view && view.getComputedStyle(curtain).visibility === 'hidden') {
      this.hideCurtain();
    }
    this.doc.documentElement.setAttribute(MOTION_STATE.curtainControlled, '');
  }

  /**
   * La espera del paso 1, descontando el tiempo que el logo ya estuvo pintado.
   *
   * En el diseño la espera arranca al montar el motor (`dc.html:442`), y ahí
   * montar era lo mismo que pintar. Acá el telón viene en el HTML del servidor
   * y se ve desde el First Contentful Paint, pero el controlador arranca recién
   * al hidratar: en un celular lento (Slow 4G, CPU 4×) el logo ya llevaba ~2 s
   * a la vista cuando empezaba la espera, y el contenido aparecía a los ~5,5 s.
   * Restando lo transcurrido desde el FCP, una carga rápida se ve igual que en
   * el diseño y una lenta levanta el telón apenas hidrata. Sin entrada de FCP
   * (navegador sin Paint Timing, pestaña que cargó en segundo plano) se espera
   * la pausa completa.
   */
  private liftDelayMs(): number {
    const fcp = performance.getEntriesByName(FIRST_CONTENTFUL_PAINT)[0]?.startTime;
    if (fcp === undefined) return CURTAIN_TIMINGS.liftDelayMs;
    return Math.max(0, CURTAIN_TIMINGS.liftDelayMs - (performance.now() - fcp));
  }

  private lift(): void {
    const logo = this.doc.querySelector<HTMLElement>(MOTION_SELECTORS.curtainLogo);
    if (logo) {
      logo.style.transform = `scale(${CURTAIN_POSE.logoScale})`;
      logo.style.opacity = '0';
    }
    this.schedule(() => this.openLeaves(), CURTAIN_TIMINGS.leavesDelayMs);
    this.schedule(() => this.hideCurtain(), CURTAIN_TIMINGS.hideDelayMs);
  }

  private openLeaves(): void {
    this.doc.querySelectorAll<HTMLElement>(MOTION_SELECTORS.curtainLeaf).forEach((leaf) => {
      const angle =
        leaf.getAttribute(MOTION_ATTRIBUTES.curtainLeaf) === 'left'
          ? -CURTAIN_POSE.leafAngleDeg
          : CURTAIN_POSE.leafAngleDeg;
      leaf.style.transform = `rotateY(${angle}deg)`;
      leaf.style.filter = `brightness(${CURTAIN_POSE.leafBrightness})`;
    });
    this.beginIntroOnce(performance.now() + CURTAIN_TIMINGS.introLeadMs);
  }

  /**
   * Oculta el telón ya, sin animar, y arranca la intro si todavía no estaba
   * programada (si las hojas ya se abrieron, la intro ya tiene su momento).
   */
  private revealNow(): void {
    this.cancelTimers();
    this.hideCurtain();
    this.beginIntroOnce(performance.now());
  }

  /**
   * El paso 4: el telón deja de tapar y de recibir clics. Con el telón oculto
   * ya no hace falta escuchar el teclado.
   */
  private hideCurtain(): void {
    const curtain = this.curtain();
    if (curtain) {
      curtain.style.pointerEvents = 'none';
      curtain.style.visibility = 'hidden';
    }
    this.doc.removeEventListener('keydown', this.handleKeyDown);
  }

  private beginIntroOnce(atMs: number): void {
    if (this.introScheduled) return;
    this.introScheduled = true;
    this.target.beginIntro(atMs);
  }

  /** Cualquier tecla: quien navega con teclado no espera al telón. */
  private readonly handleKeyDown = (): void => {
    this.revealNow();
  };

  private curtain(): HTMLElement | null {
    return this.doc.querySelector<HTMLElement>(MOTION_SELECTORS.curtain);
  }

  private schedule(run: () => void, delayMs: number): void {
    this.timers.push(window.setTimeout(run, delayMs));
  }

  private cancelTimers(): void {
    for (const timer of this.timers) window.clearTimeout(timer);
    this.timers.length = 0;
  }
}
