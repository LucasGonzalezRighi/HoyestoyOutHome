import { describe, expect, it } from 'vitest';

import { MOTION_STATE } from '../attributes';
import type { FrameState } from '../core/FrameState';

import { CursorEffect } from './CursorEffect';

type FakeElement = { style: { display: string; transform: string } };

/** `<html>` falso: solo guarda qué atributos tiene. */
function fakeRoot() {
  const attributes = new Set<string>();
  return {
    attributes,
    setAttribute: (name: string) => attributes.add(name),
    removeAttribute: (name: string) => attributes.delete(name),
  };
}

function fakeCursor(): FakeElement {
  return { style: { display: '', transform: '' } };
}

/** Documento falso cuyo `[data-cursor]` se puede cambiar entre re-escaneos. */
function fakeDocument(root: ReturnType<typeof fakeRoot>) {
  const state: { cursor: FakeElement | null } = { cursor: null };
  const doc = { documentElement: root, querySelector: () => state.cursor } as unknown as Document;
  return { doc, state };
}

function frameAt(x: number, y: number, fine = true): FrameState {
  return {
    intensity: 1.8,
    off: false,
    time: 0,
    scrollY: 0,
    viewportWidth: 1280,
    viewportHeight: 800,
    velocity: 0,
    intro: 0,
    pointer: { x, y, moved: false, fine },
  };
}

describe('CursorEffect', () => {
  it('con mouse: muestra el cursor, lo lleva al puntero y marca <html>', () => {
    const root = fakeRoot();
    const { doc, state } = fakeDocument(root);
    const cursor = fakeCursor();
    state.cursor = cursor;
    const effect = new CursorEffect();

    effect.collect(doc);
    effect.tick(frameAt(10, 20));

    expect(cursor.style).toEqual({ display: 'block', transform: 'translate3d(10px, 20px, 0)' });
    expect(root.attributes.has(MOTION_STATE.cursorActive)).toBe(true);
  });

  it('sin mouse (touch): no lo muestra ni oculta el cursor del sistema', () => {
    const root = fakeRoot();
    const { doc, state } = fakeDocument(root);
    state.cursor = fakeCursor();
    const effect = new CursorEffect();

    effect.collect(doc);
    effect.tick(frameAt(10, 20, false));

    expect(state.cursor.style.display).toBe('');
    expect(root.attributes.size).toBe(0);
  });

  it('si el cursor sale del DOM, le devuelve el cursor al sistema', () => {
    const root = fakeRoot();
    const { doc, state } = fakeDocument(root);
    const cursor = fakeCursor();
    state.cursor = cursor;
    const effect = new CursorEffect();
    effect.collect(doc);
    effect.tick(frameAt(10, 20));

    state.cursor = null;
    effect.collect(doc);
    effect.tick(frameAt(30, 40));

    expect(root.attributes.has(MOTION_STATE.cursorActive)).toBe(false);
    expect(cursor.style.display).toBe('');
  });

  it('si React reemplaza el nodo, muestra el nuevo y el sistema sigue oculto', () => {
    const root = fakeRoot();
    const { doc, state } = fakeDocument(root);
    const first = fakeCursor();
    state.cursor = first;
    const effect = new CursorEffect();
    effect.collect(doc);
    effect.tick(frameAt(10, 20));

    const second = fakeCursor();
    state.cursor = second;
    effect.collect(doc);
    effect.tick(frameAt(30, 40));

    expect(first.style.display).toBe('');
    expect(second.style).toEqual({ display: 'block', transform: 'translate3d(30px, 40px, 0)' });
    expect(root.attributes.has(MOTION_STATE.cursorActive)).toBe(true);
  });

  it('dispose esconde el cursor custom y quita la marca de <html>', () => {
    const root = fakeRoot();
    const { doc, state } = fakeDocument(root);
    const cursor = fakeCursor();
    state.cursor = cursor;
    const effect = new CursorEffect();
    effect.collect(doc);
    effect.tick(frameAt(10, 20));

    effect.dispose();

    expect(cursor.style.display).toBe('');
    expect(root.attributes.size).toBe(0);
  });
});
