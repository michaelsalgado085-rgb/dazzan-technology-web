import { describe, it, expect } from 'vitest';
import { crearRepositorioProductosSupabase } from '../assets/js/adaptadores/salida/repositorio-productos-supabase.js';
import { filaAProducto } from '../assets/js/adaptadores/salida/traductor-productos-supabase.js';

const FILA = {
  id: '10000000-0000-0000-0000-000000000001',
  nombre: 'ThinkPad T480s',
  marca: 'Lenovo',
  categoria_id: 'laptops',
  condicion: 'usado',
  precio: 13900,
  precio_anterior: 15500,
  stock: 2,
  descripcion: 'Buen estado',
  especificaciones: { Memoria: '16 GB' },
  imagen: null,
  creado_en: '2026-11-22T00:00:00Z'
};

const CONEXION = { URL: 'https://ejemplo.supabase.co', CLAVE_PUBLICA: 'clave-de-prueba' };

describe('filaAProducto: traduce la fila al producto del dominio', () => {
  it('pasa de snake_case a los nombres del dominio', () => {
    expect(filaAProducto(FILA)).toMatchObject({
      categoria: 'laptops',
      precioAnterior: 15500,
      especificaciones: { Memoria: '16 GB' }
    });
  });

  it('un precio anterior o una imagen nulos quedan ausentes, como en el JSON', () => {
    const producto = filaAProducto({ ...FILA, precio_anterior: null });
    expect(producto.precioAnterior).toBeUndefined();
    expect(producto.imagen).toBeUndefined();
  });

  it('no deja pasar columnas de la base que el dominio no usa', () => {
    expect(filaAProducto(FILA)).not.toHaveProperty('creado_en');
  });
});

describe('repositorio de productos en Supabase', () => {
  it('pide la tabla con la clave publica y devuelve productos del dominio', async () => {
    const pedidas = [];
    const obtener = async (url, opciones) => {
      pedidas.push({ url, opciones });
      return { ok: true, json: async () => [FILA] };
    };
    const inventario = await crearRepositorioProductosSupabase(obtener, CONEXION).inventario();
    expect(inventario[0].categoria).toBe('laptops');
    expect(pedidas[0].url).toBe('https://ejemplo.supabase.co/rest/v1/productos?select=*');
    expect(pedidas[0].opciones.headers.apikey).toBe('clave-de-prueba');
  });

  it('si Supabase responde con error, lo informa con el codigo', async () => {
    const obtener = async () => ({ ok: false, status: 401 });
    await expect(
      crearRepositorioProductosSupabase(obtener, CONEXION).inventario()
    ).rejects.toThrow('401');
  });
});
