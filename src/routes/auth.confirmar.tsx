import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const allowedOtpTypes = ["signup", "email", "email_change"] as const;
type AllowedOtpType = (typeof allowedOtpTypes)[number];

export const Route = createFileRoute("/auth/confirmar")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
    token_hash:
      typeof search.token_hash === "string" ? search.token_hash : undefined,
    type: typeof search.type === "string" ? search.type : undefined,
    redirect:
      search.redirect === "/admin" || search.redirect === "/cliente"
        ? search.redirect
        : "/cliente",
  }),
  component: ConfirmarEmailPage,
  head: () => ({
    meta: [
      { title: "Confirmar e-mail — MF Advisory" },
      {
        name: "description",
        content: "Confirme seu e-mail para acessar a MF Advisory.",
      },
      { property: "og:title", content: "Confirmar e-mail — MF Advisory" },
      {
        property: "og:description",
        content: "Confirme seu e-mail para acessar a MF Advisory.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ConfirmarEmailPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Validando seu e-mail…");

  useEffect(() => {
    let active = true;

    const confirm = async () => {
      try {
        let error: Error | null = null;

        if (search.code) {
          const result = await supabase.auth.exchangeCodeForSession(search.code);
          error = result.error;
        } else if (
          search.token_hash &&
          allowedOtpTypes.includes(search.type as AllowedOtpType)
        ) {
          const result = await supabase.auth.verifyOtp({
            token_hash: search.token_hash,
            type: search.type as AllowedOtpType,
          });
          error = result.error;
        } else {
          const { data, error: userError } = await supabase.auth.getUser();
          error = userError;
          if (!data.user && !error) error = new Error("Link de confirmação inválido.");
        }

        if (error) throw error;
        if (!active) return;
        setStatus("success");
        setMessage("E-mail confirmado. Seu acesso está liberado.");
        window.setTimeout(() => {
          navigate({ to: search.redirect, replace: true });
        }, 1200);
      } catch (error) {
        if (!active) return;
        const raw = error instanceof Error ? error.message : "";
        setStatus("error");
        setMessage(
          /expired/i.test(raw)
            ? "Este link expirou. Solicite um novo e-mail de confirmação."
            : "Não foi possível confirmar este link. Ele pode ser inválido ou já ter sido utilizado.",
        );
      }
    };

    void confirm();
    return () => {
      active = false;
    };
  }, [navigate, search.code, search.redirect, search.token_hash, search.type]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-soft-gray/40 px-6 py-12">
      <section className="w-full max-w-md border border-border bg-card p-8 text-center card-elev">
        {status === "loading" ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald" />
        ) : status === "success" ? (
          <CheckCircle2 className="mx-auto h-9 w-9 text-emerald" />
        ) : (
          <XCircle className="mx-auto h-9 w-9 text-destructive" />
        )}
        <h1 className="mt-5 text-2xl font-semibold text-navy-deep">
          Confirmação de e-mail
        </h1>
        <p className="mt-3 text-sm text-graphite">{message}</p>
        {status === "error" && (
          <Link
            to="/auth"
            search={{ redirect: search.redirect }}
            className="mt-6 inline-flex border border-border px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold-deep"
          >
            Voltar ao acesso
          </Link>
        )}
      </section>
    </main>
  );
}