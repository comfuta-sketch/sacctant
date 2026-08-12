import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, MessageCircle } from "lucide-react";
import { HELP_CHANNELS, whatsappLink } from "@/lib/help-channels";

type Props = { trigger: React.ReactNode };

/**
 * "Como podemos ajudar?" — fricção zero.
 * Uma seleção rápida abre o WhatsApp com mensagem pré-configurada.
 */
export function HelpChannelDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);

  const go = (message: string) => {
    setOpen(false);
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl border-border bg-background p-0">
        <div className="p-8 sm:p-10">
          <p className="eyebrow">Canal direto</p>
          <h2 className="display-title mt-5 text-lg text-navy-deep md:text-2xl">
            Como podemos ajudar?
          </h2>
          <p className="mt-4 font-serif text-[15px] leading-[1.9] text-graphite">
            Escolha o tema. Você fala diretamente com a MF Advisory — sem
            cadastro e sem formulários.
          </p>

          <div className="mt-8 divide-y divide-border border-y border-border">
            {HELP_CHANNELS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => go(c.message)}
                className="group flex w-full items-center justify-between gap-6 py-4 text-left transition-colors hover:bg-foreground/[0.03]"
              >
                <span className="min-w-0">
                  <span className="block text-sm text-navy-deep">{c.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {c.hint}
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-emerald transition-transform group-hover:translate-x-1"
                  strokeWidth={1.4}
                />
              </button>
            ))}
          </div>

          <p className="mt-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.4} />
            Resposta em até 1 hora útil
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
