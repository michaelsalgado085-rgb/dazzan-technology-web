import { describe, it, expect } from 'vitest';
import { agregarLinea } from '../assets/js/dominio/cotizacion.js';
import { construirMensaje, enlaceWhatsApp } from '../assets/js/adaptadores/salida/whatsapp.js';

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
