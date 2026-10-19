import { cn } from '@/utils/cn';

import { mailtoHref } from '../../contactMail';
import styles from './EmailLink.module.css';

/** Props de `EmailLink`. */
export type EmailLinkProps = {
  /** La dirección: es el destino (`mailto:`) y también el texto del link. */
  email: string;
  className?: string;
};

/**
 * El mail de contacto como link de texto, sobre el verde del cierre. Lo usan
 * la alternativa al formulario y el mensaje de estado después de enviar.
 *
 * Es el respaldo que siempre anda: con o sin JS, con o sin una app de correo
 * configurada, la dirección queda a la vista para copiarla.
 *
 * No lleva `'use client'`: lo renderizan tanto la sección (Server Component)
 * como el formulario (Client Component).
 */
export function EmailLink({ email, className }: EmailLinkProps) {
  return (
    <a href={mailtoHref(email)} className={cn(styles.link, className)}>
      {email}
    </a>
  );
}
