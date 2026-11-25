import { describe, it, expect } from 'vitest';
import {
  agregarALaFactura,
  cambiarLinea,
  lineaDesdeProducto,
  pagosDeLaFactura,
  productosFacturables,
  quitarDeLaFactura,
  saldoPorPagar
} from '../assets/js/dominio/armar-factura.js';

const LATITUDE = {
  id: 'lat',
  nombre: 'Latitude 7420',
  marca: 'Dell',
  categoria: 'laptops',
  condicion: 'usado',
  precio: 10500,
  stock: 2,
  especificaciones: { CPU: 'Intel Core i7' }
};
const MOUSE = { id: 'mou', nombre: 'Cobra Pro', marca: 'Redragon', categoria: 'mouse', precio: 1890, stock: 1 };
const AGOTADO = { id: 'ago', nombre: 'EliteBook 840', marca: 'HP', categoria: 'laptops', precio: 9800, stock: 0 };

describe('productosFacturables (RF-24)', () => {
  it('ofrece solo lo que tiene existencias', () => {
    expect(productosFacturables([LATITUDE, AGOTADO, MOUSE]).map((p) => p.id)).toEqual(['lat', 'mou']);
  });

  it('busca igual que la tienda, tambien por especificaciones', () => {
    expect(productosFacturables([LATITUDE, MOUSE], 'i7').map((p) => p.id)).toEqual(['lat']);
    expect(productosFacturables([LATITUDE, AGOTADO], 'elitebook')).toEqual([]);
  });
});

describe('lineaDesdeProducto', () => {
  it('copia descripcion, marca y precio, con una unidad y sin descuento', () => {
    expect(lineaDesdeProducto(LATITUDE)).toEqual({
      productoId: 'lat',
      descripcion: 'Latitude 7420',
      marca: 'Dell',
      precio: 10500,
      cantidad: 1,
      descuento: 0,
      numeroSerie: '',
      existencias: 2
    });
  });
});

describe('agregarALaFactura', () => {
  it('un producto nuevo agrega una linea', () => {
    const { lineas, aviso } = agregarALaFactura([], LATITUDE);
    expect(lineas).toHaveLength(1);
    expect(aviso).toBe('');
  });

  it('el mismo producto otra vez suma una unidad en su linea', () => {
    const una = agregarALaFactura([], LATITUDE).lineas;
    const { lineas } = agregarALaFactura(una, LATITUDE);
    expect(lineas).toHaveLength(1);
    expect(lineas[0].cantidad).toBe(2);
  });

  it('no pasa de las existencias y avisa', () => {
    const una = agregarALaFactura([], MOUSE).lineas;
    const { lineas, aviso } = agregarALaFactura(una, MOUSE);
    expect(lineas[0].cantidad).toBe(1);
    expect(aviso).toBe('Solo hay 1 de Cobra Pro en existencia.');
  });

  it('no modifica las lineas que recibe', () => {
    const una = agregarALaFactura([], LATITUDE).lineas;
    agregarALaFactura(una, LATITUDE);
    expect(una[0].cantidad).toBe(1);
  });
});

describe('cambiarLinea y quitarDeLaFactura', () => {
  const lineas = [lineaDesdeProducto(LATITUDE), lineaDesdeProducto(MOUSE)];

  it('cambia solo la linea indicada', () => {
    const cambiadas = cambiarLinea(lineas, 'mou', { descuento: 90, numeroSerie: 'SN1' });
    expect(cambiadas[1]).toMatchObject({ descuento: 90, numeroSerie: 'SN1' });
    expect(cambiadas[0]).toEqual(lineas[0]);
  });

  it('quita la linea indicada', () => {
    expect(quitarDeLaFactura(lineas, 'lat').map((l) => l.productoId)).toEqual(['mou']);
  });

  it('un producto que no esta no cambia nada', () => {
    expect(quitarDeLaFactura(lineas, 'otro')).toEqual(lineas);
    expect(cambiarLinea(lineas, 'otro', { cantidad: 5 })).toEqual(lineas);
  });
});

describe('pagosDeLaFactura', () => {
  it('con un solo metodo, ese metodo cubre el total', () => {
    expect(pagosDeLaFactura([{ metodo: 'efectivo', monto: 0 }], 12390)).toEqual([
      { metodo: 'efectivo', monto: 12390 }
    ]);
  });

  it('con varios metodos se registra lo escrito en cada uno', () => {
    const elegidos = [{ metodo: 'efectivo', monto: 2000 }, { metodo: 'tarjeta', monto: 10390 }];
    expect(pagosDeLaFactura(elegidos, 12390)).toEqual(elegidos);
  });

  it('con total cero no hay pagos (RN-22)', () => {
    expect(pagosDeLaFactura([{ metodo: 'efectivo', monto: 0 }], 0)).toEqual([]);
  });

  it('sin metodos elegidos no hay pagos', () => {
    expect(pagosDeLaFactura([], 500)).toEqual([]);
  });
});

describe('saldoPorPagar (RN-21)', () => {
  it('lo que falta para cubrir el total', () => {
    expect(saldoPorPagar(12390, [{ monto: 2000 }, { monto: 10000 }])).toBe(390);
  });

  it('cero cuando esta cubierto y negativo si se paso', () => {
    expect(saldoPorPagar(100.1, [{ monto: 100.1 }])).toBe(0);
    expect(saldoPorPagar(100, [{ monto: 150 }])).toBe(-50);
  });

  it('un monto vacio cuenta como cero', () => {
    expect(saldoPorPagar(500, [{ monto: Number.NaN }, { monto: 200 }])).toBe(300);
  });
});
