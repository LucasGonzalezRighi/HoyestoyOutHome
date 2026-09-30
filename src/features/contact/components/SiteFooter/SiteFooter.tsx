import { EXTERNAL_LINK_PROPS } from '@/constants/links';
import type { FooterContent } from '@/content/sections/contact';
import { backgroundShift } from '@/motion/attributes';

import { CLOSING_BACKGROUND } from '../../closingBackground';
import styles from './SiteFooter.module.css';

/** Props de `SiteFooter`: solo su slice de contenido. */
export type SiteFooterProps = {
  /** `landingContent.footer`. */
  content: FooterContent;
};

/**
 * Footer del sitio (`dc.html:374-382`): marca, redes + WhatsApp y la nota de
 * cierre, sobre el verde musgo oscuro del cierre.
 *
 * En el diseño está adentro de la sección 13; acá es el `<footer>` de la
 * página (el `contentinfo`), fuera del `<main>` e inmediatamente después.
 * Por eso trae dos cosas que en el diseño heredaba de la sección:
 * - su propio `backgroundShift()`, para que el fondo siga verde al llegar al
 *   final de la página;
 * - su propio fondo verde en el CSS, para que el texto claro se lea aunque el
 *   motor no corra (CLAUDE.md §9).
 */
export function SiteFooter({ content }: SiteFooterProps) {
  const { brand, linksLabel, links, note } = content;

  return (
    <footer className={styles.footer} {...backgroundShift(CLOSING_BACKGROUND)}>
      <div className={styles.inner}>
        <p className={styles.brand}>{brand}</p>
        <ul className={styles.links} aria-label={linksLabel}>
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={styles.link}
                {...(link.external ? EXTERNAL_LINK_PROPS : {})}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.note}>{note}</p>
      </div>
    </footer>
  );
}
