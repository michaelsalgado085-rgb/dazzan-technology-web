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
**Motivo:** El cliente pidió emitir el certificado de garantía desde el
sistema, lo que exige sesión y persistencia. Los entregables 3, 5, 8 y 11
exigen además login real, portal privado, healthcheck de API y base de datos
con políticas de acceso. Un sitio estático no cumple nada de eso. Razonado en
detalle en `adr/ADR-001-backend-gestionado.md`.
**Consecuencia:** Deja sin efecto la Fase 3 condicional de DT-05: el backend ya
no es hipotético. Se conserva DT-01 porque no se agrega ninguna dependencia en
ejecución. La llave pública de Supabase viaja al cliente y lo que protege los
datos son las políticas RLS, no el navegador.

## DT-08 — El sistema emite garantías, no facturas

**Fecha:** 2026-11-09
**Decisión:** El documento imprimible se llama **certificado de garantía** en
el código, en la interfaz y en la documentación. Nunca "factura".
**Motivo:** La factura fiscal la emite el datáfono del local al cobrar (RN-09).
Una factura legal en Honduras necesita CAI, RTN y numeración autorizada por el
SAR, y este documento no es eso. Nombrarlo "factura" invitaría a una pregunta
que el sistema no puede responder.
**Consecuencia:** Las tablas, las rutas y los textos usan "garantía". El
documento lleva número de serie del equipo, fecha, plazo y condiciones, que es
lo que una garantía necesita y una factura no.

## DT-09 — Los productos vendidos se marcan, no se borran

**Fecha:** 2026-11-09
**Decisión:** El producto lleva estado `disponible` o `vendido`. Al emitir la
garantía pasa a `vendido` y desaparece del catálogo y del buscador, pero la
fila se conserva.
**Motivo:** La garantía dura 3 o 6 meses y el comprador puede volver a
reclamarla. Si la fila se borra, la garantía apunta a un registro inexistente
y no se puede consultar ni reimprimir. Razonado en
`adr/ADR-002-productos-vendidos.md`.
**Consecuencia:** Toda consulta de catálogo filtra por estado. El filtro vive
en una sola función de `catalogo.js`, con su prueba, para que no se olvide en
alguna consulta suelta.
