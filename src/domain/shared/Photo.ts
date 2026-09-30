import { assertInteger, assertText } from './invariants';

/** Datos para crear una `Photo`. */
export type PhotoParams = {
  /** Ruta pública (`/images/photos/…`) o URL absoluta. */
  src: string;
  /** Texto alternativo. `''` marca la foto como decorativa. */
  alt: string;
  /** Encuadre para `object-position` (`'center 62%'`). Por defecto `'center'`. */
  position?: string;
  /** Ancho intrínseco del archivo, en píxeles (entero > 0). */
  width: number;
  /** Alto intrínseco del archivo, en píxeles (entero > 0). */
  height: number;
};

/** Una ruta de `public/` arranca con `/`; si no, `next/image` no la encuentra. */
const SRC_PATTERN = /^(\/|https?:\/\/)/;

/**
 * Una foto con su texto alternativo, su encuadre y sus dimensiones intrínsecas.
 *
 * Value object: dos usos de la misma foto con distinto encuadre son dos
 * instancias (`photo.withPosition('center 75%')`), y la del registro
 * (`content/media.ts`) no cambia nunca.
 *
 * Conoce sus dimensiones porque hay marcos que miden lo que mediría la foto
 * en flujo: en el diseño la foto de cada etapa de Lolog es una `<img>` con su
 * alto natural, y una foto vertical estira la card (`dc.html:264`). Con
 * `next/image` en modo `fill` ese alto se pierde; `aspectRatio` lo devuelve.
 *
 * Es estructuralmente compatible con `{ src: string; alt: string; position?: string }`,
 * así que un componente presentacional la recibe sin conocer el dominio.
 * Ojo: los datos son getters, así que se leen de a uno (`photo.src`); un
 * spread (`{...photo}`) no los copia.
 */
export class Photo {
  /** Encuadre neutro: el que usa el navegador cuando nadie fija uno. */
  static readonly DEFAULT_POSITION = 'center';

  private readonly props: Readonly<Required<PhotoParams>>;

  constructor({ src, alt, position = Photo.DEFAULT_POSITION, width, height }: PhotoParams) {
    if (!SRC_PATTERN.test(src)) {
      throw new Error(
        `La ruta de la foto tiene que empezar con "/" o "http(s)://" (llegó ${JSON.stringify(src)}).`,
      );
    }
    // why: un alt de puros espacios no es ni decorativo ni descriptivo; casi
    // siempre es un texto que se borró a medias.
    if (alt !== '' && alt.trim() === '') {
      throw new Error(`El alt de ${src} tiene solo espacios: va '' (decorativa) o un texto.`);
    }
    assertText(position, `El encuadre de ${src}`);
    assertInteger(width, `El ancho de ${src}`, { min: 1 });
    assertInteger(height, `El alto de ${src}`, { min: 1 });
    this.props = Object.freeze({ src, alt, position, width, height });
  }

  get src(): string {
    return this.props.src;
  }

  get alt(): string {
    return this.props.alt;
  }

  get position(): string {
    return this.props.position;
  }

  /** Ancho intrínseco del archivo, en píxeles. */
  get width(): number {
    return this.props.width;
  }

  /** Alto intrínseco del archivo, en píxeles. */
  get height(): number {
    return this.props.height;
  }

  /**
   * Proporción ancho / alto lista para la propiedad `aspect-ratio` de CSS
   * (`"1080 / 1350"`). Va como texto y sin reducir: CSS divide solo, y así se
   * reconoce el tamaño del archivo al leer el estilo.
   */
  get aspectRatio(): string {
    return `${this.props.width} / ${this.props.height}`;
  }

  /** Sin texto alternativo: los lectores de pantalla la saltean (avatares del equipo, platos de la pensión). */
  get isDecorative(): boolean {
    return this.props.alt === '';
  }

  /** La misma foto (ruta, encuadre y dimensiones) con otro texto alternativo (`''` para usarla como decorativa). */
  withAlt(alt: string): Photo {
    return new Photo({ ...this.props, alt });
  }

  /** La misma foto (ruta, alt y dimensiones) con otro encuadre, para un uso que la recorta distinto. */
  withPosition(position: string): Photo {
    return new Photo({ ...this.props, position });
  }
}
