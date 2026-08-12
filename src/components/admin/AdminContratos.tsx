import { useEffect, useState } from "react";
import { Loader2, Upload, BellRing, Download, FileSignature } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  CONTRATO_TIPOS,
  contratoStatusInfo,
  contratoTipoLabel,
  formatDate,
  formatDateTime,
  type ContratoRow,
} from "@/lib/portal-data";

const inputCls =
  "w-full border border-border bg-background px-3.5 py-2.5 text-sm text-navy-deep outline-none focus:border-emerald";

type ClienteLite = { id: string; user_id: string; nome: string; cpf: string };

/** Gestor de Contratos e Entregas — upload de PDF + alerta de assinatura. */
export function AdminContratos() {
  const [clientes, setClientes] = useState<ClienteLite[]>([]);
  const [contratos, setContratos] = useState<ContratoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteId, setClienteId] = useState("");
  const [tipo, setTipo] = useState(CONTRATO_TIPOS[0].id);
  const [titulo, setTitulo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [{ data: c }, { data: k }] = await Promise.all([
      supabase.from("clientes").select("id,user_id,nome,cpf").order("nome"),
      supabase.from("contratos").select("*").order("created_at", { ascending: false }),
    ]);
    setClientes((c ?? []) as ClienteLite[]);
    setContratos((k ?? []) as ContratoRow[]);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const enviar = async () => {
    setError(null);
    setMsg(null);
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) return setError("Selecione o cliente.");
    if (titulo.trim().length < 3) return setError("Informe o título do documento.");
    setBusy(true);
    try {
      let storagePath: string | null = null;
      if (file) {
        const safe = file.name.replace(/[^\w.\-]+/g, "_");
        storagePath = `${cliente.user_id}/${cliente.id}/contratos/${Date.now()}_${safe}`;
        const { error: upErr } = await supabase.storage
          .from("documentos_clientes")
          .upload(storagePath, file, { contentType: file.type });
        if (upErr) throw upErr;
      }
      const { error: insErr } = await supabase.from("contratos").insert({
        cliente_id: cliente.id,
        user_id: cliente.user_id,
        titulo: titulo.trim(),
        tipo,
        status: "pendente",
        modelo_storage_path: storagePath,
        enviado_em: new Date().toISOString(),
      });
      if (insErr) throw insErr;
      setTitulo("");
      setFile(null);
      setMsg("Documento enviado. O cliente verá o alerta de assinatura pendente.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar documento.");
    } finally {
      setBusy(false);
    }
  };

  const baixar = async (path: string) => {
    const { data } = await supabase.storage
      .from("documentos_clientes")
      .createSignedUrl(path, 60);
    if (data) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const nome = (c: ContratoRow) =>
    clientes.find((x) => x.id === c.cliente_id)?.nome ?? "Cliente";

  if (loading)
    return (
      <div className="flex justify-center py-14">
        <Loader2 className="h-5 w-5 animate-spin text-emerald" />
      </div>
    );

  return (
    <div>
      <div className="rounded-none border border-border p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-deep">
          <BellRing className="h-4 w-4 text-emerald" strokeWidth={1.4} /> Enviar
          documento para revisão e assinatura
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted-foreground">Cliente</span>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className={inputCls}
            >
              <option value="">Selecione…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — {c.cpf}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted-foreground">Tipo</span>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={inputCls}
            >
              {CONTRATO_TIPOS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted-foreground">Título</span>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={inputCls}
              placeholder="Ex.: Contrato de prestação 2026"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 border border-border px-3 py-2.5 text-xs text-graphite hover:border-emerald">
            <Upload className="h-3.5 w-3.5" /> {file ? file.name : "Anexar PDF"}
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            onClick={enviar}
            disabled={busy}
            className="btn-solid disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BellRing className="h-4 w-4" strokeWidth={1.4} />
            )}
            Disparar alerta de assinatura
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {msg && <p className="mt-3 text-sm text-emerald">{msg}</p>}
      </div>

      <h3 className="mt-10 font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        Documentos emitidos
      </h3>
      {contratos.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">Nenhum documento emitido.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {contratos.map((c) => {
            const st = contratoStatusInfo(c);
            return (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm text-navy-deep">
                    <FileSignature className="h-4 w-4 text-emerald" strokeWidth={1.4} />
                    {c.titulo}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {nome(c)} • {contratoTipoLabel(c.tipo)} • enviado{" "}
                    {formatDate(c.enviado_em ?? c.created_at)}
                    {c.visualizado_em
                      ? ` • visto ${formatDateTime(c.visualizado_em)}`
                      : ""}
                    {c.assinado_em ? ` • assinado ${formatDate(c.assinado_em)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {c.modelo_storage_path && (
                    <button
                      type="button"
                      onClick={() => baixar(c.modelo_storage_path!)}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald hover:underline"
                    >
                      <Download className="h-3 w-3" /> PDF
                    </button>
                  )}
                  <span
                    className={`border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${st.className}`}
                  >
                    {st.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
