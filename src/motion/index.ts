/**
 * API pública del motor de animación. Ver `README.md` de esta carpeta.
 *
 * - Para **marcar** elementos: los helpers de `attributes` (`reveal()`,
 *   `parallax()`, `marquee()`…), re-exportados acá.
 * - Para **encender** el motor en la página: `MotionRuntime`, desde
 *   `@/motion/react` (queda aparte para que este módulo no dependa de React).
 * - Para **extenderlo**: las clases base (`FrameEffect`, `ScrollEffect`,
 *   `PointerEffect`) y `createMotionEngine`, donde se registra un efecto nuevo.
 */
export * from './attributes';

export { createMotionEngine } from './createMotionEngine';
export { MotionEngine, type MotionEngineConfig } from './core/MotionEngine';
export { FrameEffect, MotionEffect, PointerEffect, ScrollEffect } from './core/MotionEffect';
export type { FrameState, MotionSettings, PointerSnapshot } from './core/FrameState';
export { PointerTracker } from './core/PointerTracker';
export { StyleWriter, type CachedStyleProperty, type StylableElement } from './core/StyleWriter';
export { CurtainController, type IntroTarget } from './intro/CurtainController';
