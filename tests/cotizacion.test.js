import { describe, it, expect } from 'vitest';
import {
  agregarLinea,
  construirMensaje,
  enlaceWhatsApp,
  quitarLinea
} from '../assets/js/cotizacion.js';

const LAPTOP = { id: 1, nombre: 'Vostro 5410', precio: 9900, stock: 2 };
const AGOTADO = { id: 9, nombre: 'Agotado', precio: 500, stock: 0 };

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
