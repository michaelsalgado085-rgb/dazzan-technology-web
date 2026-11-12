import { describe, it, expect } from 'vitest';
import {
  estadoStock,
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

  it('marca agotado si el stock llega negativo por un error de datos', () => {
    expect(estadoStock(-1)).toBe('agotado');
  });

  it('marca ultimas unidades desde la primera unidad', () => {
    expect(estadoStock(1)).toBe('ultimas-unidades');
  });

  it('marca ultimas unidades en el umbral bajo exacto', () => {
    expect(estadoStock(3)).toBe('ultimas-unidades');
  });

  it('marca disponible justo por encima del umbral', () => {
    expect(estadoStock(4)).toBe('disponible');
  });
});

describe('textoGarantia, RN-02: tres meses para todo producto', () => {
  it('anuncia tres meses de garantia de la tienda', () => {
    expect(textoGarantia()).toBe('Garantía de 3 meses de la tienda');
  });

  it('usa el singular cuando el plazo es de un mes', () => {
    expect(textoGarantia(1)).toBe('Garantía de 1 mes de la tienda');
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
