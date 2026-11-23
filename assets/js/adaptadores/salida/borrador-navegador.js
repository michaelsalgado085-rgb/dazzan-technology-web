import { CONFIG } from '../../config.js';

/**
 * Adaptador de salida que cumple el puerto AlmacenBorrador en el navegador.
 *
 * IndexedDB y no localStorage: el borrador lleva las fotos recien elegidas,
 * que son archivos, y localStorage solo guarda texto y muy poco.
 *
 * Es un respaldo: si el navegador no deja guardar (modo privado, sin
 * espacio), el formulario sigue funcionando igual, solo sin borrador.
 */

const { BASE_DATOS, ALMACEN, CLAVE } = CONFIG.BORRADOR;

function abrir(fabrica) {
  return new Promise((resolver, rechazar) => {
    const peticion = fabrica.open(BASE_DATOS, 1);
    peticion.onupgradeneeded = () => peticion.result.createObjectStore(ALMACEN);
    peticion.onsuccess = () => resolver(peticion.result);
    peticion.onerror = () => rechazar(peticion.error);
  });
}

// Cada operacion abre y cierra la base: son pocas y asi no queda una
// conexion colgada si el telefono suspende la app.
async function operar(fabrica, modo, accion) {
  const base = await abrir(fabrica);
  try {
    return await new Promise((resolver, rechazar) => {
      const peticion = accion(base.transaction(ALMACEN, modo).objectStore(ALMACEN));
      peticion.onsuccess = () => resolver(peticion.result ?? null);
      peticion.onerror = () => rechazar(peticion.error);
    });
  } finally {
    base.close();
  }
}

async function sinFallar(fabrica, modo, accion) {
  try {
    return await operar(fabrica, modo, accion);
  } catch {
    return null;
  }
}

export function crearBorradorNavegador(fabrica = globalThis.indexedDB) {
  return {
    leer: () => sinFallar(fabrica, 'readonly', (almacen) => almacen.get(CLAVE)),
    guardar: async (borrador) => {
      await sinFallar(fabrica, 'readwrite', (almacen) => almacen.put(borrador, CLAVE));
    },
    borrar: async () => {
      await sinFallar(fabrica, 'readwrite', (almacen) => almacen.delete(CLAVE));
    }
  };
}
