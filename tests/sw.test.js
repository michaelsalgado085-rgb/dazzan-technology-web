import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

// sw.js es un script clasico sin export: se carga como texto y se ejecuta con
// un self falso, igual que lo haria el navegador.
function cargarServiceWorker() {
  const codigo = readFileSync('sw.js', 'utf-8');
  const selfFalso = { addEventListener: () => {}, location: { origin: ORIGEN } };
  const ejecutar = new Function(
    'self',
    `${codigo}\nreturn { estrategiaPara, ARCHIVOS_BASE };`
  );
  return ejecutar(selfFalso);
}

const ORIGEN = 'https://dazzan-technology-web.vercel.app';
const { estrategiaPara, ARCHIVOS_BASE } = cargarServiceWorker();

function peticion(ruta, opciones = {}) {
  const url = ruta.startsWith('http') ? ruta : `${ORIGEN}${ruta}`;
  return { url, method: opciones.method ?? 'GET', mode: opciones.mode ?? 'cors' };
}

describe('estrategiaPara: archivos del sitio y catalogo', () => {
  it('sirve CSS, JS e imagenes primero desde el cache', () => {
    expect(estrategiaPara(peticion('/assets/css/base.css'), ORIGEN)).toBe('cache-primero');
    expect(estrategiaPara(peticion('/assets/js/main.js'), ORIGEN)).toBe('cache-primero');
    expect(estrategiaPara(peticion('/assets/img/logo-icono.png'), ORIGEN)).toBe('cache-primero');
  });

  it('pide el catalogo primero a la red para tener precios al dia', () => {
    expect(estrategiaPara(peticion('/data/productos.json'), ORIGEN)).toBe('red-primero');
  });

  it('pide las paginas primero a la red', () => {
    expect(estrategiaPara(peticion('/', { mode: 'navigate' }), ORIGEN)).toBe('red-primero');
    expect(estrategiaPara(peticion('/?utm=tiktok', { mode: 'navigate' }), ORIGEN)).toBe(
      'red-primero'
    );
  });
});

describe('estrategiaPara: lo que nunca se guarda', () => {
  it('no guarda el panel ni sus subrutas', () => {
    expect(estrategiaPara(peticion('/admin', { mode: 'navigate' }), ORIGEN)).toBe('solo-red');
    expect(estrategiaPara(peticion('/admin/facturas/15'), ORIGEN)).toBe('solo-red');
  });

  it('no guarda el login ni la API', () => {
    expect(estrategiaPara(peticion('/login', { mode: 'navigate' }), ORIGEN)).toBe('solo-red');
    expect(estrategiaPara(peticion('/api/health'), ORIGEN)).toBe('solo-red');
  });

  it('no guarda peticiones a otros dominios', () => {
    expect(estrategiaPara(peticion('https://wa.me/50431807243'), ORIGEN)).toBe('solo-red');
    expect(estrategiaPara(peticion('https://abc.supabase.co/rest/v1/productos'), ORIGEN)).toBe(
      'solo-red'
    );
  });

  it('no guarda peticiones que no son GET', () => {
    expect(estrategiaPara(peticion('/data/productos.json', { method: 'POST' }), ORIGEN)).toBe(
      'solo-red'
    );
  });
});

describe('ARCHIVOS_BASE', () => {
  const rutaEnDisco = (ruta) => (ruta === '/' ? 'index.html' : ruta.slice(1));

  it('lista solo archivos que existen, porque uno faltante rompe la instalacion', () => {
    const faltantes = ARCHIVOS_BASE.filter((ruta) => !existsSync(rutaEnDisco(ruta)));
    expect(faltantes).toEqual([]);
  });

  it('incluye todos los modulos de assets/js, o la pagina no arranca sin internet', () => {
    const modulos = readdirSync('assets/js').map((archivo) => `/assets/js/${archivo}`);
    const sinGuardar = modulos.filter((modulo) => !ARCHIVOS_BASE.includes(modulo));
    expect(sinGuardar).toEqual([]);
  });

  it('no incluye rutas del panel, del login ni de la API', () => {
    const prohibidas = ARCHIVOS_BASE.filter((ruta) => /^\/(admin|login|api\/)/.test(ruta));
    expect(prohibidas).toEqual([]);
  });
});
