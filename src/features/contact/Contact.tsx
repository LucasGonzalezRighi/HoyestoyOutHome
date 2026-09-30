import { Fragment } from 'react';

import { BrandLogo } from '@/components/atoms/BrandLogo';
import { LinkButton } from '@/components/atoms/Button';
import { ChatIcon } from '@/components/atoms/ChatIcon';
import { Section } from '@/components/atoms/Section';
import { SECTION_IDS } from '@/constants/sections';
import type { ContactContent } from '@/content/sections/contact';
import { formatNumber } from '@/domain';
import { backgroundShift, counter, parallax, reveal } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import { CLOSING_BACKGROUND } from './closingBackground';
import styles from './Contact.module.css';

/**
 * Cuánto dura la expansión de la tarjeta: el 60% del viewport
 * (`data-rv-span="0.6"`, `dc.html:362`). Casi cuatro veces lo de un texto
 * (0.16): la tarjeta termina de abrirse mientras se scrollea hacia ella.
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

/** Lado del ícono del CTA (`dc.html:371`: `<svg width="20">`). */
const CTA_ICON_SIZE = 20;

/** Props de `Contact`: solo su slice de contenido. */
export type ContactProps = {
  /** `landingContent.contact`. */
  content: ContactContent;
};

/**
 * 13 Precio y contacto (`dc.html:361-373`): el cierre de la landing.
 *
 * Una tarjeta verde musgo que se expande al entrar, con dos círculos que se
 * mueven en sentidos opuestos (parallax) y, encima, la secuencia de
 * apariciones del diseño: el logo rueda, el precio cuenta hasta $690.000, y
 * el título y el CTA a WhatsApp suben escalonados. Mientras la sección cruza
 * el centro del viewport el fondo de toda la página pasa al verde más oscuro.
 *
 * El padding de abajo no está acá: lo pone `SiteFooter`, que en el diseño
 * vivía adentro de esta sección y ahora es el `<footer>` de la página.
 */
export function Contact({ content }: ContactProps) {
  const { logoAlt, kicker, price, note, titleLines, cta } = content;

  return (
    <Section
      id={SECTION_IDS.contact}
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
          <p className={styles.kicker} {...reveal('up', { delay: 1 })}>
            {kicker}
          </p>
          <p className={styles.price} {...reveal('zoom', { delay: 2 })}>
            {price.symbol}
            {/*
              El servidor renderiza el monto final ("690.000"): es lo que se
              lee sin JS y con el movimiento apagado. El motor lo reescribe
              contando en miles (`thousands` le pega el ".000"), igual que el
              `data-count-fmt="k"` del diseño.
            */}
            <span {...counter(price.value.inThousands(), 'thousands')}>
              {formatNumber(price.value.amount)}
            </span>
          </p>
          <p className={styles.note} {...reveal('up', { delay: 3 })}>
            {note}
          </p>
          <h2 className={styles.title} {...reveal('up', { delay: 4 })}>
            {/* Los renglones van separados con `<br>`, como en el diseño: el corte es parte del copy. */}
            {titleLines.map((line, index) => (
              <Fragment key={line}>
                {index > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </h2>
          <div className={styles.actions} {...reveal('scale', { delay: 5 })}>
            <LinkButton
              href={cta.href}
              external={cta.external}
              variant="primary"
              size="xl"
              icon={<ChatIcon size={CTA_ICON_SIZE} />}
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
