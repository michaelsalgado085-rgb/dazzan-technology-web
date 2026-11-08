import { CONFIG } from './config.js';
import {
  buscarProductos,
  filtrarPorCategoria,
  ordenarProductos
} from './catalogo.js';
import { agregarLinea, enlaceWhatsApp, quitarLinea } from './cotizacion.js';
import { rejillaProductos, textoContador } from './vista-producto.js';
import { panelCotizacion, unidadesTotales } from './vista-cotizacion.js';

/**
 * Punto de entrada. Unico archivo que toca el DOM: toda la logica vive en
 * los modulos puros y aqui solo se conectan eventos y se pinta el resultado.
 */

const RUTA_CATALOGO = 'data/productos.json';

const estado = {
  productos: [],
  lineas: [],
  categoria: 'todos',
  termino: '',
  orden: 'precio-asc'
};

const elementos = {};

function capturarElementos() {
  elementos.rejilla = document.querySelector('#rejilla');
  elementos.buscador = document.querySelector('#buscador');
  elementos.filtros = document.querySelector('#filtros');
  elementos.orden = document.querySelector('#orden');
  elementos.contador = document.querySelector('#contador');
  elementos.panel = document.querySelector('#panel-cotizacion');
  elementos.insignia = document.querySelector('#insignia-lista');
  elementos.whatsapp = document.querySelector('#enviar-whatsapp');
}

/**
 * Aplica los tres filtros en cadena sobre el catalogo completo.
 */
function productosVisibles() {
  const porCategoria = filtrarPorCategoria(estado.productos, estado.categoria);
  const porTermino = buscarProductos(porCategoria, estado.termino);
  return ordenarProductos(porTermino, estado.orden);
}

function pintarCatalogo() {
  const visibles = productosVisibles();
  elementos.rejilla.innerHTML = rejillaProductos(visibles, estado.termino);
  elementos.contador.textContent = textoContador(visibles.length);
}

function pintarCotizacion() {
  const unidades = unidadesTotales(estado.lineas);
  elementos.panel.innerHTML = panelCotizacion(estado.lineas);
  elementos.insignia.textContent = String(unidades);
  elementos.insignia.hidden = unidades === 0;
  elementos.whatsapp.href = enlaceWhatsApp(estado.lineas);
  elementos.whatsapp.hidden = estado.lineas.length === 0;
}

function manejarClicCatalogo(evento) {
  const boton = evento.target.closest('[data-accion="agregar"]');
  if (!boton) {
    return;
  }
  const producto = estado.productos.find((item) => item.id === boton.dataset.id);
  if (!producto) {
    return;
  }
  estado.lineas = agregarLinea(estado.lineas, producto);
  pintarCotizacion();
}

function manejarClicCotizacion(evento) {
  const boton = evento.target.closest('[data-accion="quitar"]');
  if (!boton) {
    return;
  }
  estado.lineas = quitarLinea(estado.lineas, boton.dataset.id);
  pintarCotizacion();
}

function manejarFiltro(evento) {
  const boton = evento.target.closest('[data-categoria]');
  if (!boton) {
    return;
  }
  estado.categoria = boton.dataset.categoria;
  elementos.filtros
    .querySelectorAll('[data-categoria]')
    .forEach((otro) => otro.setAttribute('aria-pressed', String(otro === boton)));
  pintarCatalogo();
}

function conectarEventos() {
  elementos.rejilla.addEventListener('click', manejarClicCatalogo);
  elementos.panel.addEventListener('click', manejarClicCotizacion);
  elementos.filtros.addEventListener('click', manejarFiltro);
  elementos.buscador.addEventListener('input', (evento) => {
    estado.termino = evento.target.value;
    pintarCatalogo();
  });
  elementos.orden.addEventListener('change', (evento) => {
    estado.orden = evento.target.value;
    pintarCatalogo();
  });
}

/**
 * Construye los botones de filtro a partir de las categorias de config.js,
 * para que agregar una categoria no obligue a tocar el HTML.
 */
function construirFiltros() {
  const categorias = ['todos', ...CONFIG.CATEGORIAS];
  elementos.filtros.innerHTML = categorias
    .map(
      (categoria) =>
        `<button class="filtro" type="button" data-categoria="${categoria}"
          aria-pressed="${categoria === estado.categoria}">${categoria}</button>`
    )
    .join('');
}

async function iniciar() {
  capturarElementos();
  construirFiltros();
  conectarEventos();
  try {
    const respuesta = await fetch(RUTA_CATALOGO);
    if (!respuesta.ok) {
      throw new Error(`El catalogo respondio ${respuesta.status}`);
    }
    estado.productos = await respuesta.json();
  } catch (error) {
    elementos.rejilla.innerHTML =
      '<p class="aviso-vacio">No pudimos cargar el catalogo. Recarga la pagina o escribinos por WhatsApp.</p>';
    console.error(error);
    return;
  }
  pintarCatalogo();
  pintarCotizacion();
}

document.addEventListener('DOMContentLoaded', iniciar);
