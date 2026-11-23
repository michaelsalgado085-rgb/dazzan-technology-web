import { describe, it, expect } from 'vitest';
import {
  crearFotosSupabase,
  rutaDeFoto,
  urlPublica
} from '../assets/js/adaptadores/salida/fotos-supabase.js';
import { productoAFila } from '../assets/js/adaptadores/salida/traductor-productos-supabase.js';

const CONEXION = { URL: 'https://ejemplo.supabase.co', CLAVE_PUBLICA: 'clave' };
const PUBLICA = 'https://ejemplo.supabase.co/storage/v1/object/public/productos/';

function obtenerFalso(respuesta = { ok: true }) {
  const pedidas = [];
  const obtener = async (url, opciones) => {
    pedidas.push({ url, opciones });
    return respuesta;
  };
  return { pedidas, obtener };
}

describe('rutas y direcciones de las fotos', () => {
  it('de ruta a direccion publica y de vuelta', () => {
    const url = urlPublica('a1.jpg', CONEXION);
    expect(url).toBe(`${PUBLICA}a1.jpg`);
    expect(rutaDeFoto(url, CONEXION)).toBe('a1.jpg');
  });

  it('una direccion ajena se deja como esta', () => {
    expect(rutaDeFoto('https://otro.com/x.jpg', CONEXION)).toBe('https://otro.com/x.jpg');
  });

  it('al guardar el producto, la base recibe rutas y no direcciones', () => {
    const url = urlPublica('a1.jpg');
    expect(productoAFila({ nombre: 'x', marca: 'y', fotos: [url] }).fotos).toEqual(['a1.jpg']);
  });
});

describe('fotos en Supabase Storage', () => {
  it('sube un JPEG con un nombre nuevo y devuelve su direccion publica', async () => {
    const { obtener, pedidas } = obtenerFalso();
    const url = await crearFotosSupabase('token', { obtener, conexion: CONEXION, nombreNuevo: () => 'n1' }).subir('blob');
    expect(url).toBe(`${PUBLICA}n1.jpg`);
    expect(pedidas[0].url).toBe('https://ejemplo.supabase.co/storage/v1/object/productos/n1.jpg');
    expect(pedidas[0].opciones.headers).toMatchObject({
      Authorization: 'Bearer token',
      'Content-Type': 'image/jpeg'
    });
  });

  it('si Storage rechaza la foto, se informa', async () => {
    const { obtener } = obtenerFalso({ ok: false, status: 413 });
    await expect(crearFotosSupabase('t', { obtener, conexion: CONEXION }).subir('blob')).rejects.toThrow('413');
  });

  it('elimina varias fotos de una vez, por su ruta', async () => {
    const { obtener, pedidas } = obtenerFalso();
    await crearFotosSupabase('t', { obtener, conexion: CONEXION }).eliminar([`${PUBLICA}a.jpg`, `${PUBLICA}b.jpg`]);
    expect(JSON.parse(pedidas[0].opciones.body)).toEqual({ prefixes: ['a.jpg', 'b.jpg'] });
  });

  it('sin fotos que eliminar no llama a Storage', async () => {
    const { obtener, pedidas } = obtenerFalso();
    await crearFotosSupabase('t', { obtener, conexion: CONEXION }).eliminar([]);
    expect(pedidas).toEqual([]);
  });
});
