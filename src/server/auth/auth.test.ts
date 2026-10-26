import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createTestSqlClient } from '@/server/db/pglite.fixture';

import {
  MAX_FAILURES_PER_KEY,
  MAX_FAILURES_TOTAL,
  MemoryLoginThrottle,
  PostgresLoginThrottle,
  WINDOW_MINUTES,
  type LoginThrottle,
} from './LoginThrottle';
import { hashPassword, verifyPassword } from './password';
import { signSessionToken, verifySessionToken } from './sessionToken';

const SECRET = 'un-secreto-de-prueba-de-mas-de-32-caracteres';

describe('hashPassword / verifyPassword', () => {
  it('reconoce la contraseña correcta y rechaza cualquier otra', async () => {
    const hash = await hashPassword('cumbre-4290');
    expect(hash).toMatch(/^scrypt:32768:8:1:[\w-]+:[\w-]+$/);
    expect(hash).not.toContain('cumbre');
    expect(await verifyPassword('cumbre-4290', hash)).toBe(true);
    expect(await verifyPassword('cumbre-4291', hash)).toBe(false);
    expect(await verifyPassword('', hash)).toBe(false);
  });

  it('dos hashes de la misma contraseña son distintos (sal aleatoria)', async () => {
    expect(await hashPassword('igual')).not.toBe(await hashPassword('igual'));
  });

  it('no tira con un hash roto: devuelve false', async () => {
    expect(await verifyPassword('x', 'no-es-un-hash')).toBe(false);
    expect(await verifyPassword('x', 'scrypt:32768:8:1:abc:corto')).toBe(false);
  });
});

describe('signSessionToken / verifySessionToken', () => {
  it('devuelve el mail de un token firmado con el mismo secreto', async () => {
    const token = await signSessionToken('admin@example.com', SECRET);
    expect(await verifySessionToken(token, SECRET)).toBe('admin@example.com');
  });

  it('rechaza tokens de otro secreto, adulterados o vacíos', async () => {
    const token = await signSessionToken('admin@example.com', SECRET);
    expect(await verifySessionToken(token, `${SECRET}-otro`)).toBeNull();
    expect(await verifySessionToken(`${token.slice(0, -2)}xx`, SECRET)).toBeNull();
    expect(await verifySessionToken(undefined, SECRET)).toBeNull();
    expect(await verifySessionToken('basura', SECRET)).toBeNull();
  });
});

/** Las mismas pruebas para los dos frenos de intentos. */
function describeThrottle(name: string, create: () => Promise<LoginThrottle>) {
  describe(name, () => {
    it(`frena una IP después de ${MAX_FAILURES_PER_KEY} intentos fallidos, sin frenar a otra`, async () => {
      const throttle = await create();
      for (let i = 0; i < MAX_FAILURES_PER_KEY; i += 1) {
        expect(await throttle.isBlocked('1.1.1.1')).toBe(false);
        await throttle.recordFailure('1.1.1.1');
      }
      expect(await throttle.isBlocked('1.1.1.1')).toBe(true);
      expect(await throttle.isBlocked('2.2.2.2')).toBe(false);
    });

    it('entrar bien olvida los fallidos de esa IP', async () => {
      const throttle = await create();
      for (let i = 0; i < MAX_FAILURES_PER_KEY; i += 1) await throttle.recordFailure('1.1.1.1');
      await throttle.reset('1.1.1.1');
      expect(await throttle.isBlocked('1.1.1.1')).toBe(false);
    });

    it(`frena a todos después de ${MAX_FAILURES_TOTAL} fallidos repartidos entre IPs`, async () => {
      const throttle = await create();
      for (let i = 0; i < MAX_FAILURES_TOTAL; i += 1) await throttle.recordFailure(`10.0.0.${i}`);
      expect(await throttle.isBlocked('9.9.9.9')).toBe(true);
    });
  });
}

describeThrottle('MemoryLoginThrottle', async () => new MemoryLoginThrottle());

describe('MemoryLoginThrottle › ventana', () => {
  it(`los fallidos vencen a los ${WINDOW_MINUTES} minutos`, async () => {
    let now = 0;
    const throttle = new MemoryLoginThrottle(() => now);
    for (let i = 0; i < MAX_FAILURES_PER_KEY; i += 1) await throttle.recordFailure('1.1.1.1');
    expect(await throttle.isBlocked('1.1.1.1')).toBe(true);
    now = WINDOW_MINUTES * 60 * 1000 + 1;
    expect(await throttle.isBlocked('1.1.1.1')).toBe(false);
  });
});

describe('PostgresLoginThrottle', () => {
  let client: Awaited<ReturnType<typeof createTestSqlClient>>;

  beforeEach(async () => {
    client = await createTestSqlClient();
  });

  afterEach(async () => {
    await client.close();
  });

  describeThrottle('contra Postgres', async () => new PostgresLoginThrottle(client));
});
