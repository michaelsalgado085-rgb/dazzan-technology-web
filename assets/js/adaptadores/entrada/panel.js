import { CONFIG } from '../../config.js';
import { puedeUsarPanel } from '../../dominio/sesion.js';
import { cerrarSesion, sesionActiva } from '../../casos-de-uso/sesion.js';
import { ahoraEnSegundos, dependenciasSesion } from './dependencias-sesion.js';

/**
 * Panel de administracion. Por ahora confirma la sesion y saluda; el
 * inventario y la factura se agregan aqui (RF-23 a RF-30).
 */

const dependencias = dependenciasSesion();

function volverAlLogin() {
  window.location.replace(CONFIG.RUTAS.LOGIN);
}

async function salir() {
  await cerrarSesion(dependencias);
  volverAlLogin();
}

async function iniciar() {
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
    document.querySelector('#nombre-usuario').textContent = perfil.nombre.split(' ')[0];
    document.querySelector('#contenido-panel').hidden = false;
  } catch {
    document.querySelector('#error-panel').hidden = false;
  } finally {
    document.querySelector('#cargando').hidden = true;
  }
}

iniciar();
