import { describe, expect, it } from 'vitest';

import { difficultyLabel, isDifficulty } from './Difficulty';

describe('Difficulty', () => {
  it('se lee como el tag del diseño', () => {
    expect(difficultyLabel('media')).toBe('Dificultad media');
  });

  it('la guarda reconoce solo los niveles existentes', () => {
    expect(isDifficulty('alta')).toBe(true);
    expect(isDifficulty('extrema')).toBe(false);
  });
});
