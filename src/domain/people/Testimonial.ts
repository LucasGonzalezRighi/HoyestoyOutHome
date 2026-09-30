import { formatCount } from '../shared/formatters';
import { assertInteger, assertText } from '../shared/invariants';

/** Datos para crear un `Testimonial`. */
export type TestimonialParams = {
  /** La frase, **sin comillas**: las pone `quotedText()`. */
  quote: string;
  /** "Sofía M." */
  author: string;
  city: string;
  /** Nombre corto del viaje que hizo: "Calle & Stepanek". */
  tripName: string;
  /** Estrellas, de 1 a 5. Por defecto 5. */
  rating?: number;
};

/**
 * Un testimonio de la cinta de la sección 11 ("Lo que se traen de la montaña").
 *
 * Invariante: `rating` es un entero de 1 a `Testimonial.MAX_RATING`.
 */
export class Testimonial {
  /** Tope de la escala de estrellas. */
  static readonly MAX_RATING = 5;

  private readonly props: Readonly<Required<TestimonialParams>>;

  constructor({
    quote,
    author,
    city,
    tripName,
    rating = Testimonial.MAX_RATING,
  }: TestimonialParams) {
    assertText(quote, 'La frase del testimonio');
    assertText(author, 'El autor del testimonio');
    assertText(city, `La ciudad de ${author}`);
    assertText(tripName, `El viaje de ${author}`);
    assertInteger(rating, `La calificación de ${author}`, { min: 1, max: Testimonial.MAX_RATING });
    this.props = Object.freeze({ quote, author, city, tripName, rating });
  }

  get quote(): string {
    return this.props.quote;
  }

  get author(): string {
    return this.props.author;
  }

  get city(): string {
    return this.props.city;
  }

  get tripName(): string {
    return this.props.tripName;
  }

  get rating(): number {
    return this.props.rating;
  }

  /**
   * `"★★★★★"`. Si la calificación es menor al tope, completa con estrellas
   * vacías (`"★★★★☆"`) para que se lea como "4 de 5" y no como "4".
   */
  stars(): string {
    const { rating } = this.props;
    return '★'.repeat(rating) + '☆'.repeat(Testimonial.MAX_RATING - rating);
  }

  /**
   * `"5 estrellas"` — el `aria-label` de las estrellas (los lectores de
   * pantalla leen "estrella negra" cinco veces si no).
   */
  ratingLabel(): string {
    return formatCount(this.props.rating, 'estrella', 'estrellas');
  }

  /** La frase entre comillas tipográficas: `"“…”"`. */
  quotedText(): string {
    return `“${this.props.quote}”`;
  }
}
