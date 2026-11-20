import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

// Pruebas de arquitectura: la regla de dependencia escrita como codigo. Si
// alguien hace que el dominio importe un adaptador, CI falla antes del merge.

const RAIZ = 'assets/js';
const COMPARTIDOS = ['config.js', 'utils.js'];
// Lo que solo existe en el navegador o en la red: el centro no lo conoce.
const DETALLES_DEL_BORDE = /\b(document|window|navigator|fetch|localStorage|wa\.me)\b/;

function archivosDe(capa) {
  return readdirSync(join(RAIZ, capa)).map((archivo) => join(RAIZ, capa, archivo));
}

function importsDe(archivo) {
  const codigo = readFileSync(archivo, 'utf-8');
  return [...codigo.matchAll(/from '(.+?)'/g)].map(([, ruta]) =>
    normalize(join(dirname(archivo), ruta)).replaceAll('\\', '/')
  );
}

function sinComentarios(archivo) {
  return readFileSync(archivo, 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1');
}

function permitido(destino, capasPermitidas) {
  const relativo = destino.replace(`${RAIZ}/`, '');
  return (
    COMPARTIDOS.includes(relativo) ||
    capasPermitidas.some((capa) => relativo.startsWith(`${capa}/`))
  );
}

function violaciones(capa, capasPermitidas) {
  return archivosDe(capa).flatMap((archivo) =>
    importsDe(archivo)
      .filter((destino) => !permitido(destino, capasPermitidas))
      .map((destino) => `${archivo} -> ${destino}`)
  );
}

describe('regla de dependencia: todo apunta hacia el dominio', () => {
  it('el dominio solo importa dominio y lo compartido', () => {
    expect(violaciones('dominio', ['dominio'])).toEqual([]);
  });

  it('el dominio no conoce el navegador, la red ni WhatsApp', () => {
    const conDetalles = archivosDe('dominio').filter((archivo) =>
      DETALLES_DEL_BORDE.test(sinComentarios(archivo))
    );
    expect(conDetalles).toEqual([]);
  });

  it('lo compartido no importa ninguna capa', () => {
    const importan = COMPARTIDOS.flatMap((archivo) =>
      importsDe(join(RAIZ, archivo)).filter((destino) => !destino.endsWith('config.js'))
    );
    expect(importan).toEqual([]);
  });
});
