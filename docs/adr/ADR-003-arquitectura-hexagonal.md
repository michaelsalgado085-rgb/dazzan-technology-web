# ADR-003 — Arquitectura hexagonal: el dominio en el centro

**Fecha:** 2026-11-19
**Estado:** Aceptada
**Decide:** Michael Salgado Leiva
**Relacionada:** ADR-001, DT-04, DT-13, DT-14

---

## Contexto

Hasta hoy el código estaba separado en tres capas (lógica, vista y
aplicación), pero tenía tres problemas que la regla de dependencia no permite:

1. **El dominio conocía a WhatsApp.** `cotizacion.js` armaba el enlace
   `wa.me` con el número del negocio. Cambiar de canal obligaba a tocar una
   regla de negocio.
2. **No había repositorio.** `main.js` hacía `fetch` del archivo JSON
   directamente. Pasar el catálogo a Supabase (ADR-001) obligaba a reescribir
   el punto de entrada.
3. **Las reglas de la factura vivían solo en Postgres.** La función
   `emitir_factura` validaba pagos, descuentos y existencias dentro de la
   base. Si mañana conviene otro proveedor, las reglas se pierden con él, y
   no se pueden probar sin una base de datos.

## Alternativas consideradas

**Dejar las capas como estaban.** Funciona hoy, pero cada adaptador nuevo
(Supabase, el panel, la impresión) iba a entrar al centro. Descartada: es la
deuda que más rápido crece en este proyecto.

**Reglas solo en la base de datos.** Una sola fuente de verdad y garantía
total ante accesos directos a la API. Descartada como única capa: el dominio
quedaría atado a Postgres y las reglas solo se probarían con una base real.

**Reglas solo en JavaScript.** El dominio queda limpio, pero JavaScript no
puede garantizar que dos personas facturando al mismo segundo no reciban el
mismo número, ni impedir que alguien con sesión llame la API saltándose el
panel. Descartada como única capa.

## Decisión

**Arquitectura hexagonal (puertos y adaptadores) con el dominio en el centro.**

```
assets/js/
  config.js, utils.js       compartido, sin dependencias de ninguna capa
  dominio/                  reglas de negocio puras
  casos-de-uso/             orquestación; definen los puertos que necesitan
  adaptadores/entrada/      pantalla: eventos, vistas, avisos
  adaptadores/salida/       repositorio JSON, WhatsApp; luego Supabase
```

- Las dependencias apuntan siempre hacia adentro. `tests/arquitectura.test.js`
  lo verifica en cada PR: si el dominio importa un adaptador o menciona el
  navegador, la red o WhatsApp, CI falla.
- Los casos de uso declaran sus puertos (`RepositorioProductos`,
  `RepositorioFacturas`) en idioma del negocio. Los adaptadores los cumplen y
  las pruebas usan falsos en memoria.
- `main.js` es la raíz de composición: el único lugar que decide qué
  adaptador cumple cada puerto.
- **Las reglas viven en el dominio y la base de datos queda como respaldo.**
  `dominio/factura.js` tiene todas las reglas de la factura y es lo que se
  prueba y se explica. La base conserva sus restricciones y la transacción
  de `emitir_factura` (DT-13) solo para lo que JavaScript no puede
  garantizar: concurrencia y acceso directo a la API. Es defensa en
  profundidad, no una segunda fuente de reglas.

## Consecuencias

**A favor**

- Cambiar Supabase por otro proveedor es escribir un adaptador nuevo; el
  dominio y los casos de uso no se tocan.
- Las reglas del negocio se prueban sin navegador, sin red y sin base de
  datos, en milisegundos.
- Una factura inválida se rechaza antes de viajar por la red y no gasta un
  número.
- La regla de dependencia deja de ser una convención: es una prueba.

**En contra**

- Las reglas críticas de la factura existen en dos lugares: el dominio en
  JavaScript y las restricciones de Postgres. Si una cambia, hay que cambiar
  las dos. Mitigación: cada regla lleva su número RN en ambos lados y las dos
  suites de pruebas la verifican.
- Más carpetas y archivos para un proyecto chico. Se acepta porque el panel y
  la factura van a duplicar el tamaño del código.

## Patrones que aparecieron

No se impusieron: aparecieron al refactorizar.

| Patrón | Dónde | Por qué apareció |
|---|---|---|
| Repository | `casos-de-uso/cargar-catalogo.js` y `adaptadores/salida/repositorio-productos-json.js` | El catálogo va a cambiar de origen |
| Adaptador (hexagonal) | `adaptadores/salida/whatsapp.js` | El dominio conocía a WhatsApp |
| Strategy | `ordenarProductos` (`COMPARADORES`) y `erroresDeFactura` (`VALIDACIONES`) | Variantes que crecen sin tocar la función |

Factory aparece cuando existan dos repositorios de productos (JSON y
Supabase). Observer, cuando haya un evento con varios interesados. Singleton
se evita: el estado de la página es privado de `main.js`.
