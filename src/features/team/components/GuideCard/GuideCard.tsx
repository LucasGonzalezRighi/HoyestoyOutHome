import type { AnchorHTMLAttributes } from 'react';

import { Tag } from '@/components/atoms/Tag';
import { WashedImage } from '@/components/atoms/WashedImage';
import { EXTERNAL_LINK_PROPS } from '@/constants/links';
import type { Guide } from '@/domain';
import { cn } from '@/utils/cn';

import styles from './GuideCard.module.css';

/**
 * `sizes` de la foto: el marco mide `min(220px, 100%)` y la columna de la
 * grilla nunca baja de 220px (`minmax(220px, 1fr)`, `dc.html:318`), así que
 * siempre ocupa 220px.
 */
const AVATAR_SIZES = '220px';

/**
 * Props de `GuideCard`. El resto de los atributos va al `<a>` (ahí van los
 * `data-*` de la aparición, que decide la sección).
 */
export type GuideCardProps = {
  /** El guía: nombre, rol, foto y perfil de Instagram. */
  guide: Guide;
  /** Clase extra para el `<a>`. */
  className?: string;
} & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'className' | 'children' | 'href' | 'target' | 'rel'
>;

/**
 * Un guía del equipo: foto circular, nombre, rol y usuario de Instagram,
 * todo dentro de un link a su perfil (`dc.html:320-325`).
 *
 * El nombre accesible del link sale del texto visible (nombre, rol y
 * usuario): la foto es decorativa en este contexto (ver `teamContent`).
 */
export function GuideCard({ guide, className, ...rest }: GuideCardProps) {
  return (
    <a
      href={guide.instagramUrl}
      className={cn(styles.card, className)}
      {...EXTERNAL_LINK_PROPS}
      {...rest}
    >
      <WashedImage
        photo={guide.photo}
        sizes={AVATAR_SIZES}
        tone="none"
        className={styles.avatar}
        imageClassName={styles.avatarImage}
      />
      <span className={styles.name}>{guide.name}</span>
      <span className={styles.role}>{guide.role}</span>
      <Tag variant="neutral" className={styles.handle}>
        {guide.handleLabel}
      </Tag>
    </a>
  );
}
