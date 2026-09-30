import { Fragment } from 'react';

import type { HeroHeadlineContent, HeroHeadlineLine } from '@/content/sections/hero';
import { reveal } from '@/motion/attributes';

import styles from './HeroHeadline.module.css';

/** Props de `HeroHeadline`: el titular del slice del hero. */
export type HeroHeadlineProps = HeroHeadlineContent;

/** Una palabra con su escalón de entrada. */
type StaggeredWord = { readonly word: string; readonly delay: number };

/**
 * Le asigna a cada palabra su escalón de entrada: su posición en la frase
 * (0, 1, 2…), sin reiniciar en cada renglón.
 *
 * El diseño lo calcula como `renglón * 5 + palabra` (`dc.html:659`), que da lo
 * mismo porque sus dos renglones tienen 5 palabras. Contar las palabras
 * anteriores no depende de ese 5: si un renglón cambia de largo, las palabras
 * siguen entrando de a una y no dos a la vez.
 */
function staggerWords(lines: readonly HeroHeadlineLine[]): StaggeredWord[][] {
  return lines.map((line, lineIndex) => {
    const wordsBefore = lines
      .slice(0, lineIndex)
      .reduce((count, previous) => count + previous.length, 0);
    return line.map((word, wordIndex) => ({ word, delay: wordsBefore + wordIndex }));
  });
}

/**
 * Titular del hero (`dc.html:63-71`), el único `<h1>` de la página.
 *
 * Cada palabra sube desde detrás de su máscara (`overflow: hidden`) cuando se
 * abre el telón: `reveal('word')` la deja en manos de la intro, no del scroll,
 * y el escalón (`delay`) la hace entrar una después de otra.
 *
 * En escritorio son los dos renglones del diseño, cada uno en una línea. En
 * mobile (≤ 820px) los renglones se disuelven y la frase fluye como un solo
 * párrafo (ver el módulo): el marcado es el mismo, solo cambia el CSS.
 *
 * Accesibilidad: el `<h1>` se nombra con la frase entera (`aria-label`) y los
 * renglones partidos van `aria-hidden`, así un lector de pantalla anuncia una
 * frase y no diez fragmentos. Entre palabra y palabra (y entre renglones) va
 * un espacio de texto: dentro de un contenedor flex o grid no ocupa lugar
 * —la separación la da el `column-gap`—, pero hace que el texto del `<h1>`
 * (buscadores, copiar y pegar) se lea "Creo experiencias…" y no "Creoexperiencias…".
 */
export function HeroHeadline({ text, lines }: HeroHeadlineProps) {
  return (
    <h1 className={styles.headline} aria-label={text}>
      {staggerWords(lines).map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && ' '}
          <span className={styles.line} aria-hidden="true">
            {line.map(({ word, delay }, wordIndex) => (
              <Fragment key={delay}>
                {wordIndex > 0 && ' '}
                <span className={styles.mask}>
                  <span className={styles.word} {...reveal('word', { delay })}>
                    {word}
                  </span>
                </span>
              </Fragment>
            ))}
          </span>
        </Fragment>
      ))}
    </h1>
  );
}
