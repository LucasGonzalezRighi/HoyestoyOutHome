'use client';

import { Pause, Play } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Button } from '@/components/atoms/Button';
import { marqueePause } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './MarqueePauseGroup.module.css';

/** Trazo de los íconos: Lucide a 2.75, regla del design system Organic (como `ChatIcon`). */
const ICON_STROKE_WIDTH = 2.75;

/** Lado del ícono en px: acompaña los 14px del texto del botón `md`. */
const ICON_SIZE = 16;

/** Props de `MarqueePauseGroup`. Todo es serializable: lo renderiza un Server Component. */
export type MarqueePauseGroupProps = {
  /** Texto del botón mientras las cintas corren: "Pausar testimonios". */
  pauseLabel: string;
  /** Texto del botón con las cintas en pausa: "Reanudar testimonios". */
  resumeLabel: string;
  /** Las cintas (`Marquee`) que pausa el botón. Siguen siendo Server Components. */
  children: ReactNode;
  /** Clase de la fila del botón: su margen y su alineación los pone quien lo usa. */
  controlsClassName?: string;
};

/**
 * Envuelve una o más cintas y les agrega, debajo, un botón para pausarlas y
 * reanudarlas. **No está en el diseño** (CLAUDE.md §9): ahí las cintas solo se
 * frenan con el mouse encima, y con teclado o en pantalla táctil no había
 * forma de pararlas. Una cinta de frases que se mueve sola y no se puede
 * pausar incumple WCAG 2.2.2 (nivel A).
 *
 * Es Client Component solo por el estado de la pausa. No anima nada: con la
 * pausa marca su envoltorio con `data-marquee-paused` (`marqueePause()`), y el
 * motor deja de avanzar las cintas de adentro, igual que con el hover.
 *
 * El texto visible cambia entre `pauseLabel` y `resumeLabel`, así que el
 * botón no lleva `aria-pressed`: el nombre ya dice qué va a hacer.
 */
export function MarqueePauseGroup({
  pauseLabel,
  resumeLabel,
  children,
  controlsClassName,
}: MarqueePauseGroupProps) {
  const [paused, setPaused] = useState(false);
  const Icon = paused ? Play : Pause;

  return (
    <>
      <div {...marqueePause(paused)}>{children}</div>
      <div className={cn(styles.controls, controlsClassName)}>
        <Button
          type="button"
          variant="secondary"
          icon={<Icon size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} aria-hidden="true" />}
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? resumeLabel : pauseLabel}
        </Button>
      </div>
    </>
  );
}
