import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, MessageCircle, FolderUp, ShieldCheck, FileSignature } from "lucide-react";
import { QuickWhatsappDialog } from "@/components/QuickWhatsappDialog";
import { IrpfWizardDialog } from "@/components/irpf/IrpfWizardDialog";

type Props = { trigger: React.ReactNode };

/**
 * Seletor de canal para iniciar a declaração:
 * 1) Envio direto pelo site → WhatsApp (sem cadastro, sem contrato)
 * 2) Portal completo → preencher + upload + contrato opcional
 */
export function StartChannelDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-navy-deep">
            Como você prefere iniciar?
          </h2>
          <p className="mt-1 text-sm text-graphite">
            Escolha o canal mais conveniente. Você pode mudar depois.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* Canal 1 — WhatsApp */}
            <QuickWhatsappDialog
              trigger={
                <button
                  type="button"
                  className="group flex h-full flex-col rounded-xl border-2 border-border bg-background p-5 text-left hover:border-[#25D366] hover:shadow-md transition-all"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#128C7E]">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-navy-deep">
                    Direto pelo WhatsApp
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-graphite">
                    Envio rápido, sem cadastro. Você preenche os dados básicos e
                    fala diretamente com Marcos. <strong>Sem contrato.</strong>
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#128C7E] group-hover:gap-2 transition-all">
                    Iniciar agora <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              }
            />

            {/* Canal 2 — Portal */}
            <IrpfWizardDialog
              trigger={
                <button
                  type="button"
                  className="group flex h-full flex-col rounded-xl border-2 border-border bg-background p-5 text-left hover:border-navy hover:shadow-md transition-all"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy/10 text-navy">
                    <FolderUp className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-navy-deep">
                    Pela Área do Cliente
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-graphite">
                    Preencha tudo no site, anexe documentos (com opção de
                    remover ou trocar) e, se quiser,{" "}
                    <strong>gere o contrato à parte (opcional)</strong>.
                  </p>
                  <ul className="mt-3 space-y-1 text-[11px] text-graphite/80">
                    <li className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-navy" /> Histórico salvo na sua conta
                    </li>
                    <li className="flex items-center gap-1.5">
                      <FileSignature className="h-3 w-3 text-navy" /> Contrato digital opcional
                    </li>
                  </ul>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-navy group-hover:gap-2 transition-all">
                    Acessar portal <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
