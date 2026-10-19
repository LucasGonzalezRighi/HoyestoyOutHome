# CLAUDE.md — Hoy Estoy Out Of Home (frontend)

Guía para Claude Code (claude.ai/code) y para cualquier persona que trabaje en este repositorio. Sigue la misma organización que **Kora 2.0** (`Desktop/Kora/KORA-frontend`), adaptada a lo que pide este proyecto: **CSS3 puro (CSS Modules) en vez de Tailwind** y **orientación a objetos** en el dominio y en el motor de animación.

---

## 1. Qué es esto

Sitio de **Hoy Estoy Out Of Home**, una empresa de turismo aventura que arma trekkings y ascensos guiados por Mendoza y la Patagonia. Tiene un **home** con la información general (una sola página con anclas: hero, por qué viajar, viajes, calendario, quiénes somos, testimonios, galería, preguntas frecuentes y contacto) y **una página por viaje** (`/viajes/<slug>`) con todo lo propio de cada uno: cronograma, requisitos, qué incluye, pensión, salidas y precio. Esa estructura la pidió el cliente en octubre de 2026 (§9.6); el diseño original es una landing única.

El funnel es **WhatsApp**: cada "Consultar" abre el chat con un mensaje precargado. Contacto suma un **formulario breve que arma un `mailto:`** a `CONTACT_EMAIL` (lo envía el cliente de correo de quien escribe). No hay backend, pagos ni base de datos. El código está en GitHub (`origin/main`) y se publica en Vercel con cada push (§10).

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

**Regla:** el diseño es la fuente de **copys, paleta, medidas y comportamiento**. La estructura del código la define este documento, no el árbol del HTML exportado. Si algo del código no coincide con el diseño, gana el diseño — salvo las mejoras documentadas en §9. La estructura de páginas (home + una por viaje), el Calendario, las Preguntas frecuentes y el formulario de Contacto no están en el diseño: los pidió el cliente en octubre de 2026 y siguen su lenguaje visual (§9.6).

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
| Tests | **Vitest** (entorno `node`, con DOM falso donde hace falta) — dominio, motor (matemática, efectos, el loop y la intro), tokens de movimiento, la URL pública (`constants/siteUrl`), `tripMetrics` de `content/trips`, funciones puras de los features (`checklistPanels`, `contactMail`, `fanNavigation`, `panelPhotoSizes`) e `isRouterHref` de `LinkButton` |
| Calidad | ESLint 9 (flat config, `eslint-config-next`) + Prettier |
| Deploy | **Vercel**: `npm run build` en cada push a `main` (§10) |

Decisiones explícitas: App Router (no Pages), CSS Modules (no Tailwind), motor propio (no GSAP), sin estado global (no hace falta ningún Context), sin HTTP (no hay backend: todo el contenido es estático y se prerenderiza, también las páginas de viaje con `generateStaticParams`).

> **Next 16 no es el Next que uno recuerda.** Cambió APIs y convenciones respecto de 15 (por ejemplo: `next lint` ya no existe, `next/image` usa `preload` en vez de `priority`, el dev escribe en `.next/dev`, el build ya no imprime el tamaño de First Load JS). Antes de usar una API de Next, leer la guía de la versión instalada en **`node_modules/next/dist/docs/`**. `next.config.ts` tiene `agentRules: false` para que `next dev` no le agregue a este archivo su propio bloque con este mismo aviso.

---

## 4. Arquitectura

### 4.1 Capas

```
app/            → rutas de Next (layout, home, viajes/[slug], metadata, robots, sitemap)
  ↓ compone
features/       → una carpeta por sección del home, la página de viaje (trip-detail) y site-chrome
  ↓ usa
components/     → UI reutilizable, presentacional (atoms / molecules / organisms)
content/        → todo el texto visible + las instancias del dominio (catálogo de viajes, salidas, fotos…)
  ↓ instancia
domain/         → clases del negocio (Trip, Price, WhatsAppLink…) — TypeScript puro, sin React
motion/         → motor de animación (clases) + contrato de atributos data-*
design-system/  → tokens CSS, estilos base, hoja de impresión, fuentes, tokens de movimiento
constants/      → configuración de marca, URL pública, rutas de páginas, IDs de secciones, rutas de assets, atributos de links
utils/          → helpers (cn)
```

Las flechas son la única dirección permitida: `domain/` no importa nada del resto; `components/` no importa `features/` ni `content/`; `motion/core` y `motion/effects` no importan React.

### 4.2 Estructura

```
src/
├── app/
│   ├── layout.tsx            # <html>, fuentes, metadata (SITE_URL, imagen para compartir), fondo que cambia, nav, site-chrome, footer, runtime del motor
│   ├── layout.module.css     # envoltorio del fondo que cambia + "Saltar al contenido"
│   ├── page.tsx              # el home: <Landing />
│   ├── viajes/[slug]/page.tsx  # una página por viaje: generateStaticParams + dynamicParams = false (otro slug da 404) y metadata propia
│   ├── globals.css           # importa el design system (tokens + base + intro + print)
│   ├── icon.png · apple-icon.png  # favicon 64×64 y apple-touch-icon 180×180 (el logo en un cuadrado)
│   └── robots.ts · sitemap.ts     # el sitemap lista el home y las cuatro páginas de viaje
├── components/               # UI reutilizable (Atomic Design) — presentacional, CSS Modules
│   ├── atoms/                # Button (+ LinkButton, que navega con next/link en las rutas del sitio: isRouterHref), Tag, Container, Section, Eyebrow, WashedImage, BrandLogo, Dot, WhatsAppIcon, ContourLines (curvas de nivel: el fondo del sitio), StarRating, VisuallyHidden
│   ├── molecules/            # SectionHeading, BulletList, SurfaceCard, FormField (TextField, SelectField, TextAreaField)
│   └── organisms/            # Navbar/, Marquee (+ MarqueePauseGroup, el botón que pausa las cintas), Timeline (línea de tiempo: TimelineGroup, TimelineItem, TimelineText, TimelineTags, TimelinePhoto), CoverPair (cortina entre dos secciones)
├── constants/                # site.ts (marca, WhatsApp, CONTACT_EMAIL, redes, flags), siteUrl.ts (SITE_URL, solo servidor), routes.ts (ROUTES, tripPath), sections.ts (IDs/anclas del home y de la página de viaje), assets.ts (rutas + imagen para compartir), links.ts (atributos de links externos)
├── content/                  # TODO el texto visible + instancias del dominio
│   ├── index.ts              # landingContent: un slice por sección del home
│   ├── types.ts              # tipos compartidos (CallToAction, …)
│   ├── media.ts              # PHOTOS: cada foto una sola vez (ruta, dimensiones, alt, encuadre)
│   ├── whatsapp.ts           # la instancia de WhatsAppLink
│   ├── catalog/trips.ts      # tripCatalog (los 4 viajes)
│   ├── catalog/departures.ts # departureSchedule: las salidas (hoy, fechas de ejemplo: [completar])
│   ├── sections/*.ts         # un slice por sección del home (hero.ts, trips.ts, calendar.ts, faq.ts, contact.ts, …) + site.ts (nav, metadata)
│   └── trips/                # la página de cada viaje: un TripDetailContent por slug (calle-stepanek.ts, …), builders comunes (common.ts), tripMetrics
├── design-system/            # tokens.css, base.css, intro.css, print.css, fonts.ts, tokens/motion.ts, README.md
├── domain/                   # clases del negocio + tests (*.test.ts al lado de cada clase)
├── features/
│   ├── landing/              # Landing.tsx: la composición del home
│   ├── site-chrome/          # cursor, barra de progreso, WhatsApp flotante
│   ├── hero/ · why-us/ · trips/ · calendar/ · team/   # secciones del home, en orden…
│   ├── testimonials/ · gallery/ · faq/ · contact/      # …(contact incluye el formulario y el SiteFooter que monta el layout)
│   └── trip-detail/          # TripDetail.tsx: la plantilla de la página de un viaje (portada, sobre el viaje, cronograma, ¿Puedo?/¿Es para mí?, qué incluye, pensión, salidas, cierre)
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
- Los features **leen su slice de `content/` por props** (`<TripsShowcase content={landingContent.trips} />`, `<TripDetail content={findTripDetail(slug)} />`), eligen los componentes y marcan qué se anima.
- La lógica de negocio (formatear un precio, armar el link de WhatsApp, ordenar las salidas por fecha, decidir qué stats tiene un día del itinerario) vive en **clases de `domain/`**.
- La lógica de animación vive en **clases de `motion/`**. Los componentes solo esparcen atributos: `<h2 {...reveal('up', { delay: 1 })}>`.

**Server Components por defecto.** Como las animaciones se enganchan por atributos, casi todo el sitio se renderiza en el servidor. Llevan `'use client'` solo:

| Componente | Por qué es cliente |
|---|---|
| `motion/react/MotionRuntime` | Crea el motor al montar y lo destruye al desmontar |
| `features/trips` › `TripsFan` | Qué viaje está abierto en el abanico, las flechas, el contador y el teclado |
| `features/faq` › `FaqAccordion` | Qué pregunta está abierta; hasta hidratar muestra todas las respuestas |
| `features/contact` › `ContactForm` | Validación y armado del `mailto:`; sin JS se envía igual (`action="mailto:…"`) |
| `components/organisms/Marquee` › `MarqueePauseGroup` | El botón que pausa las cintas de testimonios y galería |

Las piezas de `site-chrome` (cursor, barra de progreso, WhatsApp flotante) son Server Components: las mueve el motor por atributos. `FaqAccordion` y `ContactForm` detectan la hidratación con el mismo patrón (`useSyncExternalStore` con un `subscribe` vacío); si aparece un tercer uso, se extrae a `utils/useHydrated.ts`.

### 4.5 Orientación a objetos — dónde y por qué

Los componentes de React son funciones (es el idioma de React; los componentes de clase están deprecados de hecho). La orientación a objetos está donde aporta:

| Dónde | Qué modela | Principios |
|---|---|---|
| `domain/` | Entidades y value objects: `Trip`, `TripDuration`, `Price`, `WhatsAppLink`, `Photo`, `ItineraryDay` (un día del cronograma, con o sin foto y stats), `Departure` (una salida: viaje + fecha) y `DepartureSchedule` (las salidas ordenadas, por mes y por viaje), `CalendarDate`, `Metric`, `ServiceChecklist`, `Guide`, `Testimonial`, `TripCatalog` | Encapsulamiento (campos `readonly`/privados), invariantes validadas en el constructor, comportamiento junto a los datos (`price.label()`, `whatsapp.href()`, `departure.rangeLabel()`), inmutabilidad |
| `motion/` | `MotionEngine` + una clase por efecto (`RevealEffect`, `ParallaxEffect`, `MarqueeEffect`, …) sobre clases base abstractas | Herencia y polimorfismo (el motor recorre `MotionEffect[]` sin saber cuál es cuál), responsabilidad única (un efecto = un atributo), abierto/cerrado (un efecto nuevo es una clase nueva registrada en la fábrica, sin tocar el loop), inyección de dependencias (el motor recibe sus efectos) |

Regla: **clase cuando hay comportamiento o invariantes; tipo plano cuando es solo dato** (un pilar con título y bajada es un tipo, no una clase).

### 4.6 Sin strings mágicos

- IDs de sección y anclas → `constants/sections.ts` (`anchorTo('trips')` dentro del home, `homeAnchorTo('trips')` desde cualquier página, `tripAnchorTo('schedule')` en la página de un viaje).
- Rutas de páginas → `constants/routes.ts` (`ROUTES.home`, `tripPath(slug)`).
- Marca, teléfono, mail de contacto, redes → `constants/site.ts`. URL pública → `constants/siteUrl.ts` (`SITE_URL`, §10).
- Rutas de imágenes → `constants/assets.ts` + `content/media.ts`.
- Atributos de links externos → `constants/links.ts` (`EXTERNAL_LINK_PROPS`).
- Atributos de animación → helpers de `motion/attributes.ts`.
- **Todo texto visible → `content/`.** Ningún texto de UI inline en JSX (tampoco `aria-label` ni `alt`).

### 4.7 Contenido

`content/` es la única fuente de lo que se lee en pantalla. Cada sección tiene su slice (`content/sections/trips.ts`) con su tipo exportado (`TripsContent`), y `content/index.ts` los junta en `landingContent`. `Landing.tsx` le pasa **a cada sección solo su slice**, como Kora hace con los diccionarios: una sección no puede leer texto que no le corresponde. La página de cada viaje recibe su `TripDetailContent` de `content/trips/` (`findTripDetail(slug)`): un archivo por viaje, armado con los builders de `content/trips/common.ts`. `tripDetails` es un `Record<TripSlug, …>`, así que un viaje nuevo en el catálogo no compila sin su página.

Los datos con comportamiento son **instancias del dominio** (`tripCatalog`, `departureSchedule`, `PHOTOS`, `whatsapp`). Si mañana los viajes vienen de un CMS o una API, se reemplaza el módulo de `content/` por un servicio que devuelva **las mismas clases**, y ningún componente se entera.

Un solo idioma: **español rioplatense** (`es-AR`). Si se suma otro, se sigue el patrón de Kora (`app/[locale]/`, diccionarios tipados contra el español) convirtiendo `landingContent` en `getLandingContent(locale)`.

---

## 5. Design system (CSS3)

Vive en `src/design-system/` y es la **única** fuente de valores visuales. **Cero hexcodes en componentes.**

| Archivo | Qué tiene |
|---|---|
| `tokens.css` | `:root` con todas las custom properties: colores + rampas 100–900 (`--color-accent-*`, `--color-accent-2-*`, `--color-neutral-*`), fuentes, espaciados, radios, sombras (incluido `--shadow-focus-gap`, el aro crema del foco), curvas de easing, capas (`--z-*`), layout (`--layout-max`, `--layout-gutter`, `--section-space`: 88–176 px, más que los 80–140 del diseño por pedido del cliente). Se apartan del design system `--color-accent-600` (§9.2) y `--color-paper`, el blanco cálido de las hojas de las cortinas (§9.6) |
| `base.css` | Reset y estilos de elementos (`html`, `body`, `h1`–`h6`, `a`, `figcaption`, `:focus-visible`, `::selection`) — todo dentro de `:where()` para que tenga especificidad 0 y cualquier módulo lo pise. El `<html>` lleva `overflow-x: clip` y `scroll-padding-top` (§9) |
| `intro.css` | Sostiene las piezas de la intro del hero (`[data-reveal='word']`, `[data-reveal-intro]`) en su pose de arranque entre el primer pintado y el primer frame del motor (`data-intro-controlled`), con un failsafe de 6 s. Solo con `scripting: enabled` y sin reduced motion (§6.2) |
| `print.css` | Hoja de impresión (`@media print`): la variante print del diseño sobre la landing actual (§9.5). Selectores por atributos del motor, ARIA y estructura, nunca clases de módulo; `!important` para pisar los estilos inline que deja el motor |
| `fonts.ts` | `next/font/google`: expone `--font-dm-serif` y `--font-lexend`, que `tokens.css` usa en `--font-heading`/`--font-body` |
| `tokens/motion.ts` | Tokens del motor: niveles de intensidad, duración de la intro, ventana de asentamiento, suavizados, radios del imán… |
| `README.md` | Cómo consumir, cómo repintar, la intro y cómo se imprime |

Convenciones de CSS:

- **CSS Modules** (`*.module.css`), clases en camelCase (`.tripCard`, `.tripCardMedia`). Nada de estilos globales fuera de `design-system/`.
- **Las reglas globales van dentro de `:where()`.** Los módulos le ganan a `base.css` por especificidad, no por orden de carga: en el build de producción la hoja global carga **después** que la de los módulos, así que una regla global nueva sin `:where()` le ganaría a una clase de módulo.
- Colores, fuentes, radios, sombras, easings y z-index **solo con `var(--…)`**. Tamaños de texto y medidas puntuales del diseño (p. ej. `clamp(40px, 5vw, 72px)`) pueden ir literales en el módulo que los usa.
- **Nada de `style={{…}}`** salvo para pasar un valor dinámico como custom property (`--photo-ratio` de las fotos del cronograma, `--trip-open` de los paneles del abanico de viajes; `--nav-solid` y `--cover-top` los escribe el motor) o el `objectPosition` de una foto que viene del contenido.
- Un solo breakpoint de ancho, el del diseño: **`@media (max-width: 820px)`** (nav sin links, grillas partidas a una columna, sticky desactivado). No hay cortes por alto. Las demás consultas son de capacidad, no de tamaño: `scripting` (lo que cambia sin JS), `hover: hover`, `forced-colors: active`, `prefers-reduced-motion` y `print`.
- `.washed` del design system → atom `WashedImage` (desatura y aclara las fotos para que se asienten sobre el crema).
- Estados interactivos del design system: hover y pressed desde la rampa de acento, foco `2px solid var(--color-accent)` con `:focus-visible`, deshabilitado al 45%. Los botones le suman al foco el aro crema `--shadow-focus-gap`, y sobre foto el anillo va del color del texto (§9.2).
- El botón tiene el efecto de la marca: **relleno verde musgo que avanza de izquierda a derecha en 2,5 s** (`::before` con `scaleX`), sin desplazamiento.
- **Impresión:** lo general va en `print.css`; lo propio de un componente, en un `@media print` de su módulo (el hero, su cinta, el botón que pausa las cintas, el abanico de viajes, el acordeón de la FAQ, Contacto).

---

## 6. Animaciones — el motor (`src/motion/`)

Port fiel, a TypeScript orientado a objetos, del motor del diseño (`docs/design/hoy-estoy-ooh-landing.dc.html`, script al pie). **Un solo loop de `requestAnimationFrame`** para toda la página; los elementos se enganchan por atributos `data-*`. El detalle (diagrama del frame, tabla de efectos, decisiones y diferencias con el original) está en `src/motion/README.md`.

Por pedido del cliente (octubre 2026, §9.6) se sacaron el telón de entrada (`CurtainController`), el scroll horizontal fijado de Próximos viajes (`HorizontalScrollEffect`), las cards apilables de Lolog (`StackEffect`), el efecto `data-skew` (`SkewEffect`) y el `data-drift` (`DriftEffect`). Lo que queda es el motor del diseño, con la intro arrancando al hidratar.

### 6.1 Piezas

| Pieza | Responsabilidad |
|---|---|
| `attributes.ts` | Contrato marcado ↔ motor: nombres de atributos (`MOTION_ATTRIBUTES`), atributos de estado que el motor pone en `<html>` (`MOTION_STATE`: `data-cursor-active`, `data-intro-controlled`) y helpers tipados (`reveal()`, `parallax()`, `marquee()`, `marqueePause()`, `timelineFill()`, `counter()`, `tilt()`, `backgroundShift()`, …) |
| `core/MotionEngine` | El loop: estado del frame, fases (lectura → `tick` → escritura), firma y ventana de asentamiento (`SETTLE_MS`), re-escaneo del DOM cuando cambia, alta/baja de listeners, arranque de la intro en el primer frame (y `data-intro-controlled` al terminarlo), frame final al imprimir (`beforeprint`/`afterprint`) |
| `core/MotionEffect` | Clases base abstractas: `FrameEffect` (corre cada frame), `ScrollEffect` (mide y escribe solo en los frames que tocan layout), `PointerEffect` (reacciona al puntero) |
| `core/StyleWriter` | Escribe un estilo solo si cambió (evita recalcular estilos en cada frame) |
| `core/ScrollTracker` · `PointerTracker` · `IntroClock` | Scroll + velocidad suavizada · posición del mouse · progreso 0→1 de la intro (arranca en el primer frame del motor) |
| `effects/*` | Un efecto por atributo: reveal, parallax, marquee, timeline, counter, tilt, magnet, background shift, scroll progress, cursor, nav (`NavBarEffect`) y cortina (`CoverPairEffect`) |
| `math/*` | Funciones puras (clamp, easing, avance y transformaciones de cada reveal, formato de los contadores) — con tests |
| `react/MotionRuntime` | Componente cliente que crea el motor al montar y lo destruye al desmontar. No renderiza nada |

### 6.2 Reglas

- **Nada de animación inline en el JSX** ni `useEffect` sueltos que animen: todo pasa por atributos + motor.
- **Lectura, después escritura.** En cada frame el motor primero mide todo (`getBoundingClientRect`, `scrollHeight`), después corre los `tick` (imanes → cursor → cintas: el imán, el único que lee layout, va primero) y al final escribe todo. Mezclarlos fuerza layouts síncronos. El original corría el cursor y las cintas antes de medir; el orden nuevo cambia cuándo se lee, no ningún valor.
- **Solo se mide cuando hace falta.** Un frame mide y escribe si cambió la firma de layout (scroll, viewport, intro, intensidad) o la velocidad redondeada, si hubo re-escaneo, o mientras siga abierta la **ventana de asentamiento**: `SETTLE_MS` (1100 ms, ≥ la transición más larga de los reveals; lo controla un test) desde el último cambio de layout. Un cambio de velocidad mide ese frame pero no extiende la ventana. Con la página quieta y la ventana cerrada, el frame es solo `tick`. Por qué existe la ventana: §9.4.
- **Transformaciones y opacidad** solamente (más `clip-path`/`filter` donde el diseño lo pide). Nunca `top`/`left`/`width` animados.
- **Los números viven en `design-system/tokens/motion.ts`** (intensidades, duración de la intro, ventana de asentamiento, suavizados, radio del imán). Las transformaciones de cada reveal están en `math/revealTransforms.ts`, que es la tabla de coreografías.
- **Intensidad** (la perilla "Animaciones" del diseño): `suave` 0.6 · `equilibrado` 1 · `exagerado` 1.8 (por defecto) · `apagado` 0. Se elige con `NEXT_PUBLIC_MOTION_LEVEL`, que Next fija en el build: cambiarla pide un build nuevo (o reiniciar `npm run dev`).
- **`prefers-reduced-motion: reduce` apaga el movimiento** (como `apagado`): los reveals quedan en su lugar, los contadores muestran el valor final, las cintas se frenan y la intro arranca terminada. Se decide en un solo lugar (`RESPECT_OS_REDUCED_MOTION` en `tokens/motion.ts`). El abanico de viajes y el acordeón de la FAQ lo respetan por su cuenta (sin transiciones).
- **La intro arranca al hidratar.** No hay telón: el motor arranca la intro en su primer frame y, al terminarlo (cada pieza ya con su pose inline), marca `<html data-intro-controlled>`. Hasta entonces `design-system/intro.css` sostiene las piezas de la intro (`[data-reveal='word']` en su máscara, `[data-reveal-intro]` en opacidad 0) para que no se vean enteras entre el primer pintado y la hidratación. Solo aplica con `scripting: enabled` y sin reduced motion, y tiene un failsafe de 6 s si el JS no llega. Con `NEXT_PUBLIC_MOTION_LEVEL=apagado` las piezas esperan igual a la hidratación (el CSS no conoce el nivel). Una pieza nueva con `reveal(…, { intro: true })` tiene que arrancar en opacidad 0 (todas las variantes menos `clip` y `expand`) o hay que sumarla a `intro.css`. En una navegación del cliente del home a un viaje la intro ya terminó: la portada aparece en su pose final, sin animar.
- **Impresión.** En `beforeprint` el motor marca que se imprime (el movimiento cuenta como apagado) y corre un frame **sincrónico**: cada efecto escribe su pose final y los contadores su valor final. No espera al próximo `requestAnimationFrame` porque el navegador arma la vista de impresión apenas termina de despachar el evento. En `afterprint` fuerza que el próximo frame mida y escriba aunque la firma no haya cambiado: todo vuelve al estado real del scroll. Lo cubren los tests de "impresión" de `core/MotionEngine.test.ts`; el resto de la hoja (piezas fijas, poses inline) lo resuelve `print.css`.
- **Lo que se escribe por el `StyleWriter` se resetea por el `StyleWriter`.** Si un efecto escribe una propiedad por la caché y la resetea directo (`style.transform = ''`), la caché se queda con la pose vieja y, al volver el movimiento (después de imprimir, o al apagar reduced motion), la misma pose recalculada no se reescribe.
- El estado por elemento va en `WeakMap`, no en propiedades pegadas al nodo (`el._x` del diseño).
- El motor re-escanea el DOM cuando entran o salen nodos (`MutationObserver`) y ante `resize`: un componente cliente que agrega o saca nodos no necesita avisarle nada. **No re-escanea por cambios de atributos**: lo que cambia en vivo con un atributo (la pausa de las cintas, `data-marquee-paused`) se consulta en cada frame. Tampoco mide si solo cambia el alto del documento (abrir una respuesta de la FAQ): los reveals de abajo se actualizan con el próximo scroll (§7).
- **Si un efecto depende de un corte del CSS, le pregunta al CSS** (el estilo computado) en vez de repetir el `@media`: el corte vive en un solo lugar, el módulo CSS.
- Un efecto que engancha listeners los suelta al re-escanear y en `dispose`.
- **Sin JS el sitio se lee entero**: `intro.css` no aplica, el cursor del sistema solo se oculta cuando el cursor custom está activo, los contadores se renderizan con su valor final (con JS, ese valor queda además en texto oculto para los lectores de pantalla, §9.2), los paneles del abanico se renderizan en el servidor con el link a cada viaje, la FAQ muestra todas las respuestas y el formulario de Contacto se envía como `mailto:`.

---

## 7. Estado de implementación

Las 13 secciones del diseño se portaron y se verificaron en el navegador (Chrome, con scripts de Puppeteer contra el dev server y contra el diseño): medidas en escritorio y mobile, teclado, árbol de accesibilidad y axe, alto contraste y reduced motion emulados, pantallas bajas y zoom, e impresión a PDF (25 hojas en Letter, como el print del diseño). Esa versión está publicada en Vercel.

En octubre de 2026 el cliente pidió reestructurar el sitio (§9.6): home con información general y una página por viaje. Estado después de la reestructuración: el build prerenderiza `/` y las cuatro páginas de viaje (`/viajes/calle-stepanek`, `/viajes/lago-lolog-laguna-verde`, `/viajes/laguna-negra`, `/viajes/cajon-del-azul`), que responden 200, y cualquier otro slug da 404. Se miraron en el navegador a 1440, 1280, 375 y 320 px, sin scroll horizontal. Lo nuevo **no** se volvió a pasar por axe ni por un lector de pantalla, y no se imprimió a PDF. La columna "Pendiente" lista lo que quedó para decidir o mirar.

**Home** (`features/landing/Landing.tsx`, en este orden):

| Sección | Feature | Estado | Pendiente |
|---|---|---|---|
| Cursor, barra de progreso, WhatsApp flotante, "Saltar al contenido", footer | `site-chrome` · `app/layout` · `contact` (`SiteFooter`) | ✅ | Después de "Saltar al contenido" el foco queda en `body` (el `<main>` no es enfocable). El Tab siguiente sigue desde el contenido; falta probarlo con un lector de pantalla |
| Nav: Viajes · Calendario · Quiénes somos · Preguntas frecuentes + "Escribinos" | `components/organisms/Navbar` | ✅ | **En mobile (≤ 820 px) los links se ocultan y no hay menú**: queda la marca y "Escribinos". Falta decidir un menú |
| Hero + cinta | `hero` | ✅ | Falta mirar la carga en un navegador visible, con el panel al frente, para confirmar que la intro no parpadea |
| Por qué viajar con nosotros | `why-us` | ✅ | |
| Viajes (abanico) | `trips` | ✅ | Se revisó en capturas a 1440, 1900 y 390 px. Falta probarlo en un teléfono real (toques) y con lector de pantalla |
| Calendario | `calendar` | ✅ | **Fechas de ejemplo** (`content/catalog/departures.ts`, cada una con `[completar]`) y un aviso visible que lo dice (`placeholderNote` en `content/sections/calendar.ts`): se borra al cargar las salidas reales. Si no hay salidas, la línea de tiempo queda vacía (no hay texto para ese caso) |
| ¿Quiénes somos? (solo Lucas) | `team` | ✅ | Al imprimir, si el guía salta de hoja, el aro de su avatar deja un arco de ~2 px al pie de la hoja anterior (Chromium) |
| Testimonios | `testimonials` | ✅ | |
| Galería | `gallery` | ✅ | |
| Preguntas frecuentes | `faq` | ✅ | **8 de las 12 respuestas empiezan con `[confirmar]`** y se ven así en la página (equipo, reserva y seña, medios de pago, clima y reprogramación, cancelación, edad mínima, condición médica, precios): cada una tiene arriba un comentario con lo que falta. Al abrir o cerrar una respuesta sin scrollear, los reveals de más abajo no se actualizan hasta el próximo scroll (la firma del frame no incluye el alto del documento, §6.2). Falta probar el acordeón con un lector de pantalla, y en Safari si al entrar por `/#contacto` la página salta cuando la FAQ se colapsa al hidratar |
| Contacto (+ formulario) | `contact` | ✅ | |

**Páginas de viaje** (`app/viajes/[slug]` + `features/trip-detail`):

| Viaje | Estado | Pendiente |
|---|---|---|
| Calle & Stepanek | ✅ | Las fechas de "Próximas salidas" son las de ejemplo del calendario, y en la página nada dice que lo son |
| Lago Lolog a Laguna Verde | ✅ | Igual que Calle (fechas de ejemplo). El precio es "a consultar" |
| Laguna Negra | Parcial | **Falta el itinerario**: muestra "Itinerario próximamente" con el botón de WhatsApp. Tampoco tiene texto de presentación, "¿Puedo?", qué incluye, pensión ni precio: solo los datos del catálogo |
| Cajón del Azul | Parcial | Igual que Laguna Negra |

Además, en las páginas de viaje no se revisó la impresión.

Fuera de las secciones:

- **Assets (pedido al cliente).** Las fotos de los platos (196 px) y de Lucas (216 px) y el logo (PNG de 149×172; el fondo gris del original se volvió transparente con un relleno desde los bordes, pero sigue siendo chico) son los únicos originales que hay, y agrandarlos no agrega detalle. Hacen falta platos y retrato de ≥ 440 px, y el logo en SVG o en PNG transparente de ≥ 360 px.
- **Deploy.** Cargar `NEXT_PUBLIC_APP_URL=https://<dominio>` en las variables de Production de Vercel (o confirmar que `VERCEL_PROJECT_PRODUCTION_URL` es el dominio correcto) y revisar en el deploy el `<head>` (canonical, `og:url`, `og:image`) del home y de una página de viaje, `/robots.txt` y `/sitemap.xml` (§10).

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

Lo que se aparta del diseño a propósito, agrupado por motivo. Todo lo que no figura acá (copys, medidas, fórmulas y números del motor) es el diseño tal cual. §9.1–§9.5 son mejoras propias sobre las piezas del diseño; §9.6 es la reestructuración que pidió el cliente en octubre de 2026, que saca secciones y piezas del motor y suma páginas y secciones que el diseño no tiene.

### 9.1 Estructura y marcado

- El HTML exportado tiene **tres `<main>`**; acá hay uno por página (el home y cada viaje) y las secciones se contienen con `Container`.
- **El footer es hermano del `<main>`**, no parte de la sección 13 como en el diseño: así es el `contentinfo` de la página. Lo monta el layout (`SiteFooter`, de `features/contact`), igual en el home y en cada viaje. El padding de abajo de la sección y su `margin-top` pasan a ser el padding del footer. Lleva su propio fondo verde oscuro (el mismo al que cambia la página en el cierre) y su propio `backgroundShift`: con JS no se nota la diferencia y sin JS el texto claro sigue siendo legible.
- El WhatsApp flotante va al final del DOM (orden de tabulación), no con el resto de las piezas fijas, y dentro de un `<aside>` con nombre ("Contacto rápido"), así no queda fuera de todo landmark.
- **Semántica.** Donde el diseño apila `div`s, acá hay listas (`ol` en las líneas de tiempo —el cronograma de cada viaje y el calendario—; `ul` en pilares, cards de viajes, tags, stats, platos, guías y las cintas de testimonios y galería; `dl` en los datos de "¿Puedo?") y los títulos siguen una jerarquía sin saltos. En el home: `h1` › `h2` por sección › `h3` (pilares, cards de viaje, meses del calendario, preguntas de la FAQ, título del formulario) › `h4` (salidas del calendario). En la página de un viaje: `h1` (portada) › `h2` por bloque, "¿Puedo?" y "¿Es para mí?" incluidos › `h3` (días del cronograma, "Itinerario próximamente", grupos de "¿Qué incluye?"). En el diseño los pilares y los grupos de Servicios son `h4`, "¿Puedo?"/"¿Es para mí?" `h3` y las etapas de Lolog un `div`; el tamaño visual es el del diseño. Las secciones toman su nombre del `h2` (`aria-labelledby`); en el cierre de cada viaje el precio va antes del título, y así la navegación por landmarks entra antes del precio. Los CTA que se repiten para destinos distintos ("Ver detalles" en las cards, "Ver viaje" en el calendario) suman el nombre del viaje en texto oculto visualmente (`VisuallyHidden`); el texto visible va primero ("label in name", WCAG 2.5.3).
- Las copias duplicadas de las cintas (marquees) van con `aria-hidden` para que los lectores de pantalla no lean todo dos veces.
- **Textos alternativos**: las cards de viaje, las fotos del cronograma de Lolog y la galería llevan el alt descriptivo de `PHOTOS` (en el diseño, el nombre del viaje o del tramo —que ya es el título de al lado, y el lector de pantalla lo leería dos veces— y `alt=""` en la galería). La foto del equipo y los platos de la pensión van con `alt=""`: el link del guía ya dice nombre, rol y usuario, y el `figcaption` ya nombra la comida. El logo del nav también va con `alt=""`: el link ya dice la marca al lado.
- Los links externos llevan `rel="noopener noreferrer"` (el diseño pone solo `noopener`), desde un solo lugar: `EXTERNAL_LINK_PROPS` en `constants/links.ts`. El hover del avatar del equipo también responde a `:focus-visible`.
- El motor del diseño trae un carrusel de testimonios por intervalo (`tRef`, `goT`, `tDots`) que el marcado no usa: los testimonios son una cinta. No se portó.
- El anillo del cursor (`data-cursor`) está oculto de forma permanente en el diseño; se portó solo el cursor montaña.

### 9.2 Accesibilidad

- El diseño oculta el cursor del sistema con CSS siempre que haya `pointer: fine`; acá solo se oculta cuando el cursor custom efectivamente está andando (si falla el JS, no te quedás sin cursor).
- **El foco no queda debajo del nav.** El `<html>` lleva `scroll-padding-top` (alto del nav + `--space-4`) en lugar del `scroll-margin-top` de cada sección: con Shift+Tab, un control enfocado quedaba entero debajo del nav sticky (WCAG 2.4.11). Vale para el foco y para los saltos por ancla.
- **Foco visible sobre fondos oscuros y fotos.** Los botones suman al anillo dorado del design system un aro crema de 2 px en el hueco del `outline-offset` (`--shadow-focus-gap`). Sobre crema no se nota, y sobre el verde del cierre da 9,7:1 (el dorado solo, 2,7:1). Sobre la foto del hero y de la portada de cada viaje, y en el WhatsApp flotante, el anillo es del color del texto, con el mismo aro crema, para que contraste sobre cualquier fondo (WCAG 1.4.11).
- **Contraste AA del acento.** `--color-accent-600` es #886130 y no #8c6433 como en el design system: el texto crema de los botones primarios daba 4,46:1, debajo de AA para 14–17 px.
- **Contraste AA en textos.** Algunos textos se oscurecen un paso para llegar a AA. El texto de los tags outline pasa a accent-700. Los `figcaption` (epígrafes de Pensión y pie de los testimonios) pasan a neutral-700 en vez del texto al 55%, y la nota al pie de Pensión también a neutral-700. El "Calle &" del título pasa a accent en vez de accent-500. En el diseño daban entre 2,8:1 y 3,9:1.
- El CTA secundario del hero lleva la misma sombra de texto que la bajada: cae donde el degradé vuelve al crema y el texto crema se perdía contra la foto.
- **Contadores accesibles.** Los contadores animados (stats y precio del cierre de cada viaje) van con `aria-hidden`, y el valor final se expone en texto oculto visualmente (`VisuallyHidden`). El motor pone el número en 0 al cargar y lo sube al entrar en pantalla, y un lector de pantalla leía "$0.000" o un valor intermedio.
- **Cintas pausables.** Las cintas de testimonios y de la galería tienen un botón para pausarlas y se frenan también con el foco adentro (WCAG 2.2.2). En el diseño solo se frenan con el mouse encima. La cinta del hero, decorativa y con `aria-hidden`, no lo lleva. El botón es un componente cliente (`MarqueePauseGroup`) que marca `data-marquee-paused`, y el motor lo respeta igual que el hover. La velocidad sigue siendo por frame, como en el original.

### 9.3 Mobile y zoom

- **Mobile legible.** El diseño fija varios textos en una línea (`white-space: nowrap`) con tamaños en `vw` (`min(72px, 5.3vw)` en el `h1`, `min(19px, 2.4vw)` en la bajada del hero, `min(48px, 3.3vw)` en títulos). En escritorio se ven como en el diseño; a 375 px darían un `h1` de 20 px y una bajada de 9 px. Regla: **en `@media (max-width: 820px)` esos textos pasan a `white-space: normal` con un piso legible** — `h1` ≥ 34 px, `h2` ≥ 30 px, bajadas y párrafos ≥ 16 px. Por encima de 820 px, el diseño manda tal cual. Los pisos se eligen para empalmar con el valor de escritorio en 820 px (`max(30px, 4.4vw)`, `max(34px, 5.3vw)`), así el cambio de breakpoint no se nota. Más casos: el CTA del cierre de cada viaje también parte en renglones (a 375 px el botón `nowrap` no entra en la tarjeta y el `overflow: hidden` lo cortaría); los números de las stats de cada viaje **siguen** en una línea (ya tienen piso de 30 px, y partidos dejarían la "m" sola), pero las stats pasan de renglón cuando no entran (debajo de ~330 px). Algunas grillas usan `minmax(0, 1fr)` o `minmax(min(300px, 100%), 1fr)` en vez de `1fr`/`300px` para no desbordar debajo de 340 px; por encima son idénticas al diseño.
- **Titular del hero en mobile.** En el diseño cada renglón del `h1` es una fila flex propia; a ≤ 820 px, con el piso de 34 px, cada uno partía por su cuenta ("…en la / montaña / para reconectar con lo / esencial."). Acá, debajo de 820 px, los renglones pasan a `display: contents` y el `h1` es un `flex-wrap` con el mismo `column-gap: .24em`: la frase fluye como un solo párrafo. Cada palabra conserva su máscara, su `reveal('word')` y su escalón. En escritorio, los dos renglones del diseño.
- **El documento no se ensancha en mobile.** En el diseño el `overflow-x: clip` va solo en el `body` (`dc.html:15`); se propaga al viewport y deja de recortar. Los reveals corridos a la derecha (las líneas de tiempo, el link de la galería) ensanchaban el documento: en el diseño, un teléfono de 390 px pasaba a un viewport de layout de 543 px y el WhatsApp flotante quedaba fuera de pantalla. Acá el `html` también lleva `overflow-x: clip`.

### 9.4 Motor y rendimiento

- **Las cintas no saltan en cada vuelta.** El motor reinicia una cinta al recorrer medio `scrollWidth`; con `gap` entre ítems la mitad cae medio gap antes del comienzo de la copia, y en el diseño las cintas saltan 19 px (hero), 10 px (testimonios) y 7 px (galería) en cada vuelta. Cada riel suma `padding-inline-end` igual a su gap (en el hero, cada ítem lleva el espacio como padding). Es invisible: el padding queda siempre fuera de la pantalla. La regla está documentada en el organism `Marquee`.
- **Ventana de asentamiento del motor.** El motor del diseño solo mide y escribe cuando cambia la firma del frame (scroll, viewport, intro, intensidad, velocidad redondeada). Los contadores leen su posición mientras la transición del reveal que los contiene (hasta 1 s) todavía los desplaza, y al frenar el scroll quedaban trabados en un valor intermedio (en las stats de Lolog, "3 días / 2 noches" en vez de "4 / 3", igual en el diseño). Acá, después del último cambio de scroll, viewport, intro o intensidad, el motor sigue midiendo y escribiendo durante `SETTLE_MS` (1100 ms, ≥ el `clip-path` de 1 s de `REVEAL_TRANSITION`; lo controla un test) y recién después vuelve a ahorrar frames. La ventana la abren solo esos cambios: un cambio de velocidad mide ese frame pero no la extiende (si la extendiera, serían ~1,7 s de frames completos por scroll mientras la velocidad suavizada baja a 0). Las fórmulas y los números son los del diseño: lo único que cambia es que todo lo que lee posiciones termina en el valor del layout ya asentado (y el skew de las cintas por velocidad termina en 0 exacto en vez de ~0,1°).
- **Las cintas fuera de pantalla se frenan.** El motor del diseño movía todas las cintas en cada frame aunque no se vieran. Acá solo avanzan las que están en el viewport (con margen, `MARQUEE.visibilityMarginPx`), y al volver a entrar siguen desde donde quedaron. Con la página quieta y ninguna cinta a la vista, el trabajo del hilo principal baja a la mitad.

### 9.5 Impresión

- **Hoja de impresión** (`design-system/print.css`). Reproduce `hoy-estoy-ooh-landing-print.dc.html` sobre las páginas actuales, con estas diferencias: las fotos del cronograma de Lolog tienen un tope de 520 px de alto (también en pantalla) para que cada día entre en una hoja (en el print los días 1 y 4 se parten); los ítems de lista no se parten entre hojas; los testimonios van en la grilla del print pero son los siete de la cinta. El hero impreso es el de pantalla, con el alto de 560 px del print y sin la cinta; no se portaron el hero, las etiquetas ni los eyebrows numerados del print, que son de una versión anterior. El abanico de viajes todavía no se revisó impreso; la FAQ, con todas las respuestas abiertas; Contacto, sin el formulario (queda la alternativa, con el mail a la vista). El botón que pausa las cintas no se imprime. Las páginas de viaje no se imprimieron todavía (§7).
- **Los contadores se imprimen con su valor final.** En la landing del diseño, un contador al que no se llegó scrolleando se imprime en 0 ("$0.000", "0 km", "0 días"): su texto lo escribe el motor y CSS no lo puede corregir. Acá `MotionEngine` escucha `beforeprint` y corre un frame sincrónico con el movimiento apagado (cada efecto escribe su pose final y los contadores su valor final, como en el print del diseño, que corre con el motor en 0), y en `afterprint` vuelve al estado real en el próximo frame (§6.2).

### 9.6 Cambios pedidos por el cliente (octubre 2026)

El cliente pidió reestructurar el sitio: un home con la información general y una página por viaje con todo lo propio de cada uno. Lo que sigue se aparta del diseño por ese pedido. Las secciones y piezas nuevas no están en el diseño: siguen su lenguaje (design system Organic, mismos componentes y reveals).

**Estructura**

- **Home** (`/`), solo información general, en este orden: Hero (+ cinta) → Por qué viajar → Viajes → Calendario → Quiénes somos → Testimonios → Galería → Preguntas frecuentes → Contacto (+ formulario) → footer. Salieron del home las secciones del diseño 04 Calle & Stepanek, 05 ¿Puedo?/¿Es para mí?, 06 la banda "La montaña te espera.", 07 Lago Lolog, 08 Pensión completa y 09 Servicios y equipo: su contenido pasó a la página de cada viaje. La frase de la banda sobrevive como primer renglón del título del cierre de cada viaje.
- **Una página por viaje** (`/viajes/<slug>`, `tripPath()` de `constants/routes.ts`): se prerenderizan con `generateStaticParams` (`dynamicParams = false`: otro slug da 404) y cada una tiene su metadata (título con el template del layout, descripción, canonical, Open Graph y Twitter con la foto del viaje). Una sola plantilla, `features/trip-detail/TripDetail.tsx`, con este orden: **portada** (`h1`, foto a sangre con el parallax del hero, tags, "Consultar" y "Ver cronograma"), **Sobre el viaje** (stats con contador), **Cronograma** (siempre una línea de tiempo, `Timeline`; en Lolog con la foto de cada día), **¿Puedo? / ¿Es para mí?**, **¿Qué incluye y qué necesito?** (todos los grupos a la vista, sin pestañas), **Pensión completa**, **Próximas salidas** (`departureSchedule.forTrip`; no se muestra si no hay) y el **cierre** (sin precio: el título, una bajada que invita a consultar fechas y disponibilidad del viaje, y "Consultar por WhatsApp" con el mensaje "Hola! Quiero consultar por <viaje>"). Los copys de Calle & Stepanek y de Lolog se movieron tal cual. Laguna Negra y Cajón del Azul muestran los datos del catálogo y "Itinerario próximamente", con un botón a WhatsApp.
- Copys agregados para la plantilla (no están en el diseño; viven en `content/trips/common.ts`): "Sobre el viaje", "El viaje en números", "Datos del viaje", "Todos los viajes", "Ver cronograma", "Próximas salidas" y los epígrafes de stats "De travesía", "En refugio", "En la montaña" y "Cumbre más alta". La nota al pie de la pensión de Lolog pasa a "…No incluye día 0 ni la cena del día 4." (ya no hace falta decir "En Lago Lolog": está en su página).
- **Navbar**: Viajes · Calendario · Quiénes somos · Preguntas frecuentes + "Escribinos" (WhatsApp). Los links usan `homeAnchorTo()` (`/#viajes`), así andan también desde una página de viaje, y la marca lleva a `ROUTES.home`. `LinkButton` y los links del nav navegan con `next/link` cuando el `href` es una ruta del sitio (`isRouterHref`): las anclas `#…`, `mailto:` y los links externos siguen siendo `<a>`.

**Piezas que salieron**

- **Sin telón de carga.** La página carga directo y la intro del hero arranca al hidratar (el primer frame del motor). Para que las piezas de la intro no se vean enteras entre el primer pintado y la hidratación, `design-system/intro.css` las sostiene en su pose de arranque hasta que el motor marca `data-intro-controlled` (§6.2). Salieron `Curtain`, `CurtainController` y sus tokens (`--shadow-curtain-*`, `--ease-curtain`, `--z-curtain`).
- **Hero sin el texto calado** "Out Of Home". El resto queda como en el diseño: titular a la izquierda, bajada contra el borde derecho y botones centrados (en mobile, la bajada a la izquierda y los botones a lo ancho).
- **Próximos viajes sin scroll horizontal fijado** (`HorizontalScrollEffect` y su matemática): ahora es un abanico de paneles (abajo).
- **Lolog sin cards apilables** (`StackEffect`): su itinerario es la línea de tiempo del cronograma, con la foto de cada día debajo del texto (hasta 640 px de ancho y 520 px de alto). Los tags de cada día usan `day.statLabels()` ("12 km", "570 m desnivel") en vez de los prefijos "Distancia:" / "Desnivel:". La foto de Calle & Stepanek ya no va sticky al lado del texto: es la portada de su página.
- **Sin pestañas en Servicios**: cada viaje muestra su checklist completa.
- Salieron también `SkewEffect` (`data-skew`) y `DriftEffect` (`data-drift`), que solo usaban las secciones que se fueron. Las cintas conservan su skew por velocidad (es parte de `MarqueeEffect`).

**Secciones nuevas o cambiadas**

- **Por qué viajar**: las cuatro cards miden lo mismo (`grid-auto-rows: 1fr`), sin los números 01–04, con títulos un poco más grandes (`clamp(22px, 12cqi, 26px)`). Al no tener números, los pilares pasan de `ol` a `ul`.
- **Viajes (abanico)** (`features/trips`: `TripsFan` + `TripPanel`): encabezado partido —a la izquierda el título; a la derecha la bajada, tres datos genéricos (cantidad de travesías, "Mendoza y Patagonia", "Grupos chicos"), el contador "01 / 04" con una barra por viaje y las flechas—. Debajo, los viajes como paneles de foto que ocupan justo el ancho del contenedor: el abierto se ensancha y muestra destino, nombre, tags y "Ver detalles"; los cerrados quedan como franjas con el nombre en vertical y un "+". Se abre con el mouse, el foco, las flechas o un toque. En celular el abanico es vertical: el abierto alto y los demás como franjas. Sin precio (pedido del cliente). Reemplaza al carrusel de cards, que el cliente rechazó por descentrado.
- **Calendario** (`features/calendar`): encabezado centrado y, en escritorio, una línea de tiempo horizontal de lado a lado con los meses como marcas y cada salida como tarjeta debajo de su mes; en celular, vertical. Las salidas van agrupadas por mes (`h3` "Noviembre 2026"). Cada salida tiene un marcador de fecha de dos renglones ("13" / "nov") en el círculo de la línea —el lector de pantalla lee "13 de noviembre" (`departure.startLabel()`) y el `<time>` lleva la fecha ISO—, el nombre del viaje (`h4`), el rango de fechas, destino y duración como tags, y "Ver viaje" a su página. Las fechas son de ejemplo (§7).
- **Quiénes somos**: solo Lucas Chichizola, centrado. Las fotos de los otros tres guías se sacaron de `public/`.
- **Preguntas frecuentes** (`features/faq`), "sendero a la cumbre": banda de lado a lado con curvas de nivel de fondo (`ContourLines`), encabezado centrado y una sola columna de preguntas en tarjetas, con un sendero punteado a la izquierda y un mojón por pregunta; el final es la "cumbre" (`FaqSummit`) con el botón de WhatsApp. Es un acordeón (patrón Accordion de WAI-ARIA, componente cliente `FaqAccordion`). Abrir una pregunta cierra la otra y un clic en la abierta la cierra. El ícono (`Plus` de Lucide, trazo 2.75) gira a una cruz; la respuesta se abre con `grid-template-rows` 0fr→1fr y opacidad en 400 ms, sin transición con reduced motion. Base sin JS: el HTML del servidor (y el primer render de la hidratación) muestra cada pregunta como un `h3` con su respuesta a la vista, sin botones; recién al hidratar las preguntas pasan a botones y las respuestas se colapsan, y ese primer colapso no se anima. `role="region"` solo en el panel abierto (a lo sumo un landmark). Al imprimir van todas abiertas. El reveal escalona con `índice % 3`: con el índice crudo, la pregunta doce entraba 22% del viewport tarde.
- **Contacto**: formulario breve (nombre, viaje, mensaje) que arma un `mailto:` a `CONTACT_EMAIL` con asunto y cuerpo. Validación con `aria-invalid` y `aria-describedby`, y foco en el primer campo vacío; después de enviar, un mensaje en una región `role="status"`. Sin JS se envía igual (`action="mailto:…"`, `enctype="text/plain"`). WhatsApp y el mail quedan siempre a la vista como alternativa. En escritorio, dos columnas dentro del panel: título, bajada y alternativa a la izquierda, formulario a la derecha.
- **Fondo general de curvas de nivel** (`components/atoms/ContourLines`): el layout lo monta como una capa fija detrás de todo el sitio. Preguntas frecuentes ya no tiene franja propia: va sobre ese fondo. Contacto y el footer lo tapan con su verde.
- **Nav transparente sobre la foto** (`NavBarEffect`): el hero y la portada de cada viaje pasan por debajo del nav (`margin-top` negativo del alto del nav, `navOverlay()`). Arriba de todo el nav es transparente, con el texto crema; en los primeros 140 px de scroll (`NAV_OVERLAY`) se vuelve crema opaco. Sin el vidrio esmerilado del diseño: las curvas de nivel desenfocadas detrás del logo y los links se veían como manchas. El motor escribe `--nav-solid` (0→1) y el CSS mezcla todos los colores con ese número. Sin JS, o en una página sin foto de portada, el nav es sólido.
- **Cortinas** (`components/organisms/CoverPair` + `CoverPairEffect`): Por qué viajar, Calendario y Testimonios se quedan fijas y la sección siguiente (Viajes, Quiénes somos, Galería) sube como una hoja blanca y lisa (`--color-paper`, sin curvas de nivel), redondeada y con una sombra, y las tapa; las dos llevan abajo el aire entre secciones, así la hoja no corta el contenido de la fija ni termina pegada al suyo; mientras tanto, la fija se achica y se apaga un poco (`COVER`). Una sección más alta que la pantalla (el Calendario en un teléfono) se ve entera antes de fijarse (`--cover-top`, lo mide el motor). Sin JS, sin cortina. Con el movimiento apagado, la cortina queda pero la fija no se mueve.
- **Contacto a pantalla completa**: la sección pinta su propio verde (el de `CLOSING_BACKGROUND`) y mide al menos una pantalla, con la tarjeta centrada; el footer verde sigue abajo. Así no queda una franja crema arriba mientras el fondo de la página todavía no cambió.
- **Sin precios en el sitio** (pedido del cliente): ni en las cards ni en el cierre de los viajes. El dato sigue en el catálogo (`content/catalog/trips.ts`) sin mostrarse, por si vuelve.
- **Logo de WhatsApp** (`components/atoms/WhatsAppIcon`, con el trazo de `simple-icons`) en el botón flotante y en todos los botones que llevan a WhatsApp. Reemplaza al globito `ChatIcon`, que se borró.

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
