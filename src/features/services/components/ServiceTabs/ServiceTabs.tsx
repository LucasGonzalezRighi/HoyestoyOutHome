'use client';

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';

import { Button } from '@/components/atoms/Button';
import type { TripSlug } from '@/domain';
import { reveal } from '@/motion/attributes';

import type { ServiceTabList } from '../../types';
import { ServicePanel } from '../ServicePanel';

import styles from './ServiceTabs.module.css';

/** Props de `ServiceTabs`. Todo es serializable: lo renderiza un Server Component. */
export type ServiceTabsProps = {
  /**
   * El encabezado de la sección (eyebrow + título), ya renderizado en el
   * servidor. Va a la izquierda del selector, en la misma fila (`dc.html:286`).
   */
  heading: ReactNode;
  /** `id` del encabezado: le pone nombre al grupo de pestañas (`aria-labelledby`). */
  labelledBy: string;
  /** Una pestaña por viaje, como datos planos. La primera es la que se ve al cargar. */
  tabs: ServiceTabList;
};

/**
 * Pestañas de "Servicios y equipo" (`dc.html:286-311`): un selector de viaje
 * y la grilla de paneles del viaje elegido.
 *
 * Es Client Component solo por el estado de la pestaña activa. Sigue el
 * patrón de pestañas de WAI-ARIA con activación automática: `tablist`/`tab`/
 * `tabpanel`, un único tab en el orden de tabulación (roving tabindex) y
 * flechas izquierda/derecha, Inicio y Fin para moverse (el foco y la pestaña
 * activa van juntos, porque cambiar de panel es instantáneo).
 *
 * Hay un solo `tabpanel`, el del viaje activo, y las dos pestañas lo
 * controlan (`aria-controls`). No se renderizan los dos paneles con `hidden`
 * a propósito: el motor re-escanea ante nodos nuevos (`childList`), no ante
 * cambios de atributos, así que un panel que se destapa quedaría con la pose
 * que el reveal le calculó mientras estaba oculto (invisible hasta el
 * próximo scroll).
 *
 * Al cambiar de pestaña, las cards (el envoltorio con el reveal y la card con
 * el tilt) se conservan y solo se remontan las listas
 * (`key` por viaje en cada grupo, ver `ServicePanel`). Si se remontaran las
 * cards, una que está a mitad de su entrada (abajo del viewport) aparecería
 * entera por un frame y el motor la volvería a esconder con la transición
 * del reveal. El `MutationObserver` del motor ve las listas nuevas y
 * re-escanea solo: no hace falta avisarle nada.
 */
export function ServiceTabs({ heading, labelledBy, tabs }: ServiceTabsProps) {
  const baseId = useId();
  const [activeSlug, setActiveSlug] = useState<TripSlug>(tabs[0].slug);

  const activeTab = tabs.find((tab) => tab.slug === activeSlug) ?? tabs[0];
  const activeIndex = tabs.indexOf(activeTab);
  const panelId = `${baseId}-panel`;
  const tabId = (slug: TripSlug) => `${baseId}-tab-${slug}`;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    // Con modificador es un atajo del navegador (Alt+← es "Atrás"): no se toca.
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const targetIndex = keyboardTarget(event.key, activeIndex, tabs.length);
    const target = targetIndex === null ? undefined : tabs[targetIndex];
    if (!target) return;
    event.preventDefault();
    setActiveSlug(target.slug);
    // Las dos pestañas están siempre en el DOM: se puede enfocar ya, sin esperar el render.
    document.getElementById(tabId(target.slug))?.focus();
  }

  return (
    <>
      <div className={styles.header}>
        {heading}
        <div
          role="tablist"
          aria-labelledby={labelledBy}
          className={styles.tablist}
          {...reveal('right')}
        >
          {tabs.map((tab) => {
            const selected = tab.slug === activeTab.slug;
            return (
              <Button
                key={tab.slug}
                id={tabId(tab.slug)}
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                variant={selected ? 'primary' : 'ghost'}
                onClick={() => setActiveSlug(tab.slug)}
                onKeyDown={handleKeyDown}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* `tabIndex={0}`: el panel no tiene nada enfocable, y así se llega a él con Tab desde la pestaña. */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(activeTab.slug)}
        tabIndex={0}
        className={styles.panels}
      >
        {activeTab.panels.map((panel, index) => (
          <ServicePanel key={panel.id} groups={panel.groups} {...reveal('up', { delay: index })} />
        ))}
      </div>
    </>
  );
}

/**
 * A qué pestaña lleva una tecla, o `null` si la tecla no es de navegación.
 * Las flechas dan la vuelta (de la última a la primera y al revés).
 */
function keyboardTarget(key: string, current: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count;
    case 'ArrowLeft':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
