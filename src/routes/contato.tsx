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

      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-40">
          <p className="eyebrow">
            Contato
          </p>
          <h1 className="display-title mt-8 max-w-2xl text-3xl text-navy-deep md:text-5xl">
            Vamos conversar sobre a sua próxima decisão
          </h1>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 md:grid-cols-2 md:gap-24">
          <div>
            <div className="divide-y divide-border border-y border-border">
              {[
                { icon: Phone, label: "Telefone / WhatsApp", value: "(98) 98477-6989" },
                { icon: Mail, label: "E-mail", value: "s.acctant@gmail.com" },
                { icon: MapPin, label: "Localização", value: "São Luís — Maranhão • atendimento 100% online" },
                { icon: Clock, label: "Horário", value: "Seg. a sex., 9h às 18h • resposta em até 1 hora útil" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-5 py-6">
                  <c.icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald" strokeWidth={1.15} />
                  <div className="min-w-0">
                    <p className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {c.label}
                    </p>
                    <p className="mt-2 text-sm text-navy-deep">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <LgpdNotice />
            </div>
          </div>

          <div className="border border-border p-10 md:p-12">
            <p className="eyebrow">Atendimento</p>
            <h2 className="display-title mt-6 text-lg text-navy-deep md:text-2xl">
              Iniciar atendimento
            </h2>
            <p className="mt-6 font-serif text-[16px] leading-[1.9] text-graphite">
              Escolha o canal que preferir: envio rápido pelo WhatsApp, sem
              cadastro, ou o portal completo com upload de documentos e contrato
              digital opcional.
            </p>
            <div className="mt-10 space-y-4">
              <StartChannelDialog
                trigger={
                  <button type="button" className="btn-solid w-full justify-center">
                    Escolher canal
                  </button>
                }
              />
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full justify-center"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.4} /> WhatsApp direto
              </a>
            </div>
          </div>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
