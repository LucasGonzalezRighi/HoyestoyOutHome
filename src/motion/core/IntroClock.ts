import { clamp01 } from '../math/clamp';

/**
 * Reloj de la intro: el progreso 0→1 que consumen las palabras del titular,
 * los reveals marcados con `intro` y el zoom de las fotos grandes
 * (`dc.html:480`).
 *
 * En el diseño arrancaba cuando se abría el telón de entrada; sin telón, lo
 * arranca el motor en su primer frame, al hidratar (`MotionEngine`).
 */
export class IntroClock {
  private startAt: number | null = null;

  /** @param durationMs Cuánto tarda la intro en llegar a 1. */
  constructor(private readonly durationMs: number) {}

  /** Programa el arranque. `atMs` puede estar en el futuro: hasta entonces el progreso es 0. */
  begin(atMs: number): void {
    this.startAt = atMs;
  }

  /** Da la intro por terminada: desde ahora el progreso es 1, sin pasar por el medio. */
  finish(): void {
    this.startAt = Number.NEGATIVE_INFINITY;
  }

  /** Progreso en `nowMs` (timestamp de `requestAnimationFrame`). 0 si todavía no se programó. */
  progress(nowMs: number): number {
    return this.startAt === null ? 0 : clamp01((nowMs - this.startAt) / this.durationMs);
  }
}
