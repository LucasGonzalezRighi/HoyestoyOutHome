/**
 * Configuración vigente del motor. Es lo que un efecto de puntero necesita
 * saber entre frames (el tilt reacciona al evento, no al loop).
 */
export type MotionSettings = {
  /** Multiplicador `k` del nivel de animaciones (0.6 / 1 / 1.8; 0 = apagado). */
  readonly intensity: number;
  /**
   * El movimiento está apagado: nivel `apagado` o reduced motion. Se evalúa en
   * cada frame, así que cambiar la preferencia del sistema con la página
   * abierta se respeta sin recargar. Como en el diseño, las cintas y los
   * imanes lo notan en el frame siguiente; lo atado al scroll, en el primer
   * frame en que algo se mueva (la firma del frame no incluye `off`).
   */
  readonly off: boolean;
};

/** Estado del puntero congelado al arrancar el frame. */
export type PointerSnapshot = {
  /** Posición del mouse en coordenadas del viewport (px). Arranca en el centro. */
  readonly x: number;
  readonly y: number;
  /** El mouse se movió desde el frame anterior (los imanes solo miden si es así). */
  readonly moved: boolean;
  /** Hay un mouse de verdad (`pointer: fine`): sin esto no hay cursor custom. */
  readonly fine: boolean;
};

/**
 * Todo lo que un efecto necesita saber de un frame. El motor lo arma una vez
 * al principio del frame y lo pasa a todos los efectos: nadie vuelve a leer
 * `window.innerHeight` ni el scroll por su cuenta (serían lecturas de layout
 * repetidas, y podrían dar distinto entre un efecto y otro).
 */
export type FrameState = MotionSettings & {
  /** Timestamp de `requestAnimationFrame` (ms, misma base que `performance.now()`). */
  readonly time: number;
  /** Scroll vertical de la página (px). */
  readonly scrollY: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  /**
   * Velocidad del scroll suavizada, en px/frame: con zona muerta y topeada a
   * ±60 (ver `SCROLL` en los tokens). Negativa al subir.
   */
  readonly velocity: number;
  /** Progreso de la intro del telón, 0–1. Queda en 0 hasta que se abre el telón. */
  readonly intro: number;
  readonly pointer: PointerSnapshot;
};
