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
  // adaptadores/salida). Desde el 23 de noviembre la tienda muestra lo que se
  // carga en el panel; el JSON queda como respaldo de desarrollo.
  ORIGEN_CATALOGO: 'supabase',
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
  // RN-33: fotos por producto. Se achican en el telefono antes de subir: el
  // lado mayor queda en este tamano y se guardan como JPEG con esta calidad.
  FOTOS: Object.freeze({ MAXIMO: 6, LADO_MAXIMO: 1600, CALIDAD_JPEG: 0.82 }),
  // RN-34: hora (0 a 23) en que empieza cada saludo del panel.
  SALUDO: Object.freeze({ INICIO_MANANA: 5, INICIO_TARDE: 12, INICIO_NOCHE: 19 }),
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
