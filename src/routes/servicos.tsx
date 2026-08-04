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

      <section className="border-b border-border bg-soft-gray/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-deep">
            Serviços
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-navy-deep md:text-5xl">
            Soluções organizadas por necessidade
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-graphite">
            Da rotina contábil à decisão estratégica. Os valores indicados são
            pontos de partida — a proposta final considera porte, regime
            tributário e volume de operações.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            {SERVICE_CATEGORIES.map((cat) => (
              <ServiceCategoryCard key={cat.id} cat={cat} />
            ))}
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-navy-deep p-8 md:p-10">
            <div>
              <h2 className="text-xl font-bold text-primary-foreground md:text-2xl">
                Não sabe por onde começar?
              </h2>
              <p className="mt-2 max-w-md text-sm text-primary-foreground/70">
                Fazemos um diagnóstico inicial gratuito para indicar a
                prioridade certa para o seu momento.
              </p>
            </div>
            <Link
              to="/contato"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald px-6 py-3.5 text-base font-semibold text-navy-deep transition-all hover:gap-3"
            >
              Falar com um consultor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10">
            <LgpdNotice />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
