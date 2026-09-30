/**
 * Formateo de cantidades en español rioplatense.
 *
 * La landing tiene un solo idioma, así que el locale está fijo acá y no se
 * inyecta (ver `README.md` del dominio: si se suma otro idioma, las clases
 * pasan a recibir un formateador por constructor).
 *
 * Tiene que ser `es-AR` y no `es` a secas: el español genérico de CLDR no
 * agrupa los números de cuatro cifras (`1900`), y el diseño muestra `1.900`
 * y `1.400 m desnivel`. Es el mismo valor que `SITE.locale`; se repite porque
 * el dominio no importa configuración de afuera.
 */
const LOCALE = 'es-AR';

/** Un `Intl.NumberFormat` por cantidad de decimales: crearlos es caro y se reusan. */
const numberFormats = new Map<number | 'auto', Intl.NumberFormat>();

const pluralRules = new Intl.PluralRules(LOCALE);

function numberFormat(fractionDigits?: number): Intl.NumberFormat {
  const key = fractionDigits ?? 'auto';
  let format = numberFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(
      LOCALE,
      fractionDigits === undefined
        ? {}
        : { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits },
    );
    numberFormats.set(key, format);
  }
  return format;
}

/**
 * Número con los separadores de es-AR: `1900` → `"1.900"`, `11.3` → `"11,3"`.
 *
 * @param fractionDigits Decimales fijos. Sin él se muestran los que tenga el
 *   número (hasta 3), sin ceros de relleno: `12` → `"12"`, no `"12,0"`.
 */
export function formatNumber(value: number, fractionDigits?: number): string {
  return numberFormat(fractionDigits).format(value);
}

/**
 * Cantidad con su palabra en singular o plural: `"1 noche"`, `"3 noches"`.
 *
 * Usa las reglas de plural de CLDR y no un `count === 1` a mano: en español
 * el `0` y los decimales van en plural (`"0 noches"`, `"1,5 hs"`), y las
 * reglas ya lo saben.
 */
export function formatCount(count: number, singular: string, plural: string): string {
  const word = pluralRules.select(count) === 'one' ? singular : plural;
  return `${formatNumber(count)} ${word}`;
}

/** Distancia en kilómetros: `24` → `"24 km"`, `11.3` → `"11,3 km"`. */
export function formatKilometers(kilometers: number): string {
  return `${formatNumber(kilometers)} km`;
}

/** Altura o desnivel en metros: `1400` → `"1.400 m"`. */
export function formatMeters(meters: number): string {
  return `${formatNumber(meters)} m`;
}
