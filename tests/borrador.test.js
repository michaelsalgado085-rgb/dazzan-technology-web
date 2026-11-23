import { describe, it, expect } from 'vitest';
import { hayCambios } from '../assets/js/dominio/borrador.js';

const VACIO = { campos: { id: '', nombre: '', stock: '1' }, fotos: [] };

describe('hayCambios (RN-35)', () => {
  it('el formulario tal como se abrio no tiene cambios', () => {
    expect(hayCambios(VACIO, { campos: { ...VACIO.campos }, fotos: [] })).toBe(false);
  });

  it('escribir en un campo es un cambio', () => {
    expect(hayCambios(VACIO, { ...VACIO, campos: { ...VACIO.campos, nombre: 'Latitude 7420' } })).toBe(true);
  });

  it('espacios sueltos no cuentan como cambio', () => {
    expect(hayCambios(VACIO, { ...VACIO, campos: { ...VACIO.campos, nombre: '   ' } })).toBe(false);
  });

  it('un campo que falta de un lado vale como vacio', () => {
    expect(hayCambios(VACIO, { ...VACIO, campos: { id: '', stock: '1' } })).toBe(false);
    expect(hayCambios(VACIO, { ...VACIO, campos: { ...VACIO.campos, marca: 'Dell' } })).toBe(true);
  });
});

describe('hayCambios: fotos', () => {
  const GUARDADO = { campos: { id: 'p1' }, fotos: ['a.jpg', 'b.jpg'] };

  it('agregar una foto nueva es un cambio', () => {
    expect(hayCambios(VACIO, { ...VACIO, fotos: [{ archivo: {} }] })).toBe(true);
  });

  it('quitar una foto guardada es un cambio', () => {
    expect(hayCambios(GUARDADO, { ...GUARDADO, fotos: ['a.jpg'] })).toBe(true);
  });

  it('cambiar la portada es un cambio', () => {
    expect(hayCambios(GUARDADO, { ...GUARDADO, fotos: ['b.jpg', 'a.jpg'] })).toBe(true);
  });

  it('las mismas fotos en el mismo orden no son un cambio', () => {
    expect(hayCambios(GUARDADO, { ...GUARDADO, fotos: ['a.jpg', 'b.jpg'] })).toBe(false);
  });

  it('sin lista de fotos se toma como vacia', () => {
    expect(hayCambios({ campos: {} }, { campos: {} })).toBe(false);
  });
});
