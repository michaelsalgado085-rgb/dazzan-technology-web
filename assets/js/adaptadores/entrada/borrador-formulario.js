import {
  descartarBorrador,
  guardarBorrador,
  recuperarBorrador
} from '../../casos-de-uso/borrador-producto.js';
import { hayCambios } from '../../dominio/borrador.js';

/**
 * Borrador del formulario de producto (RN-35). Julio sale de la app a mirar
 * las fotos o la ficha de un equipo y vuelve; el telefono puede haber
 * cerrado la pagina mientras tanto. Cada cambio se guarda en el navegador y
 * al volver el formulario se abre donde quedo.
 */

function leerCampos(formulario) {
  // FormData deja fuera la entrada de fotos: no tiene nombre.
  return Object.fromEntries([...new FormData(formulario)].filter(([, valor]) => typeof valor === 'string'));
}

function ponerCampos(formulario, campos) {
  for (const [nombre, valor] of Object.entries(campos)) {
    const campo = formulario.elements.namedItem(nombre);
    if (campo) {
      campo.value = valor;
    }
  }
}

// La direccion blob: de una foto nueva muere con la pagina: se guarda el archivo.
function paraGuardar(foto) {
  return typeof foto === 'string' ? foto : { archivo: foto.archivo };
}

function estadoActual(formulario, editorFotos) {
  return {
    campos: leerCampos(formulario),
    fotos: editorFotos.fotos().map(paraGuardar),
    quitadas: editorFotos.quitadas()
  };
}

function escucharCambios(formulario, guardar) {
  formulario.addEventListener('input', guardar);
  formulario.addEventListener('change', guardar);
  // Al pasar a otra app es el ultimo momento seguro: despues el telefono
  // puede cerrar la pagina sin avisar.
  document.addEventListener('visibilitychange', () => document.hidden && guardar());
}

export function crearBorradorFormulario({ formulario, editorFotos, almacen }) {
  let inicial = null;
  const actual = () => estadoActual(formulario, editorFotos);
  escucharCambios(formulario, () => borrador.guardar());

  const borrador = {
    // Mientras el formulario se llena por codigo no se guarda nada.
    pausar() {
      inicial = null;
    },
    empezar() {
      inicial = actual();
    },
    guardar() {
      return inicial ? guardarBorrador({ inicial, actual: actual() }, almacen) : Promise.resolve();
    },
    tieneCambios: () => inicial !== null && hayCambios(inicial, actual()),
    terminar() {
      inicial = null;
      return descartarBorrador(almacen);
    },
    recuperar: (inventario) => recuperarBorrador(almacen, inventario),
    restaurar(guardado) {
      ponerCampos(formulario, guardado.actual.campos);
      editorFotos.cargar(guardado.actual.fotos, guardado.actual.quitadas);
      inicial = guardado.inicial;
    }
  };
  return borrador;
}
