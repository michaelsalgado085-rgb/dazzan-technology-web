-- Utilidades de las pruebas. Viven en pg_temp: desaparecen al cerrar la
-- sesion y nunca quedan en la base.

create function pg_temp.afirmar(condicion boolean, mensaje text)
returns void
language plpgsql
as $$
begin
  if condicion is not true then
    raise exception 'FALLO: %', mensaje;
  end if;
  raise notice 'ok: %', mensaje;
end;
$$;

-- Ejecuta una sentencia que DEBE fallar con el codigo indicado.
create function pg_temp.afirmar_error(sentencia text, codigo text, mensaje text)
returns void
language plpgsql
as $$
begin
  execute sentencia;
  raise exception 'FALLO: %. No dio error', mensaje;
exception
  when others then
    if sqlerrm like 'FALLO:%' then
      raise;
    end if;
    if sqlstate <> codigo then
      raise exception 'FALLO: %. Esperaba %, llego % (%)', mensaje, codigo, sqlstate, sqlerrm;
    end if;
    raise notice 'ok: %', mensaje;
end;
$$;

-- Escenario: un administrador, un usuario sin rol y tres productos.
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');
insert into public.perfiles (id, nombre) values
  ('00000000-0000-0000-0000-00000000000a', 'Administrador de prueba');

insert into public.productos (id, categoria_id, nombre, marca, condicion, precio, stock) values
  ('10000000-0000-0000-0000-000000000001', 'laptops', 'ThinkPad T480s', 'Lenovo', 'usado', 13900, 2),
  ('10000000-0000-0000-0000-000000000002', 'teclados', 'Kumara K552', 'Redragon', 'nuevo', 1150, 5),
  ('10000000-0000-0000-0000-000000000003', 'laptops', 'Latitude 5430', 'Dell', 'usado', 15500, 0);

create function pg_temp.como_administrador()
returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', true);
$$;

create function pg_temp.como_usuario_sin_rol()
returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', true);
$$;

create function pg_temp.como_visitante()
returns void language sql as $$
  select set_config('role', 'anon', true),
         set_config('request.jwt.claim.sub', '', true);
$$;
