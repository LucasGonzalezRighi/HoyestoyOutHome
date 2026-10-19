'use client';

import { FlagTriangleRight, Plus } from 'lucide-react';
import { useId, useState, useSyncExternalStore } from 'react';

import type { FaqEntry } from '@/content/sections/faq';
import { reveal, timelineFill } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './FaqAccordion.module.css';

/** Trazo de los íconos: Lucide a 2.75, regla del design system Organic (como `WhatsAppIcon`). */
const ICON_STROKE_WIDTH = 2.75;

/** Lado del ícono "+" en px. */
const PLUS_SIZE = 18;

/** Lado de la banderita del mojón en px: entra con aire en su círculo de 36px (30px en mobile). */
const FLAG_SIZE = 16;

/**
 * Escalones del reveal: las preguntas entran con retraso 0, 1, 2, 0, 1, 2…
 * Cada escalón corre la entrada un 2% del viewport; con el índice entero, la
 * duodécima pregunta tendría que subir un 22% más que la primera para
 * aparecer. Como ya están apiladas, el ciclo alcanza para que entren de a una.
 */
const REVEAL_STEPS = 3;

/*
 * `useSyncExternalStore` sin fuente externa (como en `ContactForm`): no se
 * suscribe a nada, solo distingue el HTML del servidor y la hidratación
 * (`false`) del cliente ya hidratado (`true`), sin un efecto que cambie
 * estado después de montar.
 */
const subscribeToNothing = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * Un tramo del sendero: la línea punteada y, adentro, el relleno verde que el
 * motor escala con el scroll (`timelineFill()`). Decorativo.
 */
function TrailPiece({ className }: { className: string | undefined }) {
  return (
    <span aria-hidden="true" className={cn(styles.trail, className)}>
      <span className={styles.trailFill} {...timelineFill()} />
    </span>
  );
}

/** Props de `FaqAccordion`. Todo es serializable: lo renderiza un Server Component. */
export type FaqAccordionProps = {
  /** Las preguntas y sus respuestas, en orden. */
  entries: readonly FaqEntry[];
  className?: string;
};

/**
 * El acordeón de "Preguntas frecuentes": abrir una pregunta cierra la que
 * estaba abierta, y tocar la abierta la cierra.
 *
 * Cada pregunta es una parada del **sendero**: una tarjeta atravesada por una
 * línea punteada, con un **mojón** (el punto sobre la línea) a la altura de
 * la pregunta. El sendero se pinta de verde a medida que se scrollea, cada
 * mojón se llena cuando el tramo pintado lo alcanza y, al abrir la pregunta,
 * crece hasta ser una banderita de cumbre.
 *
 * El sendero no es una sola línea sino dos tramos por pregunta (`TrailPiece`):
 * el que llega al mojón y el que sale de él. Así cada tarjeta se lleva su
 * pedazo de sendero cuando entra o sale con el reveal (una línea única,
 * quieta por detrás, dejaba los mojones sueltos mientras las tarjetas se
 * movían). Para el motor son rellenos independientes, pero como todos se
 * llenan hasta la misma línea del viewport, se ve como uno solo que avanza.
 *
 * Patrón Accordion de WAI-ARIA: cada pregunta es un `<h3>` con un `<button>`
 * (`aria-expanded`, `aria-controls`) y cada respuesta, una región con nombre
 * (`aria-labelledby` al botón). Una respuesta cerrada queda con
 * `visibility: hidden` cuando termina de plegarse: no se enfoca ni la lee el
 * lector de pantalla. Como hay una sola abierta a la vez, hay a lo sumo una
 * región en el árbol de landmarks.
 *
 * **Base sin JS: todo abierto.** El HTML del servidor (y el primer render de
 * la hidratación) trae cada pregunta como un `<h3>` de texto y su respuesta a
 * la vista, sin botones que no harían nada. Recién con la página hidratada
 * las preguntas pasan a ser botones y las respuestas se pliegan. Es la base
 * más robusta: sin JS, con el JS caído o mientras carga en una red lenta, las
 * respuestas se leen igual. El costo es que al hidratar la sección se acorta;
 * como está casi al final del home, en una carga normal pasa fuera de la
 * pantalla (y si se entró por `/#contacto`, el scroll anchoring del navegador
 * mantiene a la vista lo que se estaba mirando). La alternativa, plegarlas
 * desde el servidor y abrirlas con `@media (scripting: none)`, deja las
 * respuestas ocultas si el JS está habilitado pero no llega a correr.
 *
 * El plegado no se anima al hidratar: las transiciones se encienden con el
 * primer clic (`animated`).
 */
export function FaqAccordion({ entries, className }: FaqAccordionProps) {
  const baseId = useId();
  const enhanced = useSyncExternalStore(subscribeToNothing, onClient, onServer);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);

  const toggle = (index: number) => {
    setAnimated(true);
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <ul
      className={cn(
        styles.list,
        enhanced && styles.enhanced,
        animated && styles.animated,
        className,
      )}
    >
      {entries.map((entry, index) => {
        const buttonId = `${baseId}-pregunta-${index}`;
        const panelId = `${baseId}-respuesta-${index}`;
        const isOpen = !enhanced || openIndex === index;

        return (
          <li
            key={entry.question}
            className={cn(styles.item, isOpen && styles.itemOpen)}
            {...reveal('up', { delay: index % REVEAL_STEPS })}
          >
            <div className={styles.card}>
              <h3 className={styles.heading}>
                {enhanced ? (
                  <button
                    type="button"
                    id={buttonId}
                    className={styles.trigger}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(index)}
                  >
                    <span className={styles.question}>{entry.question}</span>
                    <span className={styles.iconFrame} aria-hidden="true">
                      <Plus
                        className={styles.icon}
                        size={PLUS_SIZE}
                        strokeWidth={ICON_STROKE_WIDTH}
                      />
                    </span>
                  </button>
                ) : (
                  <span className={styles.trigger}>
                    <span className={styles.question}>{entry.question}</span>
                  </span>
                )}
              </h3>
              <div
                id={panelId}
                className={styles.panel}
                {...(enhanced ? { role: 'region', 'aria-labelledby': buttonId } : {})}
              >
                <div className={styles.panelInner}>
                  <p className={styles.answer}>{entry.answer}</p>
                </div>
              </div>
            </div>
            {index > 0 ? <TrailPiece className={styles.trailIn} /> : null}
            <TrailPiece className={styles.trailOut} />
            <span className={styles.marker} aria-hidden="true">
              <span className={styles.dot}>
                <span className={styles.dotFill} />
              </span>
              {enhanced ? (
                <span className={styles.flag}>
                  <FlagTriangleRight
                    className={styles.flagIcon}
                    size={FLAG_SIZE}
                    strokeWidth={ICON_STROKE_WIDTH}
                  />
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
