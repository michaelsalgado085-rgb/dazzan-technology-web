import { redondearDosDecimales } from '../utils.js';

/**
 * Agrega un producto a la lista de cotizacion respetando el stock disponible.
 * Devuelve una lista nueva; no modifica la recibida.
 */
export function agregarLinea(lineas, producto, cantidad = 1) {
  if (producto.stock <= 0) {
    return [...lineas];
  }
  const existente = lineas.find((linea) => linea.id === producto.id);
  if (!existente) {
    return [
      ...lineas,
      {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: Math.min(cantidad, producto.stock)
      }
    ];
  }
  return lineas.map((linea) =>
    linea.id === producto.id
      ? { ...linea, cantidad: Math.min(linea.cantidad + cantidad, producto.stock) }
      : linea
  );
}

/**
 * Quita un producto de la lista de cotizacion.
 */
export function quitarLinea(lineas, id) {
  return lineas.filter((linea) => linea.id !== id);
}

/**
 * Importe de una linea: precio por cantidad. Es la unica formula del importe,
 * para que el total, el mensaje y la vista no puedan calcularlo distinto.
 */
export function importeLinea(linea) {
  return linea.precio * linea.cantidad;
}

/**
 * Total estimado de la lista.
 *
 * RN-08: los precios ya incluyen el ISV, asi que el total es la suma de los
 * importes y nada mas. No se calcula ni se desglosa impuesto.
 */
export function calcularTotal(lineas) {
  return redondearDosDecimales(
    lineas.reduce((suma, linea) => suma + importeLinea(linea), 0)
  );
}
