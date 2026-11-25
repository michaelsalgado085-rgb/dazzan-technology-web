import { describe, it, expect } from 'vitest';
import {
  erroresDeFactura,
  fechaVencimientoGarantia,
  formatearNumeroFactura,
  importeLineaFactura,
  totalesFactura
} from '../assets/js/dominio/factura.js';

// Reglas confirmadas por el cliente y por Michael (REQUISITOS.md, RN-10 a RN-25).

const LAPTOP = { descripcion: 'ThinkPad T480s', precio: 13900, cantidad: 1, existencias: 2 };
const TECLADO = { descripcion: 'Kumara K552', precio: 1150, cantidad: 2, existencias: 5 };

function factura(cambios = {}) {
  return {
    cliente: { nombre: 'Ana Pérez' },
    lineas: [LAPTOP],
    descuentoAdicional: 0,
    pagos: [{ metodo: 'efectivo', monto: 13900 }],
    ...cambios
  };
}

describe('formatearNumeroFactura, RN-24', () => {
  it('rellena con ceros hasta 5 digitos', () => {
    expect(formatearNumeroFactura(768)).toBe('00768');
  });

  it('el primer numero posible', () => {
    expect(formatearNumeroFactura(1)).toBe('00001');
  });

  it('pasado el limite imprime el numero completo, sin recortarlo', () => {
    expect(formatearNumeroFactura(123456)).toBe('123456');
  });

  it('rechaza cero, negativos y decimales', () => {
    expect(() => formatearNumeroFactura(0)).toThrow(RangeError);
    expect(() => formatearNumeroFactura(-5)).toThrow(RangeError);
    expect(() => formatearNumeroFactura(7.5)).toThrow(RangeError);
  });
});

describe('fechaVencimientoGarantia, RN-25', () => {
  const dia = (fecha) => [fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate()];

  it('vence el mismo dia, tres meses despues', () => {
    expect(dia(fechaVencimientoGarantia(new Date(2026, 10, 19)))).toEqual([2027, 2, 19]);
  });

  it('el ejemplo del cliente: 30 de noviembre vence el 2 de marzo', () => {
    expect(dia(fechaVencimientoGarantia(new Date(2026, 10, 30)))).toEqual([2027, 3, 2]);
  });

  it('en año bisiesto febrero tiene 29 dias y no sobra ninguno', () => {
    expect(dia(fechaVencimientoGarantia(new Date(2027, 10, 29)))).toEqual([2028, 2, 29]);
  });

  it('cruza de año sin perder el dia', () => {
    expect(dia(fechaVencimientoGarantia(new Date(2026, 11, 31)))).toEqual([2027, 3, 31]);
  });
});

describe('importes y totales, RN-08 y RN-13', () => {
  it('el importe de una linea es precio por cantidad menos su descuento', () => {
    expect(importeLineaFactura({ precio: 1150, cantidad: 2, descuento: 300 })).toBe(2000);
  });

  it('sin descuento, el importe es precio por cantidad', () => {
    expect(importeLineaFactura({ precio: 1150, cantidad: 2 })).toBe(2300);
  });

  it('el total resta el descuento adicional y no suma ISV', () => {
    const totales = totalesFactura(
      factura({ lineas: [{ ...LAPTOP, descuento: 400 }, TECLADO], descuentoAdicional: 100 })
    );
    expect(totales).toEqual({ subtotal: 15800, descuentoAdicional: 100, total: 15700 });
  });
});

describe('erroresDeFactura: una factura valida', () => {
  it('sin errores cuando todo cuadra', () => {
    expect(erroresDeFactura(factura())).toEqual([]);
  });

  it('RN-11: la identidad del cliente es opcional', () => {
    expect(erroresDeFactura(factura({ cliente: { nombre: 'Ana', identificacion: '' } }))).toEqual(
      []
    );
  });

  it('RN-22: un regalo deja el total en cero y no lleva pagos', () => {
    const regalo = factura({ lineas: [{ ...TECLADO, cantidad: 1, descuento: 1150 }], pagos: [] });
    expect(erroresDeFactura(regalo)).toEqual([]);
  });

  it('RN-20: se paga con dos metodos que suman el total', () => {
    const pagos = [
      { metodo: 'efectivo', monto: 5000 },
      { metodo: 'tarjeta', monto: 8900 }
    ];
    expect(erroresDeFactura(factura({ pagos }))).toEqual([]);
  });
});

const unError = (cambios) => erroresDeFactura(factura(cambios));

describe('erroresDeFactura: cliente y productos', () => {
  it('RN-11: sin nombre del cliente', () => {
    expect(unError({ cliente: { nombre: '   ' } })).toEqual([
      'El nombre del cliente es obligatorio (RN-11).'
    ]);
  });

  it('RN-19: sin productos', () => {
    expect(unError({ lineas: [], pagos: [] })).toEqual([
      'La factura necesita al menos un producto (RN-19).'
    ]);
  });

  it('una cantidad cero o con decimales', () => {
    const errores = unError({ lineas: [{ ...LAPTOP, cantidad: 0 }], pagos: [] });
    expect(errores[0]).toContain('entero mayor que cero');
  });

  it('vender mas de lo que hay en existencia', () => {
    expect(unError({ lineas: [{ ...LAPTOP, cantidad: 3 }] })).toContain(
      'Solo hay 2 de ThinkPad T480s en existencia.'
    );
  });
});

describe('erroresDeFactura: descuentos', () => {
  it('RN-13: un descuento de linea mayor que su importe', () => {
    expect(unError({ lineas: [{ ...LAPTOP, descuento: 13900.01 }], pagos: [] })[0]).toContain(
      'RN-13'
    );
  });

  it('RN-13: un descuento adicional mayor que el subtotal', () => {
    expect(unError({ descuentoAdicional: 13900.01, pagos: [] })).toContain(
      'El descuento adicional va de cero hasta el subtotal (RN-13).'
    );
  });
});

describe('erroresDeFactura: descuentos a medio escribir', () => {
  it('un descuento de linea que no es numero se rechaza', () => {
    expect(erroresDeFactura(factura({ lineas: [{ ...LAPTOP, descuento: Number.NaN }] })).join(' ')).toContain(
      'El descuento de ThinkPad T480s va de cero hasta su importe (RN-13).'
    );
  });

  it('un descuento adicional que no es numero se rechaza', () => {
    expect(erroresDeFactura(factura({ descuentoAdicional: Number.NaN }))).toContain(
      'El descuento adicional va de cero hasta el subtotal (RN-13).'
    );
  });
});

describe('erroresDeFactura: metodos de pago', () => {
  it('RN-14: un metodo que el negocio no acepta', () => {
    expect(unError({ pagos: [{ metodo: 'cheque', monto: 13900 }] })).toEqual([
      '"cheque" no es un metodo de pago aceptado (RN-14).'
    ]);
  });

  it('RN-22: un pago de cero', () => {
    const pagos = [
      { metodo: 'efectivo', monto: 13900 },
      { metodo: 'tarjeta', monto: 0 }
    ];
    expect(unError({ pagos })).toEqual(['Cada pago debe ser mayor que cero (RN-22).']);
  });

  it('RN-23: el mismo metodo dos veces', () => {
    const pagos = [
      { metodo: 'efectivo', monto: 6900 },
      { metodo: 'efectivo', monto: 7000 }
    ];
    expect(unError({ pagos })).toEqual([
      'Un metodo de pago no se repite en la misma factura (RN-23).'
    ]);
  });
});

describe('erroresDeFactura: la suma de los pagos', () => {
  it('RN-21: pagos que no suman el total, aunque sea por un centavo', () => {
    expect(unError({ pagos: [{ metodo: 'efectivo', monto: 13899.99 }] })).toEqual([
      'Los pagos suman 13899.99 y el total es 13900 (RN-21).'
    ]);
  });

  it('RN-21: no se anota vuelto', () => {
    expect(unError({ pagos: [{ metodo: 'efectivo', monto: 15000 }] })[0]).toContain('RN-21');
  });

  it('junta todos los errores, no solo el primero', () => {
    const errores = unError({ cliente: { nombre: '' }, pagos: [] });
    expect(errores).toHaveLength(2);
  });
});
