import { describe, it, expect } from 'vitest';
import {
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

  it('redondea hacia arriba un tercer decimal en cinco', () => {
    expect(redondearDosDecimales(10.555)).toBe(10.56);
  });

  it('redondea hacia arriba el caso clasico de 1.005', () => {
    expect(redondearDosDecimales(1.005)).toBe(1.01);
  });

  it('deja intacto un valor que ya tiene dos decimales', () => {
    expect(redondearDosDecimales(299.97)).toBe(299.97);
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
