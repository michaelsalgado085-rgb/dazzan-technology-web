import { describe, it, expect } from 'vitest';
import { ordenarProductos } from '../assets/js/dominio/catalogo.js';

const VIEJO = { id: 'viejo', precio: 9000, creadoEn: '2026-11-01T10:00:00Z' };
const NUEVO = { id: 'nuevo', precio: 12000, precioAnterior: 15000, creadoEn: '2026-11-24T10:00:00Z' };
const MEDIO = { id: 'medio', precio: 8000, precioAnterior: 8800, creadoEn: '2026-11-15T10:00:00Z' };
const SIN_FECHA = { id: 'sin-fecha', precio: 500 };
const ids = (lista) => lista.map((producto) => producto.id);

describe('ordenarProductos: recien llegados (RN-37)', () => {
  it('lo ultimo que se cargo va primero', () => {
    expect(ids(ordenarProductos([VIEJO, NUEVO, MEDIO], 'recientes'))).toEqual(['nuevo', 'medio', 'viejo']);
  });

  it('un producto sin fecha de alta va al final', () => {
    expect(ids(ordenarProductos([SIN_FECHA, VIEJO], 'recientes'))).toEqual(['viejo', 'sin-fecha']);
  });

  it('sin fechas conserva el orden que traia', () => {
    const otro = { id: 'otro', precio: 1 };
    expect(ids(ordenarProductos([SIN_FECHA, otro], 'recientes'))).toEqual(['sin-fecha', 'otro']);
  });
});

describe('ordenarProductos: mayor descuento (RN-37)', () => {
  it('va primero el mayor porcentaje de descuento', () => {
    // NUEVO baja 20% y MEDIO 9%.
    expect(ids(ordenarProductos([MEDIO, VIEJO, NUEVO], 'descuento'))).toEqual(['nuevo', 'medio', 'viejo']);
  });

  it('los que no tienen descuento quedan al final en el orden que traian', () => {
    expect(ids(ordenarProductos([VIEJO, SIN_FECHA, MEDIO], 'descuento'))).toEqual(['medio', 'viejo', 'sin-fecha']);
  });

  it('no modifica la lista original', () => {
    const lista = [VIEJO, NUEVO];
    ordenarProductos(lista, 'descuento');
    expect(ids(lista)).toEqual(['viejo', 'nuevo']);
  });
});
