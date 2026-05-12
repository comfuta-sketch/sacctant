import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Tutorial = {
  id: string; titulo: string; descricao: string | null;
  conteudo: string | null; categoria: string | null;
  ordem: number; publicado: boolean;
};

const blank: Omit<Tutorial, "id"> = {
  titulo: "", descricao: "", conteudo: "", categoria: "", ordem: 0, publicado: false,
};

export function AdminTutoriais() {
  const [items, setItems] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Omit<Tutorial, "id">>(blank);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("tutoriais")
      .select("*").order("ordem", { ascending: true });
    setItems((data ?? []) as Tutorial[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const create = async () => {
    if (!draft.titulo.trim()) { setError("Título obrigatório."); return; }
    setError(null);
    const { error } = await supabase.from("tutoriais").insert(draft);
    if (error) setError(error.message);
    else { setDraft(blank); await load(); }
  };

  const updateField = async (id: string, patch: Partial<Tutorial>) => {
    setSavingId(id);
    setItems((arr) => arr.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    await supabase.from("tutoriais").update(patch).eq("id", id);
    setSavingId(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este tutorial?")) return;
    await supabase.from("tutoriais").delete().eq("id", id);
    await load();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-navy" /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-background p-5">
        <h3 className="text-sm font-semibold text-navy-deep">Novo tutorial</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input placeholder="Título" value={draft.titulo}
            onChange={(e) => setDraft({ ...draft, titulo: e.target.value })} className={inp} />
          <input placeholder="Categoria" value={draft.categoria ?? ""}
            onChange={(e) => setDraft({ ...draft, categoria: e.target.value })} className={inp} />
        </div>
        <input placeholder="Descrição curta" value={draft.descricao ?? ""}
          onChange={(e) => setDraft({ ...draft, descricao: e.target.value })} className={`${inp} mt-3`} />
        <textarea placeholder="Conteúdo (markdown ou texto livre)" rows={4}
          value={draft.conteudo ?? ""}
          onChange={(e) => setDraft({ ...draft, conteudo: e.target.value })} className={`${inp} mt-3 resize-none`} />
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        <button onClick={create}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-navy-deep">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhum tutorial cadastrado.</p>}
        {items.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <input value={t.titulo} onChange={(e) => updateField(t.id, { titulo: e.target.value })}
                className={`${inp} font-semibold`} />
              <div className="flex items-center gap-2">
                <button onClick={() => updateField(t.id, { publicado: !t.publicado })}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${
                    t.publicado ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border bg-background text-muted-foreground"
                  }`}>
                  {t.publicado ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {t.publicado ? "Publicado" : "Rascunho"}
                </button>
                {savingId === t.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-navy" />}
                <button onClick={() => remove(t.id)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input value={t.categoria ?? ""} placeholder="Categoria"
                onChange={(e) => updateField(t.id, { categoria: e.target.value })} className={inp} />
              <input type="number" value={t.ordem} placeholder="Ordem"
                onChange={(e) => updateField(t.id, { ordem: parseInt(e.target.value) || 0 })} className={inp} />
            </div>
            <input value={t.descricao ?? ""} placeholder="Descrição"
              onChange={(e) => updateField(t.id, { descricao: e.target.value })} className={`${inp} mt-2`} />
            <textarea value={t.conteudo ?? ""} placeholder="Conteúdo" rows={3}
              onChange={(e) => updateField(t.id, { conteudo: e.target.value })}
              className={`${inp} mt-2 resize-none`} />
          </div>
        ))}
      </div>
    </div>
  );
}

const inp =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-navy-deep focus:border-navy focus:outline-none";
