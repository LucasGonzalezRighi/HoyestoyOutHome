import { LinkButton } from '@/components/atoms/Button';
import { Section } from '@/components/atoms/Section';
import { VisuallyHidden } from '@/components/atoms/VisuallyHidden';
import { WhatsAppIcon } from '@/components/atoms/WhatsAppIcon';
import { SECTION_IDS } from '@/constants/sections';
import type { ContactContent } from '@/content/sections/contact';
import { backgroundShift, pinSplit } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import { CLOSING_BACKGROUND } from './closingBackground';
import { ContactForm } from './components/ContactForm';
import { EmailLink } from './components/EmailLink';
import styles from './Contact.module.css';

/** Lado del logo de WhatsApp dentro del botón. */
const CTA_ICON_SIZE = 20;

/** `id` del título: le da nombre accesible a la sección (`aria-labelledby`). */
const TITLE_ID = `${SECTION_IDS.contact}-titulo`;

/** Una mitad de la frase gigante, con su reflejo debajo. */
function GiantHalf({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn(styles.half, className)}>
      <span className={styles.word}>{text}</span>
      <span className={cn(styles.word, styles.reflection)}>{text}</span>
    </span>
  );
}

/** Props de `Contact`: solo su slice de contenido. */
export type ContactProps = {
  /** `landingContent.contact`. */
  content: ContactContent;
};

/**
 * Contacto, el cierre del home, como el contacto del portafolio del cliente
 * (pedido del cliente, octubre 2026): una secuencia fija que el scroll recorre.
 *
 * 1. Entra la frase gigante, cerrada y centrada: "La montaña te espera."
 * 2. Se parte: "La montaña" viaja a la izquierda y "te espera." a la derecha.
 * 3. Debajo aparece el contenido: el título "¿Te animás a subir?", la bajada,
 *    WhatsApp y el mail a la izquierda, y el formulario a la derecha.
 * 4. Al final, el footer sube por encima y la tapa con un desenfoque suave.
 *
 * Las etapas las escribe el motor (`pinSplit()`, `PinSplitEffect`) como
 * custom properties y el CSS las convierte en movimiento. En un teléfono no
 * se fija: la frase se abre a medida que la sección entra. Sin JS o con el
 * movimiento apagado, se ve todo de una, sin fijarse.
 *
 * La frase es decorativa para el lector de pantalla en sus mitades (que se
 * leerían "La montañate espera.") y entera en texto oculto.
 *
 * Server Component: el único pedazo cliente es el formulario.
 */
export function Contact({ content }: ContactProps) {
  const { giant, title, lead, email, form, channels } = content;

  return (
    <Section
      id={SECTION_IDS.contact}
      aria-labelledby={TITLE_ID}
      spacing="none"
      className={styles.section}
      {...backgroundShift(CLOSING_BACKGROUND)}
    >
      <div className={styles.pin} {...pinSplit()}>
        <div className={styles.panel}>
          <p className={styles.giant}>
            <VisuallyHidden>{`${giant.start} ${giant.end}`}</VisuallyHidden>
            <span className={styles.halves} aria-hidden="true">
              <GiantHalf text={giant.start} className={styles.halfStart} />
              <GiantHalf text={giant.end} className={styles.halfEnd} />
            </span>
          </p>

          <div className={styles.reveal}>
            <div className={styles.intro}>
              <h2 id={TITLE_ID} className={styles.title}>
                {title}
              </h2>
              <p className={styles.lead}>{lead}</p>
              <LinkButton
                href={channels.cta.href}
                external={channels.cta.external}
                variant="secondary"
                size="lg"
                tone="inverse"
                icon={<WhatsAppIcon size={CTA_ICON_SIZE} />}
                className={styles.cta}
              >
                {channels.cta.label}
              </LinkButton>
              <p className={styles.email}>
                {channels.emailIntro} <EmailLink email={email} />
              </p>
            </div>

            <div className={styles.formColumn}>
              <ContactForm content={form} email={email} />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
