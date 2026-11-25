import { escaparHtml, formatearMoneda } from '../../utils.js';
import { estadoStock } from '../../dominio/producto.js';
import { portada } from '../../dominio/fotos.js';
import { INICIAL_CATEGORIA } from './vista-producto.js';

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

/**
 * La portada en pequeno, para reconocer el producto de un vistazo. Sin fotos,
 * la inicial de la categoria, igual que en la tienda.
 */
export function miniaturaInventario(producto) {
  const fotos = producto.fotos ?? [];
  if (fotos.length > 0) {
    return `<img class="inventario__miniatura" src="${escaparHtml(portada(fotos))}" alt=""
        loading="lazy" width="96" height="96">`;
  }
  const inicial = INICIAL_CATEGORIA[producto.categoria] ?? '?';
  return `<span class="inventario__inicial" aria-hidden="true">${escaparHtml(inicial)}</span>`;
}

export function filaInventario(producto) {
  const estado = estadoStock(producto.stock);
  const clase = producto.stock === 0 ? ' inventario__fila--agotado' : '';
  const categoria = NOMBRE_CATEGORIA[producto.categoria] ?? producto.categoria;
  return `<li>
    <button class="inventario__fila${clase}" type="button" data-id="${escaparHtml(producto.id)}">
      ${miniaturaInventario(producto)}
      <span class="inventario__textos">
        <span class="inventario__nombre">${escaparHtml(producto.nombre)}</span>
        <span class="inventario__detalle">${escaparHtml(producto.marca)} · ${escaparHtml(categoria)}</span>
      </span>
      <span class="inventario__cifras">
        <span class="inventario__precio">${formatearMoneda(producto.precio)}</span>
        <span class="inventario__stock inventario__stock--${estado}">${textoExistencias(producto.stock)}</span>
      </span>
    </button>
  </li>`;
}

/**
 * Las tres cifras de arriba del panel. Recibe el resumen ya calculado por
 * el dominio.
 */
export function tarjetasResumen({ productos, unidades, agotados }) {
  const tarjeta = (cifra, texto, clase = '') =>
    `<div class="resumen__tarjeta${clase}"><dt>${texto}</dt><dd>${cifra}</dd></div>`;
  return [
    tarjeta(productos, productos === 1 ? 'Modelo' : 'Modelos'),
    tarjeta(unidades, unidades === 1 ? 'Unidad' : 'Unidades'),
    tarjeta(agotados, agotados === 1 ? 'Agotado' : 'Agotados', agotados > 0 ? ' resumen__tarjeta--alerta' : '')
  ].join('');
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

/**
 * Miniaturas del formulario. La primera es la portada; las demas ofrecen
 * pasar a serlo. Una foto es su direccion o { url } si todavia no se subio.
 */
export function miniaturasFotos(fotos) {
  return fotos
    .map((foto, indice) => {
      const url = escaparHtml(typeof foto === 'string' ? foto : foto.url);
      const etiqueta = indice === 0
        ? '<span class="fotos__portada">Portada</span>'
        : `<button class="fotos__accion" type="button" data-accion="portada" data-indice="${indice}">Hacer portada</button>`;
      return `<li class="fotos__item">
        <img class="fotos__imagen" src="${url}" alt="Foto ${indice + 1}">
        ${etiqueta}
        <button class="fotos__quitar" type="button" data-accion="quitar" data-indice="${indice}"
          aria-label="Quitar foto ${indice + 1}">×</button>
      </li>`;
    })
    .join('');
}
