import { saludoSegunHora } from '../../dominio/saludo.js';
import { crearInventarioSupabase } from '../salida/inventario-supabase.js';
import { crearFotosSupabase } from '../salida/fotos-supabase.js';
import { crearBorradorNavegador } from '../salida/borrador-navegador.js';
import { arrancarPaginaPrivada, tokenVigente } from './arranque-panel.js';
import { iniciarInventario } from './pantalla-inventario.js';

/**
 * Panel de inventario: saluda y arranca el inventario (RF-23). La sesion la
 * confirma el arranque comun de las paginas privadas.
 */

async function serviciosConSesionVigente() {
  const token = await tokenVigente();
  return {
    repositorio: crearInventarioSupabase(token),
    almacenFotos: crearFotosSupabase(token)
  };
}

arrancarPaginaPrivada(async (perfil) => {
  const nombre = perfil.nombre.split(' ')[0];
  document.querySelector('#saludo-panel').textContent = `${saludoSegunHora(new Date().getHours())}, ${nombre}`;
  await iniciarInventario(serviciosConSesionVigente, crearBorradorNavegador());
});
