import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Brand } from "@/components/site/Brand";
import { LgpdNotice } from "@/components/LgpdNotice";
import { WHATSAPP_URL } from "@/lib/auth-helpers";

export function SiteFooter() {
  return (
    <footer id="contato" className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Brand />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-graphite">
              Consultoria contábil e estratégica para empresas e profissionais.
              Transformamos números em inteligência para decisões — com
              planejamento tributário, BPO financeiro e assessoria empresarial.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-navy-deep">Navegação</h4>
            <ul className="mt-4 space-y-2 text-sm text-graphite">
              <li><Link to="/quem-somos" className="hover:text-navy">Quem somos</Link></li>
              <li><Link to="/servicos" className="hover:text-navy">Serviços</Link></li>
              <li><Link to="/contato" className="hover:text-navy">Contato</Link></li>
              <li><Link to="/auth" search={{ redirect: "/cliente" }} className="hover:text-navy">Área do Cliente</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-navy-deep">Contato</h4>
            <ul className="mt-4 space-y-3 text-sm text-graphite">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald" />
                <span>s.acctant@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald" />
                <span>(98) 98477-6989</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                <span>São Luís — Maranhão • Atendimento 100% online</span>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-deep px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-emerald"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <LgpdNotice />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} MF Advisory — Inteligência para Decisões.</p>
          <p>CRC ativo • LGPD compliant</p>
        </div>
      </div>
    </footer>
  );
}
