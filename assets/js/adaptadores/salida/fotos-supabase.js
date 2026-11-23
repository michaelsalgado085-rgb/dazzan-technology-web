import { CONFIG } from '../../config.js';

/**
 * Adaptador de salida que cumple el puerto AlmacenFotos con Supabase Storage.
 * La base guarda solo la ruta de cada foto; el dominio y la tienda trabajan
 * con la direccion completa. La traduccion vive aqui.
 */

const CUBETA = 'productos';

function base(conexion) {
  return `${conexion.URL}/storage/v1/object/public/${CUBETA}/`;
}

export function urlPublica(ruta, conexion = CONFIG.SUPABASE) {
  return `${base(conexion)}${ruta}`;
}

/**
 * Lo inverso: de la direccion completa a la ruta que guarda la base. Una
 * direccion de otro lugar se deja tal cual, para no inventar rutas.
 */
export function rutaDeFoto(url, conexion = CONFIG.SUPABASE) {
  return url.startsWith(base(conexion)) ? url.slice(base(conexion).length) : url;
}

async function subirFoto({ obtener, conexion, cabeceras }, ruta, archivo) {
  const respuesta = await obtener(`${conexion.URL}/storage/v1/object/${CUBETA}/${ruta}`, {
    method: 'POST',
    headers: { ...cabeceras, 'Content-Type': 'image/jpeg' },
    body: archivo
  });
  if (!respuesta.ok) {
    throw new Error(`Supabase Storage respondio ${respuesta.status}`);
  }
  return urlPublica(ruta, conexion);
}

/**
 * `obtener` y `nombreNuevo` se reciben para poder probarlo sin red y con
 * nombres conocidos.
 */
export function crearFotosSupabase(token, opciones = {}) {
  const {
    obtener = (url, pedido) => fetch(url, pedido),
    conexion = CONFIG.SUPABASE,
    nombreNuevo = () => crypto.randomUUID()
  } = opciones;
  const red = {
    obtener,
    conexion,
    cabeceras: { apikey: conexion.CLAVE_PUBLICA, Authorization: `Bearer ${token}` }
  };
  return {
    subir: (archivo) => subirFoto(red, `${nombreNuevo()}.jpg`, archivo),
    async eliminar(urls) {
      if (urls.length === 0) {
        return;
      }
      await obtener(`${conexion.URL}/storage/v1/object/${CUBETA}`, {
        method: 'DELETE',
        headers: { ...red.cabeceras, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefixes: urls.map((url) => rutaDeFoto(url, conexion)) })
      });
    }
  };
}
