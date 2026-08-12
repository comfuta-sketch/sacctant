import { WHATSAPP_NUMBER } from "@/lib/auth-helpers";

export type HelpChannel = {
  id: string;
  label: string;
  hint: string;
  message: string;
};

/** Opções de contato imediato — sem formulários, sem dados pessoais. */
export const HELP_CHANNELS: HelpChannel[] = [
  {
    id: "cfo",
    label: "CFO as a Service",
    hint: "Controladoria e diretoria financeira sob demanda",
    message:
      "Olá, tenho interesse em estruturar um CFO as a Service / controladoria para a minha empresa. Podemos conversar?",
  },
  {
    id: "tributario",
    label: "Planejamento Tributário",
    hint: "Arquitetura fiscal, IVA Dual (CBS/IBS) e eficiência",
    message:
      "Olá, tenho interesse em estruturar o Planejamento Tributário da minha empresa, incluindo a transição para o IVA Dual (CBS/IBS).",
  },
  {
    id: "bpo",
    label: "BPO Financeiro",
    hint: "Rotinas financeiras, contas a pagar e receber",
    message:
      "Olá, gostaria de entender como funciona o BPO Financeiro da MF Advisory para as rotinas da minha empresa.",
  },
  {
    id: "patrimonio",
    label: "Gestão Patrimonial",
    hint: "Holdings familiares, sucessão e alta renda",
    message:
      "Olá, gostaria de falar sobre gestão patrimonial, holding familiar e planejamento sucessório.",
  },
  {
    id: "contabil",
    label: "Contabilidade & Governança",
    hint: "Escrituração avançada, compliance e societário",
    message:
      "Olá, preciso de apoio em contabilidade estratégica, governança e conformidade societária.",
  },
  {
    id: "geral",
    label: "Atendimento Geral",
    hint: "Outras dúvidas e agendamento de diagnóstico",
    message:
      "Olá, vim pelo site da MF Advisory e gostaria de agendar um diagnóstico privado.",
  },
];

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
