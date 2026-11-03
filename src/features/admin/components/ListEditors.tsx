'use client';

import { Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { adminContent } from '@/content/admin';
import type {
  DepartureRecord,
  FaqRecord,
  HomeTextsRecord,
  TestimonialRecord,
} from '@/content/records/schema';
import { CalendarDate } from '@/domain';
import { cn } from '@/utils/cn';

import { saveDepartures, saveFaq, saveHomeTexts, saveTestimonials } from '../actions/content';

import styles from './ListEditors.module.css';
import { EditorForm } from './ui/EditorForm';
import { NumberInput, SelectInput, TextInput, Toggle } from './ui/fields';
import { AddButton, ListField, StringListField, removeItem, replaceItem } from './ui/lists';
import ui from './ui/ui.module.css';

/*
 * Las pantallas del panel que editan una lista o un bloque de textos:
 * salidas, preguntas frecuentes, testimonios y textos del home. Cada una
 * guarda su parte entera con un solo botón.
 */

/** Un id nuevo para un elemento de una lista (el navegador lo genera). */
function newId(): string {
  return crypto.randomUUID();
}

/* ── Salidas ───────────────────────────────────────────────────────────── */

/** Un viaje, como lo necesita la pantalla de salidas. */
export type DepartureTripOption = {
  readonly slug: string;
  readonly name: string;
  readonly days: number;
  readonly visible: boolean;
};

/**
 * El día de vuelta que da la duración del viaje (`AAAA-MM-DD`), o vacío si la
 * fecha de salida todavía no sirve.
 */
function defaultReturn(startsOn: string, days: number): string {
  try {
    return CalendarDate.parse(startsOn, 'La fecha').addDays(Math.max(days, 1) - 1).iso;
  } catch {
    return '';
  }
}

/** La salida sin el día de vuelta cargado a mano: vuelve a salir de la duración del viaje. */
function withAutomaticReturn(departure: DepartureRecord): DepartureRecord {
  const next = { ...departure };
  delete next.endsOn;
  return next;
}

/**
 * Lo que se guarda de una salida: si el día de vuelta quedó vacío (se borró
 * mientras se escribía), vuelve a salir de la duración del viaje. Mientras se
 * edita, el vacío se respeta: si no, el campo saltaría a la fecha automática
 * apenas se borra una parte de la fecha.
 */
function normalizeReturn(departure: DepartureRecord): DepartureRecord {
  return departure.endsOn === '' ? withAutomaticReturn(departure) : departure;
}

/**
 * Las salidas del calendario, ordenadas por fecha. Cada una es un viaje y un
 * día de salida; el de vuelta sale de la duración del viaje salvo que se
 * cambie a mano, y una salida puede quedar "a confirmar". Las que ya pasaron
 * se marcan (el sitio ya no las muestra) y se pueden borrar.
 */
export function DeparturesEditor({
  departures,
  trips,
  today,
}: {
  departures: readonly DepartureRecord[];
  trips: readonly DepartureTripOption[];
  /** `AAAA-MM-DD` en Argentina, para marcar las que ya pasaron. */
  today: string;
}) {
  const t = adminContent.departures;
  const [items, setItems] = useState<DepartureRecord[]>(() =>
    [...departures].sort((a, b) => a.startsOn.localeCompare(b.startsOn)),
  );
  const tripOf = (slug: string) => trips.find((trip) => trip.slug === slug);
  const options = trips.map((trip) => ({
    value: trip.slug,
    label: trip.visible ? trip.name : `${trip.name} (${t.hiddenTrip.toLowerCase()})`,
  }));

  return (
    <EditorForm action={saveDepartures} payload={items.map(normalizeReturn)}>
      <div className={ui.card}>
        <p className={ui.hint}>{t.sortHint}</p>
        {items.length === 0 ? (
          <p className={ui.empty}>{adminContent.list.empty}</p>
        ) : (
          <ol className={ui.list}>
            {items.map((departure, index) => {
              const trip = tripOf(departure.tripSlug);
              const automaticReturn = defaultReturn(departure.startsOn, trip?.days ?? 1);
              const past = departure.startsOn !== '' && departure.startsOn < today;
              const update = (next: DepartureRecord) => setItems(replaceItem(items, index, next));
              const notes = [
                past ? t.past : departure.toConfirm ? t.toConfirmHint : '',
                trip && !trip.visible ? t.hiddenTrip : '',
              ].filter(Boolean);
              return (
                <li key={departure.id} className={cn(ui.listItem, past && styles.past)}>
                  <div className={styles.departure}>
                    <SelectInput
                      label={t.trip}
                      path={`${index}.tripSlug`}
                      value={departure.tripSlug}
                      options={options}
                      onChange={(tripSlug) => update({ ...departure, tripSlug })}
                    />
                    <TextDate
                      label={t.startsOn}
                      path={`${index}.startsOn`}
                      value={departure.startsOn}
                      onChange={(startsOn) => update({ ...departure, startsOn })}
                    />
                    <div className={ui.field}>
                      <TextDate
                        label={t.endsOn}
                        path={`${index}.endsOn`}
                        value={departure.endsOn ?? automaticReturn}
                        onChange={(endsOn) => update({ ...departure, endsOn })}
                      />
                      {departure.endsOn !== undefined ? (
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() => update(withAutomaticReturn(departure))}
                        >
                          {t.endsReset}
                        </button>
                      ) : (
                        <p className={ui.hint}>{t.endsAuto}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      className={cn(ui.iconButton, ui.danger, styles.remove)}
                      aria-label={`${adminContent.list.remove} ${t.trip.toLowerCase()} ${trip?.name ?? ''} ${departure.startsOn}`}
                      onClick={() => setItems(removeItem(items, index))}
                    >
                      <Trash2 size={18} strokeWidth={2.75} aria-hidden="true" />
                    </button>
                  </div>
                  <div className={styles.departureFooter}>
                    <Toggle
                      label={t.toConfirm}
                      checked={departure.toConfirm ?? false}
                      onChange={(toConfirm) => update({ ...departure, toConfirm })}
                    />
                    {notes.length > 0 && <p className={ui.hint}>{notes.join(' · ')}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <AddButton
          label={t.add}
          onClick={() =>
            setItems([...items, { id: newId(), tripSlug: trips[0]?.slug ?? '', startsOn: today }])
          }
        />
      </div>
    </EditorForm>
  );
}

/** Un campo de fecha del calendario del navegador (`AAAA-MM-DD`). */
function TextDate({
  label,
  path,
  value,
  onChange,
}: {
  label: string;
  path: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextInput
      label={label}
      path={path}
      value={value}
      onChange={onChange}
      placeholder="AAAA-MM-DD"
      type="date"
    />
  );
}

/* ── Preguntas frecuentes ──────────────────────────────────────────────── */

/** Las preguntas frecuentes, en el orden en que se muestran. */
export function FaqEditor({ entries }: { entries: readonly FaqRecord[] }) {
  const t = adminContent.faq;
  const [items, setItems] = useState<FaqRecord[]>([...entries]);
  return (
    <EditorForm action={saveFaq} payload={items}>
      <div className={ui.card}>
        <ListField<FaqRecord>
          items={items}
          onChange={setItems}
          addLabel={t.add}
          keyOf={(item) => item.id}
          itemTitle={(_, index) => t.item(index + 1)}
          create={() => ({ id: newId(), question: '', answer: '' })}
          renderItem={(item, index, update) => (
            <>
              <TextInput
                label={t.question}
                path={`${index}.question`}
                value={item.question}
                onChange={(question) => update({ ...item, question })}
              />
              <TextInput
                label={t.answer}
                path={`${index}.answer`}
                value={item.answer}
                multiline
                rows={4}
                onChange={(answer) => update({ ...item, answer })}
              />
            </>
          )}
        />
      </div>
    </EditorForm>
  );
}

/* ── Testimonios ───────────────────────────────────────────────────────── */

/** Los testimonios de la cinta, en orden. `tripNames`: sugerencias para el viaje. */
export function TestimonialsEditor({
  testimonials,
  tripNames,
}: {
  testimonials: readonly TestimonialRecord[];
  tripNames: readonly string[];
}) {
  const t = adminContent.testimonials;
  const [items, setItems] = useState<TestimonialRecord[]>([...testimonials]);
  return (
    <EditorForm action={saveTestimonials} payload={items}>
      <datalist id="trip-names">
        {tripNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <div className={ui.card}>
        <ListField<TestimonialRecord>
          items={items}
          onChange={setItems}
          addLabel={t.add}
          keyOf={(item) => item.id}
          itemTitle={(item, index) => item.author || t.item(index + 1)}
          create={() => ({
            id: newId(),
            quote: '',
            author: '',
            city: '',
            tripName: tripNames[0] ?? '',
            rating: 5,
          })}
          renderItem={(item, index, update) => (
            <>
              <TextInput
                label={t.quote}
                path={`${index}.quote`}
                value={item.quote}
                multiline
                onChange={(quote) => update({ ...item, quote })}
              />
              <div className={ui.row}>
                <TextInput
                  label={t.author}
                  path={`${index}.author`}
                  value={item.author}
                  onChange={(author) => update({ ...item, author })}
                />
                <TextInput
                  label={t.city}
                  path={`${index}.city`}
                  value={item.city}
                  onChange={(city) => update({ ...item, city })}
                />
                <TextInput
                  label={t.tripName}
                  path={`${index}.tripName`}
                  value={item.tripName}
                  list="trip-names"
                  onChange={(tripName) => update({ ...item, tripName })}
                />
                <NumberInput
                  label={t.rating}
                  path={`${index}.rating`}
                  value={item.rating}
                  onChange={(rating) => update({ ...item, rating: rating ?? Number.NaN })}
                />
              </div>
            </>
          )}
        />
      </div>
    </EditorForm>
  );
}

/* ── Textos del home ───────────────────────────────────────────────────── */

/** Los títulos y bajadas de cada sección del home. */
export function HomeTextsEditor({ texts }: { texts: HomeTextsRecord }) {
  const t = adminContent.texts;
  const [home, setHome] = useState<HomeTextsRecord>(texts);
  const set = <K extends keyof HomeTextsRecord>(key: K, patch: Partial<HomeTextsRecord[K]>) =>
    setHome((current) => ({ ...current, [key]: { ...current[key], ...patch } }));

  return (
    <EditorForm action={saveHomeTexts} payload={home}>
      <Card legend={t.hero.legend}>
        <TextInput
          label={t.hero.line1}
          path="hero.headline.0"
          value={home.hero.headline[0]}
          onChange={(line) => set('hero', { headline: [line, home.hero.headline[1]] })}
        />
        <TextInput
          label={t.hero.line2}
          path="hero.headline.1"
          value={home.hero.headline[1]}
          onChange={(line) => set('hero', { headline: [home.hero.headline[0], line] })}
        />
        <StringListField
          label={t.hero.lead}
          path="hero.lead"
          items={home.hero.lead}
          itemLabel={t.hero.leadLine}
          addLabel={adminContent.list.add}
          onChange={(lead) => set('hero', { lead })}
        />
        <StringListField
          label={t.hero.ribbon}
          path="hero.ribbon"
          items={home.hero.ribbon}
          itemLabel={t.hero.ribbonItem}
          addLabel={adminContent.list.add}
          onChange={(ribbon) => set('hero', { ribbon })}
        />
      </Card>

      <Card legend={t.whyUs.legend}>
        <TextInput
          label={t.whyUs.title}
          path="whyUs.title"
          value={home.whyUs.title}
          onChange={(title) => set('whyUs', { title })}
        />
        <ol className={ui.list}>
          {home.whyUs.pillars.map((pillar, index) => (
            <li key={index} className={ui.listItem}>
              <div className={ui.listItemHeader}>
                <h3 className={ui.listItemTitle}>{t.whyUs.pillar(index + 1)}</h3>
                <button
                  type="button"
                  className={cn(ui.iconButton, ui.danger)}
                  aria-label={`${adminContent.list.remove} ${t.whyUs.pillar(index + 1)}`}
                  onClick={() => set('whyUs', { pillars: removeItem(home.whyUs.pillars, index) })}
                >
                  <Trash2 size={18} strokeWidth={2.75} aria-hidden="true" />
                </button>
              </div>
              <TextInput
                label={t.whyUs.pillarTitle}
                path={`whyUs.pillars.${index}.title`}
                value={pillar.title}
                onChange={(title) =>
                  set('whyUs', {
                    pillars: replaceItem(home.whyUs.pillars, index, { ...pillar, title }),
                  })
                }
              />
              <TextInput
                label={t.whyUs.pillarText}
                path={`whyUs.pillars.${index}.description`}
                value={pillar.description}
                multiline
                rows={2}
                onChange={(description) =>
                  set('whyUs', {
                    pillars: replaceItem(home.whyUs.pillars, index, { ...pillar, description }),
                  })
                }
              />
            </li>
          ))}
        </ol>
        <AddButton
          label={t.whyUs.addPillar}
          onClick={() =>
            set('whyUs', { pillars: [...home.whyUs.pillars, { title: '', description: '' }] })
          }
        />
      </Card>

      <SimpleSection
        legend={t.trips.legend}
        fields={[
          { key: 'title', label: t.trips.title, value: home.trips.title },
          { key: 'lead', label: t.trips.lead, value: home.trips.lead, multiline: true },
        ]}
        prefix="trips"
        onChange={(key, value) => set('trips', { [key]: value })}
      />
      <SimpleSection
        legend={t.calendar.legend}
        fields={[
          { key: 'title', label: t.calendar.title, value: home.calendar.title },
          { key: 'lead', label: t.calendar.lead, value: home.calendar.lead, multiline: true },
          {
            key: 'note',
            label: t.calendar.note,
            hint: t.calendar.noteHint,
            value: home.calendar.note ?? '',
            multiline: true,
          },
        ]}
        prefix="calendar"
        onChange={(key, value) => set('calendar', { [key]: value })}
      />
      <SimpleSection
        legend={t.testimonials.legend}
        fields={[{ key: 'title', label: t.testimonials.title, value: home.testimonials.title }]}
        prefix="testimonials"
        onChange={(key, value) => set('testimonials', { [key]: value })}
      />
      <SimpleSection
        legend={t.faq.legend}
        fields={[
          { key: 'title', label: t.faq.title, value: home.faq.title },
          { key: 'lead', label: t.faq.lead, value: home.faq.lead, multiline: true },
          { key: 'summitTitle', label: t.faq.summitTitle, value: home.faq.summitTitle },
          {
            key: 'summitLead',
            label: t.faq.summitLead,
            value: home.faq.summitLead,
            multiline: true,
          },
        ]}
        prefix="faq"
        onChange={(key, value) => set('faq', { [key]: value })}
      />
      <SimpleSection
        legend={t.contact.legend}
        fields={[
          { key: 'title', label: t.contact.title, value: home.contact.title },
          { key: 'lead', label: t.contact.lead, value: home.contact.lead, multiline: true },
        ]}
        prefix="contact"
        onChange={(key, value) => set('contact', { [key]: value })}
      />
    </EditorForm>
  );
}

/** Una tarjeta con un grupo de campos y su título. */
function Card({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <div className={ui.card}>
      <fieldset className={ui.fieldset}>
        <legend className={ui.legend}>{legend}</legend>
        {children}
      </fieldset>
    </div>
  );
}

/** Un bloque de textos sueltos (título, bajada…) de una sección del home. */
function SimpleSection({
  legend,
  fields,
  prefix,
  onChange,
}: {
  legend: string;
  fields: readonly {
    key: string;
    label: string;
    hint?: string;
    value: string;
    multiline?: boolean;
  }[];
  prefix: string;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <Card legend={legend}>
      {fields.map((field) => (
        <TextInput
          key={field.key}
          label={field.label}
          hint={field.hint}
          path={`${prefix}.${field.key}`}
          value={field.value}
          multiline={field.multiline}
          rows={2}
          onChange={(value) => onChange(field.key, value)}
        />
      ))}
    </Card>
  );
}
