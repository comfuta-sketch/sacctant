import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Calculator,
  FileText,
  Gem,
  Landmark,
  ScrollText,
  Sigma,
} from "lucide-react";
import type { ComponentType } from "react";

export type ServiceItem = {
  title: string;
  desc: string;
};

export type ServiceCategory = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  intro: string;
  items: ServiceItem[];
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "cfo-as-a-service",
    label: "CFO as a Service & Controladoria",
    icon: Sigma,
    intro:
      "Uma diretoria financeira sob demanda para sustentar decisões de nível C com dados auditáveis.",
    items: [
      {
        title: "Gestão de indicadores e performance",
        desc: "KPIs financeiros, margens por linha de negócio e leitura executiva mensal.",
      },
      {
        title: "DRE gerencial e projeções de caixa",
        desc: "Modelagem de cenários, orçamento e projeção de fluxo em horizonte rolante.",
      },
      {
        title: "Suporte à tomada de decisão",
        desc: "Comitês de resultado, análise de investimentos e preparação para captação.",
      },
    ],
  },
  {
    id: "contabilidade-governanca",
    label: "Contabilidade Estratégica & Governança",
    icon: ScrollText,
    intro:
      "Escrituração avançada e conformidade rigorosa para empresas em tração e scale-ups.",
    items: [
      {
        title: "Escrituração avançada e fechamentos",
        desc: "Rotinas contábeis, fiscais e de folha com calendário e trilha documental.",
      },
      {
        title: "Governança e conformidade",
        desc: "Controles internos, políticas e adequação societária para due diligence.",
      },
      {
        title: "Estruturação de empresas em crescimento",
        desc: "Constituição, reorganizações e alinhamento cadastral para novos ciclos.",
      },
    ],
  },
  {
    id: "planejamento-tributario",
    label: "Planejamento Tributário & Reforma",
    icon: Landmark,
    intro:
      "Arquitetura fiscal preditiva com inteligência baseada no IVA Dual, CBS e IBS.",
    items: [
      {
        title: "Arquitetura fiscal preditiva",
        desc: "Simulação de regimes e desenho de estrutura com eficiência sustentável.",
      },
      {
        title: "Transição para o IVA Dual (CBS/IBS)",
        desc: "Mapeamento de impactos, precificação e cronograma de adequação.",
      },
      {
        title: "Mitigação legal de riscos",
        desc: "Revisão de créditos, defesa técnica e prevenção de contingências.",
      },
    ],
  },
  {
    id: "wealth-management",
    label: "Gestão Patrimonial e Wealth Management",
    icon: Gem,
    intro:
      "Organização patrimonial para executivos, holdings familiares e alta renda.",
    items: [
      {
        title: "Holdings familiares e sucessão",
        desc: "Estrutura societária, governança familiar e planejamento sucessório.",
      },
      {
        title: "Blindagem fiscal de alta renda",
        desc: "Eficiência tributária de rendimentos, investimentos e ativos no exterior.",
      },
      {
        title: "Conformidade patrimonial do executivo",
        desc: "Declarações, regularizações e consolidação de posição patrimonial.",
      },
    ],
  },
];

export const HIGHLIGHT_ICONS = { BarChart3, Calculator, FileText };

export function ServiceCategoryCard({ cat }: { cat: ServiceCategory }) {
  const Icon = cat.icon;
  return (
    <div className="group border border-border bg-background p-8 transition-colors duration-500 hover:border-emerald/40 md:p-10">
      <div className="flex items-start gap-4">
        <Icon className="h-6 w-6 shrink-0 text-emerald" strokeWidth={1.15} />
        <h3 className="font-display text-base font-semibold uppercase tracking-[0.12em] text-navy-deep">
          {cat.label}
        </h3>
      </div>
      <p className="mt-5 font-serif text-[15px] leading-relaxed text-graphite">
        {cat.intro}
      </p>
      <ul className="mt-8 space-y-6 border-t border-border pt-8">
        {cat.items.map((s) => (
          <li key={s.title}>
            <p className="text-sm font-medium tracking-wide text-navy-deep">
              {s.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-graphite">
              {s.desc}
            </p>
          </li>
        ))}
      </ul>
      <Link
        to="/contato"
        className="mt-10 inline-flex items-center gap-2 font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-graphite transition-colors hover:text-emerald"
      >
        Solicitar Diagnóstico Estratégico
      </Link>
    </div>
  );
}
