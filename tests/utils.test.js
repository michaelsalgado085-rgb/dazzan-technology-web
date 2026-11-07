import { describe, it, expect } from 'vitest';
import {
  calcularISV,
  calcularTotales,
  escaparHtml,
  formatearMoneda,
  normalizarTexto,
  redondearDosDecimales
} from '../assets/js/utils.js';

describe('formatearMoneda', () => {
  it('incluye el valor formateado con dos decimales', () => {
    expect(formatearMoneda(1500)).toContain('1,500.00');
  });

  it('lanza error cuando el valor no es numerico', () => {
    expect(() => formatearMoneda('mil')).toThrow(TypeError);
  });
});

describe('redondearDosDecimales', () => {
  it('corrige errores de punto flotante', () => {
    expect(redondearDosDecimales(0.1 + 0.2)).toBe(0.3);
  });
});

describe('calcularISV', () => {
  it('aplica la tasa del 15 por ciento', () => {
    expect(calcularISV(1000)).toBe(150);
  });

  it('devuelve cero para un subtotal de cero', () => {
    expect(calcularISV(0)).toBe(0);
  });

  it('rechaza subtotales negativos', () => {
    expect(() => calcularISV(-5)).toThrow(RangeError);
  });
});

describe('calcularTotales', () => {
  it('suma subtotal, ISV y total de varias lineas', () => {
    const lineas = [
      { precio: 1000, cantidad: 2 },
      { precio: 500, cantidad: 1 }
    ];
    expect(calcularTotales(lineas)).toEqual({
      subtotal: 2500,
      isv: 375,
      total: 2875
    });
  });

  it('devuelve ceros con una lista vacia', () => {
    expect(calcularTotales([])).toEqual({ subtotal: 0, isv: 0, total: 0 });
  });
});

describe('escaparHtml', () => {
  it('neutraliza etiquetas inyectadas', () => {
    expect(escaparHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('escapa comillas simples y dobles', () => {
    expect(escaparHtml('"a\'b"')).toBe('&quot;a&#39;b&quot;');
  });
});

describe('normalizarTexto', () => {
  it('quita tildes y pasa a minusculas', () => {
    expect(normalizarTexto('Teclado Mecanico')).toBe('teclado mecanico');
  });

  it('elimina los acentos de una cadena acentuada', () => {
    expect(normalizarTexto('Ratón Inalámbrico')).toBe('raton inalambrico');
  });
});
