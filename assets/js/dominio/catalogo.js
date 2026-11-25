import { CONFIG } from '../config.js';
import { normalizarTexto } from '../utils.js';
import { porcentajeDescuento } from './producto.js';

/**
 * Filtra productos por categoria. La categoria 'todos' no filtra.
 */
export function filtrarPorCategoria(productos, categoria) {
  if (!categoria || categoria === 'todos') {
    return [...productos];
  }
  return productos.filter((producto) => producto.categoria === categoria);
}

/**
 * Deja solo los productos que se pueden vender ahora.
 * RF-27: lo agotado no se ofrece al publico. El producto no se borra
 * (ADR-002): sigue existiendo para el panel y para las facturas emitidas.
 */
export function soloConExistencias(productos) {
  return productos.filter((producto) => producto.stock > 0);
}

/**
 * Filtra productos dentro de un rango de precio inclusivo.
 */
export function filtrarPorPrecio(productos, minimo, maximo) {
  return productos.filter(
    (producto) => producto.precio >= minimo && producto.precio <= maximo
  );
}

const { PALABRAS_IGNORADAS, UNIDADES } = CONFIG.BUSQUEDA;
const NUMERO_Y_UNIDAD = new RegExp(`(\\d)[\\s-]+(${UNIDADES.join('|')})\\b`, 'g');

// Minusculas, sin tildes y con el numero pegado a su unidad, para que
// "16 GB", "16-GB" y "16GB" se escriban igual en el producto y en la busqueda.
function textoComparable(texto) {
  return normalizarTexto(texto).replace(NUMERO_Y_UNIDAD, '$1$2');
}

// Se parte por todo lo que no sea letra o numero: "i7-1185G7" son las
// palabras "i7" y "1185g7", en el producto y en la busqueda por igual.
function palabras(texto) {
  return textoComparable(texto).split(/[^a-z0-9]+/).filter((palabra) => palabra !== '');
}

/**
 * RN-36: las palabras que cuentan en una busqueda, sin las de relleno.
 */
export function palabrasDeBusqueda(termino = '') {
  return palabras(termino).filter((palabra) => !PALABRAS_IGNORADAS.includes(palabra));
}

function palabrasDelProducto(producto) {
  const especificaciones = Object.entries(producto.especificaciones ?? {}).flat().join(' ');
  const { nombre, marca, categoria, condicion = '' } = producto;
  return palabras(`${nombre} ${marca} ${categoria} ${condicion} ${especificaciones}`);
}

/**
 * RN-36: busca en el nombre, la marca, la categoria, la condicion y todas las
 * especificaciones. Sale solo el producto que tiene TODAS las palabras: con
 * "Intel Core i8" no basta que diga Intel Core, tiene que decir i8, y con
 * "RAM 17 GB" tiene que tener 17gb.
 *
 * Cada palabra se compara con el comienzo de las palabras del producto: "16"
 * encuentra "16gb" y "lati" encuentra "Latitude" mientras se escribe, pero
 * "6gb" no encuentra "16gb".
 *
 * filter conserva el orden, asi que el orden elegido por el cliente se
 * mantiene en los resultados.
 */
export function buscarProductos(productos, termino) {
  const buscadas = palabrasDeBusqueda(termino);
  if (buscadas.length === 0) {
    return [...productos];
  }
  return productos.filter((producto) => {
    const delProducto = palabrasDelProducto(producto);
    return buscadas.every((buscada) => delProducto.some((palabra) => palabra.startsWith(buscada)));
  });
}

// Un producto sin fecha de alta (el catalogo de respaldo en JSON) cuenta
// como el mas antiguo.
function fechaDeAlta(producto) {
  return Date.parse(producto.creadoEn ?? '') || 0;
}

/**
 * RN-37: los ordenes que ofrece la tienda. Por nombre no se ofrece: nadie
 * busca una laptop por la letra con que empieza.
 */
const COMPARADORES = Object.freeze({
  recientes: (a, b) => fechaDeAlta(b) - fechaDeAlta(a),
  'precio-asc': (a, b) => a.precio - b.precio,
  'precio-desc': (a, b) => b.precio - a.precio,
  descuento: (a, b) => porcentajeDescuento(b) - porcentajeDescuento(a)
});

/**
 * Ordena productos segun un criterio conocido. Un criterio desconocido
 * devuelve la lista sin alterar el orden original.
 */
export function ordenarProductos(productos, criterio) {
  const comparador = COMPARADORES[criterio];
  if (!comparador) {
    return [...productos];
  }
  return [...productos].sort(comparador);
}
