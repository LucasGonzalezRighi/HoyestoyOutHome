import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CURTAIN_POSE, CURTAIN_TIMINGS } from '@/design-system/tokens/motion';

import { MOTION_ATTRIBUTES, MOTION_SELECTORS, MOTION_STATE } from '../attributes';

import { CurtainController, type IntroTarget } from './CurtainController';

/** Un nodo del telón: lo único que el controlador toca es `style` (y el lado de cada hoja). */
type FakeNode = { style: Record<string, string>; getAttribute: (name: string) => string | null };

function node(attributes: Record<string, string> = {}): FakeNode {
  return { style: {}, getAttribute: (name) => attributes[name] ?? null };
}

/**
 * El telón armado como lo renderiza `Curtain`, más un documento que solo sabe
 * buscarlo, marcar `<html>` y registrar listeners. `visibility` es lo que
 * devuelve `getComputedStyle` (el failsafe de CSS ya lo ocultó o no).
 */
function stubCurtain(visibility: 'visible' | 'hidden' = 'visible') {
  const curtain = node();
  const logo = node();
  const leaves = [
    node({ [MOTION_ATTRIBUTES.curtainLeaf]: 'left' }),
    node({ [MOTION_ATTRIBUTES.curtainLeaf]: 'right' }),
  ];
  const htmlAttributes = new Set<string>();
  const listeners = new Map<string, () => void>();
  const doc = {
    defaultView: { getComputedStyle: () => ({ visibility }) },
    documentElement: {
      setAttribute: (name: string) => htmlAttributes.add(name),
      removeAttribute: (name: string) => htmlAttributes.delete(name),
    },
    querySelector: (selector: string) =>
      selector === MOTION_SELECTORS.curtain
        ? curtain
        : selector === MOTION_SELECTORS.curtainLogo
          ? logo
          : null,
    querySelectorAll: (selector: string) =>
      selector === MOTION_SELECTORS.curtainLeaf ? leaves : [],
    addEventListener: (type: string, listener: () => void) => listeners.set(type, listener),
    removeEventListener: (type: string, listener: () => void) => {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
  };
  return {
    curtain,
    logo,
    leaves,
    htmlAttributes,
    listeners,
    pressKey: () => listeners.get('keydown')?.(),
    doc: doc as unknown as Document,
  };
}

function target(motionOff: boolean) {
  const beginIntro = vi.fn<(atMs: number) => void>();
  const subject: IntroTarget = { motionOff, beginIntro };
  return { subject, beginIntro };
}

const isHidden = (el: FakeNode) =>
  el.style.visibility === 'hidden' && el.style.pointerEvents === 'none';

/**
 * Reloj falso: los timers y `performance.now()` avanzan juntos con
 * `vi.advanceTimersByTime`. `fcpAt` es el `startTime` de la entrada de First
 * Contentful Paint (`null`: el navegador no la tiene).
 */
function stubClock(nowMs: number, fcpAt: number | null) {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'], now: nowMs });
  vi.stubGlobal('window', { setTimeout, clearTimeout });
  vi.stubGlobal('performance', {
    now: () => Date.now(),
    getEntriesByName: (name: string) =>
      name === 'first-contentful-paint' && fcpAt !== null ? [{ startTime: fcpAt }] : [],
  });
}

describe('CurtainController', () => {
  beforeEach(() => {
    stubClock(1000, null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('con el movimiento apagado', () => {
    it('oculta el telón al arrancar, sin fundido ni giro, y la intro arranca ya', () => {
      const dom = stubCurtain();
      const { subject, beginIntro } = target(true);
      new CurtainController(subject, dom.doc).start();

      expect(isHidden(dom.curtain)).toBe(true);
      expect(beginIntro).toHaveBeenCalledExactlyOnceWith(1000);
      expect(dom.htmlAttributes.has(MOTION_STATE.curtainControlled)).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
      expect(dom.listeners.size).toBe(0);

      vi.advanceTimersByTime(10_000);
      expect(dom.logo.style).toEqual({});
      expect(dom.leaves.map((leaf) => leaf.style)).toEqual([{}, {}]);
    });
  });

  describe('con movimiento', () => {
    it('sin entrada de FCP espera la pausa completa del diseño (1300 ms)', () => {
      const dom = stubCurtain();
      new CurtainController(target(false).subject, dom.doc).start();

      vi.advanceTimersByTime(CURTAIN_TIMINGS.liftDelayMs - 1);
      expect(dom.logo.style.opacity).toBeUndefined();
      vi.advanceTimersByTime(1);
      expect(dom.logo.style).toEqual({
        transform: `scale(${CURTAIN_POSE.logoScale})`,
        opacity: '0',
      });
    });

    it('descuenta de la pausa el tiempo que el logo ya estuvo pintado', () => {
      vi.useRealTimers();
      stubClock(1000, 200); // pintado hace 800 ms: faltan 500
      const dom = stubCurtain();
      new CurtainController(target(false).subject, dom.doc).start();

      vi.advanceTimersByTime(499);
      expect(dom.logo.style.opacity).toBeUndefined();
      vi.advanceTimersByTime(1);
      expect(dom.logo.style.opacity).toBe('0');
    });

    it('si el logo ya se vio más de 1300 ms, se levanta apenas hidrata', () => {
      vi.useRealTimers();
      stubClock(5000, 2400);
      const dom = stubCurtain();
      new CurtainController(target(false).subject, dom.doc).start();

      vi.advanceTimersByTime(0);
      expect(dom.logo.style.opacity).toBe('0');
    });

    it('abre las hojas, programa la intro una vez y oculta el telón a los 2,4 s', () => {
      const dom = stubCurtain();
      const { subject, beginIntro } = target(false);
      new CurtainController(subject, dom.doc).start();

      vi.advanceTimersByTime(CURTAIN_TIMINGS.liftDelayMs + CURTAIN_TIMINGS.leavesDelayMs);
      expect(dom.leaves.map((leaf) => leaf.style.transform)).toEqual([
        `rotateY(${-CURTAIN_POSE.leafAngleDeg}deg)`,
        `rotateY(${CURTAIN_POSE.leafAngleDeg}deg)`,
      ]);
      const leavesAt = 1000 + CURTAIN_TIMINGS.liftDelayMs + CURTAIN_TIMINGS.leavesDelayMs;
      expect(beginIntro).toHaveBeenCalledExactlyOnceWith(leavesAt + CURTAIN_TIMINGS.introLeadMs);
      expect(isHidden(dom.curtain)).toBe(false);

      vi.advanceTimersByTime(CURTAIN_TIMINGS.hideDelayMs - CURTAIN_TIMINGS.leavesDelayMs);
      expect(isHidden(dom.curtain)).toBe(true);
      expect(dom.listeners.size).toBe(0);
    });
  });

  describe('teclado', () => {
    it('la primera tecla oculta el telón ya y arranca la intro, sin animar después', () => {
      const dom = stubCurtain();
      const { subject, beginIntro } = target(false);
      new CurtainController(subject, dom.doc).start();

      vi.advanceTimersByTime(100);
      dom.pressKey();

      expect(isHidden(dom.curtain)).toBe(true);
      expect(beginIntro).toHaveBeenCalledExactlyOnceWith(1100);
      expect(vi.getTimerCount()).toBe(0);
      expect(dom.listeners.size).toBe(0);
      vi.advanceTimersByTime(10_000);
      expect(dom.logo.style).toEqual({});
    });

    it('si las hojas ya se abrieron, oculta el telón sin volver a programar la intro', () => {
      const dom = stubCurtain();
      const { subject, beginIntro } = target(false);
      new CurtainController(subject, dom.doc).start();

      vi.advanceTimersByTime(CURTAIN_TIMINGS.liftDelayMs + CURTAIN_TIMINGS.leavesDelayMs);
      dom.pressKey();

      expect(isHidden(dom.curtain)).toBe(true);
      expect(beginIntro).toHaveBeenCalledOnce();
    });
  });

  it('dispose() cancela lo pendiente, suelta el teclado y le devuelve el telón al failsafe', () => {
    const dom = stubCurtain();
    const { subject, beginIntro } = target(false);
    const controller = new CurtainController(subject, dom.doc);
    controller.start();
    controller.dispose();

    expect(vi.getTimerCount()).toBe(0);
    expect(dom.listeners.size).toBe(0);
    expect(dom.htmlAttributes.has(MOTION_STATE.curtainControlled)).toBe(false);
    vi.advanceTimersByTime(10_000);
    expect(dom.logo.style).toEqual({});
    expect(beginIntro).not.toHaveBeenCalled();
  });

  it('si el failsafe ya lo ocultó, lo deja oculto al tomar el control', () => {
    const dom = stubCurtain('hidden');
    new CurtainController(target(false).subject, dom.doc).start();
    expect(isHidden(dom.curtain)).toBe(true);
  });
});
