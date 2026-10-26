import { describe, expect, it } from 'vitest';

import { sniffPhotoType } from './imageFile';

/** Bytes a partir de números y texto ASCII. */
function bytes(...parts: (number | string)[]): Uint8Array {
  return Uint8Array.from(
    parts.flatMap((part) =>
      typeof part === 'number' ? [part] : [...part].map((char) => char.charCodeAt(0)),
    ),
  );
}

describe('sniffPhotoType', () => {
  it('reconoce JPG, PNG y WebP por su firma', () => {
    expect(sniffPhotoType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe('image/jpeg');
    expect(sniffPhotoType(bytes(0x89, 'PNG', 0x0d, 0x0a, 0x1a, 0x0a, 0))).toBe('image/png');
    expect(sniffPhotoType(bytes('RIFF', 0, 0, 0, 0, 'WEBPVP8 '))).toBe('image/webp');
  });

  it('rechaza lo que no es una foto aunque se llame .jpg', () => {
    expect(sniffPhotoType(bytes('<svg xmlns'))).toBeUndefined();
    expect(sniffPhotoType(bytes('GIF89a'))).toBeUndefined();
    expect(sniffPhotoType(new Uint8Array())).toBeUndefined();
  });
});
