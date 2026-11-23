import { CONFIG } from '../../config.js';
import { agregarFotos, ponerPortada, quitarFoto } from '../../dominio/fotos.js';
import { achicarFoto } from './achicar-foto.js';
import { miniaturasFotos } from './vista-inventario.js';

/**
 * Las fotos del formulario de producto. Una foto guardada es su direccion;
 * una recien elegida es { archivo, url } hasta que se guarde el producto.
 * Las reglas (cuantas, cual es la portada) las decide el dominio.
 */

function pintar(editor, mensaje = '') {
  editor.lista.innerHTML = miniaturasFotos(editor.fotos);
  editor.aviso.textContent = mensaje;
  editor.aviso.hidden = mensaje === '';
  editor.alCambiar();
}

// Una foto nueva que vuelve de un borrador trae el archivo pero no su
// direccion para verla: se crea de nuevo.
function conDireccion(foto) {
  return typeof foto === 'string' || foto.url ? foto : { ...foto, url: URL.createObjectURL(foto.archivo) };
}

async function elegir(editor) {
  const archivos = [...editor.entrada.files];
  editor.entrada.value = '';
  pintar(editor, 'Preparando fotos…');
  try {
    const achicadas = await Promise.all(archivos.map(achicarFoto));
    const nuevas = achicadas.map((archivo) => ({ archivo, url: URL.createObjectURL(archivo) }));
    const resultado = agregarFotos(editor.fotos, nuevas);
    editor.fotos = resultado.fotos;
    pintar(
      editor,
      resultado.rechazadas > 0
        ? `Solo caben ${CONFIG.FOTOS.MAXIMO} fotos: ${resultado.rechazadas} no se agregaron.`
        : ''
    );
  } catch {
    pintar(editor, 'No se pudo leer una de las fotos. Prueba con otra.');
  }
}

function tocar(editor, evento) {
  const boton = evento.target.closest('[data-accion]');
  if (!boton) {
    return;
  }
  const indice = Number(boton.dataset.indice);
  if (boton.dataset.accion === 'portada') {
    editor.fotos = ponerPortada(editor.fotos, indice);
  } else {
    const quitada = editor.fotos[indice];
    // Una guardada se borra de Storage al guardar; una nueva nunca se subio.
    if (typeof quitada === 'string') {
      editor.quitadas = [...editor.quitadas, quitada];
    }
    editor.fotos = quitarFoto(editor.fotos, indice);
  }
  pintar(editor);
}

/**
 * `alCambiar` avisa de cada cambio en las fotos, para guardar el borrador.
 */
export function crearEditorFotos({ lista, entrada, aviso, alCambiar = () => {} }) {
  const editor = { lista, entrada, aviso, alCambiar, fotos: [], quitadas: [] };
  entrada.addEventListener('change', () => elegir(editor));
  lista.addEventListener('click', (evento) => tocar(editor, evento));
  return {
    cargar(fotos = [], quitadas = []) {
      editor.fotos = fotos.map(conDireccion);
      editor.quitadas = [...quitadas];
      pintar(editor);
    },
    fotos: () => editor.fotos,
    quitadas: () => editor.quitadas
  };
}
