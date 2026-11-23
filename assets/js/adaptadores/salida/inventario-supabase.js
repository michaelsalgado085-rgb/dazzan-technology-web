import { CONFIG } from '../../config.js';
import { filaAProducto, productoAFila } from './traductor-productos-supabase.js';

/**
 * Adaptador de salida que cumple el puerto RepositorioInventario. Usa el
 * token del administrador: RLS le deja ver lo agotado (regla 6) y escribir.
 * No hay metodo para borrar: ningun producto se borra (ADR-002).
 */

function cabeceras(conexion, token) {
  return {
    apikey: conexion.CLAVE_PUBLICA,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    // Que Supabase devuelva la fila guardada, con su id.
    Prefer: 'return=representation'
  };
}

async function pedirProductos({ obtener, conexion, token }, url, opciones = {}) {
  const respuesta = await obtener(url, { headers: cabeceras(conexion, token), ...opciones });
  if (!respuesta.ok) {
    throw new Error(`Supabase respondio ${respuesta.status}`);
  }
  return (await respuesta.json()).map(filaAProducto);
}

export function crearInventarioSupabase(
  token,
  obtener = (url, opciones) => fetch(url, opciones),
  conexion = CONFIG.SUPABASE
) {
  const red = { obtener, conexion, token };
  const tabla = `${conexion.URL}/rest/v1/productos`;
  const enviar = async (url, metodo, producto) => {
    const [fila] = await pedirProductos(red, url, {
      method: metodo,
      body: JSON.stringify(productoAFila(producto))
    });
    return fila;
  };
  return {
    todos: () => pedirProductos(red, `${tabla}?select=*`),
    crear: (producto) => enviar(tabla, 'POST', producto),
    actualizar: (id, producto) => enviar(`${tabla}?id=eq.${encodeURIComponent(id)}`, 'PATCH', producto)
  };
}
