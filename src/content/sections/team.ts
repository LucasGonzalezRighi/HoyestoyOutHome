import { SITE } from '@/constants/site';
import { PHOTOS } from '@/content/media';
import type { SectionHeadingContent } from '@/content/types';
import { Guide } from '@/domain';

/**
 * Contenido de "¿Quiénes somos?" (sección 10 del diseño, `dc.html:314-328`;
 * datos en el array `equipo` del script, `dc.html:708-713`).
 *
 * El eyebrow es obligatorio acá (en `SectionHeadingContent` es opcional): la
 * coreografía de la sección cuenta con él para escalonar título y bajada.
 */
export type TeamContent = SectionHeadingContent & {
  /** "Sobre nosotros". */
  readonly eyebrow: string;
  /** Bajada debajo del título: quiénes somos y cómo trabajamos. */
  readonly lead: string;
  /**
   * Los guías que se muestran, cada uno como un link a su Instagram. Hoy es
   * uno solo (el diseño tiene cuatro); la sección los centra, sean los que sean.
   */
  readonly guides: readonly Guide[];
};

/**
 * Las fotos del equipo van **sin alt** (decorativas): cada una está dentro del
 * link del guía, al lado de su nombre. Con el alt del registro (`PHOTOS.team*`,
 * que es el nombre) el lector de pantalla anunciaría el link como "Lucas
 * Chichizola Lucas Chichizola…". Es el caso "imagen y texto en el mismo link"
 * de la guía de imágenes de la WAI.
 */
const AVATARS = {
  lucas: PHOTOS.teamLucas.withAlt(''),
} as const;

/**
 * Textos y guías de "¿Quiénes somos?", verbatim del diseño. De los cuatro
 * guías del diseño queda solo Lucas Chichizola, a pedido del cliente.
 *
 * El nombre de la marca en la bajada sale de `SITE`: si cambia, esta sección
 * no queda desactualizada.
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
  ],
};
