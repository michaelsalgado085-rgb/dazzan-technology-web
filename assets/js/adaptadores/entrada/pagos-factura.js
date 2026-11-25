import { pagosDeLaFactura } from '../../dominio/armar-factura.js';
import { aNumero } from './formulario-producto.js';
import { mensajeSaldo, opcionesPago } from './vista-factura.js';

/**
 * La parte de pagos de la factura (RN-14, RN-20 a RN-23): que metodos se
 * eligieron y cuanto en cada uno. Con un solo metodo no se escribe monto:
 * cubre el total.
 */
export function crearPagosFactura(contenedor, saldo) {
  contenedor.innerHTML = opcionesPago();
  const campoMonto = (metodo) => contenedor.querySelector(`[data-monto="${metodo}"]`);
  const elegidos = () =>
    [...contenedor.querySelectorAll('input[name="metodo"]:checked')].map((casilla) => ({
      metodo: casilla.value,
      monto: aNumero(campoMonto(casilla.value).value)
    }));

  return {
    pintar(total) {
      const lista = elegidos();
      for (const casilla of contenedor.querySelectorAll('input[name="metodo"]')) {
        campoMonto(casilla.value).hidden = !(lista.length > 1 && casilla.checked);
      }
      saldo.textContent = mensajeSaldo(total, lista);
    },
    pagos: (total) => pagosDeLaFactura(elegidos(), total),
    limpiar() {
      for (const casilla of contenedor.querySelectorAll('input[name="metodo"]')) {
        casilla.checked = false;
        campoMonto(casilla.value).value = '';
        campoMonto(casilla.value).hidden = true;
      }
      saldo.textContent = '';
    }
  };
}
