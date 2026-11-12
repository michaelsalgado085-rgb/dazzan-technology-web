import { describe, it, expect } from 'vitest';
import {
  bloqueTotal,
  filaCotizacion,
  panelCotizacion,
  unidadesTotales
} from '../assets/js/vista-cotizacion.js';

const linea = Object.freeze({
  id: 'tec-001',
  nombre: 'Teclado RK61',
  precio: 1450,
  cantidad: 2
});

describe('filaCotizacion', () => {
  it('muestra el nombre y el importe de la linea', () => {
    const html = filaCotizacion(linea);
    expect(html).toContain('Teclado RK61');
    expect(html).toContain('2,900.00');
  });

  it('escapa el nombre del producto', () => {
    const html = filaCotizacion({ ...linea, nombre: '<b>hola</b>' });
    expect(html).not.toContain('<b>hola</b>');
  });
});

describe('bloqueTotal, RN-08', () => {
  it('muestra la suma de los importes como total estimado', () => {
    const html = bloqueTotal([linea]);
    expect(html).toContain('Total estimado');
    expect(html).toContain('2,900.00');
  });

  it('no muestra ninguna fila de ISV ni un total con recargo', () => {
    const html = bloqueTotal([linea]);
    expect(html).not.toContain('ISV');
    expect(html).not.toContain('3,335.00');
  });

  it('muestra cero con una lista vacia', () => {
    expect(bloqueTotal([])).toContain('0.00');
  });
});

describe('panelCotizacion', () => {
  it('invita a agregar productos cuando la lista esta vacia', () => {
    expect(panelCotizacion([])).toContain('cotizacion__vacia');
  });

  it('arma una fila por linea y los totales', () => {
    const html = panelCotizacion([linea, { ...linea, id: 'mou-001' }]);
    expect(html.match(/<li/g)).toHaveLength(2);
    expect(html).toContain('Total estimado');
  });
});

describe('unidadesTotales', () => {
  it('suma las cantidades de todas las lineas', () => {
    expect(unidadesTotales([linea, { ...linea, cantidad: 3 }])).toBe(5);
  });

  it('devuelve cero con una lista vacia', () => {
    expect(unidadesTotales([])).toBe(0);
  });
});
