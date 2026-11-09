# Bitácora de uso de IA

Registro de dónde se usó inteligencia artificial en este proyecto y, sobre
todo, dónde el criterio del ingeniero corrigió o rechazó lo que la herramienta
propuso. Principio 12 de `PRINCIPIOS.md`: la IA propone, el ingeniero dispone.

Este archivo alimenta el entregable 12 del proyecto final, que exige señalar
dos commits reales con su SHA verificable.

---

## Herramienta usada

**Claude Opus 5**, a través de la aplicación de Claude conectada a la carpeta
del repositorio: lee y escribe archivos en disco, pero no ejecuta comandos. Los
`git add`, `git commit`, `git push`, `npm test` y `npm run lint` los ejecuta el
ingeniero en su terminal, y las pruebas corren antes de cada push.

**Para qué se usó:** andamiaje de módulos, redacción de documentación,
generación de casos de prueba y revisión cruzada de consistencia entre los
documentos del repositorio.

**Para qué NO se usó:** las reglas de negocio salieron del cliente, no del
modelo. La garantía de 6 meses sobre L 15,000 y 3 meses por debajo, el número
de WhatsApp, las categorías de producto y el alcance del catálogo los definió
Julio Salgado. Ningún commit entra a `main` sin pasar por Pull Request con
revisión.

**Convención de autoría:** todo commit cuyo contenido haya sido escrito por la
herramienta lleva el trailer `Co-Authored-By` en el cuerpo. Los que escribe el
ingeniero no lo llevan. No se distingue por tamaño ni por dificultad: se
distingue por quién lo escribió.

---

## Registro de decisiones

### R-01 — Repartir los commits en varios días

**Qué propuso la IA:** commitear de una vez todo el trabajo terminado.

**Qué decidió el ingeniero:** retener archivos ya listos en disco para
commitearlos en días distintos.

**Razón:** el entregable 2 exige 25 commits en al menos 5 días distintos y
advierte que un repositorio armado en una sola noche no pasa. Concentrar la
historia contradice el principio 7, integrar seguido y en pasos pequeños: 25
commits en una madrugada no son integración continua, son una entrega disfrazada
de proceso.

**Estado:** decisión de proceso, sin commit asociado.

---

### R-02 — Partir `base.css` en tres archivos

**Qué propuso la IA:** dejar el archivo de 594 líneas como estaba y posponer la
división, para no mezclar un refactor con la entrega en curso.

**Qué decidió el ingeniero:** hacer la división igual.

**Razón:** `ESTANDARES.md` fija un máximo de ~200 líneas por archivo con una
sola responsabilidad. `base.css` mezclaba tokens de marca, reset, encabezado,
portada, controles, tarjetas, panel de cotización y pie: son ocho razones
distintas para cambiar el mismo archivo. Es una clase dios en CSS. Aceptar la
recomendación habría dejado el único archivo del proyecto que viola SRP, y la
conveniencia de no interrumpir una entrega no es razón suficiente para
contradecir un estándar propio.

**Estado:** pendiente de ejecutar. Registrado como DT-P1 en `PENDIENTES.md`.

---

### R-03 — Rechazar el catálogo de productos inventado

**Qué propuso la IA:** trece productos con marca, precio, existencias y ficha
técnica, generados por el modelo para poder ver la página armada.

**Qué decidió el ingeniero:** rechazarlos y reemplazarlos por el inventario
real del local.

**Razón:** el entregable 1 declara un cliente real y el 13 pide una fotografía
de ese cliente usando el producto; el profesor puede contactarlo. Un catálogo
con equipos que Julio no tiene convierte el producto en una maqueta y rompe los
dos entregables a la vez. Además, los precios inventados por un modelo no
reflejan el mercado de equipo usado en San Pedro Sula, así que ni siquiera
sirven como dato de prueba realista.

**Estado:** pendiente de ejecutar. Registrado como DT-P2 en `PENDIENTES.md`.
Falta pedirle a Julio el inventario.

---

## Commits a declarar en el entregable 12

Se necesitan dos SHAs verificables. Se llenan cuando R-02 y R-03 se ejecuten.

| Decisión | SHA | Estado |
|---|---|---|
| R-02 — partir `base.css` | pendiente | sin ejecutar |
| R-03 — reemplazar catálogo inventado | pendiente | sin ejecutar |
