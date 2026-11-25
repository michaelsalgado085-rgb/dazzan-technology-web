import { describe, it, expect } from 'vitest';
import {
  crearFacturasSupabase,
  facturaADatos,
  filaAFactura
} from '../assets/js/adaptadores/salida/facturas-supabase.js';

const CONEXION = { URL: 'https://ejemplo.supabase.co', CLAVE_PUBLICA: 'clave' };
const FACTURA = {
  cliente: { nombre: '  Ana Pérez ', identificacion: ' 0501-1990-01234 ' },
  lineas: [
    { productoId: 'p1', descripcion: 'Latitude 7420', precio: 10500, cantidad: 1, descuento: 500, numeroSerie: ' SN1 ', existencias: 2 }
  ],
  descuentoAdicional: 0,
  pagos: [{ metodo: 'efectivo', monto: 10000 }],
  subtotal: 10000,
  total: 10000
};
const FILA = {
  id: 'f1',
  numero: 769,
  emitida_en: '2026-11-25T15:00:00Z',
  cliente_nombre: 'Ana Pérez',
  cliente_identificacion: null,
  subtotal: '10000.00',
  descuento_adicional: '0.00',
  total: '10000.00',
  anulada: false
};

function obtenerFalso(respuesta) {
  const pedidas = [];
  const obtener = async (url, opciones) => {
    pedidas.push({ url, opciones });
    return respuesta;
  };
  return { pedidas, obtener };
}

describe('facturaADatos: del dominio a emitir_factura', () => {
  it('traduce los nombres y limpia los espacios', () => {
    expect(facturaADatos(FACTURA)).toEqual({
      cliente_nombre: 'Ana Pérez',
      cliente_identificacion: '0501-1990-01234',
      descuento_adicional: 0,
      lineas: [{ producto_id: 'p1', cantidad: 1, descuento: 500, numero_serie: 'SN1' }],
      pagos: [{ metodo: 'efectivo', monto: 10000 }]
    });
  });

  it('no manda precios ni totales: la base usa los suyos', () => {
    const datos = JSON.stringify(facturaADatos(FACTURA));
    expect(datos).not.toContain('10500');
    expect(datos).not.toContain('total');
  });

  it('lo opcional que falta viaja vacio', () => {
    const datos = facturaADatos({ cliente: { nombre: 'Ana' }, lineas: [{ productoId: 'p1', cantidad: 1 }] });
    expect(datos).toMatchObject({ cliente_identificacion: '', descuento_adicional: 0, pagos: [] });
    expect(datos.lineas[0]).toEqual({ producto_id: 'p1', cantidad: 1, descuento: 0, numero_serie: '' });
  });
});

describe('filaAFactura: de la base al dominio', () => {
  it('convierte los montos a numero y la identificacion vacia a texto', () => {
    expect(filaAFactura(FILA)).toEqual({
      id: 'f1',
      numero: 769,
      emitidaEn: '2026-11-25T15:00:00Z',
      cliente: { nombre: 'Ana Pérez', identificacion: '' },
      subtotal: 10000,
      descuentoAdicional: 0,
      total: 10000,
      anulada: false
    });
  });
});

describe('repositorio de facturas en Supabase', () => {
  it('llama a emitir_factura con el token y devuelve la factura con su numero', async () => {
    const { pedidas, obtener } = obtenerFalso({ ok: true, json: async () => FILA });
    const factura = await crearFacturasSupabase('token', obtener, CONEXION).emitir(FACTURA);
    expect(factura.numero).toBe(769);
    expect(pedidas[0].url).toBe('https://ejemplo.supabase.co/rest/v1/rpc/emitir_factura');
    expect(pedidas[0].opciones.headers.Authorization).toBe('Bearer token');
    expect(JSON.parse(pedidas[0].opciones.body).datos.cliente_nombre).toBe('Ana Pérez');
  });
});

describe('repositorio de facturas en Supabase: errores', () => {
  const emitirCon = (status, cuerpo) => {
    const json = async () => cuerpo;
    return crearFacturasSupabase('t', obtenerFalso({ ok: false, status, json }).obtener, CONEXION).emitir(FACTURA);
  };

  it('una regla de la base llega con su mensaje', async () => {
    await expect(emitirCon(400, { code: '23514', message: 'No hay existencias suficientes de Latitude 7420' }))
      .rejects.toMatchObject({ codigo: 'regla', message: 'No hay existencias suficientes de Latitude 7420' });
  });

  it('sin permiso es un error de sesion', async () => {
    await expect(emitirCon(403, { code: '42501' })).rejects.toMatchObject({ codigo: 'sesion' });
    await expect(emitirCon(401, {})).rejects.toMatchObject({ codigo: 'sesion' });
  });

  it('cualquier otra falla es de red, aunque la respuesta no sea JSON', async () => {
    const obtener = obtenerFalso({ ok: false, status: 502, json: async () => JSON.parse('<html>') }).obtener;
    await expect(crearFacturasSupabase('t', obtener, CONEXION).emitir(FACTURA)).rejects.toMatchObject({ codigo: 'red' });
  });
});
