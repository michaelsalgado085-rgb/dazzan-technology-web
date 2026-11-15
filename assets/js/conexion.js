/**
 * Avisos de conexion. Pertenece a la capa de aplicacion junto con main.js y
 * revelar.js: toca el DOM a proposito y no tiene reglas que calcular.
 */

/**
 * Muestra el aviso mientras no haya internet. Sin conexion el catalogo sale
 * de la ultima copia guardada y un equipo ya vendido podria seguir ahi.
 */
export function vigilarConexion(aviso) {
  const actualizar = () => {
    aviso.hidden = navigator.onLine;
  };
  window.addEventListener('online', actualizar);
  window.addEventListener('offline', actualizar);
  actualizar();
}

/**
 * Sin internet WhatsApp no puede abrir el chat. En vez de dejar que el
 * enlace falle en silencio, se detiene y se explica por que.
 */
export function exigirConexionAlEnviar(boton, mensaje) {
  boton.addEventListener('click', (evento) => {
    mensaje.hidden = navigator.onLine;
    if (!navigator.onLine) {
      evento.preventDefault();
    }
  });
}
