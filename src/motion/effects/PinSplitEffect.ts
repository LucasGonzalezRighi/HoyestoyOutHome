import { PIN_SPLIT } from '@/design-system/tokens/motion';

import { MOTION_SELECTORS } from '../attributes';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import { pinSplitProgress, type PinSplitProgress } from '../math/pinSplit';

/** Etapas que se escriben como custom properties en el envoltorio. */
const STAGES = ['enter', 'open', 'reveal', 'exit'] as const;

/** Con el movimiento apagado (o al imprimir) la secuencia queda terminada. */
const SETTLED: PinSplitProgress = {
  enter: 1,
  open: 1,
  reveal: 1,
  exit: 0,
  pinned: false,
  travel: 0,
};

/** Una secuencia de la página y lo último que se le escribió. */
type Pin = {
  readonly root: HTMLElement;
  readonly panel: HTMLElement | null;
  progress: PinSplitProgress;
  panelTop: number;
  exitHeight: number;
  readonly written: Map<string, string>;
};

/**
 * Secuencia fija con palabra partida (`[data-pin-split]`, pedido del cliente,
 * octubre 2026; port del contacto de su portafolio, sin librerías).
 *
 * El envoltorio es alto y su primera hija, el panel, queda fija
 * (`position: sticky`, lo pone el CSS). El scroll maneja cuatro etapas que el
 * motor escribe como custom properties y el CSS convierte en movimiento:
 * `--enter` (entra), `--open` (la palabra se parte), `--reveal` (aparece el
 * contenido) y `--exit` (lo que sigue, `[data-pin-exit]`, sube y la tapa).
 * También escribe `--pin-top` (un panel más alto que la pantalla se fija
 * cuando su borde de abajo toca el de la pantalla) y `--footer-h`, el alto de
 * lo que sube al final, que el CSS suma al recorrido.
 *
 * Si el foco entra al panel antes de que el contenido aparezca (Tab desde la
 * sección anterior), scrollea hasta donde ya se ve entero.
 */
export class PinSplitEffect extends ScrollEffect {
  private pins: Pin[] = [];
  private exitElement: HTMLElement | null = null;
  private motionOff = false;

  override collect(doc: Document): void {
    this.release();
    this.exitElement = doc.querySelector<HTMLElement>(MOTION_SELECTORS.pinExit);
    for (const root of doc.querySelectorAll<HTMLElement>(MOTION_SELECTORS.pinSplit)) {
      const panel = root.firstElementChild instanceof HTMLElement ? root.firstElementChild : null;
      root.addEventListener('focusin', this.handleFocusIn);
      this.pins.push({
        root,
        panel,
        progress: SETTLED,
        panelTop: 0,
        exitHeight: 0,
        written: new Map(),
      });
    }
  }

  override measure(frame: FrameState): void {
    const exit = this.exitElement;
    const exitHeight = exit ? exit.offsetHeight : 0;
    const exitTop = exit ? exit.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
    for (const pin of this.pins) {
      const rect = pin.root.getBoundingClientRect();
      pin.exitHeight = exitHeight;
      pin.panelTop = pin.panel ? Math.min(0, frame.viewportHeight - pin.panel.offsetHeight) : 0;
      pin.progress = pinSplitProgress({
        top: rect.top,
        height: rect.height,
        viewportHeight: frame.viewportHeight,
        exitHeight,
        exitTop: Number.isFinite(exitTop) ? exitTop : rect.bottom,
      });
    }
  }

  override apply(frame: FrameState): void {
    this.motionOff = frame.off;
    for (const pin of this.pins) {
      const progress = frame.off ? SETTLED : pin.progress;
      for (const stage of STAGES) this.write(pin, `--${stage}`, progress[stage].toFixed(3));
      this.write(pin, '--footer-h', `${Math.round(pin.exitHeight)}px`);
      this.write(pin, '--pin-top', `${Math.round(pin.panelTop)}px`);
    }
  }

  override dispose(): void {
    this.release();
    this.exitElement = null;
  }

  /** Escribe una custom property en el envoltorio solo si cambió. */
  private write(pin: Pin, property: string, value: string): void {
    if (pin.written.get(property) === value) return;
    pin.root.style.setProperty(property, value);
    pin.written.set(property, value);
  }

  /** Suelta los listeners y deja cada envoltorio sin variables (el CSS trae la pose final). */
  private release(): void {
    for (const pin of this.pins) {
      pin.root.removeEventListener('focusin', this.handleFocusIn);
      for (const property of pin.written.keys()) pin.root.style.removeProperty(property);
    }
    this.pins = [];
  }

  /**
   * El foco llegó al panel con el contenido todavía oculto: scrollea hasta el
   * punto del recorrido donde ya apareció entero. Solo con el panel fijo (sin
   * fijarse, el navegador ya lleva el campo a la vista).
   */
  private readonly handleFocusIn = (event: FocusEvent): void => {
    const pin = this.pins.find((candidate) => candidate.root.contains(event.target as Node));
    if (!pin || !pin.progress.pinned || pin.progress.reveal >= 1 || this.motionOff) return;
    const scroller = pin.root.ownerDocument.scrollingElement;
    if (!scroller) return;
    const rootTop = pin.root.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTo({
      top: rootTop + pin.progress.travel * PIN_SPLIT.focusAt,
      behavior: 'smooth',
    });
  };
}
