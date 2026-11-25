import { CONFIG } from '../../config.js';
import { escaparHtml, formatearMoneda } from '../../utils.js';
import { formatearNumeroFactura, importeLineaFactura } from '../../dominio/factura.js';
import { saldoPorPagar } from '../../dominio/armar-factura.js';
import { miniaturaInventario } from './vista-inventario.js';

/**
 * Plantillas de la pantalla de factura (RF-24, RF-25). Reciben datos y
 * devuelven HTML: no leen ni escriben el DOM, por eso se pueden probar.
 */

export const NOMBRE_METODO = Object.freeze({
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  financiamiento: 'Financiamiento'
});

export function resultadosFactura(productos, maximo = CONFIG.FACTURA_RESULTADOS_MAXIMOS) {
  return productos
    .slice(0, maximo)
    .map(
      (producto) => `<li>
      <button class="factura__resultado" type="button" data-id="${escaparHtml(producto.id)}">
        ${miniaturaInventario(producto)}
        <span class="factura__resultado-texto">
          <strong>${escaparHtml(producto.nombre)}</strong>
          <span>${escaparHtml(producto.marca)} · ${producto.stock} en existencia</span>
        </span>
        <span class="factura__resultado-precio">${formatearMoneda(producto.precio)}</span>
      </button>
    </li>`
    )
    .join('');
}

// Un numero a medio escribir (NaN) se muestra vacio, no como "NaN".
function valorDeCampo(numero) {
  return Number.isFinite(numero) ? numero : '';
}

function importeVisible(linea) {
  const importe = importeLineaFactura(linea);
  return Number.isFinite(importe) ? formatearMoneda(importe) : '—';
}

function campoLinea(linea, { campo, etiqueta, atributos }) {
  const id = `${campo}-${escaparHtml(linea.productoId)}`;
  const valor = campo === 'numeroSerie' ? escaparHtml(linea.numeroSerie) : valorDeCampo(linea[campo]);
  return `<div class="campo">
        <label class="campo__etiqueta" for="${id}">${etiqueta}</label>
        <input class="campo__entrada" id="${id}" data-id="${escaparHtml(linea.productoId)}"
          data-campo="${campo}" value="${valor}" ${atributos}>
      </div>`;
}

export function lineaFactura(linea) {
  const nombre = escaparHtml(linea.descripcion);
  return `<li class="factura__linea">
    <div class="factura__linea-cabeza">
      <span><strong>${nombre}</strong> <span class="factura__marca">${escaparHtml(linea.marca)}</span></span>
      <button class="factura__quitar" type="button" data-quitar="${escaparHtml(linea.productoId)}"
        aria-label="Quitar ${nombre}">✕</button>
    </div>
    <p class="factura__precio">${formatearMoneda(linea.precio)} c/u · hay ${linea.existencias}</p>
    <div class="factura__campos">
      ${campoLinea(linea, { campo: 'cantidad', etiqueta: 'Cantidad', atributos: `type="number" inputmode="numeric" min="1" max="${linea.existencias}" step="1"` })}
      ${campoLinea(linea, { campo: 'descuento', etiqueta: 'Descuento (L)', atributos: 'type="text" inputmode="decimal"' })}
    </div>
    ${campoLinea(linea, { campo: 'numeroSerie', etiqueta: 'Número de serie (opcional)', atributos: 'type="text" autocomplete="off"' })}
    <p class="factura__importe">Importe <strong data-importe="${escaparHtml(linea.productoId)}">${importeVisible(linea)}</strong></p>
  </li>`;
}

export function lineasFactura(lineas) {
  if (lineas.length === 0) {
    return '<li class="factura__vacia">Busca un producto arriba para agregarlo.</li>';
  }
  return lineas.map(lineaFactura).join('');
}

export { importeVisible };

/**
 * Un cuadro por metodo de pago (RN-14), con su monto escondido: solo hace
 * falta escribirlo cuando se paga con mas de un metodo.
 */
export function opcionesPago(metodos = CONFIG.METODOS_PAGO) {
  return metodos
    .map((metodo) => {
      const nombre = NOMBRE_METODO[metodo] ?? metodo;
      return `<div class="pago">
      <label class="pago__metodo"><input type="checkbox" name="metodo" value="${metodo}"> ${nombre}</label>
      <label class="visualmente-oculto" for="monto-${metodo}">Monto en ${nombre.toLowerCase()}</label>
      <input class="campo__entrada pago__monto" id="monto-${metodo}" data-monto="${metodo}" type="text"
        inputmode="decimal" placeholder="L 0.00" hidden>
    </div>`;
    })
    .join('');
}

function montoVisible(monto) {
  return Number.isFinite(monto) ? formatearMoneda(monto) : '—';
}

export function resumenTotales({ subtotal, descuentoAdicional, total }) {
  return `<div><dt>Subtotal</dt><dd>${montoVisible(subtotal)}</dd></div>
    <div><dt>Descuento adicional</dt><dd>${montoVisible(descuentoAdicional)}</dd></div>
    <div class="factura__total"><dt>Total</dt><dd>${montoVisible(total)}</dd></div>`;
}

/**
 * RN-21: con varios metodos hay que decir cuanto falta o cuanto sobra.
 */
export function textoSaldo(saldo) {
  if (saldo === 0) {
    return 'Los pagos cubren el total.';
  }
  return saldo > 0 ? `Falta ${formatearMoneda(saldo)}.` : `Sobra ${formatearMoneda(-saldo)}.`;
}

/**
 * Lo que se le dice a quien factura sobre el pago, segun el total y los
 * metodos elegidos.
 */
export function mensajeSaldo(total, elegidos) {
  if (total === 0) {
    return 'Total cero: no lleva pagos (RN-22).';
  }
  if (!Number.isFinite(total) || elegidos.length === 0) {
    return '';
  }
  if (elegidos.length > 1) {
    return textoSaldo(saldoPorPagar(total, elegidos));
  }
  const nombre = NOMBRE_METODO[elegidos[0].metodo] ?? elegidos[0].metodo;
  return `Paga ${formatearMoneda(total)} en ${nombre.toLowerCase()}.`;
}

export function textoEmitida(factura) {
  return `Factura ${formatearNumeroFactura(factura.numero)} emitida a nombre de ${factura.cliente.nombre}, por ${formatearMoneda(factura.total)}.`;
}

/**
 * Las reglas de la base y la falta de permiso ya traen su mensaje para quien
 * factura; cualquier otra falla se explica igual.
 */
export function mensajeDeError(error) {
  return ['regla', 'sesion'].includes(error.codigo)
    ? error.message
    : 'No se pudo emitir. Revisa tu internet e intenta de nuevo.';
}
