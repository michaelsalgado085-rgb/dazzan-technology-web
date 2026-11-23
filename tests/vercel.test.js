import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CONFIG } from '../assets/js/config.js';

// La configuracion de seguridad tambien es codigo: si alguien renombra la
// cookie de la sesion o borra la redireccion, el panel quedaria expuesto.
const vercel = JSON.parse(readFileSync('vercel.json', 'utf-8'));

describe('vercel.json', () => {
  it('manda al login a quien pide el panel sin la marca de sesion', () => {
    const fuentes = vercel.redirects
      .filter((regla) => regla.destination === CONFIG.RUTAS.LOGIN)
      .filter((regla) => regla.missing?.[0]?.key === CONFIG.SESION.COOKIE)
      .map((regla) => regla.source);
    expect(fuentes).toEqual(['/admin', '/admin/:ruta*']);
  });

  it('la redireccion es temporal: con sesion, el panel si se sirve', () => {
    expect(vercel.redirects.every((regla) => regla.permanent === false)).toBe(true);
  });

  it('la CSP deja mostrar las fotos de Supabase y las recien elegidas (blob)', () => {
    const csp = vercel.headers[0].headers.find((h) => h.key === 'Content-Security-Policy').value;
    expect(csp).toContain(`img-src 'self' data: blob: ${CONFIG.SUPABASE.URL};`);
  });

  it('la CSP solo deja conectar al propio sitio y a Supabase', () => {
    const csp = vercel.headers[0].headers.find((h) => h.key === 'Content-Security-Policy').value;
    expect(csp).toContain(`connect-src 'self' ${CONFIG.SUPABASE.URL};`);
  });
});
