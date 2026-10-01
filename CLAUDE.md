# CLAUDE.md — Hoy Estoy Out Of Home (frontend)

Guía para Claude Code (claude.ai/code) y para cualquier persona que trabaje en este repositorio. Sigue la misma organización que **Kora 2.0** (`Desktop/Kora/KORA-frontend`), adaptada a lo que pide este proyecto: **CSS3 puro (CSS Modules) en vez de Tailwind** y **orientación a objetos** en el dominio y en el motor de animación.

---

## 1. Qué es esto

Landing de **Hoy Estoy Out Of Home**, una empresa de turismo aventura que arma trekkings y ascensos guiados por Mendoza y la Patagonia. Es una **landing única** (una sola página con anclas); el funnel es **WhatsApp** — no hay formulario, pagos ni backend. El código está en GitHub (`origin/main`) y se publica en Vercel con cada push (§10).

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
| `docs/design/hoy-estoy-ooh-landing-print.dc.html` | Variante para imprimir / exportar a PDF (la reproduce `design-system/print.css`, §5) |
| `docs/design/design-system/styles.css` | Tokens y clases del design system Organic |
| `docs/design/design-system/readme.md` | Guía del design system (qué se hace y qué no) |

**Regla:** el diseño es la fuente de **copys, paleta, medidas y comportamiento**. La estructura del código la define este documento, no el árbol del HTML exportado. Si algo del código no coincide con el diseño, gana el diseño — salvo las mejoras documentadas en §9.

---

## 3. Stack

| Capa | Tecnología |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Runtime | **Node 22** (`engines.node: "22.x"`): la versión con la que se desarrolla y se testea (Next 16 pide ≥ 20.9) |
| Lenguaje | **TypeScript** estricto (`strict` + `noUncheckedIndexedAccess` + `noImplicitOverride`) |
| Estilos | **CSS3** — CSS Modules por componente + custom properties del design system. **Sin Tailwind, sin CSS-in-JS** |
| Animaciones | **Motor propio orientado a objetos** (`src/motion/`), port fiel del motor del diseño. **Sin GSAP ni Framer Motion** |
| Imágenes | `next/image` (AVIF/WebP, `sizes` por uso) |
| Fuentes | `next/font/google` — **DM Serif Display** (títulos) y **Lexend** (cuerpo), auto-hospedadas en el build |
| Iconos | **lucide-react**, trazo 2.75 (regla del design system) |
| Tests | **Vitest** (entorno `node`, con DOM falso donde hace falta) — dominio, motor (matemática, efectos, el loop y el telón), la URL pública (`constants/siteUrl`) y funciones puras de los features (`toServiceTabs`) |
| Calidad | ESLint 9 (flat config, `eslint-config-next`) + Prettier |
| Deploy | **Vercel**: `npm run build` en cada push a `main` (§10) |

Decisiones explícitas: App Router (no Pages), CSS Modules (no Tailwind), motor propio (no GSAP), sin estado global (no hace falta ningún Context), sin HTTP (no hay backend: todo el contenido es estático y se prerenderiza).

> **Next 16 no es el Next que uno recuerda.** Cambió APIs y convenciones respecto de 15 (por ejemplo: `next lint` ya no existe, `next/image` usa `preload` en vez de `priority`, el dev escribe en `.next/dev`, el build ya no imprime el tamaño de First Load JS). Antes de usar una API de Next, leer la guía de la versión instalada en **`node_modules/next/dist/docs/`**. `next.config.ts` tiene `agentRules: false` para que `next dev` no le agregue a este archivo su propio bloque con este mismo aviso.

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
design-system/  → tokens CSS, estilos base, hoja de impresión, fuentes, tokens de movimiento
constants/      → configuración de marca, URL pública, IDs de secciones, rutas de assets, atributos de links
utils/          → helpers (cn)
```

Las flechas son la única dirección permitida: `domain/` no importa nada del resto; `components/` no importa `features/` ni `content/`; `motion/core` y `motion/effects` no importan React.

### 4.2 Estructura

```
src/
├── app/
│   ├── layout.tsx            # <html>, fuentes, metadata (SITE_URL, imagen para compartir), fondo que cambia, nav, site-chrome, runtime del motor
│   ├── layout.module.css     # envoltorio del fondo que cambia + "Saltar al contenido"
│   ├── page.tsx              # <Landing />
│   ├── globals.css           # importa el design system (tokens + base + print)
│   ├── icon.png · apple-icon.png  # favicon 64×64 y apple-touch-icon 180×180 (el logo en un cuadrado)
│   └── robots.ts · sitemap.ts
├── components/               # UI reutilizable (Atomic Design) — presentacional, CSS Modules
│   ├── atoms/                # Button, Tag, Container, Section, Eyebrow, WashedImage, BrandLogo, Dot, ChatIcon, StarRating, VisuallyHidden
│   ├── molecules/            # SectionHeading, BulletList, SurfaceCard
│   └── organisms/            # Navbar/, Marquee (+ MarqueePauseGroup, el botón que pausa las cintas)
├── constants/                # site.ts (marca, WhatsApp, redes, flags), siteUrl.ts (SITE_URL, solo servidor), sections.ts (IDs/anclas), assets.ts (rutas + imagen para compartir), links.ts (atributos de links externos)
├── content/                  # TODO el texto visible + instancias del dominio
│   ├── index.ts              # landingContent: un slice por sección
│   ├── types.ts              # tipos compartidos (CallToAction, …)
│   ├── media.ts              # PHOTOS: cada foto una sola vez (ruta, dimensiones, alt, encuadre)
│   ├── whatsapp.ts           # la instancia de WhatsAppLink
│   ├── catalog/trips.ts      # tripCatalog (los 4 viajes)
│   └── sections/*.ts         # un slice por sección (hero.ts, trips.ts, lolog.ts, …)
├── design-system/            # tokens.css, base.css, print.css, fonts.ts, tokens/motion.ts, README.md
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

**Server Components por defecto.** Como las animaciones se enganchan por atributos, casi toda la landing se renderiza en el servidor. Llevan `'use client'` solo: `MotionRuntime`, las pestañas de `services/` (tienen estado) y `MarqueePauseGroup` (el botón que pausa las cintas de testimonios y galería). Las piezas de `site-chrome` (telón, cursor, barra de progreso, WhatsApp flotante) son Server Components: las mueve el motor por atributos.

### 4.5 Orientación a objetos — dónde y por qué

Los componentes de React son funciones (es el idioma de React; los componentes de clase están deprecados de hecho). La orientación a objetos está donde aporta:

| Dónde | Qué modela | Principios |
|---|---|---|
| `domain/` | Entidades y value objects: `Trip`, `TripDuration`, `Price`, `WhatsAppLink`, `Photo`, `ScheduleDay`, `ItineraryStage`, `Metric`, `ServiceChecklist`, `Guide`, `Testimonial`, `TripCatalog` | Encapsulamiento (campos `readonly`/privados), invariantes validadas en el constructor, comportamiento junto a los datos (`price.format()`, `whatsapp.href()`), inmutabilidad |
| `motion/` | `MotionEngine` + una clase por efecto (`RevealEffect`, `ParallaxEffect`, `MarqueeEffect`, …) sobre clases base abstractas | Herencia y polimorfismo (el motor recorre `MotionEffect[]` sin saber cuál es cuál), responsabilidad única (un efecto = un atributo), abierto/cerrado (un efecto nuevo es una clase nueva registrada en la fábrica, sin tocar el loop), inyección de dependencias (el motor recibe sus efectos) |

Regla: **clase cuando hay comportamiento o invariantes; tipo plano cuando es solo dato** (un pilar con número, título y bajada es un tipo, no una clase).

### 4.6 Sin strings mágicos

- IDs de sección y anclas → `constants/sections.ts` (`anchorTo('trips')`).
- Marca, teléfono, redes → `constants/site.ts`. URL pública → `constants/siteUrl.ts` (`SITE_URL`, §10).
- Rutas de imágenes → `constants/assets.ts` + `content/media.ts`.
- Atributos de links externos → `constants/links.ts` (`EXTERNAL_LINK_PROPS`).
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
| `tokens.css` | `:root` con todas las custom properties: colores + rampas 100–900 (`--color-accent-*`, `--color-accent-2-*`, `--color-neutral-*`), fuentes, espaciados, radios, sombras (incluido `--shadow-focus-gap`, el aro crema del foco), curvas de easing, capas (`--z-*`), layout (`--layout-max`, `--layout-gutter`, `--section-space`). Un solo valor se aparta del design system: `--color-accent-600` (§9.2) |
| `base.css` | Reset y estilos de elementos (`html`, `body`, `h1`–`h6`, `a`, `figcaption`, `:focus-visible`, `::selection`) — todo dentro de `:where()` para que tenga especificidad 0 y cualquier módulo lo pise. El `<html>` lleva `overflow-x: clip` y `scroll-padding-top` (§9) |
| `print.css` | Hoja de impresión (`@media print`): la variante print del diseño sobre la landing actual (§9.5). Selectores por atributos del motor, ARIA y estructura, nunca clases de módulo; `!important` para pisar los estilos inline que deja el motor |
| `fonts.ts` | `next/font/google`: expone `--font-dm-serif` y `--font-lexend`, que `tokens.css` usa en `--font-heading`/`--font-body` |
| `tokens/motion.ts` | Tokens del motor: niveles de intensidad, tiempos del telón, ventana de asentamiento, suavizados, radios del imán… |
| `README.md` | Cómo consumir, cómo repintar y cómo se imprime |

Convenciones de CSS:

- **CSS Modules** (`*.module.css`), clases en camelCase (`.tripCard`, `.tripCardMedia`). Nada de estilos globales fuera de `design-system/`.
- **Las reglas globales van dentro de `:where()`.** Los módulos le ganan a `base.css` por especificidad, no por orden de carga: en el build de producción la hoja global carga **después** que la de los módulos, así que una regla global nueva sin `:where()` le ganaría a una clase de módulo.
- Colores, fuentes, radios, sombras, easings y z-index **solo con `var(--…)`**. Tamaños de texto y medidas puntuales del diseño (p. ej. `clamp(40px, 5vw, 72px)`) pueden ir literales en el módulo que los usa.
- **Nada de `style={{…}}`** salvo para pasar un valor dinámico como custom property (`style={{ '--stack-offset': '14px' }}`, `--photo-ratio` de las etapas de Lolog) o el `objectPosition` de una foto que viene del contenido.
- Un solo breakpoint de ancho, el del diseño: **`@media (max-width: 820px)`** (nav sin links, grillas partidas a una columna, sticky desactivado). Además hay dos cortes por alto, documentados en §9.3: Próximos viajes deja de estar fijada con menos de 500 px de alto (`TripsShowcase`) y el itinerario de Lolog deja de apilarse con menos de 600 px (`StageCard`).
- `.washed` del design system → atom `WashedImage` (desatura y aclara las fotos para que se asienten sobre el crema).
- Estados interactivos del design system: hover y pressed desde la rampa de acento, foco `2px solid var(--color-accent)` con `:focus-visible`, deshabilitado al 45%. Los botones le suman al foco el aro crema `--shadow-focus-gap`, y sobre foto el anillo va del color del texto (§9.2).
- El botón tiene el efecto de la marca: **relleno verde musgo que avanza de izquierda a derecha en 2,5 s** (`::before` con `scaleX`), sin desplazamiento.
- **Impresión:** lo general va en `print.css`; lo propio de un componente, en un `@media print` de su módulo (el hero, su cinta, el botón que pausa las cintas).

---

## 6. Animaciones — el motor (`src/motion/`)

Port fiel, a TypeScript orientado a objetos, del motor del diseño (`docs/design/hoy-estoy-ooh-landing.dc.html`, script al pie). **Un solo loop de `requestAnimationFrame`** para toda la página; los elementos se enganchan por atributos `data-*`. El detalle (diagrama del frame, tabla de efectos, decisiones y diferencias con el original) está en `src/motion/README.md`.

### 6.1 Piezas

| Pieza | Responsabilidad |
|---|---|
| `attributes.ts` | Contrato marcado ↔ motor: nombres de atributos (`MOTION_ATTRIBUTES`) y helpers tipados (`reveal()`, `parallax()`, `marquee()`, `marqueePause()`, `counter()`, `tilt()`, …) |
| `core/MotionEngine` | El loop: estado del frame, fases (lectura → `tick` → escritura), firma y ventana de asentamiento (`SETTLE_MS`), re-escaneo del DOM cuando cambia, alta/baja de listeners, frame final al imprimir (`beforeprint`/`afterprint`) |
| `core/MotionEffect` | Clases base abstractas: `FrameEffect` (corre cada frame), `ScrollEffect` (mide y escribe solo en los frames que tocan layout), `PointerEffect` (reacciona al puntero) |
| `core/StyleWriter` | Escribe un estilo solo si cambió (evita recalcular estilos en cada frame) |
| `core/ScrollTracker` · `PointerTracker` · `IntroClock` | Scroll + velocidad suavizada · posición del mouse · progreso 0→1 de la intro |
| `effects/*` | Un efecto por atributo: reveal, parallax, drift, marquee, horizontal scroll, stack, timeline, counter, skew, tilt, magnet, background shift, scroll progress, cursor |
| `intro/CurtainController` | La coreografía del telón de entrada (la espera se cuenta desde el First Contentful Paint); al abrirse arranca la intro. Con el movimiento apagado, o con la primera tecla, se oculta de una vez |
| `math/*` | Funciones puras (clamp, easing, transformaciones de cada reveal, formato de los contadores, avance del scroll horizontal y su inverso) — con tests |
| `react/MotionRuntime` | Componente cliente que crea el motor al montar y lo destruye al desmontar. No renderiza nada |

### 6.2 Reglas

- **Nada de animación inline en el JSX** ni `useEffect` sueltos que animen: todo pasa por atributos + motor.
- **Lectura, después escritura.** En cada frame el motor primero mide todo (`getBoundingClientRect`, `scrollHeight`), después corre los `tick` (imanes → cursor → cintas: el imán, el único que lee layout, va primero) y al final escribe todo. Mezclarlos fuerza layouts síncronos. El original corría el cursor y las cintas antes de medir; el orden nuevo cambia cuándo se lee, no ningún valor.
- **Solo se mide cuando hace falta.** Un frame mide y escribe si cambió la firma de layout (scroll, viewport, intro, intensidad) o la velocidad redondeada, si hubo re-escaneo, o mientras siga abierta la **ventana de asentamiento**: `SETTLE_MS` (1100 ms, ≥ la transición más larga de los reveals; lo controla un test) desde el último cambio de layout. Un cambio de velocidad mide ese frame pero no extiende la ventana. Con la página quieta y la ventana cerrada, el frame es solo `tick`. Por qué existe la ventana: §9.4.
- **Transformaciones y opacidad** solamente (más `clip-path`/`filter` donde el diseño lo pide). Nunca `top`/`left`/`width` animados.
- **Los números viven en `design-system/tokens/motion.ts`** (intensidades, tiempos del telón, ventana de asentamiento, suavizados, radio del imán). Las transformaciones de cada reveal están en `math/revealTransforms.ts`, que es la tabla de coreografías.
- **Intensidad** (la perilla "Animaciones" del diseño): `suave` 0.6 · `equilibrado` 1 · `exagerado` 1.8 (por defecto) · `apagado` 0. Se elige con `NEXT_PUBLIC_MOTION_LEVEL`, que Next fija en el build: cambiarla pide un build nuevo (o reiniciar `npm run dev`).
- **`prefers-reduced-motion: reduce` apaga el movimiento** (como `apagado`): los reveals quedan en su lugar, los contadores muestran el valor final, las cintas se frenan y el telón se oculta de una vez al hidratar (§9.2). Se decide en un solo lugar (`RESPECT_OS_REDUCED_MOTION` en `tokens/motion.ts`).
- **Impresión.** En `beforeprint` el motor marca que se imprime (el movimiento cuenta como apagado) y corre un frame **sincrónico**: cada efecto escribe su pose final y los contadores su valor final. No espera al próximo `requestAnimationFrame` porque el navegador arma la vista de impresión apenas termina de despachar el evento. En `afterprint` fuerza que el próximo frame mida y escriba aunque la firma no haya cambiado: todo vuelve al estado real del scroll. Lo cubren los tests de "impresión" de `core/MotionEngine.test.ts`; el resto de la hoja (piezas fijas, poses inline, secciones con scroll) lo resuelve `print.css`.
- **Lo que se escribe por el `StyleWriter` se resetea por el `StyleWriter`.** Si un efecto escribe una propiedad por la caché y la resetea directo (`style.transform = ''`), la caché se queda con la pose vieja y, al volver el movimiento (después de imprimir, o al apagar reduced motion), la misma pose recalculada no se reescribe.
- El estado por elemento va en `WeakMap`, no en propiedades pegadas al nodo (`el._x` del diseño).
- El motor re-escanea el DOM cuando entran o salen nodos (`MutationObserver`) y ante `resize` — por eso las pestañas de Servicios no necesitan avisarle nada. **No re-escanea por cambios de atributos**: lo que cambia en vivo con un atributo (la pausa de las cintas, `data-marquee-paused`) se consulta en cada frame.
- **Si un efecto depende de un corte del CSS, le pregunta al CSS.** El scroll horizontal y el stack leen el `position` computado de su escena o su envoltorio (¿sigue sticky?) en vez de repetir el `@media`: el corte vive en un solo lugar, el módulo CSS.
- Un efecto que engancha listeners (el `focusin` y el `keydown` del scroll horizontal) los suelta al re-escanear y en `dispose`.
- **Sin JS la página se lee entera**: el telón tiene `<noscript>` y un failsafe por CSS, el cursor del sistema solo se oculta cuando el cursor custom está activo, y los contadores se renderizan con su valor final (con JS, ese valor queda además en texto oculto para los lectores de pantalla, §9.2).

---

## 7. Estado de implementación

Las 13 secciones están implementadas, revisadas contra el diseño (copys, medidas y `data-*`) y compuestas en `Landing.tsx`; el build las prerenderiza en orden. Se verificaron en el navegador (Chrome, con scripts de Puppeteer contra el dev server y contra el diseño): medidas en escritorio y mobile (a 1440×900 la sección Lolog mide 3818 px, igual que el diseño), teclado, árbol de accesibilidad y axe, alto contraste y reduced motion emulados, pantallas bajas y zoom, e impresión a PDF (25 hojas en Letter, como el print del diseño). Está publicada en Vercel. La columna "Pendiente" lista lo que quedó para decidir o mirar.

| Sección (diseño) | Feature | Estado | Pendiente |
|---|---|---|---|
| Telón, cursor, barra de progreso, WhatsApp flotante, "Saltar al contenido" | `site-chrome` · `app/layout` | ✅ | Después de "Saltar al contenido" el foco queda en `body` (el `<main>` no es enfocable). El Tab siguiente sigue desde el contenido; falta probarlo con un lector de pantalla |
| Nav | `components/organisms/Navbar` | ✅ | |
| 01 Hero + cinta | `hero` | ✅ | |
| 02 Por qué viajar con nosotros | `why-us` | ✅ | |
| 03 Próximos viajes (scroll horizontal) | `trips` | ✅ | Con JS pero con el motor caído, el riel queda recortado (el fallback cubre "sin JS" y las pantallas de menos de 500 px de alto). A 320 px, al final del recorrido, la última card queda 2 px cortada a la izquierda |
| 04 Calle & Stepanek (+ cronograma) | `calle-stepanek` | ✅ | |
| 05 ¿Puedo? / ¿Es para mí? | `calle-stepanek` | ✅ | |
| 06 Banda "La montaña te espera." | `mountain-banner` | ✅ | |
| 07 Lago Lolog (stats + itinerario apilado) | `lolog` | ✅ | Entre 821 y 825 px de ancho (grilla de escritorio) las stats se pasan 1–2 px del contenedor |
| 08 Pensión completa | `meals` | ✅ | |
| 09 Servicios y equipo (pestañas) | `services` | ✅ | |
| 10 ¿Quiénes somos? | `team` | ✅ | Al imprimir, si un guía salta de hoja, el aro de su avatar deja un arco de ~2 px al pie de la hoja anterior (Chromium) |
| 11 Testimonios | `testimonials` | ✅ | |
| 12 Galería | `gallery` | ✅ | |
| 13 Precio y contacto + footer | `contact` | ✅ | |

Fuera de las secciones:

- **Assets (pedido al cliente).** Las fotos de los platos (196 px) y del equipo (~220 px) y el logo (PNG de 149×172 con fondo gris) son los únicos originales que hay, y agrandarlos no agrega detalle. Hacen falta platos y equipo de ≥ 440 px, y el logo en SVG o en PNG transparente de ≥ 360 px.
- **Deploy.** Cargar `NEXT_PUBLIC_APP_URL=https://<dominio>` en las variables de Production de Vercel (o confirmar que `VERCEL_PROJECT_PRODUCTION_URL` es el dominio correcto) y revisar en el deploy el `<head>` (canonical, `og:url`, `og:image`), `/robots.txt` y `/sitemap.xml` (§10).

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
- `README.md` en la raíz (qué es y cómo arrancar), en `design-system/`, `motion/` y `domain/`. Prettier no corre sobre `.md` (`npm run format` cubre `ts`, `tsx` y `css`): las tablas de los README se mantienen a mano.

### 8.4 Clean code

Una función, una cosa. Nombres autoexplicativos (en inglés en el código, en español en el contenido y los comentarios, como Kora). Sin código muerto ni `console.log` sueltos.

---

## 9. Diferencias deliberadas con el diseño

Lo que se aparta del diseño a propósito, agrupado por motivo. Todo lo que no figura acá (copys, medidas, fórmulas y números del motor) es el diseño tal cual.

### 9.1 Estructura y marcado

- El HTML exportado tiene **tres `<main>`**; acá hay uno solo y las secciones se contienen con `Container`.
- **El footer es hermano del `<main>`**, no parte de la sección 13 como en el diseño: así es el `contentinfo` de la página. El padding de abajo de la sección y su `margin-top` pasan a ser el padding del footer. Lleva su propio fondo verde oscuro (el mismo al que cambia la página) y su propio `backgroundShift`: con JS no se nota la diferencia y sin JS el texto claro sigue siendo legible.
- El WhatsApp flotante va al final del DOM (orden de tabulación), no con el resto de las piezas fijas, y dentro de un `<aside>` con nombre ("Contacto rápido"), así no queda fuera de todo landmark.
- **Semántica.** Donde el diseño apila `div`s, acá hay listas (`ol` en los pilares, el cronograma y el itinerario de Lolog; `ul` en cards de viajes, tags, stats, platos, guías y las cintas de testimonios y galería; `dl` en los datos de "¿Puedo?") y los títulos siguen una jerarquía sin saltos: `h1` › `h2` por sección › `h3` (pilares, cards de viaje, "Cronograma", "¿Puedo?"/"¿Es para mí?", "Itinerario", grupos de Servicios) › `h4` (días del cronograma, etapas de Lolog). En el diseño los pilares y los grupos de Servicios son `h4` y las etapas un `div`; el tamaño visual es el del diseño. Las secciones 03 y 13 toman su nombre del `h2` (`aria-labelledby`): en la 13 el precio va antes del título, y así la navegación por landmarks entra antes del precio. Las pestañas de Servicios toman su nombre del encabezado visible. Los CTA de las cards de viaje suman el nombre del viaje en texto oculto visualmente (`VisuallyHidden`): "Ver viaje" y "Consultar" se repetían para destinos distintos en la lista de links del lector de pantalla; el texto visible va primero ("label in name", WCAG 2.5.3).
- Las copias duplicadas de las cintas (marquees) van con `aria-hidden` para que los lectores de pantalla no lean todo dos veces.
- **Textos alternativos**: las cards de viaje, las etapas de Lolog y la galería llevan el alt descriptivo de `PHOTOS` (en el diseño, el nombre del viaje o del tramo —que ya es el título de al lado, y el lector de pantalla lo leería dos veces— y `alt=""` en la galería). Las fotos del equipo y los platos de la pensión van con `alt=""`: el link del guía ya dice nombre, rol y usuario, y el `figcaption` ya nombra la comida. El logo del nav también va con `alt=""`: el link ya dice la marca al lado.
- Los links externos llevan `rel="noopener noreferrer"` (el diseño pone solo `noopener`), desde un solo lugar: `EXTERNAL_LINK_PROPS` en `constants/links.ts`. El hover del avatar del equipo también responde a `:focus-visible`.
- El motor del diseño trae un carrusel de testimonios por intervalo (`tRef`, `goT`, `tDots`) que el marcado no usa: los testimonios son una cinta. No se portó.
- El anillo del cursor (`data-cursor`) está oculto de forma permanente en el diseño; se portó solo el cursor montaña.

### 9.2 Accesibilidad

- El diseño oculta el cursor del sistema con CSS siempre que haya `pointer: fine`; acá solo se oculta cuando el cursor custom efectivamente está andando (si falla el JS, no te quedás sin cursor).
- **Pestañas de Servicios accesibles**: patrón WAI-ARIA (`tablist`/`tab`/`tabpanel`, tabindex móvil, flechas, Inicio y Fin). Hay un solo `tabpanel`, el del viaje activo: el motor re-escanea ante nodos nuevos, no ante cambios de atributos, así que un panel destapado con `hidden` quedaría invisible hasta el próximo scroll. Con `forced-colors: active` (alto contraste) la pestaña activa se pinta con `Highlight`/`HighlightText`: el modo forzado borra el fondo dorado, que era lo único que la distinguía de la inactiva.
- **Próximos viajes con teclado.** El riel se mueve con `transform` dentro de una escena sticky, así que en el diseño tabular a una card fuera de la vista la deja fuera de la vista. `HorizontalScrollEffect` escucha `focusin` en cada `[data-hscroll]` y, en el frame siguiente, si la card enfocada no se ve entera, scrollea en vertical hasta el punto que la pone en el gutter (el inverso de la fórmula del efecto, `scrollTopToShowItem`): suave, o `instant` con el movimiento apagado (`auto` tomaría el `scroll-behavior: smooth` del `<html>`). Solo sigue el foco que llega con Tab: un clic o un toque no mueven la página (si no, el botón se corría debajo del puntero y el clic no llegaba, o se pisaba el salto al ancla). La card se busca contra el ancho útil (viewport menos los gutters), así entra entera también en pantallas de ~1700 px. Antes de calcular deja en 0 el `scrollLeft` de los ancestros del riel, por si el navegador corrió algo en X.
- **El foco no queda debajo del nav.** El `<html>` lleva `scroll-padding-top` (alto del nav + `--space-4`) en lugar del `scroll-margin-top` de cada sección. Con Shift+Tab, una pestaña de Servicios quedaba enfocada entera debajo del nav sticky (WCAG 2.4.11). Vale para el foco y para los saltos por ancla.
- **Foco visible sobre fondos oscuros y fotos.** Los botones suman al anillo dorado del design system un aro crema de 2 px en el hueco del `outline-offset` (`--shadow-focus-gap`). Sobre crema no se nota, y sobre el verde del cierre da 9,7:1 (el dorado solo, 2,7:1). Sobre la foto del hero y en el WhatsApp flotante el anillo es del color del texto, con el mismo aro crema, para que contraste sobre cualquier fondo (WCAG 1.4.11).
- **Contraste AA del acento.** `--color-accent-600` es #886130 y no #8c6433 como en el design system: el texto crema de los botones primarios daba 4,46:1, debajo de AA para 14–17 px.
- **Contraste AA en textos.** Algunos textos se oscurecen un paso para llegar a AA. El texto de los tags outline pasa a accent-700. Los `figcaption` (epígrafes de Pensión y pie de los testimonios) pasan a neutral-700 en vez del texto al 55%, y la nota al pie de Pensión también a neutral-700. El "Calle &" del título pasa a accent en vez de accent-500. En el diseño daban entre 2,8:1 y 3,9:1. Los números 01–04 de los pilares quedan como en el diseño: son decorativos y van con `aria-hidden`.
- El CTA secundario del hero lleva la misma sombra de texto que la bajada: cae donde el degradé vuelve al crema y el texto crema se perdía contra la foto.
- **Contadores accesibles.** Los contadores animados (stats de Lolog y precio del cierre) van con `aria-hidden`, y el valor final se expone en texto oculto visualmente (`VisuallyHidden`). El motor pone el número en 0 al cargar y lo sube al entrar en pantalla, y un lector de pantalla leía "$0.000" o un valor intermedio.
- **Cintas pausables.** Las cintas de testimonios y de la galería tienen un botón para pausarlas y se frenan también con el foco adentro (WCAG 2.2.2). En el diseño solo se frenan con el mouse encima. La cinta del hero, decorativa y con `aria-hidden`, no lo lleva. El botón es un componente cliente (`MarqueePauseGroup`) que marca `data-marquee-paused`, y el motor lo respeta igual que el hover. La velocidad sigue siendo por frame, como en el original.
- **Telón sin movimiento con reduced motion.** Con el movimiento apagado (nivel `apagado` o `prefers-reduced-motion`), el telón se oculta de una vez al hidratar, sin el fundido del logo ni el giro 3D de las hojas. En el diseño se abre igual, solo que sin la espera inicial.
- **La primera tecla levanta el telón.** Mientras el telón tapa, cualquier tecla lo oculta en el acto y arranca la intro; si no, el segundo Tab enfocaba la marca del nav escondida detrás (WCAG 2.4.11). En el diseño el teclado espera a que se abra.

### 9.3 Mobile, pantallas bajas y zoom

- **Mobile legible.** El diseño fija varios textos en una línea (`white-space: nowrap`) con tamaños en `vw` (`min(72px, 5.3vw)` en el `h1`, `min(19px, 2.4vw)` en la bajada del hero, `min(48px, 3.3vw)` en títulos). En escritorio se ven como en el diseño; a 375 px darían un `h1` de 20 px y una bajada de 9 px. Regla: **en `@media (max-width: 820px)` esos textos pasan a `white-space: normal` con un piso legible** — `h1` ≥ 34 px, `h2` ≥ 30 px, bajadas y párrafos ≥ 16 px. Por encima de 820 px, el diseño manda tal cual. Los pisos se eligen para empalmar con el valor de escritorio en 820 px (`max(30px, 4.4vw)`, `max(34px, 5.3vw)`), así el cambio de breakpoint no se nota. Más casos: el CTA del cierre también parte en renglones (a 375 px el botón `nowrap` no entra en la tarjeta y el `overflow: hidden` lo cortaría); los números de las stats de Lolog **siguen** en una línea (ya tienen piso de 30 px, y partidos dejarían la "m" sola), pero las stats pasan de renglón cuando no entran (debajo de ~330 px); y el texto calado del hero sube a `top: 2%` para no cruzar el titular, que en mobile ocupa cuatro renglones. Algunas grillas usan `minmax(0, 1fr)` o `minmax(min(300px, 100%), 1fr)` en vez de `1fr`/`300px` para no desbordar debajo de 340 px; por encima son idénticas al diseño.
- **Titular del hero en mobile.** En el diseño cada renglón del `h1` es una fila flex propia; a ≤ 820 px, con el piso de 34 px, cada uno partía por su cuenta ("…en la / montaña / para reconectar con lo / esencial."). Acá, debajo de 820 px, los renglones pasan a `display: contents` y el `h1` es un `flex-wrap` con el mismo `column-gap: .24em`: la frase fluye como un solo párrafo. Cada palabra conserva su máscara, su `reveal('word')` y su escalón. En escritorio, los dos renglones del diseño.
- **El documento no se ensancha en mobile.** En el diseño el `overflow-x: clip` va solo en el `body` (`dc.html:15`); se propaga al viewport y deja de recortar. Los reveals corridos a la derecha (cronograma, pestañas de Servicios, link de la galería) ensanchan el documento, y en un teléfono de 390 px el viewport de layout pasa a 543 px: el WhatsApp flotante queda fuera de pantalla y la última card de Próximos viajes no se ve entera. Acá el `html` también lleva `overflow-x: clip`.
- **Próximos viajes sin JS**: con `@media (scripting: none)` la escena deja de ser sticky y el riel scrollea en horizontal, así las cuatro cards se pueden ver (en el diseño, sin JS las que no entran en el ancho quedan recortadas). La escena usa `overflow: clip` en vez de `hidden`: enfocar un botón fuera de pantalla no mueve el `scrollLeft`, que se sumaría a la traslación del motor.
- **Próximos viajes en pantallas bajas.** Si el viewport tiene menos de 500 px de alto (teléfono apaisado, zoom del 200% en una notebook), la escena deja de estar fijada y el riel scrollea en horizontal, como sin JS: la card no entraba en la escena de 100vh y el precio y el CTA quedaban recortados. Con Tab, el motor termina de entrar en el riel la card enfocada (Chrome deja como está un botón que asoma a medias).
- **Itinerario de Lolog sin apilar en mobile y en pantallas bajas.** Con 820 px de ancho o menos, o menos de 600 px de alto, las cards dejan de ser sticky (en el diseño siguen sticky): con la foto debajo del texto miden más que la pantalla, y la card siguiente tapaba el pie de la foto (y, con zoom, el texto). `StackEffect` no achica ni oscurece una card que no está fijada.

### 9.4 Motor y rendimiento

- **Las cintas no saltan en cada vuelta.** El motor reinicia una cinta al recorrer medio `scrollWidth`; con `gap` entre ítems la mitad cae medio gap antes del comienzo de la copia, y en el diseño las cintas saltan 19 px (hero), 10 px (testimonios) y 7 px (galería) en cada vuelta. Cada riel suma `padding-inline-end` igual a su gap (en el hero, cada ítem lleva el espacio como padding). Es invisible: el padding queda siempre fuera de la pantalla. La regla está documentada en el organism `Marquee`.
- **Ventana de asentamiento del motor.** El motor del diseño solo mide y escribe cuando cambia la firma del frame (scroll, viewport, intro, intensidad, velocidad redondeada). Los contadores leen su posición mientras la transición del reveal que los contiene (hasta 1 s) todavía los desplaza, y al frenar el scroll quedaban trabados en un valor intermedio (en las stats de Lolog, "3 días / 2 noches" en vez de "4 / 3", igual en el diseño). Acá, después del último cambio de scroll, viewport, intro o intensidad, el motor sigue midiendo y escribiendo durante `SETTLE_MS` (1100 ms, ≥ el `clip-path` de 1 s de `REVEAL_TRANSITION`; lo controla un test) y recién después vuelve a ahorrar frames. La ventana la abren solo esos cambios: un cambio de velocidad mide ese frame pero no la extiende (si la extendiera, serían ~1,7 s de frames completos por scroll mientras la velocidad suavizada baja a 0). Las fórmulas y los números son los del diseño: lo único que cambia es que todo lo que lee posiciones termina en el valor del layout ya asentado (y el skew por velocidad termina en 0 exacto en vez de ~0,1°).
- **Las cintas fuera de pantalla se frenan.** El motor del diseño movía las cuatro cintas en cada frame aunque no se vieran. Acá solo avanzan las que están en el viewport (con margen, `MARQUEE.visibilityMarginPx`), y al volver a entrar siguen desde donde quedaron. Con la página quieta y ninguna cinta a la vista, el trabajo del hilo principal baja a la mitad.
- **El telón descuenta el tiempo que el logo ya estuvo a la vista.** En el diseño (`dc.html:442`) se levanta 1300 ms después de montar el motor, que acá es al hidratar. En un celular lento (Slow 4G, CPU 4×), el logo ya llevaba ~2 s en pantalla cuando empezaba la espera, y el contenido aparecía recién a los ~5,5 s. `CurtainController` resta de `liftDelayMs` el tiempo transcurrido desde el First Contentful Paint: en una carga rápida se ve igual que en el diseño, y en una lenta el telón se levanta apenas hidrata.

### 9.5 Impresión

- **Hoja de impresión** (`design-system/print.css`). Reproduce `hoy-estoy-ooh-landing-print.dc.html` sobre la landing actual, con estas diferencias: no se imprime la barra de avance de Próximos viajes (en el print queda un riel vacío); las fotos del itinerario de Lolog tienen un tope de 520 px para que cada día entre en una hoja (en el print los días 1 y 4 se parten); los ítems de lista no se parten entre hojas; los testimonios van en la grilla del print pero son los siete de la cinta. El hero impreso es el de pantalla, con el alto de 560 px del print y sin el texto calado ni la cinta; no se portaron el hero, las etiquetas ni los eyebrows numerados del print, que son de una versión anterior. De las pestañas de Servicios se imprime la activa, y el botón que pausa las cintas no se imprime.
- **Los contadores se imprimen con su valor final.** En la landing del diseño, un contador al que no se llegó scrolleando se imprime en 0 ("$0.000", "0 km", "0 días"): su texto lo escribe el motor y CSS no lo puede corregir. Acá `MotionEngine` escucha `beforeprint` y corre un frame sincrónico con el movimiento apagado (cada efecto escribe su pose final y los contadores su valor final, como en el print del diseño, que corre con el motor en 0), y en `afterprint` vuelve al estado real en el próximo frame (§6.2).

---

## 10. Comandos

```bash
npm install          # instalación (Node 22)
npm run dev          # desarrollo (http://localhost:3000)
npm run build        # build de producción
npm run start        # servir el build
npm run lint         # eslint
npm run type-check   # tsc --noEmit
npm run test         # vitest
npm run check        # type-check + lint + test
npm run format       # prettier (ts, tsx y css de src/)
```

Variables de entorno — copiar `.env.example` a `.env.local`:

```
NEXT_PUBLIC_APP_URL=        # URL pública (canonical, Open Graph, robots, sitemap). Vacía: en Vercel cae a https://$VERCEL_PROJECT_PRODUCTION_URL; fuera de Vercel, a http://localhost:3000 (obligatoria en producción fuera de Vercel)
NEXT_PUBLIC_MOTION_LEVEL=   # suave | equilibrado | exagerado | apagado (por defecto, exagerado). Se fija en el build
```

**URL pública.** `SITE_URL` vive en `src/constants/siteUrl.ts` (`resolveSiteUrl`, con tests). Orden: `NEXT_PUBLIC_APP_URL` si no está vacía → `https://${VERCEL_PROJECT_PRODUCTION_URL}` → `http://localhost:3000`. Un deploy con `VERCEL_ENV=production` que termine en localhost falla en el build, a propósito (es el bug que publicó el canonical, Open Graph, robots y sitemap apuntando a `http://localhost:3000`); un `npm run build` local sin variables sigue andando (no se mira `NODE_ENV`). Solo lo importan `app/layout.tsx`, `robots.ts` y `sitemap.ts`: `constants/site.ts` corre también en el cliente y no lee variables de entorno.

**Deploy.** GitHub (`origin/main`) → Vercel, que corre `npm run build` en cada push. Next type-chequea en el build todo lo que incluye `tsconfig.json`, tests y fixtures incluidos: un fixture que no compila tumba el deploy aunque Vercel no corra los tests. Antes de pushear, `npm run check` y `npm run build`.

**Node 22.** `engines.node` es `"22.x"` y no un rango abierto (`">=20.9.0"`): con un rango abierto, Vercel avisa que la versión de Node se actualiza sola con cada major nueva. 22 es la versión con la que se desarrolla y se testea.

**`npm run build` y `npm run dev` pueden correr a la vez.** En Kora (Next 15) se pisaban los artefactos de `.next`; Next 16 escribe el dev en `.next/dev` (por eso el `tsconfig` incluye `.next/dev/types`) y el build en `.next`.

---

## 11. Cómo evolucionar este documento

Cuando una decisión cambie, editar la sección correspondiente — no agregar un addendum al final. Si el cambio invalida una convención previa, dejar un commit `documentar(claude): ...` explicando el porqué.
