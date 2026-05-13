import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PasswordInput } from "@/components/PasswordInput";
import { LgpdNotice } from "@/components/LgpdNotice";

export const Route = createFileRoute("/auth/redefinir")({
  component: RedefinirPage,
  head: () => ({
    meta: [
      { title: "Redefinir senha — S.ACCTANT" },
      {
        name: "description",
        content: "Defina uma nova senha para sua conta S.ACCTANT.",
      },
    ],
  }),
});

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .regex(/[A-Za-z]/, "A senha deve conter ao menos uma letra.")
  .regex(/\d/, "A senha deve conter ao menos um número.");

function RedefinirPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Supabase processa o token do hash automaticamente e dispara
  // PASSWORD_RECOVERY no listener.
  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(!!session);
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setHasSession(!!data.session);
      setReady(true);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = passwordSchema.safeParse(senha);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (senha !== senha2) {
      setError("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      const { error: uErr } = await supabase.auth.updateUser({
        password: senha,
      });
      if (uErr) throw uErr;
      setDone(true);
      setTimeout(() => navigate({ to: "/cliente" }), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao redefinir.");
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
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-border bg-background p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-navy-deep">Nova senha</h1>
          <p className="mt-1 text-sm text-graphite">
            Defina uma nova senha para acessar sua área.
          </p>

          {!ready ? (
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-navy" />
            </div>
          ) : !hasSession ? (
            <div className="mt-6 rounded-md bg-amber-50 px-4 py-4 text-sm text-amber-900">
              Link inválido ou expirado. Solicite um novo link de
              redefinição.
              <div className="mt-4">
                <Link
                  to="/auth/recuperar"
                  className="inline-flex items-center justify-center rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-navy-deep"
                >
                  Solicitar novo link
                </Link>
              </div>
            </div>
          ) : done ? (
            <div className="mt-6 rounded-md bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
              Senha atualizada com sucesso. Redirecionando…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-graphite">
                  Nova senha
                </span>
                <PasswordInput
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-graphite">
                  Confirmar nova senha
                </span>
                <PasswordInput
                  value={senha2}
                  onChange={(e) => setSenha2(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
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
                Salvar nova senha
              </button>
            </form>
          )}
          <div className="mt-8"><LgpdNotice /></div>
        </div>
      </main>
    </div>
  );
}
