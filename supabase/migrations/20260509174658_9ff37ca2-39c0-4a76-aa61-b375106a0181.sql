
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'cliente');
CREATE TYPE public.status_servico AS ENUM ('aguardando_documentos', 'em_analise', 'concluido');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  cpf TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============ CLIENTES ============
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  titulo_eleitor TEXT,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  logradouro TEXT,
  numero TEXT,
  bairro TEXT,
  cep TEXT,
  banco TEXT,
  agencia TEXT,
  conta_ou_pix TEXT,
  observacoes TEXT,
  documentos_marcados JSONB DEFAULT '[]'::jsonb,
  status public.status_servico NOT NULL DEFAULT 'aguardando_documentos',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX idx_clientes_cpf ON public.clientes(cpf);

-- ============ DOCUMENTOS ============
CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  tamanho_bytes BIGINT,
  tipo TEXT NOT NULL CHECK (tipo IN ('enviado','retorno')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_documentos_cliente_id ON public.documentos(cliente_id);
CREATE INDEX idx_documentos_user_id ON public.documentos(user_id);

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_clientes_updated BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ handle_new_user ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cpf TEXT;
  v_nome TEXT;
BEGIN
  v_cpf := NEW.raw_user_meta_data->>'cpf';
  v_nome := NEW.raw_user_meta_data->>'nome';

  INSERT INTO public.profiles (id, nome, cpf, email)
  VALUES (NEW.id, v_nome, v_cpf, NEW.email);

  -- Grant admin to the configured admin email
  IF lower(NEW.email) = 's.acctant@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'cliente')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS policies: profiles ============
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin views all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ============ RLS policies: user_roles ============
CREATE POLICY "Users view own role" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin views all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manages roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ RLS policies: clientes ============
CREATE POLICY "Cliente vê próprio cadastro" ON public.clientes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin vê todos os cadastros" ON public.clientes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Cliente cria próprio cadastro" ON public.clientes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cliente atualiza próprio cadastro" ON public.clientes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin atualiza qualquer cadastro" ON public.clientes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ RLS policies: documentos ============
CREATE POLICY "Cliente vê próprios documentos" ON public.documentos
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin vê todos os documentos" ON public.documentos
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Cliente envia documento próprio" ON public.documentos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND tipo = 'enviado');
CREATE POLICY "Admin envia documento de retorno" ON public.documentos
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin gerencia documentos" ON public.documentos
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos_clientes','documentos_clientes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: user_id is the first folder in the path (e.g. <user_id>/<cliente_id>/file.pdf)
CREATE POLICY "Cliente lê próprios arquivos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documentos_clientes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admin lê todos os arquivos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documentos_clientes' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Cliente envia próprios arquivos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos_clientes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admin envia arquivos para qualquer pasta" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos_clientes' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin gerencia arquivos" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'documentos_clientes' AND public.has_role(auth.uid(), 'admin'));
