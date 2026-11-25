import { CONFIG } from '../../config.js';
import { puedeUsarPanel } from '../../dominio/sesion.js';
import { cerrarSesion, sesionActiva } from '../../casos-de-uso/gestionar-sesion.js';
import { ahoraEnSegundos, dependenciasSesion } from './dependencias-sesion.js';

/**
 * Arranque comun de las paginas privadas (inventario y factura): confirma la
 * sesion y el perfil, conecta "Salir" y muestra el contenido o el error.
 * Cada pagina solo dice que hacer cuando todo esta listo.
 */

const dependencias = dependenciasSesion();

function volverAlLogin() {
  window.location.replace(CONFIG.RUTAS.LOGIN);
}

/**
 * La sesion vigente en este momento. Cada operacion la pide de nuevo: si
 * vencio se renueva sola, y si ya no sirve vuelve al login en vez de fallar a
 * mitad de un guardado.
 */
export async function tokenVigente() {
  const sesion = await sesionActiva(dependencias, ahoraEnSegundos());
  if (!sesion) {
    volverAlLogin();
    throw new Error('Sin sesion');
  }
  return sesion.token;
}

async function salir() {
  await cerrarSesion(dependencias);
  volverAlLogin();
}

/**
 * @param {(perfil: object) => Promise<void>} alEntrar lo que la pagina hace
 *   con la sesion confirmada.
 */
export async function arrancarPaginaPrivada(alEntrar) {
  document.querySelector('#salir').addEventListener('click', salir);
  try {
    const sesion = await sesionActiva(dependencias, ahoraEnSegundos());
    if (!sesion) {
      volverAlLogin();
      return;
    }
    const perfil = await dependencias.perfiles.miPerfil(sesion.token);
    if (!puedeUsarPanel(perfil)) {
      await salir();
      return;
    }
    document.querySelector('#contenido-panel').hidden = false;
    await alEntrar(perfil);
  } catch {
    document.querySelector('#error-panel').hidden = false;
  } finally {
    document.querySelector('#cargando').hidden = true;
  }
}
