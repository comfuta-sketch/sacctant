import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Send,
  Paperclip,
  Download,
  CheckCircle2,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  SOLICITACAO_CATEGORIAS,
  SOLICITACAO_STATUS,
  formatDate,
  formatDateTime,
  type Solicitacao,
  type SolicitacaoMensagem,
  type SolicitacaoStatus,
} from "@/lib/portal-data";

const inputCls =
  "w-full border border-border bg-background px-3.5 py-2.5 text-sm text-navy-deep outline-none focus:border-emerald";

export function SolicitacoesTab() {
  const { user } = useAuth();
  const [items, setItems] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [assunto, setAssunto] = useState("");
  const [categoria, setCategoria] = useState(SOLICITACAO_CATEGORIAS[0]);
  const [descricao, setDescricao] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("solicitacoes")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as Solicitacao[]);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const criar = async () => {
    if (!user) return;
    if (assunto.trim().length < 3) {
      setError("Descreva o assunto da solicitação.");
      return;
    }
    setSaving(true);
    setError(null);
    const { data: cliente } = await supabase
      .from("clientes")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    const { error: insErr } = await supabase.from("solicitacoes").insert({
      user_id: user.id,
      cliente_id: cliente?.id ?? null,
      assunto: assunto.trim(),
      categoria,
      descricao: descricao.trim(),
      status: "aberta",
    });
    setSaving(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setAssunto("");
    setDescricao("");
    setCreating(false);
    await load();
  };

  const grupos: { key: SolicitacaoStatus; title: string }[] = [
    { key: "aberta", title: "Abertas" },
    { key: "em_andamento", title: "Em andamento" },
    { key: "concluida", title: "Concluídas" },
  ];

  if (loading)
    return (
      <div className="flex justify-center py-14">
        <Loader2 className="h-5 w-5 animate-spin text-emerald" />
      </div>
    );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="eyebrow">Demandas</p>
          <h2 className="display-title mt-3 text-base text-navy-deep md:text-xl">
            Dashboard de solicitações
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="btn-solid"
        >
          {creating ? (
            <>
              <X className="h-4 w-4" strokeWidth={1.4} /> Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" strokeWidth={1.4} /> Nova solicitação
            </>
          )}
        </button>
      </div>

      {creating && (
        <div className="mt-6 border border-border p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs text-muted-foreground">
                Assunto
              </span>
              <input
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                className={inputCls}
                placeholder="Ex.: Alteração de quadro societário"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-muted-foreground">
                Frente de atuação
              </span>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className={inputCls}
              >
                {SOLICITACAO_CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs text-muted-foreground">
              Detalhes
            </span>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </label>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <button
            type="button"
            onClick={criar}
            disabled={saving}
            className="btn-solid mt-5 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" strokeWidth={1.4} />
            )}
            Enviar solicitação
          </button>
        </div>
      )}

      <div className="mt-10 space-y-12">
        {grupos.map((g) => {
          const list = items.filter((i) => i.status === g.key);
          return (
            <div key={g.key}>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {g.title}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {list.length}
                </span>
              </div>
              {list.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  Nenhuma demanda nesta etapa.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {list.map((s) => {
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
                              {s.categoria} • aberta em {formatDate(s.created_at)}
                            </span>
                          </span>
                          <span
                            className={`shrink-0 border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${st.className}`}
                          >
                            {st.label}
                          </span>
                        </button>
                        {isOpen && <Thread solicitacao={s} />}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Thread({ solicitacao }: { solicitacao: Solicitacao }) {
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
        const path = `${user.id}/solicitacoes/${solicitacao.id}/${Date.now()}_${safe}`;
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
        autor_tipo: "cliente",
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
    <div className="mt-5 border border-border p-5">
      {solicitacao.descricao && (
        <p className="font-serif text-[15px] leading-[1.9] text-graphite">
          {solicitacao.descricao}
        </p>
      )}

      <ul className="mt-5 space-y-4">
        {msgs.length === 0 && (
          <li className="text-xs text-muted-foreground">
            Nenhuma interação ainda.
          </li>
        )}
        {msgs.map((m) => (
          <li
            key={m.id}
            className={`border-l-2 pl-4 ${m.autor_tipo === "admin" ? "border-emerald" : "border-border"}`}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {m.autor_tipo === "admin" ? "MF Advisory" : "Você"} •{" "}
              {formatDateTime(m.created_at)}
            </p>
            {m.mensagem && (
              <p className="mt-1.5 text-sm text-navy-deep whitespace-pre-wrap">
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

      {solicitacao.status === "concluida" ? (
        <p className="mt-5 inline-flex items-center gap-2 text-xs text-emerald">
          <CheckCircle2 className="h-3.5 w-3.5" /> Concluída em{" "}
          {formatDate(solicitacao.concluida_em)}
        </p>
      ) : (
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={2}
            placeholder="Escreva uma mensagem…"
            className={`${inputCls} flex-1 resize-none`}
          />
          <label className="inline-flex cursor-pointer items-center gap-2 border border-border px-3 py-2.5 text-xs text-graphite hover:border-emerald">
            <Paperclip className="h-3.5 w-3.5" /> Anexar
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
            Enviar
          </button>
        </div>
      )}
    </div>
  );
}
