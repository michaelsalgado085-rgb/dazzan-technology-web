-- 006: fotos de los productos (RF-33, RN-33).
-- Las fotos viven en Supabase Storage; la tabla guarda solo sus rutas, en
-- orden. La primera es la portada.

-- La columna imagen nunca se uso: la reemplaza la lista de fotos.
alter table public.productos drop column imagen;

-- RN-33: hasta 6 fotos. El limite tambien esta en el dominio; aqui queda
-- como respaldo ante una llamada directa a la API.
alter table public.productos
  add column fotos text[] not null default '{}' check (cardinality(fotos) <= 6);

-- Publico para leer: las fotos se ven en la tienda sin sesion. Solo JPEG y
-- hasta 1 MB, porque el panel las achica antes de subirlas.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 1048576, array['image/jpeg']);

-- Solo el administrador sube y borra. Storage pide permiso de lectura para
-- poder borrar, por eso tambien hay una politica de select.
create policy fotos_productos_lectura_administrador on storage.objects
  for select to authenticated
  using (bucket_id = 'productos' and (select public.es_administrador()));
create policy fotos_productos_alta_administrador on storage.objects
  for insert to authenticated
  with check (bucket_id = 'productos' and (select public.es_administrador()));
create policy fotos_productos_borrado_administrador on storage.objects
  for delete to authenticated
  using (bucket_id = 'productos' and (select public.es_administrador()));
