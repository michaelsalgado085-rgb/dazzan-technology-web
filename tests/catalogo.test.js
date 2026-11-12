import { describe, it, expect } from 'vitest';
import {
  buscarProductos,
  filtrarPorCategoria,
  filtrarPorPrecio,
  ordenarProductos,
  soloConExistencias
} from '../assets/js/catalogo.js';

const PRODUCTOS = [
  { id: 1, nombre: 'Vostro 5410', marca: 'Dell', categoria: 'laptops', precio: 9900 },
  { id: 2, nombre: 'IdeaPad 3', marca: 'Lenovo', categoria: 'laptops', precio: 13900 },
  { id: 3, nombre: 'Kumara K552', marca: 'Redragon', categoria: 'teclados', precio: 1150 },
  { id: 4, nombre: 'Cobra Pro', marca: 'Redragon', categoria: 'mouse', precio: 1890 }
];

describe('filtrarPorCategoria', () => {
  it('devuelve solo los productos de la categoria pedida', () => {
    expect(filtrarPorCategoria(PRODUCTOS, 'laptops')).toHaveLength(2);
  });

  it('devuelve todo cuando la categoria es "todos"', () => {
    expect(filtrarPorCategoria(PRODUCTOS, 'todos')).toHaveLength(4);
  });

  it('no modifica el arreglo original', () => {
    filtrarPorCategoria(PRODUCTOS, 'laptops');
    expect(PRODUCTOS).toHaveLength(4);
  });
});

describe('filtrarPorPrecio', () => {
  it('incluye los productos dentro del rango', () => {
    expect(filtrarPorPrecio(PRODUCTOS, 1000, 2000)).toHaveLength(2);
  });

  it('incluye los limites del rango', () => {
    expect(filtrarPorPrecio(PRODUCTOS, 1150, 1150)).toHaveLength(1);
  });
});

describe('buscarProductos', () => {
  it('encuentra por nombre sin importar mayusculas', () => {
    expect(buscarProductos(PRODUCTOS, 'vostro')).toHaveLength(1);
  });

  it('encuentra por marca', () => {
    expect(buscarProductos(PRODUCTOS, 'Redragon')).toHaveLength(2);
  });

  it('devuelve todo con un termino vacio', () => {
    expect(buscarProductos(PRODUCTOS, '   ')).toHaveLength(4);
  });

  it('devuelve lista vacia cuando no hay coincidencias', () => {
    expect(buscarProductos(PRODUCTOS, 'xyz')).toHaveLength(0);
  });
});

describe('ordenarProductos', () => {
  it('ordena por precio ascendente', () => {
    expect(ordenarProductos(PRODUCTOS, 'precio-asc')[0].precio).toBe(1150);
  });

  it('ordena por precio descendente', () => {
    expect(ordenarProductos(PRODUCTOS, 'precio-desc')[0].precio).toBe(13900);
  });

  it('ordena por nombre ascendente', () => {
    expect(ordenarProductos(PRODUCTOS, 'nombre-asc')[0].nombre).toBe('Cobra Pro');
  });

  it('conserva el orden original con un criterio desconocido', () => {
    expect(ordenarProductos(PRODUCTOS, 'inventado')[0].id).toBe(1);
  });
});

const CON_STOCK = [
  { id: 'a', nombre: 'Con varias', stock: 5 },
  { id: 'b', nombre: 'Ultima unidad', stock: 1 },
  { id: 'c', nombre: 'Agotado', stock: 0 },
  { id: 'd', nombre: 'Dato corrupto', stock: -2 }
];

describe('soloConExistencias, RF-27: lo agotado no se ofrece al publico', () => {
  const idsVisibles = () =>
    soloConExistencias(CON_STOCK).map((producto) => producto.id);

  it('excluye el producto con cero existencias', () => {
    expect(idsVisibles()).not.toContain('c');
  });

  it('conserva el producto al que le queda una sola unidad', () => {
    expect(idsVisibles()).toContain('b');
  });

  it('excluye un stock negativo', () => {
    expect(idsVisibles()).not.toContain('d');
  });

  it('devuelve lista vacia cuando todo esta agotado', () => {
    expect(soloConExistencias([{ id: 'c', stock: 0 }])).toEqual([]);
  });

  it('no modifica el arreglo original', () => {
    soloConExistencias(CON_STOCK);
    expect(CON_STOCK).toHaveLength(4);
  });
});
