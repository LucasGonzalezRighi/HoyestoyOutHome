# Hoy Estoy Out Of Home

Sitio de **Hoy Estoy Out Of Home**: trekkings y ascensos guiados por Mendoza y la Patagonia. Un **home** con la información general (una sola página con anclas: viajes, calendario, quiénes somos, preguntas frecuentes, contacto…) y **una página por viaje** (`/viajes/<slug>`) con su cronograma, qué incluye, salidas y precio. El contacto es por **WhatsApp** y por un formulario breve que arma un `mailto:` (no hay pagos).

Tiene un **panel de administración** en `/admin` (una sola persona entra con su mail y contraseña) para editar los viajes y sus fotos, las fechas de salida, las preguntas frecuentes, los testimonios y los textos del home. El contenido se guarda en Postgres (Neon) y las fotos en Vercel Blob; en la compu anda sin conectar nada. Guía: [`docs/panel-admin.md`](docs/panel-admin.md).

Next.js 16 (App Router) · React 19 · TypeScript estricto · CSS Modules sobre un design system propio · motor de animación propio, orientado a objetos.

Se publica en Vercel con cada push a `main`: https://hoy-estoy-out-home.vercel.app/

## Arrancar

Hace falta **Node 22** (`engines.node` es `"22.x"`, la versión con la que se desarrolla y se testea; Next 16 pide ≥ 20.9).

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre en http://localhost:3000.

Las variables de `.env.example`:

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_APP_URL` | URL pública (canonical, Open Graph, `robots.txt`, `sitemap.xml`). En desarrollo se deja vacía. En Vercel, vacía, cae al dominio de producción del proyecto; fuera de Vercel es obligatoria en producción. |
| `NEXT_PUBLIC_MOTION_LEVEL` | Intensidad de las animaciones (ver [Animaciones](#animaciones)). |
| `DATABASE_URL` | Postgres (Neon) del panel. Vacía en la compu: el contenido va a `.data/content.json`. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob, para las fotos del panel. Vacía en la compu: van a `public/uploads/`. |
| `ADMIN_EMAIL` | El mail que puede entrar a `/admin`. |
| `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET` | Hash de la contraseña y secreto de la sesión: `npm run admin:credentials` los genera. |

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (puede correr con el dev andando: Next 16 escribe el dev en `.next/dev`) |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm run test` | Vitest: la lógica pura (dominio, motor de animación, URL pública, contenido y features) y el servidor del panel (consultas reales a Postgres en memoria con PGlite, sesión, contraseñas) |
| `npm run check` | `type-check` + `lint` + `test` |
| `npm run format` | Prettier sobre `ts`, `tsx` y `css` de `src/` |
| `npm run admin:credentials` | Genera `ADMIN_PASSWORD_HASH` y `ADMIN_SESSION_SECRET` (pide la contraseña sin mostrarla) |

Antes de pushear: `npm run check` y `npm run build`. Vercel corre el build en cada push, y el build type-chequea todo el proyecto (tests y fixtures incluidos).

## Estructura

```
src/
├── app/              # (site)/: home y páginas de viaje · admin/: el panel · metadata, robots, sitemap, iconos
├── components/       # atoms / molecules / organisms (presentacionales)
├── constants/        # marca, URL pública, rutas de páginas, IDs de secciones, rutas de assets
├── content/          # todo el texto visible, el contenido editable (records/, seed/) y cómo se arma el sitio
├── design-system/    # tokens.css, base.css, intro.css, print.css, fuentes, tokens de movimiento
├── domain/           # clases del negocio (Trip, Price, WhatsAppLink…), con tests
├── features/         # una carpeta por sección del home, la página de viaje (trip-detail), site-chrome y admin
├── server/           # solo servidor: dónde se guarda el contenido, fotos, sesión del panel
├── proxy.ts          # protege /admin (Next 16: el antiguo middleware)
├── motion/           # motor de animación (clases) + atributos data-*
└── utils/            # cn()
docs/design/          # el diseño exportado de Claude Design (no se compila)
```

Cada carpeta grande tiene su `README.md` (`design-system/`, `motion/`, `domain/`).

## Animaciones

Todas las animaciones las mueve un motor propio (`src/motion/`): un solo loop de `requestAnimationFrame` para toda la página, port fiel del motor que trae el diseño. Los componentes no importan el motor: marcan elementos con atributos `data-*` (`reveal()`, `parallax()`, `marquee()`…) y siguen siendo Server Components. Sin GSAP ni Framer Motion.

La intensidad se elige con `NEXT_PUBLIC_MOTION_LEVEL` (es la perilla "Animaciones" del diseño):

| Nivel | Multiplicador |
|---|---|
| `suave` | 0.6 |
| `equilibrado` | 1 |
| `exagerado` | 1.8 (por defecto) |
| `apagado` | 0: sin movimiento |

Next fija la variable en el build: para cambiarla hay que volver a buildear (o reiniciar `npm run dev`). Con `prefers-reduced-motion: reduce` el movimiento se apaga igual que en `apagado`.

## Diseño

El diseño —copys, paleta, tipografía y animaciones— está en **Claude Design** (archivo `Hoy Estoy OOH Landing.dc.html`, design system **Organic**). Una copia exportada vive en `docs/design/`: la landing con su motor original, la variante para imprimir y el design system.

Todos los valores visuales viven en `src/design-system/` (cero hexcodes fuera de `tokens.css`). El diseño es una landing única; en octubre de 2026 el cliente pidió separar el home de las páginas de viaje y sumar Calendario, Preguntas frecuentes y el formulario de Contacto. Lo que se aparta del diseño a propósito (accesibilidad, mobile, rendimiento, impresión y esa reestructuración) está listado en `CLAUDE.md` §9.

Ver [`CLAUDE.md`](./CLAUDE.md) para la arquitectura completa y las convenciones.
