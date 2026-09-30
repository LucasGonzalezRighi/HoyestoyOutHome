import { SECTION_IDS } from '@/constants/sections';
import { landingContent } from '@/content';
import { CalleStepanek } from '@/features/calle-stepanek';
import { Contact, SiteFooter } from '@/features/contact';
import { Gallery } from '@/features/gallery';
import { Hero } from '@/features/hero';
import { Lolog } from '@/features/lolog';
import { Meals } from '@/features/meals';
import { MountainBanner } from '@/features/mountain-banner';
import { Services } from '@/features/services';
import { Team } from '@/features/team';
import { Testimonials } from '@/features/testimonials';
import { TripsShowcase } from '@/features/trips';
import { WhyUs } from '@/features/why-us';

/**
 * Composición de la landing, en el orden del diseño (`data-screen-label`
 * 01 Hero → 13 Precio y contacto).
 *
 * Es el único `<main>` de la página y el destino del link "Saltar al
 * contenido". Cada sección recibe **solo su slice** de `landingContent` —como
 * Kora hace con los diccionarios—: así ninguna puede leer texto que no le
 * corresponde, y su tipo dice exactamente qué usa.
 *
 * El footer va fuera del `<main>` (es el `contentinfo` de la página), pero
 * visualmente sigue al cierre: los dos cambian el fondo de la página al mismo
 * verde oscuro.
 */
export function Landing() {
  const content = landingContent;

  return (
    <>
      <main id={SECTION_IDS.content}>
        <Hero content={content.hero} />
        <WhyUs content={content.whyUs} />
        <TripsShowcase content={content.trips} />
        <CalleStepanek content={content.calleStepanek} />
        <MountainBanner content={content.mountainBanner} />
        <Lolog content={content.lolog} />
        <Meals content={content.meals} />
        <Services content={content.services} />
        <Team content={content.team} />
        <Testimonials content={content.testimonials} />
        <Gallery content={content.gallery} />
        <Contact content={content.contact} />
      </main>
      <SiteFooter content={content.footer} />
    </>
  );
}
