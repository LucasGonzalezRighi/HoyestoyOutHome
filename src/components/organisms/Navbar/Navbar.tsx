import Link from 'next/link';
import type { HTMLAttributes } from 'react';

import { BrandLogo } from '@/components/atoms/BrandLogo';
import { LinkButton } from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

import styles from './Navbar.module.css';
import { NavLink } from './NavLink';

/** Ancho del logo en el nav: `width: 34px` del diseño (el alto se encaja en 40px). */
const NAV_LOGO_WIDTH = 34;

/** Un link del nav: texto y destino. */
export type NavbarLink = {
  label: string;
  href: string;
};

/**
 * Marca a la izquierda del nav. No lleva alt del logo: el logo es decorativo,
 * porque el nombre del link ya es el texto de al lado.
 */
export type NavbarBrand = {
  /** Primera línea, en la fuente de títulos ("Hoy Estoy"). */
  name: string;
  /** Segunda línea, en mayúsculas espaciadas ("Out Of Home"). */
  tagline: string;
  /** Destino del clic en la marca: el home (`ROUTES.home`), desde cualquier página. */
  href: string;
};

/** Props de `Navbar`. El resto de los atributos va al `<nav>`. */
export type NavbarProps = {
  brand: NavbarBrand;
  /** Links internos (secciones del home, `/#id`): navegan con el router, sin recargar. */
  links: readonly NavbarLink[];
  /** Botón de la derecha. Siempre sale del sitio (WhatsApp): abre en otra pestaña. */
  cta: NavbarLink;
  /** Nombre del landmark para lectores de pantalla. */
  ariaLabel: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children' | 'aria-label'>;

/**
 * Barra superior sticky, la misma en todas las páginas: marca (vuelve al
 * home), links a las secciones del home y el CTA de WhatsApp.
 *
 * Tres columnas (`1fr auto 1fr`) para que los links queden centrados en la
 * página y no entre la marca y el botón. A 820px o menos los links se ocultan
 * y quedan marca y CTA (todavía no hay menú desplegable).
 *
 * La marca y los links son el `Link` de Next: pasar de una página de viaje al
 * home no recarga el documento. El CTA es un `<a>` común porque sale del sitio.
 */
export function Navbar({ brand, links, cta, ariaLabel, className, ...rest }: NavbarProps) {
  return (
    <nav aria-label={ariaLabel} className={cn(styles.nav, className)} {...rest}>
      <Link href={brand.href} className={styles.brand}>
        {/*
          Alt vacío: el texto de al lado ya nombra la marca. Con alt, el nombre
          del link repetiría la marca ("Logo Hoy Estoy OOH Hoy Estoy Out Of Home").
        */}
        <BrandLogo width={NAV_LOGO_WIDTH} alt="" className={styles.logo} />
        <span className={styles.brandText}>
          <span className={styles.brandName}>{brand.name}</span>
          <span className={styles.brandTagline}>{brand.tagline}</span>
        </span>
      </Link>

      <ul className={styles.links}>
        {links.map((link) => (
          <li key={link.href}>
            <NavLink href={link.href} label={link.label} />
          </li>
        ))}
      </ul>

      <LinkButton href={cta.href} external className={styles.cta}>
        {cta.label}
      </LinkButton>
    </nav>
  );
}
