import { buscarDuplicado, erroresDeProducto, ordenarInventario } from '../dominio/inventario.js';

/**
 * Puerto que necesita el inventario del panel. El adaptador ya trae el token
 * del administrador: con el, RLS deja ver tambien lo agotado y escribir.
 *
 * @typedef {object} RepositorioInventario
 * @property {() => Promise<object[]>} todos
 * @property {(producto: object) => Promise<object>} crear
 * @property {(id: string, producto: object) => Promise<object>} actualizar
 */

/**
 * Caso de uso: el inventario completo, con lo agotado al final (regla 6).
 *
 * @param {RepositorioInventario} repositorio
 */
export async function verInventario(repositorio) {
  return ordenarInventario(await repositorio.todos());
}

/**
 * Caso de uso: guardar un producto nuevo o editado. Primero decide el
 * dominio; si ya existe uno igual, se devuelve para abrirlo en vez de crear
 * un duplicado (regla 8).
 *
 * @param {object} producto
 * @param {{ repositorio: RepositorioInventario, inventario: object[], textoEspecificaciones?: string }} contexto
 */
export async function guardarProducto(producto, { repositorio, inventario, textoEspecificaciones = '' }) {
  const errores = erroresDeProducto(producto, textoEspecificaciones);
  if (errores.length > 0) {
    return { guardado: false, errores };
  }
  const duplicado = buscarDuplicado(producto, inventario);
  if (duplicado) {
    return { guardado: false, duplicado };
  }
  const { id, ...datos } = producto;
  const guardado = id ? await repositorio.actualizar(id, datos) : await repositorio.crear(datos);
  return { guardado: true, producto: guardado };
}
