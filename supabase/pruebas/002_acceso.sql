-- Pruebas de acceso (RLS y permisos). Cada bloque corre en su transaccion y
-- se deshace al final, asi ninguna prueba depende de otra.

-- Visitante sin sesion -------------------------------------------------------

begin;
select pg_temp.como_visitante();
select pg_temp.afirmar(
  (select count(*) from public.productos) = 2,
  'RN-17: el visitante ve solo los productos con existencias'
);
select pg_temp.afirmar(
  (select count(*) from public.categorias) = 5,
  'el visitante ve las categorias'
);
rollback;

begin;
select pg_temp.como_visitante();
select pg_temp.afirmar_error(
  $$insert into public.productos (categoria_id, nombre, marca, condicion, precio)
    values ('mouse', 'Falso', 'X', 'nuevo', 1)$$,
  '42501', 'el visitante no puede crear productos'
);
rollback;

begin;
select pg_temp.como_visitante();
select pg_temp.afirmar_error(
  'select * from public.facturas', '42501', 'el visitante no puede leer facturas'
);
rollback;

begin;
select pg_temp.como_visitante();
select pg_temp.afirmar_error(
  'select * from public.configuracion', '42501',
  'el visitante no puede leer la configuracion del negocio'
);
rollback;

begin;
select pg_temp.como_visitante();
select pg_temp.afirmar_error(
  $$select public.emitir_factura('{}'::jsonb)$$, '42501',
  'el visitante no puede emitir facturas'
);
rollback;

-- Usuario con sesion pero sin perfil de administrador ------------------------

begin;
select pg_temp.como_usuario_sin_rol();
select pg_temp.afirmar(
  (select count(*) from public.productos) = 2,
  'sin rol de administrador no ve lo agotado'
);
rollback;

begin;
select pg_temp.como_usuario_sin_rol();
select pg_temp.afirmar_error(
  $$insert into public.productos (categoria_id, nombre, marca, condicion, precio)
    values ('mouse', 'Falso', 'X', 'nuevo', 1)$$,
  '42501', 'sin rol de administrador no puede crear productos'
);
rollback;

begin;
select pg_temp.como_usuario_sin_rol();
select pg_temp.afirmar_error(
  $$select public.emitir_factura('{"lineas": [{}]}'::jsonb)$$, '42501',
  'sin rol de administrador no puede emitir facturas'
);
rollback;

-- Administrador --------------------------------------------------------------

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar(
  (select count(*) from public.productos) = 3,
  'RN-17: el administrador ve tambien lo agotado, como historial'
);
select pg_temp.afirmar(
  (select count(*) from public.configuracion) = 1,
  'el administrador lee la configuracion'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  'delete from public.productos', '42501',
  'ADR-002: nadie borra productos, ni el administrador'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$insert into public.facturas (numero, emitida_por, cliente_nombre, metodo_pago, subtotal, total)
    values (99, '00000000-0000-0000-0000-00000000000a', 'X', 'efectivo', 0, 0)$$,
  '42501', 'ni el administrador inserta facturas directo: solo con emitir_factura'
);
rollback;
