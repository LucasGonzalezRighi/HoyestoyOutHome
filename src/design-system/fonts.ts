import { DM_Serif_Display, Lexend } from 'next/font/google';

import { cn } from '@/utils/cn';

/**
 * Fuentes de la marca, auto-hospedadas por `next/font` en el build.
 *
 * El design system las pedía a Google Fonts con un `@import` en runtime; acá
 * Next las descarga al compilar y las sirve desde el mismo dominio (sin request
 * a terceros, sin salto de layout: calcula un fallback con las mismas métricas).
 *
 * Cada una expone una variable CSS que `tokens.css` usa para armar
 * `--font-heading` y `--font-body`. Los componentes nunca nombran una fuente:
 * usan esos tokens.
 */

/**
 * Títulos. DM Serif Display tiene un solo peso (400); la itálica hace falta
 * porque el diseño la usa en "La montaña te espera.", "Bosques, volcanes y
 * lagos…" y el cierre "¿Te animás a subir?".
 */
const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-serif',
});

/**
 * Cuerpo. Los pesos son exactamente los que pedía el design system:
 * 300 y 400 para texto, 600 para links del nav y listas destacadas,
 * 700 para eyebrows y 800 para los títulos de los paneles de servicios.
 */
const lexend = Lexend({
  weight: ['300', '400', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
});

/**
 * Clases que declaran `--font-dm-serif` y `--font-lexend`. Van en el
 * `className` del `<html>` para que las variables existan en `:root`, que es
 * donde `tokens.css` las lee.
 */
export const fontVariables = cn(dmSerifDisplay.variable, lexend.variable);
