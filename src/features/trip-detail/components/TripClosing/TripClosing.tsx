import { Fragment } from 'react';

import { BrandLogo } from '@/components/atoms/BrandLogo';
import { LinkButton } from '@/components/atoms/Button';
import { Section } from '@/components/atoms/Section';
import { WhatsAppIcon } from '@/components/atoms/WhatsAppIcon';
import { TRIP_SECTION_IDS } from '@/constants/sections';
import type { TripClosingContent } from '@/content/trips';
import { backgroundShift, parallax, reveal } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import { CLOSING_BACKGROUND } from '../../closingBackground';
import styles from './TripClosing.module.css';

/**
 * Cuánto dura la expansión de la tarjeta: el 60% del viewport
 * (`data-rv-span="0.6"`, `dc.html:362`). La tarjeta termina de abrirse
 * mientras se scrollea hacia ella.
 */
const CARD_REVEAL_SPAN = 0.6;

/**
 * Parallax de los círculos (`dc.html:363-364`). Signos opuestos: respecto de
 * la tarjeta, el de arriba sube (`-0.3`) y el de abajo se queda atrás (`0.25`).
 */
const CIRCLE_TOP_PARALLAX = -0.3;
const CIRCLE_BOTTOM_PARALLAX = 0.25;

/** Ancho del logo de la chapita (`dc.html:365`: `width: 74px`). */
const LOGO_WIDTH = 74;

/**
 * Lado del logo de WhatsApp del CTA: 22px junto al texto de 17px del botón
 * `xl` (el globo del diseño medía 20, `dc.html:371`, pero era un trazo fino).
 */
const CTA_ICON_SIZE = 22;

/** `id` del título: le da nombre accesible a la sección (`aria-labelledby`). */
const TITLE_ID = `${TRIP_SECTION_IDS.closing}-titulo`;

/** Props de `TripClosing`. */
export type TripClosingProps = {
  /** `tripDetails[slug].closing`. */
  content: TripClosingContent;
};

/**
 * Cierre de la página de viaje, con el patrón del cierre del diseño
 * (`dc.html:361-373`): una tarjeta verde musgo que se expande al entrar, dos
 * círculos con parallax en sentidos opuestos y, encima, el logo que rueda, el
 * título en dos renglones, la bajada que invita a consultar por el viaje y el
 * botón grande a WhatsApp con su mensaje. Mientras la sección cruza el centro
 * del viewport, el fondo de la página pasa al verde más oscuro (y sigue así en
 * el footer, que lleva la misma marca).
 *
 * Sin montos, por pedido del cliente: donde el diseño ponía el valor por
 * persona y la nota de reserva, el título pasa a ser lo más grande de la
 * tarjeta y todo lleva a un solo gesto, escribir por WhatsApp.
 */
export function TripClosing({ content }: TripClosingProps) {
  const { logoAlt, titleLines, lead, cta } = content;

  return (
    <Section
      id={TRIP_SECTION_IDS.closing}
      aria-labelledby={TITLE_ID}
      spacing="none"
      className={styles.section}
      {...backgroundShift(CLOSING_BACKGROUND)}
    >
      <div className={styles.card} {...reveal('expand', { span: CARD_REVEAL_SPAN })}>
        {/* Los círculos son capas de parallax: el motor las mueve según la posición de su padre, la tarjeta. */}
        <div
          className={cn(styles.circle, styles.circleTop)}
          aria-hidden="true"
          {...parallax(CIRCLE_TOP_PARALLAX)}
        />
        <div
          className={cn(styles.circle, styles.circleBottom)}
          aria-hidden="true"
          {...parallax(CIRCLE_BOTTOM_PARALLAX)}
        />

        <div className={styles.content}>
          <BrandLogo width={LOGO_WIDTH} alt={logoAlt} className={styles.logo} {...reveal('roll')} />
          <h2 id={TITLE_ID} className={styles.title} {...reveal('up', { delay: 1 })}>
            {/*
              Cada renglón es un bloque: el corte es parte del copy, como el `<br>` del diseño.
              El espacio entre los dos no se ve (queda entre bloques); está para que el nombre
              accesible de la sección no pegue "espera.¿Te".
            */}
            {titleLines.map((line, index) => (
              <Fragment key={line}>
                {index > 0 && ' '}
                <span className={styles.titleLine}>{line}</span>
              </Fragment>
            ))}
          </h2>
          <p className={styles.lead} {...reveal('up', { delay: 2 })}>
            {lead}
          </p>
          <div className={styles.actions} {...reveal('scale', { delay: 3 })}>
            <LinkButton
              href={cta.href}
              external={cta.external}
              variant="primary"
              size="xl"
              icon={<WhatsAppIcon size={CTA_ICON_SIZE} />}
              className={styles.cta}
            >
              {cta.label}
            </LinkButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
