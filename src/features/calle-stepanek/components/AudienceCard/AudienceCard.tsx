import { Fragment, useId } from 'react';

import { BulletList } from '@/components/molecules/BulletList';
import type { CalleStepanekAudienceContent } from '@/content/sections/calle-stepanek';

import { FitCard } from '../FitCard';
import styles from './AudienceCard.module.css';

/** Props de `AudienceCard`. */
export type AudienceCardProps = {
  /** Título, respuesta y las dos listas de la card. */
  content: CalleStepanekAudienceContent;
  /** Escalón de retraso de la entrada de la card (1 en el diseño: `dc.html:197`). */
  revealDelay?: number;
};

/**
 * Card "¿Es para mí?" (`dc.html:197-209`): la respuesta y dos listas con
 * rótulo, "Ideal si:" y "Trabajamos con:".
 *
 * Cada rótulo le da nombre a su lista (`aria-labelledby`): quien salta de
 * lista en lista con un lector de pantalla oye "Ideal si:, lista, 4 ítems" y
 * no una lista suelta. Los ids salen de `useId`, que también corre en Server
 * Components, para no escribir ids a mano.
 */
export function AudienceCard({ content, revealDelay }: AudienceCardProps) {
  const idPrefix = useId();
  const lists = [content.ideal, content.approach];

  return (
    <FitCard tone="accent-2" title={content.title} lead={content.lead} revealDelay={revealDelay}>
      {lists.map((list, index) => {
        const titleId = `${idPrefix}-list-${index}`;
        return (
          <Fragment key={list.title}>
            <p id={titleId} className={styles.listTitle}>
              {list.title}
            </p>
            {/* Viñeta dorada, texto en verde musgo seminegrita y cada ítem entrando desde la izquierda (`dc.html:203`). */}
            <BulletList
              items={list.items}
              variant="emphasis"
              revealItems
              aria-labelledby={titleId}
              className={styles.list}
            />
          </Fragment>
        );
      })}
    </FitCard>
  );
}
