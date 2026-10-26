import { ensureSchema } from '@/server/db/schema';
import type { SqlClient } from '@/server/db/SqlClient';

/**
 * Frena a quien prueba contraseñas: después de `MAX_FAILURES_PER_KEY` intentos
 * fallidos desde la misma IP en `WINDOW_MINUTES`, esa IP no puede intentar
 * más hasta que pase la ventana. Hay además un tope global
 * (`MAX_FAILURES_TOTAL`) para los intentos repartidos entre muchas IPs.
 *
 * El hash scrypt ya hace cada intento lento (~100 ms); esto pone un techo.
 */
export interface LoginThrottle {
  /** Si esa IP (o el panel entero) está frenada ahora. */
  isBlocked(key: string): Promise<boolean>;
  /** Anota un intento fallido. */
  recordFailure(key: string): Promise<void>;
  /** Olvida los fallidos de esa IP (al entrar bien). */
  reset(key: string): Promise<void>;
}

/** Ventana de tiempo en la que se cuentan los intentos fallidos. */
export const WINDOW_MINUTES = 15;
/** Intentos fallidos permitidos por IP en la ventana. */
export const MAX_FAILURES_PER_KEY = 5;
/** Intentos fallidos permitidos en total en la ventana (todas las IPs juntas). */
export const MAX_FAILURES_TOTAL = 30;

const WINDOW_MS = WINDOW_MINUTES * 60 * 1000;

/**
 * En memoria: para desarrollo. En Vercel no alcanza (cada instancia tiene su
 * propia memoria y se reinicia), por eso allá se usa la base.
 */
export class MemoryLoginThrottle implements LoginThrottle {
  private failures: { key: string; at: number }[] = [];

  constructor(private readonly now: () => number = Date.now) {}

  private recent(): { key: string; at: number }[] {
    const since = this.now() - WINDOW_MS;
    this.failures = this.failures.filter((failure) => failure.at > since);
    return this.failures;
  }

  async isBlocked(key: string): Promise<boolean> {
    const recent = this.recent();
    return (
      recent.length >= MAX_FAILURES_TOTAL ||
      recent.filter((failure) => failure.key === key).length >= MAX_FAILURES_PER_KEY
    );
  }

  async recordFailure(key: string): Promise<void> {
    this.failures.push({ key, at: this.now() });
  }

  async reset(key: string): Promise<void> {
    this.failures = this.failures.filter((failure) => failure.key !== key);
  }
}

/** En Postgres (tabla `admin_login_failures`): compartido entre todas las instancias. */
export class PostgresLoginThrottle implements LoginThrottle {
  constructor(private readonly client: SqlClient) {}

  async isBlocked(key: string): Promise<boolean> {
    await ensureSchema(this.client);
    // De paso borra lo viejo: la tabla nunca crece más allá de una ventana.
    await this.client.query(
      `DELETE FROM admin_login_failures WHERE failed_at < now() - make_interval(mins => $1)`,
      [WINDOW_MINUTES],
    );
    const [row] = await this.client.query(
      `SELECT count(*) AS total, count(*) FILTER (WHERE key = $1) AS own
         FROM admin_login_failures`,
      [key],
    );
    return (
      Number(row?.total ?? 0) >= MAX_FAILURES_TOTAL || Number(row?.own ?? 0) >= MAX_FAILURES_PER_KEY
    );
  }

  async recordFailure(key: string): Promise<void> {
    await ensureSchema(this.client);
    await this.client.query('INSERT INTO admin_login_failures (key) VALUES ($1)', [key]);
  }

  async reset(key: string): Promise<void> {
    await ensureSchema(this.client);
    await this.client.query('DELETE FROM admin_login_failures WHERE key = $1', [key]);
  }
}
