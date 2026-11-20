import { erroresDeFactura, totalesFactura } from '../dominio/factura.js';

/**
 * Puerto que necesita este caso de uso. El adaptador que lo cumpla guarda la
 * factura completa o nada (la base de datos lo hace en una transaccion) y
 * devuelve la factura con el numero que le toco.
 *
 * @typedef {object} RepositorioFacturas
 * @property {(factura: object) => Promise<object>} emitir
 */

/**
 * Caso de uso: emitir una factura. Primero decide el dominio; solo si la
 * factura es valida se le pide al repositorio que la guarde. Asi una factura
 * con errores nunca viaja por la red ni gasta un numero.
 *
 * @param {object} factura
 * @param {RepositorioFacturas} repositorio
 */
export async function emitirFactura(factura, repositorio) {
  const errores = erroresDeFactura(factura);
  if (errores.length > 0) {
    return { emitida: false, errores };
  }
  const guardada = await repositorio.emitir({ ...factura, ...totalesFactura(factura) });
  return { emitida: true, factura: guardada };
}
