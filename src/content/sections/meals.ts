import { PHOTOS } from '@/content/media';
import type { Photo } from '@/domain';

/** Una comida de la pensión: el epígrafe del plato y su foto (ilustrativa). */
export type MealContent = {
  /** Nombre de la comida ("Desayuno"): es el epígrafe y la `key` de la lista. */
  readonly name: string;
  /** Foto del plato, de `PHOTOS`, decorativa (`alt=""`): el epígrafe ya la nombra. */
  readonly photo: Photo;
};

/**
 * Textos de "08 Pensión completa" (`docs/design/hoy-estoy-ooh-landing.dc.html:271-283`;
 * las comidas salen del array `comidas` del script, `dc.html:697`).
 */
export type MealsContent = {
  /** Antetítulo arriba del título ("Incluye"). No es un eyebrow: va sin mayúsculas sostenidas, en gris y a 18px. */
  readonly kicker: string;
  /** El título, con el asterisco que remite a la nota al pie. */
  readonly title: string;
  /** Las comidas del día, en el orden en que se muestran. */
  readonly meals: readonly MealContent[];
  /** La aclaración del asterisco del título. */
  readonly footnote: string;
};

/**
 * Los platos van **sin alt** (decorativos): cada foto está en un `<figure>`
 * cuyo `<figcaption>` es el nombre de la comida. Con el alt del diseño (el
 * mismo nombre, `alt="{{ f.n }}"`, `dc.html:277`) el lector de pantalla diría
 * "Desayuno Desayuno". Además las imágenes son ilustrativas (lo avisa la nota
 * al pie): describirlas no suma.
 */
const PLATES = {
  breakfast: PHOTOS.foodBreakfast.withAlt(''),
  lunch: PHOTOS.foodLunch.withAlt(''),
  afternoonSnack: PHOTOS.foodAfternoonSnack.withAlt(''),
  dinner: PHOTOS.foodDinner.withAlt(''),
} as const;

/** Contenido de la sección 08, con las fotos de `PHOTOS` como platos decorativos. */
export const mealsContent: MealsContent = {
  kicker: 'Incluye',
  title: 'Pensión completa*',
  meals: [
    { name: 'Desayuno', photo: PLATES.breakfast },
    { name: 'Almuerzo', photo: PLATES.lunch },
    { name: 'Merienda', photo: PLATES.afternoonSnack },
    { name: 'Cena', photo: PLATES.dinner },
  ],
  footnote:
    '*Las imágenes son a modo de ilustración. En Lago Lolog no incluye día 0 ni la cena del día 4.',
};
