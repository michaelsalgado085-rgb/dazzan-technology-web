import { CONFIG } from '../../config.js';
import { crearRepositorioProductosJson } from './repositorio-productos-json.js';
import { crearRepositorioProductosSupabase } from './repositorio-productos-supabase.js';

/**
 * Factory: un solo lugar sabe construir cada repositorio de productos. Quien
 * lo pide no sabe si detras hay un archivo o una base de datos; cambiar de
 * origen es cambiar CONFIG.ORIGEN_CATALOGO.
 */
const FABRICAS = Object.freeze({
  json: crearRepositorioProductosJson,
  supabase: crearRepositorioProductosSupabase
});

export function crearRepositorioProductos(origen = CONFIG.ORIGEN_CATALOGO) {
  const fabricar = FABRICAS[origen];
  if (!fabricar) {
    throw new Error(`No hay repositorio de productos para el origen "${origen}"`);
  }
  return fabricar();
}
