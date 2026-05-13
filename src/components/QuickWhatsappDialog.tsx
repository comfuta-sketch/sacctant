import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { LgpdNotice } from "@/components/LgpdNotice";
import { RetentionAlert } from "@/components/RetentionAlert";
import {
  WHATSAPP_NUMBER,
  formatCPF,
  isValidCPF,
} from "@/lib/auth-helpers";

const documentos = [
  "RG ou CNH",
  "CPF",
  "Informe de Rendimentos",
  "Extrato Bancário",
  "Comprovante de Residência",
  "Recibos médicos e educacionais",
];

type Props = { trigger: React.ReactNode };

export function QuickWhatsappDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const toggle = (d: string) => setDocs((s) => ({ ...s, [d]: !s[d] }));

  const link = useMemo(() => {
    const possui = documentos.filter((d) => docs[d]);
    const faltam = documentos.filter((d) => !docs[d]);
    const msg = [
      "Olá! Quero iniciar minha declaração de IRPF (envio rápido via site).",
      "",
      `Nome: ${nome || "—"}`,
      `CPF: ${cpf || "—"}`,
      `Telefone: ${telefone || "—"}`,
      "",
      `Documentos que já tenho (${possui.length}):`,
      ...(possui.length ? possui.map((d) => `✓ ${d}`) : ["—"]),
      "",
      `Ainda preciso providenciar (${faltam.length}):`,
      ...(faltam.length ? faltam.map((d) => `• ${d}`) : ["—"]),
      ...(observacoes ? ["", `Observações: ${observacoes}`] : []),
    ].join("\n");
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [nome, cpf, telefone, observacoes, docs]);

  const validateAndOpen = (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim().length < 3) return setError("Informe seu nome completo.");
    if (!isValidCPF(cpf)) return setError("CPF inválido.");
    if (telefone.replace(/\D/g, "").length < 10) return setError("Telefone inválido.");
    setError(null);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-navy-deep placeholder:text-muted-foreground/70 outline-none focus:border-navy focus:ring-2 focus:ring-navy/15";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto p-0">
        <form onSubmit={validateAndOpen} className="p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-navy-deep">
              Envio rápido via WhatsApp
            </h2>
            <p className="mt-1 text-sm text-graphite">
              Sem cadastro, sem upload — você fala diretamente com Marcos.
            </p>
          </div>

          <RetentionAlert />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-graphite">Nome completo *</span>
              <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-graphite">CPF *</span>
              <input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" className={inputCls} />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-graphite">Telefone (WhatsApp) *</span>
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(98) 90000-0000" className={inputCls} />
          </label>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy">
              Documentos que você já tem
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {documentos.map((d) => {
                const isChecked = !!docs[d];
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggle(d)}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      isChecked ? "border-navy bg-navy/5 text-navy-deep" : "border-border bg-background text-graphite hover:border-navy/40"
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isChecked ? "border-navy bg-navy" : "border-border"}`}>
                      {isChecked && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
                    </span>
                    <span className="font-medium">{d}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-graphite">Observações (opcional)</span>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              maxLength={500}
              className={`${inputCls} resize-none`}
            />
          </label>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3.5 text-base font-semibold text-white hover:brightness-95 transition-all"
          >
            <MessageCircle className="h-5 w-5" /> Enviar para o WhatsApp
            <ArrowRight className="h-4 w-4" />
          </button>

          <LgpdNotice />
        </form>
      </DialogContent>
    </Dialog>
  );
}
