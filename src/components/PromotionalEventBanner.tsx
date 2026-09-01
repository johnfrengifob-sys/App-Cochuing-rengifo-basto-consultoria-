import React, { useState, useEffect } from 'react';
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
  const [spotsLeft, setSpotsLeft] = useState(event.spotsLeft);

  // Time remaining calculation
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRegister = () => {
    setIsRegistered(true);
    setSpotsLeft((prev) => Math.max(1, prev - 1));
    if (onRegisterInterest) {
      onRegisterInterest(event);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Próximo evento ontológico: ${event.title} - ${event.subtitle}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Próximo evento ontológico: ${event.title} - ${event.displayDate} a las ${event.time}. Regístrate aquí: ${window.location.href}`
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: AI-Generated Advertising Image with Live Overlay */}
        <div className="lg:col-span-6 relative bg-black min-h-[260px] sm:min-h-[320px] lg:min-h-[380px] flex flex-col justify-between overflow-hidden group">
          {/* Main AI Generated Graphic */}
          <img
            src={event.imageUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Elegant Dark Vignette Gradient for Perfect Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

          {/* Top Badges */}
          <div className="relative z-10 p-5 sm:p-6 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
              <span>Visual Publicitario IA</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-black shadow-xs">
              <Flame className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
              <span>{spotsLeft} Cupos Restantes</span>
            </div>
          </div>

          {/* Bottom Card Overlay on Top of the AI Image */}
          <div className="relative z-10 p-5 sm:p-6 space-y-3">
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-widest text-gray-300">
                {event.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-tight drop-shadow-xs">
                {event.title}
              </h3>
              <p className="text-xs font-light text-gray-300 line-clamp-2">
                {event.subtitle}
              </p>
            </div>

            {/* Countdown timer pill */}
            <div className="pt-2 flex items-center gap-2">
              <div className="grid grid-cols-4 gap-1.5 text-center text-white">
                <div className="px-2 py-1 rounded-lg bg-white/15 backdrop-blur-sm border border-white/10">
                  <span className="block text-xs font-bold font-mono">{timeLeft.days}</span>
                  <span className="text-[9px] text-gray-300 uppercase">Días</span>
                </div>
                <div className="px-2 py-1 rounded-lg bg-white/15 backdrop-blur-sm border border-white/10">
                  <span className="block text-xs font-bold font-mono">{timeLeft.hours}</span>
                  <span className="text-[9px] text-gray-300 uppercase">Hrs</span>
                </div>
                <div className="px-2 py-1 rounded-lg bg-white/15 backdrop-blur-sm border border-white/10">
                  <span className="block text-xs font-bold font-mono">{timeLeft.minutes}</span>
                  <span className="text-[9px] text-gray-300 uppercase">Min</span>
                </div>
                <div className="px-2 py-1 rounded-lg bg-white/15 backdrop-blur-sm border border-white/10">
                  <span className="block text-xs font-bold font-mono">{timeLeft.seconds}</span>
                  <span className="text-[9px] text-gray-300 uppercase">Seg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Event Details & Action Panel */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white dark:bg-[#18181B] transition-colors">
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                  Próximo Evento en Cronograma
                </span>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="text-xs text-gray-400 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                title="Compartir evento"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compartir</span>
              </button>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm font-light text-gray-600 dark:text-neutral-300 leading-relaxed">
              {event.description}
            </p>

            {/* Schedule & Location Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
              <div className="p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 flex items-start gap-3">
                <Calendar className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-neutral-500">
                    Fecha & Hora
                  </div>
                  <div className="text-xs font-medium text-black dark:text-white truncate">
                    {event.displayDate}
                  </div>
                  <div className="text-[11px] font-light text-gray-500 dark:text-neutral-400">
                    {event.time}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 flex items-start gap-3">
                <Video className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-neutral-500">
                    Modalidad & Acceso
                  </div>
                  <div className="text-xs font-medium text-black dark:text-white truncate">
                    {event.mode}
                  </div>
                  <div className="text-[11px] font-light text-gray-500 dark:text-neutral-400 truncate">
                    Facilita: {event.facilitator}
                  </div>
                </div>
              </div>
            </div>

            {/* Ontological Themes / Transformation Ejes */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
                Ejes de Trabajo en Vivo
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200/80 dark:border-neutral-800 text-[11px] text-gray-700 dark:text-neutral-300 font-light">
                  • Decodificación Somática
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200/80 dark:border-neutral-800 text-[11px] text-gray-700 dark:text-neutral-300 font-light">
                  • Mapeo de la Transparencia
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200/80 dark:border-neutral-800 text-[11px] text-gray-700 dark:text-neutral-300 font-light">
                  • Matriz de Límites &quot;Basta&quot;
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-500 dark:text-neutral-400 font-light w-full sm:w-auto">
              {isRegistered ? (
                <span className="flex items-center gap-1.5 text-black dark:text-white font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Lugar reservado. Recibirás recordatorio a tu WhatsApp/Email.
                </span>
              ) : (
                <span>
                  Acceso sin costo con cupos limitados por aforo en vivo.
                </span>
              )}
            </div>

            <div className="w-full sm:w-auto shrink-0">
              {isRegistered ? (
                <a
                  href={event.meetUrl || 'https://meet.google.com/rbc-conversatorio'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <Video className="w-3.5 h-3.5" />
                  Abrir Google Meet
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <LiquidGlassButton
                  onClick={handleRegister}
                  className="w-full sm:w-auto px-6 py-3 text-xs font-semibold"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Reserva tu cupo
                </LiquidGlassButton>
              )}
            </div>
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
