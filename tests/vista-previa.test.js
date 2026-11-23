import { describe, it, expect } from 'vitest';
import { productoParaVistaPrevia } from '../assets/js/adaptadores/entrada/vista-previa.js';
import { tarjetaProducto } from '../assets/js/adaptadores/entrada/vista-producto.js';

const A_MEDIAS = {
  nombre: '',
  marca: '  ',
  categoria: 'laptops',
  precio: Number.NaN,
  precioAnterior: null,
  stock: Number.NaN,
  especificaciones: {}
};

describe('productoParaVistaPrevia', () => {
  it('lo que falta se rellena con un texto guia', () => {
    const previo = productoParaVistaPrevia(A_MEDIAS);
    expect(previo.nombre).toBe('Nombre del producto');
    expect(previo.marca).toBe('Marca');
  });

  it('un numero a medio escribir vale cero, para que la tarjeta no falle', () => {
    const previo = productoParaVistaPrevia(A_MEDIAS);
    expect(previo.precio).toBe(0);
    expect(previo.stock).toBe(0);
    expect(() => tarjetaProducto(previo)).not.toThrow();
  });

  it('respeta lo que ya se escribio', () => {
    const previo = productoParaVistaPrevia({ ...A_MEDIAS, nombre: 'Latitude 7420', precio: 10500, stock: 2 });
    expect(previo).toMatchObject({ nombre: 'Latitude 7420', precio: 10500, stock: 2 });
  });

  it('un precio anterior a medio escribir no se muestra', () => {
    expect(productoParaVistaPrevia({ ...A_MEDIAS, precioAnterior: Number.NaN }).precioAnterior).toBeNull();
    expect(productoParaVistaPrevia({ ...A_MEDIAS, precioAnterior: 12000 }).precioAnterior).toBe(12000);
  });
});

describe('productoParaVistaPrevia: fotos', () => {
  it('usa la direccion local de las fotos nuevas y la publica de las guardadas', () => {
    const previo = productoParaVistaPrevia(A_MEDIAS, ['https://x/a.jpg', { archivo: {}, url: 'blob:b' }]);
    expect(previo.fotos).toEqual(['https://x/a.jpg', 'blob:b']);
  });

  it('la tarjeta muestra la portada elegida', () => {
    const html = tarjetaProducto(productoParaVistaPrevia(A_MEDIAS, ['blob:portada', 'blob:otra']));
    expect(html).toContain('src="blob:portada"');
    expect(html).toContain('2 fotos');
  });

  it('sin fotos la tarjeta muestra la inicial', () => {
    expect(tarjetaProducto(productoParaVistaPrevia(A_MEDIAS))).toContain('tarjeta__imagen--vacia');
  });
});
