# Pendientes

Lo que quedó anotado para hacer después, para que no se pierda en los chats.
Cuando algo se termina, se marca con la fecha y el commit donde se resolvió.

---

## Commits escritos en disco y todavía sin hacer

Trabajo ya terminado y verificado que está en la carpeta pero no en Git. Se
reparte en días distintos a propósito: el entregable 2 exige 25 commits en al
menos 5 días y el repositorio lleva 25 commits en un solo día.

```
git add assets/css/base.css
git commit -m "fix(css): ocultar el boton de WhatsApp cuando la lista esta vacia"

git add assets/img/
git commit -m "feat(marca): agregar logo, iconos de aplicacion y foto del local"

git add assets/js/revelar.js assets/js/main.js
git commit -m "feat(movimiento): revelar secciones al desplazar"

git add index.html
git commit -m "feat(portada): construir el hero con foto del local y marca"

git add docs/BITACORA-IA.md docs/PENDIENTES.md
git commit -m "docs(bitacora): registrar decisiones donde el criterio corrigio a la IA"
```

Cada uno lleva además el cuerpo con la atribución de IA, salvo los que escriba
Michael a mano.

---

## Cambio de requerimientos del cliente — 8 de noviembre de 2026

Julio revisó la página y pidió dos cosas. Las dos cambian el alcance.

### RC-01 — El ISV no se cobra sobre equipo usado
**Prioridad:** alta. Rompe código ya escrito y probado.
**Qué dijo el cliente:** en computadoras usadas no cobra ISV. Solo lo cobra
sobre lo nuevo: teclados, mouse y auriculares.
**Qué está mal hoy:** `calcularTotales()` en `utils.js` aplica
`subtotal * CONFIG.ISV` a todas las líneas sin distinguir. La función, sus
pruebas y el panel de cotización dan cifras incorrectas.
**Qué hacer:** el ISV se calcula por línea según la condición del producto, no
sobre el total. Hacerlo con TDD: primero las pruebas que fallan, después el
código. Casos borde obligatorios: lista solo con usados (ISV cero), lista solo
con nuevos, lista mezclada, lista vacía.
**Nota:** la regla salió del cliente y corrige a la herramienta. Va a
`BITACORA-IA.md`.

### RC-02 — Comprobante de venta desde el panel de administración
**Prioridad:** alta. Es la feature principal del proyecto.
**Qué dijo el cliente:** hoy llena a mano una libreta impresa con campos fijos
(nombre del equipo, precio, nombre del comprador, impuestos). Quiere abrir la
aplicación, buscar el equipo que el cliente quiere, darle clic, y que se abra
un comprobante con todos los datos del producto ya llenos. Él solo escribe los
datos del comprador y lo manda a la impresora del local.
**Por qué importa:** convierte el proyecto de una vitrina en una herramienta de
uso diario, y da respuesta concreta a los entregables 1, 3, 5 y 11.
**Límites que hay que declarar:**
- Un navegador no imprime en silencio: siempre abre el diálogo de impresión.
  El flujo real es clic, `Ctrl+P`, Enter. El ahorro sigue siendo grande.
- No es una factura fiscal. Una factura legal en Honduras necesita CAI, RTN y
  numeración autorizada por el SAR. Esto es un **comprobante de venta interno**,
  equivalente a la libreta que ya usa. Debe llamarse así en el código, en la
  interfaz y en la documentación, y declararse en "Limitaciones conocidas".
**Qué hacer:** rediseñar el modelo de datos alrededor de la venta, no de la
cotización. Tablas propuestas: `categorias`, `productos`, `clientes`,
`comprobantes`, `comprobante_lineas` y los perfiles de usuario. Hoja de estilos
de impresión aparte. Pantalla de administración detrás de sesión.

### RC-04 — Un solo usuario hoy, posiblemente dos más adelante
**Prioridad:** es una restricción de diseño, no una funcionalidad.
**Qué se sabe:** hoy solo Julio usa el sistema. No tiene empleados. Ha dicho
varias veces que le gustaría contratar a alguien para atender.
**Qué NO se construye** (YAGNI, principio 5): pantallas de administración de
usuarios, invitaciones, editor de permisos, registro de auditoría. Con un
usuario no se justifican.
**Qué sí se deja puesto desde el inicio**, porque cambiarlo después obliga a
migrar datos:
- La tabla de perfiles con columna `rol`. Cuesta una columna y además las
  políticas de acceso del entregable 5 necesitan distinguir roles para tener
  sentido.
- Que el comprobante registre qué usuario hizo la venta.

Supabase ya trae autenticación, así que agregar una segunda persona es crearle
una cuenta: no hay código que escribir por adelantado.

**Restricción de diseño que esto impone al panel de administración:** tiene que
poder usarse sin capacitación.
- La pantalla principal es un buscador. Sin menú, sin pestañas, sin tablero.
- De buscar el equipo a tener el comprobante listo: un clic.
- Las etiquetas de los campos usan **las mismas palabras que la libreta de
  papel**, no vocabulario inventado.

Ese último punto es la razón principal por la que hace falta la foto de la
libreta: no para copiar la maqueta, sino para copiar el vocabulario. Si la
pantalla dice lo mismo que el papel, quien ya vio el papel sabe usar la
aplicación.

### RC-03 — Inventario real
Ya estaba anotado como DT-P2. Julio confirmó que hay que cargar los equipos que
tiene disponibles. Sin eso, el comprobante no tiene nada verdadero que imprimir.

---

## Hallazgos al contrastar el código con las reglas de los módulos 1 a 3

Revisión hecha el 7 de noviembre de 2026, comparando el repositorio contra el
temario del curso (los doce principios, SOLID, la pirámide de tests, mutation
testing, SemVer y las reglas de Git).

### DT-P5 — `PRINCIPIOS.md` afirma un test que no existe
**Prioridad:** alta
**Por qué:** la sección 6 dice *"un producto de exactamente L 15,000 cae en 3
meses, no en 6. Esa frontera está en `producto.test.js`"*. No está. Los casos
probados son L 22,000 y L 13,900.
**Riesgo real:** `garantiaMeses()` usa `precio > PRECIO_LIMITE_GAMA_ESTANDAR`.
Cambiar ese `>` por `>=` haría que un equipo de L 15,000 exactos pase de 3 a 6
meses de garantía, y ningún test fallaría. Es el caso de libro de mutation
testing: si cambiar un operador no rompe nada, falta un test.
**Qué hacer:** agregar el caso de L 15,000 exacto a `producto.test.js`. El
documento recién entonces dice la verdad.

### DT-P6 — Falta el borde superior de `estadoStock()`
**Prioridad:** media
**Por qué:** se prueban 0, 3 y 10. Falta 4, el primer valor que debe devolver
`disponible`. Mover `STOCK_UMBRAL_BAJO` de 3 a 4 en `config.js` no rompería
ninguna prueba.
**Qué hacer:** agregar el caso de 4 unidades.

### DT-P7 — Ruta del catálogo soldada en `main.js`
**Prioridad:** media
**Por qué:** `const RUTA_CATALOGO = 'data/productos.json'` está escrita fija en
el código. Contradice el estándar propio de cero valores mágicos fuera de
`config.js` y la regla de no soldar URLs ni rutas. Cuando entre el backend, la
URL de la API y la llave pública tienen que seguir el mismo camino: se
inyectan, no se escriben fijas (principio 9, la D de SOLID).
**Qué hacer:** mover la ruta a `CONFIG`.

### DT-P8 — El número de WhatsApp está en tres lugares
**Prioridad:** media
**Por qué:** vive en `CONFIG.WHATSAPP`, en el `href` del pie de `index.html` y
otra vez como texto visible en ese mismo pie. Si Julio cambia de número hay que
acordarse de tres sitios. Viola DRY (principio 4).
**Qué hacer:** que `main.js` arme el enlace y el texto del pie desde `CONFIG`,
o aceptarlo como excepción documentada si se prefiere que el pie funcione sin
JavaScript. Si se elige la excepción, se registra en `DECISIONES.md` con su
razón, no se deja en silencio.

### DT-P9 — Versionado semántico sin aplicar
**Prioridad:** baja
**Por qué:** `package.json` sigue en `0.1.0` después de una entrega que agregó
funcionalidad compatible. Según SemVer eso es un cambio MINOR: `0.2.0`.
**Qué hacer:** subir la versión al cerrar cada entrega y dejar dicho en
`CONTRIBUTING.md` quién la sube y cuándo.

### DT-P10 — No hay pruebas de integración
**Prioridad:** baja por ahora, alta cuando entre el backend
**Por qué:** la pirámide de tests pide muchas unitarias, algunas de integración
y poquísimas E2E. Hoy el proyecto tiene 81 unitarias y cero de integración,
porque todavía no hay nada que integrar. En cuanto exista base de datos y
login, hacen falta pruebas que toquen la API real, y un par de E2E sobre el
flujo crítico: entrar al portal privado y ver que no filtre sin sesión.

### DT-P11 — Plan de rollback del despliegue
**Prioridad:** pendiente hasta el despliegue
**Por qué:** la regla del curso dice que todo despliegue debe tener plan de
rollback y que ante una falla en producción primero se mitiga y después se
diagnostica.
**Qué hacer:** al desplegar, documentar cómo se revierte a la versión anterior
en un párrafo del README.

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
