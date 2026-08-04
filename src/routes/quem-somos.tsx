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

      <section className="border-b border-border bg-soft-gray/40">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-deep">
            Quem somos
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-navy-deep md:text-5xl">
            Consultoria que traduz números em direção
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-graphite">
            A MF Advisory nasce da evolução de uma prática contábil consolidada
            em conformidade fiscal para uma consultoria de gestão. Atuamos ao
            lado de empresários e profissionais liberais, unindo rigor técnico
            contábil e leitura estratégica do negócio.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {PILARES.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-border bg-background p-8"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy/8 text-navy">
                  <p.icon className="h-5 w-5" />
                </span>
                <h2 className="mt-6 text-lg font-semibold text-navy-deep">
                  {p.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-graphite">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-10 rounded-2xl border border-border bg-soft-gray/50 p-8 md:grid-cols-[auto_minmax(0,1fr)] md:p-12">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald/10 text-emerald-deep">
              <Compass className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-navy-deep">
                Nosso método
              </h2>
              <ol className="mt-6 space-y-5">
                {[
                  ["Diagnóstico", "Entendemos o momento do negócio, obrigações, margens e riscos."],
                  ["Estruturação", "Organizamos a contabilidade, o financeiro e o enquadramento tributário."],
                  ["Estratégia", "Definimos cenários, metas e o caminho fiscal mais eficiente."],
                  ["Acompanhamento", "Indicadores e reuniões periódicas para sustentar as decisões."],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy-deep">{t}</p>
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
