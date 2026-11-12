# Requisitos

Proyecto: Sitio web de Dazzan Technology
Versión del documento: 0.4
Fecha: 2026-11-12

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
| RN-14 | Métodos de pago: efectivo, tarjeta, transferencia o financiamiento. |
| RN-15 | La factura se imprime en papel carta. La garantía va en el reverso de la misma hoja; la impresora del local imprime una cara por vez y el cliente prefiere voltear la hoja antes que usar dos. |
| RN-16 | Los datos fiscales de la factura (CAI, rango autorizado, fecha límite) van vacíos, igual que en la plantilla actual del negocio. |
| RN-17 | Cuando se vende la última unidad de un producto, deja de mostrarse al público. Sigue visible en el panel, como historial, solo para quien administra. |
| RN-18 | Anular una factura no devuelve el equipo al inventario: el cliente prefiere volver a ponerlo disponible él mismo. |

---

## 4. Requisitos funcionales

| ID | Requisito | Prioridad | Fase | Estado |
|---|---|---|---|---|
| RF-01 | Mostrar el catálogo en tarjetas con foto, nombre, marca, precio, condición y estado de stock. | Alta | 1 | Pendiente |
| RF-02 | Filtrar por categoría: laptops, escritorio, teclados, mouse, auriculares. | Alta | 1 | Pendiente |
| RF-03 | Buscar productos por nombre o marca. | Alta | 1 | Pendiente |
| RF-04 | Ordenar por precio ascendente, precio descendente y nombre. | Media | 1 | Pendiente |
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
| RF-23 | Panel privado con login para agregar, editar y retirar productos, precios y stock. El cliente administra su inventario sin ayuda. | Alta | 3 | Pendiente |
| RF-24 | Desde el panel, buscar un producto disponible y abrir la factura con descripción, marca, modelo y precio ya cargados. | Alta | 3 | Pendiente |
| RF-25 | Emitir la factura con correlativo, cliente, líneas, descuentos, método de pago y totales (RN-08, RN-10 a RN-14). | Alta | 3 | Pendiente |
| RF-26 | Imprimir la factura y, como acción separada, la hoja de garantía para el reverso (RN-15). | Alta | 3 | Pendiente |
| RF-27 | Al emitir la factura, descontar las existencias. Un producto sin existencias deja de ofrecerse. | Alta | 3 | Pendiente |
| RF-28 | Consultar las facturas emitidas y reimprimirlas. | Media | 3 | Pendiente |
| RF-29 | Anular una factura conservando su número (RN-10). | Media | 3 | Pendiente |
| RF-30 | Configurar los datos del negocio que salen en la factura y el número de la próxima factura. | Alta | 3 | Pendiente |

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
| `imagenes` | lista de texto | Sí | Rutas dentro de `assets/img/` |
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
  "imagenes": ["assets/img/dell-vostro-5410.webp"],
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
| 1 | Horario de atención exacto del local. | Julio |
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
