import { describe, expect, it } from 'vitest';

import { Testimonial, type TestimonialParams } from './Testimonial';

const params: TestimonialParams = {
  quote: 'Fui sola y volví con amigos.',
  author: 'Luciana F.',
  city: 'Buenos Aires',
  tripName: 'Lago Lolog',
};

describe('Testimonial', () => {
  it('por defecto tiene 5 estrellas', () => {
    const testimonial = new Testimonial(params);
    expect(testimonial.rating).toBe(5);
    expect(testimonial.stars()).toBe('★★★★★');
    expect(testimonial.ratingLabel()).toBe('5 estrellas');
  });

  it('completa con estrellas vacías y pluraliza la etiqueta', () => {
    expect(new Testimonial({ ...params, rating: 4 }).stars()).toBe('★★★★☆');
    expect(new Testimonial({ ...params, rating: 1 }).ratingLabel()).toBe('1 estrella');
  });

  it('pone la frase entre comillas tipográficas', () => {
    expect(new Testimonial(params).quotedText()).toBe('“Fui sola y volví con amigos.”');
  });

  it('tira con calificaciones fuera de 1–5 o no enteras', () => {
    expect(() => new Testimonial({ ...params, rating: 0 })).toThrow('entre 1 y 5');
    expect(() => new Testimonial({ ...params, rating: 6 })).toThrow('entre 1 y 5');
    expect(() => new Testimonial({ ...params, rating: 4.5 })).toThrow();
  });

  it('tira con textos en blanco', () => {
    expect(() => new Testimonial({ ...params, quote: '' })).toThrow('La frase del testimonio');
    expect(() => new Testimonial({ ...params, city: ' ' })).toThrow('La ciudad de Luciana F.');
  });
});
