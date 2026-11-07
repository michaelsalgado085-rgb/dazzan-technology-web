import { CONFIG } from './config.js';

/**
 * Formatea un valor numerico como moneda local.
 */
export function formatearMoneda(valor) {
  if (typeof valor !== 'number' || Number.isNaN(valor)) {
    throw new TypeError('formatearMoneda espera un numero valido');
  }
  return new Intl.NumberFormat(CONFIG.MONEDA_LOCALE, {
    style: 'currency',
    currency: CONFIG.MONEDA_CODIGO,
    minimumFractionDigits: 2
  }).format(valor);
}

/**
 * Redondea a dos decimales evitando errores de punto flotante.
 */
export function redondearDosDecimales(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula el ISV correspondiente a un subtotal.
 */
export function calcularISV(subtotal) {
  if (subtotal < 0) {
    throw new RangeError('El subtotal no puede ser negativo');
  }
  return redondearDosDecimales(subtotal * CONFIG.TASA_ISV);
}

/**
 * Calcula subtotal, ISV y total de una lista de lineas { precio, cantidad }.
 */
export function calcularTotales(lineas) {
  const subtotal = redondearDosDecimales(
    lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0)
  );
  const isv = calcularISV(subtotal);
  return { subtotal, isv, total: redondearDosDecimales(subtotal + isv) };
}

/**
 * Escapa caracteres peligrosos antes de inyectar texto al DOM.
 */
export function escaparHtml(texto) {
  const reemplazos = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(texto).replace(/[&<>"']/g, (caracter) => reemplazos[caracter]);
}

/**
 * Normaliza texto para busquedas: minusculas y sin tildes.
 */
export function normalizarTexto(texto) {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
