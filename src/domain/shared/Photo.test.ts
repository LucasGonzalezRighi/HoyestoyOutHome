import { describe, expect, it } from 'vitest';

import { Photo } from './Photo';

const summit = new Photo({
  src: '/images/photos/cumbre.jpg',
  alt: 'Cumbre',
  width: 1080,
  height: 1350,
});

describe('Photo', () => {
  it('encuadra al centro si no se indica otra cosa', () => {
    expect(summit.position).toBe('center');
    expect(summit.src).toBe('/images/photos/cumbre.jpg');
    expect(summit.alt).toBe('Cumbre');
  });

  it('expone sus dimensiones y la proporción lista para `aspect-ratio`', () => {
    expect(summit.width).toBe(1080);
    expect(summit.height).toBe(1350);
    expect(summit.aspectRatio).toBe('1080 / 1350');
  });

  it('es decorativa solo con alt vacío', () => {
    expect(summit.isDecorative).toBe(false);
    expect(summit.withAlt('').isDecorative).toBe(true);
  });

  it('los with… devuelven instancias nuevas y no tocan la original', () => {
    const framed = summit.withPosition('center 62%');
    expect(framed).not.toBe(summit);
    expect(framed.position).toBe('center 62%');
    expect(framed.alt).toBe('Cumbre');
    expect(summit.position).toBe('center');
  });

  it('los with… conservan las dimensiones', () => {
    const decorative = summit.withAlt('');
    const framed = summit.withPosition('center 75%');
    expect(decorative.aspectRatio).toBe('1080 / 1350');
    expect(framed.width).toBe(1080);
    expect(framed.height).toBe(1350);
  });

  it('es compatible con la forma plana que reciben los componentes', () => {
    const plain: { src: string; alt: string; position?: string } = summit;
    expect(plain.position).toBe('center');
  });

  it('tira con rutas relativas, alts de puros espacios o encuadre vacío', () => {
    const size = { width: 10, height: 10 };
    expect(() => new Photo({ src: 'images/x.jpg', alt: 'x', ...size })).toThrow(
      'tiene que empezar con "/"',
    );
    expect(() => new Photo({ src: '/x.jpg', alt: '  ', ...size })).toThrow('solo espacios');
    expect(() => summit.withPosition(' ')).toThrow('El encuadre de');
  });

  it('tira con dimensiones que no son enteros mayores que 0', () => {
    const base = { src: '/x.jpg', alt: 'x' };
    expect(() => new Photo({ ...base, width: 0, height: 10 })).toThrow('El ancho de /x.jpg');
    expect(() => new Photo({ ...base, width: 10, height: -1 })).toThrow('El alto de /x.jpg');
    expect(() => new Photo({ ...base, width: 10.5, height: 10 })).toThrow('número entero');
    expect(() => new Photo({ ...base, width: 10, height: Number.NaN })).toThrow('El alto');
  });
});
