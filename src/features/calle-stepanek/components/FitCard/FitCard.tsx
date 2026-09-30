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
 * La card de la sección 05 (`dc.html:182-209`): pregunta, respuesta y el
 * detalle que traiga cada una. Las dos cards comparten marco, tamaños y
 * coreografía; cambian el color y lo que va abajo.
 *
 * Entra con `flip` (se despliega en X con perspectiva) y la card interna se
 * inclina con el cursor (`SurfaceCard` ya le pone `tilt()`): son capas
 * distintas para que los dos efectos no se pisen el `transform`.
 *
 * El título es `<h3>`, como en el diseño (`dc.html:184`, `:199`): la sección
 * 05 no tiene título propio porque sigue contando Calle & Stepanek (por eso su
 * aire es el compacto), así que las dos preguntas cuelgan del `<h2>` "Calle &
 * Stepanek", igual que "Cronograma". Un `<h2>` oculto obligaría a inventar un
 * texto que el diseño no tiene.
 */
export function FitCard({
  tone,
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
      <h3 className={cn(styles.title, titleTone, titleClassName)}>{title}</h3>
      <p className={styles.lead}>{lead}</p>
      {children}
    </SurfaceCard>
  );
}
