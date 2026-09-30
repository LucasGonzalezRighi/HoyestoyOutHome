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
import { CursorEffect } from './effects/CursorEffect';
import { DriftEffect } from './effects/DriftEffect';
import { HorizontalScrollEffect } from './effects/HorizontalScrollEffect';
import { MagnetEffect } from './effects/MagnetEffect';
import { MarqueeEffect } from './effects/MarqueeEffect';
import { ParallaxEffect } from './effects/ParallaxEffect';
import { RevealEffect } from './effects/RevealEffect';
import { ScrollProgressEffect } from './effects/ScrollProgressEffect';
import { SkewEffect } from './effects/SkewEffect';
import { StackEffect } from './effects/StackEffect';
import { TiltEffect } from './effects/TiltEffect';
import { TimelineEffect } from './effects/TimelineEffect';

/**
 * Arma el motor con todos los efectos de la landing. Es el único lugar que
 * conoce la lista: un efecto nuevo se registra acá y el loop no se toca
 * (abierto/cerrado).
 *
 * **El orden importa.** El motor recorre esta lista en cada fase, así que el
 * orden de la lista es el orden de cada fase, y reproduce el del `frame()`
 * original:
 *
 * - `tick` (cada frame): cursor → cintas → imanes (`dc.html:483-511`).
 * - `apply` (escritura con el scroll): progreso → fondo → horizontal → stack →
 *   timeline → contadores → parallax → drift → cintas (solo su reseteo si el
 *   movimiento está apagado) → skew → reveals (`dc.html:528-597`).
 *
 * Solo va en `window`: se llama desde el `useEffect` de `MotionRuntime`.
 *
 * @param level Nivel de animaciones (`NEXT_PUBLIC_MOTION_LEVEL`, ya resuelto).
 */
export function createMotionEngine(level: MotionLevel): MotionEngine {
  // Compartidos: una sola caché de estilos y un solo estado del puntero.
  const styles = new StyleWriter();
  const pointer = new PointerTracker(window);

  const effects: readonly MotionEffect[] = [
    new CursorEffect(),
    new ScrollProgressEffect(),
    new BackgroundShiftEffect(styles),
    new HorizontalScrollEffect(styles),
    new StackEffect(styles),
    new TimelineEffect(),
    new CounterEffect(),
    new ParallaxEffect(styles),
    new DriftEffect(styles),
    new MarqueeEffect(),
    new MagnetEffect(styles),
    new SkewEffect(styles, pointer),
    new RevealEffect(styles),
    new TiltEffect(pointer),
  ];

  return new MotionEngine(
    { intensity: MOTION_LEVELS[level], respectReducedMotion: RESPECT_OS_REDUCED_MOTION },
    effects,
    pointer,
  );
}
