import { describe, it, expect } from 'vitest';
import {
  bloqueTotales,
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

describe('bloqueTotales', () => {
  it('calcula subtotal, ISV y total', () => {
    const html = bloqueTotales([linea]);
    expect(html).toContain('2,900.00');
    expect(html).toContain('435.00');
    expect(html).toContain('3,335.00');
  });

  it('muestra ceros con una lista vacia', () => {
    expect(bloqueTotales([])).toContain('0.00');
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
