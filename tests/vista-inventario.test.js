import { describe, it, expect } from 'vitest';
import {
  filaInventario,
  listaInventario,
  mensajeDuplicado,
  miniaturaInventario,
  miniaturasFotos,
  opcionesCategoria,
  tarjetasResumen
} from '../assets/js/adaptadores/entrada/vista-inventario.js';
import { aNumero } from '../assets/js/adaptadores/entrada/formulario-producto.js';

const PRODUCTO = { id: 'p1', nombre: 'T480s', marca: 'Lenovo', categoria: 'laptops', precio: 13900, stock: 2 };

describe('vista del inventario', () => {
  it('una fila muestra nombre, marca, categoria, precio y existencias', () => {
    const html = filaInventario(PRODUCTO);
    expect(html).toContain('Lenovo · Laptops');
    expect(html).toContain('2 en existencia');
    expect(html).toContain('data-id="p1"');
  });

  it('regla 6: lo agotado se marca y se ve distinto', () => {
    const html = filaInventario({ ...PRODUCTO, stock: 0 });
    expect(html).toContain('Agotado');
    expect(html).toContain('inventario__fila--agotado');
  });

  it('escapa lo que escribio el cliente', () => {
    expect(filaInventario({ ...PRODUCTO, nombre: '<img onerror=x>' })).not.toContain('<img');
  });

});

describe('vista del inventario: textos', () => {
  it('sin productos, invita a cargar el primero o avisa que no hubo coincidencias', () => {
    expect(listaInventario([])).toContain('Agregar producto');
    expect(listaInventario([], 'xyz')).toContain('"xyz"');
  });

  it('las categorias salen con su nombre y una opcion vacia primero', () => {
    const html = opcionesCategoria();
    expect(html.startsWith('<option value="">')).toBe(true);
    expect(html).toContain('<option value="escritorio">Computadoras de escritorio</option>');
  });

  it('el aviso de duplicado dice cuantas hay', () => {
    expect(mensajeDuplicado(PRODUCTO)).toBe('Ya existe "T480s" de Lenovo, con 2 en existencia.');
  });
});

describe('aNumero: lo que se escribe en el telefono', () => {
  it('acepta punto o coma decimal', () => {
    expect(aNumero('13900')).toBe(13900);
    expect(aNumero('1150,50')).toBe(1150.5);
  });

  it('un campo vacio no es cero: es un dato que falta', () => {
    expect(aNumero('  ')).toBeNaN();
  });
});

describe('vista del inventario: resumen y existencias', () => {
  it('la pastilla de existencias toma el color de su estado', () => {
    expect(filaInventario({ ...PRODUCTO, stock: 10 })).toContain('inventario__stock--disponible');
    expect(filaInventario({ ...PRODUCTO, stock: 2 })).toContain('inventario__stock--ultimas-unidades');
  });

  it('el resumen usa singular y plural, y resalta los agotados', () => {
    const html = tarjetasResumen({ productos: 1, unidades: 4, agotados: 2 });
    expect(html).toContain('<dt>Modelo</dt><dd>1</dd>');
    expect(html).toContain('<dt>Unidades</dt><dd>4</dd>');
    expect(html).toContain('resumen__tarjeta--alerta');
  });

  it('sin agotados no hay alerta', () => {
    expect(tarjetasResumen({ productos: 2, unidades: 4, agotados: 0 })).not.toContain('--alerta');
  });
});

describe('miniaturasFotos', () => {
  it('la primera dice Portada y las demas ofrecen serlo', () => {
    const html = miniaturasFotos(['https://f/a.jpg', { url: 'blob:x', archivo: {} }]);
    expect(html).toContain('<span class="fotos__portada">Portada</span>');
    expect(html).toContain('data-accion="portada" data-indice="1"');
    expect(html).toContain('src="blob:x"');
  });

  it('cada foto se puede quitar y dice cual es', () => {
    expect(miniaturasFotos(['https://f/a.jpg'])).toContain('aria-label="Quitar foto 1"');
  });

  it('sin fotos no hay miniaturas', () => {
    expect(miniaturasFotos([])).toBe('');
  });
});

describe('miniaturaInventario', () => {
  it('con fotos muestra la portada', () => {
    const html = miniaturaInventario({ ...PRODUCTO, fotos: ['https://x/a.jpg', 'https://x/b.jpg'] });
    expect(html).toContain('src="https://x/a.jpg"');
    expect(html).not.toContain('b.jpg');
  });

  it('sin fotos muestra la inicial de la categoria', () => {
    expect(miniaturaInventario(PRODUCTO)).toContain('>L<');
    expect(miniaturaInventario({ ...PRODUCTO, fotos: [] })).toContain('inventario__inicial');
  });

  it('una categoria desconocida no rompe la fila', () => {
    expect(miniaturaInventario({ ...PRODUCTO, categoria: 'otra' })).toContain('>?<');
  });

  it('escapa la direccion de la foto', () => {
    expect(miniaturaInventario({ ...PRODUCTO, fotos: ['x"onerror="y'] })).not.toContain('"onerror="');
  });
});
