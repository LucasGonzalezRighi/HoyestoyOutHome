import { clamp01 } from '../math/clamp';

/**
 * Reloj de la intro: el progreso 0→1 que arranca cuando se abre el telón
 * (`dc.html:480`). Lo consumen las palabras del titular, los reveals marcados
 * con `intro` y el zoom de las fotos grandes.
 */
export class IntroClock {
  private startAt: number | null = null;

  /** @param durationMs Cuánto tarda la intro en llegar a 1. */
  constructor(private readonly durationMs: number) {}

  /** Programa el arranque. `atMs` puede estar en el futuro: hasta entonces el progreso es 0. */
  begin(atMs: number): void {
    this.startAt = atMs;
  }

  /** Progreso en `nowMs` (timestamp de `requestAnimationFrame`). 0 si todavía no se programó. */
  progress(nowMs: number): number {
    return this.startAt === null ? 0 : clamp01((nowMs - this.startAt) / this.durationMs);
  }
}
