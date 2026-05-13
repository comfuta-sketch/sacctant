import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { User as UserIcon } from "lucide-react";
import {
  ShieldCheck,
  GraduationCap,
  Globe2,
  Check,
  ArrowRight,
  FileText,
  CreditCard,
  Briefcase,
  Calculator,
  Mail,
  Phone,
  MessageCircle,
  Pencil,
  Save,
  RotateCcw,
} from "lucide-react";
import { StartChannelDialog } from "@/components/StartChannelDialog";
import { WHATSAPP_URL as whatsappUrl } from "@/lib/auth-helpers";
import { RetentionAlert } from "@/components/RetentionAlert";
import { LgpdNotice } from "@/components/LgpdNotice";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "S.ACCTANT | Contabilidade Digital — IRPF, CPF e MEI" },
      {
        name: "description",
        content:
          "S.ACCTANT — atendimento especializado em IRPF, regularização de CPF e consultoria MEI em São Luís/MA. 100% online, com segurança.",
      },
    ],
  }),
});

type Service = {
  id: string;
  title: string;
  desc: string;
  price: string;
};

const SERVICE_ICONS = {
  irpf: FileText,
  cpf: CreditCard,
  mei: Briefcase,
  planejamento: Calculator,
} as const;

const defaultServices: Service[] = [
  {
    id: "irpf",
    title: "Declaração de IRPF",
    desc: "Elaboração completa, revisão e envio com acompanhamento da malha fina.",
    price: "180",
  },
  {
    id: "cpf",
    title: "Regularização de CPF",
    desc: "Resolução de pendências, restituições e situação cadastral na Receita.",
    price: "120",
  },
  {
    id: "mei",
    title: "Consultoria MEI",
    desc: "Abertura, DAS, DASN-SIMEI e orientação para a Reforma Tributária.",
    price: "90",
  },
  {
    id: "planejamento",
    title: "Planejamento Tributário",
    desc: "Análise individualizada para reduzir tributos dentro da legalidade.",
    price: "250",
  },
];

const STORAGE_KEY = "contabil.services.v1";

const documents = [
  "RG ou CNH",
  "CPF",
  "Informe de Rendimentos",
  "Extrato Bancário",
  "Comprovante de Residência",
  "Recibos médicos e educacionais",
];

function formatPrice(price: string) {
  const trimmed = price.trim();
  if (!trimmed) return "—";
  // If user already typed a currency prefix, keep it; otherwise prepend R$
  if (/^r\$/i.test(trimmed)) return trimmed;
  return `R$ ${trimmed}`;
}

function Index() {
  const { user, isAdmin } = useAuth();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Service[]>(defaultServices);

  // Load saved services from localStorage on the client only (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Service[];
        // Merge with defaults to keep ids/icons in sync
        const merged = defaultServices.map(
          (d) => parsed.find((p) => p.id === d.id) ?? d,
        );
        setServices(merged);
        setDraft(merged);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggle = (doc: string) =>
    setChecked((c) => ({ ...c, [doc]: !c[doc] }));

  const checkedCount = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked],
  );

  const whatsappLink = useMemo(() => {
    const have = documents.filter((d) => checked[d]);
    const missing = documents.filter((d) => !checked[d]);
    const msg = [
      "Olá! Gostaria de iniciar minha declaração.",
      "",
      `Documentos que já tenho (${have.length}):`,
      ...(have.length ? have.map((d) => `✓ ${d}`) : ["—"]),
      "",
      `Ainda preciso providenciar (${missing.length}):`,
      ...(missing.length ? missing.map((d) => `• ${d}`) : ["—"]),
    ].join("\n");
    return `https://wa.me/5598984776989?text=${encodeURIComponent(msg)}`;
  }, [checked]);

  const startEditing = () => {
    setDraft(services);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(services);
    setEditing(false);
  };

  const saveEditing = () => {
    setServices(draft);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
    setEditing(false);
  };

  const resetServices = () => {
    setServices(defaultServices);
    setDraft(defaultServices);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const updateDraft = (id: string, field: keyof Service, value: string) => {
    setDraft((d) =>
      d.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const list = editing ? draft : services;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-navy flex items-center justify-center">
              <Calculator className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight text-navy-deep">
              S.<span className="text-graphite">ACCTANT</span>
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-graphite">
            <a href="#diferenciais" className="hover:text-navy transition-colors">Diferenciais</a>
            <a href="#servicos" className="hover:text-navy transition-colors">Serviços</a>
            <a href="#checklist" className="hover:text-navy transition-colors">Checklist</a>
            <a href="#contato" className="hover:text-navy transition-colors">Contato</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                to={isAdmin ? "/admin" : "/cliente"}
                className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-graphite hover:border-navy hover:text-navy transition-colors"
              >
                <UserIcon className="h-4 w-4" />
                {isAdmin ? "Painel Admin" : "Minha Área"}
              </Link>
            ) : (
              <Link
                to="/auth"
                search={{ redirect: "/cliente" }}
                className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-graphite hover:border-navy hover:text-navy transition-colors"
              >
                <UserIcon className="h-4 w-4" />
                Área do Cliente
              </Link>
            )}
            <StartChannelDialog
              trigger={
                <button
                  type="button"
                  className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-navy-deep transition-colors"
                >
                  Iniciar Declaração
                </button>
              }
            />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-32 md:pb-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-soft-gray px-3 py-1 text-xs font-medium text-graphite">
              <ShieldCheck className="h-3.5 w-3.5 text-navy" />
              Conformidade fiscal certificada
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-navy-deep leading-[1.05]">
              Sua conformidade fiscal com{" "}
              <span className="text-navy">máxima segurança</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-graphite leading-relaxed max-w-2xl">
              Atendimento especializado para IRPF, Regularização de CPF e
              Consultoria para MEI. Deixe a burocracia com quem entende de
              proteção e precisão.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <IrpfWizardDialog
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3.5 text-base font-medium text-primary-foreground hover:bg-navy-deep transition-all hover:gap-3"
                  >
                    Iniciar Declaração
                    <ArrowRight className="h-4 w-4" />
                  </button>
                }
              />
              <a
                href="#servicos"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3.5 text-base font-medium text-graphite hover:border-navy hover:text-navy transition-colors"
              >
                Ver serviços
              </a>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-navy/5 blur-3xl" />
      </section>

      {/* Diferenciais */}
      <section id="diferenciais" className="border-t border-border bg-soft-gray/40">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-navy">
              Diferenciais
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-navy-deep">
              Por que confiar em nosso trabalho
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Segurança Operacional",
                desc: "Protocolos rigorosos de proteção de dados, conformidade com a LGPD e canais criptografados de envio.",
              },
              {
                icon: GraduationCap,
                title: "Expertise Técnica",
                desc: "Atualização constante e foco especial na transição para a Reforma Tributária 2026.",
              },
              {
                icon: Globe2,
                title: "Processo 100% Online",
                desc: "Atendimento ágil de qualquer lugar. Assinatura digital, envio remoto e suporte por WhatsApp.",
              },
            ].map((d) => (
              <div
                key={d.title}
                className="rounded-xl border border-border bg-background p-8 hover:border-navy/30 hover:shadow-sm transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy/8 text-navy">
                  <d.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-navy-deep">
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

      {/* Serviços */}
      <section id="servicos">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-navy">
                Serviços
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-navy-deep">
                Soluções claras, valores transparentes
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {!editing ? (
                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-graphite hover:border-navy hover:text-navy transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Editar serviços
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={resetServices}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-graphite hover:border-navy hover:text-navy transition-colors"
                    title="Restaurar valores padrão"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restaurar
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-graphite hover:border-navy hover:text-navy transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={saveEditing}
                    className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-navy-deep transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </button>
                </>
              )}
            </div>
          </div>
          {editing && (
            <p className="mt-4 text-xs text-muted-foreground">
              As alterações ficam salvas apenas neste navegador. O prefixo
              "R$" é adicionado automaticamente ao preço.
            </p>
          )}

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
            {list.map((s) => {
              const Icon = SERVICE_ICONS[s.id as keyof typeof SERVICE_ICONS] ?? FileText;
              return (
                <div
                  key={s.id}
                  className="group flex items-start gap-5 bg-background p-7 hover:bg-soft-gray/60 transition-colors"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy/8 text-navy">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      {editing ? (
                        <input
                          value={s.title}
                          onChange={(e) =>
                            updateDraft(s.id, "title", e.target.value)
                          }
                          className="flex-1 min-w-0 rounded-md border border-border bg-background px-2 py-1 text-lg font-semibold text-navy-deep focus:border-navy focus:outline-none"
                        />
                      ) : (
                        <h3 className="text-lg font-semibold text-navy-deep">
                          {s.title}
                        </h3>
                      )}
                      <div className="text-right shrink-0">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">
                          A partir de
                        </span>
                        {editing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-base font-semibold text-navy">R$</span>
                            <input
                              value={s.price}
                              onChange={(e) =>
                                updateDraft(s.id, "price", e.target.value)
                              }
                              className="w-20 rounded-md border border-border bg-background px-2 py-1 text-base font-semibold text-navy focus:border-navy focus:outline-none text-right"
                            />
                          </div>
                        ) : (
                          <span className="text-base font-semibold text-navy">
                            {formatPrice(s.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    {editing ? (
                      <textarea
                        value={s.desc}
                        onChange={(e) =>
                          updateDraft(s.id, "desc", e.target.value)
                        }
                        rows={3}
                        className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1 text-sm leading-relaxed text-graphite focus:border-navy focus:outline-none resize-none"
                      />
                    ) : (
                      <p className="mt-2 text-sm leading-relaxed text-graphite">
                        {s.desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section id="checklist" className="border-t border-border bg-navy-deep">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
                Checklist Inicial
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-white">
                Comece em menos de 2 minutos
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/70">
                Marque os documentos que você já tem. Vamos preparar seu
                atendimento com base no que falta — sem retrabalho, sem
                surpresas.
              </p>
              <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                <p className="font-medium text-white">Atendimento humano</p>
                <p className="mt-1">
                  Após enviar, você fala diretamente com um contador
                  especialista — não com um robô.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-background p-7 md:p-9 shadow-2xl shadow-black/20">
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
                          ? "border-navy bg-navy/5"
                          : "border-border bg-background hover:border-navy/40"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isChecked
                            ? "border-navy bg-navy"
                            : "border-border bg-background"
                        }`}
                      >
                        {isChecked && (
                          <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
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
                <span>{checkedCount} de {documents.length} marcados</span>
                <span>Você pode enviar mesmo sem ter tudo</span>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-4 text-base font-semibold text-primary-foreground hover:bg-navy-deep transition-colors"
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

      {/* Footer */}
      <footer id="contato" className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-navy flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold tracking-tight text-navy-deep">
                  S.<span className="text-graphite">ACCTANT</span>
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-graphite max-w-xs">
                Contabilidade digital especializada em pessoas físicas e
                microempreendedores em São Luís/MA.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-navy-deep">Contato</h4>
              <ul className="mt-4 space-y-3 text-sm text-graphite">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-navy" />
                  <span>marcos@sacctant.com.br</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-navy" />
                  <span>(98) 98477-6989</span>
                </li>
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-navy-deep transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Falar com Marcos no WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-navy-deep">
                Reforma Tributária
              </h4>
              <p className="mt-4 text-sm leading-relaxed text-graphite">
                Estamos preparados para a transição da Reforma Tributária 2026.
                Acompanhamos cada etapa para que você não seja pego de surpresa
                pelas novas regras.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} S.ACCTANT — Todos os direitos reservados.</p>
            <p>CRC ativo • LGPD compliant</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com Marcos no WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 hover:scale-105 transition-transform"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
