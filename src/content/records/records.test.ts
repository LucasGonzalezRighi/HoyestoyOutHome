import { describe, expect, it } from 'vitest';

import { buildSiteContent } from '@/content';
import { todayInBusinessTimeZone } from '@/content/catalog/departures';
import { SEED_RECORD } from '@/content/seed';

import { siteRecordSchema, type SiteRecord, type TripRecord } from './schema';
import { validateSiteRecord } from './validate';

/** Un "hoy" anterior a todas las salidas de ejemplo. */
const TODAY = '2026-10-01';

/** Una copia del contenido inicial para modificar en cada prueba. */
function seed(): SiteRecord {
  return structuredClone(SEED_RECORD);
}

/** El primer viaje de una copia (tira si no hay, para no usar `!`). */
function firstTrip(record: SiteRecord): TripRecord {
  const trip = record.trips[0];
  if (!trip) throw new Error('El contenido inicial no tiene viajes.');
  return trip;
}

describe('SEED_RECORD', () => {
  it('pasa la validación entera (forma e invariantes del dominio)', () => {
    expect(validateSiteRecord(SEED_RECORD, TODAY)).toMatchObject({ ok: true });
  });

  it('sobrevive a guardarse como JSON y volver a leerse', () => {
    const roundTrip = siteRecordSchema.parse(JSON.parse(JSON.stringify(SEED_RECORD)));
    expect(roundTrip).toEqual(SEED_RECORD);
  });
});

describe('buildSiteContent', () => {
  it('arma el home y una página por viaje visible', () => {
    const site = buildSiteContent(SEED_RECORD, TODAY);
    expect(site.catalog.all().map((trip) => trip.slug)).toEqual([
      'calle-stepanek',
      'lago-lolog-laguna-verde',
      'laguna-negra',
      'cajon-del-azul',
    ]);
    expect(site.landing.trips.panels).toHaveLength(4);
    expect(site.tripDetail('calle-stepanek')?.cover.title).toEqual({
      accent: 'Calle &',
      rest: 'Stepanek',
    });
    expect(site.tripDetail('no-existe')).toBeUndefined();
  });

  it('un viaje oculto no tiene card, ni página, ni salidas, ni opción en el formulario', () => {
    const record = seed();
    firstTrip(record).visible = false;
    const site = buildSiteContent(record, TODAY);
    expect(site.catalog.find('calle-stepanek')).toBeUndefined();
    expect(site.tripDetail('calle-stepanek')).toBeUndefined();
    expect(site.schedule.forTrip('calle-stepanek')).toEqual([]);
    expect(site.landing.contact.form.tripOptions).not.toContain('Calle & Stepanek');
  });

  it('las salidas que ya pasaron no se muestran', () => {
    const site = buildSiteContent(SEED_RECORD, '2027-01-01');
    expect(site.schedule.all().map((departure) => departure.startsOn)).toEqual([
      '2027-01-09',
      '2027-02-06',
      '2027-03-12',
    ]);
  });

  it('sin aviso cargado, el calendario no lo muestra', () => {
    const record = seed();
    delete record.home.calendar.note;
    expect(buildSiteContent(record, TODAY).landing.calendar.placeholderNote).toBeUndefined();
  });

  it('el titular del hero se parte en palabras por renglón', () => {
    const { headline } = buildSiteContent(SEED_RECORD, TODAY).landing.hero;
    expect(headline.lines[0]).toEqual(['Creo', 'experiencias', 'en', 'la', 'montaña']);
    expect(headline.text).toBe('Creo experiencias en la montaña para reconectar con lo esencial.');
  });

  it('un viaje nuevo con solo los datos del catálogo ya tiene página ("Itinerario próximamente")', () => {
    const record = seed();
    record.trips.push({
      ...firstTrip(record),
      slug: 'cerro-plata',
      name: 'Cerro Plata',
      shortName: 'Cerro Plata',
      itinerary: [],
      fit: undefined,
      checklist: undefined,
      meals: undefined,
    });
    const detail = buildSiteContent(record, TODAY).tripDetail('cerro-plata');
    expect(detail?.schedule.days).toEqual([]);
    expect(detail?.checklist).toBeUndefined();
  });
});

describe('validateSiteRecord', () => {
  it('rechaza slugs repetidos o que no sirven como URL', () => {
    const record = seed();
    record.trips.push({ ...firstTrip(record) });
    const result = validateSiteRecord(record, TODAY);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues[0]?.path).toBe('trips.4.slug');

    const bad = seed();
    firstTrip(bad).slug = 'Calle Stepanek';
    expect(validateSiteRecord(bad, TODAY).ok).toBe(false);
  });

  it('rechaza salidas de viajes que no existen y salidas repetidas', () => {
    const record = seed();
    record.departures.push({ id: 'x', tripSlug: 'no-existe', startsOn: '2027-05-01' });
    record.departures.push({ id: 'y', tripSlug: 'calle-stepanek', startsOn: '2026-11-13' });
    const result = validateSiteRecord(record, TODAY);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((issue) => issue.path)).toEqual([
        'departures.5.tripSlug',
        'departures.6.startsOn',
      ]);
    }
  });

  it('rechaza campos vacíos con un mensaje en castellano', () => {
    const record = seed();
    firstTrip(record).name = '   ';
    const result = validateSiteRecord(record, TODAY);
    expect(result).toEqual({
      ok: false,
      issues: [{ path: 'trips.0.name', message: 'Este campo no puede quedar vacío.' }],
    });
  });

  it('rechaza fotos de orígenes que no son del sitio ni de Vercel Blob', () => {
    const record = seed();
    firstTrip(record).photo.src = 'https://otro-sitio.com/foto.jpg';
    expect(validateSiteRecord(record, TODAY).ok).toBe(false);
  });

  it('valida también los viajes ocultos', () => {
    const record = seed();
    const trip = firstTrip(record);
    trip.visible = false;
    trip.nights = 9;
    const result = validateSiteRecord(record, TODAY);
    expect(result).toEqual({
      ok: false,
      issues: [{ path: 'trips.0.nights', message: 'Las noches no pueden ser más que los días.' }],
    });
  });
});

describe('todayInBusinessTimeZone', () => {
  it('usa el día de Argentina, no el del servidor', () => {
    // 01:30 UTC del 2 de marzo son las 22:30 del 1 de marzo en Argentina.
    expect(todayInBusinessTimeZone(new Date('2027-03-02T01:30:00Z'))).toBe('2027-03-01');
  });
});
