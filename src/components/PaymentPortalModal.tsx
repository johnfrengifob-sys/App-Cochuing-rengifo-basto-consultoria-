import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Sparkles,
  CreditCard,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  Clock,
  BookOpen,
  Banknote,
  Send,
  AlertCircle,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Calendar,
  HeartHandshake,
  Check,
  UserCheck,
  Receipt,
} from 'lucide-react';
import { User, ProgramNodeInfo, EventRegistration } from '../types';
import { OntologicalStore, COMPANY_INFO, BRE_B_NU_CONFIG } from '../services/store';
import { BreBNuPaymentCard } from './BreBNuPaymentCard';

interface PaymentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: User;
  onUserUpdated?: () => void;
  initialTab?: 'overview' | 'all' | 'workshops' | 'sessions';
}

interface WorkshopItem {
  id: string;
  step: number;
  code: string;
  title: string;
  subtitle: string;
  photoUrl: string;
  dateStr: string;
  priceAmount: number;
  priceFormatted: string;
  focus: string;
}

const WORKSHOPS_CATALOG: WorkshopItem[] = [
  {
    id: 'taller-1-raiz',
    step: 1,
    code: 'ESTACIÓN 01',
    title: 'Taller I: Raíz – Deconstrucción Somática & Sabiduría Emocional',
    subtitle: 'Reconocer la raíz corporal, mapeo de la transparencia y decodificación de límites.',
    photoUrl:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
    dateStr: 'Sábado, 12 de Septiembre de 2026 • 7:00 PM',
    priceAmount: 180000,
    priceFormatted: '$180.000 COP',
    focus: 'El cuerpo como testigo ontológico y proclamación del "Basta" como acto de soberanía.',
  },
  {
    id: 'taller-2-tallo',
    step: 2,
    code: 'ESTACIÓN 02',
    title: 'Taller II: Tallo – Lenguaje, Juicios & Reencuadre',
    subtitle: 'Deconstrucción de narrativas limitantes, actos lingüísticos y diseño de conversaciones.',
    photoUrl:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
    dateStr: 'Sábado, 19 de Septiembre de 2026 • 7:00 PM',
    priceAmount: 180000,
    priceFormatted: '$180.000 COP',
    focus: 'El lenguaje como creador de realidades: disolver juicios maestros y pactar pedidos claros.',
  },
  {
    id: 'taller-3-florecimiento',
    step: 3,
    code: 'ESTACIÓN 03',
    title: 'Taller III: Florecimiento – Acción, Propósito & Coherencia',
    subtitle: 'Encarnar la transformación: mapa de decisiones conscientes y acuerdos innegociables.',
    photoUrl:
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80',
    dateStr: 'Sábado, 26 de Septiembre de 2026 • 7:00 PM',
    priceAmount: 180000,
    priceFormatted: '$180.000 COP',
    focus: 'Integración tridimensional (Cuerpo, Emoción, Lenguaje) al servicio de un propósito trascendente.',
  },
];

export const PaymentPortalModal: React.FC<PaymentPortalModalProps> = ({
  isOpen,
  onClose,
  client,
  onUserUpdated,
  initialTab = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'all' | 'workshops' | 'sessions'>(initialTab);
  const [currentUser, setCurrentUser] = useState<User>(client);
  const [selectedWorkshopForPayment, setSelectedWorkshopForPayment] = useState<WorkshopItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bre_b_nu' | 'efectivo' | 'online_card'>('bre_b_nu');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(
    null
  );

  // 1-on-1 payment checkout modal state
  const [isOneOnOneCheckoutOpen, setIsOneOnOneCheckoutOpen] = useState(false);
  const [oneOnOnePlan, setOneOnOnePlan] = useState<'full' | 'half'>('full');

  // Reload client data
  const refreshLocalClient = () => {
    const fresh = OntologicalStore.getUsers().find((u) => u.uid === client.uid);
    if (fresh) {
      setCurrentUser(fresh);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshLocalClient();
      setFeedbackMessage(null);
    }
  }, [isOpen, client.uid]);

  if (!isOpen) return null;

  // Check if a workshop is enrolled or completed
  const isWorkshopEnrolled = (workshopId: string) => {
    return (
      Boolean(currentUser.enrolledWorkshopIds?.includes(workshopId)) ||
      Boolean(currentUser.completedWorkshopIds?.includes(workshopId)) ||
      OntologicalStore.getEventRegistrations().some(
        (r) => r.eventId === workshopId && (r.userUid === currentUser.uid || r.email.toLowerCase() === currentUser.email.toLowerCase())
      )
    );
  };

  const isFreeAccess = currentUser.programAccessLevel === 'free';
  const isAuthorized1on1 = Boolean(currentUser.authorizedForOneOnOne);
  const hasPurchased1on1 = Boolean(currentUser.oneOnOnePackagePurchased);

  // Métricas del participante para organización lógica del progreso
  const clientPayments = OntologicalStore.getPaymentRequestsForClient(currentUser.uid);
  const clientSessions = OntologicalStore.getSessionsForClient(currentUser.uid);
  const clientForms = OntologicalStore.getPostSessionFormsForClient(currentUser.uid);
  const completedSessions = clientSessions.filter((s) => s.status === 'completed');
  const currentSessionNumber = currentUser.programProgress || 1;
  const currentCycle = Math.ceil(currentSessionNumber / 4);
  const isCycleMilestone =
    currentSessionNumber === 4 || currentSessionNumber === 8 || currentSessionNumber === 12;
  const enrolledWorkshopsCount = WORKSHOPS_CATALOG.filter((w) => isWorkshopEnrolled(w.id)).length;
  const cyclePhaseLabel = isCycleMilestone
    ? 'Fase de Consolidación • Cierre de Ciclo'
    : 'Fase de Exploración Libre';
  const remainingInCycle = 4 - ((currentSessionNumber - 1) % 4);

  // Handler: Direct Free Workshop Confirmation
  const handleConfirmFreeWorkshop = (workshop: WorkshopItem) => {
    setIsProcessing(true);
    setFeedbackMessage(null);
    try {
      const result = OntologicalStore.enrollUserInWorkshop(currentUser.uid, workshop.id, true);
      if (result.user) {
        setCurrentUser(result.user);
      }
      onUserUpdated?.();
      setFeedbackMessage({
        type: 'success',
        text: `¡Tu lugar en "${workshop.title}" ha sido confirmado! La estación ya se encuentra encendida en Tu Camino de Transformación.`,
      });
    } catch (err) {
      console.error(err);
      setFeedbackMessage({
        type: 'error',
        text: 'Ocurrió un inconveniente al asegurar tu lugar. Por favor intenta de nuevo o escríbenos.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Paid Workshop Registration / Submission
  const handleConfirmPaidWorkshop = (workshop: WorkshopItem) => {
    setIsProcessing(true);
    setFeedbackMessage(null);
    try {
      if (paymentMethod === 'online_card') {
        // Instant simulated card authorization
        const result = OntologicalStore.enrollUserInWorkshop(currentUser.uid, workshop.id, true);
        if (result.user) setCurrentUser(result.user);
        onUserUpdated?.();
        setSelectedWorkshopForPayment(null);
        setFeedbackMessage({
          type: 'success',
          text: `Inversión recibida con éxito para "${workshop.title}". Tu lugar está asegurado y la estación ha sido encendida en tu mapa.`,
        });
      } else {
        // Register payment request + pending enrollment
        OntologicalStore.submitPaymentRequest({
          clientId: currentUser.uid,
          clientName: currentUser.name,
          clientEmail: currentUser.email,
          clientPhone: currentUser.phone || COMPANY_INFO.phone,
          amount: workshop.priceFormatted,
          concept: `Inscripción Taller: ${workshop.title}`,
          targetStep: workshop.step,
          planType: 'level',
          method: paymentMethod,
          notes: `Inversión registrada para ${workshop.title} mediante ${paymentMethod === 'bre_b_nu' ? 'Bre-B Nu' : 'Efectivo en Sesión'}.`,
        });
        const result = OntologicalStore.enrollUserInWorkshop(currentUser.uid, workshop.id, false);
        if (result.user) setCurrentUser(result.user);
        onUserUpdated?.();
        setSelectedWorkshopForPayment(null);
        setFeedbackMessage({
          type: 'info',
          text: `Comprobante de inversión registrado para "${workshop.title}". En cuanto el consultor confirme la validación, tu estación se encenderá automáticamente.`,
        });
      }
    } catch (err) {
      console.error(err);
      setFeedbackMessage({
        type: 'error',
        text: 'No fue posible registrar tu inversión. Por favor comunícate a nuestro WhatsApp de soporte.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Confirm 1-on-1 Package
  const handleConfirmOneOnOnePackage = () => {
    setIsProcessing(true);
    setFeedbackMessage(null);
    try {
      const amount = oneOnOnePlan === 'full' ? '$1.500.000 COP' : '$750.000 COP (Cuota 1 de 2)';
      const result = OntologicalStore.purchaseOneOnOnePackage(
        currentUser.uid,
        paymentMethod,
        amount,
        `Adquisición de proceso individual de 12 sesiones vía ${paymentMethod}. Plan: ${oneOnOnePlan === 'full' ? 'Pago Único' : 'Cuota 1 de 2'}.`
      );

      if (result.user) {
        setCurrentUser(result.user);
      }
      onUserUpdated?.();
      setIsOneOnOneCheckoutOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: '¡Tu viaje de 12 sesiones individuales ha comenzado! Todos los nodos y cuadernos de trabajo han sido activados en tu panel.',
      });
    } catch (err) {
      console.error(err);
      setFeedbackMessage({
        type: 'error',
        text: 'Ocurrió un error al procesar tu inscripción. Por favor intenta de nuevo o escríbenos directamente.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#121214] text-black dark:text-white border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* 1. HEADER: MINIMALISMO B&W, LENGUAJE HUMANO Y SUTIL */}
        {/* ========================================================================= */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#121214]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-[11px] font-semibold tracking-wider uppercase text-black dark:text-white">
              <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>Portal de Pagos • Inversión en tu Proceso</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-black dark:text-white">
              Pasos en tu camino de transformación
            </h2>
            <p className="text-xs sm:text-sm font-light text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
              Selecciona los talleres vivenciales o el ciclo individual de acompañamiento ontológico para asegurar tu lugar e iluminar tus próximas estaciones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* User access pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/15 dark:border-white/20 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
              <span>
                {isFreeAccess ? 'Acceso Libre / Beca' : 'Acceso Estándar'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white cursor-pointer"
              aria-label="Cerrar Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {feedbackMessage && (
          <div
            className={`px-6 py-3 text-xs font-medium flex items-center gap-2.5 border-b ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                : feedbackMessage.type === 'info'
                ? 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-neutral-300 dark:border-neutral-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* NOTIFICACIÓN MINIMALISTA: "TU ESPACIO PARA EL PROCESO INDIVIDUAL ESTÁ LISTO" */}
        {/* ========================================================================= */}
        {isAuthorized1on1 && !hasPurchased1on1 && (
          <div className="mx-6 sm:mx-8 mt-5 p-4 rounded-2xl bg-neutral-100 dark:bg-[#1a1a1e] border border-black/15 dark:border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center gap-3">
              <span className="p-2 rounded-xl bg-black text-white dark:bg-white dark:text-black shrink-0">
                <UserCheck className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-black dark:text-white">
                  Tu espacio para el proceso individual está listo
                </h4>
                <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                  El facilitador John Fredy Rengifo Basto ha aprobado tu postulación al ciclo quincenal de 12 sesiones 1 a 1.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('sessions');
                setIsOneOnOneCheckoutOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <span>Asegura tu lugar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* NAVIGATION TABS (B&W CONTRAST) */}
        <div className="px-6 sm:px-8 pt-4 pb-2 flex items-center gap-2 border-b border-black/5 dark:border-white/5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-900'
            }`}
          >
            Estado & Progreso
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-900'
            }`}
          >
            Todos los Pasos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workshops')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'workshops'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-900'
            }`}
          >
            Talleres Vivenciales (3)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sessions'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-900'
            }`}
          >
            <span>Sesiones 1 a 1</span>
            {isAuthorized1on1 ? (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-emerald-500 text-white font-bold">
                Autorizado
              </span>
            ) : (
              <Lock className="w-3 h-3 text-neutral-400" />
            )}
          </button>
        </div>

        {/* BODY SCROLLABLE AREA */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* ========================================================================= */}
          {/* SECCIÓN 0: ORGANIZACIÓN LÓGICA DEL PROGRESO (5 COMPONENTES CLAVE)         */}
          {/* ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'overview') && (
            <div className="space-y-6 pb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-black dark:text-white" />
                  <h3 className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wider font-mono">
                    Organización Lógica de tu Progreso
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light">
                  Total visibilidad de tu ruta ontológica, inversiones realizadas y próximos pasos en un solo vistazo.
                </p>
              </div>

              {/* LAS 5 PREGUNTAS Y COMPONENTES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. ¿En qué punto del proceso está? */}
                <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-black/15 dark:border-white/15 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                    1. ¿En qué punto del proceso estás?
                  </span>
                  <div className="font-semibold text-sm text-black dark:text-white">
                    Ciclo {currentCycle} de 3 • Encuentro {currentSessionNumber} de 12
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    Te encuentras transitando la <strong>{cyclePhaseLabel}</strong>. Has activado {completedSessions.length} de 12 estaciones de tu ruta individual y {enrolledWorkshopsCount} de 3 talleres vivenciales.
                  </p>
                </div>

                {/* 2. ¿Qué ha trabajado hasta ahora? */}
                <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-black/15 dark:border-white/15 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                    2. ¿Qué has trabajado hasta ahora?
                  </span>
                  <div className="font-semibold text-sm text-black dark:text-white">
                    {completedSessions.length} sesión(es) completada(s) & {clientForms.length} bitácora(s)
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    {completedSessions.length > 0
                      ? `Has completado ${completedSessions.length} encuentro(s) con acuerdos y quiebres registrados. Memorias disponibles para descarga en PDF.`
                      : 'Estás iniciando tu primer encuentro. A medida que concluyan tus sesiones, tus reflexiones se consolidarán aquí.'}
                  </p>
                </div>

                {/* 3. ¿Qué le falta por recorrer? */}
                <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-black/15 dark:border-white/15 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                    3. ¿Qué te falta por recorrer?
                  </span>
                  <div className="font-semibold text-sm text-black dark:text-white">
                    {remainingInCycle === 0
                      ? '★ Sesión de Cierre y Cosecha de Ciclo'
                      : `${remainingInCycle} encuentro(s) para la Cosecha del Ciclo ${currentCycle}`}
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    Cada 4 encuentros se consolida la siembra. Te restan {12 - completedSessions.length} sesiones para culminar el programa maestro de 12 encuentros.
                  </p>
                </div>

                {/* 4. ¿Qué inversiones financieras ha hecho? */}
                <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-black/15 dark:border-white/15 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                    4. ¿Qué inversiones financieras has hecho?
                  </span>
                  <div className="font-semibold text-sm text-black dark:text-white">
                    {clientPayments.length > 0
                      ? `${clientPayments.length} transacción(es) registrada(s)`
                      : isFreeAccess
                      ? 'Acceso Libre / Beca de Formación'
                      : 'Historial en apertura'}
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    {hasPurchased1on1
                      ? 'Acompañamiento individual de 12 sesiones activo en tu perfil.'
                      : isAuthorized1on1
                      ? 'Cupo de 12 sesiones autorizado por John Fredy Rengifo Basto. Listo para confirmar abono.'
                      : 'Postulación a sesiones individuales en proceso de valoración.'}
                  </p>
                </div>
              </div>

              {/* 5. ¿Qué falta de su progreso? (Desglose transparente) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-black border-2 border-black dark:border-white space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                    5. ¿Qué falta de tu progreso para completar tu maestría personal?
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white self-start sm:self-auto">
                    {12 - completedSessions.length} sesiones pendientes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 space-y-1">
                    <span className="text-neutral-500 font-mono text-[10px] uppercase block">Sesiones 1 a 1</span>
                    <p className="font-semibold text-black dark:text-white">
                      {12 - completedSessions.length} de 12 por cursar
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 space-y-1">
                    <span className="text-neutral-500 font-mono text-[10px] uppercase block">Talleres Vivenciales</span>
                    <p className="font-semibold text-black dark:text-white">
                      {3 - enrolledWorkshopsCount} taller(es) por asegurar
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 space-y-1">
                    <span className="text-neutral-500 font-mono text-[10px] uppercase block">Estado de Inversión</span>
                    <p className="font-semibold text-black dark:text-white">
                      {isFreeAccess ? 'Acceso Libre' : hasPurchased1on1 ? 'Programa Asegurado' : 'Abono Pendiente'}
                    </p>
                  </div>
                </div>

                {activeTab === 'overview' && (
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('workshops')}
                      className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <span>Explorar Talleres Vivenciales</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('sessions')}
                      className="px-4 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Ver Acompañamiento 1 a 1</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* DETALLE DE HISTORIAL DE PAGOS Y ESTADO DE INVERSIÓN */}
              <div className="p-5 rounded-2xl bg-neutral-50/90 dark:bg-neutral-900/70 border border-black/15 dark:border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-black dark:text-white" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-black dark:text-white font-mono">
                      Historial de Inversiones y Transacciones Realizadas
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {clientPayments.length} registro(s)
                  </span>
                </div>

                {clientPayments.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-400 font-light space-y-1">
                    <p className="font-medium text-black dark:text-white">
                      {isFreeAccess ? 'Acceso Libre / Beca Institucional Activa' : 'No se registran transacciones previas en tu cuenta.'}
                    </p>
                    <p className="text-[11px]">
                      Tus pagos confirmados a través de Bre-B Nu, tarjeta en línea o consignación se reflejan inmediatamente en este libro contable con su respectivo identificador de verificación.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {clientPayments.map((pmt) => {
                      const isApproved = pmt.status === 'approved';
                      return (
                        <div
                          key={pmt.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-black dark:text-white">
                                {pmt.concept || pmt.notes || 'Inversión en Acompañamiento Ontológico'}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium ${
                                  isApproved
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                }`}
                              >
                                {isApproved ? 'Validado & Acreditado' : 'En Verificación'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 font-mono">
                              <span>Fecha: {new Date(pmt.createdAt).toLocaleDateString('es-ES')}</span>
                              <span>•</span>
                              <span>Método: {pmt.method === 'bre_b_nu' ? 'Bre-B Nu (Llave)' : pmt.method === 'online_card' ? 'Tarjeta En Línea' : 'Transferencia Directa'}</span>
                              <span>•</span>
                              <span>Ref: {pmt.id}</span>
                            </div>
                          </div>

                          <div className="text-right self-start sm:self-auto shrink-0">
                            <div className="font-bold text-sm text-black dark:text-white font-mono">
                              {pmt.amount.toString().includes('COP')
                                ? pmt.amount
                                : `$${Number(pmt.amount || 0).toLocaleString()} COP`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* PRÓXIMAS INVERSIONES / PAGOS PENDIENTES SEGÚN RUTA */}
                <div className="pt-3 border-t border-black/10 dark:border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block mb-2">
                    Próximas Inversiones o Desbloqueos en tu Ruta
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 space-y-1">
                      <div className="font-semibold text-black dark:text-white flex items-center justify-between">
                        <span>Ciclo Individual 1 a 1</span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {hasPurchased1on1 ? 'Completado' : isAuthorized1on1 ? 'Cupo Aprobado' : 'Requiere Autorización'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                        {hasPurchased1on1
                          ? 'Has asegurado el paquete completo de 12 encuentros quincenales.'
                          : isAuthorized1on1
                          ? 'Postulación aprobada por el facilitador. Puedes asegurar tu cupo mediante Pago Único ($1.400.000 COP) o 2 Cuotas ($750.000 COP).'
                          : 'Para desbloquear las 12 sesiones quincenales, se requiere valoración y autorización previa de John Fredy Rengifo Basto.'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 space-y-1">
                      <div className="font-semibold text-black dark:text-white flex items-center justify-between">
                        <span>Talleres Vivenciales (3 Hitos)</span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {enrolledWorkshopsCount}/3 Asegurados
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                        {isFreeAccess
                          ? 'Cuentas con pase libre institucional para todos los talleres vivenciales.'
                          : `${3 - enrolledWorkshopsCount} taller(es) vivencial(es) disponible(s) para inscripción ($180.000 COP cada uno).`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ========================================================================= */}
          {/* SECCIÓN 1: TALLERES VIVENCIALES (ACCESO DINÁMICO: GRATUITO O PAGO) */}
          {/* ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'workshops') && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-black dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-black dark:text-white" />
                    <span>Talleres Vivenciales: Trilogía Raíz y Balance</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light">
                    {isFreeAccess
                      ? 'Tu programa cuenta con Acceso Libre. Puedes confirmar tu participación directamente sin pasarela de pago.'
                      : 'Espacios de inmersión grupal y deconstrucción somática con cupo limitado.'}
                  </p>
                </div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500">
                  {isFreeAccess ? 'Acceso Libre' : 'Inversión: $180.000 COP / Taller'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {WORKSHOPS_CATALOG.map((workshop) => {
                  const enrolled = isWorkshopEnrolled(workshop.id);

                  return (
                    <div
                      key={workshop.id}
                      className="group flex flex-col rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-neutral-50 dark:bg-[#18181b] transition-all hover:border-black/30 dark:hover:border-white/30 shadow-xs"
                    >
                      {/* FOTOGRAFÍA A COLOR VIBRANTE (Único elemento con color cromático) */}
                      <div className="relative h-40 overflow-hidden shrink-0">
                        <img
                          src={workshop.photoUrl}
                          alt={workshop.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-black/70 backdrop-blur-md text-white uppercase border border-white/20">
                          {workshop.code}
                        </span>
                        {enrolled && (
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-black flex items-center gap-1 shadow-xs">
                            <Check className="w-3 h-3" />
                            <span>Confirmado</span>
                          </span>
                        )}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                          <span className="text-[10px] text-white/80 block">{workshop.dateStr}</span>
                          <h4 className="text-xs font-semibold leading-tight line-clamp-1">
                            {workshop.title}
                          </h4>
                        </div>
                      </div>

                      {/* CONTENIDO EN BLANCO Y NEGRO */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                          {workshop.subtitle}
                        </p>

                        <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-500 dark:text-neutral-400 font-light">
                              Inversión en tu proceso:
                            </span>
                            <span className="font-semibold text-black dark:text-white">
                              {isFreeAccess ? 'Acceso Libre' : workshop.priceFormatted}
                            </span>
                          </div>

                          {enrolled ? (
                            <div className="w-full py-2 px-3 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Lugar asegurado</span>
                            </div>
                          ) : isFreeAccess ? (
                            /* FLUJO GRATUITO: BOTÓN DIRECTO SIN PASARELA */
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleConfirmFreeWorkshop(workshop)}
                              className="w-full py-2.5 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <span>Confirmar mi participación</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            /* FLUJO PAGO: ABRE OPCIONES DE INVERSIÓN */
                            <button
                              type="button"
                              onClick={() => setSelectedWorkshopForPayment(workshop)}
                              className="w-full py-2.5 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <span>Asegura tu lugar</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECCIÓN 2: SESIONES 1 A 1 (PAQUETE DE 12) - AUTORIZACIÓN PREVIA */}
          {/* ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'sessions') && (
            <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-black dark:text-white flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-black dark:text-white" />
                    <span>Acompañamiento Individual 1 a 1: Ciclo Maestro de 12 Sesiones</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light">
                    Consultoría ontológica directiva y personal quincenal con John Fredy Rengifo Basto.
                  </p>
                </div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500">
                  {isAuthorized1on1 ? 'Espacio Exclusivo Habilitado' : 'Acceso Restringido'}
                </span>
              </div>

              {!isAuthorized1on1 ? (
                /* ========================================================================= */
                /* BLOQUEO POR DEFECTO: NO DISPONIBLE PÚBLICAMENTE SIN AUTORIZACIÓN DEL COACH */
                /* ========================================================================= */
                <div className="p-6 sm:p-8 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/70 dark:bg-[#18181b]/50 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6 text-black dark:text-white" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="text-sm sm:text-base font-semibold text-black dark:text-white">
                      Proceso 1 a 1 sujeto a autorización previa
                    </h4>
                    <p className="text-xs font-light text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      El paquete de 12 sesiones de acompañamiento individual no se encuentra disponible para compra abierta. Para garantizar la máxima profundidad y confidencialidad ontológica, requiere valoración diagnóstica y autorización formal del Master Coach John Fredy Rengifo Basto.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/573234642257?text=${encodeURIComponent(
                        `Hola John, soy ${currentUser.name}. Deseo postularme al Proceso Individual de 12 Sesiones 1 a 1 en Rengifo Basto Consultoría Ontológica.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-medium text-xs inline-flex items-center gap-2 transition-all shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Solicitar valoración diagnóstica con John</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* TARJETA FOTOGRÁFICA A COLOR DESBLOQUEADA TRAS AUTORIZACIÓN DEL FACILITADOR */
                /* ========================================================================= */
                <div className="group rounded-3xl border-2 border-black dark:border-white overflow-hidden bg-white dark:bg-[#18181b] shadow-lg transition-all">
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* FOTOGRAFÍA A COLOR VIBRANTE (12 Sesiones) */}
                    <div className="relative lg:col-span-5 min-h-[220px] lg:min-h-[300px] overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80"
                        alt="Sesiones 1 a 1"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white text-black shadow-xs">
                          Cupo Autorizado
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <span className="text-xs uppercase tracking-widest text-white/80 block">
                          Programa Integral de Dirección
                        </span>
                        <h4 className="text-lg font-bold leading-tight mt-0.5">
                          12 Sesiones Quincenales 1 a 1
                        </h4>
                      </div>
                    </div>

                    {/* DETALLES DE INVERSIÓN Y LENGUAJE CÁLIDO */}
                    <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Autorizado para tu acompañamiento individual</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-semibold text-black dark:text-white leading-snug">
                          Certeza, Fronteras & Sabiduría Relacional
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 font-light leading-relaxed">
                          Un viaje profundo de 12 encuentros quincenales directos con el consultor John Fredy Rengifo Basto. Incluye bitácora somática personalizada, cuadernos de trabajo integrados en PDF, seguimiento asincrónico directo y desbloqueo total de tus estaciones de transformación.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-light text-neutral-500 block">
                            Inversión en tu proceso:
                          </span>
                          <div className="text-lg sm:text-xl font-bold text-black dark:text-white">
                            $1.500.000 COP
                          </div>
                          <span className="text-[10px] text-neutral-500">
                            Opción de pago único o 2 cuotas de $750.000 COP
                          </span>
                        </div>

                        {hasPurchased1on1 ? (
                          <div className="py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Proceso activo en tu panel</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsOneOnOneCheckoutOpen(true)}
                            className="px-6 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                          >
                            <span>Comienza tu viaje</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SUBMODAL / DRAWER: PAGO DE TALLER ESPECÍFICO (SOLO PARA TALLERES PAGOS) */}
        {/* ========================================================================= */}
        {selectedWorkshopForPayment && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#18181b] p-6 sm:p-7 border border-black/15 dark:border-white/15 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                    Asegura tu lugar
                  </span>
                  <h3 className="text-base font-semibold text-black dark:text-white">
                    {selectedWorkshopForPayment.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWorkshopForPayment(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400 font-light">
                  Inversión en tu proceso:
                </span>
                <span className="text-sm font-bold text-black dark:text-white">
                  {selectedWorkshopForPayment.priceFormatted}
                </span>
              </div>

              {/* MÉTODOS DE PAGO */}
              <div className="space-y-3">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                  Elige tu forma de asegurar tu lugar:
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bre_b_nu')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'bre_b_nu'
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] block">Bre-B Nu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online_card')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'online_card'
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] block">En Línea / Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'efectivo'
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] block">Efectivo / Transf.</span>
                  </button>
                </div>

                {paymentMethod === 'bre_b_nu' && (
                  <BreBNuPaymentCard
                    amount={selectedWorkshopForPayment.priceFormatted}
                    concept={selectedWorkshopForPayment.title}
                    variant="compact"
                  />
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWorkshopForPayment(null)}
                  className="px-4 py-2.5 rounded-xl text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  Volver
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleConfirmPaidWorkshop(selectedWorkshopForPayment)}
                  className="px-6 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{isProcessing ? 'Registrando...' : 'Asegura tu lugar'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBMODAL / DRAWER: PAGO DE PAQUETE DE 12 SESIONES 1 A 1 */}
        {/* ========================================================================= */}
        {isOneOnOneCheckoutOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#18181b] p-6 sm:p-7 border border-black/15 dark:border-white/15 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                    Comienza tu viaje
                  </span>
                  <h3 className="text-base font-semibold text-black dark:text-white">
                    12 Sesiones de Acompañamiento 1 a 1
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOneOnOneCheckoutOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* SELECCIÓN DE PLAN (PAGO ÚNICO O 2 CUOTAS) */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                  Plan de inversión:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOneOnOnePlan('full')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      oneOnOnePlan === 'full'
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block opacity-70">
                      Pago Único Completo
                    </span>
                    <span className="text-sm font-bold block mt-0.5">$1.500.000 COP</span>
                    <span className="text-[10px] block opacity-80 mt-1">12 semanas integrales</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOneOnOnePlan('half')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      oneOnOnePlan === 'half'
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block opacity-70">
                      2 Cuotas Quincenales
                    </span>
                    <span className="text-sm font-bold block mt-0.5">$750.000 COP</span>
                    <span className="text-[10px] block opacity-80 mt-1">Primer aporte inicial</span>
                  </button>
                </div>
              </div>

              {/* MÉTODOS DE PAGO */}
              <div className="space-y-3">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                  Forma de inversión:
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bre_b_nu')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'bre_b_nu'
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] block">Bre-B Nu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online_card')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'online_card'
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] block">Tarjeta / Wompi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'efectivo'
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] block">Efectivo / Transf.</span>
                  </button>
                </div>

                {paymentMethod === 'bre_b_nu' && (
                  <BreBNuPaymentCard
                    amount={oneOnOnePlan === 'full' ? '$1.500.000 COP' : '$750.000 COP'}
                    concept="Acompañamiento Ontológico 1 a 1 (12 Sesiones)"
                    variant="compact"
                  />
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOneOnOneCheckoutOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  Volver
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmOneOnOnePackage}
                  className="px-6 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{isProcessing ? 'Activando...' : 'Comienza tu viaje'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
