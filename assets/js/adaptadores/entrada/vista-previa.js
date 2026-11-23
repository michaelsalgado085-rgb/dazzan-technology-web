import { leerFormulario } from './formulario-producto.js';
import { tarjetaProducto } from './vista-producto.js';

/**
 * Vista previa del producto en la computadora: mientras Julio llena el
 * formulario, al lado se ve la tarjeta tal como saldra en la tienda. Usa la
 * misma tarjetaProducto de la tienda, asi que no puede verse distinta.
 */

function numeroOCero(valor) {
  return Number.isFinite(valor) ? valor : 0;
}

/**
 * Un formulario a medio llenar no es un producto valido, pero la tarjeta
 * igual tiene que poder pintarse: lo que falta se rellena con un texto guia y
 * los numeros a medio escribir valen cero. Las fotos nuevas aun no tienen
 * direccion publica: se muestran con la local.
 */
export function productoParaVistaPrevia(producto, fotos = []) {
  return {
    ...producto,
    id: producto.id ?? 'vista-previa',
    nombre: producto.nombre?.trim() || 'Nombre del producto',
    marca: producto.marca?.trim() || 'Marca',
    precio: numeroOCero(producto.precio),
    precioAnterior: Number.isFinite(producto.precioAnterior) ? producto.precioAnterior : null,
    stock: numeroOCero(producto.stock),
    fotos: fotos.map((foto) => (typeof foto === 'string' ? foto : foto.url))
  };
}

export function crearVistaPrevia({ contenedor, formulario, editorFotos }) {
  const actualizar = () => {
    const { producto } = leerFormulario(formulario);
    contenedor.innerHTML = tarjetaProducto(productoParaVistaPrevia(producto, editorFotos.fotos()));
  };
  formulario.addEventListener('input', actualizar);
  formulario.addEventListener('change', actualizar);
  return { actualizar };
}
