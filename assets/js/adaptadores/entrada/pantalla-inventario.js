import { buscarProductos } from '../../dominio/catalogo.js';
import { condicionSugerida, resumenInventario } from '../../dominio/inventario.js';
import { guardarProducto, verInventario } from '../../casos-de-uso/gestionar-inventario.js';
import { leerFormulario, llenarFormulario } from './formulario-producto.js';
import {
  listaInventario,
  mensajeDuplicado,
  opcionesCategoria,
  tarjetasResumen
} from './vista-inventario.js';

/**
 * Pantalla del inventario: conecta eventos y pinta. Las reglas viven en el
 * dominio y los datos llegan por el repositorio que entrega `obtenerRepositorio`,
 * que se pide de nuevo en cada operacion para usar siempre una sesion vigente.
 */

const SIN_CONEXION = 'No se pudo conectar. Revisa tu internet e intenta de nuevo.';

const estado = { inventario: [], termino: '', duplicado: null };
const el = {};

function capturar() {
  for (const id of [
    'vista-lista', 'resumen-inventario', 'buscar-inventario', 'agregar-producto', 'aviso-inventario', 'lista-inventario',
    'formulario-producto', 'titulo-formulario', 'errores-producto', 'aviso-duplicado',
    'texto-duplicado', 'abrir-duplicado', 'cancelar-producto'
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
  formulario.reset();
  llenarFormulario(formulario, producto ?? { stock: 1 });
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

async function recargar(obtenerRepositorio) {
  try {
    estado.inventario = await verInventario(await obtenerRepositorio());
    pintarLista();
  } catch {
    avisar(SIN_CONEXION);
  }
}

async function guardar(evento, obtenerRepositorio) {
  evento.preventDefault();
  const { producto, textoEspecificaciones } = leerFormulario(el['formulario-producto']);
  try {
    const resultado = await guardarProducto(producto, {
      repositorio: await obtenerRepositorio(),
      inventario: estado.inventario,
      textoEspecificaciones
    });
    mostrarErrores(resultado.errores ?? []);
    mostrarDuplicado(resultado.duplicado ?? null);
    if (resultado.guardado) {
      cerrarFormulario();
      avisar(`Guardado: ${resultado.producto.nombre}.`);
      await recargar(obtenerRepositorio);
    }
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

function conectar(obtenerRepositorio) {
  const formulario = el['formulario-producto'];
  formulario.elements.namedItem('categoria').innerHTML = opcionesCategoria();
  formulario.elements.namedItem('categoria').addEventListener('change', sugerirCondicion);
  formulario.addEventListener('submit', (evento) => guardar(evento, obtenerRepositorio));
  el['buscar-inventario'].addEventListener('input', (evento) => {
    estado.termino = evento.target.value;
    pintarLista();
  });
  el['agregar-producto'].addEventListener('click', () => abrirFormulario());
  el['cancelar-producto'].addEventListener('click', cerrarFormulario);
  el['abrir-duplicado'].addEventListener('click', () => abrirFormulario(estado.duplicado));
  el['lista-inventario'].addEventListener('click', abrirDesdeLista);
}

export async function iniciarInventario(obtenerRepositorio) {
  capturar();
  conectar(obtenerRepositorio);
  await recargar(obtenerRepositorio);
}
