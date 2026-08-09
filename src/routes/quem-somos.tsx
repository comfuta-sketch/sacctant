import { createFileRoute } from "@tanstack/react-router";
import { Compass, Eye, HeartHandshake, Target } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/quem-somos")({
  component: QuemSomos,
  head: () => ({
    meta: [
      { title: "Quem somos | MF Advisory — Consultoria Contábil Estratégica" },
      {
        name: "description",
        content:
          "Conheça a MF Advisory: missão, visão, valores e a forma como transformamos dados contábeis em inteligência para decisões empresariais.",
      },
      { property: "og:title", content: "Quem somos | MF Advisory" },
      {
        property: "og:description",
        content:
          "Missão, visão e valores da MF Advisory — consultoria contábil e estratégica em São Luís/MA.",
      },
    ],
  }),
});

const PILARES = [
  {
    icon: Target,
    title: "Missão",
    desc: "Transformar informação contábil e financeira em inteligência aplicada, apoiando decisões seguras e sustentáveis para nossos clientes.",
  },
  {
    icon: Eye,
    title: "Visão",
    desc: "Ser referência no Maranhão em consultoria contábil estratégica, reconhecida pela clareza técnica e pela proximidade com o cliente.",
  },
  {
    icon: HeartHandshake,
    title: "Valores",
    desc: "Ética e sigilo, precisão técnica, transparência nos honorários, atualização contínua e responsabilidade em cada entrega.",
  },
];

function QuemSomos() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-40">
          <p className="eyebrow">
            Quem somos
          </p>
          <h1 className="display-title mt-8 max-w-3xl text-3xl text-navy-deep md:text-5xl">
            Consultoria que traduz números em direção
          </h1>
          <p className="mt-10 max-w-2xl font-serif text-[17px] leading-[1.9] text-graphite">
            A MF Advisory nasce da evolução de uma prática contábil consolidada
            em conformidade fiscal para uma consultoria de gestão. Atuamos ao
            lado de empresários e profissionais liberais, unindo rigor técnico
            contábil e leitura estratégica do negócio.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
          <div className="grid gap-px bg-border md:grid-cols-3">
            {PILARES.map((p) => (
              <div
                key={p.title}
                className="bg-background p-10 transition-colors duration-500 hover:bg-soft-gray/40"
              >
                <p.icon className="h-6 w-6 text-emerald" strokeWidth={1.15} />
                <h2 className="mt-8 font-display text-sm font-semibold uppercase tracking-[0.14em] text-navy-deep">
                  {p.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-graphite">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-24 grid gap-10 border border-border p-10 md:grid-cols-[auto_minmax(0,1fr)] md:p-16">
            <Compass className="h-7 w-7 text-emerald" strokeWidth={1.15} />
            <div>
              <h2 className="display-title text-xl text-navy-deep md:text-3xl">
                Nosso método
              </h2>
              <ol className="mt-10 space-y-8">
                {[
                  ["Diagnóstico", "Entendemos o momento do negócio, obrigações, margens e riscos."],
                  ["Estruturação", "Organizamos a contabilidade, o financeiro e o enquadramento tributário."],
                  ["Estratégia", "Definimos cenários, metas e o caminho fiscal mais eficiente."],
                  ["Acompanhamento", "Indicadores e reuniões periódicas para sustentar as decisões."],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-emerald/50 font-display text-[10px] font-semibold text-emerald">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-navy-deep">{t}</p>
                      <p className="mt-1 text-sm text-graphite">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
