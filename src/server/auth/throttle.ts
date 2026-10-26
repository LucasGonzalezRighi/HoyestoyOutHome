import 'server-only';

import { neonSqlClient } from '@/server/db/neon';
import { serverEnv } from '@/server/env';

import { MemoryLoginThrottle, PostgresLoginThrottle, type LoginThrottle } from './LoginThrottle';

let throttle: LoginThrottle | undefined;

/**
 * El freno de intentos de entrada: en la base si hay `DATABASE_URL` (lo
 * comparten todas las instancias de Vercel), en memoria si no (la compu).
 */
export function getLoginThrottle(): LoginThrottle {
  throttle ??= serverEnv.databaseUrl
    ? new PostgresLoginThrottle(neonSqlClient(serverEnv.databaseUrl))
    : new MemoryLoginThrottle();
  return throttle;
}
