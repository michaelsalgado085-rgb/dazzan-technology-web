import { buscarProductos } from '../../dominio/catalogo.js';
import { condicionSugerida, resumenInventario } from '../../dominio/inventario.js';
import {
  eliminarProducto,
  guardarProducto,
  verInventario
} from '../../casos-de-uso/gestionar-inventario.js';
import { leerFormulario, llenarFormulario } from './formulario-producto.js';
import { crearEditorFotos } from './editor-fotos.js';
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

function capturar() {
  for (const id of [
    'vista-lista', 'resumen-inventario', 'buscar-inventario', 'agregar-producto', 'aviso-inventario', 'lista-inventario',
    'formulario-producto', 'titulo-formulario', 'errores-producto', 'aviso-duplicado',
    'texto-duplicado', 'abrir-duplicado', 'cancelar-producto', 'zona-eliminar',
    'eliminar-producto', 'confirmar-eliminar', 'texto-confirmar', 'si-eliminar', 'no-eliminar',
    'lista-fotos', 'entrada-fotos', 'aviso-fotos'
  ]) {
    el[id] = document.getElementById(id);
  }
}

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
  estado.editando = producto;
  el['zona-eliminar'].hidden = !producto;
  el['confirmar-eliminar'].hidden = true;
  formulario.reset();
  llenarFormulario(formulario, producto ?? { stock: 1 });
  editorFotos.cargar(producto?.fotos ?? []);
  el['titulo-formulario'].textContent = producto ? 'Editar producto' : 'Agregar producto';
  mostrarErrores([]);
  mostrarDuplicado(null);
  el['vista-lista'].hidden = true;
  formulario.hidden = false;
  formulario.elements.namedItem(producto ? 'stock' : 'categoria').focus();
}

function cerrarFormulario() {
  el['formulario-producto'].hidden = true;
  el['vista-lista'].hidden = false;
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

function pedirConfirmacion() {
  el['texto-confirmar'].textContent =
    `¿Eliminar "${estado.editando.nombre}"? Solo se puede si nunca se vendió, y no se puede deshacer.`;
  el['confirmar-eliminar'].hidden = false;
}

async function eliminar(obtenerServicios) {
  el['confirmar-eliminar'].hidden = true;
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

function sugerirCondicion(evento) {
  // Solo al agregar: al editar se respeta lo que ya tenia el producto.
  if (!el['formulario-producto'].elements.namedItem('id').value) {
    el['formulario-producto'].elements.namedItem('condicion').value = condicionSugerida(evento.target.value);
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
  formulario.elements.namedItem('categoria').addEventListener('change', sugerirCondicion);
  formulario.addEventListener('submit', (evento) => guardar(evento, obtenerServicios));
  el['buscar-inventario'].addEventListener('input', (evento) => {
    estado.termino = evento.target.value;
    pintarLista();
  });
  el['agregar-producto'].addEventListener('click', () => abrirFormulario());
  el['cancelar-producto'].addEventListener('click', cerrarFormulario);
  el['abrir-duplicado'].addEventListener('click', () => abrirFormulario(estado.duplicado));
  el['lista-inventario'].addEventListener('click', abrirDesdeLista);
  el['eliminar-producto'].addEventListener('click', pedirConfirmacion);
  el['no-eliminar'].addEventListener('click', () => {
    el['confirmar-eliminar'].hidden = true;
  });
  el['si-eliminar'].addEventListener('click', () => eliminar(obtenerServicios));
}

export async function iniciarInventario(obtenerServicios) {
  capturar();
  editorFotos = crearEditorFotos({
    lista: el['lista-fotos'],
    entrada: el['entrada-fotos'],
    aviso: el['aviso-fotos']
  });
  conectar(obtenerServicios);
  await recargar(obtenerServicios);
}
