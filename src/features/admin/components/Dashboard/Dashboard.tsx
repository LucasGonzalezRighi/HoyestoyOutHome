import { CalendarDays, CircleHelp, Mountain, MessageSquareQuote, Type } from 'lucide-react';
import Link from 'next/link';
import type { ComponentType } from 'react';

import { ADMIN_ROUTES } from '@/constants/routes';
import { adminContent } from '@/content/admin';
import type { EditableContent } from '@/server/content/editableContent';
import { cn } from '@/utils/cn';

import styles from './Dashboard.module.css';

const t = adminContent.dashboard;

/** Cuándo se guardó por última vez, en la hora de Argentina. */
function savedAtLabel(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(iso));
}

/** Una tarjeta del inicio: a qué pantalla lleva, su ícono y cuánto hay cargado. */
type DashboardCard = {
  key: keyof typeof t.cards;
  href: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>;
  count?: string;
};

/**
 * El inicio del panel: dónde se está guardando, cuándo fue el último cambio y
 * una tarjeta por pantalla con lo que hay cargado.
 */
export function Dashboard({ content }: { content: EditableContent }) {
  const { record } = content;
  const visible = record.trips.filter((trip) => trip.visible).length;
  const cards: DashboardCard[] = [
    {
      key: 'trips',
      href: ADMIN_ROUTES.trips,
      icon: Mountain,
      count: t.count.trips(visible, record.trips.length),
    },
    {
      key: 'departures',
      href: ADMIN_ROUTES.departures,
      icon: CalendarDays,
      count: t.count.departures(record.departures.length),
    },
    { key: 'faq', href: ADMIN_ROUTES.faq, icon: CircleHelp, count: t.count.faq(record.faq.length) },
    {
      key: 'testimonials',
      href: ADMIN_ROUTES.testimonials,
      icon: MessageSquareQuote,
      count: t.count.testimonials(record.testimonials.length),
    },
    { key: 'texts', href: ADMIN_ROUTES.texts, icon: Type },
  ];

  return (
    <>
      <div
        className={cn(styles.status, content.storeKind === 'unavailable' && styles.statusWarning)}
        role={content.storeKind === 'unavailable' || content.problem ? 'alert' : undefined}
      >
        <p>{t.storage[content.storeKind]}</p>
        <p>
          {content.updatedAt ? `${t.lastSaved} ${savedAtLabel(content.updatedAt)}.` : t.neverSaved}
        </p>
        {content.problem && <p>{content.problem}</p>}
      </div>

      <ul className={styles.cards}>
        {cards.map(({ key, href, icon: Icon, count }) => (
          <li key={key}>
            <Link href={href} className={styles.card}>
              <span className={styles.icon}>
                <Icon size={22} strokeWidth={2.25} aria-hidden />
              </span>
              <span className={styles.cardTitle}>{t.cards[key].title}</span>
              <span className={styles.cardText}>{t.cards[key].text}</span>
              {count && <span className={styles.count}>{count}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
