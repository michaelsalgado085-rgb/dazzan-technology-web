import { escaparHtml, formatearMoneda } from '../../utils.js';

/**
 * Vista del inventario del panel: datos a texto HTML, sin tocar el DOM.
 * Todo texto que escribio el cliente pasa por escaparHtml.
 */

export const NOMBRE_CATEGORIA = Object.freeze({
  laptops: 'Laptops',
  escritorio: 'Computadoras de escritorio',
  teclados: 'Teclados',
  mouse: 'Mouse',
  auriculares: 'Auriculares'
});

function textoExistencias(stock) {
  if (stock === 0) {
    return 'Agotado';
  }
  return stock === 1 ? '1 en existencia' : `${stock} en existencia`;
}

export function filaInventario(producto) {
  const clase = producto.stock === 0 ? ' inventario__fila--agotado' : '';
  const categoria = NOMBRE_CATEGORIA[producto.categoria] ?? producto.categoria;
  return `<li>
    <button class="inventario__fila${clase}" type="button" data-id="${escaparHtml(producto.id)}">
      <span class="inventario__nombre">${escaparHtml(producto.nombre)}</span>
      <span class="inventario__detalle">${escaparHtml(producto.marca)} · ${escaparHtml(categoria)}</span>
      <span class="inventario__precio">${formatearMoneda(producto.precio)}</span>
      <span class="inventario__stock">${textoExistencias(producto.stock)}</span>
    </button>
  </li>`;
}

export function listaInventario(productos, termino = '') {
  if (productos.length > 0) {
    return productos.map(filaInventario).join('');
  }
  const mensaje = termino.trim()
    ? `No hay productos que coincidan con "${escaparHtml(termino.trim())}".`
    : 'Todavía no hay productos. Toca "Agregar producto" para cargar el primero.';
  return `<li class="inventario__vacio">${mensaje}</li>`;
}

export function opcionesCategoria() {
  const opciones = Object.entries(NOMBRE_CATEGORIA).map(
    ([id, nombre]) => `<option value="${id}">${nombre}</option>`
  );
  return ['<option value="">Elige una categoría</option>', ...opciones].join('');
}

/**
 * Texto plano, no HTML: la pantalla lo pinta con textContent.
 */
export function mensajeDuplicado(producto) {
  return `Ya existe "${producto.nombre}" de ${producto.marca}, con ${textoExistencias(producto.stock).toLowerCase()}.`;
}
