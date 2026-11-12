import { escaparHtml, formatearMoneda } from './utils.js';
import { calcularTotal } from './cotizacion.js';

/**
 * Vista del panel de cotizacion. Igual que vista-producto: solo cadenas,
 * nada de DOM.
 */

/**
 * Una linea de la lista con su boton de quitar.
 */
export function filaCotizacion(linea) {
  const importe = formatearMoneda(linea.precio * linea.cantidad);
  return `<li class="cotizacion__fila">
    <div>
      <p class="cotizacion__nombre">${escaparHtml(linea.nombre)}</p>
      <p class="cotizacion__detalle">${linea.cantidad} x
        ${formatearMoneda(linea.precio)}</p>
    </div>
    <p class="cotizacion__importe">${importe}</p>
    <button class="boton-quitar" type="button" data-accion="quitar"
      data-id="${escaparHtml(linea.id)}"
      aria-label="Quitar ${escaparHtml(linea.nombre)} de la lista">&times;</button>
  </li>`;
}

/**
 * Total estimado de la cotizacion. Una sola cifra: los precios ya incluyen el
 * ISV (RN-08) y en la lista publica no hay descuentos.
 */
export function bloqueTotal(lineas) {
  return `<dl class="totales">
    <div class="totales__fila totales__fila--final"><dt>Total estimado</dt>
      <dd>${formatearMoneda(calcularTotal(lineas))}</dd></div>
  </dl>`;
}

/**
 * Panel completo. Con la lista vacia muestra una invitacion, no un cero.
 */
export function panelCotizacion(lineas) {
  if (lineas.length === 0) {
    return `<p class="cotizacion__vacia">Tu lista está vacía. Agregá
      productos y te preparamos la cotización por WhatsApp.</p>`;
  }
  const filas = lineas.map(filaCotizacion).join('');
  return `<ul class="cotizacion__lista">${filas}</ul>${bloqueTotal(lineas)}`;
}

/**
 * Cantidad total de unidades, para el contador del boton flotante.
 */
export function unidadesTotales(lineas) {
  return lineas.reduce((suma, linea) => suma + linea.cantidad, 0);
}
