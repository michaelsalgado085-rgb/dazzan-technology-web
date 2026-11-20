import { describe, it, expect } from 'vitest';
import { crearRepositorioProductosJson } from '../assets/js/adaptadores/salida/repositorio-productos-json.js';

function respuesta(ok, cuerpo, status = 200) {
  return { ok, status, json: async () => cuerpo };
}

describe('repositorio de productos en JSON', () => {
  it('lee el catalogo de la ruta configurada', async () => {
    const pedidas = [];
    const obtener = async (ruta) => {
      pedidas.push(ruta);
      return respuesta(true, [{ id: 1 }]);
    };
    const inventario = await crearRepositorioProductosJson(obtener).inventario();
    expect(inventario).toEqual([{ id: 1 }]);
    expect(pedidas).toEqual(['data/productos.json']);
  });

  it('si el servidor responde con error, lo informa con el codigo', async () => {
    const obtener = async () => respuesta(false, null, 404);
    await expect(crearRepositorioProductosJson(obtener).inventario()).rejects.toThrow('404');
  });
});
