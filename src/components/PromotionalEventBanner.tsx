import React, { useState, useEffect, useMemo } from 'react';
import { CronogramaEvent } from '../types';
import { OntologicalStore } from '../services/store';
import { LiquidGlassButton } from './LiquidGlassButton';
import { safeCopyToClipboard } from '../utils/clipboard';
import { getPublicPortalUrl } from '../utils/urlHelper';
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
  Download,
  Award,
  BookOpen,
  MessageCircle,
  Mail,
} from 'lucide-react';
import promotionalEventBannerImg from '../assets/images/proximo_evento_banner_1788270380574.jpg';

interface PromotionalEventBannerProps {
  event?: CronogramaEvent;
  onRegisterInterest?: (event: CronogramaEvent) => void;
  className?: string;
  variant?: 'landing' | 'compact' | 'participant' | 'full';
  isAttended?: boolean;
  participantCycle?: number;
  onNavigateToSyllabus?: () => void;
  onDownloadWorkbookPDF?: () => void;
}

export const PromotionalEventBanner: React.FC<PromotionalEventBannerProps> = ({
  event: initialEventProp,
  onRegisterInterest,
  className = '',
  variant = 'landing',
  isAttended = false,
  participantCycle,
  onNavigateToSyllabus,
  onDownloadWorkbookPDF,
}) => {
  const [event, setEvent] = useState<CronogramaEvent>(() =>
    initialEventProp || OntologicalStore.getUpcomingEvent()
  );
  const [isRegistered, setIsRegistered] = useState(false);
  const [showShareNotice, setShowShareNotice] = useState(false);
  const [copiedMeetNotice, setCopiedMeetNotice] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(event.spotsLeft);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShareKey, setCopiedShareKey] = useState<string | null>(null);

  // Synchronize when initialEventProp changes
  useEffect(() => {
    if (initialEventProp) {
      setEvent(initialEventProp);
      setSpotsLeft(initialEventProp.spotsLeft);
    }
  }, [initialEventProp]);

  // Listen for event updates across the app
  useEffect(() => {
    if (initialEventProp) return;

    const handleEventsUpdated = () => {
      const updated = OntologicalStore.getUpcomingEvent();
      if (updated) {
        setEvent(updated);
        setSpotsLeft(updated.spotsLeft);
      }
    };

    window.addEventListener('rbc-cronograma-events-updated', handleEventsUpdated);
    window.addEventListener('rbc-workshops-updated', handleEventsUpdated);
    window.addEventListener('storage', handleEventsUpdated);
    return () => {
      window.removeEventListener('rbc-cronograma-events-updated', handleEventsUpdated);
      window.removeEventListener('rbc-workshops-updated', handleEventsUpdated);
      window.removeEventListener('storage', handleEventsUpdated);
    };
  }, [initialEventProp]);

  const meetUrl = useMemo(
    () => event.meetUrl || 'https://meet.google.com/rbc-conversatorio-ontologico',
    [event.meetUrl]
  );

  // Identificador de taller Raíz (Nivel I / Presentación)
  const isRaizWorkshop = useMemo(() => {
    const id = (event.id || '').toLowerCase();
    const title = (event.title || '').toLowerCase();
    return (
      id === 'taller-1-raiz' ||
      id.includes('raiz') ||
      id.includes('taller-1') ||
      title.includes('raíz') ||
      title.includes('raiz') ||
      title.includes('taller 1') ||
      title.includes('taller i')
    );
  }, [event.id, event.title]);

  // Afiche gráfico oficial de alta resolución:
  // Desvincula cualquier caché residual de la Masterclass anterior o imagen placeholder de Unsplash
  const eventImageUrl = useMemo(() => {
    const raw = (event.coverImage && event.coverImage.trim()) || (event.imageUrl && event.imageUrl.trim());
    if (raw && !raw.startsWith('blob:') && !raw.toLowerCase().includes('masterclass')) {
      return raw;
    }
    return promotionalEventBannerImg;
  }, [event.coverImage, event.imageUrl]);

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
      if (e.key === 'Escape') {
        if (showShareModal) setShowShareModal(false);
        if (showImageModal) setShowImageModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal, showShareModal]);

  const handleRegister = () => {
    setIsRegistered(true);
    setSpotsLeft((prev) => Math.max(1, prev - 1));
    if (onRegisterInterest) {
      onRegisterInterest(event);
    }
  };

  const handleCopyMeetLink = async () => {
    await safeCopyToClipboard(meetUrl);
    setCopiedMeetNotice(true);
    setTimeout(() => setCopiedMeetNotice(false), 3000);
  };

  const handleToggleShare = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowShareModal((prev) => !prev);
  };

  const handleShareWhatsApp = () => {
    const portalUrl = getPublicPortalUrl('registro');
    const msg = `🌿 *${event.title}*\n_${event.subtitle || 'Formación y Acompañamiento Ontológico'}_\n\n📅 *Fecha:* ${event.displayDate || 'Próximamente'}\n⏰ *Hora:* ${event.time || '7:00 PM (GMT-5)'}\n💻 *Sala Virtual Google Meet:* ${meetUrl}\n\n👉 *Inscripción y Acceso:* ${portalUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyDirectLink = async () => {
    const portalUrl = getPublicPortalUrl('registro');
    await safeCopyToClipboard(portalUrl);
    setCopiedShareKey('link');
    setShowShareNotice(true);
    setTimeout(() => {
      setCopiedShareKey(null);
      setShowShareNotice(false);
    }, 2500);
  };

  const handleCopyFullInvitation = async () => {
    const portalUrl = getPublicPortalUrl('registro');
    const fullText = `*${event.title}*\n${event.subtitle || 'Formación Ontológica RBC'}\n\n• Fecha: ${event.displayDate}\n• Hora: ${event.time}\n• Modalidad: Google Meet (${meetUrl})\n• Portal de Registro y Temario: ${portalUrl}\n\nFacilita: John Fredy Rengifo Basto (Master Coach Ontológico)`;
    await safeCopyToClipboard(fullText);
    setCopiedShareKey('full');
    setShowShareNotice(true);
    setTimeout(() => {
      setCopiedShareKey(null);
      setShowShareNotice(false);
    }, 2500);
  };

  const handleShareEmail = () => {
    const portalUrl = getPublicPortalUrl('registro');
    const subject = encodeURIComponent(`Invitación al ${event.title}`);
    const body = encodeURIComponent(
      `Te comparto la invitación oficial al taller ontológico:\n\n${event.title}\n${event.subtitle || ''}\n\nFecha: ${event.displayDate}\nHora: ${event.time}\nSala Google Meet: ${meetUrl}\n\nPuedes ver el afiche oficial, temario y registrar tu cupo aquí:\n${portalUrl}\n\nFacilitador: John Fredy Rengifo Basto`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareNative = async () => {
    const portalUrl = getPublicPortalUrl('registro');
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `${event.title} - ${event.subtitle || 'Taller Ontológico RBC'}. Sala Google Meet: ${meetUrl}`,
          url: portalUrl,
        });
      } catch {}
    } else {
      await handleCopyDirectLink();
    }
  };

  // Render clean numeric countdown directly overlaid on the event image (upper left, pure numbers without container)
  const renderImageNumericCountdown = () => {
    if (timeLeft.isLive) {
      return (
        <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-10 pointer-events-none select-none">
          <span className="text-xs sm:text-sm font-bold text-rose-400 uppercase tracking-wider animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            🔴 En Vivo
          </span>
        </div>
      );
    }

    return (
      <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-10 pointer-events-none select-none">
        <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-sm sm:text-base md:text-lg font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] [text-shadow:_0_1px_3px_rgb(0_0_0_/_95%),_0_2px_8px_rgb(0_0_0_/_85%)]">
          <span className="text-white">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="text-white/60 font-light">:</span>
          <span className="text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-white/60 font-light">:</span>
          <span className="text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-white/60 font-light">:</span>
          <span className="text-emerald-400 animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>
    );
  };

  // Modal para compartir con previsualización fidedigna del afiche oficial
  const renderShareModal = () => {
    if (!showShareModal) return null;

    return (
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
        onClick={() => setShowShareModal(false)}
      >
        <div
          className="relative max-w-xl w-full bg-white dark:bg-[#151518] border border-gray-200 dark:border-neutral-700/80 rounded-3xl overflow-hidden shadow-2xl text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  Compartir Taller Oficial
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                  Difusión oficial • {event.title}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Cerrar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Live Preview Card with Correct Graphic Asset */}
            <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden bg-gray-50/70 dark:bg-neutral-900/60 p-3 sm:p-4 flex gap-4 items-center">
              <div className="relative w-28 sm:w-36 h-20 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-black/10 dark:border-white/10 bg-black">
                <img
                  src={eventImageUrl}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1.5 left-1.5">
                  <span className="px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[9px] font-mono text-emerald-300 font-bold">
                    Afiche HD
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {event.category || 'Taller Oficial'}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                  {event.title}
                </h4>
                <p className="text-[11px] text-gray-600 dark:text-neutral-300 font-medium">
                  {event.displayDate} • {event.time}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-mono truncate">
                  Sala Meet: {meetUrl}
                </p>
              </div>
            </div>

            {/* Share Options Grid */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Canales directos de difusión
              </div>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-gray-900 dark:text-white">Compartir por WhatsApp</div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Envío directo con enlace y detalles al chat</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Copiar Enlace Directo */}
              <button
                type="button"
                onClick={handleCopyDirectLink}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-neutral-800/60 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                    <Copy className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Copiar Enlace de Registro</div>
                    <div className="text-[11px] text-gray-500 dark:text-neutral-400">Enlace público para apartar cupo</div>
                  </div>
                </div>
                {copiedShareKey === 'link' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" /> Copiado
                  </span>
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Copiar Invitación Completa */}
              <button
                type="button"
                onClick={handleCopyFullInvitation}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-neutral-800/60 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Copiar Invitación Completa</div>
                    <div className="text-[11px] text-gray-500 dark:text-neutral-400">Incluye temario, horario, sala Meet y formulario</div>
                  </div>
                </div>
                {copiedShareKey === 'full' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" /> Copiado
                  </span>
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Compartir por Correo */}
              <button
                type="button"
                onClick={handleShareEmail}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-neutral-800/60 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Compartir por Correo</div>
                    <div className="text-[11px] text-gray-500 dark:text-neutral-400">Abre tu cliente de email con el mensaje redactado</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>

              {/* Botón nativo de compartir en móvil */}
              <button
                type="button"
                onClick={handleShareNative}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir en el dispositivo / Redes</span>
              </button>
            </div>

            {copiedShareKey && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>¡Copiado con éxito al portapapeles!</span>
              </div>
            )}
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
          className={`relative w-full rounded-3xl overflow-hidden border border-white/80 dark:border-white/10 shadow-xl bg-white/85 dark:bg-[#0D0D0E]/90 backdrop-blur-2xl text-neutral-900 dark:text-white group transition-all duration-300 ${className}`}
        >
          {/* Balanced 2-Zone Grid: Left Workshop Poster Image | Right Counter & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* 1. PRIMERO LA IMAGEN DEL AFICHE CON CONTADOR NUMÉRICO DIRECTO */}
            <div className="lg:col-span-5 relative bg-neutral-100/70 dark:bg-black/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/10">
              <div
                onClick={() => setShowImageModal(true)}
                className="relative group/poster cursor-pointer overflow-hidden rounded-2xl w-full h-full min-h-[220px] sm:min-h-[260px] max-h-[340px] flex items-center justify-center shadow-md border border-black/5 dark:border-white/10 bg-neutral-200/40 dark:bg-black/40"
                title="Clic para ver el afiche completo en alta resolución"
              >
                {/* Complete, Natural Unobscured Image */}
                <img
                  src={eventImageUrl}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover sm:object-contain object-center group-hover/poster:scale-[1.02] transition-transform duration-500"
                />

                {/* Subtle Hover Action Pill (top right so it doesn't collide with the counter) */}
                <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 group-hover/poster:bg-black/90 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium shadow-md transition-all">
                  <Maximize2 className="w-3 h-3 text-emerald-400" />
                  <span>Ampliar</span>
                </div>

                {/* CONTADOR GRÁFICO NUMÉRICO LIMPIO SOBRE LA IMAGEN */}
                {renderImageNumericCountdown()}
              </div>
            </div>

            {/* 2. LUEGO LA INFORMACIÓN Y ACCIONES */}
            <div className="lg:col-span-7 p-6 sm:p-7 md:p-8 flex flex-col justify-between space-y-5 text-left">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-black/60 backdrop-blur-md border border-emerald-500/20 dark:border-white/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
                    <span>Taller en Curso • {event.displayDate} ({event.time})</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/15 text-[11px] font-medium text-neutral-700 dark:text-gray-200">
                    Google Meet
                  </span>
                </div>

                {isAttended ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>✓ Acreditado en tu Expediente</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/15 text-neutral-600 dark:text-neutral-300 text-[11px] font-medium">
                    <span>Acceso Incluido en tu Programa</span>
                  </span>
                )}
              </div>

              {/* EXPLICACIÓN E INFORMACIÓN */}
              <div className="space-y-1.5 pt-1 border-t border-black/5 dark:border-white/10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight leading-snug">
                  {event.title}
                </h2>
                <p className="text-xs sm:text-sm font-light text-neutral-600 dark:text-gray-200 leading-relaxed max-w-xl">
                  {event.subtitle || 'Espacio interactivo de límites no dichos, mapeo de transparencia y decodificación somática en vivo con John Fredy Rengifo.'}
                </p>
              </div>

              {/* ACTION BAR: Minimalist Meet Button + Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] border border-emerald-400/30"
                  title="Iniciar e ingresar a la sala de Google Meet"
                >
                  <Video className="w-4 h-4 text-white shrink-0" />
                  <span>Unirme por Google Meet</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyMeetLink}
                  className="p-2.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-black/60 dark:hover:bg-black/80 backdrop-blur-md border border-black/10 dark:border-white/20 text-neutral-700 dark:text-white text-xs transition-colors cursor-pointer shadow-xs"
                  title="Copiar enlace de Google Meet"
                >
                  {copiedMeetNotice ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-neutral-600 dark:text-gray-200" />
                  )}
                </button>

                {onNavigateToSyllabus && (
                  <button
                    type="button"
                    onClick={onNavigateToSyllabus}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-black/10 dark:border-white/15 text-neutral-800 dark:text-white text-xs font-medium transition-colors cursor-pointer"
                    title="Ver contenidos, distinciones y marco teórico en el temario ontológico"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Ver en Temario</span>
                  </button>
                )}

                {onDownloadWorkbookPDF && (
                  <button
                    type="button"
                    onClick={onDownloadWorkbookPDF}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-800 dark:text-amber-200 text-xs font-medium transition-colors cursor-pointer"
                    title="Descargar Cuaderno y Memoria del Taller en PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                    <span>Descargar Memoria (PDF)</span>
                  </button>
                )}

                <a
                  href={event.googleFormsUrl || 'https://forms.gle/5Hiuxwq13n3gC3zt6'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
                  title="Formulario Oficial de Evaluación y Cosecha (Google Forms)"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                  <span>Evaluación Forms</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 text-neutral-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  title="Ver afiche completo en alta resolución"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Ampliar afiche</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium transition-colors cursor-pointer"
                  title="Compartir taller y afiche oficial"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Compartir</span>
                </button>

                {copiedMeetNotice && (
                  <span className="text-[11px] font-medium text-emerald-300 bg-black/70 px-3 py-1 rounded-full border border-emerald-500/30 animate-fade-in">
                    ✓ Enlace de Meet copiado
                  </span>
                )}
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
                  src={eventImageUrl}
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

        {renderShareModal()}
      </>
    );
  }

  // 2. Default Landing / Full View: Balanced layout allowing complete view of the poster graphic
  return (
    <>
      <div
        id="promotional-event-banner"
        className={`w-full rounded-3xl overflow-hidden border border-white/80 dark:border-white/10 shadow-xl bg-white/85 dark:bg-[#0D0D0E]/80 backdrop-blur-2xl text-neutral-900 dark:text-white group transition-all duration-300 ${className}`}
      >
        {/* Balanced Split Layout: Left Workshop Image | Right Counter & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* 1. PRIMERO LA IMAGEN DEL AFICHE CON CONTADOR NUMÉRICO DIRECTO */}
          <div className="lg:col-span-5 relative bg-neutral-100/70 dark:bg-black/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/10">
            <div
              onClick={() => setShowImageModal(true)}
              className="relative group/poster cursor-pointer overflow-hidden rounded-2xl w-full h-full min-h-[240px] sm:min-h-[300px] max-h-[420px] flex items-center justify-center shadow-md border border-black/5 dark:border-white/10 bg-neutral-200/40 dark:bg-black/40"
              title="Clic para ampliar y ver toda la información del afiche"
            >
              {/* Unobscured Workshop Poster Image */}
              <img
                src={eventImageUrl}
                alt={event.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover sm:object-contain object-center group-hover/poster:scale-[1.02] transition-transform duration-500"
              />

              {/* Hover Badge at top right */}
              <div className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 group-hover/poster:bg-black/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium shadow-md transition-all">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ampliar afiche</span>
              </div>

              {/* CONTADOR GRÁFICO NUMÉRICO LIMPIO SOBRE LA IMAGEN (Sin recuadros ni contenedores, solo los números) */}
              {renderImageNumericCountdown()}
            </div>
          </div>

          {/* 2. LUEGO LA INFORMACIÓN Y ACCIONES */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left">
            {/* Top Badges */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-black/60 backdrop-blur-md border border-emerald-500/20 dark:border-white/20 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300 shrink-0" />
                <span>Primer Taller en Cronograma RBC</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-white/95 border border-rose-200/60 dark:border-transparent backdrop-blur-md text-xs font-bold text-rose-950 dark:text-black shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                <span>{spotsLeft} Cupos Restantes</span>
              </div>
            </div>

            {/* INFORMACIÓN DEL EVENTO */}
            <div className="space-y-2 pt-1 border-t border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{event.displayDate} • {event.time}</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                {event.title}
              </h2>
              <p className="text-xs sm:text-sm font-light text-neutral-600 dark:text-gray-200 leading-relaxed max-w-xl">
                {event.subtitle || 'Indagación ontológica en vivo: límites no dichos, mapeo de transparencia y decodificación somática con John Rengifo.'}
              </p>
            </div>

            {/* ACTION BAR: Meet Button + Reservar Cupo + Compartir */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] border border-emerald-400/30"
                title="Iniciar en Google Meet"
              >
                <Video className="w-4 h-4 text-white shrink-0" />
                <span>Iniciar en Google Meet</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              </a>

              <button
                type="button"
                onClick={handleCopyMeetLink}
                className="p-3.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-black/60 dark:hover:bg-black/80 backdrop-blur-md border border-black/10 dark:border-white/20 text-neutral-700 dark:text-white text-xs transition-colors cursor-pointer shadow-xs"
                title="Copiar enlace directo de Meet"
              >
                {copiedMeetNotice ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-neutral-600 dark:text-gray-200" />
                )}
              </button>

              <a
                href={event.googleFormsUrl || 'https://forms.gle/5Hiuxwq13n3gC3zt6'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                title="Formulario Oficial de Evaluación y Cosecha (Google Forms)"
              >
                <ExternalLink className="w-3.5 h-3.5 text-white" />
                <span>Evaluación Forms</span>
              </a>

              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-black/10 dark:border-white/15 text-neutral-800 dark:text-white text-xs font-medium transition-colors cursor-pointer"
                title="Ver afiche completo en alta resolución"
              >
                <Maximize2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Ver afiche completo</span>
              </button>

              {onRegisterInterest && !isRegistered && (
                <button
                  type="button"
                  onClick={handleRegister}
                  className="px-5 py-2.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-black/10 dark:border-white/20 text-neutral-800 dark:text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  Reservar Cupo Gratis
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleShare}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
                title="Compartir taller y afiche oficial"
              >
                <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Compartir</span>
              </button>
            </div>

            {copiedMeetNotice && (
              <span className="text-[11px] font-medium text-emerald-300 bg-black/70 px-3 py-1 rounded-full border border-emerald-500/30 animate-fade-in inline-block w-fit">
                ✓ Enlace de Meet copiado al portapapeles
              </span>
            )}
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
                src={eventImageUrl}
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

      {renderShareModal()}
    </>
  );
};


