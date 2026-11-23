import { describe, it, expect } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { crearBorradorNavegador } from '../assets/js/adaptadores/salida/borrador-navegador.js';

const BORRADOR = { inicial: { campos: {}, fotos: [] }, actual: { campos: { nombre: 'T480s' }, fotos: ['a.jpg'] } };

describe('borrador en IndexedDB', () => {
  it('sin nada guardado lee null', async () => {
    expect(await crearBorradorNavegador(new IDBFactory()).leer()).toBeNull();
  });

  it('guarda, lee y borra', async () => {
    const almacen = crearBorradorNavegador(new IDBFactory());
    await almacen.guardar(BORRADOR);
    expect(await almacen.leer()).toEqual(BORRADOR);
    await almacen.borrar();
    expect(await almacen.leer()).toBeNull();
  });

  it('guardar de nuevo reemplaza el anterior', async () => {
    const almacen = crearBorradorNavegador(new IDBFactory());
    await almacen.guardar(BORRADOR);
    await almacen.guardar({ ...BORRADOR, actual: { campos: { nombre: 'X1' }, fotos: [] } });
    expect((await almacen.leer()).actual.campos.nombre).toBe('X1');
  });

});

describe('borrador en IndexedDB: persistencia y errores', () => {
  it('sobrevive a cerrar la app: otro almacen sobre la misma base lo lee', async () => {
    const fabrica = new IDBFactory();
    await crearBorradorNavegador(fabrica).guardar(BORRADOR);
    expect(await crearBorradorNavegador(fabrica).leer()).toEqual(BORRADOR);
  });

  it('sin IndexedDB no falla: el formulario sigue sin borrador', async () => {
    const almacen = crearBorradorNavegador(undefined);
    await expect(almacen.guardar(BORRADOR)).resolves.toBeUndefined();
    await expect(almacen.borrar()).resolves.toBeUndefined();
    expect(await almacen.leer()).toBeNull();
  });
});
