import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { Navbar } from '@/components/organisms/Navbar';
import { anchorTo } from '@/constants/sections';
import { FEATURE_FLAGS, SITE, SITE_URL } from '@/constants/site';
import { PHOTOS } from '@/content/media';
import { siteContent } from '@/content/sections/site';
import { whatsapp } from '@/content/whatsapp';
import { fontVariables } from '@/design-system/fonts';
import { FloatingWhatsApp, SiteChrome } from '@/features/site-chrome';
import { backgroundRoot } from '@/motion/attributes';
import { MotionRuntime } from '@/motion/react';

import './globals.css';
import styles from './layout.module.css';

/**
 * Imagen para compartir (Open Graph y Twitter): la foto del hero, que es la
 * primera impresión de la marca. Relativa: `metadataBase` la vuelve absoluta.
 */
const SHARE_IMAGE = { url: PHOTOS.heroRange.src, alt: siteContent.meta.ogImageAlt };

/**
 * Metadata de la página (título, description, Open Graph, Twitter). Sale de
 * `siteContent.meta`: acá no hay texto propio. `metadataBase` vuelve absolutas
 * las URLs relativas (imagen, canonical).
 */
export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: siteContent.meta.title,
    template: `%s · ${SITE.name}`,
  },
  description: siteContent.meta.description,
  keywords: [...siteContent.meta.keywords],
  applicationName: SITE.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: SITE.ogLocale,
    siteName: SITE.name,
    url: '/',
    title: siteContent.meta.title,
    description: siteContent.meta.description,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteContent.meta.title,
    description: siteContent.meta.description,
    images: [SHARE_IMAGE],
  },
};

/** Viewport: solo el color de la barra del navegador en mobile. */
export const viewport: Viewport = {
  // why: Next pide un literal (no lee custom properties). Tiene que coincidir
  // con `--color-bg` de src/design-system/tokens.css: es el color de la barra
  // del navegador en mobile, y tiene que fundirse con el nav.
  themeColor: '#f3ebdf',
};

/**
 * Shell de la página: fuentes, fondo que cambia de color, piezas globales
 * (telón, cursor, barra de progreso, WhatsApp flotante), nav y el motor de
 * animación.
 *
 * Todo es Server Component salvo `MotionRuntime` (y lo que `SiteChrome`
 * necesite): las animaciones se enganchan por atributos `data-*`, así que el
 * marcado se renderiza entero en el servidor.
 */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const whatsappHref = whatsapp.href();

  return (
    <html lang={SITE.htmlLang} className={fontVariables}>
      <body>
        <div {...backgroundRoot()} className={styles.backgroundRoot}>
          <a href={anchorTo('content')} className={styles.skipLink}>
            {siteContent.skipLink}
          </a>
          {/* Al principio: el telón se pinta antes que la página. */}
          <SiteChrome curtain={siteContent.curtain} />
          <Navbar
            brand={{ ...siteContent.brand, href: anchorTo('top') }}
            links={siteContent.nav.links}
            cta={{ label: siteContent.nav.cta, href: whatsappHref }}
            ariaLabel={siteContent.nav.ariaLabel}
          />
          {children}
          {/*
            Al final: es interactivo, y su lugar en el DOM es su lugar en el
            orden de tabulación. En el diseño es lo último de la página.
          */}
          {FEATURE_FLAGS.floatingWhatsApp && (
            <FloatingWhatsApp
              href={whatsappHref}
              ariaLabel={siteContent.floatingWhatsApp.ariaLabel}
            />
          )}
        </div>
        {/* Fuera del fondo: no renderiza nada, solo arranca y apaga el motor. */}
        <MotionRuntime />
      </body>
    </html>
  );
}
