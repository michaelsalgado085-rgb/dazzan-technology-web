import { describe, it, expect } from 'vitest';
import { crearAutenticacionSupabase } from '../assets/js/adaptadores/salida/autenticacion-supabase.js';
import { crearPerfilesSupabase } from '../assets/js/adaptadores/salida/perfiles-supabase.js';
import { crearAlmacenSesion } from '../assets/js/adaptadores/salida/almacen-sesion-navegador.js';

const CONEXION = { URL: 'https://ejemplo.supabase.co', CLAVE_PUBLICA: 'clave' };
const RESPUESTA_AUTH = {
  access_token: 'token',
  refresh_token: 'renovar',
  expires_at: 5000,
  user: { id: 'u1', email: 'a@b.com' }
};

function obtenerFalso(respuesta) {
  const pedidas = [];
  const obtener = async (url, opciones) => {
    pedidas.push({ url, opciones });
    return respuesta;
  };
  return { pedidas, obtener };
}

describe('autenticacion en Supabase', () => {
  it('traduce la respuesta de Supabase a la sesion de los casos de uso', async () => {
    const { obtener, pedidas } = obtenerFalso({ ok: true, status: 200, json: async () => RESPUESTA_AUTH });
    const sesion = await crearAutenticacionSupabase(obtener, CONEXION).iniciarSesion('a@b.com', 'x');
    expect(sesion).toEqual({
      token: 'token',
      renovacion: 'renovar',
      venceEn: 5000,
      usuario: { id: 'u1', correo: 'a@b.com' }
    });
    expect(pedidas[0].url).toBe('https://ejemplo.supabase.co/auth/v1/token?grant_type=password');
  });

  it('un 400 es una credencial equivocada, no una falla de red', async () => {
    const { obtener } = obtenerFalso({ ok: false, status: 400 });
    await expect(
      crearAutenticacionSupabase(obtener, CONEXION).iniciarSesion('a@b.com', 'x')
    ).rejects.toMatchObject({ codigo: 'credenciales' });
  });

  it('cualquier otro error se informa con su codigo', async () => {
    const { obtener } = obtenerFalso({ ok: false, status: 503 });
    await expect(crearAutenticacionSupabase(obtener, CONEXION).renovar('r')).rejects.toThrow('503');
  });

});

describe('autenticacion en Supabase: cerrar sesion', () => {
  it('cerrar sesion envia el token del usuario', async () => {
    const { obtener, pedidas } = obtenerFalso({ ok: true, status: 204 });
    await crearAutenticacionSupabase(obtener, CONEXION).cerrarSesion('token');
    expect(pedidas[0].opciones.headers.Authorization).toBe('Bearer token');
  });
});

describe('perfiles en Supabase', () => {
  it('devuelve el perfil propio leido con el token del usuario', async () => {
    const respuesta = { ok: true, json: async () => [{ nombre: 'Julio', rol: 'administrador' }] };
    const { obtener, pedidas } = obtenerFalso(respuesta);
    const perfil = await crearPerfilesSupabase(obtener, CONEXION).miPerfil('token');
    expect(perfil.rol).toBe('administrador');
    expect(pedidas[0].opciones.headers.Authorization).toBe('Bearer token');
  });

  it('sin perfil, RLS no devuelve filas y el resultado es null', async () => {
    const { obtener } = obtenerFalso({ ok: true, json: async () => [] });
    expect(await crearPerfilesSupabase(obtener, CONEXION).miPerfil('token')).toBeNull();
  });
});

function almacenFalso() {
  const datos = new Map();
  return {
    getItem: (clave) => datos.get(clave) ?? null,
    setItem: (clave, valor) => datos.set(clave, valor),
    removeItem: (clave) => datos.delete(clave)
  };
}

describe('almacen de la sesion en el navegador', () => {
  it('guarda y lee la sesion, y deja la marca para el servidor', () => {
    const documento = { cookie: '' };
    const almacen = crearAlmacenSesion(almacenFalso(), documento);
    almacen.guardar({ token: 't' });
    expect(almacen.leer()).toEqual({ token: 't' });
    expect(documento.cookie).toContain('dazzan_sesion=1');
    expect(documento.cookie).toContain('Secure');
    expect(documento.cookie).not.toContain('t;');
  });

  it('al borrar no queda sesion y la marca vence', () => {
    const documento = { cookie: '' };
    const almacen = crearAlmacenSesion(almacenFalso(), documento);
    almacen.guardar({ token: 't' });
    almacen.borrar();
    expect(almacen.leer()).toBeNull();
    expect(documento.cookie).toContain('Max-Age=0');
  });

  it('un valor danado se trata como si no hubiera sesion', () => {
    const almacenamiento = almacenFalso();
    almacenamiento.setItem('dazzan.sesion', '{roto');
    expect(crearAlmacenSesion(almacenamiento, { cookie: '' }).leer()).toBeNull();
  });
});
