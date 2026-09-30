import type { HTMLAttributes } from 'react';

import { BulletList } from '@/components/molecules/BulletList';
import { SurfaceCard } from '@/components/molecules/SurfaceCard';

import type { ServiceGroupData } from '../../types';

import styles from './ServicePanel.module.css';

/** Props de `ServicePanel`. El resto de los atributos va al envoltorio (ahí va el `reveal`). */
export type ServicePanelProps = {
  /** Los grupos de la card, de arriba a abajo (datos planos de `toServiceTabs`). */
  groups: readonly ServiceGroupData[];
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;

/**
 * Un panel de "Servicios y equipo" (`dc.html:298-308`): una card que se
 * inclina con el cursor, con uno o dos grupos (título + lista con viñetas).
 *
 * El título del grupo es un `h3` aunque el diseño use `h4`: cuelga del `h2`
 * de la sección y no hay un nivel intermedio. El tamaño lo pone el CSS.
 *
 * Cada grupo va con `key={group.id}`, que incluye el viaje: al cambiar de
 * pestaña la card sigue siendo la misma y solo se remontan sus listas.
 */
export function ServicePanel({ groups, ...rest }: ServicePanelProps) {
  return (
    <SurfaceCard tone="surface" innerClassName={styles.card} {...rest}>
      {groups.map((group) => (
        <div key={group.id} className={styles.group}>
          <h3 className={styles.groupTitle}>{group.title}</h3>
          <BulletList items={group.items} dotTone={group.dotTone} size="sm" />
        </div>
      ))}
    </SurfaceCard>
  );
}
