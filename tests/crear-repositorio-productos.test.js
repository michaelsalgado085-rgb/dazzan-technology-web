import { describe, it, expect } from 'vitest';
import { crearRepositorioProductos } from '../assets/js/adaptadores/salida/crear-repositorio-productos.js';

describe('crearRepositorioProductos', () => {
  it('fabrica un repositorio que cumple el puerto para cada origen', () => {
    for (const origen of ['json', 'supabase']) {
      expect(typeof crearRepositorioProductos(origen).inventario).toBe('function');
    }
  });

  it('sin origen usa el configurado', () => {
    expect(typeof crearRepositorioProductos().inventario).toBe('function');
  });

  it('un origen desconocido es un error, no un repositorio vacio', () => {
    expect(() => crearRepositorioProductos('mysql')).toThrow('mysql');
  });
});
