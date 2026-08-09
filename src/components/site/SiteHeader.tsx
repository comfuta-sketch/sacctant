import { Link } from "@tanstack/react-router";
import { User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Brand } from "@/components/site/Brand";
import { StartChannelDialog } from "@/components/StartChannelDialog";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/quem-somos", label: "Quem somos" },
  { to: "/servicos", label: "Serviços" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-5">
        <Brand />
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-8 font-display text-[11px] font-medium uppercase tracking-[0.18em] text-graphite lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="border-b border-transparent pb-1 transition-colors hover:text-foreground"
                activeProps={{
                  className: "text-foreground border-emerald",
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <Link
            to={user ? (isAdmin ? "/admin" : "/cliente") : "/auth"}
            search={user ? undefined : { redirect: "/cliente" }}
            className="hidden items-center gap-2 font-display text-[11px] font-medium uppercase tracking-[0.16em] text-graphite transition-colors hover:text-emerald sm:inline-flex"
          >
            <UserIcon className="h-4 w-4" strokeWidth={1.25} />
            {user ? (isAdmin ? "Painel" : "Minha Área") : "Área do Cliente"}
          </Link>
          <StartChannelDialog
            trigger={
              <button type="button" className="btn-ghost !px-5 !py-3">
                Falar com a MF
              </button>
            }
          />
        </div>
      </div>
    </header>
  );
}
