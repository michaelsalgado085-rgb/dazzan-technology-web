# Guia de contribucion

## Flujo de trabajo

Trunk-based con ramas cortas desde `main`.

``` powershell
git checkout main
git pull origin main
git checkout -b feat/nombre-corto
# ... cambios ...
git add .
git commit -m "feat(alcance): descripcion en imperativo"
git push origin feat/nombre-corto
```

Luego se abre un Pull Request, se hace autorevision en comentarios y se
fusiona a `main`.

## Convencion de ramas

| Prefijo | Uso |
|---|---|
| `feat/` | Funcionalidad nueva |
| `fix/` | Correccion de error |
| `refactor/` | Cambio interno sin alterar comportamiento |
| `docs/` | Documentacion |
| `style/` | Formato, sin cambio de logica |
| `chore/` | Configuracion y tareas de mantenimiento |

## Conventional Commits

Formato: `tipo(alcance): descripcion`

- Descripcion en imperativo, minuscula, sin punto final.
- Maximo 72 caracteres en el titulo.
- Un commit por unidad de trabajo terminada.

Ejemplos:

```
feat(carrito): agregar calculo de ISV al subtotal
fix(catalogo): corregir filtro por categoria en moviles
refactor(utils): extraer formateo de moneda a funcion unica
docs(readme): documentar ejecucion con Live Server
```

## Versionado

SemVer (`MAYOR.MENOR.PARCHE`). Se crea un tag al cerrar cada entrega.

``` powershell
git tag -a v0.1.0 -m "Primera entrega: catalogo y carrito"
git push origin v0.1.0
```
