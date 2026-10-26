'use client';

import { ExternalLink, Trash2 } from 'lucide-react';
import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import { tripPath } from '@/constants/routes';
import { adminContent } from '@/content/admin';
import type { ItineraryDayRecord, MetricRecord, TripRecord } from '@/content/records/schema';
import { DIFFICULTIES } from '@/domain';
import { cn } from '@/utils/cn';

import { saveTrip } from '../../actions/trips';
import type { AdminActionState } from '../../actionState';
import { EditorForm } from '../ui/EditorForm';
import { NumberInput, SelectInput, TextInput, Toggle } from '../ui/fields';
import { AddButton, ListField, StringListField } from '../ui/lists';
import { framingPosition, verticalFraming } from '../ui/inputValues';
import { PhotoField } from '../ui/PhotoField';
import ui from '../ui/ui.module.css';

import styles from './TripEditor.module.css';
import {
  fromDraft,
  slugify,
  tabOfPath,
  toDraft,
  TRIP_TABS,
  type TripBase,
  type TripDraft,
  type TripTab,
} from './tripDraft';

const copy = adminContent.tripEditor;

/** Props de `TripEditor`. */
export type TripEditorProps = {
  /** El viaje guardado, o `undefined` para uno nuevo. */
  trip?: TripRecord;
};

/**
 * Editor de un viaje, en pestañas: datos y foto, portada, "Sobre el viaje",
 * cronograma, "¿Es para mí?", qué incluye y pensión. Todo se guarda junto con
 * un solo botón; las pestañas con errores se marcan.
 */
export function TripEditor({ trip }: TripEditorProps) {
  const [draft, setDraft] = useState<TripDraft>(() => toDraft(trip));
  const [tab, setTab] = useState<TripTab>('basics');
  const [errorTabs, setErrorTabs] = useState<ReadonlySet<TripTab>>(new Set());
  const [slugTouched, setSlugTouched] = useState(trip !== undefined);
  const { base } = draft;

  const setBase = (patch: Partial<TripBase>) =>
    setDraft((current) => ({ ...current, base: { ...current.base, ...patch } }));

  const handleIssues = (state: AdminActionState) => {
    const tabs = new Set(
      state.status === 'error' ? state.issues.map((issue) => tabOfPath(issue.path)) : [],
    );
    setErrorTabs(tabs);
    const first = TRIP_TABS.find((candidate) => tabs.has(candidate));
    if (first) setTab(first);
  };

  return (
    <EditorForm
      action={saveTrip}
      payload={fromDraft(draft)}
      hiddenFields={{ originalSlug: trip?.slug ?? '' }}
      onIssues={handleIssues}
    >
      <div className={styles.tabs} role="tablist" aria-label={copy.tabsLabel}>
        {TRIP_TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`tab-${key}`}
            aria-controls={`panel-${key}`}
            aria-selected={tab === key}
            className={cn(styles.tab, tab === key && styles.tabActive)}
            onClick={() => setTab(key)}
          >
            {copy.tabs[key]}
            {errorTabs.has(key) && <span className={styles.tabError} aria-hidden="true" />}
          </button>
        ))}
      </div>

      {trip && trip.visible && (
        <a
          className={styles.viewLink}
          href={tripPath(trip.slug)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {copy.viewPage}
          <ExternalLink size={15} strokeWidth={2.75} aria-hidden="true" />
        </a>
      )}

      <TabPanel tab="basics" active={tab}>
        <fieldset className={ui.fieldset}>
          <legend className={ui.legend}>{copy.basics.legend}</legend>
          <Toggle
            label={copy.basics.visible}
            checked={base.visible}
            onChange={(visible) => setBase({ visible })}
          />
          <TextInput
            label={copy.basics.name}
            hint={copy.basics.nameHint}
            path="name"
            value={base.name}
            onChange={(name) => setBase(slugTouched ? { name } : { name, slug: slugify(name) })}
          />
          <div className={cn(ui.row, ui.rowWide)}>
            <TextInput
              label={copy.basics.shortName}
              hint={copy.basics.shortNameHint}
              path="shortName"
              value={base.shortName}
              onChange={(shortName) => setBase({ shortName })}
            />
            <TextInput
              label={copy.basics.destination}
              hint={copy.basics.destinationHint}
              path="destination"
              value={base.destination}
              onChange={(destination) => setBase({ destination })}
            />
          </div>
          <TextInput
            label={copy.basics.slug}
            hint={`${copy.basics.slugHint}${base.slug || '…'}`}
            path="slug"
            value={base.slug}
            onChange={(slug) => {
              setSlugTouched(true);
              setBase({ slug: slug.toLowerCase() });
            }}
          />
          <div className={ui.row}>
            <NumberInput
              label={copy.basics.days}
              path="days"
              value={base.days}
              onChange={(days) => setBase({ days: days ?? Number.NaN })}
            />
            <NumberInput
              label={copy.basics.nights}
              path="nights"
              value={base.nights}
              onChange={(nights) => setBase({ nights: nights ?? Number.NaN })}
            />
            <SelectInput
              label={copy.basics.difficulty}
              path="difficulty"
              value={base.difficulty}
              options={DIFFICULTIES.map((value) => ({
                value,
                label: copy.basics.difficulties[value],
              }))}
              onChange={(difficulty) =>
                setBase({ difficulty: difficulty as TripBase['difficulty'] })
              }
            />
            <NumberInput
              label={copy.basics.distance}
              path="distanceKm"
              value={base.distanceKm}
              onChange={(distanceKm) => setBase({ distanceKm: distanceKm ?? Number.NaN })}
            />
            <NumberInput
              label={copy.basics.summit}
              hint={copy.basics.summitHint}
              path="summitElevationM"
              value={base.summitElevationM}
              onChange={(summitElevationM) => setBase({ summitElevationM })}
            />
          </div>
          <TextInput
            label={copy.basics.description}
            hint={copy.basics.descriptionHint}
            path="description"
            multiline
            value={base.description}
            onChange={(description) => setBase({ description })}
          />
        </fieldset>
        <PhotoField
          label={copy.basics.photo}
          hint={copy.basics.photoHint}
          path="photo"
          value={base.photo}
          onChange={(photo) => photo && setBase({ photo })}
        />
        {base.photo && (
          <div className={ui.field}>
            <label htmlFor="panel-framing" className={ui.label}>
              {copy.basics.panelPosition}
            </label>
            <p className={ui.hint}>{copy.basics.panelPositionHint}</p>
            <input
              id="panel-framing"
              type="range"
              min={0}
              max={100}
              step={5}
              className={styles.range}
              value={verticalFraming(base.panelPosition ?? base.photo.position)}
              onChange={(event) =>
                setBase({ panelPosition: framingPosition(Number(event.target.value)) })
              }
            />
          </div>
        )}
      </TabPanel>

      <TabPanel tab="cover" active={tab}>
        <fieldset className={ui.fieldset}>
          <legend className={ui.legend}>{copy.cover.legend}</legend>
          <TextInput
            label={copy.cover.eyebrow}
            hint={copy.cover.eyebrowHint}
            path="cover.eyebrow"
            value={base.cover.eyebrow}
            placeholder={base.destination}
            onChange={(eyebrow) => setBase({ cover: { ...base.cover, eyebrow } })}
          />
          <div className={cn(ui.row, ui.rowWide)}>
            <TextInput
              label={copy.cover.titleAccent}
              hint={copy.cover.titleAccentHint}
              path="cover.titleAccent"
              value={base.cover.titleAccent}
              onChange={(titleAccent) => setBase({ cover: { ...base.cover, titleAccent } })}
            />
            <TextInput
              label={copy.cover.titleRest}
              path="cover.titleRest"
              value={base.cover.titleRest}
              placeholder={base.name}
              onChange={(titleRest) => setBase({ cover: { ...base.cover, titleRest } })}
            />
          </div>
          <TextInput
            label={copy.cover.subtitle}
            path="cover.subtitle"
            value={base.cover.subtitle}
            onChange={(subtitle) => setBase({ cover: { ...base.cover, subtitle } })}
          />
        </fieldset>
      </TabPanel>

      <TabPanel tab="overview" active={tab}>
        <OverviewTab draft={draft} setDraft={setDraft} />
      </TabPanel>

      <TabPanel tab="itinerary" active={tab}>
        <fieldset className={ui.fieldset}>
          <legend className={ui.legend}>{copy.itinerary.legend}</legend>
          <p className={ui.sectionLead}>{copy.itinerary.lead}</p>
          <ListField<ItineraryDayRecord>
            items={base.itinerary}
            onChange={(itinerary) => setBase({ itinerary })}
            addLabel={copy.itinerary.addDay}
            itemTitle={(day) => copy.itinerary.day(day.day)}
            create={() => ({
              day: (base.itinerary.at(-1)?.day ?? 0) + 1,
              title: '',
              paragraphs: [''],
            })}
            renderItem={(day, index, update) => (
              <>
                <div className={cn(ui.row, ui.rowWide)}>
                  <NumberInput
                    label={copy.itinerary.dayNumber}
                    path={`itinerary.${index}.day`}
                    value={day.day}
                    onChange={(value) => update({ ...day, day: value ?? Number.NaN })}
                  />
                  <TextInput
                    label={copy.itinerary.title}
                    path={`itinerary.${index}.title`}
                    value={day.title}
                    onChange={(title) => update({ ...day, title })}
                  />
                </div>
                <StringListField
                  label={copy.itinerary.paragraphs}
                  path={`itinerary.${index}.paragraphs`}
                  items={day.paragraphs}
                  onChange={(paragraphs) => update({ ...day, paragraphs })}
                  itemLabel={copy.itinerary.paragraph}
                  addLabel={copy.itinerary.addParagraph}
                  multiline
                />
                <div className={ui.row}>
                  <NumberInput
                    label={copy.itinerary.distance}
                    path={`itinerary.${index}.distanceKm`}
                    value={day.distanceKm}
                    onChange={(distanceKm) => update({ ...day, distanceKm })}
                  />
                  <NumberInput
                    label={copy.itinerary.elevation}
                    path={`itinerary.${index}.elevationGainM`}
                    value={day.elevationGainM}
                    onChange={(elevationGainM) => update({ ...day, elevationGainM })}
                  />
                  <NumberInput
                    label={copy.itinerary.hours}
                    path={`itinerary.${index}.walkingHours`}
                    value={day.walkingHours}
                    onChange={(walkingHours) => update({ ...day, walkingHours })}
                  />
                </div>
                <PhotoField
                  label={copy.itinerary.photo}
                  path={`itinerary.${index}.photo`}
                  value={day.photo}
                  optional
                  onChange={(photo) => {
                    const next = { ...day, photo };
                    if (!photo) delete next.photo;
                    update(next);
                  }}
                />
              </>
            )}
          />
        </fieldset>
      </TabPanel>

      <TabPanel tab="fit" active={tab}>
        <FitTab draft={draft} setDraft={setDraft} />
      </TabPanel>

      <TabPanel tab="checklist" active={tab}>
        <fieldset className={ui.fieldset}>
          <legend className={ui.legend}>{copy.checklist.legend}</legend>
          <Toggle
            label={copy.checklist.enabled}
            checked={draft.checklist.enabled}
            onChange={(enabled) =>
              setDraft((current) => ({ ...current, checklist: { ...current.checklist, enabled } }))
            }
          />
          {draft.checklist.enabled &&
            (Object.keys(copy.checklist.groups) as (keyof typeof copy.checklist.groups)[]).map(
              (group) => (
                <StringListField
                  key={group}
                  label={copy.checklist.groups[group]}
                  path={`checklist.${group}`}
                  items={draft.checklist.value[group]}
                  itemLabel={copy.checklist.groups[group]}
                  addLabel={copy.checklist.addItem}
                  onChange={(items) =>
                    setDraft((current) => ({
                      ...current,
                      checklist: {
                        ...current.checklist,
                        value: { ...current.checklist.value, [group]: items },
                      },
                    }))
                  }
                />
              ),
            )}
        </fieldset>
      </TabPanel>

      <TabPanel tab="meals" active={tab}>
        <fieldset className={ui.fieldset}>
          <legend className={ui.legend}>{copy.meals.legend}</legend>
          <Toggle
            label={copy.meals.enabled}
            checked={draft.meals.enabled}
            onChange={(enabled) =>
              setDraft((current) => ({ ...current, meals: { ...current.meals, enabled } }))
            }
          />
          {draft.meals.enabled && (
            <TextInput
              label={copy.meals.footnote}
              hint={copy.meals.footnoteHint}
              path="meals.footnote"
              value={draft.meals.footnote}
              onChange={(footnote) =>
                setDraft((current) => ({ ...current, meals: { ...current.meals, footnote } }))
              }
            />
          )}
        </fieldset>
      </TabPanel>
    </EditorForm>
  );
}

/** Un panel de pestaña: todos quedan montados (no se pierde lo escrito), solo se ve el activo. */
function TabPanel({
  tab,
  active,
  children,
}: {
  tab: TripTab;
  active: TripTab;
  children: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`panel-${tab}`}
      aria-labelledby={`tab-${tab}`}
      hidden={tab !== active}
      className={ui.card}
    >
      {children}
    </div>
  );
}

/** Props de las pestañas que editan más de un bloque del borrador. */
type DraftTabProps = {
  draft: TripDraft;
  setDraft: Dispatch<SetStateAction<TripDraft>>;
};

/** "Sobre el viaje": párrafos, frase destacada, modalidad y los números. */
function OverviewTab({ draft, setDraft }: DraftTabProps) {
  const { overview } = draft.base;
  const t = copy.overview;
  const setOverview = (patch: Partial<TripBase['overview']>) =>
    setDraft((current) => ({
      ...current,
      base: { ...current.base, overview: { ...current.base.overview, ...patch } },
    }));
  const setStats = (patch: Partial<TripDraft['stats']>) =>
    setDraft((current) => ({ ...current, stats: { ...current.stats, ...patch } }));

  return (
    <>
      <fieldset className={ui.fieldset}>
        <legend className={ui.legend}>{t.legend}</legend>
        <StringListField
          label={t.paragraphs}
          path="overview.paragraphs"
          items={overview.paragraphs}
          onChange={(paragraphs) => setOverview({ paragraphs })}
          itemLabel={t.paragraph}
          addLabel={t.addParagraph}
          multiline
        />
        <TextInput
          label={t.highlight}
          hint={t.highlightHint}
          path="overview.highlight"
          value={overview.highlight}
          multiline
          rows={2}
          onChange={(highlight) => setOverview({ highlight })}
        />
        <TextInput
          label={t.modality}
          hint={t.modalityHint}
          path="overview.modality"
          value={overview.modality}
          multiline
          rows={2}
          onChange={(modality) => setOverview({ modality })}
        />
      </fieldset>

      <fieldset className={ui.fieldset}>
        <legend className={ui.legend}>{t.statsLegend}</legend>
        <div className={styles.choices} role="radiogroup" aria-label={t.statsLegend}>
          {(['auto', 'custom'] as const).map((mode) => (
            <label key={mode} className={styles.choice}>
              <input
                type="radio"
                name="stats-mode"
                checked={draft.stats.mode === mode}
                onChange={() => setStats({ mode })}
              />
              {mode === 'auto' ? t.statsAuto : t.statsCustom}
            </label>
          ))}
        </div>
        {draft.stats.mode === 'auto' ? (
          <TextInput
            label={t.nightsLabel}
            hint={t.nightsLabelHint}
            path="stats.nightsLabel"
            value={draft.stats.nightsLabel}
            onChange={(nightsLabel) => setStats({ nightsLabel })}
          />
        ) : (
          <ListField<MetricRecord>
            items={draft.stats.items}
            onChange={(items) => setStats({ items })}
            addLabel={t.addStat}
            itemTitle={(_, index) => `${t.stat} ${index + 1}`}
            create={() => ({ value: 0, label: '' })}
            renderItem={(item, index, update) => (
              <div className={ui.row}>
                <TextInput
                  label={t.statPrefix}
                  path={`stats.items.${index}.prefix`}
                  value={item.prefix}
                  onChange={(prefix) => update({ ...item, prefix })}
                />
                <NumberInput
                  label={t.statValue}
                  path={`stats.items.${index}.value`}
                  value={item.value}
                  onChange={(value) => update({ ...item, value: value ?? Number.NaN })}
                />
                <TextInput
                  label={t.statSuffix}
                  path={`stats.items.${index}.suffix`}
                  value={item.suffix}
                  onChange={(suffix) => update({ ...item, suffix })}
                />
                <TextInput
                  label={t.statLabel}
                  path={`stats.items.${index}.label`}
                  value={item.label}
                  onChange={(label) => update({ ...item, label })}
                />
              </div>
            )}
          />
        )}
      </fieldset>
    </>
  );
}

/** "¿Puedo?" y "¿Es para mí?". */
function FitTab({ draft, setDraft }: DraftTabProps) {
  const t = copy.fit;
  const { enabled, value } = draft.fit;
  const setFit = (patch: Partial<TripDraft['fit']['value']>) =>
    setDraft((current) => ({
      ...current,
      fit: { ...current.fit, value: { ...current.fit.value, ...patch } },
    }));

  return (
    <fieldset className={ui.fieldset}>
      <legend className={ui.legend}>{t.legend}</legend>
      <Toggle
        label={t.enabled}
        checked={enabled}
        onChange={(on) =>
          setDraft((current) => ({ ...current, fit: { ...current.fit, enabled: on } }))
        }
      />
      {enabled && (
        <>
          <TextInput
            label={t.requirementsLead}
            path="fit.requirementsLead"
            value={value.requirementsLead}
            multiline
            rows={2}
            onChange={(requirementsLead) => setFit({ requirementsLead })}
          />
          <fieldset className={ui.fieldset}>
            <legend className={ui.label}>{t.facts}</legend>
            {value.facts.map((fact, index) => (
              <div key={index} className={styles.factRow}>
                <TextInput
                  label={`${t.factLabel} ${index + 1}`}
                  path={`fit.facts.${index}.label`}
                  value={fact.label}
                  onChange={(label) =>
                    setFit({
                      facts: value.facts.map((f, i) => (i === index ? { ...f, label } : f)),
                    })
                  }
                />
                <TextInput
                  label={t.factValue}
                  path={`fit.facts.${index}.value`}
                  value={fact.value}
                  onChange={(factValue) =>
                    setFit({
                      facts: value.facts.map((f, i) =>
                        i === index ? { ...f, value: factValue } : f,
                      ),
                    })
                  }
                />
                <button
                  type="button"
                  className={cn(ui.iconButton, ui.danger, styles.factRemove)}
                  aria-label={`${adminContent.list.remove} ${t.factLabel} ${index + 1}`}
                  onClick={() => setFit({ facts: value.facts.filter((_, i) => i !== index) })}
                >
                  <Trash2 size={18} strokeWidth={2.75} aria-hidden="true" />
                </button>
              </div>
            ))}
            <AddButton
              label={t.addFact}
              onClick={() => setFit({ facts: [...value.facts, { label: '', value: '' }] })}
            />
          </fieldset>
          <TextInput
            label={t.audienceLead}
            path="fit.audienceLead"
            value={value.audienceLead}
            multiline
            rows={2}
            onChange={(audienceLead) => setFit({ audienceLead })}
          />
          <StringListField
            label={t.ideal}
            path="fit.ideal"
            items={value.ideal}
            onChange={(ideal) => setFit({ ideal })}
            itemLabel={t.ideal}
            addLabel={t.addItem}
          />
          <StringListField
            label={t.approach}
            path="fit.approach"
            items={value.approach}
            onChange={(approach) => setFit({ approach })}
            itemLabel={t.approach}
            addLabel={t.addItem}
          />
        </>
      )}
    </fieldset>
  );
}
