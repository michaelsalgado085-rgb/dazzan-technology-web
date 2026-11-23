import { CONFIG } from '../../config.js';

/**
 * Adaptador de salida que cumple el puerto RepositorioProductos con la API
 * REST de Supabase. RLS decide que filas recibe: sin sesion, solo las que
 * tienen existencias (RN-17).
 */

/**
 * Adapter: Postgres nombra en snake_case y usa null; el dominio espera
 * camelCase y la clave ausente, igual que el catalogo JSON. La traduccion
 * vive solo aqui, para que el dominio no se entere de como guarda la base.
 */
export function filaAProducto(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    marca: fila.marca,
    categoria: fila.categoria_id,
    condicion: fila.condicion,
    precio: Number(fila.precio),
    precioAnterior: fila.precio_anterior === null ? undefined : Number(fila.precio_anterior),
    stock: fila.stock,
    descripcion: fila.descripcion,
    especificaciones: fila.especificaciones,
    imagen: fila.imagen ?? undefined
  };
}

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
