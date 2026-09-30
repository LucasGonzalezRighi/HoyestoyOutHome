import type { CalleStepanekRequirementsContent } from '@/content/sections/calle-stepanek';
import { reveal } from '@/motion/attributes';

import { FitCard } from '../FitCard';
import styles from './RequirementsCard.module.css';

/**
 * Cada dato entra un poco más lento que el reveal por defecto (0.16):
 * `data-rv-span="0.18"` en `dc.html:189`.
 */
const FACT_REVEAL_SPAN = 0.18;

/** Props de `RequirementsCard`. */
export type RequirementsCardProps = {
  /** Título, respuesta y los cinco datos de la card. */
  content: CalleStepanekRequirementsContent;
};

/**
 * Card "¿Puedo?" (`dc.html:182-196`): la respuesta corta y cinco datos del
 * terreno en dos columnas.
 *
 * Los datos son un `<dl>` (etiqueta → valor), con cada par envuelto en un
 * `<div>` —lo que el HTML permite dentro de un `<dl>`— para que sea una celda
 * de la grilla y entre por su cuenta, un escalón después del anterior.
 *
 * Es la primera card de la fila: entra sin retraso (`data-rv="flip"` sin
 * `data-rv-d`, `dc.html:182`).
 */
export function RequirementsCard({ content }: RequirementsCardProps) {
  return (
    <FitCard tone="accent" title={content.title} lead={content.lead} titleClassName={styles.title}>
      <div aria-hidden="true" className={styles.rule} />
      <dl className={styles.facts}>
        {content.facts.map((fact, index) => (
          <div key={fact.label} {...reveal('up', { delay: index, span: FACT_REVEAL_SPAN })}>
            <dt className={styles.label}>{fact.label}</dt>
            <dd className={styles.value}>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </FitCard>
  );
}
