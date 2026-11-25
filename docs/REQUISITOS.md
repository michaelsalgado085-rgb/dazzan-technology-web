# Requisitos

Proyecto: Sitio web de Dazzan Technology
Versión del documento: 0.5
Fecha: 2026-11-19

---

## 1. Contexto del negocio

Dazzan Technology vende laptops y computadoras de escritorio **usadas en buen
estado con garantía propia**, además de teclados, mouse y auriculares **nuevos**.

Propietario: Julio Alezandro Salgado Leiva.
Local: Barrio Guadalupe, 19 calle, a media cuadra de Av. Junior, a la par de
Solfinar, local A. San Pedro Sula, Honduras.
Teléfono y WhatsApp: +504 3180-7243.

La captación de clientes ocurre por publicidad pagada en TikTok, Instagram y
Facebook, con una imagen diseñada por modelo. El cliente escribe por mensaje
directo y la venta se cierra de forma presencial en el local.

**Problemas a resolver:**

1. El dueño responde manualmente las mismas tres preguntas en cada conversación:
   precio, disponibilidad y especificaciones.
2. Cada modelo nuevo exige diseñar una imagen publicitaria aparte.
3. Si cambia un precio, la publicación ya difundida queda desactualizada.

**Objetivo del sitio:** un único enlace, colocable en la biografía de las tres
redes, donde el cliente resuelve esas preguntas solo y llega al mensaje directo
o al local con el modelo ya decidido.

---

## 2. Alcance

### Dentro del alcance (Fase 1)

Catálogo informativo con lista de cotización enviada por WhatsApp.

Desde el 12 de noviembre de 2026 entra también al alcance el panel privado:
administrar el inventario y emitir la factura del negocio con su garantía
(RN-09 a RN-15, RF-23 a RF-30). Lo pidió el cliente y es la funcionalidad
principal del proyecto.

### Fuera del alcance (Fase 1)

- Pasarela de pago en línea.
- Cuentas de usuario para clientes.
- Stock sincronizado en tiempo real con un sistema externo.
- Envíos y logística.
- Gestión de la autorización fiscal de las facturas ante el SAR.

---

## 3. Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Las laptops y computadoras de escritorio son equipo usado en buen estado. Los teclados, mouse y auriculares son nuevos. |
| RN-02 | Garantía de 3 meses para todo producto vendido, contada desde la fecha de compra que figura en la factura. Reemplaza la regla anterior de 6 meses para gama alta. Confirmado por el cliente el 12 de noviembre de 2026. |
| RN-03 | Sin efecto desde el 12 de noviembre de 2026: la garantía dejó de depender del precio. Ver RN-02. |
| RN-04 | Sin efecto desde el 12 de noviembre de 2026: los periféricos nuevos llevan la misma garantía de 3 meses que todo lo demás. Ver RN-02. |
| RN-05 | La fotografía publicada corresponde al **modelo**, no a la unidad específica en venta. El sitio debe advertirlo. |
| RN-06 | Un mismo modelo puede tener varias unidades disponibles, por eso el stock se lleva por modelo y no por unidad. |
| RN-07 | Los precios se expresan en Lempiras hondureños y no incluyen cargos adicionales. |
| RN-08 | Todos los precios ya incluyen el ISV. El sistema no suma ni desglosa impuesto: el total es la suma de los importes menos los descuentos. Confirmado por el cliente el 12 de noviembre de 2026; reemplaza la versión del 8 de noviembre, que sumaba 15% al producto nuevo. |
| RN-09 | El sistema emite la factura del negocio y, para el reverso, las condiciones de garantía. El datáfono es solo uno de los medios de pago y no guarda relación con la factura. Reemplaza la versión del 9 de noviembre. |
| RN-10 | La factura lleva un número correlativo. Avanza de uno en uno y no se reutiliza: si una factura se anula, la siguiente lleva el número que sigue. |
| RN-11 | Toda factura lleva el nombre del cliente. El RTN o número de identidad es opcional. No se registra teléfono. |
| RN-12 | El número de serie del equipo es opcional en la factura. |
| RN-13 | Los descuentos no tienen regla fija: son lo que se acuerde con el cliente. Hay descuento por línea y un descuento adicional sobre el total. Un descuento puede llegar al 100% (el negocio a veces regala un artículo), así que el total puede ser L 0; nunca es negativo. |
| RN-14 | Métodos de pago: efectivo, tarjeta, transferencia o financiamiento. La tarjeta no lleva recargo y el financiamiento solo se marca, sin datos de la financiera. Aclarado por el cliente el 19 de noviembre de 2026. |
| RN-15 | La factura se imprime en papel carta. La garantía va en el reverso de la misma hoja; la impresora del local imprime una cara por vez y el cliente prefiere voltear la hoja antes que usar dos. |
| RN-16 | Los datos fiscales de la factura (CAI, rango autorizado, fecha límite) van vacíos, igual que en la plantilla actual del negocio. |
| RN-17 | Cuando se vende la última unidad de un producto, deja de mostrarse al público. Sigue visible en el panel, como historial, solo para quien administra. |
| RN-18 | Anular una factura no devuelve el equipo al inventario: el cliente prefiere volver a ponerlo disponible él mismo. |
| RN-19 | Una factura necesita al menos un producto. Confirmado por el cliente el 12 de noviembre de 2026. |
| RN-20 | Una factura se puede pagar con más de un método, y se anota el monto de cada uno. Confirmado por el cliente el 19 de noviembre de 2026. |
| RN-21 | Los montos pagados suman exactamente el total. No se anota vuelto: se registra lo que cubre el total. Propuesta de la IA, confirmada por Michael el 19 de noviembre de 2026. |
| RN-22 | Una factura con total cero no lleva pagos. Propuesta de la IA, confirmada por Michael el 19 de noviembre de 2026. |
| RN-23 | Un mismo método de pago no se repite en una factura. Propuesta de la IA, confirmada por Michael el 19 de noviembre de 2026. |
| RN-24 | El número de factura se imprime con 5 dígitos y ceros a la izquierda, por ejemplo `00768`. Confirmado por el cliente el 19 de noviembre de 2026. |
| RN-25 | La factura dice la fecha exacta en que vence la garantía: el mismo día, 3 meses después. Si ese día no existe en el mes, los días que faltan pasan al mes siguiente: una venta del 30 de noviembre de 2026 vence el 2 de marzo de 2027. Confirmado por el cliente el 19 de noviembre de 2026. |
| RN-26 | Los descuentos se escriben en lempiras, no en porcentaje. Se imprime una sola copia, para el cliente. Anular una factura no pide motivo. Confirmado por el cliente el 19 de noviembre de 2026. |
| RN-27 | Un producto necesita nombre, marca, categoría, condición, precio y existencias. Descripción, especificaciones y precio anterior son opcionales. Propuesta de la IA, confirmada por Michael el 22 de noviembre de 2026. |
| RN-28 | Al elegir la categoría se sugiere la condición: laptops y escritorio, usado; periféricos, nuevo. El cliente la puede cambiar. Propuesta de la IA, confirmada por Michael el 22 de noviembre de 2026. |
| RN-29 | Las especificaciones se escriben una por línea, con dos puntos (`Memoria: 8 GB`). Una línea sin dos puntos se avisa, no se descarta. Propuesta de la IA, confirmada por Michael el 22 de noviembre de 2026. |
| RN-30 | Un producto con el mismo nombre y marca que uno existente no se duplica: el panel ofrece abrir el existente para sumarle existencias. Propuesta de la IA, confirmada por Michael el 22 de noviembre de 2026. |
| RN-31 | Por ahora los productos no llevan fotos; se agregan en una fase posterior. Propuesta de la IA, confirmada por Michael el 22 de noviembre de 2026. Reemplazada por RN-33 el 23 de noviembre de 2026. |
| RN-32 | Un producto se puede eliminar solo si nunca se vendió, y con confirmación. Uno vendido se conserva como historial; para sacarlo de la tienda se ponen sus existencias en 0 (ADR-002). Propuesta de la IA, confirmada por Michael el 22 de noviembre de 2026. |
| RN-33 | Un producto lleva hasta 6 fotos, todas opcionales. La primera es la portada: la que sale en la tarjeta de la tienda. Las fotos se achican en el teléfono antes de subir (1600 px por el lado mayor, JPEG). Pedido del cliente, confirmado por Michael el 23 de noviembre de 2026. |
| RN-34 | El panel saluda según la hora del dispositivo: "Buenos días" de 5:00 a 11:59, "Buenas tardes" de 12:00 a 18:59 y "Buenas noches" de 19:00 a 4:59. Pedido de Michael, horarios confirmados el 23 de noviembre de 2026. |
| RN-35 | Lo que se escribe en el formulario de producto, fotos incluidas, se guarda en el dispositivo mientras se escribe y se recupera al volver a la app. Se borra solo al guardar el producto, al eliminarlo o al descartarlo. Cancelar con algo escrito pregunta antes de descartar. Pedido de Michael, confirmado el 23 de noviembre de 2026. |
| RN-36 | La búsqueda de la tienda mira el nombre, la marca, la categoría, la condición y todas las especificaciones, sin importar mayúsculas ni tildes; "16 GB" y "16gb" son lo mismo, y las palabras de relleno ("de", "con"...) no cuentan. Sale solo el producto que tiene todas las palabras, comparadas con el comienzo de cada palabra del producto ("16" encuentra "16 GB"; "6 GB" no). Así "Intel Core i8" no muestra un i7 y "RAM 17 GB" no muestra uno de 16 GB. Confirmado por Michael el 25 de noviembre de 2026; reemplaza la versión de la misma fecha que mostraba los que tuvieran cualquiera de las palabras. |
| RN-37 | La tienda ordena por recién llegados (por defecto), precio de menor a mayor, precio de mayor a menor o mayor descuento. El orden se aplica también después de buscar o filtrar. Confirmado por Michael el 25 de noviembre de 2026. |
| RN-38 | Al elegir la condición, la descripción se escribe sola: usado, "Equipo usado en excelente condición con garantía."; nuevo, "Producto nuevo y original, con garantía de la tienda." Solo reemplaza una descripción vacía o automática; lo escrito a mano se respeta. Confirmado por Michael el 25 de noviembre de 2026. |

---

## 4. Requisitos funcionales

| ID | Requisito | Prioridad | Fase | Estado |
|---|---|---|---|---|
| RF-01 | Mostrar el catálogo en tarjetas con foto, nombre, marca, precio, condición y estado de stock. | Alta | 1 | Pendiente |
| RF-02 | Filtrar por categoría: laptops, escritorio, teclados, mouse, auriculares. | Alta | 1 | Pendiente |
| RF-03 | Buscar productos por nombre, marca, categoría, condición y especificaciones (RN-36). Ampliado a pedido de Michael el 25 de noviembre de 2026. | Alta | 1 | Construido |
| RF-04 | Ordenar por recién llegados, precio ascendente, precio descendente y mayor descuento (RN-37). El orden por nombre se quitó a pedido de Michael el 25 de noviembre de 2026. | Media | 1 | Construido |
| RF-05 | Abrir el detalle del producto con especificaciones completas, precio, condición, garantía y disponibilidad. | Alta | 1 | Pendiente |
| RF-06 | Indicar el estado de stock: disponible, últimas unidades, agotado. | Alta | 1 | Pendiente |
| RF-07 | Mostrar la garantía aplicable a cada producto, según RN-02. | Alta | 1 | Pendiente |
| RF-08 | Mostrar un aviso permanente en el detalle de equipo usado: la foto corresponde al modelo, la unidad puede presentar detalles estéticos leves y el funcionamiento está garantizado. | Alta | 1 | Pendiente |
| RF-09 | Filtrar por rango de precio con un control deslizante o campos mínimo y máximo. | Media | 1 | Pendiente |
| RF-10 | Agregar productos a una lista de cotización con cantidad editable y opción de quitar. | Alta | 1 | Pendiente |
| RF-11 | Generar un mensaje de WhatsApp prellenado hacia +504 3180-7243 con los productos, cantidades y total estimado. | Alta | 1 | Pendiente |
| RF-12 | Botón de consulta directa por WhatsApp en cada producto, con el modelo ya mencionado en el mensaje. | Alta | 1 | Pendiente |
| RF-13 | Sección de inicio con categorías, productos destacados y promociones vigentes. | Alta | 1 | Pendiente |
| RF-14 | Sección de contacto con dirección, mapa embebido, horario y enlaces a TikTok, Instagram, Facebook y WhatsApp. | Alta | 1 | Pendiente |
| RF-15 | Sección "Nosotros" con descripción del negocio y política de garantía. | Media | 1 | Pendiente |
| RF-16 | Sección de preguntas frecuentes: garantía, estado del equipo usado, formas de pago, envíos a otras ciudades. | Media | 1 | Pendiente |
| RF-17 | Sección de ofertas con precio anterior tachado. | Media | 1 | Pendiente |
| RF-18 | Asistente de catálogo: ventana de chat que responde sobre disponibilidad, precio y especificaciones buscando dentro de los datos del catálogo. | Media | 2 | Pendiente |
| RF-19 | El asistente ofrece el enlace a WhatsApp cuando no resuelve la consulta. | Media | 2 | Pendiente |
| RF-20 | Comparar hasta tres productos de la misma categoría en una tabla lado a lado. | Baja | 2 | Pendiente |
| RF-21 | Generar una imagen de ficha descargable por producto, con el formato visual de los anuncios actuales, para publicar en redes sin rediseñarla a mano. | Baja | 2 | Propuesto |
| RF-22 | Sección de servicios (mantenimiento, instalación, armado de PC). | Baja | 2 | Por confirmar |
| RF-23 | Panel privado con login para agregar, editar y retirar productos, precios y stock (RN-27 a RN-31). El cliente administra su inventario sin ayuda. | Alta | 3 | Construido |
| RF-24 | Desde el panel, buscar un producto disponible y abrir la factura con descripción, marca, modelo y precio ya cargados. | Alta | 3 | Construido |
| RF-25 | Emitir la factura con correlativo, cliente, líneas, descuentos, pagos y totales (RN-08, RN-10 a RN-14, RN-20 a RN-24). | Alta | 3 | Construido |
| RF-26 | Imprimir la factura y, como acción separada, la hoja de garantía para el reverso (RN-15). | Alta | 3 | Pendiente |
| RF-27 | Al emitir la factura, descontar las existencias. Un producto sin existencias deja de ofrecerse. | Alta | 3 | Construido |
| RF-28 | Consultar las facturas emitidas y reimprimirlas. | Media | 3 | Pendiente |
| RF-29 | Anular una factura conservando su número (RN-10). | Media | 3 | Pendiente |
| RF-30 | Configurar los datos del negocio que salen en la factura y el número de la próxima factura. | Alta | 3 | Pendiente |
| RF-31 | Cuenta de prueba para que el profesor use el panel sin tocar las facturas ni el inventario reales. Aceptado por el cliente el 19 de noviembre de 2026. | Alta | 3 | Pendiente |
| RF-32 | Desde la tienda, un botón "Panel" visible solo con la sesión iniciada; desde el panel, un botón "Tienda". Un enlace "Acceso del personal" en el pie lleva al login. Pedido del cliente el 22 de noviembre de 2026. | Media | 3 | Construido |
| RF-33 | Fotos de cada producto: una o varias, una marcada como portada, en carrusel al tocarla (RN-33). Pedido del cliente el 22 de noviembre de 2026. | Alta | 3 | Construido |
| RF-34 | El formulario de producto no se pierde al salir de la app a mirar fotos o datos y volver (RN-35). Pedido de Michael el 23 de noviembre de 2026. | Alta | 3 | Construido |
| RF-35 | Saludo del panel según la hora del día (RN-34). Pedido de Michael el 23 de noviembre de 2026. | Baja | 3 | Construido |
| RF-36 | En la computadora, el panel usa el ancho de la pantalla: inventario en cuadrícula con la portada de cada producto y, al agregar o editar, la tarjeta de la tienda en vivo al lado del formulario. Pedido de Michael el 23 de noviembre de 2026. | Media | 3 | Construido |

---

## 5. Requisitos no funcionales

| ID | Requisito | Estado |
|---|---|---|
| RNF-01 | Diseño responsive funcional en móvil, tablet y escritorio. La mayoría del tráfico llega desde redes sociales en móvil. | Pendiente |
| RNF-02 | El sitio no usa dependencias ni CDN en ejecución. Las dependencias de Node son solo de desarrollo (pruebas y análisis estático). | Pendiente |
| RNF-03 | Precios en Lempiras (HNL). | Pendiente |
| RNF-04 | Carga inicial menor a 3 segundos en conexión móvil. | Pendiente |
| RNF-05 | Imágenes optimizadas, formato WebP con respaldo JPG, carga diferida fuera de la primera pantalla. | Pendiente |
| RNF-06 | Identidad visual tomada del logo y de la plantilla de anuncios: carbón `#141823`, verde lima `#90FE69`, azul marino `#00275B` y blanco. Tarjetas de esquinas redondeadas y filas de especificaciones con ícono de verificación. Contraste mínimo WCAG AA (4.5:1 en texto). | Pendiente |
| RNF-13 | El verde `#90FE69` solo se usa sobre fondo oscuro o como fondo de etiqueta con texto carbón; nunca como texto sobre blanco, donde su contraste es de 1.3:1. | Pendiente |
| RNF-07 | Accesibilidad: navegación por teclado, `aria-label` en botones de ícono, `alt` descriptivo en imágenes. | Pendiente |
| RNF-08 | Metadatos Open Graph para que el enlace se previsualice al compartirse en redes. | Pendiente |
| RNF-09 | El catálogo se alimenta de un único archivo `data/productos.json`, editable sin tocar código. | Pendiente |
| RNF-10 | Cobertura de pruebas unitarias no menor al 80% en los módulos de lógica pura. | Pendiente |
| RNF-11 | Integración continua que ejecute análisis estático y pruebas en cada push y pull request. | Pendiente |
| RNF-12 | Sin secretos versionados en el repositorio. | Pendiente |
| RNF-14 | El panel se diseña primero para el teléfono, porque el cliente lo usa más ahí, y funciona también en computadora. La factura se imprime desde los dos. Confirmado por el cliente el 19 de noviembre de 2026. | Pendiente |

---

## 6. Modelo de datos del producto

| Campo | Tipo | Obligatorio | Nota |
|---|---|---|---|
| `id` | número | Sí | Único |
| `nombre` | texto | Sí | Ej. "Vostro 5410" |
| `marca` | texto | Sí | Ej. "Dell" |
| `categoria` | texto | Sí | Una de las cinco definidas |
| `condicion` | texto | Sí | `nuevo` o `usado` |
| `precio` | número | Sí | En Lempiras, sin símbolo |
| `precioAnterior` | número | No | Solo si está en promoción |
| `stock` | número | Sí | Unidades disponibles del modelo. 0 = agotado |
| `fotos` | lista de texto | No | Hasta 6 (RN-33). La primera es la portada. En Supabase se guarda la ruta dentro del bucket `productos`; la tienda recibe la dirección completa |
| `specs` | objeto | Sí | Pares clave-valor. Ej. `{"Procesador": "Intel Core i7 11390H", "RAM": "16 GB"}` |
| `destacado` | booleano | No | Aparece en la portada |

### Ejemplo

```json
{
  "id": 1,
  "nombre": "Vostro 5410",
  "marca": "Dell",
  "categoria": "laptops",
  "condicion": "usado",
  "precio": 9900,
  "stock": 2,
  "fotos": ["https://zcohmefgobkrmmxizcsr.supabase.co/storage/v1/object/public/productos/ejemplo.jpg"],
  "specs": {
    "Procesador": "Intel Core i7 11390H de 11va generación",
    "RAM": "16 GB",
    "Almacenamiento": "512 GB SSD M.2",
    "Pantalla": "14\" táctil 2 en 1",
    "Sistema operativo": "Windows 11 activado"
  },
  "destacado": true
}
```

---

## 7. Fases de entrega

| Fase | Contenido | Resultado |
|---|---|---|
| 1 | RF-01 a RF-17, todos los RNF | Sitio publicado y usable, listo para enlazar en las biografías de redes |
| 2 | RF-18 a RF-22 | Asistente de catálogo, comparador y generador de fichas |
| 3 | RF-23 a RF-30 | Panel de administración y factura con garantía. Dejó de ser opcional el 12 de noviembre de 2026; el backend se decidió en ADR-001 |

---

## 8. Decisiones pendientes

| # | Pregunta | Responsable |
|---|---|---|
| 1 | Horario de atención exacto del local. **Resuelto:** lunes a viernes de 10 a.m. a 5 p.m.; sábado de 10 a.m. a 2 p.m.; domingo solo con previo aviso. | Julio |
| 2 | ¿Ofrece mantenimiento, instalación o armado de PC? Define RF-22. | Julio |
| 3 | Formas de pago aceptadas en el local. **Resuelto:** RN-14. | Julio |
| 4 | ¿Hace envíos a otras ciudades de Honduras y bajo qué condiciones? | Julio |
| 5 | Umbral de precio o lista de marcas que definen "gama alta" para RN-02. **Sin efecto:** la garantía ya no depende del precio. | Julio |
| 6 | Logo en formato vectorial (SVG) o PNG con fondo transparente. **Resuelto:** PNG recibido y procesado. | Julio |
| 7 | Lista inicial de productos con precios y especificaciones. **Resuelto:** el cliente cargará su inventario desde el panel (RF-23). | Julio |
| 8 | ¿Quién actualizará el stock y con qué frecuencia? Define si la Fase 3 es necesaria. **Resuelto:** Julio, desde el panel. La Fase 3 es necesaria. | Julio / Michael |
| 9 | Código hexadecimal exacto del azul marino del logo. | Michael |
| 10 | Proveedor y plan de hosting. **Resuelto:** Vercel y Supabase, planes gratuitos (DT-07). | Michael |
| 11 | Dominio propio o subdominio del proveedor. | Michael |
| 12 | ¿La garantía de 3 meses "a todo" incluye los periféricos nuevos? **Resuelto:** sí, a todo. | Julio |
| 13 | ¿Emitir facturas desde un sistema requiere CAI u otro trámite? Consulta al contador del negocio. | Julio |
