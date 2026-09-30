import { LinkButton } from '@/components/atoms/Button';
import { WashedImage, type WashedImageParallax } from '@/components/atoms/WashedImage';
import { SECTION_IDS } from '@/constants/sections';
import type { HeroContent } from '@/content/sections/hero';
import { drift, reveal } from '@/motion/attributes';

import { HeroHeadline } from './components/HeroHeadline';
import { HeroRibbon } from './components/HeroRibbon';
import styles from './Hero.module.css';

/**
 * Parallax de la foto de fondo (`dc.html:57`): se mueve al 40% del scroll, y
 * la capa arranca un 10% más arriba y mide 122% del marco para que el
 * desplazamiento nunca deje ver su borde. En el diseño el `data-parallax` está
 * en la `<img>`, así que además arranca con zoom y lo suelta con la intro.
 */
const BACKGROUND_PARALLAX: WashedImageParallax = {
  factor: 0.4,
  overscanTop: '-10%',
  overscanHeight: '122%',
  introZoom: true,
};

/** El texto calado se corre hacia la izquierda a la mitad del scroll (`dc.html:61`). */
const OUTLINE_DRIFT = -0.5;

/**
 * Escalones de la bajada y los botones (`dc.html:72-73`). Las palabras del
 * titular usan los escalones 0–9, así que la bajada y los botones arrancan
 * mientras todavía suben las últimas palabras: el bloque entra como una sola ola.
 */
const LEAD_DELAY = 6;
const ACTIONS_DELAY = 7;

/** Props de `Hero`: su slice de `landingContent`. */
export type HeroProps = {
  /** `landingContent.hero`: foto, titular, bajada, CTA y palabras de la cinta. */
  content: HeroContent;
};

/**
 * Sección 01: el hero y la cinta que lo sigue (`dc.html:54-86`).
 *
 * Foto de montaña a pantalla completa (menos el nav) con parallax, un degradé
 * que oscurece la base para que el texto crema se lea, el texto calado "Out Of
 * Home" que se desliza con el scroll, y abajo el titular, la bajada y los dos
 * CTA. Todo lo de adelante entra con la intro del telón, no con el scroll:
 * está sobre el fold.
 *
 * Renderiza dos hermanos: el `<header id="top">` (el destino del logo del nav)
 * y la cinta verde musgo, que en el diseño va fuera del header: girada, su
 * punta derecha pisa el borde de abajo de la foto.
 *
 * Server Component: las animaciones se enganchan por atributos.
 */
export function Hero({ content }: HeroProps) {
  const { photo, outlineText, headline, lead, tripsCta, contactCta, ribbon } = content;

  return (
    <>
      <header id={SECTION_IDS.top} className={styles.hero}>
        <WashedImage
          photo={photo}
          tone="vivid"
          priority
          sizes="100vw"
          parallax={BACKGROUND_PARALLAX}
          className={styles.backdrop}
        />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.outline} aria-hidden="true" {...drift(OUTLINE_DRIFT)}>
          {outlineText}
        </div>

        <div className={styles.content}>
          <HeroHeadline text={headline.text} lines={headline.lines} />
          <p className={styles.lead} {...reveal('up', { intro: true, delay: LEAD_DELAY })}>
            {lead.map((line) => (
              <span key={line} className={styles.leadLine}>
                {line}
              </span>
            ))}
          </p>
          <div className={styles.actions} {...reveal('up', { intro: true, delay: ACTIONS_DELAY })}>
            <LinkButton
              href={tripsCta.href}
              external={tripsCta.external}
              variant="primary"
              size="lg"
            >
              {tripsCta.label}
            </LinkButton>
            <LinkButton
              href={contactCta.href}
              external={contactCta.external}
              variant="secondary"
              size="lg"
              tone="inverse"
            >
              {contactCta.label}
            </LinkButton>
          </div>
        </div>
      </header>

      <HeroRibbon items={ribbon} />
    </>
  );
}
