/**
 * Revelado al desplazar. Pertenece a la capa de aplicacion junto con main.js:
 * toca el DOM a proposito. La logica y la vista siguen sin hacerlo.
 *
 * Los elementos con el atributo data-revelar arrancan ocultos y entran cuando
 * asoman en la pantalla. El escalonado dentro de una misma rejilla se controla
 * con la variable --i, que se asigna aqui para no escribirla a mano en el HTML.
 */

const MARGEN_ANTICIPACION = '0px 0px -12% 0px';
const PROPORCION_VISIBLE = 0.1;
const RETRASO_MAXIMO = 6;

/**
 * Marca un elemento como revelado y deja de observarlo: la animacion de
 * entrada ocurre una sola vez, no cada vez que se pasa por encima.
 */
function revelar(entrada, observador) {
  if (!entrada.isIntersecting) {
    return;
  }
  entrada.target.classList.add('revelado');
  observador.unobserve(entrada.target);
}

/**
 * Asigna el indice de escalonado. Se corta en RETRASO_MAXIMO para que la
 * ultima tarjeta de una rejilla larga no espere un segundo entero.
 */
export function escalonar(elementos) {
  elementos.forEach((elemento, indice) => {
    elemento.style.setProperty('--i', String(Math.min(indice, RETRASO_MAXIMO)));
  });
}

/**
 * Observa los elementos indicados dentro de una raiz.
 * Si el navegador no trae IntersectionObserver, se revelan todos de una vez:
 * sin animacion, pero visibles. Nunca se queda contenido oculto.
 */
export function observarRevelado(raiz = document) {
  const elementos = [...raiz.querySelectorAll('[data-revelar]:not(.revelado)')];
  if (elementos.length === 0) {
    return null;
  }
  escalonar(elementos);

  if (typeof IntersectionObserver === 'undefined') {
    elementos.forEach((elemento) => elemento.classList.add('revelado'));
    return null;
  }

  const observador = new IntersectionObserver(
    (entradas) => entradas.forEach((entrada) => revelar(entrada, observador)),
    { rootMargin: MARGEN_ANTICIPACION, threshold: PROPORCION_VISIBLE }
  );
  elementos.forEach((elemento) => observador.observe(elemento));
  return observador;
}
