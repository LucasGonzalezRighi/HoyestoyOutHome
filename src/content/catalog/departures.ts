import type { DepartureRecord } from '@/content/records/schema';
import { Departure, DepartureSchedule, type TripCatalog } from '@/domain';

/**
 * Zona horaria del negocio: "hoy" es el día en Argentina, no en el servidor
 * (Vercel corre en UTC, y a las 22 h de Mendoza ya sería mañana).
 */
const BUSINESS_TIME_ZONE = 'America/Argentina/Buenos_Aires';

/**
 * La fecha de hoy en Argentina, `AAAA-MM-DD`. El formato `en-CA` es justo
 * ese (año-mes-día con ceros), así que no hace falta armarlo a mano.
 */
export function todayInBusinessTimeZone(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/**
 * El calendario de salidas: la línea de tiempo "Calendario" del home y las
 * próximas fechas de la página de cada viaje (`schedule.forTrip(slug)`).
 *
 * Deja afuera las salidas que ya pasaron (salen antes de `today`) y las de
 * viajes ocultos o borrados: así el calendario se limpia solo, sin que haya
 * que entrar al panel a borrar fechas viejas. El día de regreso, si no se
 * cargó a mano, sale de la duración del viaje en el catálogo.
 *
 * @param today `AAAA-MM-DD` (`todayInBusinessTimeZone()`). Es un parámetro
 *   para que los tests no dependan del reloj.
 */
export function buildDepartureSchedule(
  records: readonly DepartureRecord[],
  catalog: TripCatalog,
  today: string,
): DepartureSchedule {
  return new DepartureSchedule(
    records.flatMap((record) => {
      const trip = catalog.find(record.tripSlug);
      return trip && record.startsOn >= today
        ? [
            new Departure({
              trip,
              startsOn: record.startsOn,
              ...(record.endsOn ? { endsOn: record.endsOn } : {}),
              ...(record.toConfirm ? { toConfirm: true } : {}),
            }),
          ]
        : [];
    }),
  );
}

/**
 * Los tipos para leer el calendario desde un slice o un feature sin ir a
 * buscarlos al dominio: `schedule.byMonth()` devuelve `DepartureMonth[]`.
 */
export type { Departure, DepartureMonth, DepartureSchedule } from '@/domain';
