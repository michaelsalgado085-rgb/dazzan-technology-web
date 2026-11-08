# Principios de ingeniería aplicados

Los doce principios del curso, con dónde está aplicado cada uno en este
repositorio. Sirve como guía para cualquier cambio futuro y como referencia
para la sustentación.

---

## 1. El código se escribe para humanos

Se lee diez veces más de lo que se escribe.

**En este proyecto:** nombres en español, descriptivos, sin abreviaturas.
`calcularTotales()`, `requiereAvisoEstado()`, `normalizarTexto()`. Ninguna
función se llama `calc`, `proc` ni `fn1`.

## 2. Una función, una responsabilidad

Se mide en **razones para cambiar**, no en líneas.

**En este proyecto:** `garantiaMeses()` calcula un número y `textoGarantia()`
redacta la frase para el cliente. Son dos funciones porque tienen dos razones
distintas para cambiar: una cambia si cambia la política de garantía, la otra
si cambia la redacción.

## 3. Comentá el porqué, no el qué

**En este proyecto:** `base.css` explica por qué `--verde` no se usa sobre
blanco (contraste 1.3:1), no que define un color. `config.js` explica por qué
`CATEGORIAS` se congela aparte: `Object.freeze` es superficial.

## 4. No te repitas (DRY)

Cada regla de negocio vive en un solo lugar.

**En este proyecto:** la tasa de ISV, el umbral de stock bajo, el límite de
L 15,000 y el número de WhatsApp existen una sola vez, en `config.js`. Ningún
otro archivo declara esos valores.

## 5. Simple gana (KISS) y no lo vas a necesitar (YAGNI)

La sobre-ingeniería también es deuda.

**En este proyecto:** sin framework, sin bundler, sin librería de estado. El
alcance es un catálogo con filtros y una lista de cotización; ninguno de los
tres aportaría algo. Decisión registrada en DT-01 de `DECISIONES.md`.

**Límite consciente:** cuando exista el servidor y haga falta el panel de
administración, YAGNI deja de aplicar y se agrega backend. No antes.

## 6. Sin red de seguridad no hay cambio

Tests primero, refactor después.

**En este proyecto:** 81 pruebas unitarias cubren la lógica de moneda, ISV,
garantía, stock, filtrado, búsqueda, ordenamiento, cotización y generación de
HTML. Cada función pura tiene el caso normal, los límites y al menos un caso
de error.

Ejemplo de límite probado: un producto de exactamente L 15,000 cae en 3 meses,
no en 6. Esa frontera está en `producto.test.js`.

Ejemplo de caso de error probado: `tarjetaProducto()` con un nombre que
contiene `<script>` devuelve el texto escapado. La defensa contra inyección no
es una promesa escrita en un comentario: es una prueba que falla si alguien la
rompe.

## 7. Integrá seguido y en pasos pequeños

Ramas cortas, commits chicos, merges frecuentes.

**En este proyecto:** trunk-based con ramas `feat/`, `fix/`, `docs/`, `chore/`
y `ci/`. Conventional Commits. Un commit por unidad de trabajo terminada; nunca
un commit que mezcle módulos distintos.

## 8. Todo cambio entra por revisión

PR y code review, también del código generado por IA.

**En este proyecto:** ningún commit llega a `main` directamente. Cada rama entra
por Pull Request con autorevisión en comentarios, explicando las decisiones de
diseño línea por línea.

## 9. Diseñá para el cambio

Bajo acoplamiento, alta cohesión, SOLID.

**En este proyecto:**

| Letra | Dónde |
|---|---|
| **S** | Un archivo por dominio: `utils`, `producto`, `catalogo`, `cotizacion` |
| **O** | `COMPARADORES` en `catalogo.js` es un mapa de estrategias: se agrega un criterio de orden sin tocar `ordenarProductos()`. Un `switch` creciente violaría OCP |
| **L** | Sin jerarquías de clases todavía; no aplica aún |
| **I** | Cada módulo exporta solo lo que otros consumen |
| **D** | La lógica recibe datos por parámetro. No lee globales, no toca el DOM, no hace `fetch`. Por eso se prueba sin navegador (DT-04) |

**Acoplamiento:** `calcularTotales()` recibe una lista y devuelve un objeto. No
escribe en pantalla, no guarda nada, no envía nada. Esa es la diferencia entre
poder probarla en una línea o tener que levantar el sistema entero.

## 10. Automatizá lo repetitivo

Si lo hacés dos veces a mano, va al pipeline.

**En este proyecto:** GitHub Actions corre `npm run lint` y `npm test` en cada
push y cada pull request, sobre un Ubuntu limpio. Nadie depende de que alguien
se acuerde de correr las pruebas.

## 11. Medí en producción, no en tu máquina

Logs, métricas y monitoreo.

**Estado:** pendiente. Aplica cuando el sitio esté desplegado en el servidor.
Lo mínimo será saber qué productos se consultan más y qué busca la gente que no
encuentra: eso le dice a Julio qué conviene comprar.

## 12. La IA propone, el ingeniero dispone

Verificá todo output y nunca delegues el criterio.

**En este proyecto:** cada archivo generado se revisa antes de commitear, y las
pruebas corren antes del push. Un caso real: un chat del proyecto detectó una
inconsistencia verdadera (la regla del override sin documentar, hoy RN-08) pero
además propuso renumerar RN-02 a RN-04 de una forma que habría dejado los
comentarios de `producto.js` apuntando a reglas equivocadas. Se tomó lo
correcto y se descartó lo demás.

---

## Anti-patrones que este proyecto evita

| Anti-patrón | Qué viola | Cómo se evita acá |
|---|---|---|
| Clase dios | S | Ningún archivo pasa de ~70 líneas; cada uno tiene un dominio |
| Detalles soldados | D | La lógica no instancia nada ni toca el DOM |
| Switch creciente | O | Mapa de estrategias en `COMPARADORES` |
| Sobre-ingeniería | KISS, YAGNI | Sin framework ni abstracciones que nadie pidió |
| Números mágicos | DRY | Todo en `config.js` |
| Cono de helado | 2, 6, 9 | Pruebas unitarias rápidas sobre lógica desacoplada |
