import { hayCambios } from '../dominio/borrador.js';

/**
 * Casos de uso del borrador del formulario de producto (RN-35).
 *
 * Puerto que se recibe:
 * @typedef {Object} AlmacenBorrador
 * @property {() => Promise<object|null>} leer
 * @property {(borrador: object) => Promise<void>} guardar
 * @property {() => Promise<void>} borrar
 */

/**
 * Guarda el formulario solo si tiene algo distinto de como se abrio: abrir
 * "Agregar producto" y salir sin escribir no deja un borrador pendiente.
 * @param {{ inicial: object, actual: object }} borrador
 * @param {AlmacenBorrador} almacen
 */
export async function guardarBorrador(borrador, almacen) {
  if (hayCambios(borrador.inicial, borrador.actual)) {
    await almacen.guardar(borrador);
  } else {
    await almacen.borrar();
  }
}

/**
 * El borrador pendiente y el producto que se estaba editando (null si era
 * uno nuevo). Si ese producto ya no esta en el inventario, por ejemplo porque
 * se elimino desde otro telefono, el borrador ya no sirve y se descarta.
 * @param {AlmacenBorrador} almacen
 * @param {object[]} inventario
 */
export async function recuperarBorrador(almacen, inventario) {
  const borrador = await almacen.leer();
  if (!borrador?.actual?.campos) {
    return null;
  }
  const id = borrador.actual.campos.id;
  if (!id) {
    return { borrador, producto: null };
  }
  const producto = inventario.find((item) => String(item.id) === String(id));
  if (!producto) {
    await almacen.borrar();
    return null;
  }
  return { borrador, producto };
}

/**
 * Al guardar, eliminar o descartar a proposito, el borrador ya no hace falta.
 * @param {AlmacenBorrador} almacen
 */
export async function descartarBorrador(almacen) {
  await almacen.borrar();
}
