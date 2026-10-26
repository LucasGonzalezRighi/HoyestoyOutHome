'use client';

import { CircleAlert } from 'lucide-react';
import { useActionState } from 'react';

import { Button } from '@/components/atoms/Button';
import { adminContent } from '@/content/admin';

import { login, type LoginState } from '../../actions/auth';
import ui from '../ui/ui.module.css';

import styles from './LoginForm.module.css';

const { login: copy } = adminContent;

/**
 * El formulario de entrada al panel. El error es uno solo y no dice si falló
 * el mail o la contraseña.
 *
 * @param next A dónde volver después de entrar (lo valida el servidor).
 */
export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={formAction} className={styles.form}>
      {next && <input type="hidden" name="next" value={next} />}
      <div className={ui.field}>
        <label htmlFor="login-email" className={ui.label}>
          {copy.email}
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className={ui.control}
        />
      </div>
      <div className={ui.field}>
        <label htmlFor="login-password" className={ui.label}>
          {copy.password}
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={ui.control}
        />
      </div>
      {state.error && (
        <p className={ui.error} role="alert">
          <CircleAlert size={15} strokeWidth={2.75} aria-hidden="true" className={ui.errorIcon} />
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className={styles.submit}>
        {pending ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}
