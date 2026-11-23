import { crearAutenticacionSupabase } from '../salida/autenticacion-supabase.js';
import { crearPerfilesSupabase } from '../salida/perfiles-supabase.js';
import { crearAlmacenSesion } from '../salida/almacen-sesion-navegador.js';

/**
 * Raiz de composicion de la sesion: el login y el panel piden aqui los mismos
 * adaptadores, en vez de armarlos cada uno por su lado.
 */
export function dependenciasSesion() {
  return {
    autenticacion: crearAutenticacionSupabase(),
    perfiles: crearPerfilesSupabase(),
    almacen: crearAlmacenSesion()
  };
}

// El reloj es un detalle del borde: el dominio recibe la hora ya calculada.
export function ahoraEnSegundos() {
  return Math.floor(Date.now() / 1000);
}
