import {
  MOTION_LEVELS,
  RESPECT_OS_REDUCED_MOTION,
  type MotionLevel,
} from '@/design-system/tokens/motion';

import type { MotionEffect } from './core/MotionEffect';
import { MotionEngine } from './core/MotionEngine';
import { PointerTracker } from './core/PointerTracker';
import { StyleWriter } from './core/StyleWriter';
import { BackgroundShiftEffect } from './effects/BackgroundShiftEffect';
import { CounterEffect } from './effects/CounterEffect';
import { CoverPairEffect } from './effects/CoverPairEffect';
import { CursorEffect } from './effects/CursorEffect';
import { MagnetEffect } from './effects/MagnetEffect';
import { MarqueeEffect } from './effects/MarqueeEffect';
import { NavBarEffect } from './effects/NavBarEffect';
import { ParallaxEffect } from './effects/ParallaxEffect';
import { PinSplitEffect } from './effects/PinSplitEffect';
import { RevealEffect } from './effects/RevealEffect';
import { ScrollProgressEffect } from './effects/ScrollProgressEffect';
import { TiltEffect } from './effects/TiltEffect';
import { TimelineEffect } from './effects/TimelineEffect';

/**
 * Arma el motor con todos los efectos de la landing. Es el único lugar que
 * conoce la lista: un efecto nuevo se registra acá y el loop no se toca
 * (abierto/cerrado).
 *
 * **El orden importa.** El motor recorre esta lista en cada fase, así que el
 * orden de la lista es el orden de cada fase:
 *
 * - `tick` (cada frame): imanes → cursor → cintas. **Se aparta del original**,
 *   que corría cursor → cintas → imanes (`dc.html:483-511`): el imán es el
 *   único `tick` que lee layout (`getBoundingClientRect` de cada botón), y
 *   después de las escrituras de `transform` del cursor y las cintas esa
 *   lectura obligaba al navegador a recalcular estilos en el momento. Primero,
 *   lee con el estilo limpio. Los tres escriben elementos distintos, así que
 *   la pose de cada uno no cambia.
 * - `apply` (escritura con el scroll): el orden del original sin los efectos
 *   que se sacaron por pedido del cliente (octubre 2026: scroll horizontal,
 *   stack, drift y skew): progreso → nav → fondo → cortinas → secuencia del contacto → timeline → contadores → parallax
 *   → cintas (solo su reseteo si el movimiento está apagado) → reveals
 *   (`dc.html:528-597`). El imán no tiene `measure` ni `apply`, así que
 *   ponerlo primero no cambia el orden de esas fases.
 *
 * Solo va en `window`: se llama desde el `useEffect` de `MotionRuntime`.
 *
 * @param level Nivel de animaciones (`NEXT_PUBLIC_MOTION_LEVEL`, ya resuelto).
 */
export function createMotionEngine(level: MotionLevel): MotionEngine {
  // Una sola caché de estilos para todos los efectos, y el estado del puntero
  // que alimenta el motor.
  const styles = new StyleWriter();
  const pointer = new PointerTracker(window);

  const effects: readonly MotionEffect[] = [
    new MagnetEffect(styles),
    new CursorEffect(),
    new ScrollProgressEffect(),
    new NavBarEffect(),
    new BackgroundShiftEffect(styles),
    new CoverPairEffect(styles),
    new PinSplitEffect(),
    new TimelineEffect(),
    new CounterEffect(),
    new ParallaxEffect(styles),
    new MarqueeEffect(),
    new RevealEffect(styles),
    new TiltEffect(),
  ];

  return new MotionEngine(
    { intensity: MOTION_LEVELS[level], respectReducedMotion: RESPECT_OS_REDUCED_MOTION },
    effects,
    pointer,
  );
}
