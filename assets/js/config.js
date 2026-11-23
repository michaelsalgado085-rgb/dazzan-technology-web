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
  RUTAS: Object.freeze({ LOGIN: '/login', PANEL: '/admin' }),
  SESION: Object.freeze({
    CLAVE_ALMACEN: 'dazzan.sesion',
    // Solo una marca de que hay sesion, sin el token: vercel.json la usa para
    // no servir el panel a quien no inicio sesion.
    COOKIE: 'dazzan_sesion',
    // Julio usa el panel a diario en su telefono: la sesion dura hasta que la
    // cierre, y la marca se renueva con cada visita.
    COOKIE_SEGUNDOS: 60 * 60 * 24 * 30,
    // Se renueva un minuto antes de vencer, para no fallar a mitad de una factura.
    MARGEN_RENOVACION_SEGUNDOS: 60
  }),
  // RN-01: las computadoras se venden usadas y los perifericos nuevos. Es la
  // condicion que se sugiere al cargar un producto; el cliente la puede cambiar.
  CATEGORIAS_USADAS: Object.freeze(['laptops', 'escritorio']),
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
