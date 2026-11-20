import { CONFIG } from '../../config.js';
import { formatearMoneda } from '../../utils.js';
import { calcularTotal, importeLinea } from '../../dominio/cotizacion.js';

/**
 * Adaptador de salida hacia WhatsApp. El dominio decide que lleva la lista y
 * cuanto suma; este archivo solo lo traduce al formato de un chat. Si el
 * negocio cambia de canal, se cambia este adaptador y el dominio no se toca.
 */

/**
 * Texto del mensaje a partir de la cotizacion.
 */
export function construirMensaje(lineas) {
  if (lineas.length === 0) {
    return '';
  }
  const detalle = lineas
    .map(
      (linea) => `- ${linea.nombre} x${linea.cantidad}: ${formatearMoneda(importeLinea(linea))}`
    )
    .join('\n');
  const total = formatearMoneda(calcularTotal(lineas));
  return `Hola, me interesan estos productos:\n${detalle}\n\nTotal estimado: ${total}`;
}

/**
 * Enlace de WhatsApp con el mensaje ya codificado.
 */
export function enlaceWhatsApp(lineas) {
  const mensaje = construirMensaje(lineas);
  return `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}
