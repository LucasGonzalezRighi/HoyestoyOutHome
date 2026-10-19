'use client';

import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { VisuallyHidden } from '@/components/atoms/VisuallyHidden';
import type { TripsControlsContent } from '@/content/sections/trips';
import {
  MOTION_LEVELS,
  MOTION_MEDIA,
  RESPECT_OS_REDUCED_MOTION,
  resolveMotionLevel,
} from '@/design-system/tokens/motion';
import { reveal } from '@/motion/attributes';

import {
  formatCounter,
  scrollLeftToReveal,
  settledSpan,
  stepIndex,
  type FanDirection,
} from './fanNavigation';
import styles from './TripsFan.module.css';

/** Trazo de los íconos: Lucide a 2.75, regla del design system Organic. */
const ICON_STROKE_WIDTH = 2.75;

/** Lado del ícono de las flechas en px, dentro del botón redondo de 46px. */
const ICON_SIZE = 20;

/**
 * El nivel de animaciones del build (`NEXT_PUBLIC_MOTION_LEVEL`) apaga el
 * movimiento del abanico, como lo hace con el motor. Next fija la variable en
 * el build.
 */
const MOTION_OFF_BY_LEVEL =
  MOTION_LEVELS[resolveMotionLevel(process.env.NEXT_PUBLIC_MOTION_LEVEL)] === 0;

/** Un panel del abanico: lo que hace falta para abrirlo, y el panel ya renderizado en el servidor. */
export type TripsFanItem = {
  /** Clave estable (el slug del viaje). */
  readonly id: string;
  /** Lo que se anuncia cuando una flecha abre este panel ("Viaje 2 de 4: …"). */
  readonly positionLabel: string;
  /** El panel (`TripPanel`), un Server Component. El abanico lo envuelve en su `<li>`. */
  readonly content: ReactNode;
};

/** Props de `TripsFan`. Todo es serializable: lo renderiza un Server Component. */
export type TripsFanProps = {
  /** Columna izquierda del encabezado: eyebrow y título, ya renderizados. */
  heading: ReactNode;
  /** Arriba de los controles, en la columna derecha: bajada y datos. */
  intro: ReactNode;
  /** Nombres accesibles de las flechas (`landingContent.trips.controls`). */
  labels: TripsControlsContent;
  /** Los paneles, en orden. El primero arranca abierto. */
  items: readonly TripsFanItem[];
};

/** Qué panel está abierto y si hay que decirlo en voz alta. */
type FanState = {
  /** Índice del panel abierto. */
  readonly index: number;
  /**
   * Lo abrió una flecha: su posición se anuncia en la región viva. Si lo abrió
   * el mouse, un toque o el foco no hace falta: quien navega con lector de
   * pantalla ya está parado en el panel.
   */
  readonly announced: boolean;
};

/** El primer viaje abierto: así sale del servidor. */
const INITIAL_STATE: FanState = { index: 0, announced: false };

/** Custom property con la que el abanico recibe cuántos paneles tiene: de ahí sale cuánto mide cada uno. */
type CountStyle = CSSProperties & Record<'--trips-count', number>;

/** Custom property con la que el contador recibe qué número mostrar. */
type ActiveStyle = CSSProperties & Record<'--fan-active', number>;

/**
 * Suave, salvo con el movimiento apagado (nivel `apagado` o, si se respeta,
 * `prefers-reduced-motion`): ahí `instant`. No `auto`, que tomaría el
 * `scroll-behavior` que tenga la fila.
 */
function scrollBehavior(): ScrollBehavior {
  const reduced =
    RESPECT_OS_REDUCED_MOTION && window.matchMedia(MOTION_MEDIA.reducedMotion).matches;
  return MOTION_OFF_BY_LEVEL || reduced ? 'instant' : 'smooth';
}

/**
 * Deja a la vista el panel que una flecha acaba de abrir, si la fila scrollea.
 *
 * Con los cuatro viajes de hoy la fila entra entera y esto no hace nada. Hace
 * falta cuando hay tantos viajes que los paneles llegan a su ancho mínimo: ahí
 * la fila scrollea de costado y una flecha puede abrir un panel que no se ve.
 * Mueve solo la fila (`scrollTo`), no la página.
 *
 * Los anchos se leen del DOM, pero no los del panel que se abre ni del que se
 * cierra, que están a mitad de transición: el cerrado es el más angosto de la
 * fila, y el abierto, lo que queda del ancho total.
 */
function revealPanel(list: HTMLElement, index: number) {
  if (list.scrollWidth <= list.clientWidth) return;
  const widths = Array.from(list.children, (panel) => panel.getBoundingClientRect().width);
  const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
  const closedSize = Math.min(...widths);
  const openSize = list.scrollWidth - (widths.length - 1) * (closedSize + gap);
  const left = scrollLeftToReveal(settledSpan(index, { closedSize, openSize, gap }), {
    scrollLeft: list.scrollLeft,
    size: list.clientWidth,
  });
  if (left !== null) list.scrollTo({ left, behavior: scrollBehavior() });
}

/**
 * El abanico de "Próximos viajes": los viajes como paneles de foto lado a
 * lado, uno abierto y el resto en franjas, más el encabezado con el contador
 * y las flechas.
 *
 * **Quién abre un panel:**
 * - el mouse, al pasar por encima (`pointerenter` que no sea táctil);
 * - un toque o un clic sobre una franja cerrada (`click`, no `pointerdown`:
 *   así deslizar el dedo para scrollear la página no abre nada). El toque no
 *   navega: el botón "Ver detalles" de una franja cerrada queda debajo de su
 *   leyenda (ver `TripPanel.module.css`);
 * - el foco, cuando entra con Tab al link de un panel;
 * - las flechas, que pasan al anterior o al siguiente y dan la vuelta en los
 *   extremos (`stepIndex`).
 *
 * El contador ("01 / 04", con los dígitos que ruedan) y la barra de
 * segmentos siguen al panel abierto. Son decorativos (`aria-hidden`): para el
 * lector de pantalla los cuatro viajes se leen siempre enteros, y cuando una
 * flecha cambia de panel la región viva dice cuál es.
 *
 * **El estado es un índice y nada más.** Este componente marca el `<li>`
 * abierto con `data-active` y el CSS hace el resto: el `<li>` traduce el
 * atributo a `--trip-open` (0 o 1) y de ahí salen el ancho, la foto y el
 * texto de cada panel. Las transiciones son de CSS, así que se pueden
 * interrumpir: pasar rápido el mouse por los cuatro las redirige desde donde
 * estén, sin reiniciar nada.
 *
 * **Sin JS** el abanico se ve igual, con el primer viaje abierto, y lo maneja
 * el CSS (`@media (scripting: none)` en el módulo): se abre el panel que está
 * bajo el cursor o el que tiene el foco. Las flechas y el contador, que sin JS
 * no harían nada, no se muestran.
 *
 * Es Client Component por ese índice; el encabezado y los paneles llegan ya
 * renderizados en el servidor (`heading`, `intro`, `items`).
 */
export function TripsFan({ heading, intro, labels, items }: TripsFanProps) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [fan, setFan] = useState(INITIAL_STATE);

  /** Abre un panel sin anunciarlo (mouse, toque o foco). */
  function open(index: number) {
    setFan((current) => (current.index === index ? current : { index, announced: false }));
  }

  /** Pasa al panel anterior o al siguiente, lo anuncia y lo deja a la vista. */
  function step(direction: FanDirection) {
    const index = stepIndex(fan.index, direction, items.length);
    setFan({ index, announced: true });
    if (listRef.current) revealPanel(listRef.current, index);
  }

  const countStyle: CountStyle = { '--trips-count': items.length };
  const activeStyle: ActiveStyle = { '--fan-active': fan.index };

  return (
    <div
      className={styles.fan}
      style={countStyle}
      data-still={MOTION_OFF_BY_LEVEL ? '' : undefined}
    >
      <div className={styles.header}>
        <div>{heading}</div>
        <div className={styles.aside}>
          {intro}
          <div className={styles.controls} {...reveal('up', { delay: 4 })}>
            <p className={styles.counter} aria-hidden="true">
              <span className={styles.counterWindow}>
                <span className={styles.counterStrip} style={activeStyle}>
                  {items.map((item, index) => (
                    <span key={item.id} className={styles.counterNumber}>
                      {formatCounter(index + 1)}
                    </span>
                  ))}
                </span>
              </span>
              <span className={styles.counterTotal}>{formatCounter(items.length)}</span>
            </p>
            <div className={styles.segments} aria-hidden="true">
              {items.map((item, index) => (
                <span key={item.id} className={styles.segment} data-active={index === fan.index} />
              ))}
            </div>
            <div className={styles.arrows}>
              <ArrowButton
                icon={ChevronLeft}
                label={labels.previousLabel}
                controls={listId}
                onPress={() => step(-1)}
              />
              <ArrowButton
                icon={ChevronRight}
                label={labels.nextLabel}
                controls={listId}
                onPress={() => step(1)}
              />
            </div>
            <div className={styles.status} aria-live="polite">
              <VisuallyHidden>
                {fan.announced ? (items[fan.index]?.positionLabel ?? '') : ''}
              </VisuallyHidden>
            </div>
          </div>
        </div>
      </div>
      <ul ref={listRef} id={listId} className={styles.list}>
        {items.map((item, index) => (
          <li
            key={item.id}
            className={styles.item}
            data-active={index === fan.index}
            onPointerEnter={(event) => {
              if (event.pointerType !== 'touch') open(index);
            }}
            onFocus={() => open(index)}
            onClick={() => open(index)}
          >
            {item.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Props de una flecha del abanico. */
type ArrowButtonProps = {
  icon: LucideIcon;
  /** Nombre accesible: el botón es solo un ícono. */
  label: string;
  /** `id` de la lista que mueve (`aria-controls`). */
  controls: string;
  onPress: () => void;
};

/** Flecha redonda del encabezado: pasa al viaje anterior o al siguiente. */
function ArrowButton({ icon: Icon, label, controls, onPress }: ArrowButtonProps) {
  return (
    <button
      type="button"
      className={styles.arrow}
      aria-label={label}
      aria-controls={controls}
      onClick={onPress}
    >
      <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} aria-hidden="true" />
    </button>
  );
}
