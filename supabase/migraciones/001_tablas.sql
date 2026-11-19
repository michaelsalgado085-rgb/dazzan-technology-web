-- 001: tablas del inventario y la facturacion.
-- Las reglas del negocio que la base puede hacer cumplir van como
-- restricciones: asi valen igual para el panel, para la API y para un error
-- humano en el editor SQL.

create table public.categorias (
  id text primary key,
  nombre text not null,
  orden smallint not null unique
);

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  categoria_id text not null references public.categorias (id),
  nombre text not null check (length(trim(nombre)) > 0),
  marca text not null check (length(trim(marca)) > 0),
  -- RN-01
  condicion text not null check (condicion in ('usado', 'nuevo')),
  descripcion text not null default '',
  especificaciones jsonb not null default '{}'
    check (jsonb_typeof(especificaciones) = 'object'),
  -- RN-07 y RN-08: lempiras, con ISV ya incluido
  precio numeric(12, 2) not null check (precio >= 0),
  precio_anterior numeric(12, 2)
    check (precio_anterior is null or precio_anterior > precio),
  -- RN-06: existencias por modelo, nunca negativas
  stock integer not null default 0 check (stock >= 0),
  imagen text,
  creado_en timestamptz not null default now()
);

create index idx_productos_categoria on public.productos (categoria_id);
-- El catalogo publico solo consulta lo que tiene existencias (RN-17).
create index idx_productos_disponibles on public.productos (nombre) where stock > 0;

-- Una sola fila (id = 1): los datos del negocio que salen en la factura.
create table public.configuracion (
  id smallint primary key default 1 check (id = 1),
  razon_social text not null,
  nombre_comercial text not null,
  rtn text,
  direccion text not null,
  telefono text not null,
  instagram text,
  proxima_factura integer not null default 1 check (proxima_factura > 0),
  -- RN-16: se imprimen vacios mientras el contador no indique otra cosa
  cai text,
  rango_autorizado text,
  fecha_limite_emision date
);

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  rol text not null default 'administrador' check (rol in ('administrador')),
  creado_en timestamptz not null default now()
);

create table public.facturas (
  id uuid primary key default gen_random_uuid(),
  -- RN-10: correlativo unico; una anulada conserva su numero
  numero integer not null unique check (numero > 0),
  emitida_en timestamptz not null default now(),
  emitida_por uuid not null references public.perfiles (id),
  -- RN-11: nombre obligatorio, RTN o identidad opcional
  cliente_nombre text not null check (length(trim(cliente_nombre)) > 0),
  cliente_identificacion text,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  descuento_adicional numeric(12, 2) not null default 0 check (descuento_adicional >= 0),
  -- RN-08 y RN-13: sin ISV, puede ser cero, nunca negativo
  total numeric(12, 2) not null
    check (total >= 0 and total = subtotal - descuento_adicional),
  anulada boolean not null default false,
  anulada_en timestamptz,
  check (anulada = (anulada_en is not null))
);

create index idx_facturas_emitida_en on public.facturas (emitida_en desc);

create table public.factura_lineas (
  id uuid primary key default gen_random_uuid(),
  factura_id uuid not null references public.facturas (id),
  producto_id uuid not null references public.productos (id),
  cantidad integer not null check (cantidad > 0),
  -- Copia del producto al momento de vender: si mañana cambia el precio, la
  -- factura reimpresa sigue diciendo lo que se cobro.
  descripcion text not null,
  marca text not null,
  precio_unitario numeric(12, 2) not null check (precio_unitario >= 0),
  -- RN-12
  numero_serie text,
  -- RN-13: puede llegar al 100% del importe, nunca pasarlo
  descuento numeric(12, 2) not null default 0
    check (descuento >= 0 and descuento <= precio_unitario * cantidad),
  importe numeric(12, 2) generated always as (precio_unitario * cantidad - descuento) stored
);

create index idx_factura_lineas_factura on public.factura_lineas (factura_id);
create index idx_factura_lineas_producto on public.factura_lineas (producto_id);

-- RN-20: una factura se puede pagar con varios metodos, cada uno con su monto.
create table public.factura_pagos (
  id uuid primary key default gen_random_uuid(),
  factura_id uuid not null references public.facturas (id),
  -- RN-14
  metodo text not null
    check (metodo in ('efectivo', 'tarjeta', 'transferencia', 'financiamiento')),
  monto numeric(12, 2) not null check (monto > 0),
  -- RN-23: un metodo no se repite en la misma factura
  unique (factura_id, metodo)
);
