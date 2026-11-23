import { describe, it, expect } from 'vitest';
import { mostrarAccesoAlPanel } from '../assets/js/adaptadores/entrada/acceso-panel.js';

describe('mostrarAccesoAlPanel', () => {
  it('con sesion guardada el boton aparece', () => {
    const boton = { hidden: true };
    mostrarAccesoAlPanel(boton, { leer: () => ({ token: 't' }) });
    expect(boton.hidden).toBe(false);
  });

  it('un cliente, sin sesion, nunca lo ve', () => {
    const boton = { hidden: false };
    mostrarAccesoAlPanel(boton, { leer: () => null });
    expect(boton.hidden).toBe(true);
  });

  it('si el navegador no deja leer el almacenamiento, queda oculto', () => {
    const boton = { hidden: false };
    mostrarAccesoAlPanel(boton, {
      leer: () => {
        throw new Error('bloqueado');
      }
    });
    expect(boton.hidden).toBe(true);
  });
});
