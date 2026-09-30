'use client';

import { useEffect } from 'react';

import { resolveMotionLevel } from '@/design-system/tokens/motion';

import { createMotionEngine } from '../createMotionEngine';
import { CurtainController } from '../intro/CurtainController';

/**
 * Enciende las animaciones de la página. No renderiza nada: al montar crea el
 * motor y el telón, y al desmontar los destruye.
 *
 * Va **una sola vez**, en el layout. Es el único punto de la landing que
 * necesita `'use client'` para animar: todo lo demás se marca con atributos
 * (`reveal()`, `parallax()`…) y se queda en el servidor.
 *
 * En desarrollo, StrictMode monta, desmonta y vuelve a montar: el primer par
 * motor/telón se destruye enseguida y el segundo es el que corre. Por eso la
 * limpieza tiene que ser completa (listeners, loop y timers).
 */
export function MotionRuntime(): null {
  useEffect(() => {
    const engine = createMotionEngine(resolveMotionLevel(process.env.NEXT_PUBLIC_MOTION_LEVEL));
    const curtain = new CurtainController(engine, document);
    engine.start();
    curtain.start();
    return () => {
      curtain.dispose();
      engine.dispose();
    };
  }, []);

  return null;
}
