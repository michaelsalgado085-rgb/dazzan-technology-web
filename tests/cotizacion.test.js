import { describe, it, expect } from 'vitest';
import {
  agregarLinea,
  calcularTotales,
  construirMensaje,
  enlaceWhatsApp,
  esGravable,
  quitarLinea
} from '../assets/js/cotizacion.js';

const LAPTOP = {
  id: 1,
  nombre: 'Vostro 5410',
  precio: 9900,
  stock: 2,
  condicion: 'usado'
};
const TECLADO = {
  id: 2,
  nombre: 'Teclado RK61',
  precio: 1450,
  stock: 5,
  condicion: 'nuevo'
};
const AGOTADO = {
  id: 9,
  nombre: 'Agotado',
  precio: 500,
  stock: 0,
  condicion: 'nuevo'
};
const SIN_CONDICION = { id: 3, nombre: 'Sin clasificar', precio: 2000, stock: 1 };

describe('agregarLinea', () => {
  it('agrega un producto nuevo a la lista', () => {
    expect(agregarLinea([], LAPTOP)).toHaveLength(1);
  });

  it('acumula cantidad si el producto ya estaba', () => {
    const lineas = agregarLinea(agregarLinea([], LAPTOP), LAPTOP);
    expect(lineas[0].cantidad).toBe(2);
  });

  it('nunca supera el stock disponible', () => {
    const lineas = agregarLinea([], LAPTOP, 10);
    expect(lineas[0].cantidad).toBe(2);
  });

  it('ignora productos agotados', () => {
    expect(agregarLinea([], AGOTADO)).toHaveLength(0);
  });

  it('no modifica la lista recibida', () => {
    const original = [];
    agregarLinea(original, LAPTOP);
    expect(original).toHaveLength(0);
  });

  it('copia la condicion del producto a la linea', () => {
    expect(agregarLinea([], TECLADO)[0].condicion).toBe('nuevo');
  });
});

describe('quitarLinea', () => {
  it('elimina el producto indicado', () => {
    const lineas = agregarLinea([], LAPTOP);
    expect(quitarLinea(lineas, 1)).toHaveLength(0);
  });

  it('deja la lista igual si el id no existe', () => {
    const lineas = agregarLinea([], LAPTOP);
    expect(quitarLinea(lineas, 99)).toHaveLength(1);
  });
});

describe('esGravable', () => {
  it('grava el producto nuevo', () => {
    expect(esGravable({ condicion: 'nuevo' })).toBe(true);
  });

  it('no grava el equipo usado', () => {
    expect(esGravable({ condicion: 'usado' })).toBe(false);
  });

  it('no grava una linea sin condicion declarada', () => {
    expect(esGravable({})).toBe(false);
  });
});

describe('calcularTotales, aritmetica', () => {
  it('devuelve ceros con una lista vacia', () => {
    expect(calcularTotales([])).toEqual({ subtotal: 0, isv: 0, total: 0 });
  });

  it('redondea a dos decimales con precios con centavos', () => {
    const lineas = [
      { id: 'x', nombre: 'Mouse', precio: 99.99, cantidad: 3, condicion: 'nuevo' }
    ];
    expect(calcularTotales(lineas)).toEqual({
      subtotal: 299.97,
      isv: 45,
      total: 344.97
    });
  });
});

describe('calcularTotales, RN-08: el ISV solo grava lo nuevo', () => {
  it('no cobra ISV cuando toda la lista es equipo usado', () => {
    const totales = calcularTotales(agregarLinea([], LAPTOP));
    expect(totales).toEqual({ subtotal: 9900, isv: 0, total: 9900 });
  });

  it('cobra ISV sobre el total cuando toda la lista es nueva', () => {
    const totales = calcularTotales(agregarLinea([], TECLADO, 2));
    expect(totales).toEqual({ subtotal: 2900, isv: 435, total: 3335 });
  });

  it('grava solo la parte nueva en una lista mezclada', () => {
    const mezcla = agregarLinea(agregarLinea([], LAPTOP), TECLADO, 2);
    expect(calcularTotales(mezcla)).toEqual({
      subtotal: 12800,
      isv: 435,
      total: 13235
    });
  });

  it('no grava una linea sin condicion declarada', () => {
    const totales = calcularTotales(agregarLinea([], SIN_CONDICION));
    expect(totales).toEqual({ subtotal: 2000, isv: 0, total: 2000 });
  });
});

describe('construirMensaje', () => {
  it('devuelve cadena vacia sin productos', () => {
    expect(construirMensaje([])).toBe('');
  });

  it('incluye el nombre y la cantidad del producto', () => {
    const mensaje = construirMensaje(agregarLinea([], LAPTOP));
    expect(mensaje).toContain('Vostro 5410 x1');
  });

  it('incluye el total estimado', () => {
    const mensaje = construirMensaje(agregarLinea([], LAPTOP));
    expect(mensaje).toContain('Total estimado');
  });

  it('no suma ISV al total de un equipo usado', () => {
    const mensaje = construirMensaje(agregarLinea([], LAPTOP));
    expect(mensaje).toContain('9,900.00');
  });
});

describe('enlaceWhatsApp', () => {
  it('apunta al numero del negocio', () => {
    expect(enlaceWhatsApp(agregarLinea([], LAPTOP))).toContain(
      'wa.me/50431807243'
    );
  });

  it('codifica el mensaje en la URL', () => {
    expect(enlaceWhatsApp(agregarLinea([], LAPTOP))).toContain('?text=Hola');
  });
});
