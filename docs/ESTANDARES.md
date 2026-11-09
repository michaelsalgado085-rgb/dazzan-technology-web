# Estandares de codigo

## Principios aplicados

| Principio | Aplicacion en este proyecto |
|---|---|
| SRP | Un archivo = una responsabilidad. Maximo ~200 lineas. |
| OCP | Funciones extensibles por parametros, no por edicion directa. |
| DIP | Los modulos reciben datos por parametro, no leen globales. |
| DRY | Logica repetida dos veces se extrae a `utils.js`. |
| KISS | Sin abstracciones para requisitos inexistentes. |
| YAGNI | No se construye lo que no esta en REQUISITOS.md. |

## Nomenclatura

- Nombres en espanol, descriptivos, sin abreviaturas.
- Funciones: `camelCase` con verbo inicial - `calcularTotalConISV()`.
- Constantes: `MAYUSCULA_SNAKE` dentro del objeto `CONFIG`.
- Clases CSS: `kebab-case` - `.tarjeta-producto`.
- Archivos: `kebab-case` - `carrito-resumen.js`.

## Idioma y tildes

El codigo se escribe sin tildes; el texto que lee el cliente, con tildes.

| Sin tildes | Con tildes |
|---|---|
| Variables, funciones y nombres de archivo | Todo el texto visible en la pagina |
| Clases CSS, `id`, anclas y atributos `data-` | Contenido de `aria-label` y `alt` |
| Ramas y mensajes de commit | Mensajes de WhatsApp y de error |
| Documentos de `docs/` | El certificado de garantia impreso |

El motivo: un identificador con tilde invita a problemas de codificacion y a
diferencias entre sistemas. Pero un cliente que entra a la tienda y lee
"catalogo" o "garantia" ve una falta de ortografia, y eso resta justo donde el
negocio esta vendiendo confianza.

Caso limite: `id="cotizacion"` va sin tilde porque es un identificador, aunque
el texto de esa misma seccion hable de "cotización" con tilde. El identificador
y el texto son cosas distintas y no tienen por que escribirse igual.

## Reglas obligatorias

- Cero numeros magicos: toda constante va en `CONFIG`.
- Escapar siempre la entrada de usuario antes de inyectarla al DOM.
- Bajo acoplamiento: los modulos se comunican por funciones exportadas.
- Accesibilidad: `aria-label` en botones de icono, `alt` en imagenes,
  `label` asociado a cada input.
- Comentarios solo para explicar el *porque*, nunca el *que*.

## Code smells a evitar

- Funciones de mas de 30 lineas.
- Mas de 3 parametros por funcion.
- Anidamiento mayor a 3 niveles.
- Variables globales mutables.
- Codigo comentado sin eliminar.
