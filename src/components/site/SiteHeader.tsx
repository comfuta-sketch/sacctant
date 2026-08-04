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
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-4">
        <Brand />
        <div className="flex items-center gap-2">
          <nav className="mr-4 hidden items-center gap-7 text-sm text-graphite lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="transition-colors hover:text-navy"
                activeProps={{ className: "text-navy font-medium" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Link
            to={user ? (isAdmin ? "/admin" : "/cliente") : "/auth"}
            search={user ? undefined : { redirect: "/cliente" }}
            className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-graphite transition-colors hover:border-navy hover:text-navy sm:inline-flex"
          >
            <UserIcon className="h-4 w-4" />
            {user ? (isAdmin ? "Painel Admin" : "Minha Área") : "Área do Cliente"}
          </Link>
          <StartChannelDialog
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-navy-deep"
              >
                Falar com a MF
              </button>
            }
          />
        </div>
      </div>
    </header>
  );
}
