
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS dados_completos JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS data_nascimento DATE,
  ADD COLUMN IF NOT EXISTS ocupacao TEXT,
  ADD COLUMN IF NOT EXISTS aceita_contrato BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS consentimento_lgpd_em TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.tutoriais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  conteudo TEXT,
  categoria TEXT,
  ordem INT NOT NULL DEFAULT 0,
  publicado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tutoriais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados leem tutoriais publicados"
  ON public.tutoriais FOR SELECT TO authenticated
  USING (publicado = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin gerencia tutoriais"
  ON public.tutoriais FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER tutoriais_set_updated
  BEFORE UPDATE ON public.tutoriais
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  modelo_storage_path TEXT,
  dados_preenchidos JSONB NOT NULL DEFAULT '{}'::jsonb,
  assinatura_base64 TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  assinado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cliente vê próprios contratos"
  ON public.contratos FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Cliente atualiza próprios contratos"
  ON public.contratos FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin gerencia contratos"
  ON public.contratos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER contratos_set_updated
  BEFORE UPDATE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
