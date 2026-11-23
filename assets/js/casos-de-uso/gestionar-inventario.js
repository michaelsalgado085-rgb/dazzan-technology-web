import { buscarDuplicado, erroresDeProducto, ordenarInventario } from '../dominio/inventario.js';

/**
 * Puertos que necesita el inventario del panel. Los adaptadores ya traen el
 * token del administrador: con el, RLS deja ver lo agotado y escribir.
 *
 * @typedef {object} RepositorioInventario
 * @property {() => Promise<object[]>} todos
 * @property {(producto: object) => Promise<object>} crear
 * @property {(id: string, producto: object) => Promise<object>} actualizar
 * @property {(id: string) => Promise<void>} eliminar
 *   Rechaza con un error de codigo 'vendido' si el producto ya esta en una factura.
 *
 * @typedef {object} AlmacenFotos
 * @property {(archivo: Blob) => Promise<string>} subir Devuelve la direccion de la foto.
 * @property {(direcciones: string[]) => Promise<void>} eliminar
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
 * Una foto ya guardada es su direccion; una recien elegida trae su archivo y
 * todavia hay que subirla. Se suben juntas para no hacer esperar al cliente.
 */
function subirPendientes(fotos = [], almacenFotos) {
  return Promise.all(
    fotos.map((foto) => (typeof foto === 'string' ? foto : almacenFotos.subir(foto.archivo)))
  );
}

/**
 * Las fotos que ya no se usan se borran sin detener nada: si falla, queda un
 * archivo sin uso en Storage, pero el producto se guardo bien.
 */
async function eliminarSinFallar(almacenFotos, direcciones) {
  if (!almacenFotos || direcciones.length === 0) {
    return;
  }
  try {
    await almacenFotos.eliminar(direcciones);
  } catch {
    // Sin consecuencia para el cliente: solo ocupa espacio.
  }
}

/**
 * Caso de uso: guardar un producto nuevo o editado, con sus fotos. Primero
 * decide el dominio: si hay errores o ya existe uno igual (regla 8), no se
 * sube ninguna foto. Asi no quedan fotos sueltas de un producto que no se
 * guardo.
 *
 * @param {object} producto
 * @param {{ repositorio: RepositorioInventario, inventario: object[],
 *   textoEspecificaciones?: string, almacenFotos?: AlmacenFotos, fotosQuitadas?: string[] }} contexto
 */
export async function guardarProducto(producto, contexto) {
  const { repositorio, inventario, textoEspecificaciones = '' } = contexto;
  const errores = erroresDeProducto(producto, textoEspecificaciones);
  if (errores.length > 0) {
    return { guardado: false, errores };
  }
  const duplicado = buscarDuplicado(producto, inventario);
  if (duplicado) {
    return { guardado: false, duplicado };
  }
  const fotos = await subirPendientes(producto.fotos, contexto.almacenFotos);
  const { id, ...datos } = { ...producto, fotos };
  const guardado = id ? await repositorio.actualizar(id, datos) : await repositorio.crear(datos);
  await eliminarSinFallar(contexto.almacenFotos, contexto.fotosQuitadas ?? []);
  return { guardado: true, producto: guardado };
}

const YA_VENDIDO =
  'Este producto ya está en una factura y se guarda como historial. Para quitarlo de la tienda, pon sus existencias en 0.';

/**
 * Caso de uso: eliminar un producto cargado por error (RN-32), con sus
 * fotos. Si ya se vendio, la base lo impide y se explica que hacer.
 *
 * @param {object} producto
 * @param {RepositorioInventario} repositorio
 * @param {AlmacenFotos} [almacenFotos]
 */
export async function eliminarProducto(producto, repositorio, almacenFotos) {
  try {
    await repositorio.eliminar(producto.id);
  } catch (error) {
    if (error.codigo === 'vendido') {
      return { eliminado: false, motivo: YA_VENDIDO };
    }
    throw error;
  }
  await eliminarSinFallar(almacenFotos, producto.fotos ?? []);
  return { eliminado: true };
}
