import { CONFIG } from '../config.js';

/**
 * Reglas de la sesion del panel. Puras: el momento actual llega por
 * parametro, asi las pruebas no dependen del reloj.
 */

export const ESTADO_SESION = Object.freeze({
  NINGUNA: 'ninguna',
  VIGENTE: 'vigente',
  POR_RENOVAR: 'por-renovar'
});

/**
 * Una sesion vencida o a punto de vencer se renueva; sin sesion, no hay nada
 * que renovar.
 */
export function estadoSesion(sesion, ahoraEnSegundos) {
  if (!sesion?.token) {
    return ESTADO_SESION.NINGUNA;
  }
  const limite = sesion.venceEn - CONFIG.SESION.MARGEN_RENOVACION_SEGUNDOS;
  return ahoraEnSegundos < limite ? ESTADO_SESION.VIGENTE : ESTADO_SESION.POR_RENOVAR;
}

/**
 * Lo que falta para intentar entrar, en palabras para quien escribe.
 */
export function erroresDeAcceso({ correo = '', clave = '' }) {
  const errores = [];
  if (!correo.trim().includes('@')) {
    errores.push('Escribe tu correo.');
  }
  if (clave === '') {
    errores.push('Escribe tu contraseña.');
  }
  return errores;
}

/**
 * RLS ya protege los datos; esta regla decide quien ve la pantalla del panel.
 */
export function puedeUsarPanel(perfil) {
  return perfil?.rol === 'administrador';
}
