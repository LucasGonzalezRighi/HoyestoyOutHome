import type { TripDetailContent } from '@/content/trips';

import { TripChecklist } from './components/TripChecklist';
import { TripClosing } from './components/TripClosing';
import { TripCover } from './components/TripCover';
import { TripDepartures } from './components/TripDepartures';
import { TripFit } from './components/TripFit';
import { TripMeals } from './components/TripMeals';
import { TripOverview } from './components/TripOverview';
import { TripSchedule } from './components/TripSchedule';

/** Props de `TripDetail`. */
export type TripDetailProps = {
  /** `tripDetails[slug]`: todo el contenido de la página del viaje. */
  content: TripDetailContent;
};

/**
 * La plantilla de la página de un viaje (`/viajes/<slug>`), la misma para los
 * cuatro. Compone los bloques en orden y le pasa a cada uno solo su parte del
 * contenido:
 *
 * 1. Portada (`<h1>`, tags, "Consultar" y "Ver cronograma").
 * 2. Sobre el viaje (presentación y stats con contador).
 * 3. Cronograma (línea de tiempo, o "Itinerario próximamente").
 * 4. ¿Puedo? / ¿Es para mí? — si el viaje lo tiene.
 * 5. ¿Qué incluye y qué necesito? — si el viaje lo tiene.
 * 6. Pensión completa — si el viaje lo tiene.
 * 7. Próximas salidas — si hay fechas en el calendario.
 * 8. Cierre: la invitación a consultar y el botón grande a WhatsApp.
 *
 * Bloques cortos con aire entre ellos, en vez de un texto largo: cada uno
 * responde una pregunta (qué es, cómo es cada día, si puedo, qué llevo,
 * cuándo sale, cómo consulto).
 *
 * No renderiza el `<main>`: lo pone la página (`app/viajes/[slug]/page.tsx`),
 * como el home. Server Component: todo el movimiento va por atributos.
 */
export function TripDetail({ content }: TripDetailProps) {
  const { cover, overview, schedule, fit, checklist, meals, departures, closing } = content;

  return (
    <>
      <TripCover content={cover} />
      <TripOverview content={overview} />
      <TripSchedule content={schedule} />
      {fit ? <TripFit content={fit} /> : null}
      {checklist ? <TripChecklist content={checklist} /> : null}
      {meals ? <TripMeals content={meals} /> : null}
      <TripDepartures content={departures} />
      <TripClosing content={closing} />
    </>
  );
}
