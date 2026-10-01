# Hoy Estoy Out Of Home

Landing de **Hoy Estoy Out Of Home**: trekkings y ascensos guiados por Mendoza y la Patagonia. Una sola página con anclas; el contacto es por **WhatsApp** (no hay formulario, pagos ni backend).

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

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (puede correr con el dev andando: Next 16 escribe el dev en `.next/dev`) |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm run test` | Vitest: la lógica pura (dominio, motor de animación, URL pública) |
| `npm run check` | `type-check` + `lint` + `test` |
| `npm run format` | Prettier sobre `ts`, `tsx` y `css` de `src/` |

Antes de pushear: `npm run check` y `npm run build`. Vercel corre el build en cada push, y el build type-chequea todo el proyecto (tests y fixtures incluidos).

## Estructura

```
src/
├── app/              # layout, página, metadata, robots, sitemap, iconos
├── components/       # atoms / molecules / organisms (presentacionales)
├── constants/        # marca, URL pública, IDs de secciones, rutas de assets
├── content/          # todo el texto visible + las instancias del dominio
├── design-system/    # tokens.css, base.css, print.css, fuentes, tokens de movimiento
├── domain/           # clases del negocio (Trip, Price, WhatsAppLink…), con tests
├── features/         # una carpeta por sección de la landing (+ site-chrome)
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

Todos los valores visuales viven en `src/design-system/` (cero hexcodes fuera de `tokens.css`). Lo que se aparta del diseño a propósito (accesibilidad, mobile, rendimiento, impresión) está listado en `CLAUDE.md` §9.

Ver [`CLAUDE.md`](./CLAUDE.md) para la arquitectura completa y las convenciones.
