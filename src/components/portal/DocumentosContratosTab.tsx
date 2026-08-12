import { useEffect, useState } from "react";
import { Loader2, Download, FileSignature, BellRing, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ContratoCliente } from "@/components/ContratoCliente";
import {
  contratoStatusInfo,
  contratoTipoLabel,
  formatDate,
  type ContratoRow,
} from "@/lib/portal-data";

type Documento = {
  id: string;
  nome_arquivo: string;
  storage_path: string;
  tipo: string;
  created_at: string;
};

export function DocumentosContratosTab() {
  const [contratos, setContratos] = useState<ContratoRow[]>([]);
  const [docs, setDocs] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    const [{ data: c }, { data: d }] = await Promise.all([
      supabase.from("contratos").select("*").order("created_at", { ascending: false }),
      supabase
        .from("documentos")
        .select("id,nome_arquivo,storage_path,tipo,created_at")
        .eq("tipo", "retorno")
        .order("created_at", { ascending: false }),
    ]);
    setContratos((c ?? []) as ContratoRow[]);
    setDocs((d ?? []) as Documento[]);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const abrir = async (c: ContratoRow) => {
    const next = openId === c.id ? null : c.id;
    setOpenId(next);
    if (next && !c.visualizado_em) {
      const now = new Date().toISOString();
      await supabase
        .from("contratos")
        .update({ visualizado_em: now, status: c.status === "assinado" ? c.status : "visualizado" })
        .eq("id", c.id);
      setContratos((arr) =>
        arr.map((x) => (x.id === c.id ? { ...x, visualizado_em: now } : x)),
      );
    }
  };

  const baixar = async (path: string) => {
    const { data } = await supabase.storage
      .from("documentos_clientes")
      .createSignedUrl(path, 60);
    if (data) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  if (loading)
    return (
      <div className="flex justify-center py-14">
        <Loader2 className="h-5 w-5 animate-spin text-emerald" />
      </div>
    );

  const pendentes = contratos.filter((c) => c.status !== "assinado");

  return (
    <div>
      <div className="border-b border-border pb-5">
        <p className="eyebrow">Central</p>
        <h2 className="display-title mt-3 text-base text-navy-deep md:text-xl">
          Documentos e contratos
        </h2>
      </div>

      {pendentes.length > 0 && (
        <div className="mt-6 flex items-center gap-3 border border-amber-300/40 px-5 py-4">
          <BellRing className="h-4 w-4 shrink-0 text-amber-300" strokeWidth={1.4} />
          <p className="text-sm text-navy-deep">
            {pendentes.length}{" "}
            {pendentes.length === 1
              ? "documento aguarda sua assinatura"
              : "documentos aguardam sua assinatura"}
            .
          </p>
        </div>
      )}

      <div className="mt-10">
        <h3 className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Contratos e aceites
        </h3>
        {contratos.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">
            Nenhum documento emitido até o momento.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {contratos.map((c) => {
              const st = contratoStatusInfo(c);
              const isOpen = openId === c.id;
              return (
                <li key={c.id} className="py-5">
                  <button
                    type="button"
                    onClick={() => void abrir(c)}
                    className="flex w-full items-start justify-between gap-6 text-left"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm text-navy-deep">
                        <FileSignature className="h-4 w-4 text-emerald" strokeWidth={1.4} />
                        {c.titulo}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {contratoTipoLabel(c.tipo)} • enviado em{" "}
                        {formatDate(c.enviado_em ?? c.created_at)}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${st.className}`}
                    >
                      {st.label}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-5">
                      <ContratoCliente contrato={c} onChange={load} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-12">
        <h3 className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Entregas e arquivos recebidos
        </h3>
        {docs.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">
            Nenhuma entrega disponível.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 py-4">
                <span className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-graphite" strokeWidth={1.4} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-navy-deep">
                      {d.nome_arquivo}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(d.created_at)}
                    </span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => baixar(d.storage_path)}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald hover:underline"
                >
                  <Download className="h-3 w-3" /> Baixar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
