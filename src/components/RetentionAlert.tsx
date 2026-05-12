import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function RetentionAlert() {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 sm:p-5 text-amber-900 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Atenção</p>
          <p className="mt-1 text-sm leading-relaxed">
            Dados enviados sem cadastro <strong>não serão salvos</strong> para
            consultas futuras. Crie sua conta para garantir o histórico de suas
            declarações.
          </p>
          <Link
            to="/auth"
            search={{ redirect: "/cliente" }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            Criar minha conta
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
