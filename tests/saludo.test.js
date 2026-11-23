import { describe, it, expect } from 'vitest';
import { saludoSegunHora } from '../assets/js/dominio/saludo.js';

describe('saludoSegunHora (RN-34)', () => {
  it('saluda segun la franja del dia', () => {
    expect(saludoSegunHora(8)).toBe('Buenos días');
    expect(saludoSegunHora(15)).toBe('Buenas tardes');
    expect(saludoSegunHora(21)).toBe('Buenas noches');
  });

  it('respeta los limites de cada franja', () => {
    expect(saludoSegunHora(4)).toBe('Buenas noches');
    expect(saludoSegunHora(5)).toBe('Buenos días');
    expect(saludoSegunHora(11)).toBe('Buenos días');
    expect(saludoSegunHora(12)).toBe('Buenas tardes');
    expect(saludoSegunHora(18)).toBe('Buenas tardes');
    expect(saludoSegunHora(19)).toBe('Buenas noches');
  });

  it('la medianoche y la ultima hora del dia son de noche', () => {
    expect(saludoSegunHora(0)).toBe('Buenas noches');
    expect(saludoSegunHora(23)).toBe('Buenas noches');
  });

});

describe('saludoSegunHora: casos de error y configuracion', () => {
  it('con una hora invalida saluda sin franja', () => {
    expect(saludoSegunHora(24)).toBe('Hola');
    expect(saludoSegunHora(-1)).toBe('Hola');
    expect(saludoSegunHora(Number.NaN)).toBe('Hola');
    expect(saludoSegunHora(undefined)).toBe('Hola');
  });

  it('usa los horarios que reciba', () => {
    const horarios = { INICIO_MANANA: 6, INICIO_TARDE: 13, INICIO_NOCHE: 18 };
    expect(saludoSegunHora(5, horarios)).toBe('Buenas noches');
    expect(saludoSegunHora(18, horarios)).toBe('Buenas noches');
  });
});
