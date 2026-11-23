import { CONDICION, CONFIG } from '../config.js';
import { normalizarTexto } from '../utils.js';

/**
 * Reglas del inventario que carga el cliente desde el panel (RF-23).
 * Confirmadas por Michael el 22 de noviembre de 2026.
 */

const SEPARADOR_ESPECIFICACION = ':';

/**
 * Regla 2: la condicion que se sugiere segun la categoria (RN-01).
 */
export function condicionSugerida(categoria) {
  return CONFIG.CATEGORIAS_USADAS.includes(categoria) ? CONDICION.USADO : CONDICION.NUEVO;
}

/**
 * Regla 7: una especificacion por linea, "Nombre: valor". Las lineas vacias
 * se ignoran; el valor puede llevar dos puntos ("Pantalla: 16:9").
 */
export function leerEspecificaciones(texto = '') {
  const especificaciones = {};
  for (const linea of texto.split('\n')) {
    const posicion = linea.indexOf(SEPARADOR_ESPECIFICACION);
    if (posicion > 0) {
      const nombre = linea.slice(0, posicion).trim();
      const valor = linea.slice(posicion + 1).trim();
      if (nombre && valor) {
        especificaciones[nombre] = valor;
      }
    }
  }
  return especificaciones;
}

/**
 * Lo inverso, para mostrar las especificaciones al editar un producto.
 */
export function especificacionesComoTexto(especificaciones = {}) {
  return Object.entries(especificaciones)
    .map(([nombre, valor]) => `${nombre}${SEPARADOR_ESPECIFICACION} ${valor}`)
    .join('\n');
}

function lineasSinFormato(texto = '') {
  return texto
    .split('\n')
    .map((linea) => linea.trim())
    .filter((linea) => linea !== '' && Object.keys(leerEspecificaciones(linea)).length === 0);
}

function erroresDeTexto(producto) {
  const errores = [];
  if (!producto.nombre?.trim()) {
    errores.push('Escribe el nombre del producto.');
  }
  if (!producto.marca?.trim()) {
    errores.push('Escribe la marca.');
  }
  if (!CONFIG.CATEGORIAS.includes(producto.categoria)) {
    errores.push('Elige una categoría.');
  }
  if (!Object.values(CONDICION).includes(producto.condicion)) {
    errores.push('Elige si es nuevo o usado.');
  }
  return errores;
}

function erroresDeNumeros(producto) {
  const errores = [];
  if (!Number.isFinite(producto.precio) || producto.precio < 0) {
    errores.push('El precio debe ser un número, cero o más (regla 3).');
  }
  const anterior = producto.precioAnterior;
  if (anterior !== null && anterior !== undefined && !(anterior > producto.precio)) {
    errores.push('El precio anterior debe ser mayor que el precio (regla 4).');
  }
  if (!Number.isInteger(producto.stock) || producto.stock < 0) {
    errores.push('Las existencias deben ser un número entero, cero o más (regla 5).');
  }
  return errores;
}

/**
 * Todo lo que impide guardar el producto. Lista vacia: se puede guardar.
 * `textoEspecificaciones` es lo que escribio el cliente, para avisarle de
 * una linea que no se entendio en vez de perderla en silencio.
 */
export function erroresDeProducto(producto, textoEspecificaciones = '') {
  const errores = [...erroresDeTexto(producto), ...erroresDeNumeros(producto)];
  for (const linea of lineasSinFormato(textoEspecificaciones)) {
    errores.push(`La especificación "${linea}" necesita dos puntos, por ejemplo "Memoria: 8 GB".`);
  }
  return errores;
}

/**
 * Regla 8: otro producto con el mismo nombre y marca, sin importar
 * mayusculas ni tildes. Al editar, el propio producto no cuenta.
 */
export function buscarDuplicado(producto, inventario) {
  const clave = (item) => `${normalizarTexto(item.nombre).trim()}|${normalizarTexto(item.marca).trim()}`;
  return inventario.find((item) => item.id !== producto.id && clave(item) === clave(producto)) ?? null;
}

/**
 * Regla 6: lo agotado sigue en el panel, al final de la lista.
 */
export function ordenarInventario(inventario) {
  return [...inventario].sort(
    (a, b) => Number(a.stock === 0) - Number(b.stock === 0) || a.nombre.localeCompare(b.nombre, 'es')
  );
}

/**
 * Cuantos modelos hay, cuantas unidades suman y cuantos estan agotados.
 * Se calcula sobre todo el inventario, no sobre lo que filtra el buscador.
 */
export function resumenInventario(inventario) {
  return {
    productos: inventario.length,
    unidades: inventario.reduce((suma, producto) => suma + producto.stock, 0),
    agotados: inventario.filter((producto) => producto.stock === 0).length
  };
}
