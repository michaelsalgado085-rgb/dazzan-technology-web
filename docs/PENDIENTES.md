# Pendientes

Lo que está anotado para hacer, para que no se pierda en los chats. Cuando algo
se termina, se quita de aquí: el historial de Git guarda cómo se resolvió.

Última revisión completa: 12 de noviembre de 2026.

---

## 1. Cambios al código que ya decidió el cliente

El 12 de noviembre Julio envió su factura, sus condiciones de garantía y
respondió dos rondas de preguntas. Lo que quedó mal en lo ya construido (el ISV
sumado al total y la garantía de 6 meses) se corrigió ese mismo día. Queda lo
nuevo.

### RC-07 — Factura con garantía desde el panel
**Prioridad:** alta. Es la funcionalidad principal del proyecto.
**Reglas:** RN-09 a RN-16. **Requisitos:** RF-23 a RF-30.
**Qué lleva la factura,** según la plantilla del cliente:
- Encabezado con logo, datos del negocio (razón social y RTN, desde
  configuración), número de factura y fecha.
- Cliente: nombre y, opcional, RTN o identidad.
- Detalle por línea: cantidad, descripción, marca y modelo, número de serie
  (opcional), precio unitario, descuento y total.
- Método de pago: efectivo, tarjeta, transferencia o financiamiento.
- Subtotal, descuento adicional y total. Sin línea de ISV; debajo del total,
  la leyenda "Precios con ISV incluido", igual que en el catálogo.
- Texto de garantía y condiciones, y el plazo con su fecha.
- Datos fiscales (RTN, CAI, rango autorizado, fecha límite) vacíos.
- Pie con Instagram y teléfono.

**Reverso:** recomendaciones de uso, términos y condiciones, y procedimiento
para solicitar garantía. Texto fijo, entregado por el cliente.
**Impresión:** dos acciones separadas, frente y reverso (DT-11).
**No subir al repositorio** la factura de ejemplo: trae el nombre de un cliente
real.

### RC-04 — Restricción de diseño: el panel se usa sin capacitación
Hoy solo Julio usa el sistema; ha dicho que le gustaría contratar a alguien.
- La pantalla principal del panel es un buscador. Sin menú ni tablero.
- De buscar el equipo a tener la factura lista: un clic.
- Las etiquetas usan las mismas palabras que la factura del cliente.
- No se construyen pantallas de usuarios, invitaciones ni permisos (YAGNI). Sí
  se deja la columna `rol` en perfiles y quién emitió cada factura.

---

## 2. Reglas de negocio

Todas las reglas de la factura quedaron confirmadas por el cliente el 12 de
noviembre y están en `REQUISITOS.md`, RN-08 a RN-18. No queda ninguna por
confirmar. Antes de programar una regla nueva, se confirma (R-09).


---

## 3. Deuda técnica

### DT-P1 — Partir `assets/css/base.css`
El archivo pasó de 594 a unas 900 líneas. El límite de `ESTANDARES.md` es ~200.
Se parte en `base.css`, `catalogo.css`, `cotizacion.css` y `portada.css`. Lo
escribe Michael; es la evidencia R-02 de la bitácora. Prioridad media: no
afecta la nota de forma directa, pero es el único archivo que viola SRP.

### DT-P3 — Imágenes de los productos
Se usarán las fotos oficiales del fabricante por modelo, igual que en la
publicidad actual del negocio (RN-05). Descargarlas de las galerías de prensa
de cada marca, no de buscadores. `marcoImagen()` ya usa la foto cuando el
producto trae la clave `imagen`.

### DT-P4 — Alcance de la cobertura
El entregable 6 exige 60% de líneas. Falta `vitest.config.js` con
`coverage.include` y decidir si `main.js` y `revelar.js` se excluyen o se
prueban con jsdom. La decisión se registra en `DECISIONES.md`.

### DT-P7 — Ruta del catálogo soldada en `main.js`
`RUTA_CATALOGO` va a `CONFIG`. Se resuelve solo cuando el catálogo pase a
leerse de Supabase: ahí la URL y la llave pública entran por configuración.

### DT-P8 — El número de WhatsApp está repetido
Vive en `CONFIG.WHATSAPP` y además escrito en `index.html` (portada, pie y
botón flotante) y en `404.html`. Decidir: armarlo desde `CONFIG` con JavaScript,
o aceptarlo como excepción documentada para que los enlaces funcionen sin JS.

### DT-P9 — Versionado semántico
`package.json` sigue en `0.1.0`. Subir a `0.2.0` y dejar dicho en
`CONTRIBUTING.md` cuándo se sube. `api/health.js` lee esa versión.

### DT-P10 — Pruebas de integración y E2E
Hoy hay solo unitarias. Con Supabase hacen falta algunas de integración contra
la API real y un par de E2E del flujo crítico: entrar al panel, emitir una
factura, y comprobar que el panel no entrega contenido sin sesión.

### DT-P11 — Plan de rollback
Al publicar, documentar en el README cómo se revierte un despliegue en Vercel y
cómo se reactiva el proyecto de Supabase si se pausa por inactividad.

### DT-P12 — La regla de tildes de `ESTANDARES.md` contradice a los documentos
La regla dice que los documentos de `docs/` van sin tildes, pero siete de los
nueve están escritos con tildes, incluido `REQUISITOS.md`. La regla está mal,
no los documentos: lo que va sin tildes son los identificadores. Corregir la
tabla de `ESTANDARES.md`.

### DT-P13 — `robots.txt` anuncia la ruta del panel
`Disallow: /admin` impide que el buscador lea un `noindex` y además publica la
ruta. Propuesta: quitar esa línea y poner `noindex` en el login y en el panel.
Pendiente de decisión.

### DT-P14 — Auditoría de las pruebas existentes
Las pruebas escritas hasta el 11 de noviembre son especificación circular
(R-09). Las de totales, garantía, stock y existencias ya se rehicieron desde
las reglas confirmadas y se comprobaron con mutantes. Falta revisar igual las
de `catalogo`, `utils` y las dos vistas.

---

### DT-P15 — El modo oscuro forzado vuelve ilegible el botón principal
Detectado el 12 de noviembre en una captura de Opera GX con "forzar páginas
oscuras": el texto de "Ver el catálogo" pasa de carbón a blanco sobre el verde
#90FE69, que es el contraste de 1.3:1 que la marca prohíbe. Samsung Internet
tiene un modo oscuro que hace lo mismo y es común entre los clientes del
negocio. Qué hacer: probar en un teléfono Samsung real; declarar
`color-scheme` en el CSS y en un `<meta>`, y si el navegador lo ignora, decidir
entre diseñar un modo oscuro propio o cambiar el botón a un color que aguante
la inversión. Verificar el arreglo en el teléfono, no solo en la computadora.

---

## 4. Infraestructura

| Paso | Estado |
|---|---|
| Archivos de despliegue (`vercel.json`, 404, robots, sitemap, healthcheck) | En `main` |
| Crear cuenta en Vercel e importar el repositorio | Pendiente, lo hace Michael |
| Verificar en vivo headers, 404 y `/api/health` | Pendiente |
| Crear el proyecto en Supabase | Pendiente |
| Esquema: `categorias`, `productos`, `clientes`, `facturas`, `factura_lineas`, `perfiles`, `configuracion` | Pendiente |
| Políticas RLS y sus pruebas | Pendiente |
| Tarea programada que consulta `/api/health` para vigilar el sitio y evitar la pausa por inactividad | Pendiente |
| Respaldo y `docs/db-export.json` generados por script | Pendiente |
| Manifest y service worker | Pendiente |
| SonarCloud | Pendiente |

## 5. Decisiones sin tomar

### DP-2 — Dominio propio
Pendiente de la respuesta del ingeniero: si acepta el subdominio de Vercel, si
basta comprar solo el dominio y apuntarlo a Vercel, y si acepta Supabase en plan
gratuito. Al conectar un dominio cambian dos líneas: la URL de `robots.txt` y la
de `sitemap.xml`.

### DP-3 — Autorización fiscal
El cliente debe consultar con su contador si una factura emitida por sistema
necesita CAI u otro trámite. Mientras tanto el sistema imprime esos campos
vacíos, como la plantilla actual (RN-16).

## 6. Herramientas

### HP-1 — `CLAUDE.md` para Claude Code
Claude Code corre en la terminal y puede ejecutar pruebas y commits, pero
arranca de cero en cada sesión. Si se llega a usar, escribir un `CLAUDE.md` con
el stack, los estándares, los principios y las reglas de Git.

---

## 7. Estado de los entregables

| # | Entregable | Estado |
|---|---|---|
| 1 | Cliente y feature | Reescribir alrededor de la factura cuando esté construida |
| 2 | Repositorio | Commits de sobra. 5 días por fecha local, 3 por UTC: faltan dos días con commits diurnos |
| 3 | Producto publicado | Configuración lista; falta publicar, login, portal y PWA |
| 4 | Arquitectura y ADRs | Documentos corregidos el 12 de noviembre; listo para enviar tras el merge |
| 5 | Modelo de datos | Pendiente de Supabase |
| 6 | Cobertura y SonarCloud | Pendiente |
| 7 | PWA | Iconos listos; faltan manifest y service worker |
| 8 | Seguridad | Headers escritos; falta verlos en vivo y proteger el panel |
| 9 | Tests y CI | CI en verde, 92 pruebas |
| 10 | Presentación HTML | Pendiente |
| 11 | Acceso demo | Pendiente del panel |
| 12 | Bitácora de IA | Un SHA disponible (`1d85d01`); ver `BITACORA-IA.md` |
| 13 | Evidencias | Pendiente |
| 14 | Reflexión final | Pendiente |
