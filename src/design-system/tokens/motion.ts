/**
 * Tokens del motor de animación (`src/motion/`).
 *
 * Todos los números salen del motor original del diseño: el
 * `<script type="text/x-dc">` al pie de `docs/design/hoy-estoy-ooh-landing.dc.html`.
 * Cada constante cita su línea (`dc.html:478` = línea 478 de ese archivo) para
 * poder volver a la fuente cuando algo no se ve igual.
 *
 * Regla: **ningún efecto escribe un número suelto**, lo importa de acá. La única
 * excepción es la tabla de coreografías de los reveals
 * (`src/motion/math/revealTransforms.ts`), que es en sí misma una tabla de números
 * y pierde legibilidad si se parte en constantes.
 *
 * Las curvas de las transiciones usan las custom properties de `tokens.css`
 * (`--ease-reveal`, `--ease-spring`…): son las mismas `cubic-bezier` del diseño,
 * con nombre, y así hay una sola fuente para CSS y para el motor.
 */

/* ────────────────────────────────────────────────────────────────────────── */
/*  Intensidad                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Niveles de intensidad: la perilla "Animaciones" del diseño (`dc.html:418`).
 *
 * El valor es el multiplicador `k` que escala desplazamientos y giros de todos
 * los efectos. `apagado` (0) deja la página quieta, igual que reduced motion.
 */
export const MOTION_LEVELS = {
  suave: 0.6,
  equilibrado: 1,
  exagerado: 1.8,
  apagado: 0,
} as const;

/** Nombre de un nivel de intensidad. Es lo que se escribe en `NEXT_PUBLIC_MOTION_LEVEL`. */
export type MotionLevel = keyof typeof MOTION_LEVELS;

/** El default del diseño (`dc.html:418`: `this.props.motion ?? 'Exagerado'`). */
export const DEFAULT_MOTION_LEVEL: MotionLevel = 'exagerado';

function isMotionLevel(value: string): value is MotionLevel {
  return Object.hasOwn(MOTION_LEVELS, value);
}

/**
 * Traduce el valor crudo de la variable de entorno a un nivel válido.
 *
 * Tolera mayúsculas y espacios (`"Exagerado "` es `exagerado`, como lo escribe
 * la perilla del diseño). Cualquier otra cosa —vacío, typo— cae en el default,
 * igual que el `?? 1.8` del original: una variable mal escrita no puede dejar
 * la landing sin animaciones sin que nadie se entere.
 */
export function resolveMotionLevel(raw?: string): MotionLevel {
  const normalized = raw?.trim().toLowerCase();
  return normalized !== undefined && isMotionLevel(normalized) ? normalized : DEFAULT_MOTION_LEVEL;
}

/**
 * Si `prefers-reduced-motion: reduce` apaga el movimiento (como el nivel `apagado`).
 *
 * **Está en `true` porque así lo hace el diseño** (`dc.html:419`: `off()` mira la
 * media query en cada frame). Kora decidió lo contrario (`false`): en Windows esa
 * preferencia se activa sola con el ahorro de batería, y el sitio se les veía
 * quieto a personas que nunca la eligieron. Acá se sigue al diseño: para quien
 * la eligió por vértigo o migraña, el parallax y los reveals exagerados son
 * justamente lo que le hace mal.
 *
 * Este es el único lugar donde se decide. Ponerlo en `false` no toca ningún efecto.
 */
export const RESPECT_OS_REDUCED_MOTION = true;

/** Media queries que consulta el motor. */
export const MOTION_MEDIA = {
  /** Preferencia del sistema (`dc.html:419`). */
  reducedMotion: '(prefers-reduced-motion: reduce)',
  /** Hay un mouse de verdad: sin esto no hay cursor custom (`dc.html:424`). */
  finePointer: '(pointer: fine)',
} as const;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Transiciones que el motor pone inline                                     */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Transición de cada reveal (`RV_T`, `dc.html:405`). Suaviza el salto entre
 * frames del scroll: el motor escribe la pose "objetivo" y el navegador la
 * alcanza en 0,75 s. Se pone solo si el elemento no trae una transición inline.
 */
export const REVEAL_TRANSITION =
  'transform .75s var(--ease-reveal), opacity .75s, filter .75s, clip-path 1s var(--ease-in-out)';

/** Transición de los botones magnéticos: rebote corto (`dc.html:466`). */
export const MAGNET_TRANSITION = 'transform .35s var(--ease-spring)';

/** Transición de las cards con tilt, para que entren y salgan de la inclinación sin saltos (`dc.html:613`). */
export const TILT_TRANSITION = 'transform .5s var(--ease-reveal), box-shadow .5s';

/**
 * Ventana de asentamiento del loop, en ms. **No está en el diseño**: es un
 * arreglo deliberado (CLAUDE.md §9).
 *
 * El motor solo mide y escribe cuando cambia la firma del frame (scroll,
 * viewport, intro, intensidad). Pero lo que mide puede seguir
 * moviéndose después del último cambio: un contador adentro de un reveal lee
 * su `getBoundingClientRect()` mientras la transición del reveal
 * (`REVEAL_TRANSITION`) todavía lo desplaza, y si la firma se queda quieta
 * justo ahí, el contador se congela a mitad de camino (en la QA, parando el
 * scroll en las stats de Lolog: "3 días / 2 noches" en vez de "4 / 3", igual
 * en el diseño que en el port).
 *
 * Por eso, después del último cambio de scroll, viewport, intro o intensidad
 * el motor sigue midiendo y escribiendo durante esta ventana, y recién después
 * vuelve a ahorrar frames. La velocidad del scroll no la abre ni la extiende:
 * nada de lo que se mide o se escribe con el scroll depende de ella (ver
 * `MotionEngine.needsLayout`).
 *
 * Tiene que durar **al menos la transición más larga de `REVEAL_TRANSITION`**
 * (el `clip-path` de 1 s) más unos frames de margen (100 ms ≈ 6 frames a 60 Hz),
 * para que la última lectura sea con todo quieto. Si se alarga esa transición,
 * se alarga esto: lo controla `motion.test.ts`.
 */
export const SETTLE_MS = 1100;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Intro                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Duración de la intro, en ms: el progreso 0→1 que consumen las palabras del
 * titular del hero, los reveals marcados con `intro` y el zoom de las fotos
 * con `introZoom` (`dc.html:480`).
 *
 * En el diseño la intro arrancaba 500 ms después de que se abrieran las hojas
 * del telón de entrada (`dc.html:439`). El telón se sacó por pedido del
 * cliente (octubre 2026): la intro arranca en el primer frame del motor, al
 * hidratar (`MotionEngine`), y hasta entonces `design-system/intro.css` deja
 * cada pieza en su pose de arranque.
 */
export const INTRO_DURATION_MS = 1600;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Scroll                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

/** Velocidad del scroll: la que acelera y deforma las cintas (`dc.html:478-479`). */
export const SCROLL = {
  /** Suavizado exponencial de la velocidad por frame: 12% hacia el valor nuevo. */
  smoothing: 0.12,
  /** Tope en px/frame: un scroll brusco no rompe las deformaciones. */
  maxVelocity: 60,
  /** Por debajo de esto la velocidad es 0: evita que la cola del suavizado mantenga todo recalculando. */
  deadZone: 0.05,
} as const;

/**
 * Ventana de scroll de los reveals (`dc.html:573-578`). Todo en fracciones del
 * alto del viewport.
 */
export const REVEAL = {
  /** La entrada empieza cuando el borde de arriba cruza el 102% del viewport (un poco antes de verse). */
  entryLine: 1.02,
  /** Cada escalón de `delay` corre la entrada un 2% del viewport. */
  delayStep: 0.02,
  /** Porción del viewport que dura la entrada si no se pasa `span`. */
  defaultSpan: 0.16,
  /** La salida (por arriba) ocurre mientras el borde de abajo recorre el 22% superior. */
  exitSpan: 0.22,
  /** Un reveal ya posado que está a más de 1,6 viewports abajo… */
  parkBelow: 1.6,
  /** …o a más de 0,6 viewports arriba no se recalcula. */
  parkAbove: 0.6,
  /** Los reveals de intro corren a 2,2× el progreso de la intro… */
  introSpeed: 2.2,
  /** …y cada escalón de `delay` los atrasa un 7% de la intro (palabra por palabra en el hero). */
  introDelayStep: 0.07,
} as const;

/** Capas de parallax (`dc.html:565-566`). */
export const PARALLAX = {
  /** Tope de intensidad: con más, las fotos se salen de su marco. */
  maxIntensity: 1.3,
  /** Zoom extra con el que arrancan las fotos marcadas con `introZoom` (18%). */
  introZoom: 0.18,
  /** Tope de intensidad para ese zoom. */
  introZoomMaxIntensity: 1.2,
} as const;

/** Cintas infinitas (`dc.html:496-500`). */
export const MARQUEE = {
  /** px por frame si el elemento no trae `speed`. */
  defaultSpeed: 0.7,
  /** Cuánto de la velocidad del scroll se suma a la de la cinta. */
  velocityBoost: 0.35,
  /** Intensidad mínima: en `suave` las cintas no van más lento que en `equilibrado`. */
  minIntensity: 1,
  /** Inclinación en grados por px/frame de velocidad del scroll. */
  skewDeg: 0.18,
  /**
   * Margen (px) arriba y abajo del viewport dentro del cual una cinta cuenta
   * como visible y sigue avanzando. **No está en el diseño** (CLAUDE.md §9): el
   * original movía las cuatro cintas en cada frame aunque no se vieran.
   *
   * La visibilidad se mide en la fase de lectura, con el scroll del frame;
   * pero el navegador scrollea en el compositor y puede mostrar unos px más de
   * lo que el motor midió. Con el margen, la cinta ya está corriendo (y
   * escribiendo su skew) unos frames antes de asomar, y no se la ve quieta en
   * el borde. 200 px son cuatro frames de un scroll rápido (50 px/frame).
   */
  visibilityMarginPx: 200,
} as const;

/** Relleno de la línea de tiempo del cronograma (`dc.html:550`). */
export const TIMELINE = {
  /** El relleno llega hasta la línea del 60% del viewport. */
  fillLine: 0.6,
} as const;

/** Contadores (`dc.html:553`). */
export const COUNTER = {
  /** Cuentan mientras el elemento sube la primera mitad del viewport. */
  span: 0.5,
} as const;

/** Fondo de la página que cambia por sección (`dc.html:531`). */
export const BACKGROUND_SHIFT = {
  /** La sección manda cuando pisa la franja central del viewport, entre el 45%… */
  bandStart: 0.45,
  /** …y el 55%. */
  bandEnd: 0.55,
  /** Fondo cuando ninguna sección pide otro color. */
  fallback: 'var(--color-bg)',
} as const;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Puntero                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

/** Botones magnéticos (`dc.html:509`). */
export const MAGNET = {
  /** Distancia en px desde el centro del botón a la que empieza a atraer. */
  radius: 110,
  /** Fracción de la distancia al cursor que el botón se deja arrastrar (× intensidad). */
  strength: 0.35,
  /** Crece apenas mientras atrae. */
  scale: 1.06,
} as const;

/** Inclinación 3D + brillo de las cards (`dc.html:616-620`). */
export const TILT = {
  /** Diámetro del brillo que sigue al cursor. */
  glowSizePx: 420,
  /** Blanco al 42%: el brillo tiene que leerse igual sobre crema y sobre verde oscuro. */
  glowColor: 'rgba(255,255,255,.42)',
  /** El brillo se desvanece al 60% de su radio. */
  glowFadePct: 60,
  /** Sombra de la card mientras está levantada. */
  shadow: 'var(--shadow-lg)',
  /** Profundidad de la perspectiva. */
  perspectivePx: 1000,
  /** Grados de `rotateX` de borde a borde (× intensidad). */
  rotateXDeg: 8,
  /** Grados de `rotateY` de borde a borde (× intensidad). */
  rotateYDeg: 11,
  /** La card sube 8px (`translateY(-8px)`): se despega de la página mientras está inclinada. */
  liftPx: -8,
  /** Y crece un 2%. */
  scale: 1.02,
  /** Zoom de la imagen `tiltZoom` de adentro. */
  zoomScale: 1.1,
} as const;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Nav y cortinas                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Nav sobre la foto de portada (`NavBarEffect`, pedido del cliente, octubre
 * 2026): arriba de todo es transparente y en estos px de scroll llega a
 * sólido (el crema de la página con su desenfoque). Más corto se siente como
 * un corte; más largo, el nav queda a medio pintar sobre el contenido.
 */
export const NAV_OVERLAY = {
  solidDistancePx: 140,
} as const;

/**
 * Cortina (`CoverPairEffect`, pedido del cliente, octubre 2026): mientras la
 * sección de abajo sube y tapa a la fija, la fija se achica y se apaga hasta
 * estos valores, como si se alejara. No se multiplican por la intensidad: es
 * un gesto chico y un 1,8 lo volvía un zoom. Con el movimiento apagado, nada.
 */
export const COVER = {
  /** Cuánto se achica la sección tapada al final (escala 1 → 0,95). */
  scale: 0.05,
  /** Cuánto se apaga (opacidad 1 → 0,55). */
  fade: 0.45,
} as const;

/**
 * Secuencia fija del Contacto (`PinSplitEffect`, pedido del cliente, octubre
 * 2026, igual que el contacto de su portafolio). Los tramos son fracciones del
 * recorrido fijo: la palabra se abre de 0,10 a 0,52 y el contenido aparece de
 * 0,40 a 0,72; el resto es lectura quieta. Sin lugar para fijarse (un
 * teléfono), todo se abre a medida que la sección entra en pantalla.
 */
export const PIN_SPLIT = {
  openFrom: 0.1,
  openSpan: 0.42,
  revealFrom: 0.4,
  revealSpan: 0.32,
  /** Hasta dónde scrollea el foco para que el formulario se vea entero (después de que termina de aparecer). */
  focusAt: 0.75,
  /** Sin fijarse: la sección empieza a abrirse con el borde de arriba al 78% de la pantalla… */
  flowStart: 0.78,
  /** …y termina de abrirse 52% de pantalla después. */
  flowSpan: 0.52,
  /** Sin fijarse, el contenido aparece desde que la palabra va por este punto. */
  flowRevealFrom: 0.35,
  flowRevealSpan: 0.5,
} as const;
