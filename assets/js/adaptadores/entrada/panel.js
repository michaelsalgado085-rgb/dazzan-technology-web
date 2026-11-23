import { CONFIG } from '../../config.js';
import { puedeUsarPanel } from '../../dominio/sesion.js';
import { saludoSegunHora } from '../../dominio/saludo.js';
import { cerrarSesion, sesionActiva } from '../../casos-de-uso/gestionar-sesion.js';
import { ahoraEnSegundos, dependenciasSesion } from './dependencias-sesion.js';
import { crearInventarioSupabase } from '../salida/inventario-supabase.js';
import { crearFotosSupabase } from '../salida/fotos-supabase.js';
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
async function serviciosConSesionVigente() {
  const sesion = await sesionActiva(dependencias, ahoraEnSegundos());
  if (!sesion) {
    volverAlLogin();
    throw new Error('Sin sesion');
  }
  return {
    repositorio: crearInventarioSupabase(sesion.token),
    almacenFotos: crearFotosSupabase(sesion.token)
  };
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
    const nombre = perfil.nombre.split(' ')[0];
    document.querySelector('#saludo-panel').textContent = `${saludoSegunHora(new Date().getHours())}, ${nombre}`;
    document.querySelector('#contenido-panel').hidden = false;
    await iniciarInventario(serviciosConSesionVigente);
  } catch {
    document.querySelector('#error-panel').hidden = false;
  } finally {
    document.querySelector('#cargando').hidden = true;
  }
}

iniciar();
