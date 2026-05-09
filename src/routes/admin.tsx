import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminStub,
  head: () => ({ meta: [{ title: "Admin — S.ACCTANT" }] }),
});

function AdminStub() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-gray/40 px-6">
      <div className="max-w-md text-center rounded-xl border border-border bg-background p-8 shadow-sm">
        <div className="mx-auto h-10 w-10 rounded-md bg-navy flex items-center justify-center">
          <Calculator className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-navy-deep">Painel Admin</h1>
        <p className="mt-2 text-sm text-graphite">
          A gestão de clientes, alteração de status e edição de textos da landing
          serão entregues na <strong>Fase 2</strong>. Você já tem acesso ao banco
          via Lovable Cloud.
        </p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-navy-deep transition-colors">
          Voltar ao site
        </Link>
      </div>
    </div>
  );
}
