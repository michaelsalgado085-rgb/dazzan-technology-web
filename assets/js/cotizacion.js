import { CONDICION, CONFIG } from './config.js';
import { calcularISV, formatearMoneda, redondearDosDecimales } from './utils.js';

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
        // La condicion viaja con la linea porque de ella depende el ISV.
        // Sin este dato, calcularTotales no puede aplicar RN-08.
        condicion: producto.condicion,
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
 * RN-08: el ISV solo grava el producto nuevo. El equipo usado no lo paga.
 *
 * Una linea sin condicion declarada no se grava. Es el lado seguro del error:
 * cobrar un impuesto que no corresponde le crea un problema al comprador y
 * nadie lo reclama hasta que ya es tarde.
 */
export function esGravable(linea) {
  return linea.condicion === CONDICION.NUEVO;
}

/**
 * Suma el importe de un conjunto de lineas.
 */
function sumarImportes(lineas) {
  return redondearDosDecimales(
    lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0)
  );
}

/**
 * Subtotal, ISV y total de una lista de lineas.
 *
 * Vive aqui y no en utils.js porque decidir que se grava es regla de negocio,
 * no una utilidad generica: si manana cambia que productos pagan impuesto, el
 * unico archivo que tiene que cambiar es este.
 */
export function calcularTotales(lineas) {
  const subtotal = sumarImportes(lineas);
  const baseGravada = sumarImportes(lineas.filter(esGravable));
  const isv = calcularISV(baseGravada);
  return { subtotal, isv, total: redondearDosDecimales(subtotal + isv) };
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
  const { total } = calcularTotales(lineas);
  return `Hola, me interesan estos productos:\n${detalle}\n\nTotal estimado: ${formatearMoneda(
    total
  )}`;
}

/**
 * Enlace de WhatsApp con el mensaje de la cotizacion ya codificado.
 */
export function enlaceWhatsApp(lineas) {
  const mensaje = construirMensaje(lineas);
  return `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}
