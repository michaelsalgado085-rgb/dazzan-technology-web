import { CONFIG } from '../config.js';
import { normalizarTexto } from '../utils.js';

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
const NUMERO_Y_UNIDAD = new RegExp(`(\\d)\\s+(${UNIDADES.join('|')})\\b`, 'g');

// Minusculas, sin tildes y con el numero pegado a su unidad, para que
// "16 GB", "16 gb" y "16GB" se escriban igual en el producto y en la busqueda.
function textoComparable(texto) {
  return normalizarTexto(texto).replace(NUMERO_Y_UNIDAD, '$1$2');
}

/**
 * RN-36: las palabras que cuentan en una busqueda, sin las de relleno.
 */
export function palabrasDeBusqueda(termino = '') {
  return textoComparable(termino)
    .split(/\s+/)
    .filter((palabra) => palabra !== '' && !PALABRAS_IGNORADAS.includes(palabra));
}

function textoBuscable(producto) {
  const especificaciones = Object.entries(producto.especificaciones ?? {}).flat().join(' ');
  const { nombre, marca, categoria, condicion = '' } = producto;
  return textoComparable(`${nombre} ${marca} ${categoria} ${condicion} ${especificaciones}`);
}

/**
 * RN-36: busca en el nombre, la marca, la categoria, la condicion y todas las
 * especificaciones. Sale el producto que tenga cualquiera de las palabras, y
 * primero los que tienen mas: con "16 GB RAM i7" encabezan los que cumplen
 * las tres. Entre los que empatan se respeta el orden que ya traia la lista,
 * asi el orden elegido por el cliente sigue valiendo dentro de cada grupo.
 */
export function buscarProductos(productos, termino) {
  const palabras = palabrasDeBusqueda(termino);
  if (palabras.length === 0) {
    return [...productos];
  }
  return productos
    .map((producto) => {
      const texto = textoBuscable(producto);
      return { producto, aciertos: palabras.filter((palabra) => texto.includes(palabra)).length };
    })
    .filter(({ aciertos }) => aciertos > 0)
    .sort((a, b) => b.aciertos - a.aciertos)
    .map(({ producto }) => producto);
}

const COMPARADORES = Object.freeze({
  'precio-asc': (a, b) => a.precio - b.precio,
  'precio-desc': (a, b) => b.precio - a.precio,
  'nombre-asc': (a, b) => a.nombre.localeCompare(b.nombre),
  'nombre-desc': (a, b) => b.nombre.localeCompare(a.nombre)
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
