# Plano S.ACCTANT — Evolução completa

Trabalho extenso, dividido em 5 frentes. Implementação incremental sem quebrar o fluxo atual.

## 1. Ajustes globais (rápidos)

- **Remover "Título de Eleitor"**: tirar do `DeclaracaoFormDialog.tsx`, do schema Zod, do payload do insert e da mensagem do WhatsApp. Manter coluna `titulo_eleitor` no banco por compatibilidade (apenas parar de gravar).
- **E-mail de contato**: substituir todas as ocorrências de `marcos@sacctant.com.br` por `s.acctant@gmail.com` (busca global).
- **Componente `LgpdNotice`**: rodapé reutilizável ("Seus dados estão protegidos e são tratados estritamente de acordo com a LGPD…"). Inserir em todos os formulários (auth, recuperar, redefinir, wizard IRPF, contato).

## 2. Wizard IRPF (substitui o `DeclaracaoFormDialog` atual)

Novo componente `IrpfWizard` em `src/components/irpf/` com 6 etapas + `<Progress>` no topo + navegação Voltar/Avançar + autosave em `localStorage` (chave por user_id).

```text
[Passo 1] Dados Pessoais → [Passo 2] Rendimentos → [Passo 3] Bens/Dívidas
   → [Passo 4] Rural/Exterior → [Passo 5] Upload → [Passo 6] Resumo+Contrato
```

- **Passo 1**: nome, CPF, data de nascimento, ocupação, endereço, telefone, e-mail. Banco/agência/PIX **opcional**.
- **Passo 2**: lista dinâmica (add/remover linhas) de "Informes de Rendimentos" (fonte pagadora, valor) e "Despesas dedutíveis" (categoria: saúde/educação/previdência, descrição, valor).
- **Passo 3**: lista dinâmica de "Bens" (tipo, descrição, valor 31/12) e "Dívidas/Ônus" (credor, valor).
- **Passo 4**: dois blocos colapsáveis — Atividade Rural (receita bruta, despesas, UF) e Exterior (país, tipo de rendimento, valor em moeda).
- **Passo 5**: dropzone (drag-and-drop nativo HTML5) com lista de arquivos, remover, tamanho, tipo. PDF/JPG/PNG até 10MB.
- **Passo 6**: resumo em cards + nota de honorários + checkbox opcional "Desejo formalizar o contrato de prestação de serviço agora" + botão "Enviar declaração" + LGPD notice.

**Persistência**: tudo serializado num campo `dados_completos JSONB` em `clientes` (nova coluna). Documentos continuam em `documentos` + Storage.

**Substituição**: o botão CTA da landing abre o `IrpfWizard` em vez do dialog antigo. O dialog antigo fica deprecated (pode ser removido depois).

## 3. Área do Cliente — novas seções

Reorganizar `/cliente` com abas (Tabs do shadcn): **Minhas Declarações** (atual) | **Tutoriais** | **Contratos**.

- **Tutoriais** (`/cliente?tab=tutoriais`): grid de cards consumindo nova tabela `tutoriais` (título, descrição, conteúdo markdown, categoria, ordem, publicado). Estrutura pronta — admin alimenta via painel depois. Por ora, exibir cards a partir do banco; vazio mostra estado "em breve".
- **Contratos** (`/cliente?tab=contratos`): nova tabela `contratos` (cliente_id, titulo, modelo_storage_path, status: pendente/assinado, dados_preenchidos JSONB, assinatura_base64, assinado_em). Cliente preenche campos do modelo + assina via canvas (`react-signature-canvas` ou implementação nativa simples). Admin anexa modelos.
- **Barreira LGPD**: componente `ConsentimentoLGPD` (Dialog modal não-fechável) que bloqueia `/cliente` e `/admin` até o usuário marcar 2 checkboxes (Termos + Privacidade) e clicar "Aceito". Salva em `profiles.consentimento_lgpd_em` (timestamp). Se null → mostra modal.

## 4. Painel Admin

Hoje é stub. Implementar de verdade:

- **Kanban** (`/admin`): 3 colunas (Aguardando documentos | Em análise | Concluído). Cards arrastáveis (`@dnd-kit/core` — leve). Drag muda `status` do cliente via update. RLS já permite admin update.
- **Drawer de detalhes**: ao clicar num card, abre `Sheet` lateral com todos os dados (`dados_completos`), lista de documentos (download via signed URL), botões para mudar status, anexar contrato modelo, enviar documento de retorno.
- **Aba Tutoriais (admin)**: CRUD básico de `tutoriais`.

## 5. UI / Gatilhos mentais

- **Aviso de retenção** na home (`/`): banner amarelo suave (`bg-amber-50 border-amber-300 text-amber-900`) com ícone de alerta, antes do CTA de "Enviar Dados". Texto exato pedido. CTA "Criar conta" ao lado.

## Mudanças no banco (1 migração)

```sql
-- Coluna para wizard completo
ALTER TABLE public.clientes
  ADD COLUMN dados_completos JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN data_nascimento DATE,
  ADD COLUMN ocupacao TEXT,
  ADD COLUMN aceita_contrato BOOLEAN DEFAULT false;

-- Consentimento LGPD
ALTER TABLE public.profiles
  ADD COLUMN consentimento_lgpd_em TIMESTAMPTZ;

-- Tabela tutoriais
CREATE TABLE public.tutoriais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  conteudo TEXT,           -- markdown
  categoria TEXT,
  ordem INT DEFAULT 0,
  publicado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: leitura pública dos publicados; admin gerencia tudo.

-- Tabela contratos
CREATE TABLE public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  modelo_storage_path TEXT,
  dados_preenchidos JSONB DEFAULT '{}'::jsonb,
  assinatura_base64 TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',  -- pendente | assinado
  assinado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: cliente vê/atualiza seus contratos; admin gerencia tudo.
```

## Ordem de execução

1. Migração do banco
2. Componentes utilitários (`LgpdNotice`, `ConsentimentoLGPD`, banner home)
3. Ajustes globais (remover título eleitor, trocar e-mail)
4. Wizard IRPF (substitui dialog na home)
5. Área do Cliente com abas + Tutoriais + Contratos
6. Painel Admin Kanban + Drawer
7. QA: build + testes manuais nas rotas

## Escopo não incluído (próximas fases)

- Editor rico de tutoriais para admin (será textarea markdown simples)
- Geração de PDF do contrato assinado (somente assinatura digital + JSON; PDF fica para depois)
- Pagamento integrado por cartão 3x — manteremos link Asaas atual; texto de honorários é apenas informativo

## Pergunta antes de começar

Confirma que posso seguir com **tudo isso de uma vez**? É bastante código (≈15-20 arquivos novos/editados, 1 migração). Se preferir, posso entregar em fases — sugiro começar pelas frentes 1 + 5 (rápidas) + frente 2 (Wizard, a mais impactante para o cliente final), e fazer 3 e 4 numa segunda rodada.
