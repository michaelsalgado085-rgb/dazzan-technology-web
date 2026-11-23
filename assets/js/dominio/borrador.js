/**
 * RN-35: lo que se escribe en el formulario de producto no se pierde al salir
 * de la app. Un borrador guarda como estaba el formulario al abrirlo
 * (`inicial`) y como esta ahora (`actual`), cada uno con sus campos de texto
 * y sus fotos.
 */

function mismoTexto(a, b) {
  return String(a ?? '').trim() === String(b ?? '').trim();
}

function mismasFotos(inicial = [], actual = []) {
  // Una foto recien elegida es un objeto nuevo: nunca es igual a una guardada.
  return inicial.length === actual.length && inicial.every((foto, indice) => foto === actual[indice]);
}

/**
 * Hay cambios si algun campo cambio, sin contar espacios sueltos, o si se
 * agrego, quito o reordeno una foto. Sin cambios no hace falta guardar un
 * borrador ni preguntar antes de cancelar.
 */
export function hayCambios(inicial, actual) {
  const campos = new Set([...Object.keys(inicial.campos ?? {}), ...Object.keys(actual.campos ?? {})]);
  const mismosCampos = [...campos].every((campo) =>
    mismoTexto(inicial.campos?.[campo], actual.campos?.[campo])
  );
  return !mismosCampos || !mismasFotos(inicial.fotos, actual.fotos);
}
