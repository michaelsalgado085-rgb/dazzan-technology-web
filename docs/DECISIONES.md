# Decisiones técnicas

Registro de decisiones de arquitectura y sus motivos.

## DT-01 — JavaScript modular sin framework

**Fecha:** 2026-11-07
**Decisión:** Usar módulos ES6 nativos en lugar de React, Vue o similar.
**Motivo:** El alcance es un catálogo con filtros y lista de cotización. Un
framework agregaría build, dependencias y complejidad sin beneficio
proporcional (YAGNI).
**Consecuencia:** El sitio se sirve con Live Server sin paso de compilación.

## DT-02 — Separación en archivos por responsabilidad

**Fecha:** 2026-11-07
**Decisión:** Dividir el HTML único anterior en `index.html`, hojas de estilo
por capa y módulos JS por dominio.
**Motivo:** SRP y mantenibilidad. Un archivo monolítico impide revisar cambios
en Pull Requests y genera conflictos de merge.
**Consecuencia:** Más archivos, pero diffs legibles y responsabilidades claras.

## DT-03 — Dependencias solo de desarrollo

**Fecha:** 2026-11-07
**Decisión:** Incorporar Node.js, Vitest y ESLint como dependencias de
desarrollo, manteniendo cero dependencias en ejecución.
**Motivo:** El proyecto exige suite de pruebas e integración continua. Probar
lógica pura requiere un ejecutor; el sitio publicado no necesita ninguno.
**Consecuencia:** `node_modules` existe en desarrollo pero nunca se despliega.
El sitio sigue siendo archivos estáticos.

## DT-04 — Lógica pura separada del DOM

**Fecha:** 2026-11-07
**Decisión:** Los módulos `utils`, `producto`, `catalogo` y `cotizacion` no
tocan el DOM: reciben datos y devuelven datos. El renderizado vive aparte.
**Motivo:** Permite probar las reglas de negocio sin simular un navegador, y
cumple el principio de inversión de dependencias.
**Consecuencia:** Cobertura alta con pruebas rápidas, sin jsdom.

## DT-05 — Catálogo alimentado por un único JSON

**Fecha:** 2026-11-07
**Decisión:** `data/productos.json` es la fuente única del catálogo.
**Motivo:** El dueño debe poder cambiar precios y stock sin tocar código, y sin
servidor es la opción más simple: editar el archivo desde GitHub.
**Consecuencia:** Las actualizaciones de stock dependen de una edición manual.
Si la frecuencia resulta inmanejable, se evaluará un backend (Fase 3).

## DT-06 — Stock por modelo, no por unidad

**Fecha:** 2026-11-07
**Decisión:** El campo `stock` cuenta unidades disponibles de un modelo.
**Motivo:** El negocio publica la fotografía del modelo, no de cada unidad
usada, y puede tener varias unidades del mismo modelo. Un inventario por unidad
no reflejaría cómo opera.
**Consecuencia:** El sitio advierte que la foto es referencial (RF-08).

## DT-07 — Vercel para alojar y Supabase para los datos

**Fecha:** 2026-11-09
**Decisión:** Publicar el sitio en Vercel y resolver persistencia,
autenticación y control de acceso con Supabase, consumido por su API REST con
`fetch` nativo. Ambos en plan gratuito.
**Motivo:** El cliente pidió emitir desde el sistema la factura de cada venta
con su garantía, lo que exige sesión y persistencia. Los entregables 3, 5, 8 y 11
exigen además login real, portal privado, healthcheck de API y base de datos
con políticas de acceso. Un sitio estático no cumple nada de eso. Razonado en
detalle en `adr/ADR-001-backend-gestionado.md`.
**Consecuencia:** Deja sin efecto la Fase 3 condicional de DT-05: el backend ya
no es hipotético. Se conserva DT-01 porque no se agrega ninguna dependencia en
ejecución. La llave pública de Supabase viaja al cliente y lo que protege los
datos son las políticas RLS, no el navegador.

## DT-08 — El documento que emite el sistema es la factura del negocio

**Fecha:** 2026-11-12 (reemplaza la versión del 2026-11-09)
**Decisión:** El sistema emite la **factura** que el negocio ya usa, con su
correlativo, y las condiciones de garantía para el reverso. En el código, en
la interfaz y en la documentación se llama "factura", que es la palabra del
cliente.
**Motivo:** La versión anterior de esta decisión decía que el sistema emitía
solo un certificado de garantía y que la factura la sacaba el datáfono. Se
escribió a partir de una descripción de segunda mano. Al recibir el documento
real se vio que el cliente entrega una factura numerada y que el datáfono no
tiene relación con ella (RN-09). La regla de diseño RC-04 pide que la pantalla
use el vocabulario del cliente, y su palabra es "factura".
**Consecuencia:** El sistema reproduce el formato actual del negocio y no
inventa datos fiscales: los campos de CAI, rango autorizado y fecha límite se
imprimen vacíos, como en su plantilla, salvo que el cliente los configure. El
sistema no gestiona la autorización fiscal ante el SAR; se declara en
"Limitaciones conocidas" y se recomendó al cliente consultarlo con su
contador. Lección registrada: no se documenta como hecho lo que todavía no se
verificó contra el documento del cliente.

## DT-09 — Los productos vendidos se marcan, no se borran

**Fecha:** 2026-11-09
**Decisión:** La fila del producto no se elimina al vender. Al emitir la
factura se descuentan las existencias, y un producto sin existencias deja de
aparecer en el catálogo y en el buscador.
**Motivo:** La garantía dura 3 meses y el comprador puede volver a reclamarla.
Si la fila se borra, la factura apunta a un registro inexistente y no se puede
consultar ni reimprimir. Razonado en
`adr/ADR-002-productos-vendidos.md`.
**Consecuencia:** Toda consulta de catálogo filtra por existencias. El filtro vive
en una sola función de `catalogo.js`, con su prueba, para que no se olvide en
alguna consulta suelta.

## DT-10 — El correlativo de factura se configura al arrancar y no se reutiliza

**Fecha:** 2026-11-12
**Decisión:** El número de la próxima factura es un dato de configuración que
el cliente escribe una sola vez, el día que empieza a usar el sistema. Desde
ahí el sistema lo incrementa de uno en uno. Una factura anulada conserva su
número: la siguiente lleva el número que sigue.
**Motivo:** El negocio ya va por un correlativo propio y sigue vendiendo
mientras el sistema se construye, así que cualquier número fijado hoy estaría
vencido el día del arranque. Lo de las anuladas lo confirmó el cliente (RN-10).
**Consecuencia:** El incremento ocurre en la base de datos, no en el
navegador, para que dos ventas simultáneas no puedan recibir el mismo número.
Anular es un cambio de estado, no un borrado.

## DT-11 — Factura y garantía se imprimen como dos trabajos separados

**Fecha:** 2026-11-12
**Decisión:** La pantalla de la factura tiene dos acciones: "Imprimir factura"
e "Imprimir garantía".
**Motivo:** La impresora del local imprime una cara por vez. El cliente
prefiere voltear la hoja antes que gastar dos (RN-15). Con un solo trabajo de
dos páginas saldrían dos hojas.
**Consecuencia:** El plazo y la fecha de la garantía van en el frente, en la
factura, para que el reverso sea idéntico en todas las ventas. Eso deja
abierta la opción de imprimir varios reversos por adelantado sin tocar código.
