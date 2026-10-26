import { CoverPair } from '@/components/organisms/CoverPair';
import { SECTION_IDS } from '@/constants/sections';
import type { LandingContent } from '@/content';
import { Calendar } from '@/features/calendar';
import { Contact } from '@/features/contact';
import { Faq } from '@/features/faq';
import { Gallery } from '@/features/gallery';
import { Hero } from '@/features/hero';
import { Team } from '@/features/team';
import { Testimonials } from '@/features/testimonials';
import { TripsShowcase } from '@/features/trips';
import { WhyUs } from '@/features/why-us';

/** Props de `Landing`: el contenido del home ya armado (`getSiteContent().landing`). */
export type LandingProps = {
  /** Un slice por sección. */
  content: LandingContent;
};

/**
 * Composición del home: solo información general. Lo propio de cada viaje
 * (cronograma, qué incluye, pensión, precio) vive en su página
 * (`/viajes/<slug>`), por pedido del cliente (octubre 2026).
 *
 * Es el `<main>` del home y el destino del link "Saltar al contenido". Cada
 * sección recibe **solo su slice** del contenido —como Kora hace con los
 * diccionarios—: así ninguna puede leer texto que no le corresponde, y su tipo
 * dice exactamente qué usa.
 *
 * Tres cortinas (`CoverPair`, pedido del cliente, octubre 2026): Por qué
 * viajar, Calendario y Testimonios se quedan quietas y la sección siguiente
 * (Viajes, Quiénes somos, Galería) sube y las tapa.
 *
 * El footer no va acá: lo renderiza el layout, igual en todas las páginas.
 */
export function Landing({ content }: LandingProps) {
  return (
    <main id={SECTION_IDS.content}>
      <Hero content={content.hero} />
      <CoverPair
        pinned={<WhyUs content={content.whyUs} />}
        sheet={<TripsShowcase content={content.trips} />}
      />
      <CoverPair
        pinned={<Calendar content={content.calendar} />}
        sheet={<Team content={content.team} />}
      />
      <CoverPair
        pinned={<Testimonials content={content.testimonials} />}
        sheet={<Gallery content={content.gallery} />}
      />
      <Faq content={content.faq} />
      <Contact content={content.contact} />
    </main>
  );
}
