import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  cpfToInternalEmail,
  formatCPF,
  isValidCPF,
  onlyDigits,
} from "@/lib/auth-helpers";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/cliente",
  }),
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Acesso — S.ACCTANT" },
      { name: "description", content: "Entre na Área do Cliente ou no painel admin da S.ACCTANT." },
    ],
  }),
});

type Tab = "cliente" | "admin";
type Mode = "login" | "cadastro";

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [tab, setTab] = useState<Tab>("cliente");
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // shared
  const [senha, setSenha] = useState("");
  // cliente
  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  // admin
  const [email, setEmail] = useState("");

  // If already logged in, redirect
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        navigate({ to: roleRow ? "/admin" : (search.redirect || "/cliente") });
      }
    });
  }, [navigate, search.redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "cliente") {
        if (!isValidCPF(cpf)) {
          setError("CPF inválido.");
          return;
        }
        const internalEmail = cpfToInternalEmail(cpf);

        if (mode === "cadastro") {
          if (nome.trim().length < 3) {
            setError("Informe seu nome completo.");
            return;
          }
          const { error: signUpError } = await supabase.auth.signUp({
            email: internalEmail,
            password: senha,
            options: {
              emailRedirectTo: `${window.location.origin}/cliente`,
              data: { cpf: onlyDigits(cpf), nome: nome.trim() },
            },
          });
          if (signUpError) throw signUpError;
          navigate({ to: "/cliente" });
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: internalEmail,
            password: senha,
          });
          if (signInError) throw signInError;
          navigate({ to: search.redirect || "/cliente" });
        }
      } else {
        // admin: email + senha
        if (!email.includes("@")) {
          setError("E-mail inválido.");
          return;
        }
        if (mode === "cadastro") {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password: senha,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
          if (signUpError) throw signUpError;
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
          });
          if (signInError) throw signInError;
        }
        navigate({ to: "/admin" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao processar.";
      // Friendly translation of common errors
      if (/Invalid login credentials/i.test(msg)) setError("CPF/e-mail ou senha incorretos.");
      else if (/already registered/i.test(msg)) setError("Já existe um cadastro com esses dados. Faça login.");
      else setError(msg);
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
          <Link to="/" className="text-sm text-graphite hover:text-navy">
            ← Voltar ao site
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-border bg-background p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-navy-deep">Acesso</h1>
          <p className="mt-1 text-sm text-graphite">
            Entre como cliente para acompanhar sua declaração.
          </p>

          {/* Tabs */}
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-soft-gray p-1">
            {(["cliente", "admin"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(null); }}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  tab === t ? "bg-background text-navy-deep shadow-sm" : "text-graphite"
                }`}
              >
                {t === "cliente" ? "Cliente (CPF)" : "Admin (e-mail)"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {tab === "cliente" ? (
              <>
                {mode === "cadastro" && (
                  <Field label="Nome completo">
                    <input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      className={inputCls}
                      autoComplete="name"
                    />
                  </Field>
                )}
                <Field label="CPF">
                  <input
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    required
                    className={inputCls}
                  />
                </Field>
              </>
            ) : (
              <Field label="E-mail">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputCls}
                />
              </Field>
            )}

            <Field label="Senha">
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "cadastro" ? "new-password" : "current-password"}
                className={inputCls}
              />
            </Field>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-navy-deep transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-graphite">
            {mode === "login" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
            <button
              type="button"
              className="font-semibold text-navy hover:underline"
              onClick={() => { setMode(mode === "login" ? "cadastro" : "login"); setError(null); }}
            >
              {mode === "login" ? "Cadastre-se" : "Entrar"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-navy-deep placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-graphite">{label}</span>
      {children}
    </label>
  );
}
