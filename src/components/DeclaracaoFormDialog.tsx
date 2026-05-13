import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Check,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Upload,
  Loader2,
  LogIn,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  ASAAS_PAYMENT_URL,
  WHATSAPP_NUMBER,
  WHATSAPP_DEFAULT_MSG,
  WHATSAPP_URL,
  isValidCPF,
  formatCPF,
  onlyDigits,
} from "@/lib/auth-helpers";

export { WHATSAPP_URL as whatsappUrl };

const schema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo").max(120),
  cpf: z.string().trim().refine(isValidCPF, "CPF inválido"),
  email: z.string().trim().email("E-mail inválido").max(255),
  telefone: z.string().trim().min(10, "Telefone inválido (com DDD)").max(20),
  logradouro: z.string().trim().min(3, "Informe o logradouro").max(160),
  numero: z.string().trim().min(1, "Informe o número").max(10),
  bairro: z.string().trim().min(2, "Informe o bairro").max(80),
  cep: z.string().trim().regex(/^\d{5}-?\d{3}$/, "CEP inválido (formato 00000-000)"),
  banco: z.string().trim().min(2, "Informe o banco").max(80),
  agencia: z.string().trim().min(1, "Informe a agência").max(20),
  contaOuPix: z.string().trim().min(3, "Informe a conta ou chave PIX").max(120),
  observacoes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

const documentos = [
  "Informe de Rendimentos Salariais",
  "Comprovantes de Despesas Médicas / Educação",
  "Documentos de Bens (Veículos / Imóveis)",
  "Recibo da Declaração Anterior",
];

type Props = { trigger: React.ReactNode };

export function DeclaracaoFormDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Pre-fill CPF/nome/email from profile when logged in
  useEffect(() => {
    if (!user || !open) return;
    void (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nome,cpf,email")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.nome) setValue("nome", data.nome);
      if (data?.cpf) setValue("cpf", formatCPF(data.cpf));
      if (data?.email) setValue("email", data.email);
    })();
  }, [user, open, setValue]);

  const toggleDoc = (d: string) => setDocs((s) => ({ ...s, [d]: !s[d] }));

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    setSubmitError(null);
    try {
      const possui = documentos.filter((d) => docs[d]);
      const faltam = documentos.filter((d) => !docs[d]);

      // 1) Insert cliente row
      const { data: clienteRow, error: insertError } = await supabase
        .from("clientes")
        .insert({
          user_id: user.id,
          nome: data.nome,
          cpf: onlyDigits(data.cpf),
          email: data.email,
          telefone: data.telefone,
          logradouro: data.logradouro,
          numero: data.numero,
          bairro: data.bairro,
          cep: data.cep,
          banco: data.banco,
          agencia: data.agencia,
          conta_ou_pix: data.contaOuPix,
          observacoes: data.observacoes ?? null,
          documentos_marcados: possui,
          status: files.length > 0 ? "em_analise" : "aguardando_documentos",
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      // 2) Upload files (if any)
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

      // 3) Open WhatsApp with summary
      const body = [
        WHATSAPP_DEFAULT_MSG,
        "",
        "— Dados pessoais —",
        `Nome: ${data.nome}`,
        `CPF: ${data.cpf}`,
        `E-mail: ${data.email}`,
        `Telefone: ${data.telefone}`,
        "",
        "— Endereço —",
        `${data.logradouro}, ${data.numero} — ${data.bairro} — CEP ${data.cep}`,
        "",
        "— Dados bancários —",
        `Banco: ${data.banco} | Ag.: ${data.agencia} | Conta/PIX: ${data.contaOuPix}`,
        "",
        `— Documentos que já possuo (${possui.length}) —`,
        ...(possui.length ? possui.map((d) => `✓ ${d}`) : ["—"]),
        "",
        `— Ainda preciso providenciar (${faltam.length}) —`,
        ...(faltam.length ? faltam.map((d) => `• ${d}`) : ["—"]),
        ...(files.length ? ["", `— Arquivos anexados: ${files.length} —`] : []),
        ...(data.observacoes ? ["", "— Observações —", data.observacoes] : []),
      ].join("\n");
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao enviar.");
    }
  };

  const handleClose = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setTimeout(() => {
        setSubmitted(false);
        setSubmitError(null);
        setDocs({});
        setFiles([]);
        reset();
      }, 200);
    }
  };

  const removeFile = (idx: number) => setFiles((f) => f.filter((_, i) => i !== idx));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">
        <div className="p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl text-navy-deep">
              {submitted ? "Dados enviados!" : "Envio de Dados — IRPF"}
            </DialogTitle>
            <DialogDescription>
              {submitted
                ? "Próximos passos: pague com segurança ou converse com Marcos."
                : "Seus dados são salvos com segurança e ficarão na sua Área do Cliente."}
            </DialogDescription>
          </DialogHeader>

          {/* Not logged in */}
          {!authLoading && !user && !submitted && (
            <div className="mt-6 rounded-lg border border-border bg-soft-gray/40 p-6 text-center">
              <LogIn className="mx-auto h-8 w-8 text-navy" />
              <h3 className="mt-3 text-lg font-semibold text-navy-deep">
                Acesse para enviar seus dados
              </h3>
              <p className="mt-2 text-sm text-graphite">
                Crie uma conta rápida com seu CPF (ou faça login) para que
                seus dados e arquivos fiquem protegidos na sua Área do Cliente.
              </p>
              <Link
                to="/auth"
                search={{ redirect: "/" }}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-navy-deep transition-colors"
              >
                Entrar / Criar conta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Loading auth */}
          {authLoading && !submitted && (
            <div className="mt-10 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-navy" />
            </div>
          )}

          {/* Submitted screen */}
          {submitted && (
            <div className="mt-8 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy/8 text-navy">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="mt-4 max-w-sm text-sm text-graphite">
                Seu cadastro foi salvo e você pode acompanhá-lo na sua{" "}
                <Link to="/cliente" className="font-semibold text-navy hover:underline">
                  Área do Cliente
                </Link>
                .
              </p>
              <a
                href={ASAAS_PAYMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3.5 text-base font-semibold text-primary-foreground hover:bg-navy-deep transition-colors"
              >
                <CreditCard className="h-5 w-5" />
                Ir para Pagamento Seguro
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3.5 text-base font-semibold text-navy hover:border-navy transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Falar com Marcos no WhatsApp
              </a>
            </div>
          )}

          {/* Form */}
          {!authLoading && user && !submitted && (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8">
              <Section title="Dados pessoais">
                <Field label="Nome completo *" error={errors.nome?.message}>
                  <input {...register("nome")} className={inputCls} autoComplete="name" />
                </Field>
                <Field label="CPF *" error={errors.cpf?.message}>
                  <input {...register("cpf")} placeholder="000.000.000-00" inputMode="numeric" className={inputCls} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="E-mail *" error={errors.email?.message}>
                    <input {...register("email")} type="email" autoComplete="email" className={inputCls} />
                  </Field>
                  <Field label="Telefone (WhatsApp) *" error={errors.telefone?.message}>
                    <input {...register("telefone")} placeholder="(98) 90000-0000" inputMode="tel" autoComplete="tel" className={inputCls} />
                  </Field>
                </div>
              </Section>

              <Section title="Endereço completo">
                <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                  <Field label="Logradouro *" error={errors.logradouro?.message}>
                    <input {...register("logradouro")} autoComplete="street-address" className={inputCls} />
                  </Field>
                  <Field label="Número *" error={errors.numero?.message}>
                    <input {...register("numero")} className={inputCls} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Bairro * (São Luís/MA)" error={errors.bairro?.message}>
                    <input {...register("bairro")} placeholder="Ex.: Renascença" className={inputCls} />
                  </Field>
                  <Field label="CEP *" error={errors.cep?.message}>
                    <input {...register("cep")} placeholder="00000-000" inputMode="numeric" autoComplete="postal-code" className={inputCls} />
                  </Field>
                </div>
              </Section>

              <Section title="Dados bancários (restituição)">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Banco *" error={errors.banco?.message}>
                    <input {...register("banco")} className={inputCls} />
                  </Field>
                  <Field label="Agência *" error={errors.agencia?.message}>
                    <input {...register("agencia")} className={inputCls} />
                  </Field>
                  <Field label="Conta ou Chave PIX *" error={errors.contaOuPix?.message}>
                    <input {...register("contaOuPix")} className={inputCls} />
                  </Field>
                </div>
              </Section>

              <Section title="Documentos que você já tem" subtitle="Marque o que já está em mãos.">
                <div className="grid gap-2 sm:grid-cols-2">
                  {documentos.map((doc) => {
                    const isChecked = !!docs[doc];
                    return (
                      <button
                        key={doc} type="button" onClick={() => toggleDoc(doc)}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                          isChecked ? "border-navy bg-navy/5 text-navy-deep"
                            : "border-border bg-background text-graphite hover:border-navy/40"
                        }`}
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          isChecked ? "border-navy bg-navy" : "border-border"
                        }`}>
                          {isChecked && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
                        </span>
                        <span className="font-medium">{doc}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section title="Anexar arquivos (opcional)" subtitle="Pode enviar PDFs, imagens ou prints. Você também poderá enviar mais depois pela Área do Cliente.">
                <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-soft-gray/40 px-4 py-8 text-center cursor-pointer hover:border-navy transition-colors">
                  <Upload className="h-6 w-6 text-navy" />
                  <span className="text-sm font-medium text-navy-deep">Toque para selecionar arquivos</span>
                  <span className="text-xs text-muted-foreground">PDF, JPG, PNG — até 10 MB cada</span>
                  <input
                    type="file" multiple className="sr-only"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files ?? []);
                      setFiles((f) => [...f, ...newFiles]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {files.length > 0 && (
                  <ul className="space-y-1.5">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
                        <span className="truncate text-navy-deep">{f.name}</span>
                        <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-red-600">
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Observações (opcional)">
                <textarea
                  {...register("observacoes")} rows={3} maxLength={500}
                  className={`${inputCls} resize-none`}
                  placeholder="Algo que devemos saber antes do atendimento?"
                />
              </Section>

              {submitError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
              )}

              <button
                type="submit" disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-4 text-base font-semibold text-primary-foreground hover:bg-navy-deep transition-colors disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Enviar dados
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Após enviar, você verá os botões de Pagamento Seguro e WhatsApp.
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-navy-deep placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-navy">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-graphite">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
