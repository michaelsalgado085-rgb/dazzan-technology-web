import { CONFIG } from '../config.js';

/**
 * RN-34: el panel saluda segun la hora del dispositivo. Recibe la hora ya
 * leida (0 a 23) y no el reloj, para poder probar cada franja sin esperar.
 */
export function saludoSegunHora(hora, horarios = CONFIG.SALUDO) {
  if (!Number.isInteger(hora) || hora < 0 || hora > 23) {
    return 'Hola';
  }
  if (hora >= horarios.INICIO_NOCHE || hora < horarios.INICIO_MANANA) {
    return 'Buenas noches';
  }
  return hora >= horarios.INICIO_TARDE ? 'Buenas tardes' : 'Buenos días';
}
