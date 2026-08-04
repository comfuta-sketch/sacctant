import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calculator, LogOut, Loader2, Clock, AlertCircle, CheckCircle2,
  X, Download, Upload, FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsentimentoLGPDGate } from "@/components/ConsentimentoLGPDGate";
import { AdminTutoriais } from "@/components/AdminTutoriais";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — MF Advisory" }] }),
});

type Status = "aguardando_documentos" | "em_analise" | "concluido";
type Cliente = {
  id: string; user_id: string; nome: string; cpf: string; email: string;
  telefone: string; status: Status; created_at: string;
  data_nascimento: string | null; ocupacao: string | null;
  logradouro: string | null; numero: string | null; bairro: string | null; cep: string | null;
  banco: string | null; agencia: string | null; conta_ou_pix: string | null;
  observacoes: string | null; aceita_contrato: boolean;
  dados_completos: Record<string, unknown>;
};
type Documento = {
  id: string; cliente_id: string; nome_arquivo: string;
  storage_path: string; tipo: "enviado" | "retorno"; created_at: string;
};

const COLUMNS: { id: Status; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: "aguardando_documentos", label: "Aguardando", icon: Clock, color: "border-amber-300" },
  { id: "em_analise", label: "Em Análise", icon: AlertCircle, color: "border-blue-300" },
  { id: "concluido", label: "Concluído", icon: CheckCircle2, color: "border-green-300" },
];

function AdminPage() {
  const navigate = useNavigate();
  const { loading: authLoading, user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/auth", search: { redirect: "/admin" } }); return; }
    if (!isAdmin) { navigate({ to: "/cliente" }); return; }
  }, [authLoading, user, isAdmin, navigate]);

  if (authLoading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-soft-gray/40"><Loader2 className="h-6 w-6 animate-spin text-navy" /></div>;
  }

  return (
    <ConsentimentoLGPDGate>
      <div className="min-h-screen bg-soft-gray/40">
        <header className="border-b border-border/60 bg-background">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-navy flex items-center justify-center">
                <Calculator className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold tracking-tight text-navy-deep">
                MF <span className="text-emerald">Advisory</span> <span className="text-xs font-normal text-muted-foreground">/ Admin</span>
              </span>
            </Link>
            <button onClick={async () => { await signOut(); navigate({ to: "/" }); }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-graphite hover:border-navy hover:text-navy">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-navy-deep">Painel Administrativo</h1>

          <Tabs defaultValue="kanban" className="mt-6">
            <TabsList>
              <TabsTrigger value="kanban">Kanban de Demandas</TabsTrigger>
              <TabsTrigger value="tutoriais">Tutoriais</TabsTrigger>
            </TabsList>
            <TabsContent value="kanban" className="mt-4"><KanbanView /></TabsContent>
            <TabsContent value="tutoriais" className="mt-4"><AdminTutoriais /></TabsContent>
          </Tabs>
        </main>
      </div>
    </ConsentimentoLGPDGate>
  );
}

function KanbanView() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: c }, { data: d }] = await Promise.all([
      supabase.from("clientes").select("*").order("created_at", { ascending: false }),
      supabase.from("documentos").select("*").order("created_at", { ascending: false }),
    ]);
    setClientes((c ?? []) as Cliente[]);
    setDocumentos((d ?? []) as Documento[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const moveTo = async (id: string, status: Status) => {
    setClientes((arr) => arr.map((c) => (c.id === id ? { ...c, status } : c)));
    await supabase.from("clientes").update({ status }).eq("id", id);
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-navy" /></div>;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          const items = clientes.filter((c) => c.status === col.id);
          return (
            <div key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragId) { void moveTo(dragId, col.id); setDragId(null); } }}
              className={`rounded-xl border-2 ${col.color} bg-background/60 p-3 min-h-[400px]`}>
              <div className="flex items-center justify-between px-1 pb-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-deep">
                  <Icon className="h-4 w-4" /> {col.label}
                </h3>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((c) => (
                  <div key={c.id}
                    draggable onDragStart={() => setDragId(c.id)} onDragEnd={() => setDragId(null)}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer rounded-lg border border-border bg-background p-3 hover:border-navy/40 hover:shadow-sm transition-all">
                    <p className="text-sm font-semibold text-navy-deep truncate">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">CPF {c.cpf}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))}
                {items.length === 0 && <p className="px-1 py-4 text-xs text-muted-foreground">Vazio</p>}
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <ClienteDrawer
              cliente={selected}
              documentos={documentos.filter((d) => d.cliente_id === selected.id)}
              onUpdated={async () => { await load(); }}
              onMove={(s) => moveTo(selected.id, s)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ClienteDrawer({ cliente, documentos, onUpdated, onMove }: {
  cliente: Cliente; documentos: Documento[];
  onUpdated: () => Promise<void>; onMove: (s: Status) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const download = async (path: string, nome: string) => {
    const { data } = await supabase.storage.from("documentos_clientes").createSignedUrl(path, 60);
    if (!data) return;
    const a = document.createElement("a");
    a.href = data.signedUrl; a.download = nome; a.target = "_blank";
    document.body.appendChild(a); a.click(); a.remove();
  };

  const enviarRetorno = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const safe = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${cliente.user_id}/${cliente.id}/retorno_${Date.now()}_${safe}`;
        const { error: upErr } = await supabase.storage.from("documentos_clientes")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        await supabase.from("documentos").insert({
          cliente_id: cliente.id, user_id: cliente.user_id, nome_arquivo: file.name,
          storage_path: path, mime_type: file.type, tamanho_bytes: file.size,
          tipo: "retorno", uploaded_by: user.id,
        });
      }
      await onUpdated();
    } catch (err) { alert(err instanceof Error ? err.message : "Falha"); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <SheetHeader>
        <SheetTitle className="text-navy-deep">{cliente.nome}</SheetTitle>
      </SheetHeader>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {COLUMNS.map((col) => (
          <button key={col.id} onClick={() => onMove(col.id)}
            disabled={cliente.status === col.id}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              cliente.status === col.id
                ? "bg-navy text-primary-foreground cursor-default"
                : "border border-border bg-background text-graphite hover:border-navy hover:text-navy"
            }`}>
            {col.label}
          </button>
        ))}
      </div>

      <Section title="Dados pessoais">
        <Row k="CPF" v={cliente.cpf} />
        <Row k="Nascimento" v={cliente.data_nascimento ?? "—"} />
        <Row k="Ocupação" v={cliente.ocupacao ?? "—"} />
        <Row k="E-mail" v={cliente.email} />
        <Row k="Telefone" v={cliente.telefone} />
      </Section>
      <Section title="Endereço">
        <Row k="Logradouro" v={`${cliente.logradouro ?? "—"}, ${cliente.numero ?? ""}`} />
        <Row k="Bairro" v={cliente.bairro ?? "—"} />
        <Row k="CEP" v={cliente.cep ?? "—"} />
      </Section>
      <Section title="Bancário">
        <Row k="Banco" v={cliente.banco ?? "—"} />
        <Row k="Agência" v={cliente.agencia ?? "—"} />
        <Row k="Conta/PIX" v={cliente.conta_ou_pix ?? "—"} />
      </Section>
      {cliente.observacoes && (
        <Section title="Observações">
          <p className="text-sm text-navy-deep whitespace-pre-wrap">{cliente.observacoes}</p>
        </Section>
      )}
      <Section title="Aceitou contrato">
        <p className="text-sm text-navy-deep">{cliente.aceita_contrato ? "Sim" : "Não"}</p>
      </Section>
      <Section title="Dados completos (wizard)">
        <pre className="text-[11px] bg-soft-gray/40 rounded p-2 overflow-x-auto text-navy-deep">
          {JSON.stringify(cliente.dados_completos, null, 2)}
        </pre>
      </Section>

      <Section title="Documentos">
        <ul className="divide-y divide-border rounded-lg border border-border">
          {documentos.length === 0 && <li className="px-3 py-3 text-sm text-muted-foreground">Sem documentos.</li>}
          {documentos.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 text-graphite shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-navy-deep">{d.nome_arquivo}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{d.tipo}</p>
                </div>
              </div>
              <button onClick={() => download(d.storage_path, d.nome_arquivo)}
                className="inline-flex items-center gap-1 text-xs text-navy hover:underline">
                <Download className="h-3 w-3" /> Baixar
              </button>
            </li>
          ))}
        </ul>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md bg-navy px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-navy-deep">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Enviar arquivo de retorno
          <input type="file" multiple className="sr-only" disabled={uploading}
            onChange={(e) => enviarRetorno(e.target.files)} />
        </label>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-navy">{title}</h4>
      <div className="mt-2 rounded-lg border border-border bg-soft-gray/30 p-3 space-y-1">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string | null }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-navy-deep text-right truncate max-w-[60%]">{v ?? "—"}</span>
    </div>
  );
}
