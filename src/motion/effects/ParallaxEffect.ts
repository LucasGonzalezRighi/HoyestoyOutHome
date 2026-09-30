import { PARALLAX } from '@/design-system/tokens/motion';

import { MOTION_ATTRIBUTES, MOTION_SELECTORS } from '../attributes';
import { queryAll, readNumber } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import type { StyleWriter } from '../core/StyleWriter';
import { easeInOutCubic } from '../math/easing';

/**
 * Capas de parallax (`[data-parallax]`, `dc.html:563-567`).
 *
 * La capa se traslada en Y en proporción a la posición de su **padre** (el
 * marco que recorta) respecto del viewport: un factor 0.4 hace que la foto del
 * hero se mueva al 40% del scroll relativo. Las marcadas con `introZoom`
 * arrancan con un 18% de zoom y lo sueltan durante la intro del telón (en el
 * diseño eso lo tenían todas las `<img>`; acá se pide explícito).
 */
export class ParallaxEffect extends ScrollEffect {
  private layers: HTMLElement[] = [];
  private frameTops: number[] = [];

  constructor(private readonly styles: StyleWriter) {
    super();
  }

  override collect(doc: Document): void {
    this.layers = queryAll(doc, MOTION_SELECTORS.parallax);
  }

  override measure(frame: FrameState): void {
    // Con el movimiento apagado no se mide: la capa queda en su lugar.
    this.frameTops = frame.off
      ? []
      : this.layers.map((layer) => layer.parentElement?.getBoundingClientRect().top ?? 0);
  }

  override apply(frame: FrameState): void {
    if (frame.off) {
      for (const layer of this.layers) layer.style.transform = '';
      return;
    }
    const { intensity: k, intro } = frame;
    this.layers.forEach((layer, index) => {
      const frameTop = this.frameTops[index];
      if (frameTop === undefined) return;
      const factor = readNumber(layer, MOTION_ATTRIBUTES.parallax) || 0;
      const zoom = layer.hasAttribute(MOTION_ATTRIBUTES.parallaxZoom)
        ? 1 +
          PARALLAX.introZoom *
            (1 - easeInOutCubic(intro)) *
            Math.min(k, PARALLAX.introZoomMaxIntensity)
        : 1;
      this.styles.set(
        layer,
        'transform',
        `translate3d(0, ${(-frameTop * factor * Math.min(k, PARALLAX.maxIntensity)).toFixed(1)}px, 0) scale(${zoom.toFixed(4)})`,
      );
    });
  }
}
