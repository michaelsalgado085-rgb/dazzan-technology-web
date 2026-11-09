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
 * Meses de garantia de un producto.
 * Reglas RN-02, RN-03 y RN-04 de docs/REQUISITOS.md.
 * Un valor explicito en el producto tiene prioridad sobre el calculo.
 */
export function garantiaMeses(producto) {
  if (typeof producto.garantiaMeses === 'number') {
    return producto.garantiaMeses;
  }
  if (producto.condicion === CONDICION.NUEVO) {
    return 0;
  }
  return producto.precio > CONFIG.PRECIO_LIMITE_GAMA_ESTANDAR
    ? CONFIG.GARANTIA_GAMA_ALTA_MESES
    : CONFIG.GARANTIA_ESTANDAR_MESES;
}

/**
 * Texto de garantia listo para mostrar al cliente.
 */
export function textoGarantia(producto) {
  if (producto.condicion === CONDICION.NUEVO) {
    return 'Producto nuevo con garantía del fabricante';
  }
  const meses = garantiaMeses(producto);
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
