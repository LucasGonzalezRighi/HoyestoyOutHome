import { ASSET_DIRS } from '@/constants/assets';
import { Photo } from '@/domain';

/** Ruta pública de un archivo dentro de uno de los directorios de `ASSET_DIRS`. */
function assetPath(dir: keyof typeof ASSET_DIRS, file: string): string {
  return `${ASSET_DIRS[dir]}/${file}`;
}

/**
 * Registro de fotos: **una instancia de `Photo` por archivo** de
 * `public/images/`, con su ruta, sus dimensiones, su texto alternativo y su
 * encuadre base.
 *
 * Ninguna sección escribe una ruta ni un alt: toma la foto de acá. Si una
 * sección la recorta distinto, lo resuelve donde la usa con
 * `PHOTOS.x.withPosition('center 75%')`; la instancia de acá no cambia.
 *
 * `width`/`height` son las del archivo tal cual está en `public/images/`
 * (píxeles, sin rotación EXIF). Si se reemplaza una foto, se actualizan acá:
 * las cards del itinerario de Lolog toman su alto de esta proporción.
 *
 * Encuadre base = el más común entre los usos del diseño. En un empate gana
 * `center` (el neutro, el que asume cualquier uso que no fija uno); si ninguno
 * de los usos es `center`, gana el primero en el orden de la página.
 *
 * Los alt de hero, Calle & Stepanek y banda son los del diseño; el resto se
 * escribió mirando cada foto. El diseño usa el nombre del viaje o del tramo,
 * que ya está escrito al lado de la foto (el lector de pantalla lo leería dos
 * veces), o `alt=""` en la galería: acá las cards de viaje, el itinerario y la
 * galería usan el alt descriptivo de este registro. Las fotos de la pensión y
 * del equipo llevan el nombre como alt, pero esas secciones las usan como
 * decorativas (`withAlt('')`) porque el nombre ya está en el texto visible.
 *
 * Qué foto usa cada sección del diseño (`docs/design/hoy-estoy-ooh-landing.dc.html`):
 *
 * | Clave                 | Archivo (`photos/`)              | Sección del diseño (encuadre si no es el base)                   | Base        |
 * |-----------------------|----------------------------------|-------------------------------------------------------------------|-------------|
 * | `heroRange`           | IMG_20251125_105946729_HDR.jpg   | 01 Hero (fondo con parallax)                                      | center      |
 * | `calleSummitSign`     | IMG_20251125_105222469_HDR.jpg   | 03 Viajes, card Calle & Stepanek (center 62%) · 04 foto sticky     | center      |
 * | `volcanicPlain`       | IMG_2907.jpg                     | 03 Viajes, card Lago Lolog                                        | center      |
 * | `refugeUnderStars`    | 1.jpg                            | 03 Viajes, card Laguna Negra · 07 Itinerario día 1 (center 75%)   | center 70%  |
 * | `riverCrossing`       | IMG_2778.jpg                     | 03 Viajes, card Cajón del Azul                                    | center 35%  |
 * | `summitAboveClouds`   | IMG_20260310_104358.jpg          | 06 Banda "La montaña te espera."                                  | center 62%  |
 * | `lakeshoreRest`       | IMG_2616.jpg                     | 07 Itinerario día 0 · 12 Galería fila 1                           | center      |
 * | `valleyDescent`       | IMG_2926.jpg                     | 07 Itinerario día 2 · 12 Galería fila 2                           | center      |
 * | `lakeshoreHorse`      | IMG_2240.jpg                     | 07 Itinerario día 3 · 12 Galería fila 2                           | center      |
 * | `volcanoView`         | IMG_2923.jpg                     | 07 Itinerario día 4 (center 30%) · 12 Galería fila 2              | center      |
 * | `volcanicTrailAscent` | IMG_2903.jpg                     | 12 Galería fila 1                                                 | center      |
 * | `rockFlowers`         | IMG_20251125_110844038_HDR.jpg   | 12 Galería fila 1                                                 | center      |
 * | `summitMate`          | IMG_3339.jpg                     | 12 Galería fila 1                                                 | center      |
 * | `snowyPeakClouds`     | IMG_20251125_105621337_HDR.jpg   | 12 Galería fila 1                                                 | center      |
 * | `summitCross`         | IMG_20260311_134556.jpg          | 12 Galería fila 1                                                 | center      |
 * | `mountainStream`      | IMG_20251125_122309240_HDR.jpg   | 12 Galería fila 2                                                 | center      |
 * | `screeAscent`         | IMG_20251125_080344703_HDR.jpg   | 12 Galería fila 2                                                 | center      |
 * | `rockyRidgeClimber`   | IMG_20251125_104854614_HDR.jpg   | 12 Galería fila 2 (en el diseño: `uploads/IMG_20251125_104854614 (1).jpg`) | center |
 * | `food*`               | `food/*.png`                     | 08 Pensión completa                                               | center      |
 * | `team*`               | `team/*.png`                     | 10 ¿Quiénes somos?                                                | center      |
 *
 * Orden de la galería en el diseño — fila 1: volcanicTrailAscent, rockFlowers,
 * summitMate, snowyPeakClouds, summitCross, lakeshoreRest · fila 2:
 * mountainStream, screeAscent, lakeshoreHorse, rockyRidgeClimber,
 * valleyDescent, volcanoView.
 */
export const PHOTOS = {
  /* ── Fotos de paisaje y travesía (`photos/`) ─────────────────────────── */
  heroRange: new Photo({
    src: assetPath('photos', 'IMG_20251125_105946729_HDR.jpg'),
    width: 1600,
    height: 1200,
    alt: 'Cordón de montañas en Mendoza',
  }),
  calleSummitSign: new Photo({
    src: assetPath('photos', 'IMG_20251125_105222469_HDR.jpg'),
    width: 1200,
    height: 1600,
    alt: 'Cartel de cumbre Adolfo Calle, 4.290 m s.n.m.',
  }),
  volcanicPlain: new Photo({
    src: assetPath('photos', 'IMG_2907.jpg'),
    width: 1400,
    height: 788,
    alt: 'Dos mochileros cruzan una planicie de arena volcánica al pie de un cerro',
  }),
  refugeUnderStars: new Photo({
    src: assetPath('photos', '1.jpg'),
    width: 1080,
    height: 1350,
    alt: 'Grupo frente a un refugio de madera, de noche y bajo un cielo estrellado',
    // Card de Laguna Negra (`pos: 'center 70%'` en el array `trips` del diseño).
    position: 'center 70%',
  }),
  riverCrossing: new Photo({
    src: assetPath('photos', 'IMG_2778.jpg'),
    width: 933,
    height: 1400,
    alt: 'Mochilero cruza un río con el agua a las rodillas, las botas colgadas y bastones',
    // Card de Cajón del Azul (`pos: 'center 35%'` en el array `trips` del diseño).
    position: 'center 35%',
  }),
  summitAboveClouds: new Photo({
    src: assetPath('photos', 'IMG_20260310_104358.jpg'),
    width: 1600,
    height: 1200,
    alt: 'Grupo en la cumbre sobre las nubes',
    // `object-position: center 62%` de la banda (sección 06).
    position: 'center 62%',
  }),
  lakeshoreRest: new Photo({
    src: assetPath('photos', 'IMG_2616.jpg'),
    width: 1400,
    height: 933,
    alt: 'Dos personas descansan en el pasto a orillas de un lago, entre cerros con bosque',
  }),
  valleyDescent: new Photo({
    src: assetPath('photos', 'IMG_2926.jpg'),
    width: 1400,
    height: 1120,
    alt: 'Tres mochileros bajan con bastones hacia un valle de piedra volcánica con un arroyo',
  }),
  lakeshoreHorse: new Photo({
    src: assetPath('photos', 'IMG_2240.jpg'),
    width: 1400,
    height: 933,
    alt: 'Grupo caminando por la orilla de un lago junto a un caballo que pasta',
  }),
  volcanoView: new Photo({
    src: assetPath('photos', 'IMG_2923.jpg'),
    width: 1120,
    height: 1400,
    alt: 'Volcán nevado detrás de cerros con bosque, con laderas de piedra volcánica adelante',
  }),
  volcanicTrailAscent: new Photo({
    src: assetPath('photos', 'IMG_2903.jpg'),
    width: 1400,
    height: 1120,
    alt: 'Tres mochileros suben por un sendero de arena volcánica hacia un cerro',
  }),
  rockFlowers: new Photo({
    src: assetPath('photos', 'IMG_20251125_110844038_HDR.jpg'),
    width: 1050,
    height: 1400,
    alt: 'Flores blancas que crecen en una grieta de la roca',
  }),
  summitMate: new Photo({
    src: assetPath('photos', 'IMG_3339.jpg'),
    width: 1400,
    height: 933,
    alt: 'Cuatro personas sentadas en una cima rocosa se pasan un mate frente a un cordón de montañas',
  }),
  snowyPeakClouds: new Photo({
    src: assetPath('photos', 'IMG_20251125_105621337_HDR.jpg'),
    width: 1400,
    height: 1048,
    alt: 'Cerro nevado entre nubes, visto desde una arista de roca',
  }),
  summitCross: new Photo({
    src: assetPath('photos', 'IMG_20260311_134556.jpg'),
    width: 1050,
    height: 1400,
    alt: 'Cruz de cumbre cubierta de calcomanías, con cerros nevados y nubes detrás',
  }),
  mountainStream: new Photo({
    src: assetPath('photos', 'IMG_20251125_122309240_HDR.jpg'),
    width: 1050,
    height: 1400,
    alt: 'Arroyo de montaña entre vegas verdes, bajo un cielo con nubes',
  }),
  screeAscent: new Photo({
    src: assetPath('photos', 'IMG_20251125_080344703_HDR.jpg'),
    width: 1400,
    height: 1048,
    alt: 'Tres montañistas suben por una ladera de piedras sueltas bajo el cielo azul',
  }),
  rockyRidgeClimber: new Photo({
    src: assetPath('photos', 'IMG_20251125_104854614_HDR.jpg'),
    width: 1050,
    height: 1403,
    alt: 'Montañista con casco y bastones sobre una cresta rocosa, con cerros nevados detrás',
  }),

  /* ── Pensión completa (`food/`): las imágenes son ilustrativas ────────── */
  foodBreakfast: new Photo({
    src: assetPath('food', 'desayuno.png'),
    width: 196,
    height: 196,
    alt: 'Desayuno',
  }),
  foodLunch: new Photo({
    src: assetPath('food', 'almuerzo.png'),
    width: 196,
    height: 196,
    alt: 'Almuerzo',
  }),
  foodAfternoonSnack: new Photo({
    src: assetPath('food', 'merienda.png'),
    width: 196,
    height: 196,
    alt: 'Merienda',
  }),
  foodDinner: new Photo({
    src: assetPath('food', 'cena.png'),
    width: 196,
    height: 196,
    alt: 'Cena',
  }),

  /* ── Equipo (`team/`) ─────────────────────────────────────────────────── */
  teamLucas: new Photo({
    src: assetPath('team', 'lucas.png'),
    width: 216,
    height: 216,
    alt: 'Lucas Chichizola',
  }),
  teamAndres: new Photo({
    src: assetPath('team', 'andres.png'),
    width: 232,
    height: 232,
    alt: 'Andrés Gavilán',
  }),
  teamLuis: new Photo({
    src: assetPath('team', 'luis.png'),
    width: 216,
    height: 216,
    alt: 'Luis Aguiar',
  }),
  teamEstanislao: new Photo({
    src: assetPath('team', 'estanislao.png'),
    width: 216,
    height: 216,
    alt: 'Estanislao Malic',
  }),
} as const satisfies Record<string, Photo>;
