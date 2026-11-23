import { describe, it, expect } from 'vitest';
import { diapositivas } from '../assets/js/adaptadores/entrada/carrusel.js';

describe('diapositivas del carrusel', () => {
  it('una imagen por foto, en orden, empezando por la portada', () => {
    const html = diapositivas(['https://f/portada.jpg', 'https://f/b.jpg'], 'T480s');
    expect(html.indexOf('portada.jpg')).toBeLessThan(html.indexOf('b.jpg'));
    expect(html).toContain('alt="T480s, foto 1 de 2"');
  });

  it('escapa el nombre del producto', () => {
    expect(diapositivas(['https://f/a.jpg'], '<b>x</b>')).not.toContain('<b>');
  });
});
