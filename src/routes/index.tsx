import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Compass,
  Handshake,
  Layers,
  MessageCircle,
  ShieldCheck,
  Telescope,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Reveal } from "@/components/site/Reveal";
import { HelpChannelDialog } from "@/components/HelpChannelDialog";
import {
  SERVICE_CATEGORIES,
  ServiceCategoryCard,
} from "@/components/site/services-data";
import { RetentionAlert } from "@/components/RetentionAlert";
import { WHATSAPP_URL as whatsappUrl } from "@/lib/auth-helpers";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "MF Advisory | The Future, Calculated." },
      {
        name: "description",
        content:
          "Advisory premium para o middle market: CFO as a Service, contabilidade estratégica, arquitetura tributária (IVA Dual, CBS e IBS) e wealth management.",
      },
      { property: "og:title", content: "MF Advisory | The Future, Calculated." },
      {
        property: "og:description",
        content:
          "Transformamos complexidade tributária, contábil e financeira em inteligência de negócios para grandes líderes.",
      },
    ],
  }),
});

const DIFERENCIAIS = [
  {
    icon: Compass,
    title: "Visão estratégica",
    desc: "Cada número é lido como informação de gestão: margem, risco e cenário — nunca como obrigação acessória.",
  },
  {
    icon: BarChart3,
    title: "Decisão baseada em dados",
    desc: "Indicadores, DRE gerencial e projeções de caixa que mostram o efeito de cada escolha antes da execução.",
  },
  {
    icon: ShieldCheck,
    title: "Confidencialidade absoluta",
    desc: "Protocolos de sigilo, aderência à LGPD e trilha documental completa em cada entrega.",
  },
  {
    icon: Handshake,
    title: "Parceria de longo prazo",
    desc: "Consultor dedicado, canal privado de comunicação e comitês periódicos de resultado.",
  },
];

const APPROACH = [
  {
    n: "01",
    icon: Telescope,
    title: "Diagnóstico",
    desc: "Leitura profunda de estrutura societária, carga tributária, margens e riscos. Definimos a linha de base e as prioridades reais.",
  },
  {
    n: "02",
    icon: Layers,
    title: "Estruturação",
    desc: "Desenho da arquitetura contábil, fiscal e de controles internos que sustenta o próximo ciclo de crescimento.",
  },
  {
    n: "03",
    icon: Compass,
    title: "Estratégia",
    desc: "Cenários quantificados, eficiência tributária e plano de decisão com impacto projetado sobre caixa e resultado.",
  },
  {
    n: "04",
    icon: BarChart3,
    title: "Acompanhamento",
    desc: "Comitês de resultado, indicadores mensais e ajuste contínuo de rota junto à liderança.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-32 md:pt-40 md:pb-44">
          <Reveal className="max-w-4xl">
            <p className="eyebrow">Advisory premium • Middle market brasileiro</p>
            <h1 className="display-title mt-10 text-[2.6rem] tracking-[0.1em] text-navy-deep sm:text-6xl md:text-[5rem]">
              O futuro,
              <span className="mt-2 block font-normal normal-case tracking-[-0.01em] text-emerald">
                <span className="font-serif italic">calculado.</span>
              </span>
            </h1>
            <p className="mt-8 font-display text-[10px] font-semibold uppercase tracking-[0.42em] text-muted-foreground">
              The future, calculated.
            </p>
            <div className="hairline mt-14 max-w-md" />
            <p className="mt-10 max-w-2xl text-base leading-[1.9] text-graphite md:text-lg">
              Transformamos complexidade tributária, contábil e financeira em
              inteligência de negócios. Arquitetamos os próximos passos de
              grandes líderes.
            </p>

            <div className="mt-14 flex flex-wrap items-center gap-4">
              <HelpChannelDialog
                trigger={
                  <button type="button" className="btn-solid">
                    Agendar Diagnóstico Privado
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                }
              />
              <Link to="/servicos" className="btn-ghost">
                Ver soluções
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <dl className="mt-24 grid max-w-3xl border-t border-border sm:grid-cols-3">
              {[
                ["+10 anos", "de prática contábil, fiscal e financeira"],
                ["100% digital", "governança documental e assinatura eletrônica"],
                ["Confidencial", "sigilo profissional e conformidade LGPD"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="border-b border-border py-8 sm:border-b-0 sm:border-r sm:pr-8 sm:last:border-r-0 sm:[&:not(:first-child)]:pl-8"
                >
                  <dt className="font-display text-xl font-semibold uppercase tracking-[0.12em] text-navy-deep">
                    {k}
                  </dt>
                  <dd className="mt-2 text-sm text-graphite">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
        <div className="pointer-events-none absolute -top-40 right-0 h-[32rem] w-[32rem] rounded-full bg-emerald/[0.06] blur-[120px]" />
      </section>

      {/* Aviso de retenção / prazos */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Reveal>
            <RetentionAlert />
          </Reveal>
        </div>
      </section>

      {/* Diferenciais */}
      <section id="diferenciais" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Diferenciais</p>
            <h2 className="display-title mt-6 text-2xl tracking-[0.1em] text-navy-deep md:text-4xl">
              Advisory,
              <span className="text-graphite"> não apenas conformidade</span>
            </h2>
          </Reveal>
          <div className="mt-20 grid border-t border-border sm:grid-cols-2 lg:grid-cols-4">
            {DIFERENCIAIS.map((d, i) => (
              <Reveal
                key={d.title}
                delay={i * 90}
                className="border-b border-border px-0 py-10 sm:px-8 sm:[&:not(:nth-child(1))]:border-l lg:py-14 sm:first:pl-0"
              >
                <d.icon className="h-6 w-6 text-emerald" strokeWidth={1.15} />
                <h3 className="mt-8 font-display text-sm font-semibold uppercase tracking-[0.16em] text-navy-deep">
                  {d.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-graphite">
                  {d.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Institucional */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-16 px-6 py-28 md:grid-cols-2 md:gap-24 md:py-36">
          <Reveal>
            <p className="eyebrow">Quem somos</p>
            <h2 className="display-title mt-6 text-2xl tracking-[0.1em] text-navy-deep md:text-4xl">
              Uma advisory com raiz técnica contábil
            </h2>
            <p className="mt-10 font-serif text-[17px] leading-[1.9] text-graphite">
              Atuamos com companhias em tração, executivos e famílias
              empresárias que precisam de mais do que obrigações cumpridas:
              precisam medir o impacto financeiro e tributário de cada
              movimento antes de executá-lo.
            </p>
            <Link
              to="/quem-somos"
              className="mt-10 inline-flex items-center gap-3 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-graphite transition-colors hover:text-emerald"
            >
              Conhecer a MF Advisory <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </Reveal>
          <div className="grid sm:grid-cols-2">
            {[
              ["Missão", "Transformar informação contábil e financeira em inteligência aplicada às decisões."],
              ["Visão", "Ser referência nacional em advisory contábil e tributária para o middle market."],
              ["Valores", "Ética, sigilo, precisão técnica e transparência absoluta."],
              ["Método", "Diagnóstico, estruturação, estratégia e acompanhamento."],
            ].map(([t, d], i) => (
              <Reveal
                key={t}
                delay={i * 80}
                className="border-b border-border p-8 sm:[&:nth-child(even)]:border-l sm:first:border-t"
              >
                <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald">
                  {t}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-graphite">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços por categoria */}
      <section id="servicos" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
          <Reveal className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-2xl">
              <p className="eyebrow">Soluções</p>
              <h2 className="display-title mt-6 text-2xl tracking-[0.1em] text-navy-deep md:text-4xl">
                Quatro frentes,
                <span className="text-graphite"> uma mesma inteligência</span>
              </h2>
            </div>
            <Link to="/servicos" className="btn-ghost !px-5 !py-3 !text-[10px]">
              Ver todas as soluções <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </Reveal>
          <div className="mt-20 grid gap-px bg-border md:grid-cols-2">
            {SERVICE_CATEGORIES.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 80}>
                <ServiceCategoryCard cat={cat} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The MF Approach */}
      <section id="approach" className="border-b border-border bg-soft-gray/40">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">The MF Approach</p>
            <h2 className="display-title mt-6 text-2xl tracking-[0.1em] text-navy-deep md:text-4xl">
              Quatro fases,
              <span className="text-graphite"> uma trajetória previsível</span>
            </h2>
            <div className="hairline mt-10 max-w-xs" />
            <p className="mt-10 font-serif text-[17px] leading-[1.9] text-graphite">
              Um método sequencial que parte do diagnóstico e termina em
              acompanhamento contínuo — cada fase entrega decisões, não
              relatórios.
            </p>
          </Reveal>

          <div className="mt-20 grid border-t border-border md:grid-cols-2 lg:grid-cols-4">
            {APPROACH.map((p, i) => (
              <Reveal
                key={p.n}
                delay={i * 90}
                className="border-b border-border px-0 py-10 sm:px-8 lg:py-14 md:[&:not(:nth-child(1))]:border-l md:first:pl-0"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald">
                    {p.n}
                  </span>
                  <p.icon className="h-5 w-5 text-graphite" strokeWidth={1.15} />
                </div>
                <h3 className="mt-8 font-display text-sm font-semibold uppercase tracking-[0.16em] text-navy-deep">
                  {p.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-graphite">
                  {p.desc}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="mt-20 flex flex-wrap items-center justify-between gap-8 border border-border p-10 md:p-14">
            <div>
              <h3 className="display-title text-lg tracking-[0.1em] text-navy-deep md:text-2xl">
                Comece pelo diagnóstico
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-graphite">
                Uma conversa privada e confidencial para entender o momento da
                sua operação e desenhar a proposta sob medida.
              </p>
            </div>
            <HelpChannelDialog
              trigger={
                <button type="button" className="btn-solid">
                  Agendar Diagnóstico Privado
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              }
            />
          </Reveal>
        </div>
      </section>

      <SiteFooter />

      {/* Floating WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com um especialista da MF Advisory"
        className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center border border-emerald/40 bg-background/80 text-emerald backdrop-blur transition-colors hover:bg-emerald hover:text-primary-foreground"
      >
        <MessageCircle className="h-5 w-5" strokeWidth={1.4} />
      </a>
    </div>
  );
}
