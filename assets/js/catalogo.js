import { normalizarTexto } from './utils.js';

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
 * Filtra productos dentro de un rango de precio inclusivo.
 */
export function filtrarPorPrecio(productos, minimo, maximo) {
  return productos.filter(
    (producto) => producto.precio >= minimo && producto.precio <= maximo
  );
}

/**
 * Busca productos cuyo nombre o marca contenga el termino indicado.
 */
export function buscarProductos(productos, termino) {
  const consulta = normalizarTexto(termino).trim();
  if (consulta === '') {
    return [...productos];
  }
  return productos.filter((producto) => {
    const campos = normalizarTexto(`${producto.nombre} ${producto.marca}`);
    return campos.includes(consulta);
  });
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
