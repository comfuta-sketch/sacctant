import { CalendarClock, MessageCircle } from "lucide-react";
import { HELP_CHANNELS, whatsappLink } from "@/lib/help-channels";

/** URL de agendamento (Calendly / Google Calendar). Deixe vazio até configurar. */
const SCHEDULING_EMBED_URL = "";

export function AgendamentoTab() {
  const geral =
    HELP_CHANNELS.find((c) => c.id === "geral")?.message ??
    "Olá, gostaria de agendar uma reunião com a MF Advisory.";

  return (
    <div>
      <div className="border-b border-border pb-5">
        <p className="eyebrow">Agenda</p>
        <h2 className="display-title mt-3 text-base text-navy-deep md:text-xl">
          Agendar reunião / sanar dúvidas
        </h2>
        <p className="mt-4 max-w-xl font-serif text-[15px] leading-[1.9] text-graphite">
          Reserve um horário com a equipe para revisar números, decisões
          tributárias ou dúvidas pontuais.
        </p>
      </div>

      <div className="mt-8 border border-border">
        {SCHEDULING_EMBED_URL ? (
          <iframe
            src={SCHEDULING_EMBED_URL}
            title="Agendamento MF Advisory"
            className="h-[680px] w-full border-0"
            loading="lazy"
          />
        ) : (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-8 py-16 text-center">
            <CalendarClock
              className="h-8 w-8 text-emerald"
              strokeWidth={1.15}
            />
            <h3 className="display-title mt-6 text-base text-navy-deep">
              Agenda online em ativação
            </h3>
            <p className="mt-4 max-w-md font-serif text-[15px] leading-[1.9] text-graphite">
              Este espaço está preparado para receber a agenda integrada
              (Calendly ou Google Calendar). Enquanto isso, solicite seu horário
              pelo canal direto.
            </p>
            <a
              href={whatsappLink(geral)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid mt-8"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.4} /> Solicitar
              horário
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
