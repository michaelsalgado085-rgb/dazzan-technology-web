import { describe, it, expect } from 'vitest';
import { crearInventarioSupabase } from '../assets/js/adaptadores/salida/inventario-supabase.js';
import { productoAFila } from '../assets/js/adaptadores/salida/traductor-productos-supabase.js';

const CONEXION = { URL: 'https://ejemplo.supabase.co', CLAVE_PUBLICA: 'clave' };
const FILA = {
  id: 'p1',
  nombre: 'Kumara K552',
  marca: 'Redragon',
  categoria_id: 'teclados',
  condicion: 'nuevo',
  precio: 1150,
  precio_anterior: null,
  stock: 5,
  descripcion: '',
  especificaciones: {},
  imagen: null
};

function obtenerFalso() {
  const pedidas = [];
  const obtener = async (url, opciones) => {
    pedidas.push({ url, opciones });
    return { ok: true, json: async () => [FILA] };
  };
  return { pedidas, obtener };
}

describe('productoAFila: del dominio a la base', () => {
  it('traduce los nombres y limpia los espacios', () => {
    const fila = productoAFila({
      nombre: ' Kumara ',
      marca: 'Redragon',
      categoria: 'teclados',
      condicion: 'nuevo',
      precio: 1150,
      stock: 5
    });
    expect(fila).toMatchObject({ nombre: 'Kumara', categoria_id: 'teclados', precio_anterior: null });
    expect(fila).not.toHaveProperty('id');
  });
});

describe('inventario en Supabase', () => {
  it('lee con el token del administrador', async () => {
    const { obtener, pedidas } = obtenerFalso();
    const productos = await crearInventarioSupabase('token', obtener, CONEXION).todos();
    expect(productos[0].categoria).toBe('teclados');
    expect(pedidas[0].opciones.headers.Authorization).toBe('Bearer token');
  });

  it('crea con POST y actualiza con PATCH sobre el id', async () => {
    const { obtener, pedidas } = obtenerFalso();
    const inventario = crearInventarioSupabase('token', obtener, CONEXION);
    await inventario.crear({ ...FILA, categoria: 'teclados' });
    await inventario.actualizar('p1', { ...FILA, categoria: 'teclados' });
    expect(pedidas.map((pedida) => pedida.opciones.method)).toEqual(['POST', 'PATCH']);
    expect(pedidas[1].url).toBe('https://ejemplo.supabase.co/rest/v1/productos?id=eq.p1');
  });

  it('un error de Supabase se informa con su codigo', async () => {
    const obtener = async () => ({ ok: false, status: 403 });
    await expect(crearInventarioSupabase('token', obtener, CONEXION).todos()).rejects.toThrow('403');
  });
});

describe('inventario en Supabase: eliminar', () => {
  it('elimina con DELETE sobre el id', async () => {
    const { obtener, pedidas } = obtenerFalso();
    await crearInventarioSupabase('token', obtener, CONEXION).eliminar('p1');
    expect(pedidas[0].opciones.method).toBe('DELETE');
    expect(pedidas[0].url).toBe('https://ejemplo.supabase.co/rest/v1/productos?id=eq.p1');
  });

  it('un 409 significa que ya se vendio', async () => {
    const obtener = async () => ({ ok: false, status: 409 });
    await expect(
      crearInventarioSupabase('token', obtener, CONEXION).eliminar('p1')
    ).rejects.toMatchObject({ codigo: 'vendido' });
  });

  it('si no se borro ninguna fila, no se finge que se elimino', async () => {
    const obtener = async () => ({ ok: true, status: 200, json: async () => [] });
    await expect(crearInventarioSupabase('token', obtener, CONEXION).eliminar('p1')).rejects.toThrow(
      'No se elimino'
    );
  });
});
