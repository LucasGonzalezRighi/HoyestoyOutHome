'use client';

import { useId, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from 'react';
import { flushSync } from 'react-dom';

import { Button } from '@/components/atoms/Button';
import { SelectField, TextAreaField, TextField } from '@/components/molecules/FormField';
import type { ContactFieldKey, ContactFormContent } from '@/content/sections/contact';
import { cn } from '@/utils/cn';

import {
  CONTACT_FIELD_NAMES,
  buildContactMailto,
  contactFormFallbackAction,
  missingContactFields,
  readContactForm,
} from '../../contactMail';
import { EmailLink } from '../EmailLink';

import styles from './ContactForm.module.css';

/** Los campos van sobre la tarjeta verde del cierre: siempre en su tono para fondo oscuro. */
const FIELD_TONE = 'inverse';

/** Un control de los tres campos (para el `onChange` compartido). */
type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/*
 * `useSyncExternalStore` sin fuente externa: no se suscribe a nada, solo
 * distingue el render del servidor y la hidratación (`false`) del cliente ya
 * hidratado (`true`), sin un efecto que cambie estado después de montar.
 */
const subscribeToNothing = () => () => {};
const onClient = () => true;
const onServer = () => false;

/** Props de `ContactForm`. Todo es serializable: lo renderiza un Server Component. */
export type ContactFormProps = {
  /** `contactContent.form`: textos, opciones de viaje y plantilla del mail. */
  content: ContactFormContent;
  /** A dónde va el mail (`CONTACT_EMAIL`). También se muestra en el mensaje de estado. */
  email: string;
  className?: string;
};

/**
 * El formulario breve de Contacto: nombre, viaje y mensaje. No hay backend:
 * al enviar arma un `mailto:` con el asunto ("Consulta desde la web — <viaje>")
 * y el cuerpo ya escritos (`buildContactMailto`) y abre la app de correo de
 * quien escribe.
 *
 * Es Client Component solo por el envío y los errores; la sección que lo
 * contiene sigue siendo Server Component.
 *
 * Validación: los tres campos llevan `required`. Con JS, el formulario se
 * marca `noValidate` al hidratar y valida al enviar con los textos de
 * `content/` en vez de los globos del navegador (que vienen en su idioma y
 * desaparecen solos): cada campo vacío muestra su mensaje debajo, con
 * `aria-invalid` y `aria-describedby`, y el foco va al primero. Un campo con
 * solo espacios cuenta como vacío. El mensaje se va apenas el campo tiene
 * algo escrito.
 *
 * Después de enviar, una región `role="status"` (siempre en el DOM, para que
 * el lector de pantalla la anuncie al llenarse) avisa que se abrió la app de
 * correo y deja el mail como link por si no se abrió. Los campos no se
 * vacían: si la app no abrió, lo escrito sigue ahí.
 *
 * Sin JS (el respaldo): el mismo `<form>` se envía de forma nativa a un
 * `mailto:` (`action` + `method="post"` + `enctype="text/plain"`), con la
 * validación de `required` del navegador. El navegador abre la app de correo
 * con el asunto base y un cuerpo `nombre=…`, `viaje=…`, `mensaje=…`. Como eso
 * depende del navegador y de que haya una app de correo, al lado del
 * formulario el mail queda siempre a la vista como link, y WhatsApp como
 * botón (ver `Contact`).
 */
export function ContactForm({ content, email, className }: ContactFormProps) {
  const { title, hint, fields, tripOptions, submitLabel, sentStatus, mail } = content;
  const baseId = useId();
  const hydrated = useSyncExternalStore(subscribeToNothing, onClient, onServer);
  const [missing, setMissing] = useState<readonly ContactFieldKey[]>([]);
  const [sent, setSent] = useState(false);

  const titleId = `${baseId}-titulo`;
  const hintId = `${baseId}-ayuda`;
  const fieldId = (key: ContactFieldKey) => `${baseId}-${CONTACT_FIELD_NAMES[key]}`;
  const errorOf = (key: ContactFieldKey) => (missing.includes(key) ? fields[key].error : undefined);
  const tripSelectOptions = tripOptions.map((option) => ({ value: option, label: option }));

  /** Saca el error de un campo apenas tiene algo escrito. No marca errores nuevos mientras se escribe. */
  const clearWhenFilled = (key: ContactFieldKey) => (event: ChangeEvent<FieldElement>) => {
    if (!missing.includes(key) || event.currentTarget.value.trim() === '') return;
    setMissing((current) => current.filter((item) => item !== key));
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = readContactForm(new FormData(form));
    const nextMissing = missingContactFields(values);
    const [firstMissing] = nextMissing;

    if (firstMissing) {
      // El foco va después de pintar los errores: así el lector de pantalla ya
      // encuentra `aria-invalid` y el mensaje (`aria-describedby`) al llegar al campo.
      flushSync(() => {
        setMissing(nextMissing);
        setSent(false);
      });
      const control = form.elements.namedItem(CONTACT_FIELD_NAMES[firstMissing]);
      if (control instanceof HTMLElement) control.focus();
      return;
    }

    setMissing([]);
    window.location.href = buildContactMailto(email, mail, values);
    setSent(true);
  }

  return (
    <form
      action={contactFormFallbackAction(email, mail)}
      method="post"
      encType="text/plain"
      noValidate={hydrated}
      aria-labelledby={titleId}
      aria-describedby={hintId}
      className={cn(styles.form, className)}
      onSubmit={handleSubmit}
    >
      <h3 id={titleId} className={styles.title}>
        {title}
      </h3>
      <p id={hintId} className={styles.hint}>
        {hint}
      </p>

      <div className={styles.fields}>
        <TextField
          tone={FIELD_TONE}
          id={fieldId('name')}
          name={CONTACT_FIELD_NAMES.name}
          label={fields.name.label}
          placeholder={fields.name.placeholder}
          autoComplete="name"
          required
          error={errorOf('name')}
          onChange={clearWhenFilled('name')}
        />
        <SelectField
          tone={FIELD_TONE}
          id={fieldId('trip')}
          name={CONTACT_FIELD_NAMES.trip}
          label={fields.trip.label}
          placeholder={fields.trip.placeholder}
          options={tripSelectOptions}
          defaultValue=""
          required
          error={errorOf('trip')}
          onChange={clearWhenFilled('trip')}
        />
        <TextAreaField
          tone={FIELD_TONE}
          id={fieldId('message')}
          name={CONTACT_FIELD_NAMES.message}
          label={fields.message.label}
          placeholder={fields.message.placeholder}
          required
          className={styles.message}
          error={errorOf('message')}
          onChange={clearWhenFilled('message')}
        />
      </div>

      <Button type="submit" variant="primary" size="lg" className={styles.submit}>
        {submitLabel}
      </Button>

      <p role="status" className={styles.status}>
        {sent && (
          <>
            {sentStatus.before} <EmailLink email={email} />
            {sentStatus.after}
          </>
        )}
      </p>
    </form>
  );
}
