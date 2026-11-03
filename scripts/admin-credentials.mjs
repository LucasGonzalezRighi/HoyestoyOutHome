#!/usr/bin/env node
/**
 * Genera las variables de entrada al panel de administración:
 *
 *   npm run admin:credentials
 *
 * Pide la contraseña dos veces (sin mostrarla en pantalla) e imprime
 * `ADMIN_PASSWORD_HASH` (hash scrypt, el mismo formato que
 * `src/server/auth/password.ts`) y un `ADMIN_SESSION_SECRET` aleatorio, listos
 * para pegar en `.env.local` y en Vercel → Settings → Environment Variables.
 *
 * La contraseña no se guarda en ningún lado. Si la entrada no es una terminal
 * (`echo … | npm run admin:credentials`), lee la contraseña de la primera línea.
 */
import { randomBytes, scrypt } from 'node:crypto';
import { stdin, stdout } from 'node:process';

const COST = { N: 2 ** 15, r: 8, p: 1 };
const KEY_LENGTH = 64;
const MAX_MEMORY = 128 * 1024 * 1024;
const MIN_PASSWORD_LENGTH = 8;

/** Lee una línea sin mostrar lo que se escribe. */
function promptHidden(question) {
  return new Promise((resolve) => {
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const onData = (char) => {
      if (char === '\r' || char === '\n' || char === '\u0004') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.off('data', onData);
        stdout.write('\n');
        resolve(value);
      } else if (char === '\u0003') {
        process.exit(130);
      } else if (char === '\u007f' || char === '\b') {
        value = value.slice(0, -1);
      } else {
        value += char;
      }
    };
    stdin.on('data', onData);
  });
}

/** Lee la primera línea de la entrada (cuando no es una terminal). */
async function readFirstLine() {
  let data = '';
  for await (const chunk of stdin) data += chunk;
  return data.split(/\r?\n/)[0] ?? '';
}

function hash(password) {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { ...COST, maxmem: MAX_MEMORY }, (error, key) => {
      if (error) return reject(error);
      resolve(
        [
          'scrypt',
          COST.N,
          COST.r,
          COST.p,
          salt.toString('base64url'),
          key.toString('base64url'),
        ].join(':'),
      );
    });
  });
}

let password;
if (stdin.isTTY) {
  password = await promptHidden('Contraseña del panel: ');
  const again = await promptHidden('Repetila: ');
  if (password !== again) {
    process.stderr.write('Las contraseñas no coinciden.\n');
    process.exit(1);
  }
} else {
  password = await readFirstLine();
}

if (password.length < MIN_PASSWORD_LENGTH) {
  process.stderr.write(
    `La contraseña tiene que tener al menos ${MIN_PASSWORD_LENGTH} caracteres.\n`,
  );
  process.exit(1);
}

// La salida es para copiar y pegar en `.env.local` y en Vercel.
stdout.write(`ADMIN_PASSWORD_HASH=${await hash(password)}\n`);
stdout.write(`ADMIN_SESSION_SECRET=${randomBytes(32).toString('base64url')}\n`);
