import { soloConExistencias } from '../dominio/catalogo.js';

/**
 * Puerto que necesita este caso de uso. Lo define el centro y lo cumple un
 * adaptador del borde: hoy el archivo JSON, mañana Supabase, en las pruebas
 * un falso en memoria.
 *
 * @typedef {object} RepositorioProductos
 * @property {() => Promise<object[]>} inventario Todos los productos con sus existencias.
 */

/**
 * Caso de uso: el catalogo que ve el publico. Pide el inventario en idioma
 * del negocio y aplica RN-17: lo que no tiene existencias no se ofrece.
 *
 * @param {RepositorioProductos} repositorio
 */
export async function cargarCatalogo(repositorio) {
  return soloConExistencias(await repositorio.inventario());
}
