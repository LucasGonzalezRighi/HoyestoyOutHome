# Design system — Hoy Estoy Out Of Home

Única fuente de valores visuales del repo. **Cero hexcodes fuera de `tokens.css`**, cero nombres de fuente sueltos, cero curvas de easing copiadas a mano.

Es el design system **Organic** de Claude Design (`docs/design/design-system/`), retocado con los colores del folleto de la marca, más los valores que la landing (`docs/design/hoy-estoy-ooh-landing.dc.html`) repite inline y que acá tienen nombre.

## Archivos

| Archivo            | Qué tiene                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `tokens.css`       | `:root` con todas las custom properties. El único lugar con hexcodes.                                                 |
| `base.css`         | Reset + estilos de elementos (`body`, `h1`–`h6`, `a`, `img`, foco, selección), todo con especificidad 0.              |
| `fonts.ts`         | `next/font/google`: DM Serif Display y Lexend, auto-hospedadas. Exporta `fontVariables`.                              |
| `tokens/motion.ts` | Números del motor de animación (intensidades, telón, suavizados). Ver `src/motion/README.md`.                         |
| `print.css`        | Hoja de impresión (`@media print`): la variante para imprimir / PDF del diseño. Ver [Impresión](#impresión-printcss). |

`src/app/globals.css` importa `tokens.css`, `base.css` y `print.css` (en ese orden), y `app/layout.tsx` pone `fontVariables` en el `<html>`. No hay otro CSS global.

## Cómo se consume

En los CSS Modules, siempre con `var(--…)`:

```css
.card {
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-md);
  transition: transform 0.5s var(--ease-reveal);
}
```

Tamaños de texto y medidas puntuales del diseño (`clamp(40px, 5vw, 72px)`, `padding: 30px 26px`) van literales en el módulo que las usa, con un comentario de dónde salen. Lo que **no** va literal nunca: colores, fuentes, radios, sombras, curvas de easing y z-index.

Nada de `style={{…}}` salvo para pasar un valor dinámico como custom property o el `objectPosition` de una foto.

## Cómo se repinta

Se edita **`tokens.css`** y nada más: todo el sitio lee de ahí. Un solo valor está duplicado a propósito, porque Next pide un literal:

- `viewport.themeColor` en `src/app/layout.tsx` = `--color-bg`.

Las rampas 100–900 se generaron en OKLCH sobre una escala de luminosidad compartida. Si cambia un color base, hay que regenerar su rampa entera (no retocar un paso suelto), o el mismo paso deja de pesar lo mismo en las tres rampas.

La única excepción es `--color-accent-600`: `#886130` en vez del `#8c6433` de la rampa, un pelo más oscuro para que el texto crema de los botones primarios llegue a AA (4,67:1 en vez de 4,46:1; ver CLAUDE.md §9). Si se regenera la rampa del acento, hay que volver a oscurecer ese paso hasta pasar 4,5:1 con `--color-bg`.

## Tokens

### Color

| Token                      | Valor        | Uso                                                                     |
| -------------------------- | ------------ | ----------------------------------------------------------------------- |
| `--color-bg`               | `#f3ebdf`    | Fondo de la página (crema del folleto)                                  |
| `--color-surface`          | `#e9dccb`    | Cards y paneles                                                         |
| `--color-text`             | `#3b3025`    | Texto (marrón)                                                          |
| `--color-accent`           | `#a0733e`    | Dorado de montaña. 3:1 con el fondo: íconos, texto grande, bordes, foco |
| `--color-accent-2`         | `#4f5b2a`    | Verde musgo del logo: eyebrows, relleno de los botones                  |
| `--color-divider`          | texto al 16% | Bordes del botón secundario, separadores                                |
| `--color-neutral-100…900`  | rampa        | Textos secundarios (700), bordes de riel (300)                          |
| `--color-accent-100…900`   | rampa        | Links (700, hover 600), números (500), CTA (600)                        |
| `--color-accent-2-100…900` | rampa        | Bandas oscuras (800/900) y su texto (100/200)                           |

Cómo elegir un paso de rampa (regla del design system):

| Pasos   | Para qué                                           |
| ------- | -------------------------------------------------- |
| 100–300 | Rellenos tintados, hovers, bordes sutiles          |
| 500     | La base del rol                                    |
| 700–900 | Texto sobre rellenos tintados, estados presionados |

Para texto de párrafo en dorado se usa `--color-accent-700`, no el acento: el acento contra el crema no llega al contraste de texto chico.

### Tipografía

| Token                   | Valor                                                                       |
| ----------------------- | --------------------------------------------------------------------------- |
| `--font-heading`        | `var(--font-dm-serif), Georgia, serif` — DM Serif Display, normal e itálica |
| `--font-heading-weight` | `400` (la fuente tiene un solo peso)                                        |
| `--font-body`           | `var(--font-lexend), system-ui, sans-serif` — Lexend 300/400/600/700/800    |

Escala de títulos de `base.css`: h1 42 · h2 32 · h3 25 · h4 20 · h5 16 · h6 13 (mayúsculas). Cuerpo: 15px / 1.55. Las secciones de la landing pisan el tamaño de sus títulos con valores fluidos del diseño.

### Espaciado, radios y sombras

| Token                                                             | Valor                                    | Uso                                                                  |
| ----------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| `--space-1` … `--space-8`                                         | 4.4 · 8.8 · 13.2 · 17.6 · 26.4 · 35.2 px | Escala de 4px con densidad 1.10×                                     |
| `--radius-sm` / `-md` / `-lg`                                     | 8 · 16 · 28 px                           | Escala del DS; `lg` para contenedores (pilares, stats, testimonios)  |
| `--radius-card-sm`                                                | 26px                                     | Fotos de la galería                                                  |
| `--radius-panel`                                                  | 30px                                     | Paneles de servicios                                                 |
| `--radius-xl`                                                     | 32px                                     | Cards de viaje, foto de Calle & Stepanek, "¿Puedo?"                  |
| `--radius-2xl`                                                    | 36px                                     | Cards apilables del itinerario                                       |
| `--radius-3xl`                                                    | 40px                                     | Banda "La montaña te espera."                                        |
| `--radius-4xl`                                                    | 44px                                     | Tarjeta de precio del cierre                                         |
| `--radius-pill`                                                   | 999px                                    | Botones, tags, pestañas                                              |
| `--shadow-sm` / `-md` / `-lg`                                     | sombras teñidas                          | Elevación; nunca un `box-shadow` inventado                           |
| `--shadow-focus-gap`                                              | aro crema de 2px                         | Llena el hueco del `outline-offset` del foco de botones (contraste)  |
| `--shadow-curtain-leaf-left` / `-right` · `--shadow-curtain-logo` | negro 45% / 50%                          | Telón de entrada (sobre verde musgo oscuro, donde la tinta no se ve) |
| `--shadow-cursor`                                                 | negro 25%                                | Cursor montaña, dentro de `drop-shadow()`                            |
| `--shadow-text-hero-headline` / `-lead`                           | negro 25% / 30%                          | `text-shadow` del titular y la bajada del hero, sobre la foto        |

### Movimiento, capas, layout y fotos

| Token                                                                   | Valor                                                     | De dónde sale                               |
| ----------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| `--ease-reveal`                                                         | `cubic-bezier(.22,.61,.36,1)`                             | Apariciones del motor, inclinación de cards |
| `--ease-in-out`                                                         | `cubic-bezier(.65,0,.35,1)`                               | Cambio de fondo de la página, `clip-path`   |
| `--ease-curtain`                                                        | `cubic-bezier(.77,0,.18,1)`                               | Telón de entrada                            |
| `--ease-swap`                                                           | `cubic-bezier(.76,0,.24,1)`                               | "Label swap" del nav                        |
| `--ease-spring`                                                         | `cubic-bezier(.34,1.56,.64,1)`                            | Imán, platos, fotos del equipo              |
| `--ease-zoom`                                                           | `cubic-bezier(.2,.7,.2,1)`                                | Zoom de fotos (cards, galería)              |
| `--ease-fill`                                                           | `cubic-bezier(.16,1,.3,1)`                                | Relleno de los botones (2,5 s)              |
| `--z-nav` · `--z-float` · `--z-progress` · `--z-cursor` · `--z-curtain` | 60 · 70 · 90 · 111 · 120                                  | Capas del diseño                            |
| `--layout-max` / `--layout-narrow`                                      | 1240px / 1100px                                           | Ancho del contenido / del cierre            |
| `--layout-gutter`                                                       | `clamp(20px, 5vw, 72px)`                                  | Margen lateral                              |
| `--section-space` / `-compact`                                          | `clamp(80px, 11vw, 140px)` / `clamp(70px, 9vw, 120px)`    | Aire arriba de cada sección                 |
| `--nav-height`                                                          | 66px                                                      | Alto del nav sticky (el hero lo descuenta)  |
| `--filter-washed`                                                       | `saturate(.6) contrast(.85) brightness(1.1) opacity(.94)` | `.washed` del DS                            |
| `--filter-vivid`                                                        | `saturate(.92) contrast(1.02)`                            | Foto del hero                               |

Las duraciones no son tokens: van junto a la transición que las usa, con un comentario de dónde salen.

## Reglas

1. **Cero hexcodes fuera de `tokens.css`.** La única excepción es `themeColor` (ver arriba).
2. **`base.css` va todo dentro de `:where(…)`**, que pesa 0: cualquier clase de un CSS Module lo pisa sin pelear. Excepciones: los pseudo-elementos (no entran en `:where`) y la regla del cursor custom (`html[data-cursor-active]`), que va con especificidad normal a propósito.
3. **Un solo breakpoint: `@media (max-width: 820px)`**, el del diseño (nav sin links, grillas a una columna, sticky desactivado).
4. **CSS Modules puros**: cada selector lleva al menos una clase local. Nada de estilos globales fuera de esta carpeta.
5. **Los componentes compartidos ponen su base; los features la ajustan con `className`.** Las dos clases pesan lo mismo, así que gana la que carga después: el módulo del feature, porque el feature importa el componente antes que su propio `.module.css`. Mantener ese orden de imports.
6. **Íconos: Lucide con trazo 2.75** (ver `components/atoms/ChatIcon`).
7. **Fotos: siempre por `WashedImage`**, que aplica el lavado y recorta con `overflow: hidden`. El radio, el alto o el `aspect-ratio` del marco los pone quien la usa, por `className`.
8. **Impresión: lo general en `print.css`, lo propio de un componente en su módulo.** `print.css` solo nombra atributos (`data-*` del motor, ARIA) y estructura; nunca clases de módulo, que vienen con hash. Si un componente necesita un ajuste de impresión sobre sus clases, va en un `@media print` de su propio módulo (como el hero).

## Impresión (`print.css`)

Reproduce `docs/design/hoy-estoy-ooh-landing-print.dc.html`, la variante para imprimir y exportar a PDF: la misma landing con el motor apagado (`k() { return 0 }`), sin las piezas fijas y con lo que depende del scroll desarmado en flujo normal. Para probarla: imprimir la página (o "Guardar como PDF") desde cualquier punto del scroll; el resultado tiene que ser el mismo.

El ancho útil de la hoja (720px en carta, 698px en A4, con 0,5in de margen) queda debajo de 820px, así que en papel rige el layout mobile del breakpoint único, igual que en el print del diseño.

| Qué                | Cómo                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hoja               | `@page { margin: 0.5in }`, papel blanco (sin el fondo crema ni el verde que el motor le escribe al cierre), fondos y colores exactos (`print-color-adjust: exact`).                                                                                    |
| Piezas fijas       | Telón, cursor, barra de progreso, nav, WhatsApp flotante y "Saltar al contenido" no se imprimen.                                                                                                                                                       |
| Movimiento         | Sin animaciones (cada una salta a su último cuadro) ni transiciones. Todo lo que el motor anima queda en su pose final: apariciones visibles y en su lugar, parallax centrado, cintas quietas, cards derechas, relleno de la línea de tiempo completo. |
| 03 Próximos viajes | Sin scroll horizontal: la sección toma su alto natural, la escena deja de ser fija, el riel parte en renglones y la barra de avance no va. Foto de cada card a 240px (en vez de `46vh`).                                                               |
| 06 Banda           | 520px de alto (en vez de `92vh`).                                                                                                                                                                                                                      |
| 07 Lolog           | Cards del itinerario en flujo normal (`position: static`), sin achicarse ni oscurecerse; la foto con tope de 520px para que cada día entre en una hoja.                                                                                                |
| 09 Servicios       | Se imprime la pestaña activa (la elegida al imprimir; al cargar, la primera): hay un solo `tabpanel` en el DOM. La tira de pestañas queda, como en el diseño.                                                                                          |
| 11 Testimonios     | Cada testimonio una vez (la copia de la cinta se oculta), en grilla `repeat(auto-fit, minmax(260px, 1fr))` alineada con el título.                                                                                                                     |
| 12 Galería         | Cada foto una vez; las dos cintas parten en renglones.                                                                                                                                                                                                 |
| Cortes             | `break-inside: avoid` en secciones, cards, figuras, ítems de lista y cards apilables; títulos pegados a lo que sigue; `orphans`/`widows` en 3.                                                                                                         |
| Hero               | En su módulo: alto fijo de 560px (en vez de `100svh`), sin el texto calado "Out Of Home" ni la cinta verde (el print del diseño no los tiene).                                                                                                         |

Por qué casi todo va con `!important`: el motor deja estilos **inline** (`transform`, `opacity`, `clip-path`, el alto de la sección horizontal, el color del fondo) congelados en la pose del último frame, y un estilo inline solo se pisa con `!important`. Lo que no es inline vive en CSS Modules, y una clase de módulo pesa lo mismo que un selector de atributo: sin `!important` ganaría la que cargue después, y ese orden no es confiable. `app/layout.tsx` importa los componentes antes que `./globals.css`, y tanto en dev como en el build de producción la hoja de los módulos va **antes** que la global.

Por eso los módulos no le ganan a `base.css` por orden de carga sino por especificidad: `base.css` va entero dentro de `:where()` (pesa 0). **Ojo:** una regla global nueva sin `:where()` que pese lo mismo que una clase le ganaría a los módulos en producción, porque la global carga después.

Los **contadores** (`data-count`: stats de Lolog y precio del cierre) no los puede tocar esta hoja: su texto lo escribe el motor. Para que no se impriman en 0 cuando no se scrolleó hasta ellos, el motor corre un frame con el movimiento apagado en `beforeprint` (`handleBeforePrint` de `src/motion/core/MotionEngine.ts`), que escribe la pose final de todo, valor de los contadores incluido.

## Relación con Organic (Claude Design)

El design system original está en `docs/design/design-system/` (`styles.css` + `readme.md`). El `readme.md` describe la plantilla Organic genérica (terracota, Caprasimo, Figtree); **los valores que valen son los de `styles.css`**, que ya trae el retoque de la marca (crema, dorado, verde musgo, DM Serif Display, Lexend). Qué se portó y cómo:

| En Organic                                                               | Acá                                                                   |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `:root` de `styles.css`                                                  | `tokens.css`, tal cual (salvo las fuentes, que vienen de `next/font`) |
| Estilos de elementos                                                     | `base.css`, con `:where()`                                            |
| `.btn`, `.btn-primary/-secondary/-ghost` + "efecto de botón" de la marca | `components/atoms/Button`                                             |
| `.tag`, `.tag-*`                                                         | `components/atoms/Tag`                                                |
| `.washed`                                                                | `components/atoms/WashedImage`                                        |
| `.nav`, `.nav-brand`                                                     | `components/organisms/Navbar`                                         |
| `.card`, `.elev-*`                                                       | `components/molecules/SurfaceCard` y `--shadow-*`                     |
| Formularios, tabla, diálogo, `.hr`                                       | No se portaron: la landing no los usa                                 |

### Qué sí (Do)

- Sobre-redondear: `--radius-lg` o más para contenedores, pastilla (`--radius-pill`) para botones y tags.
- Formas blandas —círculos, manchas— como decoración y como máscara de imágenes.
- Usar la rampa verde musgo (`--color-accent-2-*`) como segunda voz de verdad, no solo como resaltado.
- Lavar las fotos (`WashedImage`) y redondearles los bordes.
- Estados temáticos: hover y presionado desde la rampa del acento, foco `2px solid var(--color-accent)` con `:focus-visible`, deshabilitado al 45%. Los botones le suman al foco el aro crema de `--shadow-focus-gap` para contrastar sobre fondos oscuros, y sobre foto el anillo va del color del texto (CLAUDE.md §9).

### Qué no (Don't)

- Esquinas filosas o geometría de solo líneas finas.
- Desaturar la paleta hacia grises: la calidez es el punto.
- Tipografías display condensadas o geométricas: DM Serif Display es la única voz de títulos.
- Amontonar elementos: las formas redondeadas necesitan aire para leerse blandas.
- `.hr` o divisores de más: el sistema prefiere espacio en blanco.
