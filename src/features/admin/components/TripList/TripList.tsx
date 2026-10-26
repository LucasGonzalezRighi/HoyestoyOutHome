import { ArrowDown, ArrowUp, Eye, EyeOff, ExternalLink, Pencil } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { adminTripPath, tripPath } from '@/constants/routes';
import { adminContent } from '@/content/admin';
import type { TripRecord } from '@/content/records/schema';
import { cn } from '@/utils/cn';

import { deleteTrip, moveTrip, setTripVisibility } from '../../actions/trips';
import ui from '../ui/ui.module.css';

import { ConfirmSubmit } from './ConfirmSubmit';
import styles from './TripList.module.css';

const t = adminContent.trips;
const ICON = { size: 18, strokeWidth: 2.75, 'aria-hidden': true } as const;

/**
 * La lista de viajes del panel, en el orden del home. Cada fila: foto,
 * nombre, datos, y los botones para ordenar, ocultar, editar, ver y borrar.
 * Los botones son formularios con Server Actions: andan sin JavaScript
 * (menos la confirmación de borrar).
 */
export function TripList({ trips }: { trips: readonly TripRecord[] }) {
  return (
    <ol className={styles.list}>
      {trips.map((trip, index) => (
        <li key={trip.slug} className={cn(styles.row, !trip.visible && styles.hidden)}>
          <div className={styles.thumb}>
            <Image
              src={trip.photo.src}
              alt=""
              fill
              sizes="96px"
              className={styles.thumbImage}
              style={{ objectPosition: trip.photo.position ?? 'center' }}
            />
          </div>
          <div className={styles.info}>
            <h2 className={styles.name}>
              <Link href={adminTripPath(trip.slug)}>{trip.name}</Link>
            </h2>
            <p className={styles.meta}>
              {trip.destination} · {t.days(trip.days)}
              {trip.itinerary.length === 0 && ` · ${t.noItinerary}`}
            </p>
            {!trip.visible && <span className={styles.badge}>{t.hidden}</span>}
          </div>
          <div className={styles.actions}>
            <form action={moveTrip}>
              <input type="hidden" name="slug" value={trip.slug} />
              <input type="hidden" name="direction" value="up" />
              <button
                type="submit"
                className={ui.iconButton}
                disabled={index === 0}
                aria-label={`${adminContent.list.moveUp} ${trip.name}`}
              >
                <ArrowUp {...ICON} />
              </button>
            </form>
            <form action={moveTrip}>
              <input type="hidden" name="slug" value={trip.slug} />
              <input type="hidden" name="direction" value="down" />
              <button
                type="submit"
                className={ui.iconButton}
                disabled={index === trips.length - 1}
                aria-label={`${adminContent.list.moveDown} ${trip.name}`}
              >
                <ArrowDown {...ICON} />
              </button>
            </form>
            <form action={setTripVisibility}>
              <input type="hidden" name="slug" value={trip.slug} />
              <input type="hidden" name="visible" value={String(!trip.visible)} />
              <button
                type="submit"
                className={ui.iconButton}
                aria-label={`${trip.visible ? t.hide : t.show} ${trip.name}`}
                title={trip.visible ? t.hide : t.show}
              >
                {trip.visible ? <EyeOff {...ICON} /> : <Eye {...ICON} />}
              </button>
            </form>
            {trip.visible && (
              <a
                href={tripPath(trip.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className={ui.iconButton}
                aria-label={`${t.view} ${trip.name}`}
                title={t.view}
              >
                <ExternalLink {...ICON} />
              </a>
            )}
            <Link
              href={adminTripPath(trip.slug)}
              className={cn(ui.textButton, styles.edit)}
              aria-label={`${t.edit} ${trip.name}`}
            >
              <Pencil size={16} strokeWidth={2.75} aria-hidden="true" />
              <span className={styles.editLabel}>{t.edit}</span>
            </Link>
            <form action={deleteTrip}>
              <input type="hidden" name="slug" value={trip.slug} />
              <ConfirmSubmit
                message={t.confirmRemove(trip.name)}
                label={`${t.remove} ${trip.name}`}
              />
            </form>
          </div>
        </li>
      ))}
    </ol>
  );
}
