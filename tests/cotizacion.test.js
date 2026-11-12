import { describe, it, expect } from 'vitest';
import {
  agregarLinea,
  calcularTotal,
  construirMensaje,
  enlaceWhatsApp,
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

describe('calcularTotal, RN-08: los precios ya incluyen el ISV', () => {
  it('devuelve cero con una lista vacia', () => {
    expect(calcularTotal([])).toBe(0);
  });

  it('el total de un equipo usado es su precio, sin recargo', () => {
    expect(calcularTotal(agregarLinea([], LAPTOP))).toBe(9900);
  });

  it('no suma ISV al producto nuevo', () => {
    expect(calcularTotal(agregarLinea([], TECLADO, 2))).toBe(2900);
  });

  it('suma los importes de una lista mezclada', () => {
    const mezcla = agregarLinea(agregarLinea([], LAPTOP), TECLADO, 2);
    expect(calcularTotal(mezcla)).toBe(12800);
  });

  it('multiplica el precio por la cantidad de cada linea', () => {
    const lineas = [{ id: 'x', nombre: 'Mouse', precio: 340, cantidad: 3 }];
    expect(calcularTotal(lineas)).toBe(1020);
  });

  it('no arrastra error de punto flotante con centavos', () => {
    const lineas = [{ id: 'x', nombre: 'Mouse', precio: 99.99, cantidad: 3 }];
    expect(calcularTotal(lineas)).toBe(299.97);
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

  it('el total del mensaje no lleva ISV sumado', () => {
    const mensaje = construirMensaje(agregarLinea([], TECLADO, 2));
    expect(mensaje).toContain('Total estimado: L');
    expect(mensaje).toContain('2,900.00');
    expect(mensaje).not.toContain('3,335.00');
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
