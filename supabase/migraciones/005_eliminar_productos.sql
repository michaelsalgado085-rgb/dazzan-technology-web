-- 005: eliminar productos que nunca se vendieron (RN-32, ADR-002 revisada).
-- Un producto vendido no se puede borrar: factura_lineas lo referencia y la
-- llave foranea lo impide con el error 23503. El historial de ventas queda a
-- salvo sin escribir una regla aparte.

grant delete on public.productos to authenticated;

create policy productos_borrado_administrador on public.productos
  for delete to authenticated using ((select public.es_administrador()));
