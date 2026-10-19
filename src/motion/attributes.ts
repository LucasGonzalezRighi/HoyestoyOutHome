/**
 * Contrato entre el marcado y el motor de animación.
 *
 * El motor (`MotionEngine`) no conoce componentes: busca elementos por
 * atributos `data-*` y los anima en un único loop de `requestAnimationFrame`.
 * Es el mismo modelo del diseño de Claude Design, con nombres legibles.
 *
 * Dos reglas:
 *
 * 1. **Nadie escribe un `data-*` de animación a mano.** Los componentes usan
 *    los helpers de este archivo (`reveal('up', { delay: 2 })`) y los
 *    esparcen en el JSX: `<p {...reveal('left')}>`. Así un typo es un error
 *    de compilación y no una animación que no corre.
 * 2. **Los efectos leen los nombres de acá** (`MOTION_ATTRIBUTES` /
 *    `MOTION_SELECTORS`), nunca strings sueltos.
 *
 * Como son atributos y no hooks, las secciones pueden seguir siendo Server
 * Components: marcar un elemento para animarlo no requiere `'use client'`.
 */

/** Nombres de los atributos. La fuente de verdad de todo el sistema. */
export const MOTION_ATTRIBUTES = {
  /** Aparición atada al scroll (entrada y salida). Valor: `RevealVariant`. */
  reveal: 'data-reveal',
  /** Escalón de retraso de la aparición (entero: 0, 1, 2…). */
  revealDelay: 'data-reveal-delay',
  /** Porción del viewport que dura la aparición (0–1). Por defecto 0.16. */
  revealSpan: 'data-reveal-span',
  /** La aparición la dispara la intro (al hidratar), no el scroll. Solo sobre el fold. */
  revealIntro: 'data-reveal-intro',
  /** Capa de parallax vertical. Valor: factor (0.4 = se mueve al 40% del scroll relativo). */
  parallax: 'data-parallax',
  /** La capa de parallax arranca con zoom y lo pierde durante la intro. */
  parallaxZoom: 'data-parallax-zoom',
  /** Cinta infinita. Valor: dirección (1 o -1). El contenido tiene que venir duplicado. */
  marquee: 'data-marquee',
  /** Velocidad base de la cinta en px/frame. Por defecto 0.7. */
  marqueeSpeed: 'data-marquee-speed',
  /**
   * Las cintas de adentro están en pausa (el botón de `MarqueePauseGroup`).
   * Va en un **ancestro** de los rieles: el motor lo busca con `closest()` en
   * cada frame, porque el `MutationObserver` no re-escanea por atributos.
   */
  marqueePaused: 'data-marquee-paused',
  /** Relleno vertical de una línea de tiempo, atado al scroll. */
  timeline: 'data-timeline',
  /** Contador que sube hasta su valor al entrar en viewport. Valor: número final. */
  count: 'data-count',
  /** Formato del contador. Ver `CounterFormat`. */
  countFormat: 'data-count-format',
  /** Inclinación 3D + brillo que siguen al cursor. */
  tilt: 'data-tilt',
  /** Imagen dentro de un `tilt` que hace zoom mientras la card está inclinada. */
  tiltZoom: 'data-tilt-zoom',
  /** Botón magnético: se deja atraer por el cursor cercano. */
  magnet: 'data-magnet',
  /** Mientras la sección cruza el centro del viewport, el fondo de la página toma este color. */
  backgroundShift: 'data-bg-shift',
  /** El elemento cuyo fondo cambia (envuelve toda la página). */
  backgroundRoot: 'data-bg-root',
  /** Barra de progreso de lectura de la página. */
  scrollProgress: 'data-scroll-progress',
  /**
   * El nav. El motor le escribe `--nav-solid`: 0 transparente (sobre la foto de
   * portada, arriba de todo) a 1 sólido, a medida que se scrollea.
   */
  navBar: 'data-nav-bar',
  /**
   * Portada con foto que pasa por debajo del nav (el hero, la portada de un
   * viaje). Si la página tiene una, el nav arranca transparente; si no, sólido.
   */
  navOverlay: 'data-nav-overlay',
  /**
   * Par "cortina": la primera hija queda fija en pantalla y la segunda sube por
   * encima y la tapa. El motor fija la primera donde su borde de abajo toca el
   * de la pantalla y la achica y apaga mientras la segunda la cubre.
   */
  coverPair: 'data-cover-pair',
  /**
   * Sección fija que el scroll recorre como una secuencia (pedido del cliente,
   * octubre 2026, como el contacto de su portafolio): una palabra gigante
   * cerrada se parte hacia los costados y debajo aparece el contenido. El
   * motor escribe `--enter`, `--open`, `--reveal` y `--exit` (0 → 1).
   */
  pinSplit: 'data-pin-split',
  /** Lo que sube por encima de la secuencia al final (el footer) y la tapa. */
  pinExit: 'data-pin-exit',
  /** El cursor custom (la montaña que sigue al mouse). */
  cursor: 'data-cursor',
} as const;

/**
 * Atributos de **estado** que el motor pone en `<html>` (no se esparcen en JSX).
 *
 * El CSS global se cuelga de ellos para no depender de que el JS ande: si
 * falla, ninguno aparece y la página se ve como sin motor.
 */
export const MOTION_STATE = {
  /**
   * El cursor custom está andando (`CursorEffect`). `base.css` oculta el
   * cursor del sistema solo mientras está presente: si el JS falla, el cursor
   * normal sigue ahí.
   */
  cursorActive: 'data-cursor-active',
  /**
   * El motor tomó el control de la intro: al final de su primer frame, cuando
   * cada pieza de la intro ya tiene su pose inline (`MotionEngine`). Mientras
   * no está, `design-system/intro.css` deja esas piezas en su pose de arranque
   * (ocultas), para que no se vean enteras entre el primer pintado y la
   * hidratación; en cuanto aparece, la hoja deja de aplicar.
   */
  introControlled: 'data-intro-controlled',
} as const;

/** Clave de un atributo de animación (`'reveal'`, `'parallax'`…). */
export type MotionAttributeKey = keyof typeof MOTION_ATTRIBUTES;
/** Nombre real de un atributo de animación (`'data-reveal'`…). */
export type MotionAttributeName = (typeof MOTION_ATTRIBUTES)[MotionAttributeKey];

/** Selector CSS de presencia (`[data-reveal]`) para cada atributo. */
export const MOTION_SELECTORS = Object.fromEntries(
  Object.entries(MOTION_ATTRIBUTES).map(([key, name]) => [key, `[${name}]`]),
) as { readonly [K in MotionAttributeKey]: `[${(typeof MOTION_ATTRIBUTES)[K]}]` };

/** Objeto de atributos listo para esparcir en un elemento JSX. */
export type MotionAttributes = Readonly<Record<`data-${string}`, string>>;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Aparición                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Coreografías de aparición del diseño. Todas entran con el scroll y salen
 * al irse por arriba (no son play-once: el scroll las maneja en los dos sentidos).
 */
export type RevealVariant =
  /** Sube desde abajo. La de por defecto. */
  | 'up'
  /** Entra desde la izquierda con un giro leve (eyebrows, bullets). */
  | 'left'
  /** Entra desde la derecha (ítems del cronograma, links laterales). */
  | 'right'
  /** Sube girando y creciendo (cards de "Por qué viajar con nosotros"). */
  | 'rotate'
  /** Rueda desde la izquierda (platos de la pensión, logo del cierre). */
  | 'roll'
  /** Se despliega en X con perspectiva (cards "¿Puedo?" / "¿Es para mí?"). */
  | 'flip'
  /** Se destapa de abajo hacia arriba con `clip-path` (foto de Calle & Stepanek). */
  | 'clip'
  /** Crece desde el 55% (frases grandes: "La montaña te espera."). */
  | 'zoom'
  /** Sube creciendo (stats, equipo). */
  | 'scale'
  /** Banda que se expande y gana opacidad (foto grande, tarjeta de precio). */
  | 'expand'
  /** Palabra del titular del hero: sube desde detrás de una máscara con la intro (al hidratar). */
  | 'word';

/** Ajustes de `reveal()`: cuándo arranca la entrada, cuánto dura y si la maneja la intro. */
export type RevealOptions = {
  /** Escalón de retraso (entero). Cada escalón corre la entrada un 2% del viewport. */
  delay?: number;
  /** Porción del viewport que dura la entrada (0–1). Por defecto 0.16. */
  span?: number;
  /**
   * La maneja la intro (arranca cuando hidrata la página) en vez del scroll.
   * Solo para contenido sobre el fold: hasta que hidrata, `intro.css` lo deja
   * con opacidad 0.
   */
  intro?: boolean;
};

/**
 * Marca un elemento para que aparezca con el scroll.
 *
 * @example <h2 {...reveal('up', { delay: 1 })}>…</h2>
 */
export function reveal(
  variant: RevealVariant = 'up',
  options: RevealOptions = {},
): MotionAttributes {
  const attributes: Record<string, string> = { [MOTION_ATTRIBUTES.reveal]: variant };
  if (options.delay !== undefined)
    attributes[MOTION_ATTRIBUTES.revealDelay] = String(options.delay);
  if (options.span !== undefined) attributes[MOTION_ATTRIBUTES.revealSpan] = String(options.span);
  if (options.intro) attributes[MOTION_ATTRIBUTES.revealIntro] = '';
  return attributes as MotionAttributes;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Scroll                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Capa de parallax. El motor la traslada en Y en función de la posición de su
 * **padre** en el viewport, así que el padre tiene que ser el marco que recorta
 * (`overflow: hidden`) y la capa tiene que ser más alta que el marco.
 *
 * @param factor Fracción del desplazamiento del padre (0.4 en el hero, -0.3 en un círculo que sube).
 * @param options.introZoom Arranca con zoom y lo suelta durante la intro (fotos grandes). Hasta
 *   que hidrata la página, `intro.css` la deja con ese zoom de arranque.
 */
export function parallax(factor: number, options: { introZoom?: boolean } = {}): MotionAttributes {
  const attributes: Record<string, string> = { [MOTION_ATTRIBUTES.parallax]: String(factor) };
  if (options.introZoom) attributes[MOTION_ATTRIBUTES.parallaxZoom] = '';
  return attributes as MotionAttributes;
}

/** Ajustes de `marquee()`: sentido y velocidad base de la cinta. */
export type MarqueeOptions = {
  /** 1 = hacia la izquierda, -1 = hacia la derecha. */
  direction?: 1 | -1;
  /** px por frame antes de sumar la velocidad del scroll. Por defecto 0.7. */
  speed?: number;
};

/**
 * Cinta infinita. **El riel tiene que contener el contenido dos veces**: el
 * motor lo traslada hasta la mitad de su ancho y lo vuelve a empezar. Usar el
 * organism `Marquee`, que ya duplica y marca la copia como `aria-hidden`.
 */
export function marquee(options: MarqueeOptions = {}): MotionAttributes {
  const attributes: Record<string, string> = {
    [MOTION_ATTRIBUTES.marquee]: String(options.direction ?? 1),
  };
  if (options.speed !== undefined)
    attributes[MOTION_ATTRIBUTES.marqueeSpeed] = String(options.speed);
  return attributes as MotionAttributes;
}

/**
 * Pausa de las cintas que contiene el elemento: con `paused`, el motor deja de
 * avanzarlas (como con el mouse encima; el skew por el scroll sigue). Va en un
 * envoltorio de las cintas, no en el riel. Devuelve el atributo **solo si está
 * en pausa**: sin pausa, el elemento queda sin atributo.
 *
 * Cambia en vivo: lo maneja el estado de un Client Component
 * (`MarqueePauseGroup`, en el organism `Marquee`).
 *
 * @example <div {...marqueePause(paused)}>…cintas…</div>
 */
export function marqueePause(paused: boolean): MotionAttributes {
  return paused ? { [MOTION_ATTRIBUTES.marqueePaused]: '' } : {};
}

/**
 * Relleno de una línea de tiempo. Va en la barra que se escala en Y; el motor
 * mide a su **padre** (el riel completo).
 */
export function timelineFill(): MotionAttributes {
  return { [MOTION_ATTRIBUTES.timeline]: '' };
}

/**
 * Formatos del contador:
 * - `plain`: número con separador de miles de es-AR (`1.900`).
 * - `thousands`: el valor está expresado en miles y se le agrega `.000` (`690` → `690.000`).
 */
export type CounterFormat = 'plain' | 'thousands';

/**
 * Contador que sube de 0 a `value` al entrar en viewport. El texto inicial del
 * elemento debería ser el valor final ya formateado, para que sin JS se lea bien.
 */
export function counter(value: number, format: CounterFormat = 'plain'): MotionAttributes {
  const attributes: Record<string, string> = { [MOTION_ATTRIBUTES.count]: String(value) };
  if (format !== 'plain') attributes[MOTION_ATTRIBUTES.countFormat] = format;
  return attributes as MotionAttributes;
}

/** Mientras el elemento cruza el centro del viewport, el fondo de la página pasa a `color`. */
export function backgroundShift(color: string): MotionAttributes {
  return { [MOTION_ATTRIBUTES.backgroundShift]: color };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Puntero                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

/** Inclinación 3D + brillo que siguen al cursor. */
export function tilt(): MotionAttributes {
  return { [MOTION_ATTRIBUTES.tilt]: '' };
}

/** Imagen que hace zoom mientras su card `tilt` está inclinada. */
export function tiltZoom(): MotionAttributes {
  return { [MOTION_ATTRIBUTES.tiltZoom]: '' };
}

/** Botón magnético. */
export function magnet(): MotionAttributes {
  return { [MOTION_ATTRIBUTES.magnet]: '' };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Piezas globales (las usa `features/site-chrome` y el layout)               */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * El envoltorio de toda la página cuyo fondo cambia de color. Las secciones con
 * `backgroundShift()` le escriben el color; tiene que haber uno solo (el layout).
 */
export function backgroundRoot(): MotionAttributes {
  return { [MOTION_ATTRIBUTES.backgroundRoot]: '' };
}

/** Barra de progreso de lectura de la página (`site-chrome`): el motor le escribe un `scaleX`. */
export function scrollProgress(): MotionAttributes {
  return { [MOTION_ATTRIBUTES.scrollProgress]: '' };
}

/** Marca el nav: el motor le escribe `--nav-solid` según el scroll (`NavBarEffect`). */
export function navBar(): MotionAttributes {
  return { [MOTION_ATTRIBUTES.navBar]: '' };
}

/** Marca una portada con foto que pasa por debajo del nav: el nav arranca transparente. */
export function navOverlay(): MotionAttributes {
  return { [MOTION_ATTRIBUTES.navOverlay]: '' };
}

/**
 * Marca un par "cortina" (`CoverPairEffect`): la primera hija queda fija y la
 * segunda la tapa al scrollear. Va en el envoltorio de las dos.
 */
export function coverPair(): MotionAttributes {
  return { [MOTION_ATTRIBUTES.coverPair]: '' };
}

/**
 * Marca una secuencia fija con palabra partida (`PinSplitEffect`). Va en el
 * envoltorio alto; su primera hija es el panel que queda fijo.
 */
export function pinSplit(): MotionAttributes {
  return { [MOTION_ATTRIBUTES.pinSplit]: '' };
}

/** Marca lo que sube por encima de la secuencia al terminar (el footer). */
export function pinExit(): MotionAttributes {
  return { [MOTION_ATTRIBUTES.pinExit]: '' };
}

/** El cursor custom (la montaña que sigue al mouse, `site-chrome`). */
export function cursor(): MotionAttributes {
  return { [MOTION_ATTRIBUTES.cursor]: '' };
}
