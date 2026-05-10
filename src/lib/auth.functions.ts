import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const cpfSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length === 11, "CPF inválido");

/**
 * Resolve o e-mail real de um cliente a partir do CPF.
 * Retorna { email } ou { email: null }. Não revela outros dados.
 */
export const resolveClientEmailByCpf = createServerFn({ method: "POST" })
  .inputValidator((data: { cpf: string }) =>
    z.object({ cpf: cpfSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("cpf", data.cpf)
      .maybeSingle();
    if (error) {
      console.error("resolveClientEmailByCpf error", error);
      return { email: null as string | null };
    }
    return { email: (row?.email as string | null) ?? null };
  });

/**
 * Verifica se CPF + e-mail correspondem ao mesmo perfil. Booleano sem
 * revelar qual dos dois falhou.
 */
export const verifyCpfEmailMatch = createServerFn({ method: "POST" })
  .inputValidator((data: { cpf: string; email: string }) =>
    z
      .object({
        cpf: cpfSchema,
        email: z.string().trim().toLowerCase().email(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("cpf", data.cpf)
      .maybeSingle();
    const ok =
      !!row?.email && (row.email as string).toLowerCase() === data.email;
    return { match: ok };
  });
