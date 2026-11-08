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
