import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  Calculator,
  FileText,
  Landmark,
  LineChart,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";

export type ServiceItem = {
  title: string;
  desc: string;
  price?: string;
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
    id: "consultoria",
    label: "Consultoria Estratégica",
    icon: LineChart,
    intro:
      "Diagnóstico, indicadores e cenários para decidir com base em dados — não em intuição.",
    items: [
      {
        title: "Diagnóstico empresarial",
        desc: "Análise de estrutura, margens e riscos com plano de ação priorizado.",
        price: "A partir de R$ 890",
      },
      {
        title: "Planejamento tributário",
        desc: "Escolha do regime, simulações e economia fiscal dentro da legalidade.",
        price: "A partir de R$ 1.200",
      },
      {
        title: "Assessoria para decisões",
        desc: "Acompanhamento recorrente de indicadores e reuniões de resultado.",
        price: "Sob consulta",
      },
    ],
  },
  {
    id: "contabilidade",
    label: "Contabilidade Empresarial",
    icon: Building2,
    intro:
      "Escrituração, obrigações e demonstrações confiáveis, com prazos sob controle.",
    items: [
      {
        title: "Contabilidade completa",
        desc: "Escrituração fiscal e contábil, folha e obrigações acessórias.",
        price: "A partir de R$ 490/mês",
      },
      {
        title: "Abertura e regularização de empresas",
        desc: "Constituição, alterações contratuais e adequação cadastral.",
        price: "A partir de R$ 690",
      },
      {
        title: "Consultoria MEI e Simples Nacional",
        desc: "DAS, DASN-SIMEI, enquadramento e transição para a Reforma Tributária.",
        price: "A partir de R$ 120",
      },
    ],
  },
  {
    id: "bpo",
    label: "BPO Financeiro",
    icon: Wallet,
    intro:
      "Rotina financeira terceirizada, com fluxo de caixa organizado e relatórios claros.",
    items: [
      {
        title: "Gestão de contas a pagar e receber",
        desc: "Conciliação bancária, agenda de pagamentos e cobrança.",
        price: "A partir de R$ 690/mês",
      },
      {
        title: "Fluxo de caixa e relatórios gerenciais",
        desc: "Projeções, DRE gerencial e painéis mensais de desempenho.",
        price: "A partir de R$ 450/mês",
      },
    ],
  },
  {
    id: "pessoa-fisica",
    label: "Pessoa Física & Patrimônio",
    icon: Landmark,
    intro:
      "Conformidade fiscal pessoal e organização patrimonial com segurança.",
    items: [
      {
        title: "Declaração de IRPF",
        desc: "Elaboração, revisão, envio e acompanhamento de malha fina.",
        price: "A partir de R$ 180",
      },
      {
        title: "Regularização de CPF e pendências",
        desc: "Situação cadastral, restituições e retificações na Receita.",
        price: "A partir de R$ 120",
      },
      {
        title: "Organização patrimonial",
        desc: "Bens, investimentos e sucessão sob ótica fiscal.",
        price: "Sob consulta",
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
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium tracking-wide text-navy-deep">
                {s.title}
              </p>
              {s.price && (
                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald">
                  {s.price}
                </span>
              )}
            </div>
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
        Solicitar proposta
      </Link>
    </div>
  );
}
