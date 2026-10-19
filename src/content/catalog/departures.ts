import { Departure, DepartureSchedule } from '@/domain';

import { tripCatalog } from './trips';

/**
 * El calendario de salidas: la línea de tiempo "Calendario" del home y las
 * próximas fechas de la página de cada viaje (`departureSchedule.forTrip(slug)`).
 *
 * **Son FECHAS DE EJEMPLO.** El cliente todavía no tiene el calendario de la
 * temporada: cada salida lleva `// [completar]` hasta que confirme la fecha
 * real. Solo se carga el día de salida; el de regreso sale de la duración del
 * viaje en el catálogo.
 *
 * El orden en que se cargan no importa: `DepartureSchedule` las ordena por
 * fecha y tira si el mismo viaje sale dos veces el mismo día.
 */
export const departureSchedule = new DepartureSchedule([
  // [completar] fecha de ejemplo.
  new Departure({ trip: tripCatalog.get('calle-stepanek'), startsOn: '2026-11-13' }),
  // [completar] fecha de ejemplo.
  new Departure({ trip: tripCatalog.get('lago-lolog-laguna-verde'), startsOn: '2026-12-05' }),
  // [completar] fecha de ejemplo.
  new Departure({ trip: tripCatalog.get('laguna-negra'), startsOn: '2027-01-09' }),
  // [completar] fecha de ejemplo.
  new Departure({ trip: tripCatalog.get('cajon-del-azul'), startsOn: '2027-02-06' }),
  // [completar] fecha de ejemplo.
  new Departure({ trip: tripCatalog.get('calle-stepanek'), startsOn: '2027-03-12' }),
]);

/**
 * Los tipos para leer el calendario desde un slice o un feature sin ir a
 * buscarlos al dominio: `departureSchedule.byMonth()` devuelve `DepartureMonth[]`.
 */
export type { Departure, DepartureMonth } from '@/domain';
