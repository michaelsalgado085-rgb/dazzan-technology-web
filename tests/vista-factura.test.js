import { describe, it, expect } from 'vitest';
import {
  lineaFactura,
  lineasFactura,
  mensajeDeError,
  mensajeSaldo,
  opcionesPago,
  resultadosFactura,
  resumenTotales,
  textoEmitida
} from '../assets/js/adaptadores/entrada/vista-factura.js';
import { lineaDesdeProducto } from '../assets/js/dominio/armar-factura.js';

const LATITUDE = { id: 'lat', nombre: 'Latitude 7420', marca: 'Dell', categoria: 'laptops', precio: 10500, stock: 2, fotos: [] };
const PELIGROSO = { ...LATITUDE, id: 'x"y', nombre: '<img src=x onerror=alert(1)>' };
// Intl separa con un espacio especial segun el navegador: se compara sin el.
const sinEspacios = (texto) => texto.replace(/\s/g, '');

describe('resultadosFactura', () => {
  it('muestra nombre, marca, existencias y precio', () => {
    const html = resultadosFactura([LATITUDE]);
    expect(html).toContain('Latitude 7420');
    expect(html).toContain('Dell · 2 en existencia');
    expect(sinEspacios(html)).toContain('L10,500.00');
  });

  it('no muestra mas del maximo', () => {
    const muchos = Array.from({ length: 12 }, (_, i) => ({ ...LATITUDE, id: `p${i}` }));
    expect(resultadosFactura(muchos, 8).match(/data-id=/g)).toHaveLength(8);
  });

  it('escapa lo que viene del producto', () => {
    const html = resultadosFactura([PELIGROSO]);
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('data-id="x&quot;y"');
  });
});

describe('lineaFactura', () => {
  it('lleva cantidad con su limite, descuento, serie e importe', () => {
    const html = lineaFactura({ ...lineaDesdeProducto(LATITUDE), descuento: 500 });
    expect(html).toContain('max="2"');
    expect(html).toContain('data-campo="descuento" value="500"');
    expect(html).toContain('data-campo="numeroSerie"');
    expect(sinEspacios(html)).toContain('L10,000.00');
  });

  it('un numero a medio escribir se muestra vacio y sin importe', () => {
    const html = lineaFactura({ ...lineaDesdeProducto(LATITUDE), cantidad: Number.NaN });
    expect(html).toContain('data-campo="cantidad" value=""');
    expect(html).toContain('>—<');
  });

  it('escapa el numero de serie escrito', () => {
    expect(lineaFactura({ ...lineaDesdeProducto(LATITUDE), numeroSerie: '"><b>' })).not.toContain('"><b>');
  });

  it('sin lineas invita a buscar', () => {
    expect(lineasFactura([])).toContain('Busca un producto');
  });
});

describe('totales y pagos', () => {
  it('resume subtotal, descuento y total', () => {
    const html = sinEspacios(resumenTotales({ subtotal: 12390, descuentoAdicional: 390, total: 12000 }));
    expect(html).toContain('L12,390.00');
    expect(html).toContain('L12,000.00');
  });

  it('un total a medio calcular se muestra con raya', () => {
    expect(resumenTotales({ subtotal: 100, descuentoAdicional: Number.NaN, total: Number.NaN })).toContain('—');
  });

  it('un cuadro por metodo de pago, con el monto escondido', () => {
    const html = opcionesPago();
    expect(html.match(/name="metodo"/g)).toHaveLength(4);
    expect(html).toContain('id="monto-financiamiento"');
    expect(html.match(/ hidden>/g)).toHaveLength(4);
  });
});

describe('mensajeSaldo', () => {
  it('con un metodo dice cuanto paga en el', () => {
    expect(sinEspacios(mensajeSaldo(500, [{ metodo: 'tarjeta', monto: Number.NaN }]))).toBe('PagaL500.00entarjeta.');
  });

  it('con varios dice cuanto falta, sobra o si cubre', () => {
    const elegidos = [{ metodo: 'efectivo', monto: 200 }, { metodo: 'tarjeta', monto: 100 }];
    expect(sinEspacios(mensajeSaldo(500, elegidos))).toBe('FaltaL200.00.');
    expect(sinEspacios(mensajeSaldo(250, elegidos))).toBe('SobraL50.00.');
    expect(mensajeSaldo(300, elegidos)).toBe('Los pagos cubren el total.');
  });

  it('con total cero avisa que no lleva pagos, y sin metodos no dice nada', () => {
    expect(mensajeSaldo(0, [])).toContain('RN-22');
    expect(mensajeSaldo(500, [])).toBe('');
    expect(mensajeSaldo(Number.NaN, [{ metodo: 'efectivo' }])).toBe('');
  });
});

describe('mensajes al emitir', () => {
  it('la factura emitida dice su numero con cinco digitos', () => {
    const texto = textoEmitida({ numero: 769, cliente: { nombre: 'Ana Pérez' }, total: 12000 });
    expect(sinEspacios(texto)).toBe('Factura00769emitidaanombredeAnaPérez,porL12,000.00.');
  });

  it('las reglas y la sesion traen su mensaje; lo demas se explica igual', () => {
    expect(mensajeDeError({ codigo: 'regla', message: 'No hay existencias' })).toBe('No hay existencias');
    expect(mensajeDeError({ codigo: 'sesion', message: 'Sin permiso' })).toBe('Sin permiso');
    expect(mensajeDeError(new Error('fetch failed'))).toContain('Revisa tu internet');
  });
});
