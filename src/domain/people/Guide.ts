import { assertText } from '../shared/invariants';
import type { Photo } from '../shared/Photo';

/** Datos para crear un `Guide`. */
export type GuideParams = {
  name: string;
  /** "Guía de Montaña y Guía de Selva". */
  role: string;
  /** Usuario de Instagram **sin** `@`: `'chichizolalucas'`. */
  instagramHandle: string;
  photo: Photo;
};

/** Reglas de usuario de Instagram: letras, números, punto y guion bajo; hasta 30. */
const HANDLE_PATTERN = /^[A-Za-z0-9._]{1,30}$/;

/**
 * Un guía del equipo (sección 10: "¿Quiénes somos?"). Cada card linkea a su
 * Instagram, así que la clase arma el link y la etiqueta a partir del usuario.
 */
export class Guide {
  private readonly props: Readonly<GuideParams>;

  constructor(params: GuideParams) {
    const { name, role, instagramHandle } = params;
    assertText(name, 'El nombre del guía');
    assertText(role, `El rol de ${name}`);
    if (!HANDLE_PATTERN.test(instagramHandle)) {
      throw new Error(
        `El usuario de Instagram de ${name} tiene que ser solo letras, números, "." o "_", sin "@" (llegó ${JSON.stringify(instagramHandle)}).`,
      );
    }
    this.props = Object.freeze({ ...params });
  }

  get name(): string {
    return this.props.name;
  }

  get role(): string {
    return this.props.role;
  }

  get instagramHandle(): string {
    return this.props.instagramHandle;
  }

  get photo(): Photo {
    return this.props.photo;
  }

  /** `https://instagram.com/<usuario>` — mismo formato que usa el diseño. */
  get instagramUrl(): string {
    return `https://instagram.com/${this.props.instagramHandle}`;
  }

  /** `"@usuario"` — lo que se lee en el tag de la card. */
  get handleLabel(): string {
    return `@${this.props.instagramHandle}`;
  }
}
