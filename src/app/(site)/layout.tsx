import type { ReactNode } from 'react';

import { ContourLines } from '@/components/atoms/ContourLines';
import { Navbar } from '@/components/organisms/Navbar';
import { ROUTES } from '@/constants/routes';
import { anchorTo } from '@/constants/sections';
import { FEATURE_FLAGS } from '@/constants/site';
import { footerContent } from '@/content/sections/contact';
import { siteContent } from '@/content/sections/site';
import { whatsapp } from '@/content/whatsapp';
import { SiteFooter } from '@/features/contact';
import { FloatingWhatsApp, SiteChrome } from '@/features/site-chrome';
import { backgroundRoot, navBar } from '@/motion/attributes';
import { MotionRuntime } from '@/motion/react';

import styles from './layout.module.css';

/**
 * Shell de las páginas del sitio (el home y las de viaje), en este orden
 * dentro del fondo que cambia de color:
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
 * El `<html>` y el `<body>` los pone el layout raíz (`app/layout.tsx`), que
 * comparte con el panel de administración: el panel no lleva nada de esto.
 */
export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  const whatsappHref = whatsapp.href();

  return (
    <>
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
    </>
  );
}
