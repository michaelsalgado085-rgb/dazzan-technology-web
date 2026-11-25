import { CONFIG } from '../../config.js';
import { buscarProductos } from '../../dominio/catalogo.js';
import { resumenInventario } from '../../dominio/inventario.js';
import {
  eliminarProducto,
  guardarProducto,
  verInventario
} from '../../casos-de-uso/gestionar-inventario.js';
import {
  leerFormulario,
  llenarFormulario,
  sugerirCondicionAlElegirCategoria
} from './formulario-producto.js';
import { crearEditorFotos } from './editor-fotos.js';
import { crearBorradorFormulario } from './borrador-formulario.js';
import { conectarConfirmaciones } from './confirmaciones-formulario.js';
import { crearVistaPrevia } from './vista-previa.js';
import { elementosDelPanel } from './arranque-panel.js';
import {
  listaInventario,
  mensajeDuplicado,
  opcionesCategoria,
  tarjetasResumen
} from './vista-inventario.js';

/**
 * Pantalla del inventario: conecta eventos y pinta. Las reglas viven en el
 * dominio. `obtenerServicios` entrega el repositorio y el almacen de fotos, y
 * se pide de nuevo en cada operacion para usar siempre una sesion vigente.
 */

const SIN_CONEXION = 'No se pudo conectar. Revisa tu internet e intenta de nuevo.';

const estado = { inventario: [], termino: '', duplicado: null, editando: null };
const el = {};
let editorFotos;
let borrador;
let vistaPrevia;

function avisar(texto) {
  el['aviso-inventario'].textContent = texto;
  el['aviso-inventario'].hidden = texto === '';
}

function pintarLista() {
  const visibles = buscarProductos(estado.inventario, estado.termino);
  el['lista-inventario'].innerHTML = listaInventario(visibles, estado.termino);
  el['resumen-inventario'].innerHTML = tarjetasResumen(resumenInventario(estado.inventario));
}

function mostrarErrores(errores) {
  el['errores-producto'].textContent = errores.join(' ');
  el['errores-producto'].hidden = errores.length === 0;
}

function mostrarDuplicado(producto) {
  estado.duplicado = producto;
  el['texto-duplicado'].textContent = producto ? mensajeDuplicado(producto) : '';
  el['aviso-duplicado'].hidden = !producto;
}

function abrirFormulario(producto = null) {
  const formulario = el['formulario-producto'];
  borrador.pausar();
  estado.editando = producto;
  el['zona-eliminar'].hidden = !producto;
  // RF-24: lo que tiene existencias se puede facturar desde aqui.
  el['facturar-producto'].hidden = !(producto?.stock > 0);
  el['facturar-producto'].href = producto ? `${CONFIG.RUTAS.FACTURAR}?producto=${encodeURIComponent(producto.id)}` : '';
  el['confirmar-eliminar'].hidden = true;
  el['confirmar-descartar'].hidden = true;
  el['aviso-borrador'].hidden = true;
  formulario.reset();
  llenarFormulario(formulario, producto ?? { stock: 1 });
  editorFotos.cargar(producto?.fotos ?? []);
  el['titulo-formulario'].textContent = producto ? 'Editar producto' : 'Agregar producto';
  mostrarErrores([]);
  mostrarDuplicado(null);
  el['vista-lista'].hidden = true;
  el['edicion'].hidden = false;
  formulario.elements.namedItem(producto ? 'stock' : 'categoria').focus();
  borrador.empezar();
}

function cerrarFormulario() {
  borrador.terminar();
  el['edicion'].hidden = true;
  el['vista-lista'].hidden = false;
}

async function retomarBorrador() {
  const recuperado = await borrador.recuperar(estado.inventario);
  if (recuperado) {
    abrirFormulario(recuperado.producto);
    borrador.restaurar(recuperado.borrador);
    el['aviso-borrador'].hidden = false;
  }
}

async function recargar(obtenerServicios) {
  try {
    estado.inventario = await verInventario((await obtenerServicios()).repositorio);
    pintarLista();
  } catch {
    avisar(SIN_CONEXION);
  }
}

async function guardar(evento, obtenerServicios) {
  evento.preventDefault();
  const { producto, textoEspecificaciones } = leerFormulario(el['formulario-producto']);
  const boton = evento.submitter;
  // Subir fotos tarda unos segundos: el boton lo dice y no se puede tocar dos veces.
  boton.disabled = true;
  boton.textContent = 'Guardando…';
  try {
    const servicios = await obtenerServicios();
    const resultado = await guardarProducto({ ...producto, fotos: editorFotos.fotos() }, {
      ...servicios,
      inventario: estado.inventario,
      textoEspecificaciones,
      fotosQuitadas: editorFotos.quitadas()
    });
    mostrarErrores(resultado.errores ?? []);
    mostrarDuplicado(resultado.duplicado ?? null);
    if (resultado.guardado) {
      cerrarFormulario();
      avisar(`Guardado: ${resultado.producto.nombre}.`);
      await recargar(obtenerServicios);
    }
  } catch {
    mostrarErrores([SIN_CONEXION]);
  } finally {
    boton.disabled = false;
    boton.textContent = 'Guardar';
  }
}

async function eliminar(obtenerServicios) {
  try {
    const { repositorio, almacenFotos } = await obtenerServicios();
    const resultado = await eliminarProducto(estado.editando, repositorio, almacenFotos);
    if (!resultado.eliminado) {
      mostrarErrores([resultado.motivo]);
      return;
    }
    cerrarFormulario();
    avisar(`Eliminado: ${estado.editando.nombre}.`);
    await recargar(obtenerServicios);
  } catch {
    mostrarErrores([SIN_CONEXION]);
  }
}

function abrirDesdeLista(evento) {
  const fila = evento.target.closest('[data-id]');
  const producto = fila && estado.inventario.find((item) => String(item.id) === fila.dataset.id);
  if (producto) {
    avisar('');
    abrirFormulario(producto);
  }
}

function conectar(obtenerServicios) {
  const formulario = el['formulario-producto'];
  formulario.elements.namedItem('categoria').innerHTML = opcionesCategoria();
  sugerirCondicionAlElegirCategoria(formulario);
  formulario.addEventListener('submit', (evento) => guardar(evento, obtenerServicios));
  el['buscar-inventario'].addEventListener('input', (evento) => {
    estado.termino = evento.target.value;
    pintarLista();
  });
  el['agregar-producto'].addEventListener('click', () => abrirFormulario());
  el['abrir-duplicado'].addEventListener('click', () => abrirFormulario(estado.duplicado));
  el['lista-inventario'].addEventListener('click', abrirDesdeLista);
  conectarConfirmaciones(el, {
    tieneCambios: () => borrador.tieneCambios(),
    nombreEditando: () => estado.editando.nombre,
    alDescartar: cerrarFormulario,
    alEliminar: () => eliminar(obtenerServicios)
  });
}

export async function iniciarInventario(obtenerServicios, almacenBorrador) {
  Object.assign(el, elementosDelPanel());
  editorFotos = crearEditorFotos({
    lista: el['lista-fotos'],
    entrada: el['entrada-fotos'],
    aviso: el['aviso-fotos'],
    alCambiar: () => {
      borrador?.guardar();
      vistaPrevia?.actualizar();
    }
  });
  // Primero los eventos de la pantalla: la condicion sugerida queda puesta
  // antes de que el borrador y la vista previa lean el formulario.
  conectar(obtenerServicios);
  const formulario = el['formulario-producto'];
  borrador = crearBorradorFormulario({ formulario, editorFotos, almacen: almacenBorrador });
  vistaPrevia = crearVistaPrevia({ contenedor: el['vista-previa'], formulario, editorFotos });
  await recargar(obtenerServicios);
  await retomarBorrador();
}
