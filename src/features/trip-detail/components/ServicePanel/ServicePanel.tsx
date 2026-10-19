import type { HTMLAttributes } from 'react';

import { BulletList } from '@/components/molecules/BulletList';
import { SurfaceCard } from '@/components/molecules/SurfaceCard';

import type { ChecklistGroupData } from '../../checklistPanels';

import styles from './ServicePanel.module.css';

/** Props de `ServicePanel`. El resto de los atributos va al envoltorio (ahí va el `reveal`). */
export type ServicePanelProps = {
  /** Los grupos de la card, de arriba a abajo (de `checklistPanels`). */
  groups: readonly ChecklistGroupData[];
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;

/**
 * Una card de "¿Qué incluye y qué necesito?" (`dc.html:298-308`): se inclina
 * con el cursor y lleva uno o dos grupos (título + lista con viñetas).
 *
 * El título del grupo es un `<h3>` aunque el diseño use `h4`: cuelga del
 * `<h2>` del bloque y no hay un nivel intermedio. El tamaño lo pone el CSS.
 */
export function ServicePanel({ groups, ...rest }: ServicePanelProps) {
  return (
    <SurfaceCard tone="surface" innerClassName={styles.card} {...rest}>
      {groups.map((group) => (
        <div key={group.kind} className={styles.group}>
          <h3 className={styles.groupTitle}>{group.title}</h3>
          <BulletList items={group.items} dotTone={group.dotTone} size="sm" />
        </div>
      ))}
    </SurfaceCard>
  );
}
