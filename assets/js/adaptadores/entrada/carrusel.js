import { escaparHtml } from '../../utils.js';

/**
 * Carrusel de fotos de la tienda (RF-33). Se desliza con el dedo gracias al
 * scroll-snap del CSS; las flechas y el teclado son para computadora.
 */

export function diapositivas(fotos, nombre) {
  return fotos
    .map(
      (foto, indice) => `<img class="carrusel__foto" src="${escaparHtml(foto)}"
        alt="${escaparHtml(nombre)}, foto ${indice + 1} de ${fotos.length}" loading="lazy">`
    )
    .join('');
}

function partes(dialogo) {
  const buscar = (selector) => dialogo.querySelector(selector);
  return {
    pista: buscar('.carrusel__pista'),
    titulo: buscar('.carrusel__titulo'),
    contador: buscar('.carrusel__contador'),
    controles: buscar('.carrusel__controles')
  };
}

function actual(pista) {
  return Math.round(pista.scrollLeft / Math.max(pista.clientWidth, 1));
}

function ir(pista, indice) {
  pista.children[indice]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
}

function conectar(dialogo, p) {
  const actualizar = () => {
    p.contador.textContent = `${actual(p.pista) + 1} / ${p.pista.children.length}`;
  };
  p.pista.addEventListener('scroll', actualizar, { passive: true });
  dialogo.addEventListener('click', (evento) => {
    const accion = evento.target.closest('[data-carrusel]')?.dataset.carrusel;
    // Tocar fuera de la foto, sobre el fondo oscuro, tambien cierra.
    if (accion === 'cerrar' || evento.target === dialogo) {
      dialogo.close();
    } else if (accion) {
      ir(p.pista, actual(p.pista) + (accion === 'siguiente' ? 1 : -1));
    }
  });
  dialogo.addEventListener('keydown', (evento) => {
    const paso = { ArrowRight: 1, ArrowLeft: -1 }[evento.key];
    if (paso) {
      ir(p.pista, actual(p.pista) + paso);
    }
  });
  return actualizar;
}

export function crearCarrusel(dialogo) {
  const p = partes(dialogo);
  const actualizar = conectar(dialogo, p);
  return {
    abrir(fotos, nombre) {
      p.titulo.textContent = nombre;
      p.pista.innerHTML = diapositivas(fotos, nombre);
      p.controles.hidden = fotos.length < 2;
      dialogo.showModal();
      p.pista.scrollLeft = 0;
      actualizar();
    }
  };
}
