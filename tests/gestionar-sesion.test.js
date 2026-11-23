import { describe, it, expect } from 'vitest';
import { cerrarSesion, iniciarSesion, sesionActiva } from '../assets/js/casos-de-uso/gestionar-sesion.js';

const SESION = { token: 'token', renovacion: 'renovar', venceEn: 5000 };
const CREDENCIALES = { correo: 'dazzantech@ejemplo.com', clave: 'secreta' };

// Falsos de los tres puertos. Registran lo que se les pidio.
function falsos({ perfil = { nombre: 'Julio', rol: 'administrador' }, guardada = null } = {}) {
  const registro = { cerradas: [], guardadas: [], borrada: false };
  let actual = guardada;
  return {
    registro,
    autenticacion: {
      iniciarSesion: async () => SESION,
      renovar: async () => ({ ...SESION, token: 'nuevo', venceEn: 9000 }),
      cerrarSesion: async (token) => registro.cerradas.push(token)
    },
    perfiles: { miPerfil: async () => perfil },
    almacen: {
      leer: () => actual,
      guardar: (sesion) => {
        actual = sesion;
        registro.guardadas.push(sesion);
      },
      borrar: () => {
        actual = null;
        registro.borrada = true;
      }
    }
  };
}

describe('iniciarSesion: validar antes de llamar', () => {
  it('un administrador entra y su sesion queda guardada', async () => {
    const dependencias = falsos();
    const resultado = await iniciarSesion(CREDENCIALES, dependencias);
    expect(resultado.entro).toBe(true);
    expect(dependencias.registro.guardadas).toEqual([SESION]);
  });

  it('con el formulario incompleto ni siquiera llama al servidor', async () => {
    const dependencias = falsos();
    dependencias.autenticacion.iniciarSesion = async () => {
      throw new Error('no deberia llamarse');
    };
    const resultado = await iniciarSesion({ correo: '', clave: '' }, dependencias);
    expect(resultado.errores).toHaveLength(2);
  });

});

describe('iniciarSesion: cuando no se puede entrar', () => {
  it('una clave equivocada da un mensaje claro y no guarda nada', async () => {
    const dependencias = falsos();
    dependencias.autenticacion.iniciarSesion = async () => {
      throw Object.assign(new Error('x'), { codigo: 'credenciales' });
    };
    const resultado = await iniciarSesion(CREDENCIALES, dependencias);
    expect(resultado.errores).toEqual(['El correo o la contraseña no son correctos.']);
    expect(dependencias.registro.guardadas).toEqual([]);
  });

  it('una cuenta sin rol de administrador sale de inmediato', async () => {
    const dependencias = falsos({ perfil: null });
    const resultado = await iniciarSesion(CREDENCIALES, dependencias);
    expect(resultado.errores).toEqual(['Esta cuenta no tiene acceso al panel.']);
    expect(dependencias.registro.cerradas).toEqual(['token']);
    expect(dependencias.registro.guardadas).toEqual([]);
  });

  it('sin conexion el error llega a la pantalla', async () => {
    const dependencias = falsos();
    dependencias.autenticacion.iniciarSesion = async () => {
      throw new Error('sin red');
    };
    await expect(iniciarSesion(CREDENCIALES, dependencias)).rejects.toThrow('sin red');
  });
});

describe('sesionActiva', () => {
  it('sin sesion guardada hay que entrar', async () => {
    expect(await sesionActiva(falsos(), 0)).toBeNull();
  });

  it('una sesion vigente se usa sin renovar el token', async () => {
    const dependencias = falsos({ guardada: SESION });
    expect(await sesionActiva(dependencias, 100)).toBe(SESION);
  });

  it('una sesion vigente renueva su marca, para que Safari no la pierda a los 7 dias', async () => {
    const dependencias = falsos({ guardada: SESION });
    await sesionActiva(dependencias, 100);
    expect(dependencias.registro.guardadas).toEqual([SESION]);
  });

});

describe('sesionActiva: renovar', () => {
  it('una sesion por vencer se renueva y se guarda la nueva', async () => {
    const dependencias = falsos({ guardada: SESION });
    const sesion = await sesionActiva(dependencias, 4990);
    expect(sesion.token).toBe('nuevo');
    expect(dependencias.registro.guardadas[0].token).toBe('nuevo');
  });

  it('si no se puede renovar, se borra y hay que entrar de nuevo', async () => {
    const dependencias = falsos({ guardada: SESION });
    dependencias.autenticacion.renovar = async () => {
      throw new Error('renovacion revocada');
    };
    expect(await sesionActiva(dependencias, 6000)).toBeNull();
    expect(dependencias.registro.borrada).toBe(true);
  });
});

describe('cerrarSesion', () => {
  it('borra la sesion local y la invalida en el servidor', async () => {
    const dependencias = falsos({ guardada: SESION });
    await cerrarSesion(dependencias);
    expect(dependencias.registro.borrada).toBe(true);
    expect(dependencias.registro.cerradas).toEqual(['token']);
  });

  it('sin conexion igual borra la sesion local y no lanza error', async () => {
    const dependencias = falsos({ guardada: SESION });
    dependencias.autenticacion.cerrarSesion = async () => {
      throw new Error('sin red');
    };
    await expect(cerrarSesion(dependencias)).resolves.toBeUndefined();
    expect(dependencias.registro.borrada).toBe(true);
  });
});
