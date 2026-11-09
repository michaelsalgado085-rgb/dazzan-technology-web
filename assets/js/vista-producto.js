import { ESTADO_STOCK } from './config.js';
import { escaparHtml, formatearMoneda } from './utils.js';
import { estadoStock, porcentajeDescuento, textoGarantia } from './producto.js';

/**
 * Vista del catalogo: funciones puras que reciben datos y devuelven cadenas
 * de HTML. No tocan el DOM; por eso se pueden probar sin navegador.
 */

const TEXTO_ESTADO = Object.freeze({
  [ESTADO_STOCK.DISPONIBLE]: 'Disponible',
  [ESTADO_STOCK.BAJO]: 'Últimas unidades',
  [ESTADO_STOCK.AGOTADO]: 'Agotado'
});

const INICIAL_CATEGORIA = Object.freeze({
  laptops: 'L',
  escritorio: 'PC',
  teclados: 'T',
  mouse: 'M',
  auriculares: 'A'
});

/**
 * Etiqueta de disponibilidad con la clase de color que le corresponde.
 */
export function insigniaStock(producto) {
  const estado = estadoStock(producto.stock);
  return `<span class="etiqueta etiqueta--${estado}">${TEXTO_ESTADO[estado]}</span>`;
}

/**
 * Marcador visual mientras el negocio no tenga fotos propias de cada equipo.
 * Se reemplaza por una imagen real en cuanto el producto declare 'imagen'.
 */
export function marcoImagen(producto) {
  const nombre = escaparHtml(producto.nombre);
  if (producto.imagen) {
    return `<img class="tarjeta__imagen" src="${escaparHtml(producto.imagen)}"
      alt="${nombre}" loading="lazy" width="400" height="300">`;
  }
  const inicial = escaparHtml(INICIAL_CATEGORIA[producto.categoria] ?? '?');
  return `<div class="tarjeta__imagen tarjeta__imagen--vacia" role="img"
    aria-label="Sin fotografía de ${nombre}"><span>${inicial}</span></div>`;
}

/**
 * Precio actual y, si aplica, precio tachado con el porcentaje de rebaja.
 */
export function bloquePrecio(producto) {
  const descuento = porcentajeDescuento(producto);
  const actual = `<span class="precio__actual">${formatearMoneda(producto.precio)}</span>`;
  if (descuento === 0) {
    return `<p class="precio">${actual}</p>`;
  }
  return `<p class="precio">${actual}
    <s class="precio__anterior">${formatearMoneda(producto.precioAnterior)}</s>
    <span class="precio__descuento">-${descuento}%</span></p>`;
}

/**
 * Ficha tecnica como lista de definiciones. Cadena vacia si no hay datos.
 */
export function listaEspecificaciones(producto) {
  const entradas = Object.entries(producto.especificaciones ?? {});
  if (entradas.length === 0) {
    return '';
  }
  const filas = entradas
    .map(
      ([clave, valor]) =>
        `<div class="ficha__fila"><dt>${escaparHtml(clave)}</dt>
          <dd>${escaparHtml(valor)}</dd></div>`
    )
    .join('');
  return `<dl class="ficha">${filas}</dl>`;
}

/**
 * Boton de agregar a la cotizacion. Se deshabilita si no hay existencias.
 */
export function botonAgregar(producto) {
  const agotado = producto.stock <= 0;
  const atributos = agotado ? 'disabled aria-disabled="true"' : '';
  const texto = agotado ? 'Sin existencias' : 'Agregar a mi lista';
  return `<button class="boton boton--primario" type="button"
    data-accion="agregar" data-id="${escaparHtml(producto.id)}"
    aria-label="${escaparHtml(texto)}: ${escaparHtml(producto.nombre)}"
    ${atributos}>${texto}</button>`;
}

/**
 * Tarjeta completa de un producto.
 */
export function tarjetaProducto(producto) {
  return `<article class="tarjeta" data-id="${escaparHtml(producto.id)}">
    ${marcoImagen(producto)}
    <div class="tarjeta__cuerpo">
      <p class="tarjeta__marca">${escaparHtml(producto.marca)}</p>
      <h3 class="tarjeta__titulo">${escaparHtml(producto.nombre)}</h3>
      ${insigniaStock(producto)}
      ${bloquePrecio(producto)}
      <p class="tarjeta__descripcion">${escaparHtml(producto.descripcion ?? '')}</p>
      ${listaEspecificaciones(producto)}
      <p class="tarjeta__garantia">${escaparHtml(textoGarantia(producto))}</p>
      ${botonAgregar(producto)}
    </div>
  </article>`;
}

/**
 * Aviso que sustituye a la rejilla cuando ninguna busqueda da resultados.
 */
export function mensajeSinResultados(termino) {
  const consulta = String(termino ?? '').trim();
  const detalle =
    consulta === ''
      ? 'No hay productos en esta categoría por ahora.'
      : `No encontramos nada para "${escaparHtml(consulta)}".`;
  return `<p class="aviso-vacio">${detalle} Escribinos por WhatsApp y
    lo conseguimos para vos.</p>`;
}

/**
 * Rejilla de tarjetas. Si la lista viene vacia devuelve el aviso.
 */
export function rejillaProductos(productos, termino = '') {
  if (productos.length === 0) {
    return mensajeSinResultados(termino);
  }
  return productos.map(tarjetaProducto).join('');
}

/**
 * Texto que informa cuantos productos se estan mostrando.
 */
export function textoContador(cantidad) {
  if (cantidad === 1) {
    return '1 producto';
  }
  return `${cantidad} productos`;
}
