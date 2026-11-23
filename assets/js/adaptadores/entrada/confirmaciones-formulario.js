/**
 * Las dos preguntas del formulario de producto antes de una accion que no se
 * deshace: eliminar el producto, y cancelar con algo escrito (RN-35). Solo
 * muestra y oculta; lo que pasa al confirmar lo decide quien la conecta.
 */

function mostrar(elemento, visible) {
  elemento.hidden = !visible;
}

export function conectarConfirmaciones(el, acciones) {
  const { tieneCambios, nombreEditando, alDescartar, alEliminar } = acciones;
  el['eliminar-producto'].addEventListener('click', () => {
    el['texto-confirmar'].textContent =
      `¿Eliminar "${nombreEditando()}"? Solo se puede si nunca se vendió, y no se puede deshacer.`;
    mostrar(el['confirmar-eliminar'], true);
  });
  el['no-eliminar'].addEventListener('click', () => mostrar(el['confirmar-eliminar'], false));
  el['si-eliminar'].addEventListener('click', () => {
    mostrar(el['confirmar-eliminar'], false);
    alEliminar();
  });
  el['cancelar-producto'].addEventListener('click', () => {
    if (tieneCambios()) {
      mostrar(el['confirmar-descartar'], true);
    } else {
      alDescartar();
    }
  });
  el['no-descartar'].addEventListener('click', () => mostrar(el['confirmar-descartar'], false));
  el['si-descartar'].addEventListener('click', alDescartar);
}
