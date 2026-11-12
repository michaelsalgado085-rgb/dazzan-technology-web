import { CONFIG, CONDICION, ESTADO_STOCK } from './config.js';

/**
 * Determina el estado de stock a partir de la cantidad disponible.
 */
export function estadoStock(cantidad) {
  if (cantidad <= 0) {
    return ESTADO_STOCK.AGOTADO;
  }
  if (cantidad <= CONFIG.STOCK_UMBRAL_BAJO) {
    return ESTADO_STOCK.BAJO;
  }
  return ESTADO_STOCK.DISPONIBLE;
}

/**
 * Texto de garantia listo para mostrar al cliente.
 * RN-02: todo producto lleva el mismo plazo, sea usado o nuevo y cueste lo
 * que cueste. El plazo entra por parametro para poder probar el singular sin
 * tocar la configuracion.
 */
export function textoGarantia(meses = CONFIG.GARANTIA_MESES) {
  return `Garantía de ${meses} ${meses === 1 ? 'mes' : 'meses'} de la tienda`;
}

/**
 * Indica si el producto requiere el aviso de estado estetico (RF-08).
 */
export function requiereAvisoEstado(producto) {
  return producto.condicion === CONDICION.USADO;
}

/**
 * Porcentaje de descuento frente al precio anterior. Devuelve 0 si no aplica.
 */
export function porcentajeDescuento(producto) {
  const anterior = producto.precioAnterior;
  if (!anterior || anterior <= producto.precio) {
    return 0;
  }
  return Math.round(((anterior - producto.precio) / anterior) * 100);
}
