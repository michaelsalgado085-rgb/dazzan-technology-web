# ADR-002 — Marcar los productos vendidos en vez de borrarlos

**Fecha:** 2026-11-09
**Revisada:** 2026-11-12, al recibir del cliente la factura y las condiciones
de garantía reales. La decisión no cambió; se corrigió el contexto.
**Estado:** Aceptada
**Decide:** Michael Salgado Leiva
**Relacionada:** RN-02, RN-09, ADR-001

---

## Contexto

Julio pidió que cuando venda una computadora, esa computadora desaparezca del
sistema: que no la vea él en el buscador ni el cliente en el catálogo. Si le
llega otra igual, la agrega de nuevo a mano.

La forma literal de cumplirlo es borrar la fila. Y es la forma equivocada, por
algo que el pedido no menciona pero que el negocio sí necesita.

**La factura es también el respaldo de la garantía.** El sistema emite la
factura del negocio y, en el reverso, las condiciones de garantía (RN-09). Esas
condiciones dicen que para reclamar "el cliente deberá presentar esta hoja o
comprobante de compra", y que el plazo corre desde la fecha de compra indicada
en el documento. La garantía dura tres meses (RN-02), y durante ese tiempo el
comprador puede volver al local con el papel en la mano, o sin él.

Cuando eso pase, Julio necesita poder buscar esa venta: confirmar que la
garantía está vigente, ver qué equipo era y, si el cliente perdió la hoja,
reimprimirla.

Si la fila del producto se borró, la factura guardada apunta a un registro que
ya no existe. El dato del equipo se perdió. No hay a qué volver.

Hay un segundo motivo, menos urgente pero real: sin historial de ventas no se
puede responder qué modelos rotan más rápido ni a qué precio se vendió algo el
mes pasado. Eso es lo primero que un comerciante quiere saber cuando el
sistema lleva unos meses funcionando.

## Alternativas consideradas

**Borrar la fila, como se pidió literalmente.** Descartada: rompe la consulta y
la reimpresión de la factura, que es la función principal del sistema.

**Borrar el producto pero copiar sus datos dentro de la factura.** Funciona
para reimprimir, porque la factura quedaría completa por sí sola. Descartada
como solución única porque pierde el vínculo: no se podría responder "cuántas
Latitude 5430 vendí este año" sin comparar textos sueltos. La factura sí
guarda una copia del precio y la descripción del momento de la venta, pero
además conserva la referencia al producto.

**Mover las filas vendidas a una tabla aparte.** Descartada por complejidad sin
beneficio: obliga a buscar en dos tablas para cualquier consulta histórica y a
mantener dos esquemas que tienen que evolucionar igual.

## Decisión

**Marcar los productos vendidos en vez de borrarlos.**

La fila del producto nunca se elimina al vender. Al emitir la factura se
descuentan las existencias, y un producto sin existencias deja de ofrecerse.

- El catálogo público muestra solo lo que tiene existencias.
- El buscador del panel de administración muestra solo lo que tiene
  existencias.
- El historial de facturas consulta sin ese filtro.

Para Julio el efecto visible es idéntico a borrarlas: el equipo vendido
desaparece de las dos pantallas donde él trabaja. La diferencia está por
debajo.

## Consecuencias

**A favor**

- Una factura se puede consultar y reimprimir durante toda la vigencia de la
  garantía y después.
- Queda historial de ventas sin haber construido nada extra para tenerlo.
- La relación entre factura y producto se mantiene, así que las preguntas
  sobre rotación y precios se responden con una consulta.
- Anular una factura emitida por error es revertir un estado, no recuperar
  datos borrados.

**En contra**

- Toda consulta de catálogo tiene que filtrar por existencias. Un filtro
  olvidado muestra equipo vendido como si estuviera a la venta, y ese error es
  silencioso: nadie lo nota hasta que un cliente pregunta por algo que ya no
  está. Mitigación: el filtro vive en una sola función de `catalogo.js`, con
  su prueba, en vez de repetirse en cada consulta.
- La tabla crece indefinidamente. Para el volumen de una tienda chica es
  irrelevante durante años.

**Qué se sacrificó**

La simplicidad de un `DELETE`. A cambio, el sistema puede responder la pregunta
que el negocio sí le va a hacer: "este cliente volvió a reclamar la garantía,
¿qué le vendí y cuándo?".

## Nota sobre el pedido del cliente

Julio pidió borrar. Se implementa marcar. No es ignorar al cliente: es
distinguir entre lo que pidió y lo que necesita. Lo que pidió —que el equipo
vendido no aparezca— se cumple exactamente. Lo que no pidió, porque no tiene
por qué saberlo, es que borrar la fila le costaría poder consultar la venta que
respalda la garantía.

Esta distinción se le explica cuando se le muestre el panel, no se le oculta.

## Nota sobre la revisión del 12 de noviembre

La primera versión de este documento decía que el sistema emitía solo un
certificado de garantía y que la factura la sacaba el datáfono. Eso se escribió
a partir de una descripción de segunda mano, antes de ver el documento real.
Cuando el cliente envió su factura y aclaró que el datáfono no tiene relación
con ella, se corrigió el contexto. La decisión de no borrar se sostiene igual,
y con más razón: ahora lo que se perdería al borrar es la factura completa.
