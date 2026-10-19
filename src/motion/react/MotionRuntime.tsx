'use client';

import { useEffect } from 'react';

import { resolveMotionLevel } from '@/design-system/tokens/motion';

import { createMotionEngine } from '../createMotionEngine';

/**
 * Enciende las animaciones de la página. No renderiza nada: al montar crea el
 * motor y al desmontar lo destruye.
 *
 * Va **una sola vez**, en el layout. Es el único punto de la landing que
 * necesita `'use client'` para animar: todo lo demás se marca con atributos
 * (`reveal()`, `parallax()`…) y se queda en el servidor.
 *
 * Sin telón de entrada (se sacó por pedido del cliente, octubre 2026): la
 * intro del hero la arranca el motor en su primer frame, al hidratar.
 *
 * En desarrollo, StrictMode monta, desmonta y vuelve a montar: el primer motor
 * se destruye enseguida y el segundo es el que corre. Por eso la limpieza
 * tiene que ser completa (listeners y loop).
 */
export function MotionRuntime(): null {
  useEffect(() => {
    const engine = createMotionEngine(resolveMotionLevel(process.env.NEXT_PUBLIC_MOTION_LEVEL));
    engine.start();
    return () => {
      engine.dispose();
    };
  }, []);

  return null;
}
