# CLAUDE.md — Hoy Estoy Out Of Home (frontend)

Guía para Claude Code (claude.ai/code) y para cualquier persona que trabaje en este repositorio. Sigue la misma organización que **Kora 2.0** (`Desktop/Kora/KORA-frontend`), adaptada a lo que pide este proyecto: **CSS3 puro (CSS Modules) en vez de Tailwind** y **orientación a objetos** en el dominio y en el motor de animación.

---

## 1. Qué es esto

Landing de **Hoy Estoy Out Of Home**, una empresa de turismo aventura que arma trekkings y ascensos guiados por Mendoza y la Patagonia. Es una **landing única** (una sola página con anclas); el funnel es **WhatsApp** — no hay formulario, pagos ni backend.

---

## 2. Fuente de diseño

El diseño —copys, paleta, tipografía y **todas las animaciones**— está en **Claude Design**:

- Proyecto: `https://claude.ai/design/p/0826a533-b0ae-4f6c-85f4-ce2a986c86af`
- Archivo: **`Hoy Estoy OOH Landing.dc.html`** (13 secciones, `data-screen-label` 01–13).
- Design system: **Organic** (`_ds/organic-…/styles.css` + `readme.md`), retocado con los colores del folleto de la marca.

Una copia exportada vive en **`docs/design/`** (no se compila):

| Archivo | Qué es |
|---|---|
| `docs/design/hoy-estoy-ooh-landing.dc.html` | La landing: marcado + motor de animación original (`<script type="text/x-dc">`) |
| `docs/design/hoy-estoy-ooh-landing-print.dc.html` | Variante para imprimir / exportar a PDF |
| `docs/design/design-system/styles.css` | Tokens y clases del design system Organic |
| `docs/design/design-system/readme.md` | Guía del design system (qué se hace y qué no) |

**Regla:** el diseño es la fuente de **copys, paleta, medidas y comportamiento**. La estructura del código la define este documento, no el árbol del HTML exportado. Si algo del código no coincide con el diseño, gana el diseño — salvo las mejoras documentadas en §9.

---

## 3. Stack

| Capa | Tecnología |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Lenguaje | **TypeScript** estricto (`strict` + `noUncheckedIndexedAccess` + `noImplicitOverride`) |
| Estilos | **CSS3** — CSS Modules por componente + custom properties del design system. **Sin Tailwind, sin CSS-in-JS** |
| Animaciones | **Motor propio orientado a objetos** (`src/motion/`), port fiel del motor del diseño. **Sin GSAP ni Framer Motion** |
| Imágenes | `next/image` (AVIF/WebP, `sizes` por uso) |
| Fuentes | `next/font/google` — **DM Serif Display** (títulos) y **Lexend** (cuerpo), auto-hospedadas en el build |
| Iconos | **lucide-react**, trazo 2.75 (regla del design system) |
| Tests | **Vitest** — dominio, matemática del motor y funciones puras de los features (`toServiceTabs`) |
| Calidad | ESLint 9 (flat config, `eslint-config-next`) + Prettier |

Decisiones explícitas: App Router (no Pages), CSS Modules (no Tailwind), motor propio (no GSAP), sin estado global (no hace falta ningún Context), sin HTTP (no hay backend: todo el contenido es estático y se prerenderiza).

> **Next 16 no es el Next que uno recuerda.** Cambió APIs y convenciones respecto de 15 (por ejemplo: `next lint` ya no existe, `next/image` usa `preload` en vez de `priority`, el dev escribe en `.next/dev`). Antes de usar una API de Next, leer la guía de la versión instalada en **`node_modules/next/dist/docs/`**. `next.config.ts` tiene `agentRules: false` para que `next dev` no le agregue a este archivo su propio bloque con este mismo aviso.

---

## 4. Arquitectura

### 4.1 Capas

```
app/            → rutas de Next (layout, page, metadata, robots, sitemap)
  ↓ compone
features/       → una carpeta por sección de la landing (+ site-chrome)
  ↓ usa
components/     → UI reutilizable, presentacional (atoms / molecules / organisms)
content/        → todo el texto visible + las instancias del dominio (catálogo de viajes, fotos…)
  ↓ instancia
domain/         → clases del negocio (Trip, Price, WhatsAppLink…) — TypeScript puro, sin React
motion/         → motor de animación (clases) + contrato de atributos data-*
design-system/  → tokens CSS, estilos base, fuentes, tokens de movimiento
constants/      → configuración de marca, IDs de secciones, rutas de assets
utils/          → helpers (cn)
```

Las flechas son la única dirección permitida: `domain/` no importa nada del resto; `components/` no importa `features/` ni `content/`; `motion/core` y `motion/effects` no importan React.

### 4.2 Estructura

```
src/
├── app/
│   ├── layout.tsx            # <html>, fuentes, metadata, fondo que cambia, nav, site-chrome, runtime del motor
│   ├── page.tsx              # <Landing />
│   ├── globals.css           # importa el design system (tokens + base)
│   ├── icon.png              # favicon (el logo)
│   └── robots.ts · sitemap.ts
├── components/               # UI reutilizable (Atomic Design) — presentacional, CSS Modules
│   ├── atoms/                # Button, Tag, Container, Section, Eyebrow, WashedImage, BrandLogo, Dot, ChatIcon, StarRating
│   ├── molecules/            # SectionHeading, BulletList, SurfaceCard
│   └── organisms/            # Navbar/, Marquee
├── constants/                # site.ts (marca, SITE_URL, WhatsApp, redes), sections.ts (IDs/anclas), assets.ts
├── content/                  # TODO el texto visible + instancias del dominio
│   ├── index.ts              # landingContent: un slice por sección
│   ├── types.ts              # tipos compartidos (CallToAction, …)
│   ├── media.ts              # PHOTOS: cada foto una sola vez (ruta, alt, encuadre)
│   ├── whatsapp.ts           # la instancia de WhatsAppLink
│   ├── catalog/trips.ts      # tripCatalog (los 4 viajes)
│   └── sections/*.ts         # un slice por sección (hero.ts, trips.ts, lolog.ts, …)
├── design-system/            # tokens.css, base.css, fonts.ts, tokens/motion.ts, README.md
├── domain/                   # clases del negocio + tests (*.test.ts al lado de cada clase)
├── features/                 # una carpeta por sección, en el orden del diseño
│   ├── landing/              # Landing.tsx: la composición
│   ├── site-chrome/          # telón, cursor, barra de progreso, WhatsApp flotante
│   ├── hero/ · why-us/ · trips/ · calle-stepanek/ · mountain-banner/ · lolog/
│   └── meals/ · services/ · team/ · testimonials/ · gallery/ · contact/
├── motion/                   # motor de animación (ver §6)
└── utils/                    # cn()
```

**Regla de import:** desde afuera de una carpeta de componente o feature se importa **solo su `index.ts`**. Nada de `@/features/trips/components/TripCard/TripCard`.

### 4.3 Anatomía de un componente

```
components/atoms/Button/
├── Button.tsx            # el componente (función, props tipadas, JSDoc)
├── LinkButton.tsx        # variante como <a>, si hace falta
├── Button.types.ts       # props y uniones de variantes, cuando se comparten
├── Button.module.css     # estilos — solo tokens del design system
└── index.ts              # API pública
```

Un feature repite el patrón: `Hero.tsx` + `Hero.module.css` + `index.ts`, y sus piezas internas en `features/hero/components/`.

### 4.4 Presentacionales vs. lógica

- Los componentes de `components/` **reciben props y renderizan**. No leen `content/`, no conocen el dominio (reciben strings y datos planos, o tipos estructurales compatibles).
- Los features **leen su slice de `content/` por props** (`<Trips content={landingContent.trips} />`), eligen los componentes y marcan qué se anima.
- La lógica de negocio (formatear un precio, armar el link de WhatsApp, decidir si un viaje tiene página propia) vive en **clases de `domain/`**.
- La lógica de animación vive en **clases de `motion/`**. Los componentes solo esparcen atributos: `<h2 {...reveal('up', { delay: 1 })}>`.

**Server Components por defecto.** Como las animaciones se enganchan por atributos, casi toda la landing se renderiza en el servidor. Llevan `'use client'` solo: `MotionRuntime`, las piezas de `site-chrome` que lo necesiten y las pestañas de `services/` (tienen estado).

### 4.5 Orientación a objetos — dónde y por qué

Los componentes de React son funciones (es el idioma de React; los componentes de clase están deprecados de hecho). La orientación a objetos está donde aporta:

| Dónde | Qué modela | Principios |
|---|---|---|
| `domain/` | Entidades y value objects: `Trip`, `TripDuration`, `Price`, `WhatsAppLink`, `Photo`, `ScheduleDay`, `ItineraryStage`, `Metric`, `ServiceChecklist`, `Guide`, `Testimonial`, `TripCatalog` | Encapsulamiento (campos `readonly`/privados), invariantes validadas en el constructor, comportamiento junto a los datos (`price.format()`, `whatsapp.href()`), inmutabilidad |
| `motion/` | `MotionEngine` + una clase por efecto (`RevealEffect`, `ParallaxEffect`, `MarqueeEffect`, …) sobre clases base abstractas | Herencia y polimorfismo (el motor recorre `MotionEffect[]` sin saber cuál es cuál), responsabilidad única (un efecto = un atributo), abierto/cerrado (un efecto nuevo es una clase nueva registrada en la fábrica, sin tocar el loop), inyección de dependencias (el motor recibe sus efectos) |

Regla: **clase cuando hay comportamiento o invariantes; tipo plano cuando es solo dato** (un pilar con número, título y bajada es un tipo, no una clase).

### 4.6 Sin strings mágicos

- IDs de sección y anclas → `constants/sections.ts` (`anchorTo('trips')`).
- Marca, teléfono, redes → `constants/site.ts`.
- Rutas de imágenes → `constants/assets.ts` + `content/media.ts`.
- Atributos de animación → helpers de `motion/attributes.ts`.
- **Todo texto visible → `content/`.** Ningún texto de UI inline en JSX (tampoco `aria-label` ni `alt`).

### 4.7 Contenido

`content/` es la única fuente de lo que se lee en pantalla. Cada sección tiene su slice (`content/sections/trips.ts`) con su tipo exportado (`TripsContent`), y `content/index.ts` los junta en `landingContent`. `Landing.tsx` le pasa **a cada sección solo su slice**, como Kora hace con los diccionarios: una sección no puede leer texto que no le corresponde.

Los datos con comportamiento son **instancias del dominio** (`tripCatalog`, `PHOTOS`, `whatsapp`). Si mañana los viajes vienen de un CMS o una API, se reemplaza el módulo de `content/` por un servicio que devuelva **las mismas clases**, y ningún componente se entera.

Un solo idioma: **español rioplatense** (`es-AR`). Si se suma otro, se sigue el patrón de Kora (`app/[locale]/`, diccionarios tipados contra el español) convirtiendo `landingContent` en `getLandingContent(locale)`.

---

## 5. Design system (CSS3)

Vive en `src/design-system/` y es la **única** fuente de valores visuales. **Cero hexcodes en componentes.**

| Archivo | Qué tiene |
|---|---|
| `tokens.css` | `:root` con todas las custom properties: colores + rampas 100–900 (`--color-accent-*`, `--color-accent-2-*`, `--color-neutral-*`), fuentes, espaciados, radios, sombras, curvas de easing, capas (`--z-*`), layout (`--layout-max`, `--layout-gutter`, `--section-space`) |
| `base.css` | Reset y estilos de elementos (`body`, `h1`–`h6`, `a`, `:focus-visible`, `::selection`) — todo dentro de `:where()` para que tenga especificidad 0 y cualquier módulo lo pise |
| `fonts.ts` | `next/font/google`: expone `--font-dm-serif` y `--font-lexend`, que `tokens.css` usa en `--font-heading`/`--font-body` |
| `tokens/motion.ts` | Tokens del motor: niveles de intensidad, tiempos del telón, suavizados, radios del imán… |
| `README.md` | Cómo consumir y cómo repintar |

Convenciones de CSS:

- **CSS Modules** (`*.module.css`), clases en camelCase (`.tripCard`, `.tripCardMedia`). Nada de estilos globales fuera de `design-system/`.
- Colores, fuentes, radios, sombras, easings y z-index **solo con `var(--…)`**. Tamaños de texto y medidas puntuales del diseño (p. ej. `clamp(40px, 5vw, 72px)`) pueden ir literales en el módulo que los usa.
- **Nada de `style={{…}}`** salvo para pasar un valor dinámico como custom property (`style={{ '--stack-offset': '14px' }}`) o el `objectPosition` de una foto que viene del contenido.
- Un solo breakpoint, el del diseño: **`@media (max-width: 820px)`** (nav sin links, grillas partidas a una columna, sticky desactivado).
- `.washed` del design system → atom `WashedImage` (desatura y aclara las fotos para que se asienten sobre el crema).
- Estados interactivos del design system: hover y pressed desde la rampa de acento, foco `2px solid var(--color-accent)` con `:focus-visible`, deshabilitado al 45%.
- El botón tiene el efecto de la marca: **relleno verde musgo que avanza de izquierda a derecha en 2,5 s** (`::before` con `scaleX`), sin desplazamiento.

---

## 6. Animaciones — el motor (`src/motion/`)

Port fiel, a TypeScript orientado a objetos, del motor del diseño (`docs/design/hoy-estoy-ooh-landing.dc.html`, script al pie). **Un solo loop de `requestAnimationFrame`** para toda la página; los elementos se enganchan por atributos `data-*`.

### 6.1 Piezas

| Pieza | Responsabilidad |
|---|---|
| `attributes.ts` | Contrato marcado ↔ motor: nombres de atributos (`MOTION_ATTRIBUTES`) y helpers tipados (`reveal()`, `parallax()`, `marquee()`, `counter()`, `tilt()`, …) |
| `core/MotionEngine` | El loop: estado del frame, fases de lectura/escritura, re-escaneo del DOM cuando cambia, alta/baja de listeners |
| `core/MotionEffect` | Clases base abstractas: `FrameEffect` (corre cada frame), `ScrollEffect` (mide y escribe solo si cambió el scroll), `PointerEffect` (reacciona al puntero) |
| `core/StyleWriter` | Escribe un estilo solo si cambió (evita recalcular estilos en cada frame) |
| `core/ScrollTracker` · `PointerTracker` · `IntroClock` | Scroll + velocidad suavizada · posición del mouse · progreso 0→1 de la intro |
| `effects/*` | Un efecto por atributo: reveal, parallax, drift, marquee, horizontal scroll, stack, timeline, counter, skew, tilt, magnet, background shift, scroll progress, cursor |
| `intro/CurtainController` | La coreografía del telón de entrada; al abrirse arranca la intro |
| `math/*` | Funciones puras (clamp, easing, transformaciones de cada reveal) — con tests |
| `react/MotionRuntime` | Componente cliente que crea el motor al montar y lo destruye al desmontar. No renderiza nada |

### 6.2 Reglas

- **Nada de animación inline en el JSX** ni `useEffect` sueltos que animen: todo pasa por atributos + motor.
- **Lectura, después escritura.** En cada frame el motor primero mide todo (`getBoundingClientRect`) y después escribe todo. Mezclarlos fuerza layouts síncronos.
- **Transformaciones y opacidad** solamente (más `clip-path`/`filter` donde el diseño lo pide). Nunca `top`/`left`/`width` animados.
- **Los números viven en `design-system/tokens/motion.ts`** (intensidades, tiempos del telón, suavizados, radio del imán). Las transformaciones de cada reveal están en `math/revealTransforms.ts`, que es la tabla de coreografías.
- **Intensidad** (la perilla "Animaciones" del diseño): `suave` 0.6 · `equilibrado` 1 · `exagerado` 1.8 (por defecto) · `apagado` 0. Se elige con `NEXT_PUBLIC_MOTION_LEVEL`.
- **`prefers-reduced-motion: reduce` apaga el movimiento** (como `apagado`): los reveals quedan en su lugar, los contadores muestran el valor final, las cintas se frenan. Se decide en un solo lugar (`RESPECT_OS_REDUCED_MOTION` en `tokens/motion.ts`).
- El estado por elemento va en `WeakMap`, no en propiedades pegadas al nodo (`el._x` del diseño).
- El motor re-escanea el DOM ante cambios (`MutationObserver`) y ante `resize` — por eso las pestañas de Servicios no necesitan avisarle nada.
- **Sin JS la página se lee entera**: el telón tiene `<noscript>` y un failsafe por CSS, el cursor del sistema solo se oculta cuando el cursor custom está activo, y los contadores se renderizan con su valor final.

---

## 7. Estado de implementación

Las 13 secciones están implementadas, revisadas contra el diseño (copys, medidas y `data-*`) y compuestas en `Landing.tsx`; el build las prerenderiza en orden. **Falta la verificación visual en el navegador**: nada de esto se miró todavía en pantalla. La columna "Pendiente" lista lo que quedó para decidir o mirar.

| Sección (diseño) | Feature | Estado | Pendiente |
|---|---|---|---|
| Telón, cursor, barra de progreso, WhatsApp flotante | `site-chrome` | ✅ | |
| Nav | `components/organisms/Navbar` | ✅ | |
| 01 Hero + cinta | `hero` | ✅ | |
| 02 Por qué viajar con nosotros | `why-us` | ✅ | |
| 03 Próximos viajes (scroll horizontal) | `trips` | ✅ | Con JS pero con el motor caído, el riel queda recortado (el fallback cubre solo "sin JS"). Enfocar con teclado una card fuera de pantalla no la trae a la vista (el motor tendría que escuchar `focusin`) |
| 04 Calle & Stepanek (+ cronograma) | `calle-stepanek` | ✅ | |
| 05 ¿Puedo? / ¿Es para mí? | `calle-stepanek` | ✅ | |
| 06 Banda "La montaña te espera." | `mountain-banner` | ✅ | |
| 07 Lago Lolog (stats + itinerario apilado) | `lolog` | ✅ | En mobile las cards del itinerario siguen sticky, como en el diseño: en pantallas bajas no se llega a ver el pie de la foto. Decidir si pasan a `position: relative` en ≤820 px |
| 08 Pensión completa | `meals` | ✅ | |
| 09 Servicios y equipo (pestañas) | `services` | ✅ | |
| 10 ¿Quiénes somos? | `team` | ✅ | |
| 11 Testimonios | `testimonials` | ✅ | El pie (texto al 55% del design system) da ~3:1 de contraste, debajo de WCAG AA para 14 px. Es el color del diseño |
| 12 Galería | `gallery` | ✅ | |
| 13 Precio y contacto + footer | `contact` | ✅ | |

---

## 8. Convenciones

### 8.1 Commits — Conventional Commits en español (igual que Kora)

Tipos: `agregar`, `corregir`, `refactorizar`, `estilo`, `documentar`, `probar`, `tarea`, `eliminar`.

```
<tipo>(<alcance>): <descripción en imperativo, minúsculas>
```

Ejemplo: `agregar(lolog): itinerario con cards apilables`

### 8.2 TypeScript

`strict: true` + `noUncheckedIndexedAccess`. Nada de `any` (ESLint lo marca como error) salvo en límites del sistema con un comentario `// why:`. Tipos de dominio con sustantivo (`Trip`, `ItineraryStage`); props con sufijo (`TripCardProps`); contenido de sección con sufijo `Content` (`TripsContent`). Todo lo que se exporta lleva **JSDoc en español**.

### 8.3 Documentación

- Cada archivo exportado explica **qué es y por qué existe**; los comentarios cuentan el *porqué* (una decisión, una trampa), no el *qué* que ya dice el código.
- Cada número copiado del diseño que no es obvio lleva de dónde sale.
- `README.md` en `design-system/`, `motion/` y `domain/`.

### 8.4 Clean code

Una función, una cosa. Nombres autoexplicativos (en inglés en el código, en español en el contenido y los comentarios, como Kora). Sin código muerto ni `console.log` sueltos.

---

## 9. Diferencias deliberadas con el diseño

- El HTML exportado tiene **tres `<main>`**; acá hay uno solo y las secciones se contienen con `Container`.
- El diseño oculta el cursor del sistema con CSS siempre que haya `pointer: fine`; acá solo se oculta cuando el cursor custom efectivamente está andando (si falla el JS, no te quedás sin cursor).
- Las copias duplicadas de las cintas (marquees) van con `aria-hidden` para que los lectores de pantalla no lean todo dos veces.
- El motor del diseño trae un carrusel de testimonios por intervalo (`tRef`, `goT`, `tDots`) que el marcado no usa: los testimonios son una cinta. No se portó.
- El anillo del cursor (`data-cursor`) está oculto de forma permanente en el diseño; se portó solo el cursor montaña.
- **Mobile legible.** El diseño fija varios textos en una línea (`white-space: nowrap`) con tamaños en `vw` (`min(72px, 5.3vw)` en el `h1`, `min(19px, 2.4vw)` en la bajada del hero, `min(48px, 3.3vw)` en títulos). En escritorio se ven como en el diseño; a 375 px darían un `h1` de 20 px y una bajada de 9 px. Regla: **en `@media (max-width: 820px)` esos textos pasan a `white-space: normal` con un piso legible** — `h1` ≥ 34 px, `h2` ≥ 30 px, bajadas y párrafos ≥ 16 px. Por encima de 820 px, el diseño manda tal cual. Los pisos se eligen para empalmar con el valor de escritorio en 820 px (`max(30px, 4.4vw)`, `max(34px, 5.3vw)`), así el cambio de breakpoint no se nota. Dos casos más: el CTA del cierre también parte en renglones (a 375 px el botón `nowrap` no entra en la tarjeta y el `overflow: hidden` lo cortaría), y los números de las stats de Lolog **siguen** en una línea (ya tienen piso de 30 px, y partidos dejarían la "m" sola). Algunas grillas usan `minmax(0, 1fr)` o `minmax(min(300px, 100%), 1fr)` en vez de `1fr`/`300px` para no desbordar debajo de 340 px; por encima son idénticas al diseño.
- El WhatsApp flotante va al final del DOM (orden de tabulación), no con el resto de las piezas fijas.
- **El footer es hermano del `<main>`**, no parte de la sección 13 como en el diseño: así es el `contentinfo` de la página. El padding de abajo de la sección y su `margin-top` pasan a ser el padding del footer. Lleva su propio fondo verde oscuro (el mismo al que cambia la página) y su propio `backgroundShift`: con JS no se nota la diferencia y sin JS el texto claro sigue siendo legible.
- **Las cintas no saltan en cada vuelta.** El motor reinicia una cinta al recorrer medio `scrollWidth`; con `gap` entre ítems la mitad cae medio gap antes del comienzo de la copia, y en el diseño las cintas saltan 19 px (hero), 10 px (testimonios) y 7 px (galería) en cada vuelta. Cada riel suma `padding-inline-end` igual a su gap (en el hero, cada ítem lleva el espacio como padding). Es invisible: el padding queda siempre fuera de la pantalla. La regla está documentada en el organism `Marquee`.
- **Semántica.** Donde el diseño apila `div`s, acá hay listas (`ol` en los pilares, el cronograma y el itinerario de Lolog; `ul` en cards de viajes, tags, stats, platos, guías y las cintas de testimonios y galería; `dl` en los datos de "¿Puedo?") y los títulos siguen una jerarquía sin saltos: `h1` › `h2` por sección › `h3` (pilares, cards de viaje, "Cronograma", "¿Puedo?"/"¿Es para mí?", "Itinerario", grupos de Servicios) › `h4` (días del cronograma, etapas de Lolog). En el diseño los pilares y los grupos de Servicios son `h4` y las etapas un `div`; el tamaño visual es el del diseño. La sección 03 toma su nombre del `h2` (`aria-labelledby`) y las pestañas de Servicios, del encabezado visible.
- **Pestañas de Servicios accesibles**: patrón WAI-ARIA (`tablist`/`tab`/`tabpanel`, tabindex móvil, flechas, Inicio y Fin). Hay un solo `tabpanel`, el del viaje activo: el motor re-escanea ante nodos nuevos, no ante cambios de atributos, así que un panel destapado con `hidden` quedaría invisible hasta el próximo scroll.
- **Próximos viajes sin JS**: con `@media (scripting: none)` la escena deja de ser sticky y el riel scrollea en horizontal, así las cuatro cards se pueden ver (en el diseño, sin JS las que no entran en el ancho quedan recortadas). La escena usa `overflow: clip` en vez de `hidden`: enfocar un botón fuera de pantalla no mueve el `scrollLeft`, que se sumaría a la traslación del motor.
- **Textos alternativos**: las fotos del equipo van con `alt=""` porque el link ya dice nombre, rol y usuario; las de la galería llevan el alt descriptivo de `PHOTOS` (en el diseño están vacías). Las cards de viaje, las etapas de Lolog y los platos mantienen el alt del diseño (el nombre, que el lector de pantalla lee dos veces).
- Los links externos llevan `rel="noopener noreferrer"` (el diseño pone solo `noopener`), y el hover del avatar del equipo también responde a `:focus-visible`.

---

## 10. Comandos

```bash
npm install          # instalación
npm run dev          # desarrollo (http://localhost:3000)
npm run build        # build de producción
npm run start        # servir el build
npm run lint         # eslint
npm run type-check   # tsc --noEmit
npm run test         # vitest
npm run check        # type-check + lint + test
npm run format       # prettier
```

Variables de entorno — copiar `.env.example` a `.env.local`:

```
NEXT_PUBLIC_APP_URL=        # URL pública (metadata y sitemap)
NEXT_PUBLIC_MOTION_LEVEL=   # suave | equilibrado | exagerado | apagado
```

**`npm run build` y `npm run dev` pueden correr a la vez.** En Kora (Next 15) se pisaban los artefactos de `.next`; Next 16 escribe el dev en `.next/dev` (por eso el `tsconfig` incluye `.next/dev/types`) y el build en `.next`.

---

## 11. Cómo evolucionar este documento

Cuando una decisión cambie, editar la sección correspondiente — no agregar un addendum al final. Si el cambio invalida una convención previa, dejar un commit `documentar(claude): ...` explicando el porqué.
