import { CONFIG } from '../../config.js';
import { dimensionesReducidas } from '../../dominio/fotos.js';

/**
 * Achica una foto en el telefono antes de subirla. Una foto del iPhone pesa
 * de 3 a 8 MB; achicada a 1600 px de lado mayor queda en unos 200 KB, se ve
 * nitida en cualquier pantalla y la tienda carga rapido con datos moviles.
 *
 * JPEG y no WebP: Safari no sabe guardar WebP desde un canvas.
 */
export async function achicarFoto(archivo) {
  const imagen = await createImageBitmap(archivo);
  const { ancho, alto } = dimensionesReducidas(imagen.width, imagen.height);
  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;
  lienzo.getContext('2d').drawImage(imagen, 0, 0, ancho, alto);
  imagen.close?.();
  return new Promise((resolver, rechazar) => {
    lienzo.toBlob(
      (blob) => (blob ? resolver(blob) : rechazar(new Error('No se pudo achicar la foto'))),
      'image/jpeg',
      CONFIG.FOTOS.CALIDAD_JPEG
    );
  });
}
