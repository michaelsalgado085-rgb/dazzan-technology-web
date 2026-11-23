import { crearAlmacenSesion } from '../salida/almacen-sesion-navegador.js';

/**
 * En la tienda, el boton "Ir al panel" solo aparece en el telefono de quien
 * ya inicio sesion. Un cliente nunca lo ve. No es seguridad, es comodidad:
 * el panel igual exige sesion y RLS protege los datos.
 */
export function mostrarAccesoAlPanel(boton, almacen = crearAlmacenSesion()) {
  try {
    boton.hidden = !almacen.leer()?.token;
  } catch {
    // Sin acceso al almacenamiento (modo privado estricto): el boton queda oculto.
    boton.hidden = true;
  }
}
