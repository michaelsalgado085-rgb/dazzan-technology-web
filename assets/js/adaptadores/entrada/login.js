import { CONFIG } from '../../config.js';
import { iniciarSesion, sesionActiva } from '../../casos-de-uso/sesion.js';
import { ahoraEnSegundos, dependenciasSesion } from './dependencias-sesion.js';

/**
 * Pantalla de acceso. Solo lee el formulario, llama al caso de uso y muestra
 * el resultado; las reglas viven en el dominio.
 */

const SIN_CONEXION = 'No se pudo conectar. Revisa tu internet e intenta de nuevo.';

const dependencias = dependenciasSesion();
const formulario = document.querySelector('#formulario-acceso');
const boton = formulario.querySelector('button[type="submit"]');
const avisoErrores = document.querySelector('#errores-acceso');

function mostrarErrores(errores) {
  // textContent y no innerHTML: un mensaje nunca se interpreta como HTML.
  avisoErrores.textContent = errores.join(' ');
  avisoErrores.hidden = errores.length === 0;
}

async function entrar(evento) {
  evento.preventDefault();
  boton.disabled = true;
  mostrarErrores([]);
  const datos = new FormData(formulario);
  try {
    const resultado = await iniciarSesion(
      { correo: datos.get('correo'), clave: datos.get('clave') },
      dependencias
    );
    if (resultado.entro) {
      window.location.replace(CONFIG.RUTAS.PANEL);
      return;
    }
    mostrarErrores(resultado.errores);
  } catch {
    mostrarErrores([SIN_CONEXION]);
  } finally {
    boton.disabled = false;
  }
}

async function iniciar() {
  formulario.addEventListener('submit', entrar);
  // Quien ya tiene sesion no tiene por que volver a escribir su clave.
  if (await sesionActiva(dependencias, ahoraEnSegundos())) {
    window.location.replace(CONFIG.RUTAS.PANEL);
  }
}

iniciar();
