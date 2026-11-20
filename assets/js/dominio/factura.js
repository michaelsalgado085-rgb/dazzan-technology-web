import { CONFIG } from '../config.js';
import { redondearDosDecimales } from '../utils.js';

/**
 * Reglas de la factura (RN-10 a RN-25). Funciones puras: reciben la factura
 * como datos y devuelven datos. No saben si la factura se guarda en Supabase,
 * en otro proveedor o en memoria; eso lo resuelve el repositorio.
 */

/**
 * RN-24: numero con ceros a la izquierda. Pasado el limite de digitos se
 * imprime completo: nunca se recorta un numero.
 */
export function formatearNumeroFactura(numero) {
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new RangeError('El numero de factura debe ser un entero mayor que cero');
  }
  return String(numero).padStart(CONFIG.FACTURA_DIGITOS, '0');
}

/**
 * RN-25: vence el mismo dia, tantos meses despues. Si ese dia no existe, los
 * dias que sobran pasan al mes siguiente, como pidio el cliente: el 30 de
 * noviembre de 2026 vence el 2 de marzo de 2027. Es justo lo que hace Date
 * al desbordar el mes, por eso no hay que corregir nada.
 */
export function fechaVencimientoGarantia(fechaVenta, meses = CONFIG.GARANTIA_MESES) {
  return new Date(
    fechaVenta.getFullYear(),
    fechaVenta.getMonth() + meses,
    fechaVenta.getDate()
  );
}

/**
 * RN-13: precio por cantidad, menos el descuento acordado para esa linea.
 */
export function importeLineaFactura(linea) {
  return redondearDosDecimales(linea.precio * linea.cantidad - (linea.descuento ?? 0));
}

/**
 * RN-08 y RN-13: sin ISV. El total es el subtotal menos el descuento adicional.
 */
export function totalesFactura(factura) {
  const subtotal = redondearDosDecimales(
    (factura.lineas ?? []).reduce((suma, linea) => suma + importeLineaFactura(linea), 0)
  );
  const descuentoAdicional = factura.descuentoAdicional ?? 0;
  return {
    subtotal,
    descuentoAdicional,
    total: redondearDosDecimales(subtotal - descuentoAdicional)
  };
}

function validarCliente(factura) {
  const nombre = factura.cliente?.nombre ?? '';
  return nombre.trim() === '' ? ['El nombre del cliente es obligatorio (RN-11).'] : [];
}

function erroresDeLinea(linea) {
  const errores = [];
  if (!Number.isInteger(linea.cantidad) || linea.cantidad <= 0) {
    errores.push(`La cantidad de ${linea.descripcion} debe ser un entero mayor que cero.`);
  } else if (linea.existencias !== undefined && linea.cantidad > linea.existencias) {
    errores.push(`Solo hay ${linea.existencias} de ${linea.descripcion} en existencia.`);
  }
  const descuento = linea.descuento ?? 0;
  if (descuento < 0 || descuento > linea.precio * linea.cantidad) {
    errores.push(`El descuento de ${linea.descripcion} va de cero hasta su importe (RN-13).`);
  }
  return errores;
}

function validarLineas(factura) {
  if (!factura.lineas?.length) {
    return ['La factura necesita al menos un producto (RN-19).'];
  }
  return factura.lineas.flatMap(erroresDeLinea);
}

function validarDescuentoAdicional(factura) {
  const { subtotal, descuentoAdicional } = totalesFactura(factura);
  if (descuentoAdicional < 0 || descuentoAdicional > subtotal) {
    return ['El descuento adicional va de cero hasta el subtotal (RN-13).'];
  }
  return [];
}

function erroresDePago(pago) {
  const errores = [];
  if (!CONFIG.METODOS_PAGO.includes(pago.metodo)) {
    errores.push(`"${pago.metodo}" no es un metodo de pago aceptado (RN-14).`);
  }
  if (!(pago.monto > 0)) {
    errores.push('Cada pago debe ser mayor que cero (RN-22).');
  }
  return errores;
}

function validarPagos(factura) {
  const pagos = factura.pagos ?? [];
  const errores = pagos.flatMap(erroresDePago);
  const metodos = pagos.map((pago) => pago.metodo);
  if (new Set(metodos).size !== metodos.length) {
    errores.push('Un metodo de pago no se repite en la misma factura (RN-23).');
  }
  const pagado = redondearDosDecimales(pagos.reduce((suma, pago) => suma + pago.monto, 0));
  const { total } = totalesFactura(factura);
  if (pagado !== total) {
    errores.push(`Los pagos suman ${pagado} y el total es ${total} (RN-21).`);
  }
  return errores;
}

// Cada regla es una funcion independiente. Una regla nueva es una funcion mas
// en esta lista; las demas no se tocan (abierto a extension, cerrado a
// modificacion).
const VALIDACIONES = [validarCliente, validarLineas, validarDescuentoAdicional, validarPagos];

/**
 * Todo lo que impide emitir la factura, en palabras para quien factura.
 * Una lista vacia significa que la factura es valida.
 */
export function erroresDeFactura(factura) {
  return VALIDACIONES.flatMap((validar) => validar(factura));
}
