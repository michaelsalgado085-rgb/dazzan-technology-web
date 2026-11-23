import { CONFIG } from '../../config.js';
import { puedeUsarPanel } from '../../dominio/sesion.js';
import { cerrarSesion, sesionActiva } from '../../casos-de-uso/sesion.js';
import { ahoraEnSegundos, dependenciasSesion } from './dependencias-sesion.js';
import { crearInventarioSupabase } from '../salida/inventario-supabase.js';
import { iniciarInventario } from './pantalla-inventario.js';

/**
 * Panel de administracion: confirma la sesion, saluda y arranca el
 * inventario (RF-23). La factura se agrega aqui despues (RF-24 a RF-30).
 */

const dependencias = dependenciasSesion();

function volverAlLogin() {
  window.location.replace(CONFIG.RUTAS.LOGIN);
}

// Cada operacion pide la sesion de nuevo: si vencio, se renueva sola, y si
// ya no sirve, vuelve al login en vez de fallar a mitad de un guardado.
async function repositorioConSesionVigente() {
  const sesion = await sesionActiva(dependencias, ahoraEnSegundos());
  if (!sesion) {
    volverAlLogin();
    throw new Error('Sin sesion');
  }
  return crearInventarioSupabase(sesion.token);
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
    await iniciarInventario(repositorioConSesionVigente);
  } catch {
    document.querySelector('#error-panel').hidden = false;
  } finally {
    document.querySelector('#cargando').hidden = true;
  }
}

iniciar();
