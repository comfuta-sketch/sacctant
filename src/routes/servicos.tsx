import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  SERVICE_CATEGORIES,
  ServiceCategoryCard,
} from "@/components/site/services-data";
import { LgpdNotice } from "@/components/LgpdNotice";

export const Route = createFileRoute("/servicos")({
  component: ServicosPage,
  head: () => ({
    meta: [
      { title: "Serviços | MF Advisory — Consultoria, Contabilidade e BPO" },
      {
        name: "description",
        content:
          "Consultoria estratégica, contabilidade empresarial, BPO financeiro e serviços de pessoa física (IRPF, CPF, patrimônio) com valores a partir de.",
      },
      { property: "og:title", content: "Serviços | MF Advisory" },
      {
        property: "og:description",
        content:
          "Consultoria estratégica, contabilidade empresarial, BPO financeiro e IRPF — soluções organizadas por categoria.",
      },
    ],
  }),
});

function ServicosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-40">
          <p className="eyebrow">
            Serviços
          </p>
          <h1 className="display-title mt-8 max-w-3xl text-3xl text-navy-deep md:text-5xl">
            Soluções organizadas por necessidade
          </h1>
          <p className="mt-10 max-w-2xl font-serif text-[17px] leading-[1.9] text-graphite">
            Da rotina contábil à decisão estratégica. Os valores indicados são
            pontos de partida — a proposta final considera porte, regime
            tributário e volume de operações.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-px bg-border md:grid-cols-2">
            {SERVICE_CATEGORIES.map((cat) => (
              <ServiceCategoryCard key={cat.id} cat={cat} />
            ))}
          </div>

          <div className="mt-20 flex flex-wrap items-center justify-between gap-8 border border-border bg-soft-gray/40 p-10 md:p-14">
            <div>
              <h2 className="display-title text-lg text-navy-deep md:text-2xl">
                Não sabe por onde começar?
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-graphite">
                Fazemos um diagnóstico inicial gratuito para indicar a
                prioridade certa para o seu momento.
              </p>
            </div>
            <Link
              to="/contato"
              className="btn-solid"
            >
              Falar com um consultor
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="mt-16">
            <LgpdNotice />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
