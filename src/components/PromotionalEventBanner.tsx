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
  Copy,
  Check,
  Radio,
  Maximize2,
  X,
  Eye,
  ZoomIn,
} from 'lucide-react';

interface PromotionalEventBannerProps {
  onRegisterInterest?: (event: CronogramaEvent) => void;
  className?: string;
  variant?: 'landing' | 'compact' | 'participant' | 'full';
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
  const [showImageModal, setShowImageModal] = useState(false);

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

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal]);

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

  // Reusable Countdown Numbers Component (Double-sized, minimalist, high legibility)
  const renderCountdown = () => {
    if (timeLeft.isLive) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600/95 text-white font-bold text-xs sm:text-sm animate-pulse border border-rose-400/30 shadow-md">
          <Radio className="w-4 h-4 text-white shrink-0" />
          <span>🔴 ¡TALLER EN VIVO AHORA!</span>
        </div>
      );
    }

    return (
      <div className="pt-1">
        <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-emerald-400 block mb-2">
          ⏱️ Inicio de Taller en Vivo:
        </span>
        <div className="flex items-baseline gap-2.5 sm:gap-4 font-mono">
          {/* Días */}
          <div className="flex flex-col items-start sm:items-center">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 uppercase tracking-widest mt-1.5">
              Días
            </span>
          </div>

          <span className="text-2xl sm:text-3xl md:text-4xl text-white/40 font-light select-none -translate-y-1 sm:-translate-y-2">
            :
          </span>

          {/* Horas */}
          <div className="flex flex-col items-start sm:items-center">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 uppercase tracking-widest mt-1.5">
              Horas
            </span>
          </div>

          <span className="text-2xl sm:text-3xl md:text-4xl text-white/40 font-light select-none -translate-y-1 sm:-translate-y-2">
            :
          </span>

          {/* Minutos */}
          <div className="flex flex-col items-start sm:items-center">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 uppercase tracking-widest mt-1.5">
              Min
            </span>
          </div>

          <span className="text-2xl sm:text-3xl md:text-4xl text-white/40 font-light select-none -translate-y-1 sm:-translate-y-2">
            :
          </span>

          {/* Segundos */}
          <div className="flex flex-col items-start sm:items-center">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-400 tracking-tight leading-none animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-300 uppercase tracking-widest mt-1.5">
              Seg
            </span>
          </div>
        </div>
      </div>
    );
  };

  // 1. Participant / Compact View: Balanced side-by-side layout with full image visibility
  if (variant === 'participant' || variant === 'compact') {
    return (
      <>
        <div
          id="participant-promotional-banner"
          className={`relative w-full rounded-3xl overflow-hidden border border-gray-200/80 dark:border-neutral-800 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-[#0D0D0E] group transition-all duration-300 ${className}`}
        >
          {/* Balanced 2-Zone Grid: Left Controls & Double-Sized Counter | Right Visible Workshop Poster Image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left 7 Columns: Double-Sized Countdown, Short Legible Explanation, Minimalist Meet Button */}
            <div className="lg:col-span-7 p-6 sm:p-7 md:p-8 flex flex-col justify-between space-y-6 text-left">
              {/* Header Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-semibold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>Próximo Taller • {event.displayDate} ({event.time})</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-medium text-gray-200">
                  Google Meet
                </span>
              </div>

              {/* CONTADOR EN ESQUINA LATERAL IZQUIERDA: DOBLE DE TAMAÑO & MINIMALISTA */}
              {renderCountdown()}

              {/* EXPLICACIÓN CORTA, MINIMALISTA, LEGIBLE Y PRECISA */}
              <div className="space-y-1.5 pt-1 border-t border-white/10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                  {event.title}
                </h2>
                <p className="text-xs sm:text-sm font-light text-gray-200 leading-relaxed max-w-xl">
                  {event.subtitle || 'Espacio interactivo de límites no dichos, mapeo de transparencia y decodificación somática en vivo con John Rengifo.'}
                </p>
              </div>

              {/* ACTION BAR: Minimalist Meet Button + Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xl hover:shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] border border-emerald-400/30"
                  title="Iniciar e ingresar a la sala de Google Meet"
                >
                  <Video className="w-4 h-4 text-white shrink-0" />
                  <span>Iniciar en Google Meet</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyMeetLink}
                  className="p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs transition-colors cursor-pointer shadow-md"
                  title="Copiar enlace de Google Meet"
                >
                  {copiedMeetNotice ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-200" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-gray-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  title="Ver afiche completo en alta resolución"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ver afiche completo</span>
                </button>

                {copiedMeetNotice && (
                  <span className="text-[11px] font-medium text-emerald-300 bg-black/70 px-3 py-1 rounded-full border border-emerald-500/30 animate-fade-in">
                    ✓ Enlace de Meet copiado
                  </span>
                )}
              </div>
            </div>

            {/* Right 5 Columns: The Workshop Poster Image Displayed in Crisp, Balanced Clarity */}
            <div className="lg:col-span-5 relative bg-[#09090B] flex items-center justify-center p-3 sm:p-5 border-t lg:border-t-0 lg:border-l border-white/10">
              <div
                onClick={() => setShowImageModal(true)}
                className="relative group/poster cursor-pointer overflow-hidden rounded-2xl w-full h-full min-h-[200px] sm:min-h-[240px] max-h-[320px] flex items-center justify-center shadow-lg border border-white/10 bg-black/40"
                title="Clic para ver el afiche completo en alta resolución"
              >
                {/* Complete, Natural Unobscured Image */}
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover sm:object-contain object-center group-hover/poster:scale-[1.02] transition-transform duration-500"
                />

                {/* Subtle Hover Action Pill */}
                <div className="absolute inset-0 bg-black/20 group-hover/poster:bg-black/10 transition-colors pointer-events-none" />
                
                <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 group-hover/poster:bg-black/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium shadow-md transition-all">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ampliar afiche</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Screen Lightbox Modal for Complete Uncropped Poster Inspection */}
        {showImageModal && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-[#121215] border border-neutral-700/80 rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-black/50 border-b border-white/10 text-white">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold truncate">
                    Afiche Oficial • {event.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Iniciar en Meet</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Cerrar (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Image Display */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/60">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                />
              </div>

              {/* Modal Footer with Direct Actions */}
              <div className="px-5 py-3 bg-black/50 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-300">
                <div className="flex items-center gap-2 text-emerald-300 font-medium text-center sm:text-left">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{event.displayDate} ({event.time}) • Sala Virtual Google Meet</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleCopyMeetLink}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Enlace</span>
                  </button>
                  <a
                    href={meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Iniciar en Meet</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 2. Default Landing / Full View: Balanced layout allowing complete view of the poster graphic
  return (
    <>
      <div
        id="promotional-event-banner"
        className={`w-full rounded-3xl overflow-hidden border border-gray-200/80 dark:border-neutral-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] bg-[#0D0D0E] group transition-all duration-300 ${className}`}
      >
        {/* Balanced Split Layout: Left Controls & 2x Counter | Right Visible Workshop Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left 7 Columns: Double-sized counter + short precise explanation + Meet button */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left">
            {/* Top Badges */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Primer Taller en Cronograma RBC</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-black shadow-xs">
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                <span>{spotsLeft} Cupos Restantes</span>
              </div>
            </div>

            {/* CONTADOR EN ESQUINA LATERAL IZQUIERDA: DOBLE DE TAMAÑO & MINIMALISTA */}
            {renderCountdown()}

            {/* EXPLICACIÓN CORTA, MINIMALISTA, LEGIBLE Y PRECISA */}
            <div className="space-y-2 pt-1 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{event.displayDate} • {event.time}</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                {event.title}
              </h2>
              <p className="text-xs sm:text-sm font-light text-gray-200 leading-relaxed max-w-xl">
                {event.subtitle || 'Indagación ontológica en vivo: límites no dichos, mapeo de transparencia y decodificación somática con John Rengifo.'}
              </p>
            </div>

            {/* ACTION BAR: Meet Button + Reservar Cupo + Compartir */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] border border-emerald-400/30"
                title="Iniciar en Google Meet"
              >
                <Video className="w-4 h-4 text-white shrink-0" />
                <span>Iniciar en Google Meet</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              </a>

              <button
                type="button"
                onClick={handleCopyMeetLink}
                className="p-3.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs transition-colors cursor-pointer shadow-md"
                title="Copiar enlace directo de Meet"
              >
                {copiedMeetNotice ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-200" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
                title="Ver afiche completo en alta resolución"
              >
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ver afiche completo</span>
              </button>

              {onRegisterInterest && !isRegistered && (
                <button
                  type="button"
                  onClick={handleRegister}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  Reservar Cupo Gratis
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs transition-colors cursor-pointer"
                title="Compartir taller"
              >
                <Share2 className="w-4 h-4 text-gray-200" />
              </button>
            </div>

            {copiedMeetNotice && (
              <span className="text-[11px] font-medium text-emerald-300 bg-black/70 px-3 py-1 rounded-full border border-emerald-500/30 animate-fade-in inline-block w-fit">
                ✓ Enlace de Meet copiado al portapapeles
              </span>
            )}
          </div>

          {/* Right 5 Columns: The Workshop Poster Image Displayed Clearly */}
          <div className="lg:col-span-5 relative bg-[#09090B] flex items-center justify-center p-3 sm:p-5 border-t lg:border-t-0 lg:border-l border-white/10">
            <div
              onClick={() => setShowImageModal(true)}
              className="relative group/poster cursor-pointer overflow-hidden rounded-2xl w-full h-full min-h-[220px] sm:min-h-[280px] max-h-[380px] flex items-center justify-center shadow-lg border border-white/10 bg-black/40"
              title="Clic para ampliar y ver toda la información del afiche"
            >
              {/* Unobscured Workshop Poster Image */}
              <img
                src={event.imageUrl}
                alt={event.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover sm:object-contain object-center group-hover/poster:scale-[1.02] transition-transform duration-500"
              />

              {/* Hover Badge */}
              <div className="absolute inset-0 bg-black/20 group-hover/poster:bg-black/10 transition-colors pointer-events-none" />

              <div className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/75 group-hover/poster:bg-black/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium shadow-md transition-all">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ampliar afiche completo</span>
              </div>
            </div>
          </div>
        </div>

        {showShareNotice && (
          <div className="bg-emerald-950 text-emerald-200 text-xs text-center py-2 animate-fade-in font-light border-t border-emerald-800">
            Enlace del evento copiado al portapapeles.
          </div>
        )}
      </div>

      {/* Full-Screen Lightbox Modal for Complete Uncropped Poster Inspection */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-[#121215] border border-neutral-700/80 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-black/50 border-b border-white/10 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-semibold truncate">
                  Afiche Oficial • {event.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Iniciar en Meet</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Cerrar (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Display */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/60">
              <img
                src={event.imageUrl}
                alt={event.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-black/50 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-300">
              <div className="flex items-center gap-2 text-emerald-300 font-medium text-center sm:text-left">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{event.displayDate} ({event.time}) • Sala Virtual Google Meet</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleCopyMeetLink}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Enlace</span>
                </button>
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Iniciar en Meet</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


