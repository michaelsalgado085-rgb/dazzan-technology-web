import { crearInventarioSupabase } from '../salida/inventario-supabase.js';
import { crearFacturasSupabase } from '../salida/facturas-supabase.js';
import { arrancarPaginaPrivada, tokenVigente } from './arranque-panel.js';
import { iniciarFactura } from './pantalla-factura.js';

/**
 * Punto de entrada de la pagina de factura (raiz de composicion): aqui se
 * eligen los adaptadores de Supabase; la pantalla solo conoce los puertos.
 */

async function serviciosConSesionVigente() {
  const token = await tokenVigente();
  return {
    repositorio: crearInventarioSupabase(token),
    facturas: crearFacturasSupabase(token)
  };
}

arrancarPaginaPrivada(() => iniciarFactura(serviciosConSesionVigente));
