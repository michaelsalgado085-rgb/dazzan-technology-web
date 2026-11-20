import { CONFIG } from '../../config.js';

/**
 * Adaptador de salida que cumple el puerto RepositorioProductos leyendo el
 * archivo JSON publicado. Es el unico lugar que sabe que hay un archivo y una
 * peticion HTTP.
 *
 * `obtener` se recibe por parametro para poder probarlo sin red.
 */
export function crearRepositorioProductosJson(
  obtener = (ruta) => fetch(ruta),
  ruta = CONFIG.RUTA_CATALOGO
) {
  return {
    async inventario() {
      const respuesta = await obtener(ruta);
      if (!respuesta.ok) {
        throw new Error(`El catalogo respondio ${respuesta.status}`);
      }
      return respuesta.json();
    }
  };
}
