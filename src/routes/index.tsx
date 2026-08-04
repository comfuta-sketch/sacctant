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
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-soft-gray px-3 py-1 text-xs font-medium text-graphite">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-deep" />
              Consultoria contábil e estratégica • São Luís/MA
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-navy-deep md:text-6xl">
              Inteligência para{" "}
              <span className="text-emerald-deep">decisões</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-graphite md:text-xl">
              A MF Advisory une contabilidade, planejamento tributário e gestão
              financeira para que cada decisão do seu negócio seja tomada com
              clareza, segurança e previsibilidade.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <StartChannelDialog
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3.5 text-base font-medium text-primary-foreground transition-all hover:gap-3 hover:bg-navy-deep"
                  >
                    Iniciar atendimento
                    <ArrowRight className="h-4 w-4" />
                  </button>
                }
              />
              <Link
                to="/servicos"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3.5 text-base font-medium text-graphite transition-colors hover:border-emerald hover:text-emerald-deep"
              >
                Ver serviços
              </Link>
            </div>

            <dl className="mt-14 grid max-w-2xl gap-8 sm:grid-cols-3">
              {[
                ["+10 anos", "de prática contábil e fiscal"],
                ["100% online", "documentos e assinatura digital"],
                ["LGPD", "sigilo e proteção de dados"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-2xl font-bold text-navy-deep">{k}</dt>
                  <dd className="mt-1 text-sm text-graphite">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald/10 blur-3xl" />
      </section>

      {/* Aviso de retenção / prazos */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <RetentionAlert />
        </div>
      </section>

      {/* Diferenciais */}
      <section id="diferenciais" className="border-b border-border bg-soft-gray/40">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-deep">
              Diferenciais
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-deep md:text-4xl">
              Consultoria, não apenas conformidade
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DIFERENCIAIS.map((d) => (
              <div
                key={d.title}
                className="rounded-xl border border-border bg-background p-7 transition-all hover:border-emerald/40 hover:shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy/8 text-navy">
                  <d.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 text-base font-semibold text-navy-deep">
                  {d.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite">
                  {d.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institucional */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-deep">
              Quem somos
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-deep md:text-4xl">
              Uma advisory com raiz técnica contábil
            </h2>
            <p className="mt-6 text-base leading-relaxed text-graphite">
              Atuamos com empresários, profissionais liberais e famílias que
              precisam de mais do que guias pagas em dia: precisam entender o
              impacto financeiro e tributário de cada movimento.
            </p>
            <Link
              to="/quem-somos"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:gap-3 hover:underline"
            >
              Conhecer a MF Advisory <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              ["Missão", "Transformar informação contábil em inteligência aplicada às decisões."],
              ["Visão", "Ser referência no Maranhão em consultoria contábil estratégica."],
              ["Valores", "Ética, sigilo, precisão técnica e transparência nos honorários."],
              ["Método", "Diagnóstico, estruturação, estratégia e acompanhamento."],
            ].map(([t, d]) => (
              <div
                key={t}
                className="rounded-xl border border-border bg-soft-gray/50 p-6"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-navy">
                  {t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços por categoria */}
      <section id="servicos" className="border-b border-border bg-soft-gray/30">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-deep">
                Serviços
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-deep md:text-4xl">
                Quatro frentes, uma mesma inteligência
              </h2>
            </div>
            <Link
              to="/servicos"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-graphite transition-colors hover:border-navy hover:text-navy"
            >
              Ver todos os serviços <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {SERVICE_CATEGORIES.map((cat) => (
              <ServiceCategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Checklist IRPF */}
      <section id="checklist" className="bg-navy-deep">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald">
                Checklist inicial
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
                Comece em menos de 2 minutos
              </h2>
              <p className="mt-5 text-base leading-relaxed text-primary-foreground/70">
                Marque os documentos que você já tem. Preparamos seu atendimento
                a partir do que falta — sem retrabalho, sem surpresas.
              </p>
            </div>

            <div className="rounded-2xl bg-background p-7 shadow-2xl shadow-black/20 md:p-9">
              <div className="space-y-3">
                {documents.map((doc) => {
                  const isChecked = !!checked[doc];
                  return (
                    <button
                      key={doc}
                      type="button"
                      onClick={() => toggle(doc)}
                      className={`group flex w-full items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-all ${
                        isChecked
                          ? "border-emerald bg-emerald/5"
                          : "border-border bg-background hover:border-emerald/40"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isChecked
                            ? "border-emerald-deep bg-emerald-deep"
                            : "border-border bg-background"
                        }`}
                      >
                        {isChecked && (
                          <Check
                            className="h-3.5 w-3.5 text-primary-foreground"
                            strokeWidth={3}
                          />
                        )}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isChecked ? "text-navy-deep" : "text-graphite"
                        }`}
                      >
                        {doc}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {checkedCount} de {documents.length} marcados
                </span>
                <span>Você pode enviar mesmo sem ter tudo</span>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-navy-deep"
              >
                <MessageCircle className="h-5 w-5" />
                Enviar para o WhatsApp
              </a>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Resposta em até 1 hora útil
              </p>
            </div>
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
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
