import { useId } from 'react';

import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import type { ServicesContent } from '@/content/sections/services';

import { ServiceTabs } from './components/ServiceTabs';
import { toServiceTabs } from './toServiceTabs';

import styles from './Services.module.css';

/** Props de `Services`: su slice de contenido. */
export type ServicesProps = {
  /** `landingContent.services`. */
  content: ServicesContent;
};

/**
 * "09 Servicios y equipo" (`dc.html:285-312`): qué incluye cada viaje y qué
 * tiene que llevar el viajero, con un selector de viaje en pestañas.
 *
 * Es Server Component: arma el encabezado y convierte el contenido (con
 * instancias del dominio) en datos planos para `ServiceTabs`, el único
 * pedazo con estado. El encabezado viaja ya renderizado como `heading`, así
 * no se hidrata nada que no cambie.
 */
export function Services({ content }: ServicesProps) {
  // Nombra al grupo de pestañas con el encabezado visible, en vez de inventar un aria-label.
  const headingId = useId();

  return (
    <Section>
      <Container>
        <ServiceTabs
          heading={
            <SectionHeading
              id={headingId}
              eyebrow={content.eyebrow}
              title={content.title}
              titleClassName={styles.title}
            />
          }
          labelledBy={headingId}
          tabs={toServiceTabs(content)}
        />
      </Container>
    </Section>
  );
}
