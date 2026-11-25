import { CONFIG } from '../../config.js';

/**
 * Adaptador de salida que cumple el puerto RepositorioFacturas (ver
 * casos-de-uso/emitir-factura.js) con la funcion emitir_factura de la base.
 * La base hace todo en una transaccion: numero, lineas, existencias y pagos,
 * o nada (migracion 003).
 */

/**
 * Del dominio al formato que espera emitir_factura. Solo viaja lo que la
 * base no sabe: que producto, cuantos, descuentos y pagos. El precio no se
 * manda: la base usa el suyo.
 */
export function facturaADatos(factura) {
  return {
    cliente_nombre: factura.cliente.nombre.trim(),
    cliente_identificacion: (factura.cliente.identificacion ?? '').trim(),
    descuento_adicional: factura.descuentoAdicional ?? 0,
    lineas: factura.lineas.map((linea) => ({
      producto_id: linea.productoId,
      cantidad: linea.cantidad,
      descuento: linea.descuento ?? 0,
      numero_serie: (linea.numeroSerie ?? '').trim()
    })),
    pagos: (factura.pagos ?? []).map(({ metodo, monto }) => ({ metodo, monto }))
  };
}

/**
 * De la fila de la base al dominio. numeric llega como texto: se convierte.
 */
export function filaAFactura(fila) {
  return {
    id: fila.id,
    numero: fila.numero,
    emitidaEn: fila.emitida_en,
    cliente: { nombre: fila.cliente_nombre, identificacion: fila.cliente_identificacion ?? '' },
    subtotal: Number(fila.subtotal),
    descuentoAdicional: Number(fila.descuento_adicional),
    total: Number(fila.total),
    anulada: fila.anulada
  };
}

async function leerError(respuesta) {
  try {
    return await respuesta.json();
  } catch {
    return {};
  }
}

/**
 * 23514 son las reglas de la base (sin existencias, pagos que no cuadran):
 * su mensaje ya esta escrito para quien factura. 42501 o 401: la sesion no
 * puede facturar.
 */
function errorDeFactura(status, cuerpo) {
  if (cuerpo.code === '23514') {
    return Object.assign(new Error(cuerpo.message), { codigo: 'regla' });
  }
  if (cuerpo.code === '42501' || status === 401) {
    return Object.assign(new Error('Tu sesión no tiene permiso para facturar.'), { codigo: 'sesion' });
  }
  return Object.assign(new Error(`Supabase respondio ${status}`), { codigo: 'red' });
}

export function crearFacturasSupabase(
  token,
  obtener = (url, opciones) => fetch(url, opciones),
  conexion = CONFIG.SUPABASE
) {
  return {
    async emitir(factura) {
      const respuesta = await obtener(`${conexion.URL}/rest/v1/rpc/emitir_factura`, {
        method: 'POST',
        headers: {
          apikey: conexion.CLAVE_PUBLICA,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ datos: facturaADatos(factura) })
      });
      if (!respuesta.ok) {
        throw errorDeFactura(respuesta.status, await leerError(respuesta));
      }
      return filaAFactura(await respuesta.json());
    }
  };
}
