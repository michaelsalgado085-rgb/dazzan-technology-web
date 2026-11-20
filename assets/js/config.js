/**
 * Constantes del sistema.
 * Ningun otro modulo debe declarar valores fijos de negocio.
 */
export const CONFIG = Object.freeze({
  MONEDA_CODIGO: 'HNL',
  MONEDA_LOCALE: 'es-HN',
  STOCK_UMBRAL_BAJO: 3,
  WHATSAPP: '50431807243',
  RUTA_CATALOGO: 'data/productos.json',
  // RN-02: un solo plazo para todo lo que se vende, sin importar el precio.
  GARANTIA_MESES: 3,
  // RN-24: la factura se imprime con este numero de digitos, ceros a la izquierda.
  FACTURA_DIGITOS: 5,
  // RN-14
  METODOS_PAGO: Object.freeze(['efectivo', 'tarjeta', 'transferencia', 'financiamiento']),
  CATEGORIAS: Object.freeze([
    'laptops',
    'escritorio',
    'teclados',
    'mouse',
    'auriculares'
  ])
});

export const CONDICION = Object.freeze({
  NUEVO: 'nuevo',
  USADO: 'usado'
});

export const ESTADO_STOCK = Object.freeze({
  AGOTADO: 'agotado',
  BAJO: 'ultimas-unidades',
  DISPONIBLE: 'disponible'
});
