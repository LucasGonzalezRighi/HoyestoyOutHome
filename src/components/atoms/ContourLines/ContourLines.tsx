import { useId } from 'react';

import { cn } from '@/utils/cn';

import styles from './ContourLines.module.css';
import { CONTOUR_TILE } from './contourTile';

/**
 * Copias del mosaico apiladas. Con el ancho mínimo del dibujo (1400px, en el
 * módulo CSS) tres copias miden ~3400px de alto: más que la sección en un
 * celular con una respuesta abierta (~2500px), que es donde queda más alta.
 */
const TILE_COUNT = 3;

/** Props de `ContourLines`. */
export type ContourLinesProps = {
  /** Clase del envoltorio: quien lo usa decide dónde va (detrás de qué) y cómo se desvanece. */
  className?: string;
};

/**
 * Curvas de nivel de una carta topográfica: el **fondo general del sitio**
 * (pedido del cliente, octubre 2026). Lo monta el layout como una capa fija
 * detrás de todo, y lo repiten las secciones que suben en una cortina
 * (`CoverPair`) para tapar a la fija sin perder el fondo. Le da a la página
 * algo de montaña de lado a lado sin sumar fotos, y llena los costados que el
 * contenido centrado deja libres.
 *
 * Es decorativo (`aria-hidden`). El dibujo es un mosaico que se repite en
 * vertical (`contourTile.ts`): se define una vez en `<defs>` y se apila con
 * `<use>`, así el HTML lleva los trazos una sola vez.
 *
 * El envoltorio recorta lo que sobra por abajo. El dibujo se ancla arriba y se
 * escala por el **ancho** (no por el alto de la sección): al abrir o cerrar
 * una pregunta la banda cambia de alto y las curvas no se mueven.
 */
export function ContourLines({ className }: ContourLinesProps) {
  const tileId = useId();
  const { width, height, minor, major } = CONTOUR_TILE;

  return (
    <div aria-hidden="true" className={cn(styles.frame, className)}>
      <svg
        className={styles.drawing}
        viewBox={`0 0 ${width} ${height * TILE_COUNT}`}
        fill="none"
        focusable="false"
      >
        <defs>
          <g id={tileId}>
            <path className={styles.minor} d={minor} />
            <path className={styles.major} d={major} />
          </g>
        </defs>
        {Array.from({ length: TILE_COUNT }, (_, index) => (
          <use key={index} href={`#${tileId}`} y={index * height} />
        ))}
      </svg>
    </div>
  );
}
