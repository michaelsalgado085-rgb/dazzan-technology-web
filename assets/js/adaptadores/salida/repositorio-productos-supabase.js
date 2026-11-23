import { CONFIG } from '../../config.js';
import { filaAProducto } from './traductor-productos-supabase.js';

/**
 * Adaptador de salida que cumple el puerto RepositorioProductos con la API
 * REST de Supabase. RLS decide que filas recibe: sin sesion, solo las que
 * tienen existencias (RN-17).
 */

export function crearRepositorioProductosSupabase(
  obtener = (url, opciones) => fetch(url, opciones),
  conexion = CONFIG.SUPABASE
) {
  return {
    async inventario() {
      const respuesta = await obtener(`${conexion.URL}/rest/v1/productos?select=*`, {
        headers: { apikey: conexion.CLAVE_PUBLICA }
      });
      if (!respuesta.ok) {
        throw new Error(`Supabase respondio ${respuesta.status}`);
      }
      return (await respuesta.json()).map(filaAProducto);
    }
  };
}
