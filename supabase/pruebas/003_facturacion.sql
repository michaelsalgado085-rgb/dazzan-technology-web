-- Pruebas de emitir y anular facturas. Todas corren como administrador;
-- quien NO puede facturar se prueba en 002_acceso.sql.
-- Productos del escenario: ThinkPad L 13,900 (2 en existencia),
-- Kumara L 1,150 (5) y Latitude L 15,500 (agotada).

-- Lo que costaria la venta con los precios actuales. Las pruebas que no son
-- de pagos lo usan para pagar exacto en efectivo y concentrarse en lo suyo.
create function pg_temp.total_esperado(lineas text, descuento_adicional numeric)
returns numeric
language sql
as $$
  select coalesce(sum(producto.precio * (linea ->> 'cantidad')::integer
           - coalesce((linea ->> 'descuento')::numeric, 0)), 0) - descuento_adicional
  from jsonb_array_elements(lineas::jsonb) as linea
  join public.productos as producto on producto.id = (linea ->> 'producto_id')::uuid;
$$;

create function pg_temp.venta(lineas text, descuento_adicional numeric default 0, pagos text default null)
returns public.facturas
language sql
as $$
  select public.emitir_factura(jsonb_build_object(
    'cliente_nombre', 'Cliente de prueba',
    'descuento_adicional', descuento_adicional,
    'lineas', lineas::jsonb,
    'pagos', coalesce(pagos::jsonb, case
      when pg_temp.total_esperado(lineas, descuento_adicional) > 0 then
        jsonb_build_array(jsonb_build_object(
          'metodo', 'efectivo', 'monto', pg_temp.total_esperado(lineas, descuento_adicional)))
      else '[]'::jsonb
    end)
  ));
$$;

-- Correlativo (RN-10) --------------------------------------------------------

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar(
  (select numero from pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1}]')) = 1
  and (select numero from pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1}]')) = 2,
  'RN-10: las facturas toman numeros consecutivos'
);
select pg_temp.afirmar(
  (select proxima_factura from public.configuracion) = 3,
  'RN-10: la configuracion queda apuntando al numero que sigue'
);
rollback;

begin;
select pg_temp.como_administrador();
select public.anular_factura((pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1}]')).id);
select pg_temp.afirmar(
  (select numero from pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1}]')) = 2,
  'RN-10: despues de anular la 1, la siguiente es la 2'
);
select pg_temp.afirmar(
  (select anulada from public.facturas where numero = 1),
  'RN-10: la factura anulada conserva su numero'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1}]');
select pg_temp.afirmar_error(
  'update public.configuracion set proxima_factura = 1', '23514',
  'RN-10: la proxima factura no puede volver a un numero ya usado'
);
rollback;

-- Existencias (RF-27, RN-18) -------------------------------------------------

begin;
select pg_temp.como_administrador();
select pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000001", "cantidad": 2}]');
select pg_temp.afirmar(
  (select stock from public.productos where id = '10000000-0000-0000-0000-000000000001') = 0,
  'RF-27: vender descuenta las existencias'
);
rollback;

begin;
select pg_temp.como_administrador();
select public.anular_factura(
  (pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 2}]')).id
);
select pg_temp.afirmar(
  (select stock from public.productos where id = '10000000-0000-0000-0000-000000000002') = 3,
  'RN-18: anular no devuelve el equipo al inventario'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$select pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1},
                           {"producto_id": "10000000-0000-0000-0000-000000000003", "cantidad": 1}]')$$,
  '23514', 'no se vende un producto agotado'
);
select pg_temp.afirmar(
  (select count(*) from public.facturas) = 0
  and (select stock from public.productos where id = '10000000-0000-0000-0000-000000000002') = 5
  and (select proxima_factura from public.configuracion) = 1,
  'si una linea falla no queda factura, ni existencias descontadas, ni numero gastado'
);
rollback;

-- Totales (RN-08, RN-13) -----------------------------------------------------

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar(
  (select total from pg_temp.venta(
    '[{"producto_id": "10000000-0000-0000-0000-000000000001", "cantidad": 1, "descuento": 400},
      {"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 2}]', 100)) = 15700,
  'RN-08 y RN-13: total = 13,900 - 400 + 2 x 1,150 - 100, sin ISV'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar(
  (select total from pg_temp.venta(
    '[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1, "descuento": 1150}]')) = 0,
  'RN-13: un articulo regalado deja el total en cero'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$select pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1, "descuento": 1150.01}]')$$,
  '23514', 'RN-13: el descuento de una linea no pasa de su importe'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$select pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1}]', 1150.01)$$,
  '23514', 'RN-13: el total nunca es negativo'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1}]');
update public.productos set precio = 999 where id = '10000000-0000-0000-0000-000000000002';
select pg_temp.afirmar(
  (select precio_unitario from public.factura_lineas) = 1150,
  'la factura guarda el precio del momento de la venta'
);
rollback;

-- Pagos (RN-14, RN-20 a RN-23) ----------------------------------------------
-- Kumara x 2 = L 2,300.

begin;
select pg_temp.como_administrador();
select pg_temp.venta(
  '[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 2}]', 0,
  '[{"metodo": "efectivo", "monto": 800}, {"metodo": "tarjeta", "monto": 1500}]'
);
select pg_temp.afirmar(
  (select count(*) from public.factura_pagos) = 2
  and (select monto from public.factura_pagos where metodo = 'tarjeta') = 1500,
  'RN-20: una factura se paga con dos metodos y guarda el monto de cada uno'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$select pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 2}]', 0,
    '[{"metodo": "efectivo", "monto": 800}, {"metodo": "tarjeta", "monto": 1499.99}]')$$,
  '23514', 'RN-21: si los pagos no suman el total, no se emite'
);
select pg_temp.afirmar(
  (select proxima_factura from public.configuracion) = 1,
  'RN-21: un pago mal sumado no gasta el numero'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$select pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 2}]', 0,
    '[{"metodo": "efectivo", "monto": 3000}]')$$,
  '23514', 'RN-21: no se anota vuelto, se anota lo que cubre el total'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar(
  (select total from pg_temp.venta(
    '[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1, "descuento": 1150}]', 0, '[]')) = 0
  and (select count(*) from public.factura_pagos) = 0,
  'RN-22: una factura en cero no lleva pagos'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$select pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1, "descuento": 1150}]', 0,
    '[{"metodo": "efectivo", "monto": 0}]')$$,
  '23514', 'RN-22: no se registra un pago de cero'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$select pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 2}]', 0,
    '[{"metodo": "efectivo", "monto": 1000}, {"metodo": "efectivo", "monto": 1300}]')$$,
  '23505', 'RN-23: un metodo no se repite en la misma factura'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$select pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1}]', 0,
    '[{"metodo": "cheque", "monto": 1150}]')$$,
  '23514', 'RN-14: solo efectivo, tarjeta, transferencia o financiamiento'
);
rollback;

-- Datos del cliente y de la venta (RN-11, RN-12, RN-19) --------------------

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$select pg_temp.venta('[]')$$, '23514', 'RN-19: una factura necesita al menos un producto'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar_error(
  $$select public.emitir_factura('{"cliente_nombre": "  ",
    "lineas": [{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1}],
    "pagos": [{"metodo": "efectivo", "monto": 1150}]}')$$,
  '23514', 'RN-11: el nombre del cliente es obligatorio'
);
rollback;

begin;
select pg_temp.como_administrador();
select pg_temp.afirmar(
  (select cliente_identificacion is null from pg_temp.venta(
    '[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1}]')),
  'RN-11: el RTN o la identidad son opcionales'
);
select pg_temp.afirmar(
  (select numero_serie is null from public.factura_lineas),
  'RN-12: el numero de serie es opcional'
);
rollback;

begin;
select pg_temp.como_administrador();
select public.anular_factura(
  (pg_temp.venta('[{"producto_id": "10000000-0000-0000-0000-000000000002", "cantidad": 1}]')).id
);
select pg_temp.afirmar_error(
  $$select public.anular_factura((select id from public.facturas))$$, 'P0002',
  'una factura no se anula dos veces'
);
rollback;
