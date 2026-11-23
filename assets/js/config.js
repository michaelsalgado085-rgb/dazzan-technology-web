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
  // De donde sale el catalogo publico: 'json' o 'supabase' (ver la fabrica en
  // adaptadores/salida). Sigue en 'json' hasta que el cliente cargue su
  // inventario real desde el panel.
  ORIGEN_CATALOGO: 'json',
  // La clave publicable es publica por diseno: lo que protege los datos es
  // RLS (002_seguridad.sql). La clave secreta nunca entra al repositorio.
  SUPABASE: Object.freeze({
    URL: 'https://zcohmefgobkrmmxizcsr.supabase.co',
    CLAVE_PUBLICA: 'sb_publishable_Ci--JcD7TYu646_Jj8n4vQ_dFgVHVIS'
  }),
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
