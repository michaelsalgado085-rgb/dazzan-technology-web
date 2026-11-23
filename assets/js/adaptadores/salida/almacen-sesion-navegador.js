import { CONFIG } from '../../config.js';

/**
 * Adaptador de salida que cumple el puerto AlmacenSesion en el navegador.
 *
 * El token queda en localStorage para que la sesion sobreviva a cerrar el
 * navegador del telefono. Aparte se pone una cookie que solo dice "hay
 * sesion", sin el token, para que vercel.json no sirva /admin a quien no
 * entro. Lo que protege los datos sigue siendo RLS.
 */
export function crearAlmacenSesion(almacenamiento = globalThis.localStorage, documento = globalThis.document) {
  const { CLAVE_ALMACEN, COOKIE, COOKIE_SEGUNDOS } = CONFIG.SESION;

  function marcar(segundos) {
    documento.cookie = `${COOKIE}=1; Path=/; Max-Age=${segundos}; Secure; SameSite=Strict`;
  }

  return {
    leer() {
      try {
        return JSON.parse(almacenamiento.getItem(CLAVE_ALMACEN)) ?? null;
      } catch {
        return null;
      }
    },
    guardar(sesion) {
      almacenamiento.setItem(CLAVE_ALMACEN, JSON.stringify(sesion));
      marcar(COOKIE_SEGUNDOS);
    },
    borrar() {
      almacenamiento.removeItem(CLAVE_ALMACEN);
      marcar(0);
    }
  };
}
