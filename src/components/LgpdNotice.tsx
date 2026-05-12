import { ShieldCheck } from "lucide-react";

type Props = { className?: string };

export function LgpdNotice({ className = "" }: Props) {
  return (
    <p
      className={`flex items-start gap-2 rounded-md border border-border/60 bg-soft-gray/40 px-3 py-2 text-[11px] leading-snug text-muted-foreground ${className}`}
    >
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy" />
      <span>
        Seus dados estão protegidos e são tratados estritamente de acordo com a
        LGPD (Lei Geral de Proteção de Dados).
      </span>
    </p>
  );
}
