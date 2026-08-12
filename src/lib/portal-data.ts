export type SolicitacaoStatus = "aberta" | "em_andamento" | "concluida";

export type Solicitacao = {
  id: string;
  user_id: string;
  cliente_id: string | null;
  assunto: string;
  categoria: string;
  descricao: string;
  status: string;
  concluida_em: string | null;
  created_at: string;
  updated_at: string;
};

export type SolicitacaoMensagem = {
  id: string;
  solicitacao_id: string;
  autor_id: string;
  autor_tipo: string;
  mensagem: string;
  nome_arquivo: string | null;
  storage_path: string | null;
  created_at: string;
};

export type ContratoRow = {
  id: string;
  cliente_id: string;
  user_id: string;
  titulo: string;
  tipo: string;
  status: string;
  modelo_storage_path: string | null;
  dados_preenchidos: Record<string, unknown>;
  assinatura_base64: string | null;
  assinado_em: string | null;
  enviado_em: string | null;
  visualizado_em: string | null;
  created_at: string;
};

export const SOLICITACAO_STATUS: Record<
  SolicitacaoStatus,
  { label: string; className: string }
> = {
  aberta: { label: "Aberta", className: "text-amber-300 border-amber-300/40" },
  em_andamento: {
    label: "Em andamento",
    className: "text-sky-300 border-sky-300/40",
  },
  concluida: {
    label: "Concluída",
    className: "text-emerald border-emerald/40",
  },
};

export const SOLICITACAO_CATEGORIAS = [
  "CFO as a Service",
  "Planejamento Tributário",
  "BPO Financeiro",
  "Contabilidade & Governança",
  "Gestão Patrimonial",
  "Societário / Alterações",
  "Atendimento Geral",
];

export const CONTRATO_TIPOS: { id: string; label: string }[] = [
  { id: "abertura", label: "Contrato de Abertura" },
  { id: "alteracao", label: "Alteração Contratual" },
  { id: "parcelamento", label: "Aceite de Parcelamento" },
  { id: "entrega_mensal", label: "Entrega Mensal" },
  { id: "outro", label: "Outro documento" },
];

export function contratoTipoLabel(tipo: string) {
  return CONTRATO_TIPOS.find((t) => t.id === tipo)?.label ?? "Documento";
}

export function contratoStatusInfo(c: {
  status: string;
  visualizado_em: string | null;
}) {
  if (c.status === "assinado")
    return { label: "Assinado", className: "text-emerald border-emerald/40" };
  if (c.visualizado_em)
    return {
      label: "Visualizado",
      className: "text-sky-300 border-sky-300/40",
    };
  return {
    label: "Assinatura pendente",
    className: "text-amber-300 border-amber-300/40",
  };
}

export function formatDate(v: string | null) {
  return v ? new Date(v).toLocaleDateString("pt-BR") : "—";
}

export function formatDateTime(v: string | null) {
  return v ? new Date(v).toLocaleString("pt-BR") : "—";
}
