import { CONFIG } from '../../config.js';

/**
 * Adaptador de salida que cumple el puerto Autenticacion con Supabase Auth.
 * Traduce la respuesta de Supabase a la sesion que entienden los casos de
 * uso: token, renovacion y cuando vence, en segundos.
 */

function sesionDesde(respuesta) {
  return {
    token: respuesta.access_token,
    renovacion: respuesta.refresh_token,
    venceEn: respuesta.expires_at,
    usuario: { id: respuesta.user?.id, correo: respuesta.user?.email }
  };
}

function cabeceras(conexion, token) {
  const base = { apikey: conexion.CLAVE_PUBLICA, 'Content-Type': 'application/json' };
  return token ? { ...base, Authorization: `Bearer ${token}` } : base;
}

async function pedirToken({ obtener, conexion }, tipo, cuerpo) {
  const respuesta = await obtener(`${conexion.URL}/auth/v1/token?grant_type=${tipo}`, {
    method: 'POST',
    headers: cabeceras(conexion),
    body: JSON.stringify(cuerpo)
  });
  // Supabase responde 400 cuando el correo o la clave no son correctos.
  if (respuesta.status === 400) {
    throw Object.assign(new Error('Credenciales no validas'), { codigo: 'credenciales' });
  }
  if (!respuesta.ok) {
    throw new Error(`Supabase Auth respondio ${respuesta.status}`);
  }
  return sesionDesde(await respuesta.json());
}

export function crearAutenticacionSupabase(
  obtener = (url, opciones) => fetch(url, opciones),
  conexion = CONFIG.SUPABASE
) {
  const red = { obtener, conexion };
  return {
    iniciarSesion: (correo, clave) => pedirToken(red, 'password', { email: correo, password: clave }),
    renovar: (renovacion) => pedirToken(red, 'refresh_token', { refresh_token: renovacion }),
    async cerrarSesion(token) {
      await obtener(`${conexion.URL}/auth/v1/logout`, {
        method: 'POST',
        headers: cabeceras(conexion, token)
      });
    }
  };
}
