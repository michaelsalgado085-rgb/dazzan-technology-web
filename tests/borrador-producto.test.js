import { describe, it, expect } from 'vitest';
import {
  descartarBorrador,
  guardarBorrador,
  recuperarBorrador
} from '../assets/js/casos-de-uso/borrador-producto.js';

function almacenFalso(inicial = null) {
  const almacen = {
    contenido: inicial,
    leer: async () => almacen.contenido,
    guardar: async (borrador) => {
      almacen.contenido = borrador;
    },
    borrar: async () => {
      almacen.contenido = null;
    }
  };
  return almacen;
}

const INICIAL = { campos: { id: '', nombre: '' }, fotos: [] };
const CON_NOMBRE = { campos: { id: '', nombre: 'Latitude 7420' }, fotos: [] };

describe('guardarBorrador', () => {
  it('guarda cuando hay algo escrito', async () => {
    const almacen = almacenFalso();
    await guardarBorrador({ inicial: INICIAL, actual: CON_NOMBRE }, almacen);
    expect(almacen.contenido.actual.campos.nombre).toBe('Latitude 7420');
  });

  it('sin cambios no deja borrador, y borra uno viejo', async () => {
    const almacen = almacenFalso({ inicial: INICIAL, actual: CON_NOMBRE });
    await guardarBorrador({ inicial: INICIAL, actual: INICIAL }, almacen);
    expect(almacen.contenido).toBeNull();
  });
});

describe('recuperarBorrador', () => {
  const INVENTARIO = [{ id: 7, nombre: 'Latitude 7420' }];

  it('sin borrador no hay nada que recuperar', async () => {
    expect(await recuperarBorrador(almacenFalso(), INVENTARIO)).toBeNull();
  });

  it('un producto nuevo se recupera sin producto asociado', async () => {
    const borrador = { inicial: INICIAL, actual: CON_NOMBRE };
    expect(await recuperarBorrador(almacenFalso(borrador), INVENTARIO)).toEqual({ borrador, producto: null });
  });

  it('una edicion trae el producto que se estaba editando', async () => {
    const borrador = { inicial: INICIAL, actual: { campos: { id: '7' }, fotos: [] } };
    const recuperado = await recuperarBorrador(almacenFalso(borrador), INVENTARIO);
    expect(recuperado.producto).toBe(INVENTARIO[0]);
  });

});

describe('recuperarBorrador: borradores que ya no sirven', () => {
  const INVENTARIO = [{ id: 7, nombre: 'Latitude 7420' }];

  it('si el producto ya no existe, el borrador se descarta', async () => {
    const almacen = almacenFalso({ inicial: INICIAL, actual: { campos: { id: '99' }, fotos: [] } });
    expect(await recuperarBorrador(almacen, INVENTARIO)).toBeNull();
    expect(almacen.contenido).toBeNull();
  });

  it('un borrador danado no se recupera', async () => {
    expect(await recuperarBorrador(almacenFalso({ basura: true }), INVENTARIO)).toBeNull();
  });

  it('descartar lo borra', async () => {
    const almacen = almacenFalso({ inicial: INICIAL, actual: CON_NOMBRE });
    await descartarBorrador(almacen);
    expect(almacen.contenido).toBeNull();
  });
});
