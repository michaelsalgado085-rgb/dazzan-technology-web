import { verInventario } from '../../casos-de-uso/gestionar-inventario.js';
import { emitirFactura } from '../../casos-de-uso/emitir-factura.js';
import {
  agregarALaFactura,
  cambiarLinea,
  productosFacturables,
  quitarDeLaFactura
} from '../../dominio/armar-factura.js';
import { erroresDeFactura, totalesFactura } from '../../dominio/factura.js';
import { formatearMoneda } from '../../utils.js';
import { aNumero } from './formulario-producto.js';
import { elementosDelPanel } from './arranque-panel.js';
import { crearPagosFactura } from './pagos-factura.js';
import {
  importeVisible,
  lineasFactura,
  mensajeDeError,
  resultadosFactura,
  resumenTotales,
  textoEmitida
} from './vista-factura.js';

/**
 * Pantalla para emitir una factura (RF-24, RF-25, RF-27): buscar productos,
 * cliente, descuentos y pagos. Las reglas las decide el dominio y la base
 * guarda todo junto; esta pantalla solo lee lo escrito y lo muestra.
 */

const estado = { inventario: [], lineas: [] };
let el = {};
let pagos;

// Vacio es cero: el descuento es opcional. Escrito, tiene que ser numero.
function montoOpcional(texto) {
  return texto.trim() === '' ? 0 : aNumero(texto);
}

function totales() {
  return totalesFactura({ lineas: estado.lineas, descuentoAdicional: montoOpcional(el['descuento-adicional'].value) });
}

function facturaActual() {
  const { total, descuentoAdicional } = totales();
  return {
    cliente: { nombre: el['cliente-nombre'].value, identificacion: el['cliente-identificacion'].value },
    lineas: estado.lineas,
    descuentoAdicional,
    pagos: pagos.pagos(total)
  };
}

function mostrar(elemento, texto) {
  elemento.textContent = texto;
  elemento.hidden = texto === '';
}

function pintarTotales() {
  const calculados = totales();
  el['totales-factura'].innerHTML = resumenTotales(calculados);
  for (const linea of estado.lineas) {
    const importe = el['lineas-factura'].querySelector(`[data-importe="${CSS.escape(linea.productoId)}"]`);
    if (importe) {
      importe.textContent = importeVisible(linea);
    }
  }
  pagos.pintar(calculados.total);
}

function pintarLineas() {
  el['lineas-factura'].innerHTML = lineasFactura(estado.lineas);
  pintarTotales();
}

function pintarResultados() {
  const termino = el['buscar-producto'].value;
  const encontrados = termino.trim() === '' ? [] : productosFacturables(estado.inventario, termino);
  el['resultados-factura'].innerHTML = resultadosFactura(encontrados);
  mostrar(el['sin-resultados'], termino.trim() !== '' && encontrados.length === 0 ? 'No hay productos disponibles con eso.' : '');
}

function agregar(producto) {
  const { lineas, aviso } = agregarALaFactura(estado.lineas, producto);
  estado.lineas = lineas;
  mostrar(el['aviso-lineas'], aviso);
  el['buscar-producto'].value = '';
  pintarResultados();
  pintarLineas();
}

function elegirResultado(evento) {
  const boton = evento.target.closest('[data-id]');
  const producto = boton && estado.inventario.find((item) => String(item.id) === boton.dataset.id);
  if (producto) {
    agregar(producto);
  }
}

function editarLinea(evento) {
  const { id, campo } = evento.target.dataset;
  if (!campo) {
    return;
  }
  const texto = evento.target.value;
  const valor = { cantidad: aNumero(texto), descuento: montoOpcional(texto), numeroSerie: texto }[campo];
  estado.lineas = cambiarLinea(estado.lineas, id, { [campo]: valor });
  pintarTotales();
}

function quitarLinea(evento) {
  const boton = evento.target.closest('[data-quitar]');
  if (boton) {
    estado.lineas = quitarDeLaFactura(estado.lineas, boton.dataset.quitar);
    mostrar(el['aviso-lineas'], '');
    pintarLineas();
  }
}

// Emitir gasta un numero y descuenta existencias: se confirma antes.
function pedirConfirmacion(evento) {
  evento.preventDefault();
  const errores = erroresDeFactura(facturaActual());
  mostrar(el['errores-factura'], errores.join(' '));
  if (errores.length === 0) {
    const { total } = totales();
    el['texto-confirmar-factura'].textContent =
      `¿Emitir la factura a nombre de ${el['cliente-nombre'].value.trim()} por ${formatearMoneda(total)}? Descuenta las existencias y no se puede deshacer, solo anular.`;
    el['confirmar-factura'].hidden = false;
  }
}

async function emitir(obtenerServicios) {
  el['confirmar-factura'].hidden = true;
  el['emitir-factura'].disabled = true;
  el['emitir-factura'].textContent = 'Emitiendo…';
  try {
    const servicios = await obtenerServicios();
    const resultado = await emitirFactura(facturaActual(), servicios.facturas);
    if (!resultado.emitida) {
      mostrar(el['errores-factura'], resultado.errores.join(' '));
      return;
    }
    el['texto-emitida'].textContent = textoEmitida(resultado.factura);
    el['formulario-factura'].hidden = true;
    el['factura-emitida'].hidden = false;
    estado.inventario = await verInventario(servicios.repositorio);
  } catch (error) {
    mostrar(el['errores-factura'], mensajeDeError(error));
  } finally {
    el['emitir-factura'].disabled = false;
    el['emitir-factura'].textContent = 'Emitir factura';
  }
}

function nuevaFactura() {
  estado.lineas = [];
  el['formulario-factura'].reset();
  pagos.limpiar();
  mostrar(el['errores-factura'], '');
  mostrar(el['aviso-lineas'], '');
  el['factura-emitida'].hidden = true;
  el['formulario-factura'].hidden = false;
  pintarLineas();
  el['buscar-producto'].focus();
}

function conectar(obtenerServicios) {
  el['buscar-producto'].addEventListener('input', pintarResultados);
  el['resultados-factura'].addEventListener('click', elegirResultado);
  el['lineas-factura'].addEventListener('input', editarLinea);
  el['lineas-factura'].addEventListener('click', quitarLinea);
  el['descuento-adicional'].addEventListener('input', pintarTotales);
  el['pagos-factura'].addEventListener('input', pintarTotales);
  el['pagos-factura'].addEventListener('change', pintarTotales);
  // Lo que se avisa al intentar emitir se va al corregir.
  el['formulario-factura'].addEventListener('input', () => mostrar(el['errores-factura'], ''));
  el['formulario-factura'].addEventListener('submit', pedirConfirmacion);
  el['no-emitir'].addEventListener('click', () => {
    el['confirmar-factura'].hidden = true;
  });
  el['si-emitir'].addEventListener('click', () => emitir(obtenerServicios));
  el['nueva-factura'].addEventListener('click', nuevaFactura);
}

/**
 * RF-24: desde el inventario se puede abrir la factura con un producto ya
 * cargado (?producto=id).
 */
function cargarDesdeEnlace() {
  const id = new URLSearchParams(window.location.search).get('producto');
  const producto = productosFacturables(estado.inventario).find((item) => String(item.id) === id);
  if (producto) {
    agregar(producto);
  }
}

export async function iniciarFactura(obtenerServicios) {
  el = elementosDelPanel();
  pagos = crearPagosFactura(el['pagos-factura'], el['saldo-pago']);
  conectar(obtenerServicios);
  const { repositorio } = await obtenerServicios();
  estado.inventario = await verInventario(repositorio);
  pintarLineas();
  cargarDesdeEnlace();
}
