# Base de datos

Esquema de Supabase (Postgres). Las decisiones están en
`docs/adr/ADR-001-backend-gestionado.md`, DT-12 y DT-13.

## Carpetas

| Carpeta | Qué tiene | Dónde se ejecuta |
|---|---|---|
| `migraciones/` | Tablas, permisos, funciones y datos iniciales | En Supabase, una vez cada archivo |
| `pruebas/` | Pruebas de las reglas y de RLS | Solo en CI, contra un Postgres vacío |

`pruebas/000_simulacion_supabase.sql` imita los roles y `auth.uid()` de
Supabase. **Nunca** se ejecuta en Supabase.

## Aplicar las migraciones

En el panel de Supabase: **SQL Editor** → **New query**. Pegar el contenido de
cada archivo de `migraciones/`, en orden, y presionar **Run**. Un archivo ya
aplicado no se vuelve a ejecutar: un cambio al esquema es un archivo nuevo con
el número siguiente.
