import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { SHARE_IMAGE_ASSET } from '@/constants/assets';
import { ROUTES } from '@/constants/routes';
import { SITE } from '@/constants/site';
import { SITE_URL } from '@/constants/siteUrl';
import { siteContent } from '@/content/sections/site';
import { fontVariables } from '@/design-system/fonts';

import './globals.css';

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
 * El `<html>` de todas las páginas: el sitio (`(site)/layout.tsx`, con nav,
 * footer y motor de animación) y el panel de administración
 * (`admin/layout.tsx`, sin nada de eso). Solo pone el idioma, las fuentes y
 * el design system (`globals.css`).
 *
 * `data-scroll-behavior="smooth"` le avisa a Next que el `<html>` tiene
 * `scroll-behavior: smooth` (`design-system/base.css`): al pasar de una página
 * a otra lo apaga un momento y la página nueva arranca arriba de una vez, sin
 * recorrer en cámara lenta todo lo que había scrolleado la anterior. Los
 * saltos dentro de la misma página (`/#viajes` estando en el home) siguen
 * siendo suaves.
 */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={SITE.htmlLang} className={fontVariables} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
