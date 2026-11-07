# ============================================================
#  Dazzan Technology - Sitio Web
#  Script de estructura inicial del proyecto
#  Uso:  .\setup-proyecto.ps1   (desde la raiz del repositorio)
# ============================================================

$ErrorActionPreference = 'Stop'

if (-not (Test-Path .git)) {
    Write-Host "ERROR: ejecuta este script desde la raiz del repositorio clonado." -ForegroundColor Red
    exit 1
}

Write-Host "Creando carpetas..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path assets\css, assets\js, assets\img, data, docs | Out-Null

# ------------------------------------------------------------
# .editorconfig
# ------------------------------------------------------------
Write-Host "Escribiendo .editorconfig..." -ForegroundColor Cyan
$editorconfig = @"
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
"@
Set-Content -Path .editorconfig -Value $editorconfig -Encoding UTF8

# ------------------------------------------------------------
# .gitignore (anexar reglas del proyecto)
# ------------------------------------------------------------
Write-Host "Actualizando .gitignore..." -ForegroundColor Cyan
$gitignoreExtra = @"

# Proyecto
.vscode/
*.log
Thumbs.db
"@
Add-Content -Path .gitignore -Value $gitignoreExtra -Encoding UTF8

# ------------------------------------------------------------
# README.md
# ------------------------------------------------------------
Write-Host "Escribiendo README.md..." -ForegroundColor Cyan
$fence = '```'
$readme = @"
# Dazzan Technology - Sitio Web

Sitio web para Dazzan Technology, tienda de tecnologia en Honduras.
Catalogo de laptops, computadoras de escritorio, mouse, teclados y auriculares.

## Stack

- HTML5 semantico
- CSS3 (sin frameworks)
- JavaScript ES6 modular (sin dependencias externas)

## Estructura

$fence
dazzan-technology-web/
|- index.html
|- assets/
|  |- css/      Estilos separados por responsabilidad
|  |- js/       Modulos ES6
|  |- img/      Recursos graficos
|- data/        Datos del catalogo en JSON
|- docs/        Documentacion del proyecto
$fence

## Ejecucion local

1. Abrir la carpeta en Visual Studio Code.
2. Instalar la extension **Live Server**.
3. Clic derecho sobre ``index.html`` -> *Open with Live Server*.

## Documentacion

- [Requisitos](docs/REQUISITOS.md)
- [Estandares de codigo](docs/ESTANDARES.md)
- [Decisiones tecnicas](docs/DECISIONES.md)
- [Guia de contribucion](CONTRIBUTING.md)

## Licencia

MIT. Ver [LICENSE](LICENSE).
"@
Set-Content -Path README.md -Value $readme -Encoding UTF8

# ------------------------------------------------------------
# CONTRIBUTING.md
# ------------------------------------------------------------
Write-Host "Escribiendo CONTRIBUTING.md..." -ForegroundColor Cyan
$contributing = @"
# Guia de contribucion

## Flujo de trabajo

Trunk-based con ramas cortas desde ``main``.

$fence powershell
git checkout main
git pull origin main
git checkout -b feat/nombre-corto
# ... cambios ...
git add .
git commit -m "feat(alcance): descripcion en imperativo"
git push origin feat/nombre-corto
$fence

Luego se abre un Pull Request, se hace autorevision en comentarios y se
fusiona a ``main``.

## Convencion de ramas

| Prefijo | Uso |
|---|---|
| ``feat/`` | Funcionalidad nueva |
| ``fix/`` | Correccion de error |
| ``refactor/`` | Cambio interno sin alterar comportamiento |
| ``docs/`` | Documentacion |
| ``style/`` | Formato, sin cambio de logica |
| ``chore/`` | Configuracion y tareas de mantenimiento |

## Conventional Commits

Formato: ``tipo(alcance): descripcion``

- Descripcion en imperativo, minuscula, sin punto final.
- Maximo 72 caracteres en el titulo.
- Un commit por unidad de trabajo terminada.

Ejemplos:

$fence
feat(carrito): agregar calculo de ISV al subtotal
fix(catalogo): corregir filtro por categoria en moviles
refactor(utils): extraer formateo de moneda a funcion unica
docs(readme): documentar ejecucion con Live Server
$fence

## Versionado

SemVer (``MAYOR.MENOR.PARCHE``). Se crea un tag al cerrar cada entrega.

$fence powershell
git tag -a v0.1.0 -m "Primera entrega: catalogo y carrito"
git push origin v0.1.0
$fence
"@
Set-Content -Path CONTRIBUTING.md -Value $contributing -Encoding UTF8

# ------------------------------------------------------------
# docs/ESTANDARES.md
# ------------------------------------------------------------
Write-Host "Escribiendo docs/ESTANDARES.md..." -ForegroundColor Cyan
$estandares = @"
# Estandares de codigo

## Principios aplicados

| Principio | Aplicacion en este proyecto |
|---|---|
| SRP | Un archivo = una responsabilidad. Maximo ~200 lineas. |
| OCP | Funciones extensibles por parametros, no por edicion directa. |
| DIP | Los modulos reciben datos por parametro, no leen globales. |
| DRY | Logica repetida dos veces se extrae a ``utils.js``. |
| KISS | Sin abstracciones para requisitos inexistentes. |
| YAGNI | No se construye lo que no esta en REQUISITOS.md. |

## Nomenclatura

- Nombres en espanol, descriptivos, sin abreviaturas.
- Funciones: ``camelCase`` con verbo inicial - ``calcularTotalConISV()``.
- Constantes: ``MAYUSCULA_SNAKE`` dentro del objeto ``CONFIG``.
- Clases CSS: ``kebab-case`` - ``.tarjeta-producto``.
- Archivos: ``kebab-case`` - ``carrito-resumen.js``.

## Reglas obligatorias

- Cero numeros magicos: toda constante va en ``CONFIG``.
- Escapar siempre la entrada de usuario antes de inyectarla al DOM.
- Bajo acoplamiento: los modulos se comunican por funciones exportadas.
- Accesibilidad: ``aria-label`` en botones de icono, ``alt`` en imagenes,
  ``label`` asociado a cada input.
- Comentarios solo para explicar el *porque*, nunca el *que*.

## Code smells a evitar

- Funciones de mas de 30 lineas.
- Mas de 3 parametros por funcion.
- Anidamiento mayor a 3 niveles.
- Variables globales mutables.
- Codigo comentado sin eliminar.
"@
Set-Content -Path docs\ESTANDARES.md -Value $estandares -Encoding UTF8

# ------------------------------------------------------------
# docs/REQUISITOS.md
# ------------------------------------------------------------
Write-Host "Escribiendo docs/REQUISITOS.md..." -ForegroundColor Cyan
$requisitos = @"
# Requisitos

## Requisitos funcionales

| ID | Requisito | Estado |
|---|---|---|
| RF-01 |  | Pendiente |

## Requisitos no funcionales

| ID | Requisito | Estado |
|---|---|---|
| RNF-01 | El sitio debe ser responsive (movil, tablet, escritorio). | Pendiente |
| RNF-02 | Debe cargar sin dependencias externas ni CDN. | Pendiente |
| RNF-03 | Los precios se muestran en Lempiras (HNL) con ISV 15%. | Pendiente |

## Fuera de alcance

-
"@
Set-Content -Path docs\REQUISITOS.md -Value $requisitos -Encoding UTF8

# ------------------------------------------------------------
# docs/DECISIONES.md
# ------------------------------------------------------------
Write-Host "Escribiendo docs/DECISIONES.md..." -ForegroundColor Cyan
$decisiones = @"
# Decisiones tecnicas

Registro de decisiones de arquitectura y sus motivos.

## DT-01 - JavaScript modular sin framework

**Fecha:** 2026-11-07
**Decision:** Usar modulos ES6 nativos en lugar de React, Vue o similar.
**Motivo:** El alcance es un catalogo con carrito e inventario. Un framework
agregaria build, dependencias y complejidad sin beneficio proporcional (YAGNI).
**Consecuencia:** El sitio se sirve con Live Server sin paso de compilacion.

## DT-02 - Separacion en archivos por responsabilidad

**Fecha:** 2026-11-07
**Decision:** Dividir el HTML unico anterior en ``index.html``, hojas de estilo
por capa y modulos JS por dominio.
**Motivo:** SRP y mantenibilidad. Un archivo monolitico impide revisar cambios
en Pull Requests y genera conflictos de merge.
**Consecuencia:** Mas archivos, pero diffs legibles y responsabilidades claras.
"@
Set-Content -Path docs\DECISIONES.md -Value $decisiones -Encoding UTF8

# ------------------------------------------------------------
Write-Host ""
Write-Host "Listo. Archivos creados:" -ForegroundColor Green
Get-ChildItem -Recurse -File -Include *.md, .editorconfig |
    Select-Object -ExpandProperty FullName |
    ForEach-Object { $_.Replace((Get-Location).Path + '\', '  ') }

Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor Yellow
Write-Host '  git add .'
Write-Host '  git commit -m "chore: estructura inicial y documentacion del proyecto"'
Write-Host '  git push origin main'
