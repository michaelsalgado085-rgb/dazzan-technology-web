import { describe, it, expect } from 'vitest';
import { emitirFactura } from '../assets/js/casos-de-uso/emitir-factura.js';

// Falso del puerto RepositorioFacturas: recuerda lo que le pidieron guardar y
// asigna numeros como lo haria la base de datos.
function repositorioFalso(proximoNumero = 769) {
  const guardadas = [];
  return {
    guardadas,
    emitir: async (factura) => {
      const emitida = { ...factura, numero: proximoNumero + guardadas.length };
      guardadas.push(emitida);
      return emitida;
    }
  };
}

const VALIDA = {
  cliente: { nombre: 'Ana Pérez' },
  lineas: [{ descripcion: 'Kumara K552', precio: 1150, cantidad: 2, existencias: 5 }],
  descuentoAdicional: 100,
  pagos: [{ metodo: 'efectivo', monto: 2200 }]
};

describe('emitirFactura: factura valida', () => {
  it('una factura valida se guarda una vez y vuelve con su numero', async () => {
    const repositorio = repositorioFalso();
    const resultado = await emitirFactura(VALIDA, repositorio);
    expect(resultado.emitida).toBe(true);
    expect(resultado.factura.numero).toBe(769);
    expect(repositorio.guardadas).toHaveLength(1);
  });

  it('el repositorio recibe los totales calculados por el dominio', async () => {
    const repositorio = repositorioFalso();
    await emitirFactura(VALIDA, repositorio);
    expect(repositorio.guardadas[0]).toMatchObject({ subtotal: 2300, total: 2200 });
  });

});

describe('emitirFactura: cuando algo falla', () => {
  it('una factura con errores no llega al repositorio ni gasta un numero', async () => {
    const repositorio = repositorioFalso();
    const resultado = await emitirFactura({ ...VALIDA, cliente: { nombre: '' } }, repositorio);
    expect(resultado).toEqual({
      emitida: false,
      errores: ['El nombre del cliente es obligatorio (RN-11).']
    });
    expect(repositorio.guardadas).toHaveLength(0);
  });

  it('si el repositorio falla, el error llega a quien llamo', async () => {
    const repositorio = {
      emitir: async () => {
        throw new Error('sin conexion');
      }
    };
    await expect(emitirFactura(VALIDA, repositorio)).rejects.toThrow('sin conexion');
  });
});
