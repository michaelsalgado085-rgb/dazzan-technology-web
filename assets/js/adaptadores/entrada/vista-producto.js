import { ESTADO_STOCK } from '../../config.js';
import { escaparHtml, formatearMoneda } from '../../utils.js';
import { estadoStock, porcentajeDescuento, textoGarantia } from '../../dominio/producto.js';
import { portada } from '../../dominio/fotos.js';

/**
 * Vista del catalogo: funciones puras que reciben datos y devuelven cadenas
 * de HTML. No tocan el DOM; por eso se pueden probar sin navegador.
 */

const TEXTO_ESTADO = Object.freeze({
  [ESTADO_STOCK.DISPONIBLE]: 'Disponible',
  [ESTADO_STOCK.BAJO]: 'Últimas unidades',
  [ESTADO_STOCK.AGOTADO]: 'Agotado'
});

export const INICIAL_CATEGORIA = Object.freeze({
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
 * La portada del producto (RN-33). Tocarla abre el carrusel con todas sus
 * fotos. Sin fotos, un marcador con la inicial de la categoria.
 */
export function marcoImagen(producto) {
  const nombre = escaparHtml(producto.nombre);
  const fotos = producto.fotos ?? [];
  if (fotos.length > 0) {
    const contador = fotos.length > 1
      ? `<span class="tarjeta__contador" aria-hidden="true">${fotos.length} fotos</span>`
      : '';
    return `<button class="tarjeta__foto" type="button" data-accion="ver-fotos"
      data-id="${escaparHtml(producto.id)}" aria-label="Ver las fotos de ${nombre}">
      <img class="tarjeta__imagen" src="${escaparHtml(portada(fotos))}" alt="${nombre}"
        loading="lazy" width="400" height="400">${contador}
    </button>`;
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
      <p class="tarjeta__garantia">${escaparHtml(textoGarantia())}</p>
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
