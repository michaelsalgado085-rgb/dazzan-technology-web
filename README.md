# Dazzan Technology — Sitio Web

[![CI](https://github.com/michaelsalgado085-rgb/dazzan-technology-web/actions/workflows/ci.yml/badge.svg)](https://github.com/michaelsalgado085-rgb/dazzan-technology-web/actions/workflows/ci.yml)
[![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-00275B.svg)](LICENSE)

Catálogo web para **Dazzan Technology**, tienda de laptops y computadoras de
escritorio usadas con garantía, además de teclados, mouse y auriculares nuevos,
ubicada en San Pedro Sula, Honduras.

> **Código de verificación del curso:** `LEARN-CAP-F805AE8B`

---

## El problema

El negocio capta clientes con publicidad pagada en TikTok, Instagram y Facebook.
La gente escribe por mensaje directo y casi siempre pregunta lo mismo: cuánto
cuesta, si todavía hay y qué especificaciones trae. El dueño responde una por
una, y cada modelo nuevo exige diseñar una imagen publicitaria aparte que queda
desactualizada apenas cambia el precio.

## La solución

Un enlace único para las tres biografías de redes, donde el cliente consulta
precio, disponibilidad, especificaciones y garantía por su cuenta, arma una
lista y la envía por WhatsApp con el mensaje ya redactado.

---

## Stack

| Capa | Tecnología |
|---|---|
| Marcado | HTML5 semántico |
| Estilos | CSS3 con custom properties, sin frameworks |
| Lógica | JavaScript ES6 modular, sin dependencias en ejecución |
| Pruebas | Vitest |
| Análisis estático | ESLint |
| Integración continua | GitHub Actions |

El sitio se sirve sin paso de compilación. Node.js se usa únicamente para
ejecutar pruebas y análisis estático en desarrollo.

---

## Estructura

```
dazzan-technology-web/
├─ index.html
├─ assets/
│  ├─ css/base.css          Tokens de marca y estilos base
│  ├─ js/
│  │  ├─ config.js          Constantes del sistema
│  │  ├─ utils.js           Moneda, ISV, escapado, normalización
│  │  ├─ producto.js        Stock, garantía, descuentos
│  │  ├─ catalogo.js        Filtrado, búsqueda, ordenamiento
│  │  ├─ cotizacion.js      Lista de cotización y enlace de WhatsApp
│  │  └─ main.js            Punto de entrada
│  └─ img/
├─ data/productos.json      Fuente única del catálogo
├─ tests/                   Pruebas unitarias
├─ docs/                    Requisitos, estándares y decisiones
└─ .github/workflows/ci.yml Integración continua
```

---

## Ejecución local

```bash
git clone https://github.com/michaelsalgado085-rgb/dazzan-technology-web.git
cd dazzan-technology-web
npm install
```

Para ver el sitio: abrir la carpeta en Visual Studio Code, instalar la extensión
**Live Server** y hacer clic derecho sobre `index.html` → *Open with Live Server*.

## Pruebas

```bash
npm test          # ejecuta la suite una vez
npm run test:watch # re-ejecuta al guardar
npm run coverage  # reporte de cobertura
npm run lint      # análisis estático
```

La integración continua ejecuta `lint` y `test` en cada push y en cada pull
request hacia `main`.

---

## Identidad visual

Colores tomados del logo y de la plantilla de anuncios del negocio:

| Token | Hex | Uso |
|---|---|---|
| `--carbon` | `#141823` | Encabezado, pie, superficies oscuras |
| `--verde` | `#90FE69` | Acento sobre fondo oscuro y etiquetas de estado |
| `--verde-oscuro` | `#65AB4E` | Verde sobre fondo claro |
| `--azul` | `#00275B` | Precios, botones, enlaces |
| `--fondo` | `#FFFFFF` | Superficie principal |

`--verde` no alcanza el contraste mínimo sobre blanco y nunca se usa como texto
sobre fondo claro.

---

## Documentación

- [Requisitos](docs/REQUISITOS.md) — alcance, reglas de negocio y modelo de datos
- [Estándares de código](docs/ESTANDARES.md)
- [Decisiones técnicas](docs/DECISIONES.md)
- [Guía de contribución](CONTRIBUTING.md)

## Cliente

Julio Alezandro Salgado Leiva — Dazzan Technology
Barrio Guadalupe, 19 calle, a media cuadra de Av. Junior, local A. San Pedro Sula.
WhatsApp: +504 3180-7243

## Licencia

MIT. Ver [LICENSE](LICENSE).
