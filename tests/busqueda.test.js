import { describe, it, expect } from 'vitest';
import { buscarProductos, ordenarProductos, palabrasDeBusqueda } from '../assets/js/dominio/catalogo.js';

const LATITUDE = {
  id: 'latitude',
  nombre: 'Latitude 7420',
  marca: 'Dell',
  categoria: 'laptops',
  condicion: 'usado',
  precio: 10500,
  especificaciones: { CPU: 'Intel Core i7 de onceava generación', RAM: '16 GB de memoria', SSD: '512 GB' }
};
const THINKPAD = {
  id: 'thinkpad',
  nombre: 'ThinkPad T480s',
  marca: 'Lenovo',
  categoria: 'laptops',
  condicion: 'usado',
  precio: 8900,
  especificaciones: { Procesador: 'Intel Core i5', Memoria: '8GB RAM' }
};
const OPTIPLEX = {
  id: 'optiplex',
  nombre: 'OptiPlex 7050',
  marca: 'Dell',
  categoria: 'escritorio',
  condicion: 'usado',
  precio: 7000,
  especificaciones: { CPU: 'Intel Core i7', RAM: '16gb' }
};
const MOUSE = { id: 'mouse', nombre: 'Cobra Pro', marca: 'Redragon', categoria: 'mouse', condicion: 'nuevo', precio: 1890 };
const PRODUCTOS = [LATITUDE, THINKPAD, OPTIPLEX, MOUSE];
const ids = (lista) => lista.map((producto) => producto.id);

describe('palabrasDeBusqueda (RN-36)', () => {
  it('quita las palabras de relleno y une el numero con su unidad', () => {
    expect(palabrasDeBusqueda('16 GB de RAM')).toEqual(['16gb', 'ram']);
  });

  it('ignora mayusculas, tildes y espacios de mas', () => {
    expect(palabrasDeBusqueda('  Generación   I7 ')).toEqual(['generacion', 'i7']);
  });

  it('una busqueda de puro relleno no tiene palabras', () => {
    expect(palabrasDeBusqueda('de la con')).toEqual([]);
    expect(palabrasDeBusqueda()).toEqual([]);
  });
});

describe('buscarProductos por especificaciones (RN-36)', () => {
  it('encuentra por un valor de especificacion', () => {
    expect(ids(buscarProductos(PRODUCTOS, 'i5'))).toEqual(['thinkpad']);
  });

  it('16 GB, 16gb y 16 gb son lo mismo', () => {
    for (const termino of ['16 GB', '16gb', '16 gb']) {
      expect(ids(buscarProductos(PRODUCTOS, termino))).toEqual(['latitude', 'optiplex']);
    }
  });

  it('encuentra por el nombre de la especificacion', () => {
    expect(ids(buscarProductos(PRODUCTOS, 'ssd'))).toEqual(['latitude']);
  });

  it('encuentra por condicion y por categoria', () => {
    expect(ids(buscarProductos(PRODUCTOS, 'nuevo'))).toEqual(['mouse']);
    expect(ids(buscarProductos(PRODUCTOS, 'escritorio'))).toEqual(['optiplex']);
  });

  it('un producto sin especificaciones no rompe la busqueda', () => {
    expect(ids(buscarProductos([MOUSE], 'redragon'))).toEqual(['mouse']);
  });
});

describe('buscarProductos con varias palabras (RN-36)', () => {
  it('tiene que tener todas las palabras', () => {
    expect(ids(buscarProductos(PRODUCTOS, '16 GB RAM i7'))).toEqual(['latitude', 'optiplex']);
  });

  it('lo que todos tienen no basta: Intel Core i8 no encuentra un i7', () => {
    expect(buscarProductos(PRODUCTOS, 'Intel Core i8')).toEqual([]);
  });

  it('RAM 17 GB no encuentra una de 16 GB', () => {
    expect(buscarProductos(PRODUCTOS, 'RAM 17 GB')).toEqual([]);
  });

  it('el orden de las palabras no importa', () => {
    expect(ids(buscarProductos(PRODUCTOS, 'i7 dell 16gb'))).toEqual(['latitude', 'optiplex']);
  });

  it('respeta el orden que traia la lista', () => {
    const porPrecio = ordenarProductos(PRODUCTOS, 'precio-asc');
    expect(ids(buscarProductos(porPrecio, 'i7 16gb'))).toEqual(['optiplex', 'latitude']);
  });
});

describe('buscarProductos: comienzo de palabra (RN-36)', () => {
  it('encuentra mientras se escribe', () => {
    expect(ids(buscarProductos(PRODUCTOS, 'lati'))).toEqual(['latitude']);
    expect(ids(buscarProductos(PRODUCTOS, '16'))).toEqual(['latitude', 'optiplex']);
  });

  it('un numero no encuentra otro que lo contiene', () => {
    expect(buscarProductos(PRODUCTOS, '6gb')).toEqual([]);
  });

  it('guiones y comas separan palabras', () => {
    expect(ids(buscarProductos(PRODUCTOS, 'i7, 16-gb'))).toEqual(['latitude', 'optiplex']);
  });

  it('sin coincidencias devuelve una lista vacia', () => {
    expect(buscarProductos(PRODUCTOS, 'rtx 4090')).toEqual([]);
  });

  it('una busqueda de puro relleno devuelve todo', () => {
    expect(buscarProductos(PRODUCTOS, 'de la')).toHaveLength(4);
  });
});
