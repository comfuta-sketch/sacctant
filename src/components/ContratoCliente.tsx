import { useEffect, useRef, useState } from "react";
import { Loader2, FileSignature, Download, Eraser, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Contrato = {
  id: string; cliente_id: string; titulo: string;
  status: string; modelo_storage_path: string | null;
  dados_preenchidos: Record<string, unknown>;
  assinatura_base64: string | null; assinado_em: string | null;
};

type Props = { contrato: Contrato; onChange: () => void };

export function ContratoCliente({ contrato, onChange }: Props) {
  const [campo1, setCampo1] = useState((contrato.dados_preenchidos as Record<string, string>)?.campo1 ?? "");
  const [campo2, setCampo2] = useState((contrato.dados_preenchidos as Record<string, string>)?.campo2 ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(!!contrato.assinatura_base64);

  useEffect(() => {
    if (contrato.assinatura_base64 && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0);
      };
      img.src = contrato.assinatura_base64;
    }
  }, [contrato.assinatura_base64]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };
  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2; ctx.lineCap = "round";
  };
  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return; e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d"); if (!ctx) return;
    const { x, y } = getPos(e); ctx.lineTo(x, y); ctx.stroke();
    setHasDrawing(true);
  };
  const end = () => setDrawing(false);
  const clear = () => {
    const c = canvasRef.current; if (!c) return;
    c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    setHasDrawing(false);
  };

  const downloadModelo = async () => {
    if (!contrato.modelo_storage_path) return;
    const { data } = await supabase.storage.from("documentos_clientes")
      .createSignedUrl(contrato.modelo_storage_path, 60);
    if (data) window.open(data.signedUrl, "_blank");
  };

  const salvar = async (assinar: boolean) => {
    setSaving(true); setError(null);
    try {
      const payload: Record<string, unknown> = {
        dados_preenchidos: { campo1, campo2 },
      };
      if (assinar) {
        const sig = canvasRef.current?.toDataURL("image/png");
        if (!sig || !hasDrawing) { setError("Assine no campo abaixo antes."); setSaving(false); return; }
        payload.assinatura_base64 = sig;
        payload.assinado_em = new Date().toISOString();
        payload.status = "assinado";
      }
      const { error } = await supabase.from("contratos").update(payload).eq("id", contrato.id);
      if (error) throw error;
      onChange();
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao salvar."); }
    finally { setSaving(false); }
  };

  const assinado = contrato.status === "assinado";

  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-navy-deep flex items-center gap-2">
            <FileSignature className="h-4 w-4 text-navy" /> {contrato.titulo}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Status: <span className={assinado ? "text-emerald-700" : "text-amber-700"}>{contrato.status}</span>
            {contrato.assinado_em && ` — assinado em ${new Date(contrato.assinado_em).toLocaleString("pt-BR")}`}
          </p>
        </div>
        {contrato.modelo_storage_path && (
          <button onClick={downloadModelo}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-navy hover:border-navy">
            <Download className="h-3.5 w-3.5" /> Baixar modelo
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-graphite">Campo 1</span>
          <input value={campo1} onChange={(e) => setCampo1(e.target.value)} disabled={assinado}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-navy-deep focus:border-navy outline-none disabled:opacity-60" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-graphite">Campo 2</span>
          <input value={campo2} onChange={(e) => setCampo2(e.target.value)} disabled={assinado}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-navy-deep focus:border-navy outline-none disabled:opacity-60" />
        </label>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-graphite">Assinatura digital</span>
          {!assinado && (
            <button onClick={clear} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600">
              <Eraser className="h-3 w-3" /> Limpar
            </button>
          )}
        </div>
        <canvas
          ref={canvasRef} width={500} height={140}
          onMouseDown={!assinado ? start : undefined}
          onMouseMove={!assinado ? move : undefined}
          onMouseUp={end} onMouseLeave={end}
          onTouchStart={!assinado ? start : undefined}
          onTouchMove={!assinado ? move : undefined}
          onTouchEnd={end}
          className={`mt-2 w-full max-w-full rounded-lg border-2 border-dashed border-border bg-soft-gray/30 ${!assinado ? "cursor-crosshair" : ""}`}
        />
      </div>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {!assinado && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={() => salvar(false)} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-graphite hover:border-navy hover:text-navy disabled:opacity-60">
            Salvar rascunho
          </button>
          <button onClick={() => salvar(true)} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-navy-deep disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Assinar e enviar
          </button>
        </div>
      )}
    </div>
  );
}
