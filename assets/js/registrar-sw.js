/**
 * Registra el service worker. Va en su propio script, aparte de main.js,
 * para que el sitio quede disponible sin internet aunque falle la carga del
 * catalogo.
 */

const RUTA_SERVICE_WORKER = '/sw.js';

if ('serviceWorker' in navigator) {
  // Se espera a load para no competir con la primera carga de la pagina.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(RUTA_SERVICE_WORKER).catch((error) => {
      console.error('No se pudo registrar el service worker', error);
    });
  });
}
