import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calculator, LogOut, FileText, Download, Upload, CheckCircle2, Clock,
  AlertCircle, Loader2, MessageCircle, BookOpen, FileSignature, Tag,
  LayoutList, CalendarClock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { WHATSAPP_URL } from "@/lib/auth-helpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LgpdNotice } from "@/components/LgpdNotice";
import { ConsentimentoLGPDGate } from "@/components/ConsentimentoLGPDGate";
import { SolicitacoesTab } from "@/components/portal/SolicitacoesTab";
import { DocumentosContratosTab } from "@/components/portal/DocumentosContratosTab";
import { AgendamentoTab } from "@/components/portal/AgendamentoTab";

export const Route = createFileRoute("/cliente")({
  component: ClientePage,
  head: () => ({ meta: [{ title: "Área do Cliente — MF Advisory" }] }),
});

type Cliente = {
  id: string; nome: string; cpf: string;
  status: "aguardando_documentos" | "em_analise" | "concluido";
  created_at: string;
};
type Documento = {
  id: string; cliente_id: string; nome_arquivo: string; storage_path: string;
  tipo: "enviado" | "retorno"; created_at: string;
};
type Tutorial = {
  id: string; titulo: string; descricao: string | null;
  conteudo: string | null; categoria: string | null;
};
const STATUS_LABEL = {
  aguardando_documentos: { label: "Aguardando Documentos", icon: Clock, color: "text-amber-700 bg-amber-50" },
  em_analise: { label: "Em Análise", icon: AlertCircle, color: "text-blue-700 bg-blue-50" },
  concluido: { label: "Concluído", icon: CheckCircle2, color: "text-green-700 bg-green-50" },
} as const;

function ClientePage() {
  const navigate = useNavigate();
  const { loading: authLoading, user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/auth", search: { redirect: "/cliente" } }); return; }
    if (isAdmin) { navigate({ to: "/admin" }); return; }
  }, [authLoading, user, isAdmin, navigate]);

  if (authLoading || !user || isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gray/40">
        <Loader2 className="h-6 w-6 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <ConsentimentoLGPDGate>
      <div className="min-h-screen bg-soft-gray/40">
        <header className="border-b border-border/60 bg-background">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-navy flex items-center justify-center">
                <Calculator className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold tracking-tight text-navy-deep">
                MF <span className="text-emerald">Advisory</span>
              </span>
            </Link>
            <button type="button" onClick={async () => { await signOut(); navigate({ to: "/" }); }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-graphite hover:border-navy hover:text-navy transition-colors">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-navy-deep">Portal do Cliente</h1>
          <p className="mt-1 text-sm text-graphite">
            Acompanhe seus atendimentos, documentos, materiais de apoio e contratos com a MF Advisory.
          </p>

          <Tabs defaultValue="demandas" className="mt-8">
            <TabsList className="grid w-full max-w-3xl grid-cols-2 sm:grid-cols-5">
              <TabsTrigger value="demandas"><LayoutList className="h-4 w-4 mr-1.5" />Demandas</TabsTrigger>
              <TabsTrigger value="contratos"><FileSignature className="h-4 w-4 mr-1.5" />Documentos</TabsTrigger>
              <TabsTrigger value="agenda"><CalendarClock className="h-4 w-4 mr-1.5" />Agenda</TabsTrigger>
              <TabsTrigger value="declaracoes"><FileText className="h-4 w-4 mr-1.5" />Atendimentos</TabsTrigger>
              <TabsTrigger value="tutoriais"><BookOpen className="h-4 w-4 mr-1.5" />Conhecimento</TabsTrigger>
            </TabsList>

            <TabsContent value="demandas" className="mt-6"><SolicitacoesTab /></TabsContent>
            <TabsContent value="contratos" className="mt-6"><DocumentosContratosTab /></TabsContent>
            <TabsContent value="agenda" className="mt-6"><AgendamentoTab /></TabsContent>
            <TabsContent value="declaracoes" className="mt-6"><DeclaracoesTab /></TabsContent>
            <TabsContent value="tutoriais" className="mt-6"><TutoriaisTab /></TabsContent>
          </Tabs>


          <div className="mt-10"><LgpdNotice /></div>
        </main>

        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
          aria-label="WhatsApp">
          <MessageCircle className="h-7 w-7" />
        </a>
      </div>
    </ConsentimentoLGPDGate>
  );
}

function DeclaracoesTab() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: c }, { data: d }] = await Promise.all([
      supabase.from("clientes").select("id,nome,cpf,status,created_at").order("created_at", { ascending: false }),
      supabase.from("documentos").select("id,cliente_id,nome_arquivo,storage_path,tipo,created_at").order("created_at", { ascending: false }),
    ]);
    setClientes((c ?? []) as Cliente[]);
    setDocumentos((d ?? []) as Documento[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const handleDownload = async (path: string, nome: string) => {
    const { data, error } = await supabase.storage.from("documentos_clientes").createSignedUrl(path, 60);
    if (error || !data) { alert("Falha ao gerar link."); return; }
    const a = document.createElement("a");
    a.href = data.signedUrl; a.download = nome; a.target = "_blank"; a.rel = "noopener noreferrer";
    document.body.appendChild(a); a.click(); a.remove();
  };

  const handleUpload = async (clienteId: string, files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    setUploading(clienteId);
    try {
      for (const file of Array.from(files)) {
        const safe = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${user.id}/${clienteId}/${Date.now()}_${safe}`;
        const { error: upErr } = await supabase.storage.from("documentos_clientes")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        await supabase.from("documentos").insert({
          cliente_id: clienteId, user_id: user.id, nome_arquivo: file.name,
          storage_path: path, mime_type: file.type, tamanho_bytes: file.size,
          tipo: "enviado", uploaded_by: user.id,
        });
      }
      await load();
    } catch (err) { alert(err instanceof Error ? err.message : "Falha"); }
    finally { setUploading(null); }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-navy" /></div>;

  if (clientes.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background p-10 text-center">
        <FileText className="mx-auto h-10 w-10 text-graphite/60" />
        <h2 className="mt-4 text-lg font-semibold text-navy-deep">Nenhuma declaração ainda</h2>
        <p className="mt-2 text-sm text-graphite">Volte ao site e clique em "Iniciar Declaração".</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-navy-deep transition-colors">
          Ir para o site
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {clientes.map((c) => {
        const docs = documentos.filter((d) => d.cliente_id === c.id);
        const enviados = docs.filter((d) => d.tipo === "enviado");
        const retornos = docs.filter((d) => d.tipo === "retorno");
        const status = STATUS_LABEL[c.status];
        const Icon = status.icon;
        return (
          <div key={c.id} className="rounded-xl border border-border bg-background p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-navy-deep">{c.nome}</h2>
                <p className="text-xs text-muted-foreground">Iniciada em {new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                <Icon className="h-3.5 w-3.5" /> {status.label}
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-navy">Arquivos de retorno</h3>
              {retornos.length === 0 ? (
                <p className="mt-2 text-sm text-graphite">Ainda não há arquivos de retorno.</p>
              ) : (
                <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                  {retornos.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy-deep">{d.nome_arquivo}</p>
                        <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <button onClick={() => handleDownload(d.storage_path, d.nome_arquivo)}
                        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-navy hover:border-navy">
                        <Download className="h-3.5 w-3.5" /> Baixar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-navy">Documentos enviados ({enviados.length})</h3>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-navy px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-navy-deep">
                  {uploading === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Anexar
                  <input type="file" multiple className="sr-only" disabled={uploading === c.id}
                    onChange={(e) => handleUpload(c.id, e.target.files)} />
                </label>
              </div>
              {enviados.length === 0 ? (
                <p className="mt-2 text-sm text-graphite">Nenhum arquivo enviado.</p>
              ) : (
                <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                  {enviados.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-graphite" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-navy-deep">{d.nome_arquivo}</p>
                          <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDownload(d.storage_path, d.nome_arquivo)}
                        className="text-xs text-navy hover:underline">Baixar</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TutoriaisTab() {
  const [tutoriais, setTutoriais] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("tutoriais")
        .select("id,titulo,descricao,conteudo,categoria")
        .eq("publicado", true)
        .order("ordem", { ascending: true });
      setTutoriais((data ?? []) as Tutorial[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-navy" /></div>;

  if (tutoriais.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background p-10 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-graphite/60" />
        <h2 className="mt-4 text-lg font-semibold text-navy-deep">Tutoriais em breve</h2>
        <p className="mt-2 text-sm text-graphite">
          Em breve você encontrará aqui passo a passo como "Outorgar procuração e-CAC", "Acessar restituição" e mais.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tutoriais.map((t) => (
        <button key={t.id} onClick={() => setOpenId(openId === t.id ? null : t.id)}
          className="text-left rounded-xl border border-border bg-background p-5 hover:border-navy/40 hover:shadow-sm transition-all">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-navy-deep">{t.titulo}</h3>
            {t.categoria && (
              <span className="inline-flex items-center gap-1 rounded-full bg-navy/8 px-2 py-0.5 text-[10px] font-medium text-navy">
                <Tag className="h-2.5 w-2.5" /> {t.categoria}
              </span>
            )}
          </div>
          {t.descricao && <p className="mt-2 text-sm text-graphite">{t.descricao}</p>}
          {openId === t.id && t.conteudo && (
            <div className="mt-4 whitespace-pre-wrap rounded-md bg-soft-gray/40 p-3 text-sm text-navy-deep">
              {t.conteudo}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
