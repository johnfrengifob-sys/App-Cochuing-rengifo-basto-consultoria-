import React, { useState, useEffect } from 'react';
import { CronogramaEvent, User } from '../types';
import { OntologicalStore } from '../services/store';
import { LiquidGlassButton } from './LiquidGlassButton';
import { ThemeToggle } from './ThemeToggle';
import { BrandLogo } from './BrandLogo';
import {
  Calendar,
  Clock,
  Video,
  Sparkles,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Share2,
  Check,
  Flame,
  ArrowRight,
  UserCheck,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  QrCode,
  EyeOff,
  Database,
  CloudCheck,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { COMPANY_INFO } from '../services/store';

interface EventRegistrationLandingProps {
  onEnterPlatform: (user?: User) => void;
  onNavigateToLogin?: () => void;
}

export const EventRegistrationLanding: React.FC<EventRegistrationLandingProps> = ({
  onEnterPlatform,
  onNavigateToLogin,
}) => {
  const [event, setEvent] = useState<CronogramaEvent>(() =>
    OntologicalStore.getUpcomingEvent()
  );

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isAuthenticatingGoogle, setIsAuthenticatingGoogle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIcfModal, setShowIcfModal] = useState(false);
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);

  // Success / Confirmed Pass State
  const [confirmedRegistration, setConfirmedRegistration] = useState<{
    ticketCode: string;
    user: User;
    registeredAt: string;
  } | null>(null);

  const [copiedCalendar, setCopiedCalendar] = useState(false);
  const [copiedMeet, setCopiedMeet] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live countdown timer
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

  // One-click Google Quick Fill & Auth Simulation
  const handleGoogleQuickAuth = () => {
    setIsAuthenticatingGoogle(true);
    setTimeout(() => {
      setName('Carlos Mendoza');
      setEmail('carlos.mendoza@innovatech.co');
      setPhone('+57 310 892 3411');
      setAcceptedTerms(true);
      setIsAuthenticatingGoogle(false);
    }, 600);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert('Por favor completa todos los campos requeridos para reservar tu cupo.');
      return;
    }
    if (!acceptedTerms) {
      alert('Debes aceptar los términos de confidencialidad ICF y privacidad para continuar.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = OntologicalStore.registerForEvent({
        eventId: event.id,
        name,
        email,
        phone,
        googleAuthConnected: true,
      });

      setConfirmedRegistration({
        ticketCode: result.registration.ticketCode,
        user: result.user,
        registeredAt: result.registration.registeredAt,
      });
      setIsSubmitting(false);
    }, 500);
  };

  // Google Calendar URL Generator
  const generateGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`${event.title} - Rengifo Basto Ontología`);
    const details = encodeURIComponent(
      `${event.subtitle}\n\nFacilitador: ${event.facilitator}\nEnlace Meet: ${event.meetUrl || 'https://meet.google.com/rbc-conversatorio-vivo'}\n\n*Recuerda que tus datos y participaciones están protegidos bajo estándares de estricta confidencialidad ICF y privacidad de Google Workspace & Gemini.*`
    );
    const location = encodeURIComponent(event.meetUrl || 'Google Meet Online');
    // Start date formatted for Google Calendar
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  const handleCopyMeet = () => {
    const link = event.meetUrl || 'https://meet.google.com/rbc-conversatorio-vivo';
    navigator.clipboard.writeText(link);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2500);
  };

  const handleCopyShareableLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0E] text-black dark:text-neutral-100 flex flex-col justify-between selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200">
      {/* Top Header / Bar */}
      <header className="w-full border-b border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-[#0D0D0E]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo
              size="sm"
              onClick={onNavigateToLogin || (() => onEnterPlatform())}
              className="transition-transform active:scale-95"
            />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="button" />
            {onNavigateToLogin && (
              <button
                onClick={onNavigateToLogin}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 text-xs text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-neutral-600 transition-all cursor-pointer font-medium"
              >
                <span>Ya tengo cuenta</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {!confirmedRegistration ? (
          <div className="space-y-10">
            {/* Minimalist Top Headline */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[11px] font-medium text-black dark:text-white">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Reserva Inmediata • Acceso al Primer Seminario</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-black dark:text-white leading-tight">
                Inscripción & Pase Directo
              </h1>
              <p className="text-xs sm:text-sm font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                Aparta tu lugar para el próximo conversatorio ontológico. Al finalizar la primera sesión en vivo, este mismo enlace activará tu acceso a la plataforma y a tu diagnóstico personalizado.
              </p>
            </div>

            {/* Event Showcase & Registration Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Event Banner & Live Countdown */}
              <div className="lg:col-span-6 bg-white dark:bg-[#18181B] rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-[0_10px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col">
                <div className="relative bg-black overflow-hidden group flex flex-col items-center justify-center border-b border-gray-100 dark:border-neutral-800">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-[280px] object-contain opacity-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
                    <span className="pointer-events-auto px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-medium text-white">
                      {event.category}
                    </span>
                    <span className="pointer-events-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-semibold text-black">
                      <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                      {event.spotsLeft} Cupos Disponibles
                    </span>
                  </div>
                </div>

                {/* Event Key Facts */}
                <div className="p-5 sm:p-6 space-y-5 bg-white dark:bg-[#18181B]">
                  {/* Countdown Timer */}
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500 block">
                      El Conversatorio Inicia En:
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center text-black dark:text-white">
                      <div className="p-2 rounded-xl bg-white dark:bg-[#151518] border border-gray-200/60 dark:border-neutral-700 shadow-2xs">
                        <span className="block text-sm sm:text-base font-bold font-mono">{timeLeft.days}</span>
                        <span className="text-[9px] text-gray-400 uppercase">Días</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-[#151518] border border-gray-200/60 dark:border-neutral-700 shadow-2xs">
                        <span className="block text-sm sm:text-base font-bold font-mono">{timeLeft.hours}</span>
                        <span className="text-[9px] text-gray-400 uppercase">Horas</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-[#151518] border border-gray-200/60 dark:border-neutral-700 shadow-2xs">
                        <span className="block text-sm sm:text-base font-bold font-mono">{timeLeft.minutes}</span>
                        <span className="text-[9px] text-gray-400 uppercase">Min</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-[#151518] border border-gray-200/60 dark:border-neutral-700 shadow-2xs">
                        <span className="block text-sm sm:text-base font-bold font-mono">{timeLeft.seconds}</span>
                        <span className="text-[9px] text-gray-400 uppercase">Seg</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Points */}
                  <div className="space-y-2.5 text-xs text-gray-600 dark:text-neutral-300">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-black dark:text-white shrink-0" />
                      <span><strong>Fecha:</strong> {event.displayDate} ({event.time})</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Video className="w-4 h-4 text-black dark:text-white shrink-0" />
                      <span><strong>Modalidad:</strong> Google Meet Privado & Interactivo</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-black dark:text-white shrink-0" />
                      <span><strong>Facilitador:</strong> {event.facilitator} (Master Coach ICF)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: 2-Step Registration Form */}
              <div className="lg:col-span-6 bg-[#F9F9F9] dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 border border-gray-200/70 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-neutral-800 pb-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                      Paso 1 de 2
                    </span>
                    <h2 className="text-lg font-semibold text-black dark:text-white tracking-tight">
                      Registro de Participante
                    </h2>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium">
                    Sin Costo
                  </span>
                </div>

                {/* Google 1-Click Fast Connect */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleQuickAuth}
                    disabled={isAuthenticatingGoogle}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#27272D] transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
                  >
                    {isAuthenticatingGoogle ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-black dark:border-white border-t-transparent" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Autocompletar con Cuenta de Google</span>
                  </button>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-neutral-500 justify-center">
                    <span className="h-px bg-gray-200 dark:bg-neutral-800 flex-1" />
                    <span>O diligencia tus datos manualmente</span>
                    <span className="h-px bg-gray-200 dark:bg-neutral-800 flex-1" />
                  </div>
                </div>

                <form onSubmit={handleSubmitRegistration} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-white mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Carlos Mendoza"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-white mb-1">
                        Correo Electrónico (Google) *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-white mb-1">
                        WhatsApp (Para Recordatorio) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+57 300 000 0000"
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  {/* Step 2: Ethical ICF & Privacy Agreement Card */}
                  <div className="pt-2">
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#202024] border border-gray-200/80 dark:border-neutral-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Compromiso de Ética ICF & Privacidad Google Cloud</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
                          className="text-[10px] text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-0.5 cursor-pointer"
                        >
                          {showPrivacyDetails ? (
                            <>
                              Menos detalles <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              Ver detalle <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Editorial Accordion of Terms */}
                      <div className="text-[11px] text-gray-600 dark:text-neutral-400 space-y-2 font-light leading-relaxed">
                        <p>
                          <strong className="font-semibold text-black dark:text-white">1. Confidencialidad & Soberanía ICF:</strong> Conforme al Código de Ética de la <em>International Coaching Federation (ICF)</em>, toda conversación y reflexión compartida goza de estricta reserva profesional. Tú eres el único dueño de tu proceso: <strong>compartes exclusivamente lo que libremente decidas compartir</strong>; jamás habrá coerción o exposición obligatoria.
                        </p>

                        {showPrivacyDetails && (
                          <div className="pt-2 border-t border-gray-100 dark:border-neutral-700/60 space-y-2 animate-fade-in text-[10px]">
                            <p>
                              <strong className="font-semibold text-black dark:text-white">2. Privacidad Blindada en Google Workspace & Gemini:</strong> El acompañamiento con IA opera dentro de una infraestructura empresarial hermética protegida por Google Cloud. Tus datos personales y diagnósticos somáticos <strong>no se comparten con terceros ni se utilizan para entrenar modelos públicos</strong>. Nadie ajeno a la consultoría tiene acceso a tu información.
                            </p>
                            <p>
                              <strong className="font-semibold text-black dark:text-white">3. Activación Tras Asistencia:</strong> Este mismo registro te servirá como credencial de acceso permanente a la plataforma una vez confirmada tu asistencia al conversatorio.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Checkbox */}
                      <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-black border-gray-300 focus:ring-black dark:bg-[#151518] dark:border-neutral-700 cursor-pointer"
                        />
                        <span className="text-[11px] font-medium text-black dark:text-white leading-tight">
                          He leído y acepto el Marco Ético ICF de confidencialidad, la soberanía sobre mis aportes y la política de privacidad de datos bajo estándares Google Workspace & Gemini.
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <LiquidGlassButton
                    type="submit"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    className="w-full py-3.5 text-sm font-semibold"
                    icon={<CheckCircle2 className="w-4 h-4 mr-1.5" />}
                  >
                    Confirmar Reserva & Generar Pase Digital
                  </LiquidGlassButton>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* STEP 3 / CONFIRMED PASS STATE (TICKET DIGITAL VIP)                        */
          /* ========================================================================= */
          <div className="max-w-2xl mx-auto w-full space-y-8 animate-fade-in">
            {/* Minimalist Success Banner */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black dark:text-white">
                ¡Tu Cupo Está Confirmado!
              </h2>
              <p className="text-xs sm:text-sm font-light text-gray-500 dark:text-neutral-400 max-w-md mx-auto">
                Hemos reservado tu lugar para el <strong>{event.title}</strong>. Guarda este pase digital en tu calendario.
              </p>
            </div>

            {/* Visual Digital VIP Ticket Card */}
            <div className="bg-white dark:bg-[#18181B] rounded-3xl border border-gray-200 dark:border-neutral-700 shadow-xl overflow-hidden relative">
              {/* Top Accent Band */}
              <div className="bg-black dark:bg-[#242428] text-white p-6 sm:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] uppercase font-semibold tracking-widest text-white/90">
                    Pase de Acceso Oficial
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
                    {event.title}
                  </h3>
                  <div className="text-xs text-gray-300 font-light flex items-center gap-2">
                    <span>{event.displayDate}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-white/10 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto">
                  <span className="text-[10px] uppercase tracking-wider text-gray-300 block">
                    Código de Ticket
                  </span>
                  <span className="text-sm font-mono font-bold tracking-wider text-white">
                    {confirmedRegistration.ticketCode}
                  </span>
                </div>
              </div>

              {/* Perforated Divider Visual */}
              <div className="relative flex items-center justify-between px-4 py-1 bg-gray-50 dark:bg-[#151518] border-y border-dashed border-gray-200 dark:border-neutral-800">
                <div className="w-4 h-4 rounded-full bg-white dark:bg-[#0D0D0E] -ml-6 border-r border-gray-200 dark:border-neutral-700" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                  RBC • Ontología del Lenguaje • ICF Ethical Standards
                </span>
                <div className="w-4 h-4 rounded-full bg-white dark:bg-[#0D0D0E] -mr-6 border-l border-gray-200 dark:border-neutral-700" />
              </div>

              {/* Ticket Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-neutral-500 block">
                      Participante
                    </span>
                    <span className="font-semibold text-black dark:text-white text-sm">
                      {name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-neutral-500 block">
                      Correo Registrado
                    </span>
                    <span className="font-medium text-black dark:text-white truncate block">
                      {email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-neutral-500 block">
                      Estado de Acceso
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      <Clock className="w-3 h-3" />
                      Pre-Registrado (Asistencia Pendiente)
                    </span>
                  </div>
                </div>

                {/* Clear Instruction Encapsulation */}
                <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200/70 dark:border-neutral-800 space-y-2 text-xs">
                  <div className="font-semibold text-black dark:text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-black dark:text-white" />
                    ¿Cómo ingresarás a la plataforma ontológica?
                  </div>
                  <p className="text-[11px] font-light text-gray-600 dark:text-neutral-300 leading-relaxed">
                    Este mismo enlace es tu llave de acceso. <strong>Durante y al finalizar la primera conferencia en vivo</strong>, confirmaremos tu asistencia presencial o virtual. En ese momento, tu cuenta quedará activada y este link te llevará directamente a tu panel con tu <strong>Matriz de Quiebres y Diagnóstico con IA</strong>.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Google Calendar Add */}
                  <a
                    href={generateGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xs cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Añadir a Google Calendar</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  {/* Copy Meet Link */}
                  <button
                    type="button"
                    onClick={handleCopyMeet}
                    className="py-3 px-4 rounded-2xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium text-xs flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-[#27272D] transition-all cursor-pointer"
                  >
                    {copiedMeet ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>¡Enlace Meet Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-3.5 h-3.5" />
                        <span>Copiar Enlace de Google Meet</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Share Link Button */}
                <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 text-[11px] text-gray-500 dark:text-neutral-400">
                  <button
                    onClick={handleCopyShareableLink}
                    className="inline-flex items-center gap-1 text-black dark:text-white hover:underline cursor-pointer font-medium"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Enlace guardado en portapapeles
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3 h-3" /> Copiar mi enlace de acceso directo
                      </>
                    )}
                  </button>

                  {/* Instant Sandbox / Simulation Trigger to Enter Platform */}
                  <button
                    onClick={() => {
                      // Confirm attendance and enter platform
                      OntologicalStore.confirmEventAttendance(confirmedRegistration.ticketCode);
                      onEnterPlatform(confirmedRegistration.user);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Simular Asistencia en Vivo & Entrar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Subtle Centered Footer */}
      <footer className="w-full border-t border-gray-100 dark:border-neutral-800 py-8 px-4 text-center text-xs font-light text-gray-400 dark:text-neutral-500">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-5">
          {/* Contact Strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-600 dark:text-neutral-300">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>{COMPANY_INFO.address}, Bogotá, Colombia</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cel: {COMPANY_INFO.phone}</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{COMPANY_INFO.email}</span>
            </span>
          </div>

          {/* Copyright Line */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-500 dark:text-neutral-400 text-xs">
            <span>© 2026 Rengifo Basto Consultoría Ontológica. Todos los derechos reservados.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-neutral-500">
              <CloudCheck className="w-3.5 h-3.5 text-black dark:text-white" />
              Infraestructura Privada Google Cloud & Gemini Enterprise
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
