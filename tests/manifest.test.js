import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('manifest.webmanifest', 'utf-8'));
const indice = readFileSync('index.html', 'utf-8');

describe('manifest.webmanifest', () => {
  it('arranca y se limita a la raiz del sitio', () => {
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
  });

  it('se abre como aplicacion, sin la barra del navegador', () => {
    expect(manifest.display).toBe('standalone');
  });

  it('trae iconos de 192 y 512, y uno adaptable para Android', () => {
    const tamanos = manifest.icons.map((icono) => icono.sizes);
    expect(tamanos).toContain('192x192');
    expect(tamanos).toContain('512x512');
    expect(manifest.icons.some((icono) => icono.purpose === 'maskable')).toBe(true);
  });

  it('apunta solo a iconos que existen', () => {
    const faltantes = manifest.icons.filter((icono) => !existsSync(icono.src.slice(1)));
    expect(faltantes).toEqual([]);
  });

  it('usa el mismo color de tema que la pagina', () => {
    expect(indice).toContain(`<meta name="theme-color" content="${manifest.theme_color}">`);
  });

  it('esta enlazado desde index.html', () => {
    expect(indice).toContain('<link rel="manifest" href="/manifest.webmanifest">');
  });
});
