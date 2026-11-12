# Bitácora de uso de IA

Registro de dónde se usó inteligencia artificial en este proyecto y, sobre
todo, dónde el criterio del ingeniero corrigió o rechazó lo que la herramienta
propuso. Principio 12 de `PRINCIPIOS.md`: la IA propone, el ingeniero dispone.

Este archivo alimenta el entregable 12 del proyecto final, que exige señalar
dos commits reales con su SHA verificable.

---

## Herramienta usada

**Claude, de Anthropic**, a través de la aplicación de Claude conectada a la
carpeta del repositorio: modelo Opus 5 hasta el 11 de noviembre de 2026 y
Fable 5.2 desde el 12. Lee y escribe archivos en disco, pero no ejecuta
comandos. Los `git add`, `git commit`, `git push`, `npm test` y
`npm run lint` los ejecuta el ingeniero en su terminal, y las pruebas corren
antes de cada push.

**Para qué se usó:** andamiaje de módulos, redacción de documentación,
escritura de código y de casos de prueba, y revisión cruzada de consistencia
entre los documentos del repositorio.

**Para qué NO se usó:** para definir reglas de negocio. Esas salen del cliente:
el plazo de la garantía, que los precios ya incluyen el ISV, cómo se numeran
las facturas, qué datos del comprador se anotan y cómo se imprime. Las veces
que una regla se escribió sin verificarla antes con él, hubo que corregirla
(R-05 y R-08). Ningún commit entra a `main` sin pasar por Pull Request con
revisión.

**Sobre las pruebas:** hasta el 11 de noviembre la herramienta escribió tanto
el código como sus pruebas. Eso es una especificación circular: las pruebas
describen lo que el código hace, no necesariamente lo que el negocio pidió.
Desde el 12 de noviembre rige R-09.

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

**Estado:** pendiente de ejecutar. El cliente decidió cargar él mismo su
inventario desde el panel; los datos inventados se reemplazan entonces.

---

### R-04 — Rechazar una atribución inexacta en la descripción del Pull Request

**Qué propuso la IA:** cerrar la descripción del PR con el pie automático
`Generated with Claude Code`, más un enlace a la sesión.

**Qué decidió el ingeniero:** rechazarlo y pedir una redacción que dijera la
verdad.

**Razón:** Claude Code es un producto distinto, de terminal, que no se usó en
este proyecto; la asistencia vino de la app de Claude con acceso a la carpeta
del repositorio. Declarar una herramienta que no se usó es el mismo error que
ocultar la que sí se usó, solo que en la otra dirección, y el entregable 12
pregunta explícitamente qué herramienta se utilizó. Se reemplazó por una línea
que nombra el modelo real y remite a este archivo.

**Cómo se detectó:** el bloque venía listo para copiar y pegar. Se leyó antes
de pegarlo.

**Estado:** aplicado en la descripción del PR de la rama
`feat/catalogo-y-documentacion`.

---

### R-05 — El ISV: dos correcciones a lo que la IA dio por hecho

**Qué propuso la IA:** en la primera versión de `calcularTotales()` sumó 15% de
ISV a todas las líneas de la cotización, sin que nadie se lo hubiera indicado.

**Primera corrección (8 de noviembre):** el cliente aclaró que el equipo usado
no paga ISV. Se corrigió para gravar solo el producto nuevo.

**Segunda corrección (12 de noviembre):** al recibir la factura real del
negocio se vio que no tiene línea de ISV, y el cliente confirmó que los precios
ya lo llevan incluido. El cálculo se elimina por completo (RN-08).

**Razón:** las 81 pruebas de ese momento pasaban en verde con la regla
equivocada. Que una suite pase no significa que el código sea correcto: solo
que cumple el contrato que está escrito, y ese contrato lo había escrito la
misma herramienta. El error no lo encontró ninguna prueba; lo encontró el
cliente.

**Estado:** primera corrección aplicada en el commit `1d85d01`. La segunda está
pendiente de ejecutar.

---

### R-06 — Dónde vive el cálculo de totales

**Qué propuso la IA:** dos opciones. Mover `calcularTotales()` a
`cotizacion.js`, o dejarla en `utils.js` importando ahí la condición del
producto. Recomendó la primera.

**Qué decidió el ingeniero:** moverla a `cotizacion.js`.

**Razón:** SRP se mide en razones para cambiar. En `utils.js` la función
convivía con el formato de moneda y el escapado de HTML; decidir qué entra en
un total es regla de negocio y pertenece al módulo de ventas.

**Nota:** aquí no hubo rechazo, hubo elección entre alternativas. Se registra
porque la decisión la tomó el ingeniero, pero no cuenta como corrección.

**Estado:** aplicado en el commit `1d85d01`.

---

### R-07 — El número de la próxima factura

**Qué propuso la IA:** preguntarle al cliente por qué número de factura va,
para que el sistema arrancara desde ahí.

**Qué decidió el ingeniero:** no preguntarlo. Que sea un dato que el cliente
configura el día que empiece a usar el sistema.

**Razón:** el negocio sigue vendiendo mientras el sistema se construye.
Cualquier número obtenido hoy estaría vencido el día del arranque y habría
quedado escrito fijo en algún lado. Es el principio de no soldar valores en el
código aplicado a un dato que cambia todos los días. Quedó como DT-10.

**Estado:** decisión de diseño registrada; se implementa con el panel.

---

### R-08 — No enviar el entregable 4 sin ver el documento del cliente

**Qué propuso la IA:** terminados los ADR y el documento de arquitectura,
indicó llenar el formulario del entregable 4 y verificarlo de inmediato.

**Qué decidió el ingeniero:** esperar a que el cliente enviara su factura y sus
condiciones de garantía, por si cambiaban algo de lo escrito.

**Razón:** cambiaban. La IA había documentado en DT-08, RN-09, el ADR-002 y el
diagrama de contexto que el sistema emitía solo una garantía y que la factura
la sacaba el datáfono. Lo había escrito a partir de una descripción de segunda
mano. El documento real mostró una factura numerada y el cliente aclaró que el
datáfono no tiene relación con ella. De haberse enviado, el entregable habría
quedado verificado con una arquitectura que describía mal el negocio.

**Estado:** documentos corregidos el 12 de noviembre, antes del envío.

---

### R-09 — Las reglas de negocio se confirman antes de escribir las pruebas

**Qué venía haciendo la IA:** escribir el código y sus pruebas en la misma
sesión, derivando las pruebas de su propio código.

**Qué decidió el ingeniero:** la IA puede seguir escribiendo las pruebas, pero
toda regla de negocio se le presenta antes y él la confirma o la corrige. Si
la IA escribe código y pruebas juntos, lo avisa al inicio y entrega al final
qué revisó, qué no pudo verificar y qué necesita confirmación.

**Razón:** R-05. Una suite escrita por la misma herramienta que escribió el
código no es evidencia de que el negocio quedó cubierto.

**Estado:** vigente desde el 12 de noviembre de 2026.

---

## Commits a declarar en el entregable 12

Se necesitan dos SHAs verificables.

| Decisión | SHA | Estado |
|---|---|---|
| R-05 — el ISV que la IA sumó a todo, corregido con la regla del cliente | `1d85d01` | en `main` |
| R-05 — eliminar el cálculo de ISV al confirmarse que el precio lo incluye | pendiente | sin ejecutar |
| R-02 — partir `base.css` | pendiente | sin ejecutar |
| R-03 — reemplazar el catálogo inventado | pendiente | sin ejecutar |
