import type { ReactNode } from 'react';

import { SurfaceCard, type SurfaceCardTone } from '@/components/molecules/SurfaceCard';
import { reveal } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './FitCard.module.css';

/** Voz de la card: dorada ("¿Puedo?") o verde musgo ("¿Es para mí?"). */
export type FitCardTone = 'accent' | 'accent-2';

/** Cada voz pinta el fondo con su rampa clara (100) y el título con un paso oscuro. */
const TONES: Record<FitCardTone, { surface: SurfaceCardTone; title: string | undefined }> = {
  accent: { surface: 'accent-100', title: styles.titleAccent },
  'accent-2': { surface: 'accent-2-100', title: styles.titleAccentTwo },
};

/** Props de `FitCard`. */
export type FitCardProps = {
  /** Fondo y color del título. */
  tone: FitCardTone;
  /** `id` del título: la sección se nombra con los títulos de sus dos cards. */
  titleId: string;
  /** La pregunta: "¿Puedo?" / "¿Es para mí?". */
  title: string;
  /** El párrafo que la responde. */
  lead: string;
  /** Escalón de retraso de la entrada: la segunda card entra un paso después. */
  revealDelay?: number;
  /** Ajustes del título propios de una card (el espaciado de "¿Puedo?"). */
  titleClassName?: string;
  /** Lo que sigue a la respuesta: los datos de "¿Puedo?" o las listas de "¿Es para mí?". */
  children: ReactNode;
};

/**
 * La card de "¿Puedo?" / "¿Es para mí?" (`dc.html:182-209`): pregunta,
 * respuesta y el detalle que traiga cada una. Las dos comparten marco,
 * tamaños y coreografía; cambian el color y lo que va abajo.
 *
 * Entra con `flip` (se despliega en X con perspectiva) y la card interna se
 * inclina con el cursor (`SurfaceCard` ya le pone `tilt()`): son capas
 * distintas para que los dos efectos no se pisen el `transform`.
 *
 * El título es un `<h2>`: en la página del viaje cada pregunta es un bloque
 * propio, colgado del `<h1>` del viaje (en el diseño eran `<h3>` del `<h2>`
 * "Calle & Stepanek"). El tamaño visual es el del diseño.
 */
export function FitCard({
  tone,
  titleId,
  title,
  lead,
  revealDelay,
  titleClassName,
  children,
}: FitCardProps) {
  const { surface, title: titleTone } = TONES[tone];

  return (
    <SurfaceCard
      tone={surface}
      radius="xl"
      innerClassName={styles.card}
      {...reveal('flip', { delay: revealDelay })}
    >
      <h2 id={titleId} className={cn(styles.title, titleTone, titleClassName)}>
        {title}
      </h2>
      <p className={styles.lead}>{lead}</p>
      {children}
    </SurfaceCard>
  );
}
