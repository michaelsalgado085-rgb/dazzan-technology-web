import { describe, it, expect } from 'vitest';
import { cargarCatalogo } from '../assets/js/casos-de-uso/cargar-catalogo.js';

// El falso del puerto: un objeto con el mismo metodo. Sin red ni archivos.
function repositorioFalso(productos) {
  return { inventario: async () => productos };
}

describe('cargarCatalogo', () => {
  it('RN-17: devuelve solo los productos con existencias', async () => {
    const repositorio = repositorioFalso([
      { id: 1, nombre: 'T480s', stock: 2 },
      { id: 2, nombre: 'Latitude', stock: 0 }
    ]);
    const catalogo = await cargarCatalogo(repositorio);
    expect(catalogo.map((producto) => producto.id)).toEqual([1]);
  });

  it('con el inventario vacio devuelve un catalogo vacio', async () => {
    expect(await cargarCatalogo(repositorioFalso([]))).toEqual([]);
  });

  it('si el repositorio falla, el error llega a quien llamo', async () => {
    const repositorio = {
      inventario: async () => {
        throw new Error('sin conexion');
      }
    };
    await expect(cargarCatalogo(repositorio)).rejects.toThrow('sin conexion');
  });
});
