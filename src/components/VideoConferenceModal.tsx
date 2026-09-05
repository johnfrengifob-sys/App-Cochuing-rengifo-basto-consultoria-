import React, { useState } from 'react';
import {
  Video,
  X,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  Phone,
  MessageSquare,
  Users,
  MapPin,
  Laptop,
} from 'lucide-react';
import { OntologicalStore, COMPANY_INFO } from '../services/store';
import { User, Session } from '../types';

interface VideoConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
}

export const VideoConferenceModal: React.FC<VideoConferenceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  // Retrieve current events and system link bindings configured in the store
  const events = OntologicalStore.getCronogramaEvents();
  const calendarUrl = OntologicalStore.getSystemLinkUrl('calendar_agenda', OntologicalStore.getCalendarUrl());
  const directMeetUrl = OntologicalStore.getSystemLinkUrl('meet_sessions', 'https://meet.google.com/qmv-rbco-ses');

  // If user is client, retrieve their next session
  let nextClientSession: Session | undefined;
  if (currentUser && currentUser.role === 'client') {
    const clientSessions = OntologicalStore.getSessionsForClient(currentUser.uid);
    nextClientSession = clientSessions.find((s) => s.status === 'scheduled');
  }

  const formatSessionDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const handleCopy = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(label);
    setTimeout(() => {
      setCopiedLink(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white/90 dark:bg-[#121214]/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6 text-black dark:text-neutral-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E1E22] transition-all cursor-pointer"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Header */}
        <div className="space-y-2 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-700 dark:text-blue-400">
            <Video className="w-3.5 h-3.5" />
            <span>Salas de Google Meet & Conferencias</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-light tracking-tight text-black dark:text-white">
            Enlaces para <strong className="font-semibold">Videoconferencias & Talleres</strong>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
            Accede a las transmisiones en vivo de nuestros conversatorios quincenales, masterclasses especializadas y sesiones individuales de coaching.
          </p>
        </div>

        {/* Client's Private Session Box (if logged in as client and has a session) */}
        {currentUser && currentUser.role === 'client' && nextClientSession && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Tu Próxima Sesión Individual 1 a 1 (Confidencial)
              </span>
              <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 capitalize">
                {formatSessionDate(nextClientSession.date)}
              </span>
            </div>

            <div className="text-xs text-gray-600 dark:text-neutral-300 font-light">
              <strong className="text-black dark:text-white font-medium">Sesión {nextClientSession.sessionNumber}:</strong>{' '}
              {nextClientSession.notes || 'Acompañamiento ontológico personalizado.'}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={nextClientSession.meetLink || directMeetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Entrar a tu Sesión en Google Meet</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => handleCopy(nextClientSession!.meetLink || directMeetUrl, 'client-session')}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 text-xs text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink === 'client-session' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                    <span>Copiar Enlace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Direct 1-on-1 Meet Room (Synced with CerebroVinculacionManager) */}
        {(!currentUser || currentUser.role === 'coach' || !nextClientSession) && (
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Sala Virtual Directa de Sesiones 1 a 1 (Google Meet)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-mono font-medium">
                Enlace Oficial
              </span>
            </div>

            <div className="text-xs text-gray-600 dark:text-neutral-300 font-light">
              Sala permanente para sesiones quincenales, diagnósticos confidenciales y consultas ontológicas privadas con John Fredy Rengifo Basto.
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={directMeetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Entrar a Sala 1 a 1 en Meet</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => handleCopy(directMeetUrl, 'direct-meet')}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 text-xs text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink === 'direct-meet' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                    <span>Copiar Enlace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Section: Live Workshops & Conferences */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2">
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-black dark:text-white" />
              Talleres & Conversatorios Grupales En Vivo
            </h3>
            <span className="text-[11px] text-gray-400 dark:text-neutral-500 font-light">
              Plataforma Google Meet
            </span>
          </div>

          <div className="space-y-3.5">
            {events.map((evt) => {
              const meetLink = evt.meetUrl || 'https://meet.google.com/rbc-conversatorio-ontologico';
              const isCopied = copiedLink === evt.id;

              return (
                <div
                  key={evt.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#F9F9F9] dark:bg-[#18181B] border border-gray-200/80 dark:border-neutral-800 space-y-3 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-semibold tracking-wider uppercase text-black dark:text-white">
                          {evt.category || 'Taller Online'}
                        </span>
                        {evt.featured && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-medium flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Próxima Edición
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-black dark:text-white">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                        {evt.subtitle}
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="text-xs font-medium text-black dark:text-white flex items-center sm:justify-end gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{evt.displayDate}</span>
                      </div>
                      <div className="text-[11px] font-mono text-gray-500 dark:text-neutral-400">
                        {evt.time}
                      </div>
                    </div>
                  </div>

                  {/* Link Box */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0 font-mono text-xs text-gray-600 dark:text-neutral-300">
                      <Laptop className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate select-all">{meetLink}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(meetLink, evt.id)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-white transition-colors cursor-pointer flex items-center gap-1"
                        title="Copiar enlace"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-gray-400" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>

                      <a
                        href={meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>Unirse a Google Meet</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: 1-on-1 Appointments & General Calendar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-black dark:text-white" />
                <h4 className="text-xs sm:text-sm font-semibold text-black dark:text-white">
                  Agenda de Sesiones Individuales & Citas (Google Calendar)
                </h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-1">
                Agenda directamente tu espacio quincenal de 60 minutos con el Master Coach John Fredy Rengifo Basto. El enlace de Google Meet se generará automáticamente en tu invitación de calendario.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href={calendarUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#1E1E22] border border-gray-300 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Abrir Agenda en Google Calendar</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={() => handleCopy(calendarUrl, 'calendar-agenda')}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 text-xs text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink === 'calendar-agenda' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  <span>Copiar Enlace de Agenda</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Help & WhatsApp Assistance */}
        <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-neutral-400 font-light">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Salas oficiales con encriptación TLS punto a punto y control de acceso.</span>
          </div>

          <a
            href={`${COMPANY_INFO.whatsappUrl}&text=Hola%20John%20Fredy,%20necesito%20asistencia%20para%20conectarme%20a%20la%20videoconferencia%20de%20Google%20Meet`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>¿Problemas de audio o conexión? Soporte WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
