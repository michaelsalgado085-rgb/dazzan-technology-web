import { ESTADO_SESION, erroresDeAcceso, estadoSesion, puedeUsarPanel } from '../dominio/sesion.js';

/**
 * Puertos que necesitan los casos de uso de la sesion:
 *
 * @typedef {object} Autenticacion
 * @property {(correo: string, clave: string) => Promise<object>} iniciarSesion
 *   Rechaza con un error de codigo 'credenciales' si el correo o la clave no son correctos.
 * @property {(renovacion: string) => Promise<object>} renovar
 * @property {(token: string) => Promise<void>} cerrarSesion
 *
 * @typedef {object} Perfiles
 * @property {(token: string) => Promise<object|null>} miPerfil
 *
 * @typedef {object} AlmacenSesion
 * @property {() => object|null} leer
 * @property {(sesion: object) => void} guardar
 * @property {() => void} borrar
 */

const CREDENCIALES_INVALIDAS = 'El correo o la contraseña no son correctos.';
const SIN_ACCESO = 'Esta cuenta no tiene acceso al panel.';

/**
 * Caso de uso: entrar al panel. Una cuenta que existe pero no es
 * administradora sale de inmediato, sin dejar sesion guardada.
 */
export async function iniciarSesion(credenciales, { autenticacion, perfiles, almacen }) {
  const errores = erroresDeAcceso(credenciales);
  if (errores.length > 0) {
    return { entro: false, errores };
  }
  let sesion;
  try {
    sesion = await autenticacion.iniciarSesion(credenciales.correo.trim(), credenciales.clave);
  } catch (error) {
    if (error.codigo === 'credenciales') {
      return { entro: false, errores: [CREDENCIALES_INVALIDAS] };
    }
    throw error;
  }
  const perfil = await perfiles.miPerfil(sesion.token);
  if (!puedeUsarPanel(perfil)) {
    await autenticacion.cerrarSesion(sesion.token);
    return { entro: false, errores: [SIN_ACCESO] };
  }
  almacen.guardar(sesion);
  return { entro: true, perfil };
}

/**
 * Caso de uso: la sesion con la que se trabaja ahora, renovada si hace falta.
 * Devuelve null si hay que volver a entrar.
 */
export async function sesionActiva({ autenticacion, almacen }, ahoraEnSegundos) {
  const sesion = almacen.leer();
  const estado = estadoSesion(sesion, ahoraEnSegundos);
  if (estado === ESTADO_SESION.NINGUNA) {
    return null;
  }
  if (estado === ESTADO_SESION.VIGENTE) {
    return sesion;
  }
  try {
    const renovada = await autenticacion.renovar(sesion.renovacion);
    almacen.guardar(renovada);
    return renovada;
  } catch {
    almacen.borrar();
    return null;
  }
}

/**
 * Caso de uso: salir. La sesion local se borra aunque el servidor no
 * responda, para que el telefono nunca quede con el panel abierto.
 */
export async function cerrarSesion({ autenticacion, almacen }) {
  const sesion = almacen.leer();
  almacen.borrar();
  if (!sesion?.token) {
    return;
  }
  try {
    await autenticacion.cerrarSesion(sesion.token);
  } catch {
    // Sin conexion el token no se invalida en el servidor, pero vence solo
    // en una hora y en este telefono ya no queda guardado.
  }
}
