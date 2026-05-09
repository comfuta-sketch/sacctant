import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calculator,
  LogOut,
  FileText,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { WHATSAPP_URL } from "@/lib/auth-helpers";

export const Route = createFileRoute("/cliente")({
  component: ClientePage,
  head: () => ({
    meta: [{ title: "Área do Cliente — S.ACCTANT" }],
  }),
});

type Cliente = {
  id: string;
  nome: string;
  cpf: string;
  status: "aguardando_documentos" | "em_analise" | "concluido";
  created_at: string;
};

type Documento = {
  id: string;
  cliente_id: string;
  nome_arquivo: string;
  storage_path: string;
  tipo: "enviado" | "retorno";
  created_at: string;
};

const STATUS_LABEL = {
  aguardando_documentos: { label: "Aguardando Documentos", icon: Clock, color: "text-amber-700 bg-amber-50" },
  em_analise: { label: "Em Análise", icon: AlertCircle, color: "text-blue-700 bg-blue-50" },
  concluido: { label: "Concluído", icon: CheckCircle2, color: "text-green-700 bg-green-50" },
} as const;

function ClientePage() {
  const navigate = useNavigate();
  const { loading: authLoading, user, isAdmin, signOut } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/cliente" } });
      return;
    }
    if (isAdmin) {
      navigate({ to: "/admin" });
      return;
    }
    void loadData();
  }, [authLoading, user, isAdmin, navigate]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: c }, { data: d }] = await Promise.all([
      supabase.from("clientes").select("id,nome,cpf,status,created_at").order("created_at", { ascending: false }),
      supabase.from("documentos").select("id,cliente_id,nome_arquivo,storage_path,tipo,created_at").order("created_at", { ascending: false }),
    ]);
    setClientes((c ?? []) as Cliente[]);
    setDocumentos((d ?? []) as Documento[]);
    setLoading(false);
  };

  const handleDownload = async (path: string, nome: string) => {
    const { data, error } = await supabase.storage
      .from("documentos_clientes")
      .createSignedUrl(path, 60);
    if (error || !data) {
      alert("Não foi possível gerar o link de download.");
      return;
    }
    // Force download
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = nome;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleUpload = async (clienteId: string, files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    setUploading(clienteId);
    try {
      for (const file of Array.from(files)) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${user.id}/${clienteId}/${Date.now()}_${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("documentos_clientes")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        const { error: insErr } = await supabase.from("documentos").insert({
          cliente_id: clienteId,
          user_id: user.id,
          nome_arquivo: file.name,
          storage_path: path,
          mime_type: file.type,
          tamanho_bytes: file.size,
          tipo: "enviado",
          uploaded_by: user.id,
        });
        if (insErr) throw insErr;
      }
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha no upload.";
      alert(msg);
    } finally {
      setUploading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gray/40">
        <Loader2 className="h-6 w-6 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-gray/40">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-navy flex items-center justify-center">
              <Calculator className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight text-navy-deep">
              S.<span className="text-graphite">ACCTANT</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-graphite hover:border-navy hover:text-navy transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-navy-deep">Minha Área</h1>
        <p className="mt-1 text-sm text-graphite">
          Acompanhe o andamento, envie documentos e baixe os arquivos de retorno.
        </p>

        {clientes.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-background p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-graphite/60" />
            <h2 className="mt-4 text-lg font-semibold text-navy-deep">
              Você ainda não iniciou uma declaração
            </h2>
            <p className="mt-2 text-sm text-graphite">
              Volte ao site e clique em "Iniciar Declaração" para enviar seus dados.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-navy-deep transition-colors"
            >
              Ir para o site
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {clientes.map((c) => {
              const docs = documentos.filter((d) => d.cliente_id === c.id);
              const enviados = docs.filter((d) => d.tipo === "enviado");
              const retornos = docs.filter((d) => d.tipo === "retorno");
              const status = STATUS_LABEL[c.status];
              const StatusIcon = status.icon;
              return (
                <div key={c.id} className="rounded-xl border border-border bg-background p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-navy-deep">{c.nome}</h2>
                      <p className="text-xs text-muted-foreground">
                        Iniciada em {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                  </div>

                  {/* Retornos (do contador) */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-navy">
                      Arquivos de retorno
                    </h3>
                    {retornos.length === 0 ? (
                      <p className="mt-2 text-sm text-graphite">
                        Ainda não há arquivos de retorno disponíveis.
                      </p>
                    ) : (
                      <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                        {retornos.map((d) => (
                          <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-navy-deep">{d.nome_arquivo}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(d.created_at).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownload(d.storage_path, d.nome_arquivo)}
                              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-navy hover:border-navy transition-colors"
                            >
                              <Download className="h-3.5 w-3.5" /> Baixar
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Enviados */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-navy">
                        Documentos enviados ({enviados.length})
                      </h3>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-navy px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-navy-deep transition-colors">
                        {uploading === c.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        Anexar
                        <input
                          type="file"
                          multiple
                          className="sr-only"
                          disabled={uploading === c.id}
                          onChange={(e) => handleUpload(c.id, e.target.files)}
                        />
                      </label>
                    </div>
                    {enviados.length === 0 ? (
                      <p className="mt-2 text-sm text-graphite">
                        Nenhum arquivo enviado ainda.
                      </p>
                    ) : (
                      <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                        {enviados.map((d) => (
                          <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="min-w-0 flex items-center gap-2">
                              <FileText className="h-4 w-4 shrink-0 text-graphite" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-navy-deep">{d.nome_arquivo}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(d.created_at).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownload(d.storage_path, d.nome_arquivo)}
                              className="text-xs text-navy hover:underline"
                            >
                              Baixar
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
