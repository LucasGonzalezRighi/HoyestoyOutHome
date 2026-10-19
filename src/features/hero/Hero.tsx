import { LinkButton } from '@/components/atoms/Button';
import { WashedImage, type WashedImageParallax } from '@/components/atoms/WashedImage';
import { SECTION_IDS } from '@/constants/sections';
import type { HeroContent } from '@/content/sections/hero';
import { navOverlay, reveal } from '@/motion/attributes';

import { HeroHeadline } from './components/HeroHeadline';
import { HeroRibbon } from './components/HeroRibbon';
import styles from './Hero.module.css';

/**
 * Parallax de la foto de fondo (`dc.html:57`): se mueve al 40% del scroll.
 *
 * Sin `introZoom`, a diferencia del diseño: el zoom de arranque lo escribía
 * el motor recién al hidratar, y la foto —ya pintada en escala 1— saltaba a
 * ~1,22 delante de quien miraba. La foto se queda quieta desde el primer
 * pintado; lo único que entra animado es el texto.
 *
 * El overscan (la capa arranca un 6% más arriba y mide 114% del marco) deja
 * el mismo encuadre que tenía la foto ya hidratada, ahora que el marco
 * arranca debajo del nav (ver `.backdrop`). Con el scroll la capa solo baja
 * dentro del marco, así que el margen de abajo (8%) está para el rebote del
 * scroll en iOS, que la sube.
 */
const BACKGROUND_PARALLAX: WashedImageParallax = {
  factor: 0.4,
  overscanTop: '-6%',
  overscanHeight: '114%',
};

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
 * que oscurece la base para que el texto crema se lea, y abajo a la izquierda
 * un solo bloque: el titular, la bajada y los dos CTA, todos sobre el mismo
 * borde. En el diseño la bajada iba contra la derecha y los botones al centro
 * (tres ejes distintos); el cliente pidió un layout más prolijo.
 *
 * La carga: la foto está quieta y en su lugar desde el primer pintado, con y
 * sin JS, y mientras se descarga se ve su vista previa (`.photo`). Lo que
 * entra con la intro —al hidratar— es solo el texto.
 *
 * El diseño suma un texto calado gigante ("Out Of Home" en contorno crema) que
 * se desliza con el scroll; se sacó a pedido del cliente.
 *
 * Renderiza dos hermanos: el `<header id="top">` y la cinta verde musgo, que
 * en el diseño va fuera del header: girada, su punta derecha pisa el borde de
 * abajo de la foto.
 *
 * Server Component: las animaciones se enganchan por atributos.
 */
export function Hero({ content }: HeroProps) {
  const { photo, headline, lead, tripsCta, contactCta, ribbon } = content;

  return (
    <>
      <header id={SECTION_IDS.top} className={styles.hero} {...navOverlay()}>
        <WashedImage
          photo={photo}
          tone="vivid"
          priority
          sizes="100vw"
          parallax={BACKGROUND_PARALLAX}
          className={styles.backdrop}
          imageClassName={styles.photo}
        />
        <div className={styles.shade} aria-hidden="true" />

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
              className={styles.action}
            >
              {tripsCta.label}
            </LinkButton>
            <LinkButton
              href={contactCta.href}
              external={contactCta.external}
              variant="secondary"
              size="lg"
              tone="inverse"
              className={styles.action}
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
