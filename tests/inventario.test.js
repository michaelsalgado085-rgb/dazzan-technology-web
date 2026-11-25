import { describe, it, expect } from 'vitest';
import {
  buscarDuplicado,
  condicionSugerida,
  descripcionSugerida,
  erroresDeProducto,
  especificacionesComoTexto,
  leerEspecificaciones,
  ordenarInventario,
  resumenInventario
} from '../assets/js/dominio/inventario.js';

// Reglas del inventario confirmadas por Michael el 22 de noviembre de 2026.

const VALIDO = {
  nombre: 'ThinkPad T480s',
  marca: 'Lenovo',
  categoria: 'laptops',
  condicion: 'usado',
  precio: 13900,
  precioAnterior: null,
  stock: 2
};

describe('condicionSugerida, regla 2', () => {
  it('las computadoras se sugieren usadas', () => {
    expect(condicionSugerida('laptops')).toBe('usado');
    expect(condicionSugerida('escritorio')).toBe('usado');
  });

  it('los perifericos se sugieren nuevos', () => {
    expect(condicionSugerida('mouse')).toBe('nuevo');
    expect(condicionSugerida('auriculares')).toBe('nuevo');
  });
});

describe('especificaciones, regla 7', () => {
  it('una por linea, con dos puntos', () => {
    expect(leerEspecificaciones('Procesador: Intel i5\nMemoria: 8 GB')).toEqual({
      Procesador: 'Intel i5',
      Memoria: '8 GB'
    });
  });

  it('el valor puede llevar dos puntos y las lineas vacias se ignoran', () => {
    expect(leerEspecificaciones('\nPantalla: 16:9\n\n')).toEqual({ Pantalla: '16:9' });
  });

  it('ida y vuelta: lo que se guarda se puede volver a editar igual', () => {
    const texto = 'Procesador: Intel i5\nMemoria: 8 GB';
    expect(especificacionesComoTexto(leerEspecificaciones(texto))).toBe(texto);
  });

  it('una linea sin dos puntos se avisa, no se pierde en silencio', () => {
    expect(erroresDeProducto(VALIDO, 'Memoria: 8 GB\nSSD 256')).toEqual([
      'La especificación "SSD 256" necesita dos puntos, por ejemplo "Memoria: 8 GB".'
    ]);
  });
});

describe('erroresDeProducto: lo que se escribe, regla 1', () => {
  it('un producto completo no tiene errores', () => {
    expect(erroresDeProducto(VALIDO)).toEqual([]);
  });

  it('sin nombre, sin marca, sin categoria ni condicion', () => {
    const errores = erroresDeProducto({ ...VALIDO, nombre: ' ', marca: '', categoria: '', condicion: '' });
    expect(errores).toEqual([
      'Escribe el nombre del producto.',
      'Escribe la marca.',
      'Elige una categoría.',
      'Elige si es nuevo o usado.'
    ]);
  });
});

describe('erroresDeProducto: precios y existencias, reglas 3 a 5', () => {
  it('un precio vacio o negativo', () => {
    expect(erroresDeProducto({ ...VALIDO, precio: NaN })[0]).toContain('regla 3');
    expect(erroresDeProducto({ ...VALIDO, precio: -1 })[0]).toContain('regla 3');
  });

  it('precio cero si se acepta', () => {
    expect(erroresDeProducto({ ...VALIDO, precio: 0 })).toEqual([]);
  });

  it('el precio anterior debe ser mayor que el precio', () => {
    expect(erroresDeProducto({ ...VALIDO, precioAnterior: 15500 })).toEqual([]);
    expect(erroresDeProducto({ ...VALIDO, precioAnterior: 13900 })[0]).toContain('regla 4');
  });

  it('existencias con decimales o negativas', () => {
    expect(erroresDeProducto({ ...VALIDO, stock: 1.5 })[0]).toContain('regla 5');
    expect(erroresDeProducto({ ...VALIDO, stock: -1 })[0]).toContain('regla 5');
  });

  it('existencias en cero si se aceptan: el producto queda agotado', () => {
    expect(erroresDeProducto({ ...VALIDO, stock: 0 })).toEqual([]);
  });
});

describe('buscarDuplicado, regla 8', () => {
  const inventario = [{ ...VALIDO, id: 'a1' }];

  it('mismo nombre y marca, sin importar mayusculas ni espacios', () => {
    const nuevo = { ...VALIDO, nombre: ' thinkpad t480s ', marca: 'LENOVO' };
    expect(buscarDuplicado(nuevo, inventario)?.id).toBe('a1');
  });

  it('al editar, el propio producto no cuenta como duplicado', () => {
    expect(buscarDuplicado({ ...VALIDO, id: 'a1' }, inventario)).toBeNull();
  });

  it('otro modelo de la misma marca no es duplicado', () => {
    expect(buscarDuplicado({ ...VALIDO, nombre: 'ThinkPad T490' }, inventario)).toBeNull();
  });
});

describe('ordenarInventario, regla 6', () => {
  it('lo disponible primero, por nombre, y lo agotado al final', () => {
    const ordenado = ordenarInventario([
      { nombre: 'Zeta', stock: 0 },
      { nombre: 'Beta', stock: 3 },
      { nombre: 'Alfa', stock: 1 }
    ]);
    expect(ordenado.map((producto) => producto.nombre)).toEqual(['Alfa', 'Beta', 'Zeta']);
  });
});

describe('resumenInventario', () => {
  it('cuenta modelos, suma unidades y cuenta agotados', () => {
    const resumen = resumenInventario([{ stock: 2 }, { stock: 0 }, { stock: 5 }]);
    expect(resumen).toEqual({ productos: 3, unidades: 7, agotados: 1 });
  });

  it('con el inventario vacio todo es cero', () => {
    expect(resumenInventario([])).toEqual({ productos: 0, unidades: 0, agotados: 0 });
  });
});

describe('descripcionSugerida (RN-38)', () => {
  const USADO = 'Equipo usado en excelente condición con garantía.';
  const NUEVO = 'Producto nuevo y original, con garantía de la tienda.';

  it('una descripcion vacia toma el texto de la condicion', () => {
    expect(descripcionSugerida('', 'usado')).toBe(USADO);
    expect(descripcionSugerida('   ', 'nuevo')).toBe(NUEVO);
    expect(descripcionSugerida(undefined, 'usado')).toBe(USADO);
  });

  it('al cambiar la condicion cambia el texto automatico', () => {
    expect(descripcionSugerida(USADO, 'nuevo')).toBe(NUEVO);
    expect(descripcionSugerida(NUEVO, 'usado')).toBe(USADO);
  });

  it('lo escrito a mano no se pisa', () => {
    expect(descripcionSugerida('Con cargador original', 'nuevo')).toBe('Con cargador original');
  });

  it('una condicion desconocida deja la descripcion como estaba', () => {
    expect(descripcionSugerida('', 'reacondicionado')).toBe('');
    expect(descripcionSugerida(USADO, 'reacondicionado')).toBe(USADO);
  });
});
