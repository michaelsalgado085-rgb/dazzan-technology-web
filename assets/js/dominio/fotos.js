import { CONFIG } from '../config.js';

/**
 * Reglas de las fotos de un producto (RF-33, RN-33). Una foto es un dato
 * opaco para el dominio: puede ser la direccion de una ya guardada o una
 * recien elegida. Lo que importa es cuantas son y en que orden: la primera
 * es la portada.
 */

/**
 * Agrega las elegidas hasta llenar el maximo. Las que no caben no se pierden
 * en silencio: se cuentan para avisarle al cliente.
 */
export function agregarFotos(actuales, nuevas, maximo = CONFIG.FOTOS.MAXIMO) {
  const libres = Math.max(maximo - actuales.length, 0);
  return {
    fotos: [...actuales, ...nuevas.slice(0, libres)],
    rechazadas: Math.max(nuevas.length - libres, 0)
  };
}

/**
 * La portada es la que sale en la tarjeta de la tienda y la primera del
 * carrusel. Elegir otra es moverla al principio; las demas conservan su orden.
 */
export function ponerPortada(fotos, indice) {
  if (indice <= 0 || indice >= fotos.length) {
    return [...fotos];
  }
  return [fotos[indice], ...fotos.filter((_, posicion) => posicion !== indice)];
}

export function quitarFoto(fotos, indice) {
  return fotos.filter((_, posicion) => posicion !== indice);
}

export function portada(fotos = []) {
  return fotos[0] ?? null;
}

export function erroresDeFotos(fotos = [], maximo = CONFIG.FOTOS.MAXIMO) {
  return fotos.length > maximo ? [`Un producto lleva hasta ${maximo} fotos (RN-33).`] : [];
}

/**
 * Tamano al que se achica una foto: el lado mayor queda en el maximo y se
 * conserva la proporcion. Una foto chica no se agranda: se veria borrosa.
 */
export function dimensionesReducidas(ancho, alto, ladoMaximo = CONFIG.FOTOS.LADO_MAXIMO) {
  const escala = Math.min(1, ladoMaximo / Math.max(ancho, alto));
  return { ancho: Math.round(ancho * escala), alto: Math.round(alto * escala) };
}
