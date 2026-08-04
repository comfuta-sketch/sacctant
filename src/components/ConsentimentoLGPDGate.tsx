import { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Props = { children: React.ReactNode };

/**
 * Bloqueia o conteúdo logado até o usuário aceitar Termos de Uso e
 * Política de Privacidade. Salva timestamp em profiles.consentimento_lgpd_em.
 */
export function ConsentimentoLGPDGate({ children }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [termos, setTermos] = useState(false);
  const [privacidade, setPrivacidade] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setChecking(false);
      return;
    }
    void (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("consentimento_lgpd_em")
        .eq("id", user.id)
        .maybeSingle();
      setAccepted(!!data?.consentimento_lgpd_em);
      setChecking(false);
    })();
  }, [user, authLoading]);

  const handleAccept = async () => {
    if (!user || !termos || !privacidade) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("profiles")
      .update({ consentimento_lgpd_em: new Date().toISOString() })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setAccepted(true);
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gray/40">
        <Loader2 className="h-6 w-6 animate-spin text-navy" />
      </div>
    );
  }

  if (!user || accepted) return <>{children}</>;

  return (
    <>
      <div className="pointer-events-none select-none blur-sm opacity-60">
        {children}
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg rounded-2xl bg-background p-6 sm:p-8 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-deep">
                Consentimento de Privacidade
              </h2>
              <p className="mt-1 text-sm text-graphite">
                Para continuar, leia e aceite nossos termos. Seus dados são
                tratados de acordo com a LGPD.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <label className="flex items-start gap-3 rounded-lg border border-border bg-soft-gray/40 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termos}
                onChange={(e) => setTermos(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-navy"
              />
              <span className="text-sm text-navy-deep">
                Li e concordo com os <strong>Termos de Uso</strong> da
                plataforma MF Advisory.
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-border bg-soft-gray/40 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacidade}
                onChange={(e) => setPrivacidade(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-navy"
              />
              <span className="text-sm text-navy-deep">
                Concordo com a <strong>Política de Privacidade</strong> e
                autorizo o tratamento dos meus dados conforme a LGPD para
                prestação dos serviços contratados.
              </span>
            </label>
          </div>

          {error && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleAccept}
            disabled={!termos || !privacidade || saving}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-navy-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Aceitar e continuar
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Você pode revogar o consentimento a qualquer momento entrando em
            contato pelo e-mail s.acctant@gmail.com.
          </p>
        </div>
      </div>
    </>
  );
}
