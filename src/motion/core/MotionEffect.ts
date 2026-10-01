import type { FrameState, MotionSettings } from './FrameState';

/**
 * Un efecto del motor: se engancha a un atributo `data-*` y anima los
 * elementos que lo tienen.
 *
 * El motor le habla a todos los efectos por las mismas fases, en el orden en
 * que se registraron en `createMotionEngine`, sin saber cuál es cuál
 * (polimorfismo: nunca pregunta "¿sos un reveal?"). Cada fase trae una
 * implementación vacía; las subclases de abajo marcan como obligatoria la fase
 * que las define, y un efecto puede sumar otra si la necesita (la cinta, por
 * ejemplo, corre cada frame pero se resetea en la fase de escritura).
 *
 * Fases de un frame, en orden:
 *
 * 1. `collect` — solo si el DOM cambió: re-escanear los elementos.
 * 2. `measure` — solo si el frame toca layout (cambió el scroll, el viewport,
 *    la intro, la intensidad o la velocidad redondeada, o sigue abierta la
 *    ventana de asentamiento, `SETTLE_MS`): **leer** el layout.
 * 3. `tick` — cada frame, sin mirar el scroll.
 * 4. `apply` — igual que `measure`: **escribir** estilos. Nunca se lee acá.
 *
 * Fuera del loop: `onPointerMove` en cada `pointermove`, y `dispose` al desmontar.
 */
export abstract class MotionEffect {
  /** Re-escanea el documento. Corre al arrancar y cada vez que el DOM cambia o se redimensiona la ventana. */
  collect(_doc: Document): void {
    // Por defecto, el efecto no busca elementos.
  }

  /** Trabajo de cada frame (cursor, cintas, imanes). */
  tick(_frame: FrameState): void {
    // Por defecto, el efecto no corre en cada frame.
  }

  /** Fase de lectura: medir con `getBoundingClientRect` y guardar. Nada de escribir estilos. */
  measure(_frame: FrameState): void {
    // Por defecto, el efecto no mide nada.
  }

  /** Fase de escritura: escribir estilos con lo medido. Nada de leer layout. */
  apply(_frame: FrameState): void {
    // Por defecto, el efecto no escribe con el scroll.
  }

  /** Reacción a un movimiento del mouse, fuera del loop. */
  onPointerMove(_event: PointerEvent, _settings: MotionSettings): void {
    // Por defecto, el efecto ignora el puntero.
  }

  /** Limpieza al apagar el motor (atributos de estado, elementos a medio animar). */
  dispose(): void {
    // Por defecto, no hay nada que limpiar.
  }
}

/**
 * Efecto que corre **en cada frame**, haya scroll o no (el cursor, las cintas).
 * Tiene que ser barato: idealmente solo escribe `transform`.
 */
export abstract class FrameEffect extends MotionEffect {
  abstract override tick(frame: FrameState): void;
}

/**
 * Efecto atado al scroll: corre solo en los frames en que cambió algo (scroll,
 * viewport, intro, intensidad o velocidad) y en los de la ventana de
 * asentamiento que abre cada cambio de scroll, viewport, intro o intensidad
 * (`SETTLE_MS`; un cambio de velocidad mide ese frame pero no la abre). Mide
 * en `measure` y escribe en `apply`; los que no necesitan medir (drift, skew)
 * dejan `measure` vacío. Como `apply` puede correr varias veces con la misma
 * entrada, tiene que dar lo mismo cada vez (escribir con `StyleWriter` evita
 * las escrituras repetidas).
 */
export abstract class ScrollEffect extends MotionEffect {
  abstract override apply(frame: FrameState): void;
}

/** Efecto que reacciona al mouse en el momento del evento (el tilt). */
export abstract class PointerEffect extends MotionEffect {
  abstract override onPointerMove(event: PointerEvent, settings: MotionSettings): void;
}
