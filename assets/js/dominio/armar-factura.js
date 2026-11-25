import { redondearDosDecimales } from '../utils.js';
import { buscarProductos, soloConExistencias } from './catalogo.js';

/**
 * Armar una factura en el panel (RF-24): elegir productos y pagos. Funciones
 * puras: reciben las lineas o los pagos y devuelven una copia nueva. Las
 * reglas de si la factura es valida siguen en factura.js.
 */

/**
 * Lo que se puede vender ahora, con la misma busqueda de la tienda (RN-36).
 * Lo agotado no se ofrece: no hay que venderlo (RN-17).
 */
export function productosFacturables(inventario, termino = '') {
  return buscarProductos(soloConExistencias(inventario), termino);
}

/**
 * Una linea nueva con lo que la factura copia del producto. El precio se
 * muestra para calcular, pero la base cobra el suyo: nunca confia en el del
 * navegador.
 */
export function lineaDesdeProducto(producto) {
  return {
    productoId: producto.id,
    descripcion: producto.nombre,
    marca: producto.marca,
    precio: producto.precio,
    cantidad: 1,
    descuento: 0,
    numeroSerie: '',
    existencias: producto.stock
  };
}

/**
 * Elegir un producto que ya esta en la factura suma una unidad en su linea,
 * sin pasar de lo que hay en existencia.
 */
export function agregarALaFactura(lineas, producto) {
  const existente = lineas.find((linea) => linea.productoId === producto.id);
  if (!existente) {
    return { lineas: [...lineas, lineaDesdeProducto(producto)], aviso: '' };
  }
  if (existente.cantidad >= existente.existencias) {
    return { lineas: [...lineas], aviso: `Solo hay ${existente.existencias} de ${existente.descripcion} en existencia.` };
  }
  return { lineas: cambiarLinea(lineas, producto.id, { cantidad: existente.cantidad + 1 }), aviso: '' };
}

export function cambiarLinea(lineas, productoId, cambios) {
  return lineas.map((linea) => (linea.productoId === productoId ? { ...linea, ...cambios } : linea));
}

export function quitarDeLaFactura(lineas, productoId) {
  return lineas.filter((linea) => linea.productoId !== productoId);
}

/**
 * Los pagos a registrar segun los metodos elegidos. Con un solo metodo, ese
 * metodo cubre todo el total y no hay que escribir el monto. Con total cero
 * no hay pagos (RN-22).
 * @param {{ metodo: string, monto: number }[]} elegidos
 * @param {number} total
 */
export function pagosDeLaFactura(elegidos, total) {
  if (total === 0) {
    return [];
  }
  if (elegidos.length === 1) {
    return [{ metodo: elegidos[0].metodo, monto: total }];
  }
  return elegidos.map(({ metodo, monto }) => ({ metodo, monto }));
}

/**
 * Cuanto falta para que los pagos cubran el total (RN-21). Negativo si se
 * paso.
 */
export function saldoPorPagar(total, pagos) {
  return redondearDosDecimales(total - pagos.reduce((suma, pago) => suma + (pago.monto || 0), 0));
}
