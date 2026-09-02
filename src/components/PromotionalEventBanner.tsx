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
      {/* 1. TOP & CENTER: Full Uncropped Advertising Poster Banner */}
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
          <div className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
            <span>Visual Publicitario IA</span>
          </div>

          <div className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-semibold text-black shadow-xs">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            <span>{spotsLeft} Cupos Restantes</span>
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
              Próximo Evento en Cronograma
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 font-medium">
              {event.category}
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="self-start sm:self-auto text-xs text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer px-3.5 py-1.5 rounded-full bg-gray-50 dark:bg-neutral-800/80 border border-gray-200/60 dark:border-neutral-700"
            title="Compartir evento"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>
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

        {/* Key Event Metadata Grid: Fecha, Modalidad & Cuenta Regresiva */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 py-1">
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

          {/* Modalidad & Acceso */}
          <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 flex items-start gap-3 text-left">
            <Video className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-neutral-500 tracking-wider">
                Modalidad & Acceso
              </div>
              <div className="text-xs font-semibold text-black dark:text-white mt-0.5">
                {event.mode}
              </div>
              <div
                className="text-[11px] font-light text-gray-500 dark:text-neutral-400 truncate"
                title={event.facilitator}
              >
                Facilita: {event.facilitator}
              </div>
            </div>
          </div>

          {/* Cuenta Regresiva */}
          <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 flex flex-col justify-between sm:col-span-2 lg:col-span-1 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-neutral-500 tracking-wider">
                Inicio del Taller
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                En vivo
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-black dark:text-white">
              <div className="px-1.5 py-1 rounded-xl bg-white dark:bg-[#151518] border border-gray-200/70 dark:border-neutral-700 shadow-2xs">
                <span className="block text-xs sm:text-sm font-bold font-mono">{timeLeft.days}</span>
                <span className="text-[9px] text-gray-400 uppercase font-medium">Días</span>
              </div>
              <div className="px-1.5 py-1 rounded-xl bg-white dark:bg-[#151518] border border-gray-200/70 dark:border-neutral-700 shadow-2xs">
                <span className="block text-xs sm:text-sm font-bold font-mono">{timeLeft.hours}</span>
                <span className="text-[9px] text-gray-400 uppercase font-medium">Hrs</span>
              </div>
              <div className="px-1.5 py-1 rounded-xl bg-white dark:bg-[#151518] border border-gray-200/70 dark:border-neutral-700 shadow-2xs">
                <span className="block text-xs sm:text-sm font-bold font-mono">{timeLeft.minutes}</span>
                <span className="text-[9px] text-gray-400 uppercase font-medium">Min</span>
              </div>
              <div className="px-1.5 py-1 rounded-xl bg-white dark:bg-[#151518] border border-gray-200/70 dark:border-neutral-700 shadow-2xs">
                <span className="block text-xs sm:text-sm font-bold font-mono">{timeLeft.seconds}</span>
                <span className="text-[9px] text-gray-400 uppercase font-medium">Seg</span>
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
              <span className="flex items-center gap-1.5 text-black dark:text-white font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Lugar reservado con éxito. Recibirás el enlace de acceso y recordatorio por WhatsApp/Email.
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Acceso sin costo con cupos limitados por aforo en sala Meet ({spotsLeft} lugares disponibles).
              </span>
            )}
          </div>

          <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
            {isRegistered ? (
              <a
                href={event.meetUrl || 'https://meet.google.com/rbc-conversatorio'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                Abrir Google Meet
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <LiquidGlassButton
                onClick={handleRegister}
                className="w-full sm:w-auto px-7 py-3 text-xs"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Reservar Cupo en Vivo
              </LiquidGlassButton>
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
