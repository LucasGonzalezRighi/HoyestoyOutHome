# Panel de administración

Panel de uso personal en **`/admin`** para editar el sitio sin tocar código. Lo pidió el cliente en octubre de 2026. Entra una sola persona, con su mail y su contraseña.

## Qué se edita

| Pantalla | Ruta | Qué cambia en el sitio |
|---|---|---|
| Inicio | `/admin` | Muestra dónde se está guardando, el último cambio y un acceso a cada pantalla |
| Viajes | `/admin/viajes` | Orden del abanico del home, mostrar/ocultar, borrar. **Nuevo viaje** arranca oculto |
| Editor de un viaje | `/admin/viajes/editar/<slug>` | Datos y foto, precio por persona y su nota (se ven al final de la página del viaje; sin precio, no se muestra), portada, "Sobre el viaje" y sus números, cronograma con fotos por día, "¿Puedo? / ¿Es para mí?", qué incluye y pensión |
| Salidas | `/admin/salidas` | Fechas del calendario del home y de cada página de viaje: viaje, día de salida, día de vuelta (sale de la duración del viaje, o se cambia a mano) y "Fecha a confirmar" (el sitio la muestra con la etiqueta "A confirmar"). Las que ya pasaron dejan de verse solas |
| Preguntas | `/admin/preguntas` | Preguntas frecuentes del home, en orden |
| Testimonios | `/admin/testimonios` | La cinta de testimonios |
| Textos del home | `/admin/textos` | Titular, bajada y cinta del hero, "Por qué viajar" y los títulos y bajadas de Viajes, Calendario, Testimonios, Preguntas y Contacto (incluido el aviso de "fechas de ejemplo") |

Quedan en el código (no se editan desde el panel): los mensajes de WhatsApp, la galería, el equipo, el footer, el nav y los textos fijos de la plantilla ("Cronograma", "Consultar"…).

Cada pantalla guarda con **Guardar cambios**. Antes de guardar se valida todo: si falta un dato o algo no se puede mostrar, el panel lo marca junto al campo (y en el editor de viajes, la pestaña) y **no guarda nada**. Así lo que se publica siempre se puede mostrar. El cambio se ve en el sitio enseguida.

## Cómo funciona

```
/admin (Server Actions) ──valida (zod + dominio)──▶ ContentStore ──▶ Postgres (Neon)
                                                         │               └ o .data/content.json en la compu
                                     updateTag('site-content')
                                                         ▼
sitio (/, /viajes/<slug>, sitemap) ◀── getSiteContent() ◀── caché de Next (unstable_cache, etiqueta site-content)
```

- **Un documento.** Todo el contenido editable es un JSON (`SiteRecord`, `src/content/records/schema.ts`) guardado en una fila de `site_content`, con número de versión. Cada pantalla cambia solo su parte sobre lo último guardado: dos pestañas que editan cosas distintas no se pisan. Cada versión anterior queda en `site_content_revisions` (las últimas 50), por si hay que volver atrás a mano.
- **Contenido inicial y respaldo.** `src/content/seed/` tiene el contenido inicial (lo que estaba en el código, con los cambios de copy que pidió el cliente). La caché del sitio lleva una huella de ese contenido: si se edita en el código, el sitio lo toma en el próximo deploy aunque nadie haya guardado nada. Es lo que se ve hasta el primer guardado, y lo que muestra el sitio si la base no responde o lo guardado no pasa la validación (el error queda en el log). El sitio nunca queda en blanco.
- **El sitio sigue siendo estático.** El home y las páginas de viaje se prerenderizan y se sirven cacheados; la base se consulta una vez y la caché se invalida al guardar. Además se rearman cada hora (`revalidate = 3600`) para que las salidas pasadas desaparezcan sin que nadie guarde nada.
- **Viajes nuevos.** Un viaje creado en el panel tiene su página la primera vez que alguien entra (`/viajes/<slug>`); un viaje oculto responde 404. Sin días de cronograma, la página muestra "Itinerario próximamente".
- **Fotos.** El navegador las achica antes de subirlas (lado mayor 2400 px, WebP o JPG) y el servidor revisa que sean JPG, PNG o WebP de verdad (por su contenido) y de hasta 4 MB. Van a Vercel Blob con un nombre único. Una foto reemplazada no se borra de Blob.
- **Las tablas se crean solas** la primera vez que se usa la base (`src/server/db/schema.ts`). No hay migraciones que correr.

## Seguridad

- La contraseña **no está en el código ni en el repo**: en la variable `ADMIN_PASSWORD_HASH` va un hash scrypt. Se genera con `npm run admin:credentials`, que la pide sin mostrarla.
- La sesión es una cookie `httpOnly`, `secure`, `sameSite: lax`, solo para `/admin`, con un JWT firmado (HS256) con `ADMIN_SESSION_SECRET`. Dura 7 días. Cambiar `ADMIN_EMAIL` o el secreto cierra todas las sesiones.
- `src/proxy.ts` manda a la pantalla de entrada a quien no tiene sesión, y **cada página y cada acción** lo vuelven a verificar (`requireAdmin()`): una Server Action se puede llamar sin pasar por la página.
- Intentos de entrada: 5 fallidos por IP o 30 en total en 15 minutos frenan la entrada (`LoginThrottle`, en la base). El error no dice si falló el mail o la contraseña.
- `/admin` no se indexa: `Disallow` en `robots.txt`, `noindex` en la metadata y `X-Robots-Tag` en el proxy.

## En la compu

```bash
npm run dev
```

Sin `DATABASE_URL` ni `BLOB_READ_WRITE_TOKEN`, el panel anda en **modo local**: el contenido se guarda en `.data/content.json` y las fotos en `public/uploads/` (las dos carpetas están fuera de git). Para volver al contenido inicial, se borra `.data/content.json`.

Las variables de entrada van en `.env.local` (ver `.env.example`):

```bash
npm run admin:credentials
```

Imprime `ADMIN_PASSWORD_HASH=…` y `ADMIN_SESSION_SECRET=…` para pegar en `.env.local` junto con `ADMIN_EMAIL=…`.

## Publicarlo en Vercel (una sola vez)

1. **Base de datos:** en vercel.com → el proyecto → **Storage** → **Create Database** → **Neon** → conectarla al proyecto (Production y Preview). Vercel crea `DATABASE_URL`.
2. **Fotos:** **Storage** → **Create** → **Blob** → conectarlo al proyecto. Vercel crea `BLOB_READ_WRITE_TOKEN`.
3. **Entrada al panel:** **Settings** → **Environment Variables** → cargar `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` y `ADMIN_SESSION_SECRET` (los dos últimos, de `npm run admin:credentials`; conviene un secreto distinto del de la compu).
4. Pushear (o **Redeploy**) para que el deploy tome las variables.
5. Entrar a `https://<dominio>/admin`. La primera vez el inicio dice "Todavía no se guardó nada": el sitio muestra el contenido inicial hasta el primer guardado.

Si falta la base, el sitio se ve igual (con el contenido inicial) y el panel avisa que no puede guardar. Si faltan las variables de entrada, la pantalla de entrada dice cuáles (sin mostrar valores).

## Dónde está el código

| Qué | Dónde |
|---|---|
| Rutas del panel | `src/app/admin/` (`login/` y `(panel)/`) |
| Pantallas, formularios y Server Actions | `src/features/admin/` |
| Textos del panel | `src/content/admin.ts` |
| Forma y validación del contenido | `src/content/records/` (`schema.ts`, `validate.ts`) |
| Contenido inicial | `src/content/seed/` |
| Cómo se arma el sitio con el contenido | `src/content/index.ts` (`buildSiteContent`) |
| Lectura para el sitio (caché) y para el panel | `src/server/content/` (`siteContent.ts`, `editableContent.ts`) |
| Dónde se guarda | `src/server/content/` (`PostgresContentStore`, `FileContentStore`) y `src/server/db/` |
| Fotos | `src/server/photos/`, `src/features/admin/resizePhoto.ts` |
| Entrada y sesión | `src/server/auth/`, `src/proxy.ts`, `scripts/admin-credentials.mjs` |

## Pendiente

- Probarlo contra Neon y Blob de verdad (los tests corren las consultas en un Postgres en memoria, PGlite; Blob no se probó).
- No hay pantalla para volver a una versión anterior: las versiones quedan en `site_content_revisions` y se restauran a mano.
- Las fotos reemplazadas o de viajes borrados quedan en Blob.
- No se probó con lector de pantalla ni en un teléfono real.
