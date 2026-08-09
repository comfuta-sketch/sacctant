import { ShieldCheck } from "lucide-react";

type Props = { className?: string };

export function LgpdNotice({ className = "" }: Props) {
  return (
    <p
      className={`flex items-start gap-3 border border-border bg-soft-gray/40 px-4 py-3 text-[11px] leading-relaxed tracking-wide text-muted-foreground ${className}`}
    >
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" strokeWidth={1.3} />
      <span>
        Seus dados estão protegidos e são tratados estritamente de acordo com a
        LGPD (Lei Geral de Proteção de Dados).
      </span>
    </p>
  );
}
