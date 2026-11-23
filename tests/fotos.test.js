import { describe, it, expect } from 'vitest';
import {
  agregarFotos,
  dimensionesReducidas,
  erroresDeFotos,
  ponerPortada,
  portada,
  quitarFoto
} from '../assets/js/dominio/fotos.js';

// RN-33: hasta 6 fotos, la primera es la portada. Confirmado el 23 de noviembre de 2026.

describe('agregarFotos', () => {
  it('agrega al final, sin tocar la portada', () => {
    expect(agregarFotos(['a'], ['b', 'c'])).toEqual({ fotos: ['a', 'b', 'c'], rechazadas: 0 });
  });

  it('llega justo a 6', () => {
    expect(agregarFotos(['a', 'b', 'c', 'd', 'e'], ['f']).fotos).toHaveLength(6);
  });

  it('las que no caben se cuentan para avisar', () => {
    expect(agregarFotos(['a', 'b', 'c', 'd', 'e'], ['f', 'g', 'h'])).toEqual({
      fotos: ['a', 'b', 'c', 'd', 'e', 'f'],
      rechazadas: 2
    });
  });

  it('con 6 ya no entra ninguna', () => {
    expect(agregarFotos(['a', 'b', 'c', 'd', 'e', 'f'], ['g']).rechazadas).toBe(1);
  });
});

describe('portada', () => {
  it('elegir otra portada la mueve al principio y las demas conservan su orden', () => {
    expect(ponerPortada(['a', 'b', 'c', 'd'], 2)).toEqual(['c', 'a', 'b', 'd']);
  });

  it('elegir la que ya es portada, o una que no existe, no cambia nada', () => {
    expect(ponerPortada(['a', 'b'], 0)).toEqual(['a', 'b']);
    expect(ponerPortada(['a', 'b'], 5)).toEqual(['a', 'b']);
  });

  it('la portada es la primera; sin fotos no hay portada', () => {
    expect(portada(['a', 'b'])).toBe('a');
    expect(portada([])).toBeNull();
    expect(portada()).toBeNull();
  });

  it('quitar la portada deja de portada a la siguiente', () => {
    expect(portada(quitarFoto(['a', 'b', 'c'], 0))).toBe('b');
  });
});

describe('erroresDeFotos', () => {
  it('hasta 6 no hay error; 7 si', () => {
    expect(erroresDeFotos(['1', '2', '3', '4', '5', '6'])).toEqual([]);
    expect(erroresDeFotos(['1', '2', '3', '4', '5', '6', '7'])).toEqual([
      'Un producto lleva hasta 6 fotos (RN-33).'
    ]);
  });
});

describe('dimensionesReducidas', () => {
  it('una foto del iPhone (4032 x 3024) queda en 1600 de lado mayor', () => {
    expect(dimensionesReducidas(4032, 3024)).toEqual({ ancho: 1600, alto: 1200 });
  });

  it('una foto vertical achica por el alto', () => {
    expect(dimensionesReducidas(3024, 4032)).toEqual({ ancho: 1200, alto: 1600 });
  });

  it('una foto chica no se agranda', () => {
    expect(dimensionesReducidas(800, 600)).toEqual({ ancho: 800, alto: 600 });
  });
});
