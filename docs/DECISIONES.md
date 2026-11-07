# Decisiones tecnicas

Registro de decisiones de arquitectura y sus motivos.

## DT-01 - JavaScript modular sin framework

**Fecha:** 2026-11-07
**Decision:** Usar modulos ES6 nativos en lugar de React, Vue o similar.
**Motivo:** El alcance es un catalogo con carrito e inventario. Un framework
agregaria build, dependencias y complejidad sin beneficio proporcional (YAGNI).
**Consecuencia:** El sitio se sirve con Live Server sin paso de compilacion.

## DT-02 - Separacion en archivos por responsabilidad

**Fecha:** 2026-11-07
**Decision:** Dividir el HTML unico anterior en `index.html`, hojas de estilo
por capa y modulos JS por dominio.
**Motivo:** SRP y mantenibilidad. Un archivo monolitico impide revisar cambios
en Pull Requests y genera conflictos de merge.
**Consecuencia:** Mas archivos, pero diffs legibles y responsabilidades claras.
