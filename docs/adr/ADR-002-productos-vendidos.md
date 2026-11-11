# ADR-002 — Marcar los productos vendidos en vez de borrarlos

**Fecha:** 2026-11-09
**Estado:** Aceptada
**Decide:** Michael Salgado Leiva
**Relacionada:** RN-09, ADR-001

---

## Contexto

Julio pidió que cuando venda una computadora, esa computadora desaparezca del
sistema: que no la vea él en el buscador ni el cliente en el catálogo. Si le
llega otra igual, la agrega de nuevo a mano.

La forma literal de cumplirlo es borrar la fila. Y es la forma equivocada, por
algo que el pedido no menciona pero que el negocio sí necesita.

**El certificado de garantía es el documento de la venta.** La factura fiscal
la emite el datáfono (RN-09); lo que el sistema produce es la garantía, y esa
garantía dura tres o seis meses según el precio del equipo. Durante todo ese
tiempo el comprador puede volver al local con el papel en la mano.

Cuando eso pase, Julio necesita poder buscar esa venta: confirmar que la
garantía está vigente, ver qué unidad era, comprobar el número de serie y, si
el cliente perdió el papel, reimprimirlo.

Si la fila del producto se borró, la garantía guardada apunta a un registro
que ya no existe. El dato del equipo se perdió. No hay a qué volver.

Hay un segundo motivo, menos urgente pero real: sin historial de ventas no se
puede responder qué modelos rotan más rápido ni a qué precio se vendió algo el
mes pasado. Eso es lo primero que un comerciante quiere saber cuando el
sistema lleva unos meses funcionando.

## Alternativas consideradas

**Borrar la fila, como se pidió literalmente.** Descartada: rompe la garantía,
que es la función principal del sistema.

**Borrar el producto pero copiar sus datos dentro de la garantía.** Funciona
para reimprimir, porque la garantía quedaría completa por sí sola. Descartada
porque duplica la información del equipo en dos lugares y pierde el vínculo:
no se podría responder "cuántas Latitude 5430 vendí este año" sin comparar
textos sueltos.

**Mover las filas vendidas a una tabla aparte.** Descartada por complejidad sin
beneficio: obliga a buscar en dos tablas para cualquier consulta histórica y a
mantener dos esquemas que tienen que evolucionar igual.

## Decisión

**Marcar los productos vendidos en vez de borrarlos.**

El producto lleva un estado: `disponible` o `vendido`. Al emitir la garantía,
la unidad pasa a `vendido` y la garantía guarda su identificador.

- El catálogo público muestra solo las unidades `disponible`.
- El buscador del panel de administración muestra solo las `disponible`.
- El historial y las garantías consultan sin filtrar por estado.

Para Julio el efecto visible es idéntico a borrarlas: el equipo vendido
desaparece de las dos pantallas donde él trabaja. La diferencia está por
debajo.

## Consecuencias

**A favor**

- Una garantía se puede consultar y reimprimir durante toda su vigencia, que
  es para lo que existe.
- Queda historial de ventas sin haber construido nada extra para tenerlo.
- La relación entre garantía y producto se mantiene, así que las preguntas
  sobre rotación y precios se responden con una consulta.
- Deshacer una venta registrada por error es cambiar un estado, no recuperar
  datos borrados.

**En contra**

- Toda consulta de catálogo tiene que filtrar por estado. Un filtro olvidado
  muestra equipo vendido como si estuviera a la venta, y ese error es
  silencioso: nadie lo nota hasta que un cliente pregunta por algo que ya no
  está. Mitigación: el filtro vive en una sola función de `catalogo.js`, con
  su prueba, en vez de repetirse en cada consulta.
- La tabla crece indefinidamente. Para el volumen de una tienda chica es
  irrelevante durante años.
- Una unidad vendida sigue ocupando espacio con datos que ya no se venden.

**Qué se sacrificó**

La simplicidad de un `DELETE`. A cambio, el sistema puede responder la pregunta
que el negocio sí le va a hacer: "este cliente volvió con esta garantía, ¿qué
le vendí y cuándo?".

## Nota sobre el pedido del cliente

Julio pidió borrar. Se implementa marcar. No es ignorar al cliente: es
distinguir entre lo que pidió y lo que necesita. Lo que pidió —que el equipo
vendido no aparezca— se cumple exactamente. Lo que no pidió, porque no tiene
por qué saberlo, es que borrar la fila le costaría la garantía que él mismo
quiere automatizar.

Esta distinción se le explica cuando se le muestre el panel, no se le oculta.
