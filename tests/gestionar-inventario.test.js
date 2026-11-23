import { describe, it, expect } from 'vitest';
import {
  eliminarProducto,
  guardarProducto,
  verInventario
} from '../assets/js/casos-de-uso/gestionar-inventario.js';

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

describe('eliminarProducto, RN-32', () => {
  it('un producto que nunca se vendio se elimina', async () => {
    const eliminados = [];
    const repositorio = { eliminar: async (id) => eliminados.push(id) };
    expect(await eliminarProducto({ id: 'p1' }, repositorio)).toEqual({ eliminado: true });
    expect(eliminados).toEqual(['p1']);
  });

  it('uno ya vendido no se elimina y se explica que hacer en su lugar', async () => {
    const repositorio = {
      eliminar: async () => {
        throw Object.assign(new Error('x'), { codigo: 'vendido' });
      }
    };
    const resultado = await eliminarProducto({ id: 'p1' }, repositorio);
    expect(resultado.eliminado).toBe(false);
    expect(resultado.motivo).toContain('pon sus existencias en 0');
  });

  it('sin conexion el error llega a la pantalla', async () => {
    const repositorio = {
      eliminar: async () => {
        throw new Error('sin red');
      }
    };
    await expect(eliminarProducto({ id: 'p1' }, repositorio)).rejects.toThrow('sin red');
  });
});

function almacenFalso({ fallaAlEliminar = false } = {}) {
  const registro = { subidas: [], eliminadas: [] };
  return {
    registro,
    subir: async (archivo) => {
      registro.subidas.push(archivo);
      return `https://fotos/${archivo}.jpg`;
    },
    eliminar: async (direcciones) => {
      if (fallaAlEliminar) {
        throw new Error('sin red');
      }
      registro.eliminadas.push(...direcciones);
    }
  };
}

describe('guardarProducto: fotos', () => {
  it('sube las nuevas y conserva las guardadas, en el mismo orden', async () => {
    const repositorio = repositorioFalso();
    const almacenFotos = almacenFalso();
    const fotos = ['https://fotos/vieja.jpg', { archivo: 'nueva' }];
    await guardarProducto({ ...PRODUCTO, fotos }, { repositorio, inventario: [], almacenFotos });
    expect(repositorio.registro.creados[0].fotos).toEqual([
      'https://fotos/vieja.jpg',
      'https://fotos/nueva.jpg'
    ]);
  });

  it('con errores no sube ninguna foto', async () => {
    const almacenFotos = almacenFalso();
    const fotos = Array.from({ length: 7 }, (_, n) => ({ archivo: `f${n}` }));
    const resultado = await guardarProducto(
      { ...PRODUCTO, fotos },
      { repositorio: repositorioFalso(), inventario: [], almacenFotos }
    );
    expect(resultado.errores).toEqual(['Un producto lleva hasta 6 fotos (RN-33).']);
    expect(almacenFotos.registro.subidas).toEqual([]);
  });

});

describe('guardarProducto: fotos que se quitan', () => {
  it('las fotos quitadas se borran despues de guardar', async () => {
    const almacenFotos = almacenFalso();
    await guardarProducto(PRODUCTO, {
      repositorio: repositorioFalso(),
      inventario: [],
      almacenFotos,
      fotosQuitadas: ['https://fotos/vieja.jpg']
    });
    expect(almacenFotos.registro.eliminadas).toEqual(['https://fotos/vieja.jpg']);
  });

  it('si borrar una foto vieja falla, el producto igual queda guardado', async () => {
    const resultado = await guardarProducto(PRODUCTO, {
      repositorio: repositorioFalso(),
      inventario: [],
      almacenFotos: almacenFalso({ fallaAlEliminar: true }),
      fotosQuitadas: ['https://fotos/vieja.jpg']
    });
    expect(resultado.guardado).toBe(true);
  });
});

describe('eliminarProducto: fotos', () => {
  it('al eliminar el producto se borran sus fotos', async () => {
    const almacenFotos = almacenFalso();
    const repositorio = { eliminar: async () => undefined };
    await eliminarProducto({ id: 'p1', fotos: ['https://fotos/a.jpg'] }, repositorio, almacenFotos);
    expect(almacenFotos.registro.eliminadas).toEqual(['https://fotos/a.jpg']);
  });

  it('si ya se vendio, sus fotos se conservan con el historial', async () => {
    const almacenFotos = almacenFalso();
    const repositorio = {
      eliminar: async () => {
        throw Object.assign(new Error('x'), { codigo: 'vendido' });
      }
    };
    await eliminarProducto({ id: 'p1', fotos: ['https://fotos/a.jpg'] }, repositorio, almacenFotos);
    expect(almacenFotos.registro.eliminadas).toEqual([]);
  });
});
