import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { ContourLines } from '@/components/atoms/ContourLines';
import { Navbar } from '@/components/organisms/Navbar';
import { SHARE_IMAGE_ASSET } from '@/constants/assets';
import { ROUTES } from '@/constants/routes';
import { anchorTo } from '@/constants/sections';
import { FEATURE_FLAGS, SITE } from '@/constants/site';
import { SITE_URL } from '@/constants/siteUrl';
import { footerContent } from '@/content/sections/contact';
import { siteContent } from '@/content/sections/site';
import { whatsapp } from '@/content/whatsapp';
import { fontVariables } from '@/design-system/fonts';
import { SiteFooter } from '@/features/contact';
import { FloatingWhatsApp, SiteChrome } from '@/features/site-chrome';
import { backgroundRoot, navBar } from '@/motion/attributes';
import { MotionRuntime } from '@/motion/react';

import './globals.css';
import styles from './layout.module.css';

/**
 * Imagen para compartir (Open Graph y Twitter): la foto del hero, que es la
 * primera impresión de la marca, recortada a 1200×630 (`SHARE_IMAGE_ASSET`).
 * Ancho, alto y tipo salen como `og:image:width`, `og:image:height` y
 * `og:image:type`: WhatsApp y las redes arman la tarjeta sin medir la imagen.
 * Relativa: `metadataBase` la vuelve absoluta.
 */
const SHARE_IMAGE = {
  url: SHARE_IMAGE_ASSET.src,
  width: SHARE_IMAGE_ASSET.width,
  height: SHARE_IMAGE_ASSET.height,
  type: SHARE_IMAGE_ASSET.type,
  alt: siteContent.meta.ogImageAlt,
};

/**
 * Metadata del sitio (título, description, Open Graph, Twitter). Sale de
 * `siteContent.meta`: acá no hay texto propio. `metadataBase` vuelve absolutas
 * las URLs relativas (imagen, canonical).
 *
 * Es la del home y la base de las demás páginas. Next la combina con la de
 * cada página **por clave y sin mezclar el interior**: una página de viaje que
 * no declare `alternates` y `openGraph` hereda el canonical y el `og:url` del
 * home (`/`), y una que declare `openGraph` pierde la imagen de acá si no la
 * repite.
 */
export const metadata: Metadata = {
  // why: un `metadataBase` explícito anula el fallback de Next a
  // `VERCEL_PROJECT_PRODUCTION_URL`; por eso `SITE_URL` ya lo incluye en su
  // orden de resolución (`constants/siteUrl.ts`).
  metadataBase: SITE_URL,
  title: {
    default: siteContent.meta.title,
    template: `%s · ${SITE.name}`,
  },
  description: siteContent.meta.description,
  keywords: [...siteContent.meta.keywords],
  applicationName: SITE.name,
  alternates: { canonical: ROUTES.home },
  openGraph: {
    type: 'website',
    locale: SITE.ogLocale,
    siteName: SITE.name,
    url: ROUTES.home,
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
 * Shell de todas las páginas (el home y las de viaje), en este orden dentro
 * del fondo que cambia de color:
 *
 * 0. `ContourLines`: el fondo general de curvas de nivel, una capa fija
 *    detrás de todo (pedido del cliente, octubre 2026).
 * 1. "Saltar al contenido": el primer foco, lleva al `<main>` de la página.
 * 2. `SiteChrome`: cursor montaña y barra de progreso (fijos y decorativos).
 * 3. `Navbar`: marca (vuelve al home), links a las secciones del home y CTA
 *    de WhatsApp. Transparente sobre la foto de portada y sólido al
 *    scrollear (`navBar()`, lo resuelve el motor).
 * 4. La página (`children`): cada una trae su propio `<main id="contenido">`.
 * 5. `SiteFooter`: el `<footer>` del sitio, igual en todas las páginas.
 * 6. El WhatsApp flotante, último en el orden de tabulación.
 *
 * Afuera del fondo, `MotionRuntime` arranca el motor de animación. Sin telón
 * de entrada: la página se pinta de una y la intro del hero arranca al
 * hidratar.
 *
 * Todo es Server Component salvo `MotionRuntime`: las animaciones se enganchan
 * por atributos `data-*`, así que el marcado se renderiza entero en el
 * servidor.
 *
 * `data-scroll-behavior="smooth"` le avisa a Next que el `<html>` tiene
 * `scroll-behavior: smooth` (`design-system/base.css`): al pasar de una página
 * a otra lo apaga un momento y la página nueva arranca arriba de una vez, sin
 * recorrer en cámara lenta todo lo que había scrolleado la anterior. Los
 * saltos dentro de la misma página (`/#viajes` estando en el home) siguen
 * siendo suaves.
 */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const whatsappHref = whatsapp.href();

  return (
    <html lang={SITE.htmlLang} className={fontVariables} data-scroll-behavior="smooth">
      <body>
        <div {...backgroundRoot()} className={styles.backgroundRoot}>
          <ContourLines className={styles.contours} />
          <a href={anchorTo('content')} className={styles.skipLink}>
            {siteContent.skipLink}
          </a>
          <SiteChrome />
          <Navbar
            {...navBar()}
            brand={{ ...siteContent.brand, href: ROUTES.home }}
            links={siteContent.nav.links}
            cta={{ label: siteContent.nav.cta, href: whatsappHref }}
            ariaLabel={siteContent.nav.ariaLabel}
          />
          {children}
          {/* Fuera del `<main>` de cada página: es el `contentinfo` del sitio. */}
          <SiteFooter content={footerContent} />
          {/*
            Al final: es interactivo, y su lugar en el DOM es su lugar en el
            orden de tabulación. En el diseño es lo último de la página.
          */}
          {FEATURE_FLAGS.floatingWhatsApp && (
            <FloatingWhatsApp
              href={whatsappHref}
              ariaLabel={siteContent.floatingWhatsApp.ariaLabel}
              regionLabel={siteContent.floatingWhatsApp.regionLabel}
            />
          )}
        </div>
        {/* Fuera del fondo: no renderiza nada, solo arranca y apaga el motor. */}
        <MotionRuntime />
      </body>
    </html>
  );
}
