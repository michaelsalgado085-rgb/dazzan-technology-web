/**
 * Healthcheck de la API. Funcion serverless de Vercel.
 *
 * Responde JSON con el estado del servicio. Sirve para que un monitor externo
 * sepa si el sitio esta vivo sin tener que cargar y analizar el HTML, y es lo
 * que revisa el entregable 3.
 *
 * Todavia no consulta la base de datos porque no existe. Cuando exista, aqui
 * se agrega una consulta barata a Supabase y el estado pasa a reflejarla.
 */
export default function handler(peticion, respuesta) {
  respuesta.setHeader('Content-Type', 'application/json; charset=utf-8');
  respuesta.setHeader('Cache-Control', 'no-store');
  respuesta.status(200).json({
    estado: 'ok',
    servicio: 'dazzan-technology-web',
    version: process.env.npm_package_version ?? '0.2.0',
    entorno: process.env.VERCEL_ENV ?? 'desarrollo',
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    consultado_en: new Date().toISOString()
  });
}
