-- Solo para pruebas locales y CI. NUNCA se ejecuta en Supabase: alla estas
-- piezas ya existen. Imita lo minimo que usan las migraciones: los roles de la
-- API, la tabla de usuarios y auth.uid().

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end
$$;

create schema if not exists auth;
grant usage on schema auth to anon, authenticated;

create table if not exists auth.users (id uuid primary key);

-- Supabase lee el usuario del token; aqui se lee de una variable de sesion.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

-- Lo minimo de Storage: los buckets y la tabla de objetos con RLS activo.
create schema if not exists storage;
grant usage on schema storage to anon, authenticated;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text not null
);

alter table storage.objects enable row level security;
grant select, insert, delete on storage.objects to anon, authenticated;
