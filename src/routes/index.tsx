import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  Compass,
  Handshake,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Reveal } from "@/components/site/Reveal";
import { StartChannelDialog } from "@/components/StartChannelDialog";
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
      { title: "MF Advisory | Inteligência para Decisões" },
      {
        name: "description",
        content:
          "Consultoria contábil e estratégica em São Luís/MA: planejamento tributário, BPO financeiro, contabilidade empresarial e IRPF. Inteligência para decisões.",
      },
      { property: "og:title", content: "MF Advisory | Inteligência para Decisões" },
      {
        property: "og:description",
        content:
          "Consultoria contábil e estratégica: planejamento tributário, BPO financeiro, contabilidade empresarial e IRPF.",
      },
    ],
  }),
});

const documents = [
  "RG ou CNH",
  "CPF",
  "Informe de Rendimentos",
  "Extrato Bancário",
  "Comprovante de Residência",
  "Recibos médicos e educacionais",
];

const DIFERENCIAIS = [
  {
    icon: Compass,
    title: "Visão estratégica",
    desc: "Cada número é lido como informação de gestão: margem, risco e cenário — não apenas obrigação acessória.",
  },
  {
    icon: BarChart3,
    title: "Decisão baseada em dados",
    desc: "Indicadores, DRE gerencial e projeções de caixa que mostram o efeito de cada escolha antes de executá-la.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança e conformidade",
    desc: "Protocolos de sigilo, aderência à LGPD e prazos fiscais sob controle, com trilha documental completa.",
  },
  {
    icon: Handshake,
    title: "Parceria contínua",
    desc: "Consultor dedicado, canal direto no WhatsApp e reuniões periódicas de resultado.",
  },
];

function Index() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (doc: string) => setChecked((c) => ({ ...c, [doc]: !c[doc] }));

  const checkedCount = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked],
  );

  const whatsappLink = useMemo(() => {
    const have = documents.filter((d) => checked[d]);
    const missing = documents.filter((d) => !checked[d]);
    const msg = [
      "Olá! Gostaria de iniciar meu atendimento com a MF Advisory.",
      "",
      `Documentos que já tenho (${have.length}):`,
      ...(have.length ? have.map((d) => `✓ ${d}`) : ["—"]),
      "",
      `Ainda preciso providenciar (${missing.length}):`,
      ...(missing.length ? missing.map((d) => `• ${d}`) : ["—"]),
    ].join("\n");
    return `https://wa.me/5598984776989?text=${encodeURIComponent(msg)}`;
  }, [checked]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-32 md:pt-40 md:pb-44">
          <Reveal className="max-w-4xl">
            <p className="eyebrow">Consultoria contábil e estratégica • São Luís/MA</p>
            <h1 className="display-title mt-10 text-[2.6rem] text-navy-deep sm:text-6xl md:text-[5rem]">
              Inteligência
              <span className="mt-2 block font-normal normal-case tracking-[-0.02em] text-emerald">
                <span className="font-serif italic">para decisões</span>
              </span>
            </h1>
            <div className="hairline mt-14 max-w-md" />
            <p className="mt-10 max-w-xl text-base leading-[1.9] text-graphite md:text-lg">
              A MF Advisory une contabilidade, planejamento tributário e gestão
              financeira para que cada decisão do seu negócio seja tomada com
              clareza, segurança e previsibilidade.
            </p>

            <div className="mt-14 flex flex-wrap items-center gap-4">
              <StartChannelDialog
                trigger={
                  <button type="button" className="btn-solid">
                    Iniciar atendimento
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                }
              />
              <Link to="/servicos" className="btn-ghost">
                Ver serviços
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <dl className="mt-24 grid max-w-3xl border-t border-border sm:grid-cols-3">
              {[
                ["+10 anos", "de prática contábil e fiscal"],
                ["100% online", "documentos e assinatura digital"],
                ["LGPD", "sigilo e proteção de dados"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="border-b border-border py-8 sm:border-b-0 sm:border-r sm:pr-8 sm:last:border-r-0 sm:[&:not(:first-child)]:pl-8"
                >
                  <dt className="font-display text-xl font-semibold uppercase tracking-[0.08em] text-navy-deep">
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
            <h2 className="display-title mt-6 text-2xl text-navy-deep md:text-4xl">
              Consultoria,
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
                <h3 className="mt-8 font-display text-sm font-semibold uppercase tracking-[0.14em] text-navy-deep">
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
            <h2 className="display-title mt-6 text-2xl text-navy-deep md:text-4xl">
              Uma advisory com raiz técnica contábil
            </h2>
            <p className="mt-10 font-serif text-[17px] leading-[1.9] text-graphite">
              Atuamos com empresários, profissionais liberais e famílias que
              precisam de mais do que guias pagas em dia: precisam entender o
              impacto financeiro e tributário de cada movimento.
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
              ["Missão", "Transformar informação contábil em inteligência aplicada às decisões."],
              ["Visão", "Ser referência no Maranhão em consultoria contábil estratégica."],
              ["Valores", "Ética, sigilo, precisão técnica e transparência nos honorários."],
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
              <p className="eyebrow">Serviços</p>
              <h2 className="display-title mt-6 text-2xl text-navy-deep md:text-4xl">
                Quatro frentes,
                <span className="text-graphite"> uma mesma inteligência</span>
              </h2>
            </div>
            <Link to="/servicos" className="btn-ghost !px-5 !py-3 !text-[10px]">
              Ver todos os serviços <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
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

      {/* Checklist IRPF */}
      <section id="checklist" className="border-b border-border bg-soft-gray/40">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
          <div className="grid items-start gap-16 md:grid-cols-2 md:gap-24">
            <Reveal>
              <p className="eyebrow">Checklist inicial</p>
              <h2 className="display-title mt-6 text-2xl text-navy-deep md:text-4xl">
                Comece em menos de 2 minutos
              </h2>
              <div className="hairline mt-10 max-w-xs" />
              <p className="mt-10 max-w-md font-serif text-[17px] leading-[1.9] text-graphite">
                Marque os documentos que você já tem. Preparamos seu atendimento
                a partir do que falta — sem retrabalho, sem surpresas.
              </p>
            </Reveal>

            <Reveal delay={100} className="border border-border bg-background p-8 md:p-10">
              <div className="divide-y divide-border border-y border-border">
                {documents.map((doc) => {
                  const isChecked = !!checked[doc];
                  return (
                    <button
                      key={doc}
                      type="button"
                      onClick={() => toggle(doc)}
                      className="group flex w-full items-center gap-4 py-4 text-left transition-colors"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-300 ${
                          isChecked
                            ? "border-emerald bg-emerald"
                            : "border-border group-hover:border-emerald/60"
                        }`}
                      >
                        {isChecked && (
                          <Check
                            className="h-3 w-3 text-primary-foreground"
                            strokeWidth={2.5}
                          />
                        )}
                      </span>
                      <span
                        className={`text-sm transition-colors ${
                          isChecked ? "text-navy-deep" : "text-graphite"
                        }`}
                      >
                        {doc}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <span>
                  {checkedCount} / {documents.length} marcados
                </span>
                <span>Envie mesmo sem ter tudo</span>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solid mt-8 w-full justify-center"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                Enviar para o WhatsApp
              </a>
              <p className="mt-4 text-center font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Resposta em até 1 hora útil
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* Floating WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com a MF Advisory no WhatsApp"
        className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center border border-emerald/40 bg-background/80 text-emerald backdrop-blur transition-colors hover:bg-emerald hover:text-primary-foreground"
      >
        <MessageCircle className="h-5 w-5" strokeWidth={1.4} />
      </a>
    </div>
  );
}
