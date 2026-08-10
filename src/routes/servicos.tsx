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
      { title: "Soluções | MF Advisory — Advisory Premium" },
      {
        name: "description",
        content:
          "CFO as a Service, contabilidade estratégica e governança, planejamento tributário na Reforma (IVA Dual, CBS e IBS) e wealth management para executivos.",
      },
      { property: "og:title", content: "Soluções | MF Advisory" },
      {
        property: "og:description",
        content:
          "Quatro frentes de advisory: controladoria, governança contábil, arquitetura tributária e gestão patrimonial.",
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
          <p className="eyebrow">Soluções</p>
          <h1 className="display-title mt-8 max-w-3xl text-3xl tracking-[0.1em] text-navy-deep md:text-5xl">
            Soluções desenhadas por valor
          </h1>
          <p className="mt-10 max-w-2xl font-serif text-[17px] leading-[1.9] text-graphite">
            Não trabalhamos com tabelas de preço. Cada proposta é construída a
            partir de um diagnóstico privado que considera porte, estrutura
            societária, regime tributário e complexidade das operações.
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
              <h2 className="display-title text-lg tracking-[0.1em] text-navy-deep md:text-2xl">
                Não sabe por onde começar?
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-graphite">
                Conduzimos um diagnóstico estratégico confidencial para
                identificar a prioridade certa para o seu momento.
              </p>
            </div>
            <Link
              to="/contato"
              className="btn-solid"
            >
              Solicitar Diagnóstico Estratégico
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
