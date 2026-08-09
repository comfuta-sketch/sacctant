import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Brand } from "@/components/site/Brand";
import { LgpdNotice } from "@/components/LgpdNotice";
import { WHATSAPP_URL } from "@/lib/auth-helpers";

export function SiteFooter() {
  return (
    <footer id="contato" className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-14 md:grid-cols-4 md:gap-10">
          <div className="md:col-span-2">
            <Brand />
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-graphite">
              Consultoria contábil e estratégica para empresas e profissionais.
              Transformamos números em inteligência para decisões — com
              planejamento tributário, BPO financeiro e assessoria empresarial.
            </p>
          </div>

          <div className="md:border-l md:border-border md:pl-10">
            <h4 className="eyebrow">Navegação</h4>
            <ul className="mt-6 space-y-3 text-sm text-graphite">
              <li><Link to="/quem-somos" className="transition-colors hover:text-foreground">Quem somos</Link></li>
              <li><Link to="/servicos" className="transition-colors hover:text-foreground">Serviços</Link></li>
              <li><Link to="/contato" className="transition-colors hover:text-foreground">Contato</Link></li>
              <li><Link to="/auth" search={{ redirect: "/cliente" }} className="transition-colors hover:text-foreground">Área do Cliente</Link></li>
            </ul>
          </div>

          <div className="md:border-l md:border-border md:pl-10">
            <h4 className="eyebrow">Contato</h4>
            <ul className="mt-6 space-y-4 text-sm text-graphite">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-emerald" strokeWidth={1.25} />
                <span>s.acctant@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-emerald" strokeWidth={1.25} />
                <span>(98) 98477-6989</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald" strokeWidth={1.25} />
                <span>São Luís — Maranhão • Atendimento 100% online</span>
              </li>
              <li className="pt-1">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost !px-4 !py-2.5 !text-[10px]"
                >
                  <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.25} /> WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-border pt-8">
          <LgpdNotice />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 font-display text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <p>© {new Date().getFullYear()} MF Advisory — Inteligência para Decisões</p>
          <p>CRC ativo • LGPD compliant</p>
        </div>
      </div>
    </footer>
  );
}
