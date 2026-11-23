import { CONFIG } from '../../config.js';

/**
 * Adaptador de salida que cumple el puerto Perfiles. Con el token del usuario,
 * RLS solo deja leer su propia fila (perfiles_lectura_propia).
 */
export function crearPerfilesSupabase(
  obtener = (url, opciones) => fetch(url, opciones),
  conexion = CONFIG.SUPABASE
) {
  return {
    async miPerfil(token) {
      const respuesta = await obtener(`${conexion.URL}/rest/v1/perfiles?select=nombre,rol`, {
        headers: { apikey: conexion.CLAVE_PUBLICA, Authorization: `Bearer ${token}` }
      });
      if (!respuesta.ok) {
        throw new Error(`Supabase respondio ${respuesta.status}`);
      }
      const [perfil] = await respuesta.json();
      return perfil ?? null;
    }
  };
}
