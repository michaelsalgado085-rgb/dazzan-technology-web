-- 002: quien puede ver y tocar cada tabla.
-- Las tablas no se exponen solas (se desactivo al crear el proyecto): cada
-- permiso se da aqui a proposito, y RLS filtra fila por fila encima de eso.

create function public.es_administrador()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'administrador'
  );
$$;

alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.configuracion enable row level security;
alter table public.perfiles enable row level security;
alter table public.facturas enable row level security;
alter table public.factura_lineas enable row level security;

grant usage on schema public to anon, authenticated;

grant select on public.categorias to anon, authenticated;
create policy categorias_lectura_publica on public.categorias
  for select to anon, authenticated using (true);

-- RN-17: el publico ve solo lo que tiene existencias; el administrador ve
-- tambien lo agotado, como historial. Nadie borra productos (ADR-002).
grant select on public.productos to anon, authenticated;
grant insert, update on public.productos to authenticated;
create policy productos_lectura_publica on public.productos
  for select to anon, authenticated using (stock > 0);
create policy productos_lectura_administrador on public.productos
  for select to authenticated using ((select public.es_administrador()));
create policy productos_alta_administrador on public.productos
  for insert to authenticated with check ((select public.es_administrador()));
create policy productos_edicion_administrador on public.productos
  for update to authenticated
  using ((select public.es_administrador()))
  with check ((select public.es_administrador()));

grant select, update on public.configuracion to authenticated;
create policy configuracion_lectura_administrador on public.configuracion
  for select to authenticated using ((select public.es_administrador()));
create policy configuracion_edicion_administrador on public.configuracion
  for update to authenticated
  using ((select public.es_administrador()))
  with check ((select public.es_administrador()));

grant select on public.perfiles to authenticated;
create policy perfiles_lectura_propia on public.perfiles
  for select to authenticated using (id = (select auth.uid()));

-- Las facturas solo se leen por la API. Se crean y se anulan unicamente con
-- las funciones de 003, que garantizan correlativo y existencias.
grant select on public.facturas, public.factura_lineas to authenticated;
create policy facturas_lectura_administrador on public.facturas
  for select to authenticated using ((select public.es_administrador()));
create policy factura_lineas_lectura_administrador on public.factura_lineas
  for select to authenticated using ((select public.es_administrador()));
