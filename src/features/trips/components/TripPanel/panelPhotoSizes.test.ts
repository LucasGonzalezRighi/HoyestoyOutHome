import { describe, expect, it } from 'vitest';

import { panelPhotoSizes } from './panelPhotoSizes';

describe('panelPhotoSizes', () => {
  it('una foto vertical pide el ancho del marco: la pantalla en el celular, el panel abierto en escritorio', () => {
    // Celular: 380 × 0,75 × 1,045 = 297,8. Escritorio: el ancho manda (544 × 1,045 = 568,5).
    expect(panelPhotoSizes(1200 / 1600)).toBe(
      '(max-width: 298px) 298px, (max-width: 820px) 100vw, 569px',
    );
  });

  it('una foto apaisada pide el ancho que cubre el alto del marco', () => {
    // Celular: 380 × (1400 / 788) × 1,045 = 705,5. Escritorio: 600 × (1400 / 788) × 1,045 = 1113,9.
    expect(panelPhotoSizes(1400 / 788)).toBe(
      '(max-width: 706px) 706px, (max-width: 820px) 100vw, 1114px',
    );
  });

  it('una panorámica que no entra en el corte de mobile no deja una condición imposible', () => {
    // 380 × 3 × 1,045 = 1191,3: la primera condición se queda en el corte (820px).
    expect(panelPhotoSizes(3)).toBe('(max-width: 820px) 1192px, (max-width: 820px) 100vw, 1881px');
  });
});
