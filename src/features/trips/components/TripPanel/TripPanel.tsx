import { Plus } from 'lucide-react';

import { LinkButton } from '@/components/atoms/Button';
import { Tag } from '@/components/atoms/Tag';
import { VisuallyHidden } from '@/components/atoms/VisuallyHidden';
import { WashedImage } from '@/components/atoms/WashedImage';
import type { TripPanelContent } from '@/content/sections/trips';
import { reveal } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import { panelPhotoSizes } from './panelPhotoSizes';
import styles from './TripPanel.module.css';

/** Trazo de los íconos: Lucide a 2.75, regla del design system Organic. */
const ICON_STROKE_WIDTH = 2.75;

/** Lado del "+" de los paneles cerrados, en px, dentro de su círculo de 34px. */
const MARK_ICON_SIZE = 16;

/**
 * Cambia el espacio de antes de una raya por uno de no separación, para que
 * un título partido en dos renglones no arranque el segundo con la raya:
 * "Calle & Stepanek —" / "Tu primer 4mil", y no "— Tu primer 4mil".
 */
function keepDashWithPreviousWord(text: string): string {
  return text.replaceAll(' \u2014 ', '\u00A0\u2014 ');
}

/** Props de `TripPanel`: el panel ya resuelto por el contenido y su lugar en el abanico. */
export type TripPanelProps = {
  /** El viaje (con su foto) y el botón a su página. */
  panel: TripPanelContent;
  /** Posición en el abanico, desde 0: escalona la aparición con el scroll. */
  index: number;
};

/**
 * Un viaje del abanico de "Próximos viajes": su foto a sangre y, encima, lo
 * que se lee. Tiene dos caras, y cuál se ve lo decide el `<li>` que lo
 * contiene (`TripsFan`), no el panel:
 *
 * - **Cerrado**: una franja de la foto, algo apagada, con el nombre corto y el
 *   destino (`caption`) y un "+" que dice que se abre.
 * - **Abierto**: la foto a pleno color y, abajo, nombre completo (`h3`),
 *   destino, tags y el botón "Ver detalles". Las piezas entran una atrás de la
 *   otra cuando el panel ya se ensanchó.
 *
 * El panel no tiene estado ni clases de "abierto": lee dos custom properties
 * que hereda del abanico, `--trip-open` (0 o 1) y `--fan-speed` (0 con el
 * movimiento apagado), y calcula con ellas opacidades, desplazamientos y
 * tiempos (`TripPanel.module.css`). Por eso sigue siendo un Server Component
 * y el abanico puede abrirlo también sin JS, solo con CSS.
 *
 * **Para el lector de pantalla no hay caras**: el `h3`, el destino, los tags y
 * el link están siempre en el árbol de accesibilidad (se ocultan con
 * opacidad, no con `visibility`), así que la lista se lee entera sin tener
 * que abrir nada, y con Tab se llega al link de cada viaje (el foco abre su
 * panel). La leyenda del panel cerrado repite el nombre y el destino, por eso
 * va con `aria-hidden`.
 *
 * La foto entra con el reveal `clip` (se destapa de abajo hacia arriba y
 * suelta un zoom), escalonado por `index`. El reveal va en el panel y no en el
 * `<li>`: el motor le escribe una transición inline al elemento que revela, y
 * pisaría la del ancho del `<li>`.
 *
 * No muestra precio (pedido del cliente): vive en la página de cada viaje. El
 * botón suma el nombre del viaje en texto oculto ("Ver detalles Laguna
 * Negra"): el texto visible se repite en los cuatro paneles y en la lista de
 * links de un lector de pantalla no se distinguirían. Lo visible va primero
 * (WCAG 2.5.3). Va con `tone="inverse"`: sobre foto, el anillo de foco es del
 * color del texto con el aro crema (CLAUDE.md §9.2).
 */
export function TripPanel({ panel, index }: TripPanelProps) {
  const { trip, photo, cta } = panel;

  return (
    <article className={styles.panel} {...reveal('clip', { delay: index })}>
      <WashedImage
        photo={photo}
        sizes={panelPhotoSizes(photo.width / photo.height)}
        tone="none"
        className={styles.media}
      />
      <span className={styles.scrim} aria-hidden="true" />
      <div className={styles.caption} aria-hidden="true">
        <span className={styles.mark}>
          <Plus size={MARK_ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} />
        </span>
        <p className={styles.captionText}>
          <span className={styles.captionName}>{trip.shortName}</span>
          <span className={styles.captionPlace}>{trip.destination}</span>
        </p>
      </div>
      <div className={styles.content}>
        <h3 className={cn(styles.piece, styles.name)}>{keepDashWithPreviousWord(trip.name)}</h3>
        <p className={cn(styles.piece, styles.destination)}>{trip.destination}</p>
        <div className={styles.meta}>
          <ul className={cn(styles.piece, styles.tags)}>
            <li>
              <Tag className={styles.tag}>{trip.duration.label()}</Tag>
            </li>
            <li>
              <Tag className={styles.tag}>{trip.difficultyLabel()}</Tag>
            </li>
            <li>
              <Tag className={styles.tag}>{trip.distanceLabel()}</Tag>
            </li>
          </ul>
          <span className={cn(styles.piece, styles.action)}>
            <LinkButton variant="primary" tone="inverse" href={cta.href} external={cta.external}>
              {cta.label}
              <VisuallyHidden>{` ${trip.name}`}</VisuallyHidden>
            </LinkButton>
          </span>
        </div>
      </div>
    </article>
  );
}
