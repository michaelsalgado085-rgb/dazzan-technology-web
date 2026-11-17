-- 004: datos que el sistema necesita para arrancar.
-- El inventario no va aqui: lo carga Julio desde el panel (RF-23).

insert into public.categorias (id, nombre, orden) values
  ('laptops', 'Laptops', 1),
  ('escritorio', 'Computadoras de escritorio', 2),
  ('teclados', 'Teclados', 3),
  ('mouse', 'Mouse', 4),
  ('auriculares', 'Auriculares', 5);

-- Datos de la plantilla de factura del negocio. Instagram y el numero de la
-- proxima factura los confirma Julio desde el panel (RF-30).
insert into public.configuracion (
  razon_social, nombre_comercial, rtn, direccion, telefono
) values (
  'DAZZAN S. de R.L.',
  'Dazzan Technology',
  '05019024076200',
  'Barrio Guadalupe, 19 calle, a media cuadra de Av. Junior, local A, San Pedro Sula',
  '+504 3180-7243'
);
