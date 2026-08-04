// Utilitários de autenticação para o fluxo CPF + senha do cliente.
// O Supabase Auth requer e-mail; usamos um e-mail interno derivado do CPF.

export const CPF_EMAIL_DOMAIN = "cliente.sacctant.app";

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCPF(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function isValidCPF(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(cpf[10]);
}

export function cpfToInternalEmail(cpf: string) {
  return `${onlyDigits(cpf)}@${CPF_EMAIL_DOMAIN}`;
}

export const ASAAS_PAYMENT_URL = "https://www.asaas.com/c/x2qzdzypk1kya7nj";
export const WHATSAPP_NUMBER = "5598984776989";
export const WHATSAPP_DEFAULT_MSG =
  "Olá Marcos, acabei de preencher os dados iniciais no site da MF Advisory e gostaria de seguir com minha declaração.";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MSG)}`;
