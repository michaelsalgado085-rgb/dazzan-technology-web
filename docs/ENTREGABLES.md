# Entregables del proyecto final

Transcripcion de los 14 entregables del reto "Proyecto final - Tu producto,
version ingeniero". Calificacion por sustentacion con el profesor; la mayoria
se verifica de forma automatica contra el repo y el sitio en vivo.

Codigo de verificacion del curso: `LEARN-CAP-F805AE8B`
Debe aparecer en el README del repo, en el sitio (meta tag o `/verificacion.txt`)
y en la presentacion.

> Nota de estilo: este documento se escribe sin tildes para mantener la
> consistencia con el resto de `docs/`. El contenido es fiel al enunciado.

## Estado general

| # | Entregable | Verificacion | Estado |
|---|---|---|---|
| 1 | Cliente real y feature construida | Manual (texto) | Completado |
| 2 | Repositorio del producto | Automatica | En progreso |
| 3 | Producto publicado en un dominio real | Automatica | Pendiente |
| 4 | Arquitectura: C4 + 2 ADRs | Automatica | Pendiente |
| 5 | Modelo de datos exportado (JSON) | Automatica | Pendiente |
| 6 | Calidad de codigo: cobertura + SonarCloud | Automatica | Pendiente |
| 7 | PWA y funcionamiento offline | Automatica | Pendiente |
| 8 | Seguridad y control de acceso | Automatica | Pendiente |
| 9 | Tests y pipeline de CI | Automatica | Pendiente |
| 10 | Presentacion del producto (HTML autocontenido) | Automatica | Pendiente |
| 11 | Acceso demo y recorrido guiado | Automatica | Pendiente |
| 12 | Bitacora de IA (commits verificados) | Automatica | Pendiente |
| 13 | Evidencias (capturas) | Manual (fotos) | Pendiente |
| 14 | Reflexion final | Manual (texto) | Pendiente |

Progreso declarado por la plataforma al momento de la captura: 1 de 14.

---

## 1. Cliente real y feature construida

Describir el cliente real (nombre, negocio, como lo conociste), la feature
especifica que construiste y que problema concreto le resuelve. Es el unico
entregable narrativo grande: todo lo demas se verifica solo. En la sustentacion
el profesor puede contactar al cliente.

Ejemplo del enunciado: cliente de pulperia, feature de registro de fiados con
busqueda por nombre y saldo con mora automatica, usuaria de 62 anios con
Android viejo e internet inestable.

**Estado:** redactado y marcado como "Lista para enviar".
Cliente: Julio Alezandro Salgado Leiva, duenio de Dazzan Technology, local A en
Barrio Guadalupe, 19 calle, a media cuadra de Av. Junior, San Pedro Sula.
Negocio: venta de laptops y computadoras de escritorio usadas en buen estado
con garantia propia (6 meses en gama alta, 3 meses en equipo bajo L 15,000),
ademas de teclados, mouse y auriculares nuevos. Capta clientes con publicidad
pagada en TikTok, Instagram y Facebook; la gente escribe por mensaje directo y
la venta se cierra presencial en el local.

---

## 2. Repositorio del producto

URL publica del repo en GitHub. Se verifica automaticamente:

- Historia real de commits: **minimo 25 commits en minimo 5 dias distintos**
  (un repo armado la ultima noche no pasa).
- README sustancial.
- Suite de tests.
- Workflows de CI.
- Que NO haya secretos versionados (`.env`, llaves, tokens).
- Que el codigo de verificacion este pegado en el README (prueba de autoria).

Campo a llenar: URL del repositorio.
Puntaje: pasar la seccion (>=70) otorga +25 XP, una sola vez.

**Estado actual:** 11 commits en un solo dia. Faltan 14 commits y 4 dias
distintos. README, tests, CI y ausencia de secretos ya cumplen.

---

## 3. Producto publicado en un dominio real

El producto vivo en una URL publica HTTPS (dominio propio o
Vercel/Netlify/GitHub Pages; una IP o localhost no cuentan). Se pegan 4 URLs y
se verifica:

- ~20 checks de PWA (manifest completo + service worker + icons).
- Responsive real (`@media`).
- SEO y Open Graph.
- Headers de seguridad.
- 404 manejado.
- `robots.txt`.
- Login real.
- Portal privado que NO filtre contenido sin sesion.
- Healthcheck de la API en JSON.
- Codigo de verificacion publicado.

Campos a llenar:

| Campo | Ejemplo del enunciado |
|---|---|
| URL del sitio (raiz) | `https://mi-producto.vercel.app` |
| URL de la pagina de login | `https://mi-producto.vercel.app/login` |
| URL del portal privado (requiere sesion) | `https://mi-producto.vercel.app/admin` |
| URL del healthcheck de la API (JSON) | `https://mi-producto.vercel.app/api/health` |

Es el entregable de mayor peso. Se puede corregir y volver a verificar las
veces que se quiera.

---

## 4. Arquitectura: C4 + 2 ADRs en el repo

No se escribe en la plataforma: se escribe en el repo y ellos lo leen. Se sube
un documento de arquitectura con diagrama C4 (Mermaid) y DOS ADRs con formato
real (Contexto / Decision / Consecuencias). Se declaran las rutas y el titulo
exacto del ADR-1, y el sistema verifica que esos archivos existan y digan lo
que se declaro.

Campos a llenar:

| Campo | Requisito | Ejemplo |
|---|---|---|
| Ruta del documento de arquitectura | Debe contener un bloque ` ```mermaid ` con `C4Context`, `flowchart` o `graph` | `docs/arquitectura.md` |
| Ruta del ADR-1 | Debe tener las secciones Contexto, Decision y Consecuencias | `docs/adr/ADR-001-persistencia.md` |
| Titulo exacto de la decision del ADR-1 | Se verifica que ese texto aparezca dentro del archivo declarado | `Usar SQLite embebido en vez de Postgres gestionado` |
| Ruta del ADR-2 | - | `docs/adr/ADR-002-auth.md` |

Pregunta abierta: **Que sacrificaste en el ADR-1 y por que valio la pena para
TU cliente?**

---

## 5. Modelo de datos exportado (JSON)

Exportar el esquema REAL de la base de datos a `docs/db-export.json` con este
formato exacto:

```json
{
  "generado_at": "2026-08-01T10:00:00Z",
  "motor": "postgres",
  "tablas": [
    {
      "nombre": "clientes",
      "filas": 42,
      "columnas": [
        { "nombre": "id", "tipo": "uuid", "pk": true, "nulo": false },
        { "nombre": "nombre", "tipo": "text", "nulo": false }
      ],
      "indices": ["idx_clientes_nombre"],
      "relaciones": [{ "columna": "cliente_id", "referencia": "clientes.id" }],
      "politicas_rls": ["clientes_select_propias"]
    }
  ]
}
```

Se exige:

- >=5 tablas, TODAS con llave primaria.
- >=2 relaciones entre tablas.
- >=1 indice.
- >=3 tablas con datos reales.
- Politicas de acceso en >=2 tablas.
- Export generado en los ultimos 45 dias.

Los numeros declarados deben COINCIDIR con el archivo.

Campos a llenar: cuantas tablas tiene la base de datos; cuantas relaciones
(llaves foraneas) se declararon; nombre exacto de la tabla con mas filas; y
que decision de modelado se tomo (normalizar o duplicar un dato) y que costo.

---

## 6. Calidad de codigo: cobertura + SonarCloud

Dos artefactos que se leen directo de la fuente:

**(a) Cobertura.** Generar el reporte y commitear
`coverage/coverage-summary.json` (formato Istanbul) o `coverage/lcov.info`.
Se exige **>=60% de lineas**.

**(b) SonarCloud.** Crear un proyecto PUBLICO en sonarcloud.io conectado al
repo y correr el analisis. Se lee su API en vivo:

- Quality gate en OK.
- 0 bugs.
- 0 vulnerabilidades.
- <=50 code smells.
- <=5% duplicacion.
- >=400 lineas analizadas (proyecto de tamanio real).

Campos a llenar: project key de SonarCloud (el de la URL, proyecto publico);
porcentaje de cobertura de lineas; cuantos code smells reporta Sonar; SHA del
commit donde se corrigio un code smell (se verifica que el commit exista); y
que smell se corrigio, por que Sonar lo marcaba y que se hizo.

---

## 7. PWA y funcionamiento offline

Se declaran datos exactos del service worker y del manifest, y los contrastan
con los archivos reales.

Campos a llenar:

| Campo | Requisito | Ejemplo |
|---|---|---|
| Ruta del service worker en el repo | - | `public/sw.js` |
| Nombre EXACTO del cache | El string que se pasa a `caches.open()`; se verifica dentro del archivo | `fiados-v3` |
| Valor exacto de `start_url` en el manifest | Se compara con el manifest que sirve el sitio en vivo | `/index.html` |
| Estrategia principal del service worker | Seleccion de una lista | - |

Pregunta abierta: **Que funciona sin internet, que NO, y por que se trazo ahi
la frontera?**

---

## 8. Seguridad y control de acceso

Se declara un header de seguridad configurado y su valor exacto; van al sitio
en vivo a comprobar que efectivamente se envia, y al repo a comprobar que esta
en el archivo de configuracion. Ademas prueban la ruta privada SIN sesion: si
devuelve contenido, es fuga y se marca en rojo.

Campos a llenar:

| Campo | Ejemplo |
|---|---|
| Nombre del header de seguridad | `Content-Security-Policy` |
| Valor exacto (o un fragmento) | `default-src 'self'` |
| Ruta del archivo donde se configuro | `vercel.json` |

Pregunta abierta: **Contra que ataque concreto protege ese header y que pasaria
en TU app sin el?**

---

## 9. Tests y pipeline de CI

Se declara donde viven los tests y el nombre exacto de uno de ellos; abren el
archivo y lo buscan. Tambien verifican que el pipeline exista y que haya
corrido en verde al menos una vez (API de GitHub Actions).

Campos a llenar:

| Campo | Requisito | Ejemplo |
|---|---|---|
| Ruta del archivo de tests principal | - | `tests/mora.test.js` |
| Nombre EXACTO de un caso de prueba | El string que se pasa a `it()`/`test()` | `calcula mora de 0 dias como cero` |
| Cuantos casos de prueba tiene ese archivo | - | - |
| Ruta del workflow de CI | - | `.github/workflows/ci.yml` |

Pregunta abierta: **Que decidiste NO testear y por que? Que pasa si un paso del
pipeline falla?**

---

## 10. Presentacion del producto (HTML autocontenido)

Un UNICO archivo HTML publicado que a la vez vende y explica el producto:
mitad landing, mitad manual. Requisitos verificados automaticamente:

- AUTOCONTENIDO: un solo archivo, sin CSS/JS de terceros (todo inline,
  imagenes como `data:` URI).
- 8 SECCIONES: problema, solucion, funcionalidades, arquitectura, tecnologias,
  manual de uso paso a paso, cliente y autor.
- >=3 visuales embebidos (capturas en `data:` URI o SVG inline).
- >=700 palabras de contenido real.
- Responsive (meta viewport).
- Enlaces al producto en vivo y al repo.
- Codigo de verificacion pegado (prueba de autoria).

Se publica donde se quiera (sitio propio, GitHub Pages) y se pega la URL.

---

## 11. Acceso demo y recorrido guiado

El profesor tiene que poder entrar y usar la feature en 5 minutos sin ayuda.
Se entrega un usuario DEMO (nunca las credenciales reales del cliente) y 4
pasos con la URL exacta de cada uno; verifican que todas respondan y
pertenezcan al dominio del proyecto.

Campos a llenar: usuario demo; contrasenia demo; Paso 1 - URL; Paso 2 - URL;
Paso 3 - URL; Paso 4 - URL; y el guion de que hace el profesor en cada paso y
que deberia ver.

---

## 12. Bitacora de IA (con commits verificados)

Usar IA esta bien; ocultarlo no. Se seniala DOS commits reales del repo donde
la IA propuso algo y el autor lo corrigio o lo rechazo. Verifican que los SHAs
existan en el repositorio: no se pueden inventar.

Campos a llenar: SHA del commit 1; que propuso la IA en ese commit, que se
corrigio y con que principio se justifica; SHA del commit 2; lo mismo para el
segundo commit; y que herramienta/modelo se uso y para que NO se uso.

Ejemplo del enunciado para el ultimo campo: andamiaje con IA; el modelo de
datos y los tests hechos por el autor.

---

## 13. Evidencias (capturas)

Al menos 3 capturas que prueben que todo funciona de verdad. Minimo 3 de 4
fotos; cada foto se reduce automaticamente a maximo 1280px en su lado largo.

| Foto | Que debe mostrar |
|---|---|
| Pipeline verde | Run de GitHub Actions en verde |
| PWA instalada en un telefono | El producto como app: icono en el home screen o pantalla standalone |
| Tablero de SonarCloud | Quality gate y metricas del proyecto |
| El cliente usando el producto | Foto del cliente real usandolo, con su permiso |

---

## 14. Reflexion final

Sin relleno. Preguntas:

- Que fue lo mas dificil de PUBLICAR un producto real (vs disenarlo en papel)?
- Que del curso aplicaste y que te falto?
- Que harias distinto con un mes mas?
- Que le dirias al vos de hace 4 meses?
