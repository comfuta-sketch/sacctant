import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function RetentionAlert() {
  return (
    <div className="border border-emerald/30 bg-emerald/[0.04] p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald"
            strokeWidth={1.25}
          />
          <div>
            <p className="eyebrow">Atenção</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-graphite">
              Dados enviados sem cadastro{" "}
              <span className="text-foreground">não serão salvos</span> para
              consultas futuras. Crie sua conta para manter o histórico das suas
              declarações e documentos.
            </p>
          </div>
        </div>
        <Link
          to="/auth"
          search={{ redirect: "/cliente" }}
          className="btn-ghost shrink-0 !px-5 !py-3 !text-[10px]"
        >
          Criar minha conta
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
