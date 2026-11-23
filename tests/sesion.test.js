import { describe, it, expect } from 'vitest';
import {
  ESTADO_SESION,
  erroresDeAcceso,
  estadoSesion,
  puedeUsarPanel
} from '../assets/js/dominio/sesion.js';

// La hora llega por parametro: ninguna prueba depende del reloj.
const VENCE = 10_000;

describe('estadoSesion', () => {
  it('sin sesion guardada no hay nada que renovar', () => {
    expect(estadoSesion(null, 0)).toBe(ESTADO_SESION.NINGUNA);
    expect(estadoSesion({ venceEn: VENCE }, 0)).toBe(ESTADO_SESION.NINGUNA);
  });

  it('lejos del vencimiento la sesion esta vigente', () => {
    expect(estadoSesion({ token: 't', venceEn: VENCE }, VENCE - 61)).toBe(ESTADO_SESION.VIGENTE);
  });

  it('en el ultimo minuto ya se renueva, para no fallar a mitad de una factura', () => {
    expect(estadoSesion({ token: 't', venceEn: VENCE }, VENCE - 60)).toBe(
      ESTADO_SESION.POR_RENOVAR
    );
  });

  it('una sesion vencida se renueva', () => {
    expect(estadoSesion({ token: 't', venceEn: VENCE }, VENCE + 3600)).toBe(
      ESTADO_SESION.POR_RENOVAR
    );
  });
});

describe('erroresDeAcceso', () => {
  it('con correo y clave no hay errores', () => {
    expect(erroresDeAcceso({ correo: 'dazzan@ejemplo.com', clave: 'x' })).toEqual([]);
  });

  it('un correo vacio o sin arroba', () => {
    expect(erroresDeAcceso({ correo: '  ', clave: 'x' })).toEqual(['Escribe tu correo.']);
    expect(erroresDeAcceso({ correo: 'dazzan', clave: 'x' })).toEqual(['Escribe tu correo.']);
  });

  it('una clave vacia', () => {
    expect(erroresDeAcceso({ correo: 'a@b.com', clave: '' })).toEqual(['Escribe tu contraseña.']);
  });

  it('junta los dos errores', () => {
    expect(erroresDeAcceso({})).toHaveLength(2);
  });
});

describe('puedeUsarPanel', () => {
  it('solo el rol administrador entra al panel', () => {
    expect(puedeUsarPanel({ rol: 'administrador' })).toBe(true);
    expect(puedeUsarPanel({ rol: 'vendedor' })).toBe(false);
    expect(puedeUsarPanel(null)).toBe(false);
  });
});
