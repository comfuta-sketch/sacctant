import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { StartChannelDialog } from "@/components/StartChannelDialog";
import { LgpdNotice } from "@/components/LgpdNotice";
import { WHATSAPP_URL } from "@/lib/auth-helpers";

export const Route = createFileRoute("/contato")({
  component: ContatoPage,
  head: () => ({
    meta: [
      { title: "Contato | MF Advisory — São Luís/MA" },
      {
        name: "description",
        content:
          "Fale com a MF Advisory: WhatsApp (98) 98477-6989, e-mail s.acctant@gmail.com. Atendimento online em todo o Brasil, base em São Luís/MA.",
      },
      { property: "og:title", content: "Contato | MF Advisory" },
      {
        property: "og:description",
        content:
          "WhatsApp, e-mail e horários de atendimento da MF Advisory — consultoria contábil estratégica.",
      },
    ],
  }),
});

function ContatoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="border-b border-border bg-soft-gray/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-deep">
            Contato
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-navy-deep md:text-5xl">
            Vamos conversar sobre a sua próxima decisão
          </h1>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">
          <div className="space-y-4">
            {[
              { icon: Phone, label: "Telefone / WhatsApp", value: "(98) 98477-6989" },
              { icon: Mail, label: "E-mail", value: "s.acctant@gmail.com" },
              { icon: MapPin, label: "Localização", value: "São Luís — Maranhão • atendimento 100% online" },
              { icon: Clock, label: "Horário", value: "Seg. a sex., 9h às 18h • resposta em até 1 hora útil" },
            ].map((c) => (
              <div
                key={c.label}
                className="flex items-start gap-4 rounded-xl border border-border bg-background p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald/10 text-emerald-deep">
                  <c.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-navy-deep">
                    {c.value}
                  </p>
                </div>
              </div>
            ))}
            <LgpdNotice />
          </div>

          <div className="rounded-2xl border border-border bg-soft-gray/50 p-8">
            <h2 className="text-xl font-bold text-navy-deep">
              Iniciar atendimento
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-graphite">
              Escolha o canal que preferir: envio rápido pelo WhatsApp, sem
              cadastro, ou o portal completo com upload de documentos e contrato
              digital opcional.
            </p>
            <div className="mt-6 space-y-3">
              <StartChannelDialog
                trigger={
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-navy-deep"
                  >
                    Escolher canal de atendimento
                  </button>
                }
              />
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3.5 text-base font-medium text-graphite transition-colors hover:border-emerald hover:text-emerald-deep"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp direto
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
