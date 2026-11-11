# Arquitectura

Documento de arquitectura de la plataforma web de Dazzan Technology, en los
tres primeros niveles del modelo C4: contexto, contenedores y componentes.

**Estado al 9 de noviembre de 2026.** Este documento describe la arquitectura
objetivo. No todo está construido todavía. La tabla siguiente separa lo que ya
corre de lo que está decidido pero pendiente, para que nadie lea el diagrama
como si fuera un inventario de lo que existe hoy.

| Pieza | Estado |
|---|---|
| Catálogo público, filtros, búsqueda y lista de cotización | Construido |
| Capa de lógica pura con 90 pruebas | Construido |
| Integración continua en GitHub Actions | Construido |
| Despliegue en Vercel | Pendiente |
| Base de datos en Supabase | Pendiente |
| Autenticación y portal privado | Pendiente |
| Certificado de garantía imprimible | Pendiente |

---

## Nivel 1 — Contexto

Quién usa el sistema y con qué sistemas externos habla.

```mermaid
flowchart TB
  comprador["<b>Comprador</b><br/><i>persona</i><br/>Busca una computadora usada.<br/>Entra desde el teléfono, con internet inestable."]
  julio["<b>Julio, administrador</b><br/><i>persona</i><br/>Dueño del local. Carga inventario<br/>y emite la garantía de cada venta."]

  dazzan["<b>Plataforma Dazzan Technology</b><br/><i>sistema</i><br/>Catálogo público, panel de administración<br/>y certificado de garantía imprimible."]

  supabase["<b>Supabase</b><br/><i>sistema externo</i><br/>Postgres, autenticación y RLS"]
  whatsapp["<b>WhatsApp</b><br/><i>sistema externo</i><br/>Donde se cierra la venta"]
  impresora["<b>Impresora del local</b><br/><i>sistema externo</i><br/>Imprime la garantía"]
  datafono["<b>Datáfono del local</b><br/><i>sistema externo</i><br/>Emite la factura fiscal.<br/>Fuera del alcance."]

  comprador -->|"Consulta el catálogo<br/>y arma su lista"| dazzan
  julio -->|"Carga inventario<br/>y emite garantías"| dazzan
  julio -->|"Cobra la venta"| datafono
  dazzan -->|"Lee y escribe<br/>HTTPS / REST"| supabase
  dazzan -->|"Arma el mensaje<br/>con la cotización"| whatsapp
  dazzan -->|"Envía el certificado"| impresora

  classDef persona fill:#08427b,stroke:#052e56,color:#fff
  classDef sistema fill:#1168bd,stroke:#0b4884,color:#fff
  classDef externo fill:#999,stroke:#6b6b6b,color:#fff
  class comprador,julio persona
  class dazzan sistema
  class supabase,whatsapp,impresora,datafono externo
```

El datáfono aparece a propósito aunque el sistema no lo toque: deja explícito
que la factura fiscal no es responsabilidad de esta plataforma (RN-09).

---

## Nivel 2 — Contenedores

Las piezas desplegables y cómo se comunican.

```mermaid
flowchart TB
  subgraph navegador["Navegador del usuario"]
    spa["Sitio estático<br/>HTML + CSS + JS ES6<br/>Sin framework ni empaquetador"]
    sw["Service worker<br/>Cache de la carcasa<br/><i>pendiente</i>"]
  end

  subgraph vercel["Vercel"]
    cdn["Archivos estáticos<br/>HTTPS, headers de seguridad"]
    api["Funciones serverless<br/>/api/health<br/><i>pendiente</i>"]
  end

  subgraph sb["Supabase"]
    pg[("Postgres<br/>productos, clientes,<br/>garantias, perfiles")]
    auth["Auth<br/>sesión del administrador"]
    rls["Políticas RLS<br/>lectura pública,<br/>escritura solo admin"]
  end

  wa["WhatsApp"]
  imp["Impresora del local"]

  spa -->|descarga| cdn
  spa -->|"fetch, REST"| pg
  spa -->|"inicia sesión"| auth
  spa -->|"abre enlace"| wa
  spa -->|"window.print()"| imp
  sw -.->|"sirve sin red"| spa
  api -->|consulta| pg
  pg --- rls
  auth --- rls
```

El navegador habla con Supabase directamente por su API REST, sin servidor
propio en medio. Lo que protege los datos no es una capa intermedia sino las
políticas RLS de Postgres, que se aplican del lado del servidor y no se pueden
esquivar desde el cliente. Esa es la razón de que la llave pública pueda viajar
al navegador sin que eso sea una fuga.

---

## Nivel 3 — Componentes del sitio

Las tres capas del código, y cuál de ellas cruza al navegador.

```mermaid
flowchart LR
  subgraph logica["Capa de lógica — datos a datos"]
    config["config.js<br/>constantes"]
    utils["utils.js<br/>moneda, escape, redondeo"]
    producto["producto.js<br/>garantía, stock"]
    catalogo["catalogo.js<br/>filtro, búsqueda, orden"]
    cotizacion["cotizacion.js<br/>líneas, ISV, totales"]
  end

  subgraph vista["Capa de vista — datos a cadenas de HTML"]
    vprod["vista-producto.js"]
    vcot["vista-cotizacion.js"]
  end

  subgraph app["Capa de aplicación — toca el DOM"]
    main["main.js"]
    revelar["revelar.js"]
  end

  dom(["DOM del navegador"])

  config --> utils
  config --> producto
  config --> catalogo
  config --> cotizacion
  utils --> producto
  utils --> cotizacion
  producto --> vprod
  cotizacion --> vcot
  utils --> vprod
  utils --> vcot
  vprod --> main
  vcot --> main
  main --> dom
  revelar --> dom
```

La frontera está en la capa de aplicación: `main.js` y `revelar.js` son los
únicos dos archivos del proyecto que mencionan `document`. Todo lo que está a
su izquierda se prueba sin navegador y sin simular el DOM, y por eso las 90
pruebas corren en menos de medio segundo.

Las dependencias apuntan en una sola dirección. La lógica no conoce a la vista
y la vista no conoce a la aplicación. Un cambio de presentación nunca obliga a
tocar una regla de negocio.

---

## Flujo principal: la venta con garantía

Es el recorrido que justifica el proyecto. Julio hoy lo hace a mano.

```mermaid
sequenceDiagram
  actor J as Julio
  participant P as Panel privado
  participant S as Supabase
  participant I as Impresora

  J->>P: Inicia sesión
  P->>S: Valida credenciales
  S-->>P: Sesión activa
  J->>P: Busca el equipo por modelo
  P->>S: Consulta productos disponibles
  S-->>P: Resultados
  J->>P: Selecciona la unidad
  P->>P: Precarga modelo, serie, precio y plazo de garantía
  J->>P: Escribe los datos del comprador
  J->>P: Confirma la venta
  P->>S: Guarda la garantía y marca la unidad como vendida
  S-->>P: Confirmación
  P->>I: Abre el diálogo de impresión
  Note over P,I: El navegador nunca imprime en silencio.<br/>El flujo real es un clic y dos teclas.
```

La unidad se marca como vendida, no se borra. Si se borrara, la garantía
impresa se quedaría apuntando a un registro inexistente y Julio no podría
recuperarla cuando el cliente vuelva a reclamar. Está razonado en el ADR-002.

---

## Decisiones relacionadas

| Documento | Decisión |
|---|---|
| [ADR-001](adr/ADR-001-backend-gestionado.md) | Usar Supabase gestionado en vez de levantar un backend propio |
| [ADR-002](adr/ADR-002-productos-vendidos.md) | Marcar los productos vendidos en vez de borrarlos |
| `DECISIONES.md` DT-01 | JavaScript modular sin framework |
| `DECISIONES.md` DT-04 | Lógica pura separada del DOM |
| `DECISIONES.md` DT-07 | Alojar en Vercel y resolver el backend con Supabase |

## Atributos de calidad que condicionaron el diseño

| Atributo | Por qué importa aquí | Cómo se atiende |
|---|---|---|
| Funcionar con internet inestable | Los compradores entran desde el teléfono, con datos móviles | Sin framework, sin empaquetador, imágenes en WebP, service worker |
| Que el panel no requiera capacitación | Julio puede contratar a alguien y no va a dar un curso | Una sola pantalla con un buscador; las etiquetas usan las palabras de la libreta de papel |
| Que los datos privados no se filtren | El catálogo es público, las ventas y los clientes no | RLS en Postgres, no validación en el navegador |
| Poder reimprimir una garantía meses después | La garantía dura 3 o 6 meses y el cliente vuelve | Las unidades vendidas se conservan, no se borran |
| Costo cero de operación | Es una tienda de una persona | Planes gratuitos de Vercel y Supabase |
