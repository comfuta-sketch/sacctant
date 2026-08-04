import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { formatCPF, isValidCPF, onlyDigits } from "@/lib/auth-helpers";
import { PasswordInput } from "@/components/PasswordInput";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { resolveClientEmailByCpf } from "@/lib/auth.functions";
import { LgpdNotice } from "@/components/LgpdNotice";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/cliente",
  }),
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Acesso — MF Advisory" },
      {
        name: "description",
        content: "Entre na Área do Cliente ou no painel admin da MF Advisory.",
      },
    ],
  }),
});

type Tab = "cliente" | "admin";
type Mode = "login" | "cadastro";

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .regex(/[A-Za-z]/, "A senha deve conter ao menos uma letra.")
  .regex(/\d/, "A senha deve conter ao menos um número.");

const emailSchema = z.string().trim().toLowerCase().email("E-mail inválido.");

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const resolveEmail = useServerFn(resolveClientEmailByCpf);

  const [tab, setTab] = useState<Tab>("cliente");
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // shared
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  // cliente
  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  // admin
  const [email, setEmail] = useState("");

  // OTP confirmation step (após signup do cliente)
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        navigate({ to: roleRow ? "/admin" : search.redirect || "/cliente" });
      }
    });
  }, [navigate, search.redirect]);

  const resetMessages = () => {
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    setLoading(true);
    try {
      if (tab === "cliente") {
        if (!isValidCPF(cpf)) {
          setError("CPF inválido.");
          return;
        }

        if (mode === "cadastro") {
          if (nome.trim().length < 3) {
            setError("Informe seu nome completo.");
            return;
          }
          const emailParsed = emailSchema.safeParse(emailCliente);
          if (!emailParsed.success) {
            setError(emailParsed.error.issues[0].message);
            return;
          }
          const passParsed = passwordSchema.safeParse(senha);
          if (!passParsed.success) {
            setError(passParsed.error.issues[0].message);
            return;
          }
          if (senha !== senha2) {
            setError("As senhas não conferem.");
            return;
          }

          const { error: signUpError } = await supabase.auth.signUp({
            email: emailParsed.data,
            password: senha,
            options: {
              emailRedirectTo: `${window.location.origin}/cliente`,
              data: { cpf: onlyDigits(cpf), nome: nome.trim() },
            },
          });
          if (signUpError) throw signUpError;

          setOtpEmail(emailParsed.data);
          setOtpStep(true);
          setInfo(
            `Enviamos um código de 6 dígitos para ${emailParsed.data}. Digite-o abaixo para ativar sua conta.`,
          );
        } else {
          // Login: CPF -> email real -> signIn
          if (!senha) {
            setError("Informe sua senha.");
            return;
          }
          const { email: realEmail } = await resolveEmail({
            data: { cpf: onlyDigits(cpf) },
          });
          if (!realEmail) {
            setError("CPF ou senha incorretos.");
            return;
          }
          const { error: signInError } =
            await supabase.auth.signInWithPassword({
              email: realEmail,
              password: senha,
            });
          if (signInError) throw signInError;
          navigate({ to: search.redirect || "/cliente" });
        }
      } else {
        if (!emailSchema.safeParse(email).success) {
          setError("E-mail inválido.");
          return;
        }
        if (mode === "cadastro") {
          const passParsed = passwordSchema.safeParse(senha);
          if (!passParsed.success) {
            setError(passParsed.error.issues[0].message);
            return;
          }
          if (senha !== senha2) {
            setError("As senhas não conferem.");
            return;
          }
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password: senha,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
          if (signUpError) throw signUpError;
          setInfo(
            "Conta criada. Verifique seu e-mail para confirmar antes de entrar.",
          );
          setMode("login");
        } else {
          const { error: signInError } =
            await supabase.auth.signInWithPassword({
              email,
              password: senha,
            });
          if (signInError) throw signInError;
          navigate({ to: "/admin" });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao processar.";
      if (/Invalid login credentials/i.test(msg))
        setError("CPF/e-mail ou senha incorretos.");
      else if (/Email not confirmed/i.test(msg)) {
        setError(
          "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.",
        );
      } else if (/already registered/i.test(msg))
        setError("Já existe um cadastro com esses dados. Faça login.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (otp.length !== 6) {
      setError("Digite os 6 dígitos do código.");
      return;
    }
    setLoading(true);
    try {
      const { error: vErr } = await supabase.auth.verifyOtp({
        email: otpEmail,
        token: otp,
        type: "signup",
      });
      if (vErr) throw vErr;
      navigate({ to: "/cliente" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao verificar.";
      if (/expired|invalid/i.test(msg))
        setError("Código inválido ou expirado. Solicite um novo.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    resetMessages();
    setLoading(true);
    try {
      const { error: rErr } = await supabase.auth.resend({
        type: "signup",
        email: otpEmail,
      });
      if (rErr) throw rErr;
      setInfo("Novo código enviado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao reenviar.");
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
              MF <span className="text-emerald">Advisory</span>
            </span>
          </Link>
          <Link to="/" className="text-sm text-graphite hover:text-navy">
            ← Voltar ao site
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-border bg-background p-8 shadow-sm">
          {otpStep ? (
            <>
              <h1 className="text-2xl font-bold text-navy-deep">
                Confirme seu e-mail
              </h1>
              <p className="mt-1 text-sm text-graphite">
                Enviamos um código de 6 dígitos para{" "}
                <span className="font-medium text-navy-deep">{otpEmail}</span>.
              </p>
              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="h-11 w-11 text-base"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}
                {info && !error && (
                  <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {info}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-navy-deep transition-colors disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirmar e entrar
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-navy hover:underline"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Reenviar código
                  </button>
                  <button
                    type="button"
                    className="text-graphite hover:text-navy"
                    onClick={() => {
                      setOtpStep(false);
                      setOtp("");
                      resetMessages();
                    }}
                  >
                    Voltar
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-navy-deep">Acesso</h1>
              <p className="mt-1 text-sm text-graphite">
                Entre como cliente para acompanhar sua declaração.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-soft-gray p-1">
                {(["cliente", "admin"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTab(t);
                      resetMessages();
                    }}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      tab === t
                        ? "bg-background text-navy-deep shadow-sm"
                        : "text-graphite"
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
                    {mode === "cadastro" && (
                      <Field label="E-mail">
                        <input
                          type="email"
                          value={emailCliente}
                          onChange={(e) => setEmailCliente(e.target.value)}
                          required
                          autoComplete="email"
                          placeholder="seu@email.com"
                          className={inputCls}
                        />
                      </Field>
                    )}
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
                  <PasswordInput
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    minLength={mode === "cadastro" ? 8 : 6}
                    autoComplete={
                      mode === "cadastro" ? "new-password" : "current-password"
                    }
                  />
                </Field>

                {mode === "cadastro" && (
                  <Field label="Confirmar senha">
                    <PasswordInput
                      value={senha2}
                      onChange={(e) => setSenha2(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </Field>
                )}

                {error && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}
                {info && !error && (
                  <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {info}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-navy-deep transition-colors disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "login" ? "Entrar" : "Criar conta"}
                </button>

                {tab === "cliente" && mode === "login" && (
                  <div className="text-right">
                    <Link
                      to="/auth/recuperar"
                      className="text-sm text-navy hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                )}
              </form>

              <p className="mt-4 text-center text-sm text-graphite">
                {mode === "login" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
                <button
                  type="button"
                  className="font-semibold text-navy hover:underline"
                  onClick={() => {
                    setMode(mode === "login" ? "cadastro" : "login");
                    resetMessages();
                    setSenha("");
                    setSenha2("");
                  }}
                >
                  {mode === "login" ? "Cadastre-se" : "Entrar"}
                </button>
              </p>
            </>
          )}
          <div className="mt-8"><LgpdNotice /></div>
        </div>
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-navy-deep placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-graphite">
        {label}
      </span>
      {children}
    </label>
  );
}
