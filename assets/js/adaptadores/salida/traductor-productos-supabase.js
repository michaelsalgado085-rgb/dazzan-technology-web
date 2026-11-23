import { rutaDeFoto, urlPublica } from './fotos-supabase.js';

/**
 * Adapter: Postgres nombra en snake_case y usa null; el dominio espera
 * camelCase y la clave ausente, igual que el catalogo JSON. La traduccion en
 * los dos sentidos vive solo aqui, para que el dominio no se entere de como
 * guarda la base.
 */

export function filaAProducto(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    marca: fila.marca,
    categoria: fila.categoria_id,
    condicion: fila.condicion,
    precio: Number(fila.precio),
    precioAnterior: fila.precio_anterior === null ? undefined : Number(fila.precio_anterior),
    stock: fila.stock,
    descripcion: fila.descripcion,
    especificaciones: fila.especificaciones,
    // La base guarda rutas; la tienda necesita direcciones completas.
    fotos: (fila.fotos ?? []).map((ruta) => urlPublica(ruta))
  };
}

export function productoAFila(producto) {
  return {
    nombre: producto.nombre.trim(),
    marca: producto.marca.trim(),
    categoria_id: producto.categoria,
    condicion: producto.condicion,
    precio: producto.precio,
    precio_anterior: producto.precioAnterior ?? null,
    stock: producto.stock,
    descripcion: producto.descripcion?.trim() ?? '',
    especificaciones: producto.especificaciones ?? {},
    fotos: (producto.fotos ?? []).map((url) => rutaDeFoto(url))
  };
}
