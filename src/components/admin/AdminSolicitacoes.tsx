import { useEffect, useState } from "react";
import {
  Loader2,
  Send,
  Paperclip,
  Download,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  SOLICITACAO_STATUS,
  formatDate,
  formatDateTime,
  type Solicitacao,
  type SolicitacaoMensagem,
  type SolicitacaoStatus,
} from "@/lib/portal-data";

const inputCls =
  "w-full border border-border bg-background px-3.5 py-2.5 text-sm text-navy-deep outline-none focus:border-emerald";

type ClienteLite = { id: string; user_id: string; nome: string; email: string };

/** Central de Resolução — demandas abertas pelos clientes. */
export function AdminSolicitacoes() {
  const [items, setItems] = useState<Solicitacao[]>([]);
  const [clientes, setClientes] = useState<ClienteLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<SolicitacaoStatus | "todas">("aberta");

  const load = async () => {
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.from("solicitacoes").select("*").order("created_at", { ascending: false }),
      supabase.from("clientes").select("id,user_id,nome,email"),
    ]);
    setItems((s ?? []) as Solicitacao[]);
    setClientes((c ?? []) as ClienteLite[]);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const setStatus = async (s: Solicitacao, status: SolicitacaoStatus) => {
    await supabase
      .from("solicitacoes")
      .update({
        status,
        concluida_em: status === "concluida" ? new Date().toISOString() : null,
      })
      .eq("id", s.id);
    await load();
  };

  const nomeCliente = (s: Solicitacao) =>
    clientes.find((c) => c.user_id === s.user_id)?.nome ?? "Cliente";

  if (loading)
    return (
      <div className="flex justify-center py-14">
        <Loader2 className="h-5 w-5 animate-spin text-emerald" />
      </div>
    );

  const visiveis =
    filtro === "todas" ? items : items.filter((i) => i.status === filtro);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {(["aberta", "em_andamento", "concluida", "todas"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors ${
              filtro === f
                ? "border-emerald text-emerald"
                : "border-border text-muted-foreground hover:border-emerald/50"
            }`}
          >
            {f === "todas"
              ? "Todas"
              : SOLICITACAO_STATUS[f].label}{" "}
            (
            {f === "todas"
              ? items.length
              : items.filter((i) => i.status === f).length}
            )
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Inbox className="h-7 w-7 text-muted-foreground" strokeWidth={1.15} />
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhuma demanda nesta visão.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {visiveis.map((s) => {
            const st =
              SOLICITACAO_STATUS[s.status as SolicitacaoStatus] ??
              SOLICITACAO_STATUS.aberta;
            const isOpen = openId === s.id;
            return (
              <li key={s.id} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : s.id)}
                  className="flex w-full items-start justify-between gap-6 text-left"
                >
                  <span className="min-w-0">
                    <span className="block text-sm text-navy-deep">
                      {s.assunto}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {nomeCliente(s)} • {s.categoria} • {formatDate(s.created_at)}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${st.className}`}
                  >
                    {st.label}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-5 border border-border p-5">
                    {s.descricao && (
                      <p className="font-serif text-[15px] leading-[1.9] text-graphite">
                        {s.descricao}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(["aberta", "em_andamento", "concluida"] as const).map((st2) => (
                        <button
                          key={st2}
                          type="button"
                          onClick={() => void setStatus(s, st2)}
                          disabled={s.status === st2}
                          className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors ${
                            s.status === st2
                              ? "border-emerald text-emerald"
                              : "border-border text-muted-foreground hover:border-emerald/50"
                          }`}
                        >
                          {SOLICITACAO_STATUS[st2].label}
                        </button>
                      ))}
                    </div>
                    <AdminThread solicitacao={s} clienteUserId={s.user_id} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AdminThread({
  solicitacao,
  clienteUserId,
}: {
  solicitacao: Solicitacao;
  clienteUserId: string;
}) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<SolicitacaoMensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("solicitacao_mensagens")
      .select("*")
      .eq("solicitacao_id", solicitacao.id)
      .order("created_at", { ascending: true });
    setMsgs((data ?? []) as SolicitacaoMensagem[]);
  };
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitacao.id]);

  const enviar = async (file?: File | null) => {
    if (!user) return;
    if (!texto.trim() && !file) return;
    setBusy(true);
    try {
      let nome_arquivo: string | null = null;
      let storage_path: string | null = null;
      if (file) {
        const safe = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${clienteUserId}/solicitacoes/${solicitacao.id}/entrega_${Date.now()}_${safe}`;
        const { error: upErr } = await supabase.storage
          .from("documentos_clientes")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        nome_arquivo = file.name;
        storage_path = path;
      }
      await supabase.from("solicitacao_mensagens").insert({
        solicitacao_id: solicitacao.id,
        autor_id: user.id,
        autor_tipo: "admin",
        mensagem: texto.trim(),
        nome_arquivo,
        storage_path,
      });
      setTexto("");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao enviar.");
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

  return (
    <div className="mt-6">
      <ul className="space-y-4">
        {msgs.length === 0 && (
          <li className="text-xs text-muted-foreground">Nenhuma interação ainda.</li>
        )}
        {msgs.map((m) => (
          <li
            key={m.id}
            className={`border-l-2 pl-4 ${m.autor_tipo === "admin" ? "border-emerald" : "border-border"}`}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {m.autor_tipo === "admin" ? "MF Advisory" : "Cliente"} •{" "}
              {formatDateTime(m.created_at)}
            </p>
            {m.mensagem && (
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-navy-deep">
                {m.mensagem}
              </p>
            )}
            {m.storage_path && (
              <button
                type="button"
                onClick={() => baixar(m.storage_path!)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald hover:underline"
              >
                <Download className="h-3 w-3" /> {m.nome_arquivo}
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={2}
          placeholder="Responder ao cliente…"
          className={`${inputCls} flex-1 resize-none`}
        />
        <label className="inline-flex cursor-pointer items-center gap-2 border border-border px-3 py-2.5 text-xs text-graphite hover:border-emerald">
          <Paperclip className="h-3.5 w-3.5" /> Anexar entrega
          <input
            type="file"
            className="sr-only"
            disabled={busy}
            onChange={(e) => enviar(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          type="button"
          onClick={() => enviar(null)}
          disabled={busy}
          className="btn-solid disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" strokeWidth={1.4} />
          )}
          Responder
        </button>
      </div>

      {solicitacao.status === "concluida" && (
        <p className="mt-4 inline-flex items-center gap-2 text-xs text-emerald">
          <CheckCircle2 className="h-3.5 w-3.5" /> Concluída em{" "}
          {formatDate(solicitacao.concluida_em)}
        </p>
      )}
    </div>
  );
}
