import React, { useState, useEffect, useMemo } from 'react';
import { CronogramaEvent } from '../types';
import { OntologicalStore } from '../services/store';
import { LiquidGlassButton } from './LiquidGlassButton';
import {
  Calendar,
  Clock,
  Video,
  Sparkles,
  ArrowRight,
  Share2,
  Users,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Flame,
  Wand2,
  Copy,
  Check,
  Radio,
} from 'lucide-react';

interface PromotionalEventBannerProps {
  onRegisterInterest?: (event: CronogramaEvent) => void;
  className?: string;
  variant?: 'landing' | 'compact' | 'full';
}

export const PromotionalEventBanner: React.FC<PromotionalEventBannerProps> = ({
  onRegisterInterest,
  className = '',
  variant = 'landing',
}) => {
  const [event, setEvent] = useState<CronogramaEvent>(() =>
    OntologicalStore.getUpcomingEvent()
  );
  const [isRegistered, setIsRegistered] = useState(false);
  const [showShareNotice, setShowShareNotice] = useState(false);
  const [copiedMeetNotice, setCopiedMeetNotice] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(event.spotsLeft);

  const meetUrl = useMemo(
    () => event.meetUrl || 'https://meet.google.com/rbc-conversatorio-ontologico',
    [event.meetUrl]
  );

  // Dynamic live countdown calculation
  const [timeLeft, setTimeLeft] = useState(() => {
    const target = event.date ? new Date(event.date).getTime() : Date.now() + 3 * 86400000;
    const diff = Math.max(0, target - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isLive: diff === 0,
    };
  });

  useEffect(() => {
    const updateCountdown = () => {
      const target = event.date ? new Date(event.date).getTime() : Date.now() + 3 * 86400000;
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
          isLive: false,
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [event.date]);

  const handleRegister = () => {
    setIsRegistered(true);
    setSpotsLeft((prev) => Math.max(1, prev - 1));
    if (onRegisterInterest) {
      onRegisterInterest(event);
    }
  };

  const handleCopyMeetLink = () => {
    navigator.clipboard.writeText(meetUrl);
    setCopiedMeetNotice(true);
    setTimeout(() => setCopiedMeetNotice(false), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Próximo taller ontológico: ${event.title} - ${event.subtitle}. Enlace a Meet: ${meetUrl}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Próximo taller ontológico: ${event.title} - ${event.displayDate} a las ${event.time}. Sala Meet: ${meetUrl}`
      );
      setShowShareNotice(true);
      setTimeout(() => setShowShareNotice(false), 2500);
    }
  };

  return (
    <div
      id="promotional-event-banner"
      className={`w-full bg-white dark:bg-[#18181B] rounded-3xl border border-gray-100/90 dark:border-neutral-800 shadow-[0_10px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* 1. TOP & CENTER: Full Uncropped Advertising Poster Banner with Overlaid Action Bar */}
      <div className="relative w-full bg-[#0D0D0E] flex flex-col items-center justify-center overflow-hidden group border-b border-gray-100 dark:border-neutral-800">
        {/* Uncropped centered banner graphic */}
        <div className="w-full max-w-5xl flex items-center justify-center p-2 sm:p-4">
          <img
            src={event.imageUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-[500px] object-contain rounded-xl sm:rounded-2xl shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.008]"
          />
        </div>

        {/* Floating Badges on Top Corners */}
        <div className="absolute top-3 sm:top-5 left-3 sm:left-6 right-3 sm:right-6 z-10 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
            <span>Primer Taller RBC</span>
          </div>

          <div className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-semibold text-black shadow-xs">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            <span>{spotsLeft} Cupos Restantes</span>
          </div>
        </div>

        {/* Floating Bottom Quick Bar over Poster Image: Live Countdown & Status */}
        <div className="w-full bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 sm:p-5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-white z-10">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
            <span className="font-medium text-gray-200">
              {timeLeft.isLive ? (
                <strong className="text-emerald-400 font-bold">🔴 ¡TALLER EN VIVO AHORA!</strong>
              ) : (
                <span>
                  Inicio de Taller en:{' '}
                  <strong className="font-mono text-white font-bold">
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                  </strong>
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
            <Video className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Transmisión en Directo vía Google Meet</span>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM: Structured Information & Key Facts Underneath */}
      <div className="p-6 sm:p-8 lg:p-10 space-y-6 bg-white dark:bg-[#18181B] transition-colors">
        {/* Section Header with Status and Share Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-neutral-800 pb-5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
              Primer Taller en Cronograma RBC
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/60 dark:border-emerald-800/40">
              {event.category || 'Primer Taller • En Vivo'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="text-xs text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer px-3.5 py-1.5 rounded-full bg-gray-50 dark:bg-neutral-800/80 border border-gray-200/60 dark:border-neutral-700 shadow-2xs"
              title="Compartir evento"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartir Taller</span>
            </button>
          </div>
        </div>

        {/* Title, Subtitle and Complete Editorial Description */}
        <div className="space-y-2.5 text-left">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-black dark:text-white tracking-tight leading-tight">
            {event.title}
          </h2>
          <p className="text-sm sm:text-base font-normal text-gray-600 dark:text-neutral-300 leading-relaxed">
            {event.subtitle}
          </p>
          <p className="text-xs sm:text-sm font-light text-gray-600 dark:text-neutral-400 leading-relaxed pt-1">
            {event.description}
          </p>
        </div>

        {/* 🌟 HIGHLIGHTED SPECIAL BLOCK: CONTADOR INICIO DE TALLER & BOTÓN DE ENLACE A GOOGLE MEET */}
        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#F6F7F9] via-[#FAFAFA] to-[#EFF2F5] dark:from-[#1E1E22] dark:via-[#19191D] dark:to-[#141417] border-2 border-emerald-500/30 dark:border-emerald-500/30 shadow-sm space-y-5 text-left">
          {/* Header of Countdown & Connection Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/80 dark:border-neutral-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  ⏱️ Contador Inicio de Taller
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Enlace Oficial Meet
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                Cuenta regresiva en vivo para el inicio del primer taller y acceso a la sala virtual.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#141417] border border-gray-200 dark:border-neutral-700 text-xs font-mono text-gray-700 dark:text-neutral-300 shadow-2xs">
              <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-[240px]">
                {meetUrl.replace(/^https?:\/\//, '')}
              </span>
            </div>
          </div>

          {/* Grid: Countdown Numbers & Direct Google Meet CTA Button */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* 4 Digit Boxes */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center text-black dark:text-white">
                <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#141417] border border-gray-200/80 dark:border-neutral-700 shadow-xs">
                  <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-black dark:text-white">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 uppercase font-semibold tracking-wider">
                    Días
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#141417] border border-gray-200/80 dark:border-neutral-700 shadow-xs">
                  <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-black dark:text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 uppercase font-semibold tracking-wider">
                    Horas
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#141417] border border-gray-200/80 dark:border-neutral-700 shadow-xs">
                  <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-black dark:text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 uppercase font-semibold tracking-wider">
                    Min
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#141417] border border-gray-200/80 dark:border-neutral-700 shadow-xs">
                  <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 uppercase font-semibold tracking-wider">
                    Seg
                  </span>
                </div>
              </div>
            </div>

            {/* Google Meet Button & Direct Access Actions */}
            <div className="lg:col-span-5 flex flex-col gap-2.5">
              <a
                href={meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                <Video className="w-5 h-5 text-white" />
                <span>Ingresar al Taller en Google Meet</span>
                <ExternalLink className="w-4 h-4 text-emerald-200" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMeetLink}
                  className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#141417] border border-gray-200/80 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-xs font-semibold text-gray-700 dark:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedMeetNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Enlace de Meet</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                    event.title
                  )}&details=${encodeURIComponent(
                    `${event.subtitle}\n\nSala Google Meet: ${meetUrl}\nFacilita: ${event.facilitator}`
                  )}&location=${encodeURIComponent(meetUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-white dark:bg-[#141417] border border-gray-200/80 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-xs font-semibold text-gray-700 dark:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Agendar en Google Calendar"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Agendar</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Key Event Metadata Grid: Fecha, Modalidad & Facilitador */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 py-1">
          {/* Fecha & Hora */}
          <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 flex items-start gap-3 text-left">
            <Calendar className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-neutral-500 tracking-wider">
                Fecha & Hora
              </div>
              <div className="text-xs font-semibold text-black dark:text-white mt-0.5">
                {event.displayDate}
              </div>
              <div className="text-[11px] font-light text-gray-500 dark:text-neutral-400">
                {event.time}
              </div>
            </div>
          </div>

          {/* Modalidad & Acceso Google Meet */}
          <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 flex items-start gap-3 text-left">
            <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-neutral-500 tracking-wider">
                Modalidad & Acceso
              </div>
              <div className="text-xs font-semibold text-black dark:text-white mt-0.5">
                Online (Google Meet)
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Sala Virtual Cifrada</span>
              </div>
            </div>
          </div>

          {/* Facilitación Profesional */}
          <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 flex items-start gap-3 text-left">
            <Users className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-neutral-500 tracking-wider">
                Facilitador Master Coach
              </div>
              <div className="text-xs font-semibold text-black dark:text-white mt-0.5 truncate" title={event.facilitator}>
                {event.facilitator}
              </div>
              <div className="text-[11px] font-light text-gray-500 dark:text-neutral-400">
                Consultoría Ontológica RBC
              </div>
            </div>
          </div>
        </div>

        {/* Ejes de Trabajo Ontológico */}
        <div className="space-y-2 pt-1 text-left">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
            Ejes de Trabajo & Transformación en Vivo
          </span>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-full bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200/80 dark:border-neutral-800 text-xs text-gray-700 dark:text-neutral-300 font-light">
              • Decodificación Somática & Corporal
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200/80 dark:border-neutral-800 text-xs text-gray-700 dark:text-neutral-300 font-light">
              • Mapeo de la Transparencia Cotidiana
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200/80 dark:border-neutral-800 text-xs text-gray-700 dark:text-neutral-300 font-light">
              • Matriz de Límites &quot;Basta&quot; (Dignidad Relacional)
            </span>
          </div>
        </div>

        {/* Action Call to Action */}
        <div className="pt-5 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 dark:text-neutral-400 font-light text-center sm:text-left">
            {isRegistered ? (
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Lugar reservado con éxito. Accede en vivo con el botón principal de Google Meet arriba.
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Acceso sin costo con cupos limitados por aforo en sala Meet ({spotsLeft} lugares disponibles).
              </span>
            )}
          </div>

          <div className="w-full sm:w-auto shrink-0 flex flex-wrap items-center justify-end gap-3">
            {!isRegistered ? (
              <LiquidGlassButton
                onClick={handleRegister}
                className="w-full sm:w-auto px-7 py-3 text-xs"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Reservar Cupo en Vivo
              </LiquidGlassButton>
            ) : (
              <button
                type="button"
                onClick={handleShare}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir con Colegas</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showShareNotice && (
        <div className="bg-black dark:bg-neutral-800 text-white text-xs text-center py-2 animate-fade-in font-light">
          Enlace del evento copiado al portapapeles.
        </div>
      )}
    </div>
  );
};

