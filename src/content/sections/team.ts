import { SITE } from '@/constants/site';
import { tripCatalog } from '@/content/catalog/trips';
import { PHOTOS } from '@/content/media';
import type { SectionHeadingContent } from '@/content/types';
import { Guide } from '@/domain';

/**
 * Contenido de la sección 10, "¿Quiénes somos?" (`dc.html:314-328`; datos en
 * el array `equipo` del script, `dc.html:708-713`).
 *
 * El eyebrow es obligatorio acá (en `SectionHeadingContent` es opcional): la
 * coreografía de la sección cuenta con él para escalonar título y bajada.
 */
export type TeamContent = SectionHeadingContent & {
  /** "Sobre nosotros". */
  readonly eyebrow: string;
  /** Bajada debajo del título: quiénes somos y cómo trabajamos. */
  readonly lead: string;
  /** Los guías, en el orden del diseño. Cada uno se muestra como un link a su Instagram. */
  readonly guides: readonly Guide[];
};

const calleStepanek = tripCatalog.get('calle-stepanek');

/**
 * Las fotos del equipo van **sin alt** (decorativas): cada una está dentro del
 * link del guía, al lado de su nombre. Con el alt del registro (`PHOTOS.team*`,
 * que es el nombre) el lector de pantalla anunciaría el link como "Lucas
 * Chichizola Lucas Chichizola…". Es el caso "imagen y texto en el mismo link"
 * de la guía de imágenes de la WAI.
 */
const AVATARS = {
  lucas: PHOTOS.teamLucas.withAlt(''),
  andres: PHOTOS.teamAndres.withAlt(''),
  luis: PHOTOS.teamLuis.withAlt(''),
  estanislao: PHOTOS.teamEstanislao.withAlt(''),
} as const;

/**
 * Textos y guías de "¿Quiénes somos?", verbatim del diseño.
 *
 * El nombre de la marca en la bajada y el nombre corto del viaje en los roles
 * salen de `SITE` y del catálogo: si cambian, esta sección no queda
 * desactualizada.
 */
export const teamContent: TeamContent = {
  eyebrow: 'Sobre nosotros',
  title: '¿Quiénes somos?',
  lead: `Somos ${SITE.name}: guías que armamos travesías para que descubras nuevos paisajes y superes tus propios límites, de forma segura y responsable. Grupos chicos y atención personalizada, antes y durante cada salida.`,
  guides: [
    new Guide({
      name: 'Lucas Chichizola',
      role: 'Guía de Turismo Aventura, Senderos y Selva',
      instagramHandle: 'chichizolalucas',
      photo: AVATARS.lucas,
    }),
    new Guide({
      name: 'Andrés Gavilán',
      role: 'Guía de Montaña y Guía de Selva',
      instagramHandle: 'andres.gavilan',
      photo: AVATARS.andres,
    }),
    new Guide({
      name: 'Luis Aguiar',
      role: `Guía · ${calleStepanek.shortName}`,
      instagramHandle: 'luisaguuiar',
      photo: AVATARS.luis,
    }),
    new Guide({
      name: 'Estanislao Malic',
      role: `Guía · ${calleStepanek.shortName}`,
      instagramHandle: 'estanislaomalic',
      photo: AVATARS.estanislao,
    }),
  ],
};
