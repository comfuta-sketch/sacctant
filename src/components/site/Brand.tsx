import { Link } from "@tanstack/react-router";

type Props = { suffix?: string; className?: string };

/** Monograma MF — traço fino monocromático. */
function Monogram({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      aria-hidden="true"
      className={className}
    >
      {/* M */}
      <path d="M3 37V6l11 14L25 6v31" />
      {/* barras ascendentes */}
      <path d="M20 37V17M27 37V13M34 37V9" />
      {/* F / diagonais */}
      <path d="M22 15 41 3M26 24 41 13" />
    </svg>
  );
}

/** Marca institucional MF Advisory — lockup editorial. */
export function Brand({ suffix, className = "" }: Props) {
  return (
    <Link to="/" className={`group flex items-center gap-3.5 ${className}`}>
      <Monogram className="h-9 w-10 shrink-0 text-foreground transition-colors group-hover:text-emerald" />
      <span className="min-w-0 leading-tight">
        <span className="block font-display text-sm font-bold uppercase tracking-[0.22em] text-navy-deep">
          MF Advisory
          {suffix && (
            <span className="font-normal normal-case tracking-normal text-muted-foreground">
              {" "}
              / {suffix}
            </span>
          )}
        </span>
        <span className="mt-1 block font-display text-[9px] font-medium uppercase tracking-[0.3em] text-graphite/70">
          Inteligência para Decisões
        </span>
      </span>
    </Link>
  );
}
