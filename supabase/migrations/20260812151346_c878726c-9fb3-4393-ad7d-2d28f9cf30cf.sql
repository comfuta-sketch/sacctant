-- 1. Solicitações (demandas)
CREATE TABLE public.solicitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  assunto text NOT NULL,
  categoria text NOT NULL DEFAULT 'geral',
  descricao text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'aberta',
  concluida_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.solicitacoes TO authenticated;
GRANT ALL ON public.solicitacoes TO service_role;

ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cliente cria propria solicitacao" ON public.solicitacoes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cliente ve proprias solicitacoes" ON public.solicitacoes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Cliente atualiza proprias solicitacoes" ON public.solicitacoes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin gerencia solicitacoes" ON public.solicitacoes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_solicitacoes_updated_at BEFORE UPDATE ON public.solicitacoes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Mensagens da solicitação
CREATE TABLE public.solicitacao_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id uuid NOT NULL REFERENCES public.solicitacoes(id) ON DELETE CASCADE,
  autor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  autor_tipo text NOT NULL DEFAULT 'cliente',
  mensagem text NOT NULL DEFAULT '',
  nome_arquivo text,
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.solicitacao_mensagens TO authenticated;
GRANT ALL ON public.solicitacao_mensagens TO service_role;

ALTER TABLE public.solicitacao_mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participante ve mensagens" ON public.solicitacao_mensagens
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.solicitacoes s WHERE s.id = solicitacao_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Participante escreve mensagens" ON public.solicitacao_mensagens
  FOR INSERT TO authenticated WITH CHECK (
    autor_id = auth.uid() AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.solicitacoes s WHERE s.id = solicitacao_id AND s.user_id = auth.uid())
    )
  );
CREATE POLICY "Admin gerencia mensagens" ON public.solicitacao_mensagens
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Contratos: tipo e rastreio de status
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'outro',
  ADD COLUMN IF NOT EXISTS enviado_em timestamptz,
  ADD COLUMN IF NOT EXISTS visualizado_em timestamptz;

-- 4. Admin principal
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'marcosmelo.advisory@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

CREATE OR REPLACE FUNCTION public.grant_primary_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'marcosmelo.advisory@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_primary_admin() FROM anon, authenticated;

CREATE TRIGGER grant_primary_admin_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_primary_admin();