import { CONFIG } from './config.js';
import { formatearMoneda, redondearDosDecimales } from './utils.js';

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
 * Total estimado de la lista.
 *
 * RN-08: los precios ya incluyen el ISV, asi que el total es la suma de los
 * importes y nada mas. No se calcula ni se desglosa impuesto.
 */
export function calcularTotal(lineas) {
  return redondearDosDecimales(
    lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0)
  );
}

/**
 * Construye el texto del mensaje de WhatsApp a partir de la cotizacion.
 */
export function construirMensaje(lineas) {
  if (lineas.length === 0) {
    return '';
  }
  const detalle = lineas
    .map(
      (linea) =>
        `- ${linea.nombre} x${linea.cantidad}: ${formatearMoneda(
          linea.precio * linea.cantidad
        )}`
    )
    .join('\n');
  const total = formatearMoneda(calcularTotal(lineas));
  return `Hola, me interesan estos productos:\n${detalle}\n\nTotal estimado: ${total}`;
}

/**
 * Enlace de WhatsApp con el mensaje de la cotizacion ya codificado.
 */
export function enlaceWhatsApp(lineas) {
  const mensaje = construirMensaje(lineas);
  return `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}
