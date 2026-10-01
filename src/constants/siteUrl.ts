/**
 * URL pública del sitio: la base de todas las URLs absolutas (canonical,
 * `og:url`, `og:image`, `/robots.txt` y `/sitemap.xml`).
 *
 * Vive aparte de `site.ts` porque lee variables de entorno que solo existen
 * en el servidor (`VERCEL_*`): `site.ts` lo importan `content/` y el motor,
 * que también corren en el cliente. Este módulo lo importan solo
 * `app/layout.tsx`, `app/robots.ts` y `app/sitemap.ts`.
 *
 * No lleva `import 'server-only'`: ese paquete lo resuelve Next por dentro,
 * pero Vitest no, y `siteUrl.test.ts` importa este módulo.
 */

/** URL de desarrollo: la que queda si no hay ninguna variable cargada. */
const DEVELOPMENT_SITE_URL = 'http://localhost:3000';

/** Hostnames que solo andan en la máquina de quien hace el build. */
const LOCAL_HOSTNAMES: ReadonlySet<string> = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * El entorno que recibe `resolveSiteUrl`: `process.env` con las tres
 * variables que deciden la URL a la vista. Los tests pasan un objeto chico.
 */
export type SiteUrlEnv = {
  /** URL pública cargada a mano (`https://dominio`). Gana siempre que no esté vacía. */
  readonly NEXT_PUBLIC_APP_URL?: string;
  /** Dominio de producción del proyecto en Vercel, sin protocolo. Vercel la define sola. */
  readonly VERCEL_PROJECT_PRODUCTION_URL?: string;
  /** Entorno del deploy en Vercel: `production`, `preview` o `development`. */
  readonly VERCEL_ENV?: string;
  /** El resto de `process.env`, que se ignora (con esto, `process.env` entra tal cual). */
  readonly [name: string]: string | undefined;
};

/** `undefined` si la variable no está o es solo espacios (`NEXT_PUBLIC_APP_URL=` en un `.env`). */
function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function isLocalHostname(hostname: string): boolean {
  return LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost');
}

/** `new URL` con un mensaje que dice qué variable revisar (el de la plataforma es solo "Invalid URL"). */
function parseUrl(raw: string, source: string): URL {
  try {
    return new URL(raw);
  } catch {
    throw new Error(`${source} no es una URL absoluta: "${raw}". Tiene que ser "https://dominio".`);
  }
}

/** El orden de resolución, sin validar el resultado (lo valida `resolveSiteUrl`). */
function pickSiteUrl(env: SiteUrlEnv): URL {
  const explicit = nonEmpty(env.NEXT_PUBLIC_APP_URL);
  if (explicit) return parseUrl(explicit, 'NEXT_PUBLIC_APP_URL');

  const vercelHost = nonEmpty(env.VERCEL_PROJECT_PRODUCTION_URL);
  if (vercelHost) return parseUrl(`https://${vercelHost}`, 'VERCEL_PROJECT_PRODUCTION_URL');

  return new URL(DEVELOPMENT_SITE_URL);
}

/**
 * Decide la URL pública a partir de las variables de entorno. Función pura:
 * recibe el entorno en vez de leer `process.env`, así se testea con entornos
 * falsos.
 *
 * Orden:
 * 1. `NEXT_PUBLIC_APP_URL`, si no está vacía (dominio propio, o cualquier
 *    deploy fuera de Vercel).
 * 2. `https://${VERCEL_PROJECT_PRODUCTION_URL}`: en Vercel siempre está, también
 *    en los previews, así el canonical de un preview apunta a producción y no
 *    a sí mismo.
 * 3. `http://localhost:3000`: desarrollo y `npm run build` local sin `.env`.
 *
 * Tira solo si es un deploy de **producción en Vercel** (`VERCEL_ENV`) y la URL
 * cae en localhost: es exactamente el bug que publicó el canonical, Open Graph,
 * robots y sitemap apuntando a `http://localhost:3000`. No se mira
 * `NODE_ENV === 'production'`, porque ese también vale en un `npm run build`
 * local, que tiene que seguir andando sin variables.
 *
 * @throws Si la URL elegida no es absoluta, o si en producción de Vercel apunta a localhost.
 */
export function resolveSiteUrl(env: SiteUrlEnv): URL {
  const url = pickSiteUrl(env);

  if (env.VERCEL_ENV === 'production' && isLocalHostname(url.hostname)) {
    throw new Error(
      `La URL pública del sitio es ${url.origin} en un deploy de producción de Vercel: ` +
        'el canonical, Open Graph, robots.txt y sitemap.xml saldrían apuntando a localhost. ' +
        'Cargá NEXT_PUBLIC_APP_URL=https://<dominio> en las variables de Production de Vercel ' +
        '(o vaciala para que se use VERCEL_PROJECT_PRODUCTION_URL).',
    );
  }

  return url;
}

/**
 * URL pública del sitio, resuelta una vez al cargar el módulo (en el build,
 * al prerenderizar). La usan `metadataBase` del layout, `robots.ts` y
 * `sitemap.ts`: vive en un solo lugar para que las tres coincidan.
 *
 * Solo servidor: en el cliente `process.env` no trae las variables `VERCEL_*`.
 */
export const SITE_URL = resolveSiteUrl(process.env);
