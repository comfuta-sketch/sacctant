import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";

const WHATSAPP_NUMBER = "5598984776989";
const WHATSAPP_MESSAGE =
  "Olá Marcos, acabei de preencher os dados iniciais no site da S.ACCTANT e gostaria de seguir com minha declaração.";

export const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

// Brazilian CPF validation (basic length + digit check)
function isValidCPF(value: string) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(cpf[10]);
}

const schema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo").max(120),
  cpf: z.string().trim().refine(isValidCPF, "CPF inválido"),
  titulo: z
    .string()
    .trim()
    .min(10, "Título de Eleitor deve ter ao menos 10 dígitos")
    .max(14),
  email: z.string().trim().email("E-mail inválido").max(255),
  telefone: z
    .string()
    .trim()
    .min(10, "Telefone inválido (com DDD)")
    .max(20),
  logradouro: z.string().trim().min(3, "Informe o logradouro").max(160),
  numero: z.string().trim().min(1, "Informe o número").max(10),
  bairro: z.string().trim().min(2, "Informe o bairro").max(80),
  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido (formato 00000-000)"),
  banco: z.string().trim().min(2, "Informe o banco").max(80),
  agencia: z.string().trim().min(1, "Informe a agência").max(20),
  contaOuPix: z
    .string()
    .trim()
    .min(3, "Informe a conta ou chave PIX")
    .max(120),
  observacoes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

const documentos = [
  "Informe de Rendimentos Salariais",
  "Comprovantes de Despesas Médicas / Educação",
  "Documentos de Bens (Veículos / Imóveis)",
  "Recibo da Declaração Anterior",
];

type Props = {
  trigger: React.ReactNode;
};

export function DeclaracaoFormDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { bairro: "" },
  });

  const toggleDoc = (d: string) =>
    setDocs((s) => ({ ...s, [d]: !s[d] }));

  const onSubmit = (data: FormValues) => {
    const possui = documentos.filter((d) => docs[d]);
    const faltam = documentos.filter((d) => !docs[d]);

    const body = [
      WHATSAPP_MESSAGE,
      "",
      "— Dados pessoais —",
      `Nome: ${data.nome}`,
      `CPF: ${data.cpf}`,
      `Título de Eleitor: ${data.titulo}`,
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
      ...(data.observacoes ? ["", "— Observações —", data.observacoes] : []),
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  const handleClose = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // small delay so close animation isn't jumpy
      setTimeout(() => {
        setSubmitted(false);
        setDocs({});
        reset();
      }, 200);
    }
  };

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
                ? "Continue a conversa com Marcos pelo WhatsApp para finalizar sua declaração."
                : "Preencha os dados abaixo. Tudo é enviado diretamente para o WhatsApp da S.ACCTANT."}
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="mt-8 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy/8 text-navy">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="mt-4 max-w-sm text-sm text-graphite">
                Se o WhatsApp não abriu automaticamente, use o botão abaixo.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3.5 text-base font-semibold text-primary-foreground hover:bg-navy-deep transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Falar com Marcos no WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8">
              <Section title="Dados pessoais">
                <Field label="Nome completo *" error={errors.nome?.message}>
                  <input
                    {...register("nome")}
                    className={inputCls}
                    autoComplete="name"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="CPF *" error={errors.cpf?.message}>
                    <input
                      {...register("cpf")}
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      className={inputCls}
                    />
                  </Field>
                  <Field
                    label="Título de Eleitor *"
                    error={errors.titulo?.message}
                  >
                    <input
                      {...register("titulo")}
                      inputMode="numeric"
                      className={inputCls}
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="E-mail *" error={errors.email?.message}>
                    <input
                      {...register("email")}
                      type="email"
                      autoComplete="email"
                      className={inputCls}
                    />
                  </Field>
                  <Field
                    label="Telefone (WhatsApp) *"
                    error={errors.telefone?.message}
                  >
                    <input
                      {...register("telefone")}
                      placeholder="(98) 90000-0000"
                      inputMode="tel"
                      autoComplete="tel"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Endereço completo">
                <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                  <Field
                    label="Logradouro *"
                    error={errors.logradouro?.message}
                  >
                    <input
                      {...register("logradouro")}
                      autoComplete="street-address"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Número *" error={errors.numero?.message}>
                    <input {...register("numero")} className={inputCls} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Bairro * (São Luís/MA)"
                    error={errors.bairro?.message}
                  >
                    <input
                      {...register("bairro")}
                      placeholder="Ex.: Renascença"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="CEP *" error={errors.cep?.message}>
                    <input
                      {...register("cep")}
                      placeholder="00000-000"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      className={inputCls}
                    />
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
                  <Field
                    label="Conta ou Chave PIX *"
                    error={errors.contaOuPix?.message}
                  >
                    <input {...register("contaOuPix")} className={inputCls} />
                  </Field>
                </div>
              </Section>

              <Section
                title="Documentos que você já tem"
                subtitle="Marque o que já está em mãos. Vamos preparar seu atendimento com base no que falta."
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {documentos.map((doc) => {
                    const isChecked = !!docs[doc];
                    return (
                      <button
                        key={doc}
                        type="button"
                        onClick={() => toggleDoc(doc)}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                          isChecked
                            ? "border-navy bg-navy/5 text-navy-deep"
                            : "border-border bg-background text-graphite hover:border-navy/40"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            isChecked
                              ? "border-navy bg-navy"
                              : "border-border"
                          }`}
                        >
                          {isChecked && (
                            <Check
                              className="h-3.5 w-3.5 text-primary-foreground"
                              strokeWidth={3}
                            />
                          )}
                        </span>
                        <span className="font-medium">{doc}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section title="Observações (opcional)">
                <textarea
                  {...register("observacoes")}
                  rows={3}
                  maxLength={500}
                  className={`${inputCls} resize-none`}
                  placeholder="Algo que devemos saber antes do atendimento?"
                />
              </Section>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-4 text-base font-semibold text-primary-foreground hover:bg-navy-deep transition-colors disabled:opacity-60"
              >
                Enviar e abrir WhatsApp
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Ao enviar, você será redirecionado para o WhatsApp de Marcos
                (S.ACCTANT) com seus dados pré-preenchidos.
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

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-navy">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-graphite">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}
