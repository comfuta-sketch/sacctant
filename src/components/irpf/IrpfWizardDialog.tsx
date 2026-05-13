import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  LogIn,
  MessageCircle,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { LgpdNotice } from "@/components/LgpdNotice";
import {
  ASAAS_PAYMENT_URL,
  WHATSAPP_DEFAULT_MSG,
  WHATSAPP_NUMBER,
  WHATSAPP_URL,
  formatCPF,
  isValidCPF,
  onlyDigits,
} from "@/lib/auth-helpers";

type Rendimento = { fonte: string; valor: string };
type Despesa = { categoria: string; descricao: string; valor: string };
type Bem = { tipo: string; descricao: string; valor: string };
type Divida = { credor: string; valor: string };

type WizardData = {
  // Passo 1
  nome: string;
  cpf: string;
  dataNascimento: string;
  ocupacao: string;
  email: string;
  telefone: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  banco: string;
  agencia: string;
  contaOuPix: string;
  // Passo 2
  rendimentos: Rendimento[];
  despesas: Despesa[];
  // Passo 3
  bens: Bem[];
  dividas: Divida[];
  // Passo 4
  ruralReceita: string;
  ruralDespesas: string;
  ruralUf: string;
  exteriorPais: string;
  exteriorTipo: string;
  exteriorValor: string;
  // Passo 6
  aceitaContrato: boolean;
  observacoes: string;
};

const initial: WizardData = {
  nome: "", cpf: "", dataNascimento: "", ocupacao: "", email: "", telefone: "",
  logradouro: "", numero: "", bairro: "", cep: "",
  banco: "", agencia: "", contaOuPix: "",
  rendimentos: [{ fonte: "", valor: "" }],
  despesas: [],
  bens: [],
  dividas: [],
  ruralReceita: "", ruralDespesas: "", ruralUf: "",
  exteriorPais: "", exteriorTipo: "", exteriorValor: "",
  aceitaContrato: false, observacoes: "",
};

const STEPS = [
  "Dados Pessoais",
  "Rendimentos",
  "Bens e Dívidas",
  "Rural / Exterior",
  "Documentos",
  "Resumo",
] as const;

type Props = { trigger: React.ReactNode };

export function IrpfWizardDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(initial);
  const [files, setFiles] = useState<File[]>([]);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pré-preencher dados do perfil
  useEffect(() => {
    if (!user || !open) return;
    void (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("nome,cpf,email")
        .eq("id", user.id)
        .maybeSingle();
      setData((d) => ({
        ...d,
        nome: prof?.nome ?? d.nome,
        cpf: prof?.cpf ? formatCPF(prof.cpf) : d.cpf,
        email: prof?.email ?? d.email,
      }));
    })();
  }, [user, open]);

  // Autosave em localStorage por user
  useEffect(() => {
    if (!user || !open) return;
    const key = `irpf.wizard.${user.id}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WizardData>;
        setData((d) => ({ ...d, ...parsed }));
      }
    } catch { /* ignore */ }
  }, [user, open]);
  useEffect(() => {
    if (!user || !open) return;
    const key = `irpf.wizard.${user.id}`;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch { /* ignore */ }
  }, [data, user, open]);

  const update = <K extends keyof WizardData>(k: K, v: WizardData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const validateStep = (): string | null => {
    if (step === 0) {
      if (data.nome.trim().length < 3) return "Informe seu nome completo.";
      if (!isValidCPF(data.cpf)) return "CPF inválido.";
      if (!data.dataNascimento) return "Informe a data de nascimento.";
      if (data.ocupacao.trim().length < 2) return "Informe sua ocupação.";
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(data.email)) return "E-mail inválido.";
      if (data.telefone.replace(/\D/g, "").length < 10) return "Telefone inválido.";
      if (data.logradouro.trim().length < 3) return "Informe o logradouro.";
      if (!data.numero.trim()) return "Informe o número.";
      if (data.bairro.trim().length < 2) return "Informe o bairro.";
      if (!/^\d{5}-?\d{3}$/.test(data.cep)) return "CEP inválido.";
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep();
    if (err) { setStepError(err); return; }
    setStepError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => { setStepError(null); setStep((s) => Math.max(s - 1, 0)); };

  const handleClose = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setTimeout(() => {
        if (submitted) {
          setData(initial); setFiles([]); setStep(0); setSubmitted(false);
          if (user) try { localStorage.removeItem(`irpf.wizard.${user.id}`); } catch { /* */ }
        }
        setStepError(null);
      }, 200);
    }
  };

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    setStepError(null);
    try {
      const { data: clienteRow, error: insertError } = await supabase
        .from("clientes")
        .insert({
          user_id: user.id,
          nome: data.nome,
          cpf: onlyDigits(data.cpf),
          data_nascimento: data.dataNascimento,
          ocupacao: data.ocupacao,
          email: data.email,
          telefone: data.telefone,
          logradouro: data.logradouro,
          numero: data.numero,
          bairro: data.bairro,
          cep: data.cep,
          banco: data.banco || null,
          agencia: data.agencia || null,
          conta_ou_pix: data.contaOuPix || null,
          observacoes: data.observacoes || null,
          aceita_contrato: data.aceitaContrato,
          dados_completos: {
            rendimentos: data.rendimentos,
            despesas: data.despesas,
            bens: data.bens,
            dividas: data.dividas,
            rural: { receita: data.ruralReceita, despesas: data.ruralDespesas, uf: data.ruralUf },
            exterior: { pais: data.exteriorPais, tipo: data.exteriorTipo, valor: data.exteriorValor },
          },
          status: files.length > 0 ? "em_analise" : "aguardando_documentos",
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      for (const file of files) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${user.id}/${clienteRow.id}/${Date.now()}_${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("documentos_clientes")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        await supabase.from("documentos").insert({
          cliente_id: clienteRow.id,
          user_id: user.id,
          nome_arquivo: file.name,
          storage_path: path,
          mime_type: file.type,
          tamanho_bytes: file.size,
          tipo: "enviado",
          uploaded_by: user.id,
        });
      }

      const summary = [
        WHATSAPP_DEFAULT_MSG, "",
        `Nome: ${data.nome}`,
        `CPF: ${data.cpf}`,
        `Nascimento: ${data.dataNascimento}`,
        `Ocupação: ${data.ocupacao}`,
        `Rendimentos: ${data.rendimentos.length} fonte(s)`,
        `Bens: ${data.bens.length} item(ns)`,
        files.length ? `Arquivos enviados: ${files.length}` : "Sem anexos",
        data.aceitaContrato ? "✓ Cliente deseja formalizar contrato" : "",
      ].filter(Boolean).join("\n");
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      setSubmitted(true);
    } catch (err) {
      setStepError(err instanceof Error ? err.message : "Erro ao enviar.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">
        <div className="p-6 sm:p-8">
          {/* Estado deslogado */}
          {!authLoading && !user && !submitted && (
            <div className="rounded-lg border border-border bg-soft-gray/40 p-6 text-center">
              <LogIn className="mx-auto h-8 w-8 text-navy" />
              <h3 className="mt-3 text-lg font-semibold text-navy-deep">
                Acesse para iniciar sua declaração
              </h3>
              <p className="mt-2 text-sm text-graphite">
                Crie uma conta com seu CPF para que seus dados fiquem
                protegidos na sua Área do Cliente.
              </p>
              <Link
                to="/auth"
                search={{ redirect: "/" }}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-navy-deep transition-colors"
              >
                Entrar / Criar conta <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-5"><LgpdNotice /></div>
            </div>
          )}

          {authLoading && !submitted && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-navy" />
            </div>
          )}

          {submitted && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy/8 text-navy">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-navy-deep">
                Declaração enviada!
              </h3>
              <p className="mt-2 max-w-sm text-sm text-graphite">
                Acompanhe na sua{" "}
                <Link to="/cliente" className="font-semibold text-navy hover:underline">
                  Área do Cliente
                </Link>
                .
              </p>
              <a href={ASAAS_PAYMENT_URL} target="_blank" rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3.5 text-base font-semibold text-primary-foreground hover:bg-navy-deep transition-colors">
                <CreditCard className="h-5 w-5" /> Ir para Pagamento Seguro
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3.5 text-base font-semibold text-navy hover:border-navy transition-colors">
                <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
              </a>
              <div className="mt-6 w-full"><LgpdNotice /></div>
            </div>
          )}

          {!authLoading && user && !submitted && (
            <>
              {/* Header / progresso */}
              <div>
                <h2 className="text-xl font-bold text-navy-deep">
                  Declaração de IRPF — Passo {step + 1} de {STEPS.length}
                </h2>
                <p className="mt-1 text-sm text-graphite">{STEPS[step]}</p>
                <Progress value={progress} className="mt-3 h-2" />
              </div>

              {/* Conteúdo do passo */}
              <div className="mt-6">
                {step === 0 && <Step1 data={data} update={update} />}
                {step === 1 && <Step2 data={data} update={update} />}
                {step === 2 && <Step3 data={data} update={update} />}
                {step === 3 && <Step4 data={data} update={update} />}
                {step === 4 && <Step5 files={files} setFiles={setFiles} />}
                {step === 5 && (
                  <Step6 data={data} update={update} fileCount={files.length} />
                )}
              </div>

              {stepError && (
                <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {stepError}
                </p>
              )}

              <div className="mt-6"><LgpdNotice /></div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button type="button" onClick={goBack} disabled={step === 0}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-graphite hover:border-navy hover:text-navy transition-colors disabled:opacity-40">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>
                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={goNext}
                    className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-navy-deep transition-colors">
                    Avançar <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="button" onClick={submit} disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-navy-deep transition-colors disabled:opacity-60">
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Enviar declaração <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Steps ----------------

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-navy-deep placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15";

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-graphite">{label}</span>
      {children}
    </label>
  );
}

function Step1({ data, update }: { data: WizardData; update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void }) {
  return (
    <div className="space-y-4">
      <F label="Nome completo *"><input value={data.nome} onChange={(e) => update("nome", e.target.value)} className={inputCls} /></F>
      <div className="grid gap-4 sm:grid-cols-3">
        <F label="CPF *"><input value={data.cpf} onChange={(e) => update("cpf", formatCPF(e.target.value))} placeholder="000.000.000-00" className={inputCls} /></F>
        <F label="Data de nascimento *"><input type="date" value={data.dataNascimento} onChange={(e) => update("dataNascimento", e.target.value)} className={inputCls} /></F>
        <F label="Ocupação *"><input value={data.ocupacao} onChange={(e) => update("ocupacao", e.target.value)} placeholder="Ex.: Servidor público" className={inputCls} /></F>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="E-mail *"><input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} className={inputCls} /></F>
        <F label="Telefone *"><input value={data.telefone} onChange={(e) => update("telefone", e.target.value)} placeholder="(98) 90000-0000" className={inputCls} /></F>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <F label="Logradouro *"><input value={data.logradouro} onChange={(e) => update("logradouro", e.target.value)} className={inputCls} /></F>
        <F label="Número *"><input value={data.numero} onChange={(e) => update("numero", e.target.value)} className={inputCls} /></F>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Bairro *"><input value={data.bairro} onChange={(e) => update("bairro", e.target.value)} className={inputCls} /></F>
        <F label="CEP *"><input value={data.cep} onChange={(e) => update("cep", e.target.value)} placeholder="00000-000" className={inputCls} /></F>
      </div>
      <div className="rounded-lg border border-dashed border-border bg-soft-gray/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-navy">Conta para restituição (opcional)</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <F label="Banco"><input value={data.banco} onChange={(e) => update("banco", e.target.value)} className={inputCls} /></F>
          <F label="Agência"><input value={data.agencia} onChange={(e) => update("agencia", e.target.value)} className={inputCls} /></F>
          <F label="Conta ou PIX"><input value={data.contaOuPix} onChange={(e) => update("contaOuPix", e.target.value)} className={inputCls} /></F>
        </div>
      </div>
    </div>
  );
}

function ListEditor<T extends Record<string, string>>({
  title, items, onChange, blank, fields,
}: {
  title: string;
  items: T[];
  onChange: (next: T[]) => void;
  blank: T;
  fields: { key: keyof T; label: string; placeholder?: string; type?: string }[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-navy-deep">{title}</h4>
        <button type="button" onClick={() => onChange([...items, { ...blank }])}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-navy hover:border-navy">
          <Plus className="h-3 w-3" /> Adicionar
        </button>
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">Nenhum item. Use "Adicionar" se aplicável.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-background p-3">
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))` }}>
                {fields.map((f) => (
                  <input key={String(f.key)} type={f.type ?? "text"} value={item[f.key]}
                    placeholder={f.placeholder ?? f.label}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...next[idx], [f.key]: e.target.value } as T;
                      onChange(next);
                    }}
                    className={inputCls} />
                ))}
              </div>
              <button type="button" onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="mt-2 inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
                <Trash2 className="h-3 w-3" /> Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Step2({ data, update }: { data: WizardData; update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void }) {
  return (
    <div className="space-y-6">
      <ListEditor<Rendimento>
        title="Informes de rendimentos"
        items={data.rendimentos}
        onChange={(v) => update("rendimentos", v)}
        blank={{ fonte: "", valor: "" }}
        fields={[
          { key: "fonte", label: "Fonte pagadora", placeholder: "Ex.: Empresa X" },
          { key: "valor", label: "Valor (R$)", placeholder: "0,00" },
        ]}
      />
      <ListEditor<Despesa>
        title="Despesas dedutíveis"
        items={data.despesas}
        onChange={(v) => update("despesas", v)}
        blank={{ categoria: "", descricao: "", valor: "" }}
        fields={[
          { key: "categoria", label: "Categoria", placeholder: "Saúde / Educação / Previdência" },
          { key: "descricao", label: "Descrição" },
          { key: "valor", label: "Valor (R$)" },
        ]}
      />
    </div>
  );
}

function Step3({ data, update }: { data: WizardData; update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void }) {
  return (
    <div className="space-y-6">
      <ListEditor<Bem>
        title="Bens (declaração 31/12)"
        items={data.bens}
        onChange={(v) => update("bens", v)}
        blank={{ tipo: "", descricao: "", valor: "" }}
        fields={[
          { key: "tipo", label: "Tipo", placeholder: "Imóvel / Veículo / Aplicação" },
          { key: "descricao", label: "Descrição" },
          { key: "valor", label: "Valor (R$)" },
        ]}
      />
      <ListEditor<Divida>
        title="Dívidas e ônus reais"
        items={data.dividas}
        onChange={(v) => update("dividas", v)}
        blank={{ credor: "", valor: "" }}
        fields={[
          { key: "credor", label: "Credor" },
          { key: "valor", label: "Valor (R$)" },
        ]}
      />
    </div>
  );
}

function Step4({ data, update }: { data: WizardData; update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-soft-gray/30 p-4">
        <h4 className="text-sm font-semibold text-navy-deep">Atividade rural (opcional)</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <F label="Receita bruta (R$)"><input value={data.ruralReceita} onChange={(e) => update("ruralReceita", e.target.value)} className={inputCls} /></F>
          <F label="Despesas (R$)"><input value={data.ruralDespesas} onChange={(e) => update("ruralDespesas", e.target.value)} className={inputCls} /></F>
          <F label="UF"><input value={data.ruralUf} onChange={(e) => update("ruralUf", e.target.value)} className={inputCls} maxLength={2} /></F>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-soft-gray/30 p-4">
        <h4 className="text-sm font-semibold text-navy-deep">Rendimentos no exterior (opcional)</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <F label="País"><input value={data.exteriorPais} onChange={(e) => update("exteriorPais", e.target.value)} className={inputCls} /></F>
          <F label="Tipo"><input value={data.exteriorTipo} onChange={(e) => update("exteriorTipo", e.target.value)} placeholder="Ex.: Salário" className={inputCls} /></F>
          <F label="Valor (moeda local)"><input value={data.exteriorValor} onChange={(e) => update("exteriorValor", e.target.value)} className={inputCls} /></F>
        </div>
      </div>
    </div>
  );
}

function Step5({ files, setFiles }: { files: File[]; setFiles: React.Dispatch<React.SetStateAction<File[]>> }) {
  const [drag, setDrag] = useState(false);
  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault(); setDrag(false);
          const drops = Array.from(e.dataTransfer.files);
          setFiles((f) => [...f, ...drops]);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-10 text-center transition-colors ${drag ? "border-navy bg-navy/5" : "border-border bg-soft-gray/30"}`}
      >
        <Upload className="h-8 w-8 text-navy" />
        <p className="text-sm font-medium text-navy-deep">
          Arraste e solte arquivos aqui
        </p>
        <p className="text-xs text-muted-foreground">ou</p>
        <label className="cursor-pointer rounded-md bg-navy px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-navy-deep">
          Selecionar arquivos
          <input type="file" multiple className="sr-only" onChange={(e) => {
            const arr = Array.from(e.target.files ?? []);
            setFiles((f) => [...f, ...arr]);
            e.target.value = "";
          }} />
        </label>
        <p className="mt-2 text-[11px] text-muted-foreground">PDF, JPG, PNG — até 10 MB cada</p>
      </div>
      {files.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <span className="truncate text-navy-deep">
                {f.name} <span className="text-xs text-muted-foreground">({(f.size / 1024).toFixed(0)} KB)</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <label className="cursor-pointer text-xs font-medium text-navy hover:underline">
                  Trocar
                  <input type="file" className="sr-only" onChange={(e) => {
                    const f2 = e.target.files?.[0];
                    if (!f2) return;
                    setFiles((arr) => arr.map((it, idx) => idx === i ? f2 : it));
                    e.target.value = "";
                  }} />
                </label>
                <button type="button" onClick={() => setFiles((arr) => arr.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-red-600" aria-label="Remover">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Step6({ data, update, fileCount }: { data: WizardData; update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void; fileCount: number }) {
  const sum = (arr: { valor: string }[]) =>
    arr.reduce((acc, x) => acc + (parseFloat(x.valor.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0), 0);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card label="Nome" value={data.nome || "—"} />
        <Card label="CPF" value={data.cpf || "—"} />
        <Card label="Nascimento" value={data.dataNascimento || "—"} />
        <Card label="Ocupação" value={data.ocupacao || "—"} />
        <Card label="Rendimentos" value={`${data.rendimentos.length} fonte(s) — R$ ${sum(data.rendimentos).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
        <Card label="Despesas" value={`${data.despesas.length} item(ns)`} />
        <Card label="Bens" value={`${data.bens.length} item(ns)`} />
        <Card label="Dívidas" value={`${data.dividas.length} item(ns)`} />
        <Card label="Anexos" value={`${fileCount} arquivo(s)`} />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Honorários:</strong> Tabela padrão vigente. Parcelamento em até
        <strong> 3x no cartão de crédito</strong>, se necessário.
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-soft-gray/30 p-3 cursor-pointer">
        <input type="checkbox" checked={data.aceitaContrato}
          onChange={(e) => update("aceitaContrato", e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-navy" />
        <span className="text-sm text-navy-deep">
          <strong>Opcional:</strong> gerar <strong>contrato de prestação de serviço</strong> à parte.
          Você poderá assiná-lo depois na sua Área do Cliente.
        </span>
      </label>

      <F label="Observações (opcional)">
        <textarea value={data.observacoes} onChange={(e) => update("observacoes", e.target.value)}
          rows={3} maxLength={500} className={`${inputCls} resize-none`} />
      </F>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-soft-gray/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-navy-deep truncate">{value}</p>
    </div>
  );
}
