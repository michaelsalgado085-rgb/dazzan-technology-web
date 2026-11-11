# ADR-001 — Usar Supabase gestionado en vez de levantar un backend propio

**Fecha:** 2026-11-09
**Estado:** Aceptada
**Decide:** Michael Salgado Leiva
**Reemplaza:** la Fase 3 condicional de DT-05, que dejaba el backend como algo
a evaluar más adelante

---

## Contexto

El proyecto arrancó como un sitio estático. DT-01 descartó frameworks y DT-05
puso el catálogo en un archivo JSON que se edita desde GitHub, con la idea de
que un backend quedaba para una Fase 3 hipotética con servidor pagado.

Dos cosas rompieron ese plan.

**Primero, los requisitos del curso.** Los entregables 3, 5, 8 y 11 exigen
login real, un portal privado que no filtre contenido sin sesión, un
healthcheck de API en JSON, headers de seguridad declarados en un archivo de
configuración, y una base de datos con al menos cinco tablas, llaves foráneas,
índices y políticas de acceso. Un sitio estático servido desde GitHub Pages no
puede cumplir ninguna de esas cosas.

**Segundo, y más importante, el cliente.** Julio pidió que el sistema le emita
el certificado de garantía que hoy llena a mano en una libreta: buscar el
equipo, darle clic, que los campos se precarguen, y mandarlo a la impresora.
Eso necesita autenticación, persistencia y un registro histórico. Deja de ser
una Fase 3 opcional y pasa a ser la razón de existir del proyecto.

Las restricciones reales son estas:

- El negocio es una tienda de una persona. El presupuesto de operación es cero.
- Quedan cinco semanas hasta la entrega.
- El autor es un estudiante trabajando solo.
- Los compradores entran desde el teléfono con internet inestable.
- El sistema va a guardar nombres y teléfonos de clientes reales.

## Alternativas consideradas

**Servidor propio con Node y Postgres en un VPS.** Control total y portabilidad
completa. Descartada: cuesta dinero todos los meses, obliga a administrar el
sistema operativo, los respaldos, los certificados y las actualizaciones de
seguridad, y nada de eso aporta a la nota ni al negocio.

**Firebase.** Resuelve autenticación y datos igual de rápido. Descartada
porque Firestore no es relacional, y el entregable 5 pide explícitamente
tablas con llaves foráneas, índices y políticas de acceso. Modelar eso sobre
documentos sería pelear contra la herramienta.

**Escribir la autenticación a mano sobre funciones serverless.** Descartada por
riesgo. Es donde un proyecto estudiantil filtra datos de clientes reales, y
acá los datos son de los clientes de Julio, no de nadie imaginario.

## Decisión

**Usar Supabase gestionado en vez de levantar un backend propio**, y alojar el
sitio en Vercel.

Concretamente:

- **Supabase** aporta Postgres, autenticación y políticas de acceso por fila
  (RLS). El navegador habla con su API REST directamente, usando `fetch`
  nativo, sin instalar el SDK.
- **Vercel** sirve los archivos estáticos sobre HTTPS, aplica los headers de
  seguridad desde `vercel.json` y ejecuta las funciones serverless que haga
  falta, como `/api/health`.
- Ambos en plan gratuito.

La seguridad no vive en el navegador. Vive en las políticas RLS de Postgres,
que el servidor aplica en cada consulta y que no se pueden esquivar desde el
cliente. Por eso la llave pública de Supabase puede viajar en el código del
sitio sin que eso constituya una fuga: esa llave solo habilita lo que las
políticas permiten. La llave de servicio nunca entra al repositorio.

## Consecuencias

**A favor**

- Cero costo de operación, que es lo que el negocio puede sostener.
- Autenticación y control de acceso construidos por gente que se dedica a eso,
  en vez de escritos a mano bajo presión de calendario.
- Postgres relacional de verdad, con llaves foráneas, índices y RLS, que es
  exactamente lo que pide el entregable 5.
- Se conserva DT-01: no se agrega ninguna dependencia en ejecución, porque se
  consume la API REST con `fetch` en vez del SDK.
- Las 90 pruebas y la separación en tres capas siguen intactas. El backend
  entra por el borde de la aplicación, no por el centro.

**En contra**

- Dependencia de dos proveedores. Si Supabase cambia precios o cierra, hay que
  migrar, y eso significa reescribir la capa de acceso a datos.
- El plan gratuito de Supabase pausa los proyectos sin actividad. Para una
  tienda que vende a diario no es problema, pero sí lo sería en una semana
  muerta, y hay que saberlo.
- La llave pública viaja al cliente. Es seguro solo mientras las políticas RLS
  estén bien escritas. Un error ahí es una fuga real, así que las políticas
  necesitan pruebas, no confianza.
- El modelo de datos queda atado a Postgres y a la forma de trabajar de
  Supabase.

**Qué se sacrificó y por qué valió la pena para este cliente**

Se sacrificó el control sobre la infraestructura y la portabilidad. Los datos
de los clientes de Julio van a vivir en servidores que no administramos, y
cambiar de proveedor más adelante costará trabajo.

Valió la pena porque Julio es un comerciante solo, con una tienda chica y sin
presupuesto de operación. Para él, un servidor propio no es independencia: es
una factura mensual más y un sistema que nadie va a parchar cuando salga una
vulnerabilidad. Y escribir la autenticación a mano, en cinco semanas y sin
nadie que revise el código de seguridad, es la forma más probable de que los
nombres y teléfonos de sus clientes terminen expuestos.

Entre controlar la infraestructura y proteger los datos de sus compradores,
la decisión es proteger los datos.

## Cómo se revisaría esta decisión

Si el negocio crece al punto de necesitar varias sucursales, reportes pesados
o integraciones que Supabase no cubra, se reevalúa. El indicador concreto
sería que el plan gratuito deje de alcanzar o que una consulta necesaria no se
pueda expresar con RLS.
