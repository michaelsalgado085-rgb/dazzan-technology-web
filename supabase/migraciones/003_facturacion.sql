-- 003: emitir y anular facturas.
-- Cada operacion corre completa o no corre: si falla una linea, no queda
-- factura a medias, no se gasta el numero y no se descuentan existencias.

create function public.emitir_factura(datos jsonb)
returns public.facturas
language plpgsql
security definer
set search_path = ''
as $$
declare
  numero_asignado integer;
  factura public.facturas;
  linea jsonb;
  producto public.productos;
  suma_importes numeric(12, 2) := 0;
  suma_pagos numeric(12, 2);
begin
  if not public.es_administrador() then
    raise exception 'Solo el administrador puede facturar' using errcode = '42501';
  end if;
  -- RN-19
  if jsonb_typeof(datos -> 'lineas') <> 'array' or jsonb_array_length(datos -> 'lineas') = 0 then
    raise exception 'La factura necesita al menos un producto' using errcode = '23514';
  end if;

  -- Bloquear la fila evita que dos personas facturando a la vez reciban el
  -- mismo numero (RN-10).
  select proxima_factura into numero_asignado
  from public.configuracion where id = 1 for update;
  update public.configuracion set proxima_factura = numero_asignado + 1 where id = 1;

  insert into public.facturas (
    numero, emitida_por, cliente_nombre, cliente_identificacion,
    subtotal, descuento_adicional, total
  ) values (
    numero_asignado, auth.uid(), datos ->> 'cliente_nombre',
    nullif(trim(datos ->> 'cliente_identificacion'), ''),
    0, 0, 0
  ) returning * into factura;

  for linea in select * from jsonb_array_elements(datos -> 'lineas') loop
    -- El precio sale de la base, nunca del navegador.
    select * into producto from public.productos
    where id = (linea ->> 'producto_id')::uuid for update;
    if producto.id is null then
      raise exception 'El producto no existe' using errcode = '23503';
    end if;
    if producto.stock < (linea ->> 'cantidad')::integer then
      raise exception 'No hay existencias suficientes de %', producto.nombre
        using errcode = '23514';
    end if;

    insert into public.factura_lineas (
      factura_id, producto_id, cantidad, descripcion, marca,
      precio_unitario, numero_serie, descuento
    ) values (
      factura.id, producto.id, (linea ->> 'cantidad')::integer, producto.nombre,
      producto.marca, producto.precio, nullif(trim(linea ->> 'numero_serie'), ''),
      coalesce((linea ->> 'descuento')::numeric, 0)
    );
    -- RF-27
    update public.productos
    set stock = stock - (linea ->> 'cantidad')::integer
    where id = producto.id;
  end loop;

  select sum(importe) into suma_importes
  from public.factura_lineas where factura_id = factura.id;

  -- RN-08 y RN-13: suma de importes menos el descuento adicional, sin ISV.
  update public.facturas
  set subtotal = suma_importes,
      descuento_adicional = coalesce((datos ->> 'descuento_adicional')::numeric, 0),
      total = suma_importes - coalesce((datos ->> 'descuento_adicional')::numeric, 0)
  where id = factura.id
  returning * into factura;

  insert into public.factura_pagos (factura_id, metodo, monto)
  select factura.id, pago ->> 'metodo', (pago ->> 'monto')::numeric
  from jsonb_array_elements(coalesce(datos -> 'pagos', '[]'::jsonb)) as pago;

  -- RN-21 y RN-22: lo pagado es exactamente el total. Con total cero no hay
  -- pagos, porque cada monto es mayor que cero.
  select coalesce(sum(monto), 0) into suma_pagos
  from public.factura_pagos where factura_id = factura.id;
  if suma_pagos <> factura.total then
    raise exception 'Los pagos suman % y el total es %', suma_pagos, factura.total
      using errcode = '23514';
  end if;

  return factura;
end;
$$;

-- RN-18: anular no devuelve el equipo al inventario.
create function public.anular_factura(factura_id uuid)
returns public.facturas
language plpgsql
security definer
set search_path = ''
as $$
declare
  factura public.facturas;
begin
  if not public.es_administrador() then
    raise exception 'Solo el administrador puede anular' using errcode = '42501';
  end if;
  update public.facturas
  set anulada = true, anulada_en = now()
  where id = factura_id and not anulada
  returning * into factura;
  if factura.id is null then
    raise exception 'La factura no existe o ya estaba anulada' using errcode = 'P0002';
  end if;
  return factura;
end;
$$;

-- RF-30 permite cambiar el numero de la proxima factura, pero RN-10 prohibe
-- reutilizar uno: nunca puede quedar en un numero ya emitido.
create function public.impedir_reutilizar_numero()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.proxima_factura <= (select coalesce(max(numero), 0) from public.facturas) then
    raise exception 'El numero % ya fue usado en una factura', new.proxima_factura
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger configuracion_sin_numeros_repetidos
  before update of proxima_factura on public.configuracion
  for each row execute function public.impedir_reutilizar_numero();

revoke execute on function public.emitir_factura(jsonb) from public, anon;
revoke execute on function public.anular_factura(uuid) from public, anon;
grant execute on function public.emitir_factura(jsonb) to authenticated;
grant execute on function public.anular_factura(uuid) to authenticated;
