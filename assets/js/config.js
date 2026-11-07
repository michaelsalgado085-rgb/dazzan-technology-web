/**
 * Constantes del sistema.
 * Ningun otro modulo debe declarar valores fijos de negocio.
 */
export const CONFIG = Object.freeze({
  MONEDA_CODIGO: 'HNL',
  MONEDA_LOCALE: 'es-HN',
  TASA_ISV: 0.15,
  STOCK_UMBRAL_BAJO: 3,
  WHATSAPP: '50431807243',
  GARANTIA_GAMA_ALTA_MESES: 6,
  GARANTIA_ESTANDAR_MESES: 3,
  PRECIO_LIMITE_GAMA_ESTANDAR: 15000,
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
