import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { formatCPF, isValidCPF, onlyDigits } from "@/lib/auth-helpers";
import { verifyCpfEmailMatch } from "@/lib/auth.functions";

export const Route = createFileRoute("/auth/recuperar")({
  component: RecuperarPage,
  head: () => ({
    meta: [
      { title: "Recuperar senha — S.ACCTANT" },
      {
        name: "description",
        content: "Recupere o acesso à sua Área do Cliente S.ACCTANT.",
      },
    ],
  }),
});

const emailSchema = z.string().trim().toLowerCase().email("E-mail inválido.");

function RecuperarPage() {
  const verify = useServerFn(verifyCpfEmailMatch);
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidCPF(cpf)) {
      setError("CPF inválido.");
      return;
    }
    const emailParsed = emailSchema.safeParse(email);
    if (!emailParsed.success) {
      setError(emailParsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { match } = await verify({
        data: { cpf: onlyDigits(cpf), email: emailParsed.data },
      });
      // Sempre mostramos a mesma mensagem para não revelar existência.
      if (match) {
        await supabase.auth.resetPasswordForEmail(emailParsed.data, {
          redirectTo: `${window.location.origin}/auth/redefinir`,
        });
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-gray/40 flex flex-col">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-navy flex items-center justify-center">
              <Calculator className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight text-navy-deep">
              S.<span className="text-graphite">ACCTANT</span>
            </span>
          </Link>
          <Link to="/auth" className="text-sm text-graphite hover:text-navy">
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-border bg-background p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-navy-deep">
            Recuperar senha
          </h1>
          <p className="mt-1 text-sm text-graphite">
            Informe seu CPF e o e-mail cadastrado. Enviaremos um link para
            redefinir sua senha.
          </p>

          {sent ? (
            <div className="mt-6 rounded-md bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
              Se os dados conferirem com nosso cadastro, você receberá um
              e-mail com o link de redefinição em instantes. Verifique também a
              caixa de spam.
              <div className="mt-4">
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-navy-deep"
                >
                  Voltar ao acesso
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-graphite">
                  CPF
                </span>
                <input
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  required
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-graphite">
                  E-mail cadastrado
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputCls}
                />
              </label>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-navy-deep transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar link de redefinição
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-navy-deep placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15";
