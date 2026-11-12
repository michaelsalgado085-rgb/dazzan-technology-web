import { describe, it, expect } from 'vitest';
import {
  bloquePrecio,
  botonAgregar,
  insigniaStock,
  listaEspecificaciones,
  marcoImagen,
  mensajeSinResultados,
  rejillaProductos,
  tarjetaProducto,
  textoContador
} from '../assets/js/vista-producto.js';

const usado = Object.freeze({
  id: 'lap-001',
  nombre: 'ThinkPad T480s',
  marca: 'Lenovo',
  categoria: 'laptops',
  condicion: 'usado',
  precio: 13800,
  stock: 4,
  descripcion: 'Laptop empresarial robusta.',
  especificaciones: { Memoria: '16 GB DDR4' }
});

describe('insigniaStock', () => {
  it('marca como disponible cuando hay existencias holgadas', () => {
    expect(insigniaStock({ stock: 10 })).toContain('etiqueta--disponible');
  });

  it('avisa de ultimas unidades en el umbral bajo', () => {
    expect(insigniaStock({ stock: 2 })).toContain('Últimas unidades');
  });

  it('marca como agotado cuando el stock es cero', () => {
    expect(insigniaStock({ stock: 0 })).toContain('Agotado');
  });
});

describe('marcoImagen', () => {
  it('usa la fotografia real cuando el producto la declara', () => {
    const html = marcoImagen({ ...usado, imagen: 'assets/img/t480s.webp' });
    expect(html).toContain('<img');
    expect(html).toContain('assets/img/t480s.webp');
  });

  it('cae en el marcador cuando no hay fotografia', () => {
    expect(marcoImagen(usado)).toContain('tarjeta__imagen--vacia');
  });

  it('escapa el nombre dentro del texto alternativo', () => {
    const html = marcoImagen({ ...usado, nombre: '<img onerror=x>' });
    expect(html).not.toContain('<img onerror');
  });
});

describe('bloquePrecio', () => {
  it('muestra solo el precio actual cuando no hay rebaja', () => {
    expect(bloquePrecio(usado)).not.toContain('precio__descuento');
  });

  it('calcula y muestra el porcentaje de rebaja', () => {
    const html = bloquePrecio({ ...usado, precio: 9000, precioAnterior: 12000 });
    expect(html).toContain('-25%');
  });
});

describe('listaEspecificaciones', () => {
  it('construye una lista de definiciones con cada par', () => {
    expect(listaEspecificaciones(usado)).toContain('<dt>Memoria</dt>');
  });

  it('devuelve cadena vacia cuando no hay ficha tecnica', () => {
    expect(listaEspecificaciones({ ...usado, especificaciones: {} })).toBe('');
  });

  it('tolera un producto sin la propiedad especificaciones', () => {
    expect(listaEspecificaciones({ nombre: 'x' })).toBe('');
  });
});

describe('botonAgregar', () => {
  it('queda habilitado cuando hay existencias', () => {
    expect(botonAgregar(usado)).not.toContain('disabled');
  });

  it('se deshabilita cuando el producto esta agotado', () => {
    const html = botonAgregar({ ...usado, stock: 0 });
    expect(html).toContain('disabled');
    expect(html).toContain('Sin existencias');
  });
});

describe('tarjetaProducto', () => {
  it('incluye nombre, marca y texto de garantia', () => {
    const html = tarjetaProducto(usado);
    expect(html).toContain('ThinkPad T480s');
    expect(html).toContain('Lenovo');
    expect(html).toContain('Garantía de 3 meses');
  });

  it('da los mismos tres meses a un equipo de mas de L 15,000', () => {
    const html = tarjetaProducto({ ...usado, precio: 32500 });
    expect(html).toContain('Garantía de 3 meses de la tienda');
  });

  it('da los mismos tres meses a un producto nuevo', () => {
    const html = tarjetaProducto({ ...usado, condicion: 'nuevo' });
    expect(html).toContain('Garantía de 3 meses de la tienda');
    expect(html).not.toContain('fabricante');
  });

  it('escapa el nombre para impedir inyeccion de HTML', () => {
    const html = tarjetaProducto({ ...usado, nombre: '<script>alert(1)</script>' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('mensajeSinResultados', () => {
  it('menciona el termino buscado', () => {
    expect(mensajeSinResultados('macbook')).toContain('macbook');
  });

  it('usa el texto de categoria vacia cuando no hubo busqueda', () => {
    expect(mensajeSinResultados('')).toContain('No hay productos');
  });
});

describe('rejillaProductos', () => {
  it('genera una tarjeta por producto', () => {
    const html = rejillaProductos([usado, { ...usado, id: 'lap-002' }]);
    expect(html.match(/<article/g)).toHaveLength(2);
  });

  it('devuelve el aviso cuando la lista esta vacia', () => {
    expect(rejillaProductos([], 'xyz')).toContain('aviso-vacio');
  });
});

describe('textoContador', () => {
  it('usa singular con un solo producto', () => {
    expect(textoContador(1)).toBe('1 producto');
  });

  it('usa plural con varios productos', () => {
    expect(textoContador(7)).toBe('7 productos');
  });

  it('usa plural con cero productos', () => {
    expect(textoContador(0)).toBe('0 productos');
  });
});
