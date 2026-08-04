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
  icon: ComponentType<{ className?: string }>;
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
    <div className="rounded-2xl border border-border bg-background p-7 transition-all hover:border-emerald/40 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald/10 text-emerald-deep">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-semibold text-navy-deep">{cat.label}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-graphite">{cat.intro}</p>
      <ul className="mt-5 space-y-4 border-t border-border pt-5">
        {cat.items.map((s) => (
          <li key={s.title}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-navy-deep">{s.title}</p>
              {s.price && (
                <span className="text-xs font-semibold text-emerald-deep">
                  {s.price}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-graphite">{s.desc}</p>
          </li>
        ))}
      </ul>
      <Link
        to="/contato"
        className="mt-6 inline-flex text-xs font-semibold text-navy hover:underline"
      >
        Solicitar proposta
      </Link>
    </div>
  );
}
