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
 * las fotos del cronograma de Lolog (`Timeline`) toman su alto de esta
 * proporción (`photo.aspectRatio`).
 *
 * Encuadre base = el más común entre los usos. En un empate gana `center` (el
 * neutro, el que asume cualquier uso que no fija uno).
 *
 * Los alt de hero y de Calle & Stepanek son los del diseño; el resto se
 * escribió mirando cada foto. El diseño usa el nombre del viaje o del tramo,
 * que ya está escrito al lado de la foto (el lector de pantalla lo leería dos
 * veces), o `alt=""` en la galería: acá las cards de viaje, el cronograma de
 * Lolog y la galería usan el alt descriptivo de este registro. Las fotos de la
 * pensión y del equipo llevan el nombre como alt, pero se usan como
 * decorativas (`withAlt('')`) porque el nombre ya está en el texto visible.
 *
 * Dónde se usa cada foto (con el encuadre, si no es el base):
 *
 * | Clave                 | Archivo (`photos/`)              | Uso                                                                  | Base        |
 * |-----------------------|----------------------------------|----------------------------------------------------------------------|-------------|
 * | `heroRange`           | IMG_20251125_105946729_HDR.jpg   | Hero del home (fondo con parallax) · alt de la imagen para compartir  | center      |
 * | `calleSummitSign`     | IMG_20251125_105222469_HDR.jpg   | Viaje Calle & Stepanek: card y portada de su página (center 62%)     | center      |
 * | `volcanicPlain`       | IMG_2907.jpg                     | Viaje Lago Lolog: card y portada                                     | center      |
 * | `refugeUnderStars`    | 1.jpg                            | Viaje Laguna Negra: card y portada · Lolog, cronograma día 1 (center 75%) | center 70% |
 * | `riverCrossing`       | IMG_2778.jpg                     | Viaje Cajón del Azul: card y portada                                 | center 35%  |
 * | `lakeshoreRest`       | IMG_2616.jpg                     | Lolog, cronograma día 0 · Galería fila 1                             | center      |
 * | `valleyDescent`       | IMG_2926.jpg                     | Lolog, cronograma día 2 · Galería fila 2                             | center      |
 * | `lakeshoreHorse`      | IMG_2240.jpg                     | Lolog, cronograma día 3 · Galería fila 2                             | center      |
 * | `volcanoView`         | IMG_2923.jpg                     | Lolog, cronograma día 4 (center 30%) · Galería fila 2                | center      |
 * | `volcanicTrailAscent` | IMG_2903.jpg                     | Galería fila 1                                                       | center      |
 * | `rockFlowers`         | IMG_20251125_110844038_HDR.jpg   | Galería fila 1                                                       | center      |
 * | `summitMate`          | IMG_3339.jpg                     | Galería fila 1                                                       | center      |
 * | `snowyPeakClouds`     | IMG_20251125_105621337_HDR.jpg   | Galería fila 1                                                       | center      |
 * | `summitCross`         | IMG_20260311_134556.jpg          | Galería fila 1                                                       | center      |
 * | `mountainStream`      | IMG_20251125_122309240_HDR.jpg   | Galería fila 2                                                       | center      |
 * | `screeAscent`         | IMG_20251125_080344703_HDR.jpg   | Galería fila 2                                                       | center      |
 * | `rockyRidgeClimber`   | IMG_20251125_104854614_HDR.jpg   | Galería fila 2 (en el diseño: `uploads/IMG_20251125_104854614 (1).jpg`) | center   |
 * | `food*`               | `food/*.png`                     | Pensión completa, en la página de cada viaje                         | center      |
 * | `teamLucas`           | `team/lucas.png`                 | ¿Quiénes somos? (home)                                               | center      |
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
} as const satisfies Record<string, Photo>;
