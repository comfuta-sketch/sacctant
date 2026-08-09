CREATE POLICY "Admin deleta cadastro" ON public.clientes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Cliente cria proprio contrato" ON public.contratos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin deleta contratos" ON public.contratos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM authenticated, anon, PUBLIC;