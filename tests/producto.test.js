import { describe, it, expect } from 'vitest';
import {
  estadoStock,
  garantiaMeses,
  porcentajeDescuento,
  requiereAvisoEstado,
  textoGarantia
} from '../assets/js/producto.js';

const MACBOOK = {
  nombre: 'MacBook Air M1',
  condicion: 'usado',
  precio: 22000,
  stock: 1
};

const LAPTOP_ECONOMICA = {
  nombre: 'IdeaPad 3',
  condicion: 'usado',
  precio: 13900,
  stock: 4
};

const TECLADO = {
  nombre: 'Kumara K552',
  condicion: 'nuevo',
  precio: 1150,
  stock: 8
};

describe('estadoStock', () => {
  it('marca agotado cuando no hay unidades', () => {
    expect(estadoStock(0)).toBe('agotado');
  });

  it('marca ultimas unidades en el umbral bajo', () => {
    expect(estadoStock(3)).toBe('ultimas-unidades');
  });

  it('marca disponible por encima del umbral', () => {
    expect(estadoStock(10)).toBe('disponible');
  });
});

describe('garantiaMeses', () => {
  it('da 6 meses al equipo usado de gama alta', () => {
    expect(garantiaMeses(MACBOOK)).toBe(6);
  });

  it('da 3 meses al equipo usado de hasta L 15,000', () => {
    expect(garantiaMeses(LAPTOP_ECONOMICA)).toBe(3);
  });

  it('no asigna garantia de tienda a producto nuevo', () => {
    expect(garantiaMeses(TECLADO)).toBe(0);
  });

  it('respeta un valor explicito en el producto', () => {
    expect(garantiaMeses({ ...LAPTOP_ECONOMICA, garantiaMeses: 12 })).toBe(12);
  });
});

describe('textoGarantia', () => {
  it('menciona al fabricante en producto nuevo', () => {
    expect(textoGarantia(TECLADO)).toContain('fabricante');
  });

  it('indica los meses en equipo usado', () => {
    expect(textoGarantia(MACBOOK)).toContain('6 meses');
  });
});

describe('requiereAvisoEstado', () => {
  it('exige aviso en equipo usado', () => {
    expect(requiereAvisoEstado(MACBOOK)).toBe(true);
  });

  it('no exige aviso en producto nuevo', () => {
    expect(requiereAvisoEstado(TECLADO)).toBe(false);
  });
});

describe('porcentajeDescuento', () => {
  it('calcula el descuento frente al precio anterior', () => {
    expect(porcentajeDescuento({ precio: 8000, precioAnterior: 10000 })).toBe(20);
  });

  it('devuelve cero cuando no hay precio anterior', () => {
    expect(porcentajeDescuento({ precio: 8000 })).toBe(0);
  });

  it('devuelve cero cuando el precio anterior no es mayor', () => {
    expect(porcentajeDescuento({ precio: 8000, precioAnterior: 7000 })).toBe(0);
  });
});
