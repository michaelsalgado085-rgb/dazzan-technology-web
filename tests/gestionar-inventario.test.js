import { describe, it, expect } from 'vitest';
import { guardarProducto, verInventario } from '../assets/js/casos-de-uso/gestionar-inventario.js';

const PRODUCTO = {
  nombre: 'Kumara K552',
  marca: 'Redragon',
  categoria: 'teclados',
  condicion: 'nuevo',
  precio: 1150,
  precioAnterior: null,
  stock: 5
};

function repositorioFalso(inicial = []) {
  const registro = { creados: [], actualizados: [] };
  return {
    registro,
    todos: async () => inicial,
    crear: async (producto) => {
      registro.creados.push(producto);
      return { ...producto, id: 'nuevo' };
    },
    actualizar: async (id, producto) => {
      registro.actualizados.push({ id, producto });
      return { ...producto, id };
    }
  };
}

describe('verInventario', () => {
  it('trae todo, con lo agotado al final', async () => {
    const repositorio = repositorioFalso([
      { nombre: 'B', stock: 0 },
      { nombre: 'A', stock: 2 }
    ]);
    const inventario = await verInventario(repositorio);
    expect(inventario.map((producto) => producto.nombre)).toEqual(['A', 'B']);
  });
});

describe('guardarProducto', () => {
  it('un producto nuevo se crea, sin mandar un id', async () => {
    const repositorio = repositorioFalso();
    const resultado = await guardarProducto(PRODUCTO, { repositorio, inventario: [] });
    expect(resultado.guardado).toBe(true);
    expect(repositorio.registro.creados[0]).not.toHaveProperty('id');
  });

  it('un producto con id se actualiza', async () => {
    const repositorio = repositorioFalso();
    await guardarProducto({ ...PRODUCTO, id: 'p1', stock: 8 }, { repositorio, inventario: [] });
    expect(repositorio.registro.actualizados).toEqual([
      { id: 'p1', producto: expect.objectContaining({ stock: 8 }) }
    ]);
  });

});

describe('guardarProducto: cuando no se guarda', () => {
  it('con errores no llega al repositorio', async () => {
    const repositorio = repositorioFalso();
    const resultado = await guardarProducto({ ...PRODUCTO, nombre: '' }, { repositorio, inventario: [] });
    expect(resultado.errores).toEqual(['Escribe el nombre del producto.']);
    expect(repositorio.registro.creados).toEqual([]);
  });

  it('regla 8: si ya existe, devuelve el existente y no crea otro', async () => {
    const repositorio = repositorioFalso();
    const existente = { ...PRODUCTO, id: 'p1' };
    const resultado = await guardarProducto(PRODUCTO, { repositorio, inventario: [existente] });
    expect(resultado).toEqual({ guardado: false, duplicado: existente });
    expect(repositorio.registro.creados).toEqual([]);
  });
});
