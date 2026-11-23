import {
  condicionSugerida,
  especificacionesComoTexto,
  leerEspecificaciones
} from '../../dominio/inventario.js';

/**
 * Lee y llena el formulario de producto. Traduce lo que escribe el cliente
 * (texto) a los datos que entiende el dominio (numeros, objeto de
 * especificaciones), y al reves al editar.
 */

/**
 * Un campo vacio no es cero: es un dato que falta, y el dominio lo rechaza.
 * Acepta coma decimal, que es como muchos la escriben en el telefono.
 */
export function aNumero(texto = '') {
  const limpio = texto.trim().replace(',', '.');
  return limpio === '' ? NaN : Number(limpio);
}

function campo(formulario, nombre) {
  return formulario.elements.namedItem(nombre);
}

export function leerFormulario(formulario) {
  const valor = (nombre) => campo(formulario, nombre).value;
  const textoEspecificaciones = valor('especificaciones');
  const precioAnterior = valor('precioAnterior').trim();
  return {
    textoEspecificaciones,
    producto: {
      id: valor('id') || undefined,
      nombre: valor('nombre'),
      marca: valor('marca'),
      categoria: valor('categoria'),
      condicion: valor('condicion'),
      precio: aNumero(valor('precio')),
      precioAnterior: precioAnterior === '' ? null : aNumero(precioAnterior),
      stock: aNumero(valor('stock')),
      descripcion: valor('descripcion'),
      especificaciones: leerEspecificaciones(textoEspecificaciones)
    }
  };
}

export function llenarFormulario(formulario, producto) {
  const poner = (nombre, valor) => {
    campo(formulario, nombre).value = valor ?? '';
  };
  poner('id', producto.id);
  poner('nombre', producto.nombre);
  poner('marca', producto.marca);
  poner('categoria', producto.categoria);
  poner('condicion', producto.condicion);
  poner('precio', producto.precio);
  poner('precioAnterior', producto.precioAnterior);
  poner('stock', producto.stock);
  poner('descripcion', producto.descripcion);
  poner('especificaciones', especificacionesComoTexto(producto.especificaciones));
}

/**
 * RN-01: al elegir la categoria se sugiere la condicion. Solo al agregar: al
 * editar se respeta lo que ya tenia el producto.
 */
export function sugerirCondicionAlElegirCategoria(formulario) {
  campo(formulario, 'categoria').addEventListener('change', (evento) => {
    if (!campo(formulario, 'id').value) {
      campo(formulario, 'condicion').value = condicionSugerida(evento.target.value);
    }
  });
}
