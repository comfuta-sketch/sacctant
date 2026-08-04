import { Link } from "@tanstack/react-router";

type Props = { suffix?: string; className?: string };

/** Marca institucional MF Advisory — azul petróleo + verde esmeralda. */
export function Brand({ suffix, className = "" }: Props) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-deep text-[13px] font-bold tracking-tight text-primary-foreground">
        MF
      </span>
      <span className="leading-tight">
        <span className="block font-semibold tracking-tight text-navy-deep">
          MF <span className="text-emerald">Advisory</span>
          {suffix && (
            <span className="text-xs font-normal text-muted-foreground">
              {" "}
              / {suffix}
            </span>
          )}
        </span>
        <span className="block text-[10px] uppercase tracking-[0.18em] text-graphite/70">
          Inteligência para Decisões
        </span>
      </span>
    </Link>
  );
}
