import { CURTAIN_POSE, CURTAIN_TIMINGS } from '@/design-system/tokens/motion';

import { MOTION_ATTRIBUTES, MOTION_SELECTORS, MOTION_STATE } from '../attributes';

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
 * 1. Espera 1,3 s con el logo a la vista (0 si el movimiento está apagado).
 * 2. El logo se achica y se desvanece.
 * 3. 450 ms después, las dos hojas giran hacia afuera como puertas y se
 *    oscurecen; la intro del motor queda programada para 500 ms más tarde.
 * 4. A los 2,4 s del paso 2 el telón deja de tapar y de recibir clics.
 *
 * Las duraciones de cada movimiento las ponen las transiciones CSS del telón
 * (`features/site-chrome/Curtain`); acá solo se decide **cuándo**.
 */
export class CurtainController {
  private readonly timers: number[] = [];
  private started = false;

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
    this.schedule(() => this.lift(), this.target.motionOff ? 0 : CURTAIN_TIMINGS.liftDelayMs);
  }

  /**
   * Cancela todo lo que falte de la coreografía. A diferencia del original
   * (que solo cancelaba la primera espera), limpia también los pasos internos:
   * en StrictMode el telón de un montaje descartado no puede tocar el DOM.
   */
  dispose(): void {
    for (const timer of this.timers) window.clearTimeout(timer);
    this.timers.length = 0;
    this.started = false;
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
    const curtain = this.doc.querySelector<HTMLElement>(MOTION_SELECTORS.curtain);
    const view = this.doc.defaultView;
    if (curtain && view && view.getComputedStyle(curtain).visibility === 'hidden') {
      curtain.style.visibility = 'hidden';
      curtain.style.pointerEvents = 'none';
    }
    this.doc.documentElement.setAttribute(MOTION_STATE.curtainControlled, '');
  }

  private lift(): void {
    const curtain = this.doc.querySelector<HTMLElement>(MOTION_SELECTORS.curtain);
    const logo = this.doc.querySelector<HTMLElement>(MOTION_SELECTORS.curtainLogo);
    if (logo) {
      logo.style.transform = `scale(${CURTAIN_POSE.logoScale})`;
      logo.style.opacity = '0';
    }
    this.schedule(() => this.openLeaves(), CURTAIN_TIMINGS.leavesDelayMs);
    this.schedule(() => {
      if (!curtain) return;
      curtain.style.pointerEvents = 'none';
      curtain.style.visibility = 'hidden';
    }, CURTAIN_TIMINGS.hideDelayMs);
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
    this.target.beginIntro(performance.now() + CURTAIN_TIMINGS.introLeadMs);
  }

  private schedule(run: () => void, delayMs: number): void {
    this.timers.push(window.setTimeout(run, delayMs));
  }
}
