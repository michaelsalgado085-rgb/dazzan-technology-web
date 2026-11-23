/**
 * Service worker de Dazzan Technology.
 *
 * Corre fuera de la pagina y como script clasico, porque no todos los
 * navegadores aceptan service workers con import. Por eso no lee config.js y
 * sus constantes viven aqui.
 *
 * Frontera de lo que funciona sin internet:
 * - Los archivos del sitio salen del cache y se actualizan en segundo plano.
 * - El catalogo y las paginas van primero a la red, para que precios y
 *   existencias esten al dia; sin internet se usa la ultima copia guardada.
 * - El catalogo publico de Supabase tambien va primero a la red. Solo la
 *   lectura sin sesion: lo que pide el panel lleva el token y no se guarda.
 * - Las fotos de los productos se guardan como los archivos del sitio.
 * - El panel, el login, la API y otros dominios nunca se guardan: una
 *   factura con datos viejos seria un error grave.
 */

// Cambiar la version obliga a todos los navegadores a descargar todo de nuevo.
const NOMBRE_CACHE = 'dazzan-v2';

const ARCHIVOS_BASE = [
  '/',
  '/manifest.webmanifest',
  '/assets/css/base.css',
  '/assets/css/carrusel.css',
  '/assets/css/acceso-panel.css',
  '/assets/css/conexion.css',
  '/assets/css/panel.css',
  '/assets/js/config.js',
  '/assets/js/utils.js',
  '/assets/js/dominio/catalogo.js',
  '/assets/js/dominio/cotizacion.js',
  '/assets/js/dominio/factura.js',
  '/assets/js/dominio/fotos.js',
  '/assets/js/dominio/inventario.js',
  '/assets/js/dominio/producto.js',
  '/assets/js/dominio/sesion.js',
  '/assets/js/adaptadores/entrada/acceso-panel.js',
  '/assets/js/adaptadores/entrada/achicar-foto.js',
  '/assets/js/adaptadores/entrada/carrusel.js',
  '/assets/js/adaptadores/entrada/conexion.js',
  '/assets/js/adaptadores/entrada/dependencias-sesion.js',
  '/assets/js/adaptadores/entrada/editor-fotos.js',
  '/assets/js/adaptadores/entrada/formulario-producto.js',
  '/assets/js/adaptadores/entrada/login.js',
  '/assets/js/adaptadores/entrada/main.js',
  '/assets/js/adaptadores/entrada/panel.js',
  '/assets/js/adaptadores/entrada/pantalla-inventario.js',
  '/assets/js/adaptadores/entrada/registrar-sw.js',
  '/assets/js/adaptadores/entrada/revelar.js',
  '/assets/js/adaptadores/entrada/vista-cotizacion.js',
  '/assets/js/adaptadores/entrada/vista-inventario.js',
  '/assets/js/adaptadores/entrada/vista-producto.js',
  '/assets/js/adaptadores/salida/almacen-sesion-navegador.js',
  '/assets/js/adaptadores/salida/autenticacion-supabase.js',
  '/assets/js/adaptadores/salida/crear-repositorio-productos.js',
  '/assets/js/adaptadores/salida/fotos-supabase.js',
  '/assets/js/adaptadores/salida/inventario-supabase.js',
  '/assets/js/adaptadores/salida/perfiles-supabase.js',
  '/assets/js/adaptadores/salida/repositorio-productos-json.js',
  '/assets/js/adaptadores/salida/repositorio-productos-supabase.js',
  '/assets/js/adaptadores/salida/traductor-productos-supabase.js',
  '/assets/js/adaptadores/salida/whatsapp.js',
  '/assets/js/casos-de-uso/cargar-catalogo.js',
  '/assets/js/casos-de-uso/emitir-factura.js',
  '/assets/js/casos-de-uso/gestionar-inventario.js',
  '/assets/js/casos-de-uso/gestionar-sesion.js',
  '/assets/img/favicon.ico',
  '/assets/img/favicon-32.png',
  '/assets/img/icono-192.png',
  '/assets/img/logo-icono.png',
  '/assets/img/logo-marca.png',
  '/assets/img/local-escritorio.webp',
  '/assets/img/local-movil.webp',
  '/data/productos.json'
];

const RUTAS_SOLO_RED = ['/api/', '/admin', '/login'];
// Deben coincidir con CONFIG.SUPABASE.URL; una prueba lo verifica.
const CATALOGO_PUBLICO = 'https://zcohmefgobkrmmxizcsr.supabase.co/rest/v1/productos';
const FOTOS_PUBLICAS = 'https://zcohmefgobkrmmxizcsr.supabase.co/storage/v1/object/public/productos/';
const RUTA_DATOS = '/data/';

/**
 * Decide como se atiende una peticion. Es la unica funcion con reglas del
 * archivo y no toca el cache, para poder probarla sin navegador.
 */
function esCatalogoPublico(peticion) {
  const conSesion = peticion.headers?.has?.('Authorization') ?? false;
  return peticion.method === 'GET' && peticion.url.startsWith(CATALOGO_PUBLICO) && !conSesion;
}

function estrategiaPara(peticion, origenPropio) {
  if (esCatalogoPublico(peticion)) {
    return 'red-primero';
  }
  // Una foto subida nunca cambia (cada una tiene nombre nuevo): se guarda y
  // se reutiliza, lo que ahorra datos moviles y deja verla sin internet.
  if (peticion.method === 'GET' && peticion.url.startsWith(FOTOS_PUBLICAS)) {
    return 'cache-primero';
  }
  const direccion = new URL(peticion.url);
  if (peticion.method !== 'GET' || direccion.origin !== origenPropio) {
    return 'solo-red';
  }
  if (RUTAS_SOLO_RED.some((ruta) => direccion.pathname.startsWith(ruta))) {
    return 'solo-red';
  }
  if (peticion.mode === 'navigate' || direccion.pathname.startsWith(RUTA_DATOS)) {
    return 'red-primero';
  }
  return 'cache-primero';
}

async function redPrimero(evento) {
  const cache = await caches.open(NOMBRE_CACHE);
  try {
    const respuesta = await fetch(evento.request);
    if (respuesta.ok) {
      await cache.put(evento.request, respuesta.clone());
    }
    return respuesta;
  } catch (error) {
    const guardada = await cache.match(evento.request, { ignoreSearch: true });
    // Una pagina que nunca se visito se responde con la portada guardada.
    const alternativa = evento.request.mode === 'navigate' ? await cache.match('/') : undefined;
    if (guardada || alternativa) {
      return guardada ?? alternativa;
    }
    throw error;
  }
}

/**
 * Responde con la copia guardada y la renueva por detras, asi la siguiente
 * visita ya trae la version nueva sin tener que cambiar NOMBRE_CACHE.
 */
async function cachePrimero(evento) {
  const cache = await caches.open(NOMBRE_CACHE);
  const guardada = await cache.match(evento.request);
  const renovacion = fetch(evento.request).then(async (respuesta) => {
    if (respuesta.ok) {
      await cache.put(evento.request, respuesta.clone());
    }
    return respuesta;
  });
  if (!guardada) {
    return renovacion;
  }
  evento.waitUntil(renovacion.catch(() => undefined));
  return guardada;
}

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(NOMBRE_CACHE)
      .then((cache) => cache.addAll(ARCHIVOS_BASE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter((nombre) => nombre !== NOMBRE_CACHE)
            .map((nombre) => caches.delete(nombre))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  const estrategia = estrategiaPara(evento.request, self.location.origin);
  if (estrategia === 'solo-red') {
    return;
  }
  const atender = estrategia === 'red-primero' ? redPrimero : cachePrimero;
  evento.respondWith(atender(evento));
});
