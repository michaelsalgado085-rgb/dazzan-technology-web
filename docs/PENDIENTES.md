# Pendientes

Lo que quedó anotado para hacer después, para que no se pierda en los chats.
Cuando algo se termina, se marca con la fecha y el commit donde se resolvió.

---

## Deuda técnica

### DT-P1 — Partir `assets/css/base.css` en tres archivos
**Estado:** pendiente
**Por qué:** el archivo quedó en 594 líneas. `ESTANDARES.md` fija el límite en
~200 líneas por archivo y una sola responsabilidad. Hoy mezcla tokens de marca,
estilos base, encabezado, portada, controles, tarjetas, panel de cotización y
pie.
**Qué hacer:** separar en `base.css` (tokens, reset, tipografía, contenedor,
encabezado, pie), `catalogo.css` (controles, filtros, rejilla, tarjeta, precio,
ficha, etiquetas) y `cotizacion.css` (panel, filas, totales, botones).
`index.html` enlaza los tres.
**Riesgo si no se hace:** es el único archivo del proyecto que viola el límite
de SRP. Pregunta fácil en la sustentación.

### DT-P2 — Reemplazar el catálogo de ejemplo con el inventario real
**Estado:** pendiente
**Por qué:** los 13 productos de `data/productos.json` los inventó la IA para
poder ver la página armada. No son equipos que Julio tenga.
**Qué hacer:** pedirle a Julio modelo, marca, precio, existencias, condición y
ficha técnica de lo que tiene en el local. Reemplazar el archivo completo.
**Riesgo si no se hace:** el entregable 1 dice que el cliente es real y el 13
pide una foto del cliente usando el producto. Un catálogo falso rompe las dos
cosas, y el profesor puede contactar a Julio.

### DT-P3 — Fotografías reales de los productos
**Estado:** pendiente
**Por qué:** `assets/img/` está vacío y las tarjetas muestran un marcador de
color con la inicial de la categoría.
**Qué hacer:** fotos de los equipos, optimizadas a WebP, y agregar la clave
`imagen` a cada producto del JSON. `marcoImagen()` ya usa la foto en cuanto
esa clave existe; no hay que tocar código.

### DT-P4 — Configurar el alcance de la cobertura
**Estado:** pendiente
**Por qué:** el entregable 6 exige 60% de cobertura de líneas. `main.js` es el
único archivo que toca el DOM y no tiene pruebas unitarias; si entra al cálculo
sin control, baja el porcentaje general.
**Qué hacer:** crear `vitest.config.js` con `coverage.include` apuntando a
`assets/js/**` y decidir explícitamente si `main.js` se excluye o se prueba con
jsdom. La decisión se documenta como un DT nuevo en `DECISIONES.md`.

---

## Decisiones sin tomar

### DP-1 — Hosting y base de datos
**Estado:** pendiente de decidir
**Contexto:** los entregables 3, 5, 8 y 11 exigen login real, portal privado,
healthcheck de API en JSON, headers de seguridad y una base de datos con 5
tablas y políticas de acceso. Un sitio estático no puede cumplir nada de eso,
así que la Fase 3 de `DECISIONES.md` (panel de administración) deja de ser
opcional.
**Opción recomendada:** Vercel para el hosting y Supabase para Postgres, auth y
RLS, consumido con `fetch` nativo contra su API REST. Ambos en plan gratis. No
rompe DT-01 porque no se agrega ninguna dependencia en ejecución.
**Bloquea:** entregables 3, 5, 8 y 11.
**Cuando se decida:** se registra como DT-07 en `DECISIONES.md`.

### DP-2 — Dominio propio
**Estado:** pendiente de confirmar con el ingeniero
**Contexto:** el enunciado del entregable 3 acepta "dominio propio o
Vercel/Netlify/GitHub Pages". Un subdominio `.vercel.app` pasa la verificación
automática. Falta confirmar si el ingeniero lo exige igual para la nota de
sustentación.
**Qué preguntar:** si un subdominio de Vercel pasa, o si exige dominio comprado.
Y si acepta Supabase en plan gratis como backend.
**Cuándo comprarlo si aplica:** el día del despliegue, antes de declarar URLs en
los entregables 3, 10 y 11, para no tener que volver a verificarlos.

---

## Herramientas

### HP-1 — Archivo `CLAUDE.md` para Claude Code
**Estado:** pendiente
**Por qué:** Claude Code corre en la terminal y sí puede ejecutar `npm test`,
`git commit` y crear ramas por su cuenta. Pero no ve los chats: arranca de cero
cada sesión y lee un `CLAUDE.md` en la raíz del repo para tener contexto.
**Qué hacer:** escribir `CLAUDE.md` con el stack, los estándares de
`ESTANDARES.md`, los principios de `PRINCIPIOS.md`, las reglas de Git y la
advertencia de no tocar `main` directamente.

---

## Entregable 12 — Bitácora de IA

Hacen falta **dos commits reales** donde la IA haya propuesto algo y el autor lo
haya corregido o rechazado. Los SHAs se verifican contra el repositorio.

**Estado:** 0 de 2 registrados.

Oportunidades identificadas:

1. Reemplazar el catálogo inventado por el inventario real (DT-P2). La IA
   generó datos falsos para poder ver la página; rechazarlos es criterio del
   ingeniero sobre la propuesta de la herramienta.
2. Partir `base.css` (DT-P1). La IA recomendó dejarlo para después; hacerlo
   igual es aplicar SRP contra esa recomendación.
3. Revisar `vista-producto.js` completo y cambiar lo que no convenza: un
   nombre, una función de más, una decisión de estructura.

Cuando se haga alguno, el cuerpo del commit debe decir qué propuso la IA, qué
se cambió y con qué principio se justifica.
