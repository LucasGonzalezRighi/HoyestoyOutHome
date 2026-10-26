import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { tripPath } from '@/constants/routes';
import { SECTION_IDS } from '@/constants/sections';
import { SITE } from '@/constants/site';
import { TripDetail } from '@/features/trip-detail';
import { getSiteContent } from '@/server/content/siteContent';

/** Props de la página: en Next 16 los `params` llegan como Promise. */
type TripPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Cada cuánto se vuelve a armar la página aunque nadie guarde nada (en
 * segundos): así las salidas que ya pasaron dejan de verse. Lo que se guarda
 * en el panel se ve enseguida.
 */
export const revalidate = 3600;

/**
 * Las páginas de los viajes visibles se prerenderizan en el build. Un viaje
 * creado después desde el panel se arma la primera vez que alguien entra y
 * queda cacheado; un slug que no es de ningún viaje visible responde 404.
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const { catalog } = await getSiteContent();
  return catalog.all().map((trip) => ({ slug: trip.slug }));
}

/**
 * Metadata de cada viaje: título (el layout le suma la marca con su
 * `template`), descripción, canonical propio y Open Graph / Twitter con la
 * foto del viaje.
 *
 * Next combina esta metadata con la del layout **por clave, sin mezclar el
 * interior**: `openGraph` y `twitter` se repiten enteros (tipo, locale, nombre
 * del sitio) porque si no se perderían, y `alternates` va siempre para no
 * heredar el canonical del home.
 */
export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = (await getSiteContent()).tripDetail(slug);
  if (!content) return {};

  const { title, description, photo } = content.meta;
  const url = tripPath(slug);
  const image = { url: photo.src, width: photo.width, height: photo.height, alt: photo.alt };

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: SITE.ogLocale,
      siteName: SITE.name,
      url,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

/**
 * La página de un viaje: su `<main>` (destino de "Saltar al contenido", como
 * el del home) con la plantilla `TripDetail` y el contenido del viaje.
 */
export default async function TripPage({ params }: TripPageProps) {
  const { slug } = await params;
  const content = (await getSiteContent()).tripDetail(slug);
  if (!content) notFound();

  return (
    <main id={SECTION_IDS.content}>
      <TripDetail content={content} />
    </main>
  );
}
