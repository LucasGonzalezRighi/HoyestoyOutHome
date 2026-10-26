/*
 * El contenido de la página de cada viaje (`/viajes/<slug>`). Lo arma
 * `buildTripDetail` con lo que se carga en el panel de administración; la
 * página lo pide con `getSiteContent().tripDetail(slug)` (`server/content/`).
 */
export { buildTripDetail } from './build';
export type * from './types';
