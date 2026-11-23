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
  'select * from public.factura_pagos', '42501', 'el visitante no puede leer los pagos'
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
select pg_temp.como_visitante();
select pg_temp.afirmar_error(
  'delete from public.productos', '42501', 'el visitante no puede eliminar productos'
);
rollback;

begin;
select pg_temp.como_usuario_sin_rol();
delete from public.productos;
select pg_temp.como_administrador();
select pg_temp.afirmar(
  (select count(*) from public.productos) = 3,
  'sin rol de administrador no elimina nada'
);
rollback;

begin;
select pg_temp.como_administrador();
delete from public.productos where id = '10000000-0000-0000-0000-000000000003';
select pg_temp.afirmar(
  (select count(*) from public.productos) = 2,
  'RN-32: el administrador elimina un producto que nunca se vendio'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$insert into public.facturas (numero, emitida_por, cliente_nombre, subtotal, total)
    values (99, '00000000-0000-0000-0000-00000000000a', 'X', 0, 0)$$,
  '42501', 'ni el administrador inserta facturas directo: solo con emitir_factura'
);
rollback;

-- Fotos (RF-33, RN-33) ------------------------------------------------------

begin;
select pg_temp.como_administrador();
insert into storage.objects (bucket_id, name) values ('productos', 'a1.jpg');
select pg_temp.afirmar(
  (select count(*) from storage.objects where bucket_id = 'productos') = 1,
  'RF-33: el administrador sube fotos de productos'
);
rollback;

begin;
select pg_temp.como_visitante();
select pg_temp.afirmar_error(
  $$insert into storage.objects (bucket_id, name) values ('productos', 'x.jpg')$$,
  '42501', 'el visitante no puede subir fotos'
);
rollback;

begin;
select pg_temp.como_usuario_sin_rol();
select pg_temp.afirmar_error(
  $$insert into storage.objects (bucket_id, name) values ('productos', 'x.jpg')$$,
  '42501', 'sin rol de administrador no se suben fotos'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$update public.productos set fotos = array['1','2','3','4','5','6','7']
    where id = '10000000-0000-0000-0000-000000000001'$$,
  '23514', 'RN-33: un producto no lleva mas de 6 fotos'
);
rollback;

begin;
select pg_temp.afirmar(
  (select public and file_size_limit = 1048576 and allowed_mime_types = array['image/jpeg']
   from storage.buckets where id = 'productos'),
  'el bucket es publico para leer, solo JPEG y hasta 1 MB'
);
rollback;
