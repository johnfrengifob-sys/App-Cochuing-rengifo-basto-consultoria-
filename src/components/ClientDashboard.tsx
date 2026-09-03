import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Session,
  FormSubmission,
  AIInsight,
  ProgramNodeInfo,
  PostSessionForm,
  PaymentRequest,
} from '../types';
import { OntologicalStore, PROGRAM_NODES } from '../services/store';
import { PDFGenerator } from '../utils/pdfGenerator';
import { LiquidGlassButton } from './LiquidGlassButton';
import { PulseBadge } from './PulseBadge';
import { PromotionalEventBanner } from './PromotionalEventBanner';
import { PaymentUnlockModal } from './PaymentUnlockModal';
import { PostSessionWorkbookModal } from './PostSessionWorkbookModal';
import { GeminiOntologicalCopilot } from './GeminiOntologicalCopilot';
import { WorkshopRegistrySection } from './WorkshopRegistrySection';
import { UnifiedWorkbookSpace } from './UnifiedWorkbookSpace';
import {
  Video,
  Calendar,
  Clock,
  Send,
  Sparkles,
  CheckCircle,
  CheckCircle2,
  FileText,
  HeartPulse,
  Brain,
  History,
  Lock,
  Check,
  Layers,
  ArrowRight,
  Shield,
  CreditCard,
  Download,
  BookOpen,
  Compass,
  Activity,
  ChevronRight,
  ExternalLink,
  Info,
  Flame,
  FileDown,
  Edit3,
  Banknote,
  Smartphone,
  MessageCircle,
  Zap,
  AlertCircle,
  LogOut,
  CalendarX,
  UserX,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  X,
} from 'lucide-react';

interface ClientDashboardProps {
  client: User;
  onLogout?: () => void;
  onUserUpdated?: () => void;
}

type WorkspaceTab = 'materials' | 'reinforcement' | 'form' | 'workbook' | 'gemini';

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  client,
  onLogout,
  onUserUpdated,
}) => {
  // Participant Account Menu & Modal State (Next to Participant Photo)
  const [isParticipantMenuOpen, setIsParticipantMenuOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [participantNotice, setParticipantNotice] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const participantMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (participantMenuRef.current && !participantMenuRef.current.contains(event.target as Node)) {
        setIsParticipantMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsParticipantMenuOpen(false);
        setIsCancelModalOpen(false);
        setIsDeleteModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 2-Step Cancel Subscription State
  const [cancelStep, setCancelStep] = useState<1 | 2>(1);
  const [cancelConsentAcknowledged, setCancelConsentAcknowledged] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ajuste de tiempos y compromisos laborales');

  // 2-Step Delete Account State
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteAcknowledge, setDeleteAcknowledge] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Unified Workbook Space Mode ('workshop' | 'session' | 'all')
  const [unifiedWorkbookMode, setUnifiedWorkbookMode] = useState<'workshop' | 'session' | 'all'>('workshop');
  const [unifiedSessionId, setUnifiedSessionId] = useState<string | null>(null);

  const openUnifiedWorkbook = (mode: 'workshop' | 'session' | 'all', targetStepOrSessionId?: number | string) => {
    setActiveTab('workbook');
    setUnifiedWorkbookMode(mode);
    if (typeof targetStepOrSessionId === 'number') {
      setSelectedNodeStep(targetStepOrSessionId);
    } else if (typeof targetStepOrSessionId === 'string') {
      setUnifiedSessionId(targetStepOrSessionId);
    }
    setTimeout(() => {
      const el = document.getElementById('unified-workbook-space') || document.getElementById('session-workspace-content');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleToggleSubscription = () => {
    setIsParticipantMenuOpen(false);
    setCancelStep(1);
    setCancelConsentAcknowledged(false);
    setIsCancelModalOpen(true);
  };

  const handleConfirmToggleSubscription = () => {
    if (client.status === 'inactive') {
      OntologicalStore.reactivateUserSubscription(client.uid);
      setParticipantNotice({
        message: '¡Suscripción reactivada con éxito! Tu plan formativo vuelve a estar activo.',
        type: 'success',
      });
    } else {
      OntologicalStore.cancelUserSubscription(client.uid);
      setParticipantNotice({
        message: 'Suscripción cancelada. Tu estado se ha marcado como pausado/inactivo.',
        type: 'info',
      });
    }
    setIsCancelModalOpen(false);
    onUserUpdated?.();
    setTimeout(() => setParticipantNotice(null), 4000);
  };

  const handleDeleteAccountClick = () => {
    setIsParticipantMenuOpen(false);
    setDeleteStep(1);
    setDeleteAcknowledge(false);
    setDeleteConfirmText('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteAccount = () => {
    OntologicalStore.deleteUserAccount(client.uid);
    setIsDeleteModalOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  const [sessions, setSessions] = useState<Session[]>(() =>
    OntologicalStore.getSessionsForClient(client.uid)
  );
  const nextSession = OntologicalStore.getNextSessionForClient(client.uid);

  const [forms, setForms] = useState<FormSubmission[]>(() =>
    OntologicalStore.getFormsForClient(client.uid)
  );

  const [insights, setInsights] = useState<AIInsight[]>(() =>
    OntologicalStore.getInsightsForClient(client.uid)
  );

  const [postSessionForms, setPostSessionForms] = useState<PostSessionForm[]>(() =>
    OntologicalStore.getPostSessionFormsForClient(client.uid)
  );

  const calendarUrl = OntologicalStore.getCalendarUrl();

  // Active step in the 6-node roadmap
  const [currentProgress, setCurrentProgress] = useState<number>(
    client.programProgress || 1
  );

  // Selected node for detailed view / form submission
  const [selectedNodeStep, setSelectedNodeStep] = useState<number>(
    client.programProgress || 1
  );

  // Workspace sub-tab
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('materials');

  // Level-specific Post-session form state
  const [bodyEmotion, setBodyEmotion] = useState('');
  const [reflections, setReflections] = useState('');
  const [levelSpecificAnswer, setLevelSpecificAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Payment & Unlock Modal State for Inactive Areas
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [unlockTargetNode, setUnlockTargetNode] = useState<ProgramNodeInfo>(
    PROGRAM_NODES[0]
  );

  // Client payment requests state
  const [clientPaymentRequests, setClientPaymentRequests] = useState<PaymentRequest[]>(() =>
    OntologicalStore.getPaymentRequestsForClient(client.uid)
  );
  const pendingPayment = clientPaymentRequests.find((r) => r.status === 'pending');

  // 1-on-1 Session Questionnaire & Workbook Modal State (for participants)
  const [isSessionWorkbookModalOpen, setIsSessionWorkbookModalOpen] = useState(false);
  const [sessionForWorkbook, setSessionForWorkbook] = useState<Session | null>(null);

  // Workshop Viewed Tracking State & Sub-Tab Mode
  const [workshopsViewed, setWorkshopsViewed] = useState<number[]>(() =>
    OntologicalStore.getWorkshopsViewed(client.uid)
  );
  const [sessionWorkspaceMode, setSessionWorkspaceMode] = useState<'sessions' | 'workshops'>('sessions');

  const handleToggleWorkshopViewed = (step: number) => {
    OntologicalStore.toggleWorkshopViewed(client.uid, step);
    setWorkshopsViewed(OntologicalStore.getWorkshopsViewed(client.uid));
  };

  const activeNodeInfo: ProgramNodeInfo =
    PROGRAM_NODES.find((n) => n.step === selectedNodeStep) || PROGRAM_NODES[0];

  const isNodeLocked = activeNodeInfo.step > currentProgress;

  const existingForm = OntologicalStore.getFormForStep(
    client.uid,
    activeNodeInfo.step
  );

  const nodeInsight = insights.find(
    (i) => i.sessionStep === activeNodeInfo.step
  );

  const handleOpenPaymentForNode = (node: ProgramNodeInfo) => {
    setUnlockTargetNode(node);
    setIsPaymentModalOpen(true);
  };

  const handleNodeUnlocked = (updatedUser: User) => {
    if (updatedUser.programProgress) {
      setCurrentProgress(updatedUser.programProgress);
      setSelectedNodeStep(updatedUser.programProgress);
    }
    setSessions(OntologicalStore.getSessionsForClient(client.uid));
    setClientPaymentRequests(OntologicalStore.getPaymentRequestsForClient(client.uid));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bodyEmotion.trim() || !reflections.trim()) return;

    setIsSubmitting(true);
    setTimeout(async () => {
      const activeSessionId = nextSession
        ? nextSession.id
        : 'sess-step-' + selectedNodeStep + '-' + Date.now();

      const newForm = OntologicalStore.submitForm({
        clientId: client.uid,
        sessionId: activeSessionId,
        sessionStep: selectedNodeStep,
        level: activeNodeInfo.level,
        bodyEmotion: bodyEmotion.trim(),
        reflections: reflections.trim(),
        levelSpecificAnswer: levelSpecificAnswer.trim() || undefined,
      });

      // Trigger automatic background Ontological evaluation
      await OntologicalStore.triggerAIAnalysisWebhook(client.uid, newForm);

      // Refresh state
      const updatedForms = OntologicalStore.getFormsForClient(client.uid);
      const updatedInsights = OntologicalStore.getInsightsForClient(client.uid);
      const updatedUser = OntologicalStore.getCurrentUser();

      setForms(updatedForms);
      setInsights(updatedInsights);
      if (updatedUser?.programProgress) {
        setCurrentProgress(updatedUser.programProgress);
      }

      setBodyEmotion('');
      setReflections('');
      setLevelSpecificAnswer('');
      setIsSubmitting(false);
      setIsEditingExisting(false);
      setSubmissionSuccess(true);
      setTimeout(() => setSubmissionSuccess(false), 6000);
    }, 600);
  };

  const handleStartEditForm = () => {
    if (existingForm) {
      setBodyEmotion(existingForm.bodyEmotion);
      setReflections(existingForm.reflections);
      setLevelSpecificAnswer(existingForm.levelSpecificAnswer || '');
      setIsEditingExisting(true);
      setActiveTab('form');
    }
  };

  const formattedDate = (isoStr: string) => {
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

  const progressPercentage = Math.round((currentProgress / 6) * 100);

  // Group nodes by Level for structured roadmap overview
  const levels = [
    {
      levelId: 'Nivel I',
      title: 'Arqueología & Deconstrucción',
      weeks: 'Semanas 1 a 4',
      nodes: PROGRAM_NODES.filter((n) => n.level === 'Nivel I'),
    },
    {
      levelId: 'Nivel II',
      title: 'Soberanía Emocional & Fronteras',
      weeks: 'Semanas 5 a 8',
      nodes: PROGRAM_NODES.filter((n) => n.level === 'Nivel II'),
    },
    {
      levelId: 'Nivel III',
      title: 'Diseño de Futuro & Maestría',
      weeks: 'Semanas 9 a 12',
      nodes: PROGRAM_NODES.filter((n) => n.level === 'Nivel III'),
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-black dark:text-neutral-100 py-10 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 transition-colors duration-200">
      {/* Personalized Greeting & Program Status Banner with Participant Account Dropdown */}
      <section className="pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-black/5 dark:border-white/10">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Participant Photo & Dropdown Container */}
            <div ref={participantMenuRef} className="relative shrink-0">
              <div className="relative group">
                <img
                  src={client.avatarUrl}
                  alt={client.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm ring-2 ring-gray-100 dark:ring-neutral-800 cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => setIsParticipantMenuOpen(!isParticipantMenuOpen)}
                  title="Haz clic para ver opciones de tu cuenta"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0D0D0E] ${
                    client.status === 'inactive' ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  title={client.status === 'inactive' ? 'Suscripción Pausada' : 'Suscripción Activa'}
                />
              </div>

              {/* Floating Dropdown Menu beside/under photo */}
              {isParticipantMenuOpen && (
                <div
                  id="dashboard-participant-account-dropdown"
                  className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white/85 dark:bg-[#18181B]/85 backdrop-blur-2xl border border-white/80 dark:border-neutral-800 shadow-2xl z-50 overflow-hidden animate-fade-in text-black dark:text-white"
                >
                  <div className="p-4 bg-white/60 dark:bg-[#1E1E22]/60 border-b border-gray-100 dark:border-neutral-800">
                    <div className="text-xs font-bold truncate">{client.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-neutral-400 font-mono truncate">{client.email}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        client.status === 'inactive'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {client.status === 'inactive' ? 'Suscripción Inactiva' : 'Suscripción Activa'}
                      </span>
                      <span className="text-[10px] text-gray-400">Participante</span>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    {/* Cerrar Sesión */}
                    <button
                      id="dashboard-btn-logout"
                      type="button"
                      onClick={() => {
                        setIsParticipantMenuOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#222226] text-left transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#26262B] flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-black dark:text-white">Cerrar Sesión</div>
                        <div className="text-[10px] font-light text-gray-500 dark:text-neutral-400">Salir de tu espacio personal</div>
                      </div>
                    </button>

                    {/* Cancelar / Reactivar Suscripción */}
                    <button
                      id="dashboard-btn-cancel-subscription"
                      type="button"
                      onClick={handleToggleSubscription}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50/80 dark:hover:bg-amber-950/20 text-left transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <CalendarX className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-black dark:text-white">
                          {client.status === 'inactive' ? 'Reactivar Suscripción' : 'Cancelar Suscripción'}
                        </div>
                        <div className="text-[10px] font-light text-gray-500 dark:text-neutral-400">
                          {client.status === 'inactive' ? 'Reanudar programa y talleres' : 'Pausar cobros y plan del programa'}
                        </div>
                      </div>
                    </button>

                    {/* Eliminar Cuenta */}
                    <button
                      id="dashboard-btn-delete-account"
                      type="button"
                      onClick={handleDeleteAccountClick}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50/80 dark:hover:bg-rose-950/20 text-left transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <UserX className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">Eliminar Cuenta</div>
                        <div className="text-[10px] font-light text-gray-500 dark:text-neutral-400">Borrar usuario y registros personales</div>
                      </div>
                    </button>
                  </div>

                  <div className="px-4 py-2 bg-gray-50/50 dark:bg-[#141417] border-t border-gray-100 dark:border-neutral-800 text-[10px] font-light text-gray-400 dark:text-neutral-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>RBC Coaching Ontológico • Confidencial</span>
                  </div>
                </div>
              )}
            </div>

            {/* Greeting and Quick Account Menu Toggle */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/60 dark:bg-[#18181B]/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 text-xs font-light text-gray-500 dark:text-neutral-400 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                Programa 1 a 1 • 12 Semanas
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-black dark:text-white">
                  Bienvenido(a),{' '}
                  <span className="font-semibold text-black dark:text-white">
                    {client.name}
                  </span>
                </h1>

                {/* Dropdown Menu Trigger Button right next to participant photo and name */}
                <button
                  id="dashboard-participant-menu-trigger"
                  type="button"
                  onClick={() => setIsParticipantMenuOpen(!isParticipantMenuOpen)}
                  className="px-2.5 py-1 rounded-xl border border-gray-200/90 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-[#1E1E22] text-gray-700 dark:text-neutral-200 transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium shadow-2xs"
                  title="Abrir menú de opciones de participante"
                >
                  <span className="text-[11px]">Opciones de Cuenta</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isParticipantMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <p className="text-xs sm:text-sm font-light text-gray-500 dark:text-neutral-400 max-w-xl leading-relaxed">
                Programa:{' '}
                <strong>
                  {client.programName || 'Certeza, Fronteras & Dirección Personal'}
                </strong>
              </p>
            </div>
          </div>

          {/* Payment Status and Roadmap Progress Pill */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <div className="px-4 py-2 rounded-2xl bg-white/65 dark:bg-[#18181B]/65 backdrop-blur-xl border border-white/70 dark:border-white/10 text-xs shadow-xs">
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-neutral-500 block">
                Estado del Programa
              </span>
              <span className="font-semibold text-black dark:text-white flex items-center gap-1.5 mt-0.5">
                <CreditCard className="w-3.5 h-3.5 text-black dark:text-white" />
                {client.paymentStatus || 'Completado'}
              </span>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-black/80 dark:bg-white/85 backdrop-blur-xl text-white dark:text-black text-xs shadow-xs">
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-neutral-500 block">
                Avance Ontológico
              </span>
              <span className="font-semibold text-white dark:text-black mt-0.5 block">
                Sesión {currentProgress} de 6 ({progressPercentage}%)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Advertising Banner: Próximo Evento / Conversatorio en Cronograma (Espacio no invasivo y compacto para participantes con contador y acceso directo a Meet) */}
      <section>
        <PromotionalEventBanner variant="participant" />
      </section>

      {/* Pending Payment Validation Banner for Participant */}
      {pendingPayment && (
        <section className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <span className="p-2 rounded-2xl bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 shrink-0">
                <Clock className="w-5 h-5 text-amber-700 dark:text-amber-300 animate-spin" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                    Pago en Proceso de Validación por el Administrador
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 uppercase">
                    {pendingPayment.method === 'efectivo' ? 'Efectivo en Sesión' : 'Bre-B Nu'}
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 dark:text-amber-300/90 font-light mt-0.5">
                  Has registrado una solicitud de <strong>{pendingPayment.amount}</strong> para <em>{pendingPayment.concept}</em>. En cuanto el consultor John Rengifo confirme el pago en su panel de administración, tu nivel se habilitará automáticamente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  const targetNode = PROGRAM_NODES.find((n) => n.step === pendingPayment.targetStep) || activeNodeInfo;
                  handleOpenPaymentForNode(targetNode);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <span>Ver Estado del Pago</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* BARRA DE ACCESO RÁPIDO: ESPACIO ÚNICO DE CUADERNO DE TRABAJO & CUESTIONARIOS */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-[#18181B]/70 backdrop-blur-xl border border-white/75 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-2xs">
            <BookOpen className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-semibold text-black dark:text-white">
                Espacio Único de Cuaderno de Trabajo & Cuestionarios
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Llenar & Descargar PDF
              </span>
            </div>
            <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400">
              Un solo espacio unificado para responder tus bitácoras de talleres, cuestionarios de sesiones 1 a 1 y descargar tus Cuadernos oficiales en PDF.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => openUnifiedWorkbook('workshop', activeNodeInfo.step)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs bg-black dark:bg-white text-white dark:text-black hover:opacity-90"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span>Abrir Cuaderno de Trabajo</span>
          </button>

          <button
            type="button"
            onClick={() => openUnifiedWorkbook('session')}
            className="px-3 py-2 rounded-xl bg-white/80 dark:bg-[#202024]/80 backdrop-blur-md border border-white/80 dark:border-neutral-700 text-xs font-medium text-black dark:text-white hover:bg-white dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Cuaderno Sesión 1 a 1</span>
          </button>

          <button
            type="button"
            onClick={() => openUnifiedWorkbook('all')}
            className="px-3 py-2 rounded-xl bg-white/80 dark:bg-[#202024]/80 backdrop-blur-md border border-white/80 dark:border-neutral-700 text-xs font-medium text-black dark:text-white hover:bg-white dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Ver catálogo de descargas PDF"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Catálogo PDF</span>
          </button>
        </div>
      </section>

      {/* Grid: Left Column (Next Session & Program Roadmap) / Right Column (Active Session Workspace & Materials) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Next Session & 12-Week Roadmap Explorer (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Próxima Sesión */}
          <div className="bg-white/70 dark:bg-[#18181B]/70 backdrop-blur-xl rounded-3xl p-7 border border-white/75 dark:border-white/10 shadow-sm transition-all">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                Próxima Sesión Quincenal
              </span>
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
            </div>

            {nextSession ? (
              <div className="space-y-5">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-300/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Apertura de Estado: Habilitada</span>
                    </div>
                    {nextSession.isPaid && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Pago Validado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-black dark:text-white font-medium text-lg tracking-tight capitalize">
                    <Calendar className="w-5 h-5 text-black dark:text-white stroke-[1.5]" />
                    {formattedDate(nextSession.date)}
                  </div>
                  <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Duración: 60 minutos • Sesión {currentProgress}
                  </p>
                </div>

                {nextSession.notes && (
                  <div className="p-4 bg-white dark:bg-[#202024] rounded-2xl border border-gray-100 dark:border-neutral-800 text-xs font-light text-gray-600 dark:text-neutral-300 leading-relaxed">
                    <strong className="font-medium text-black dark:text-white block mb-1">
                      Foco de la sesión:
                    </strong>
                    {nextSession.notes}
                  </div>
                )}

                <div className="pt-1 space-y-2">
                  <a
                    href={nextSession.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-block"
                  >
                    <LiquidGlassButton
                      className="w-full justify-center"
                      icon={<Video className="w-4 h-4 stroke-[1.5]" />}
                    >
                      Entrar a Google Meet
                    </LiquidGlassButton>
                  </a>

                  {/* Acceso ágil al Cuaderno de la Sesión en el Espacio Unificado */}
                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#202024]/70 backdrop-blur-md border border-white/70 dark:border-neutral-800 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="text-xs font-semibold text-black dark:text-white truncate">
                        Cuaderno de la Sesión
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openUnifiedWorkbook('session', nextSession.sessionNumber || currentProgress)}
                      className="text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>
                        {postSessionForms.find((f) => f.sessionId === nextSession.id || f.sessionNumber === nextSession.sessionNumber)
                          ? 'Ver / Descargar'
                          : '✍️ Diligenciar'}
                      </span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Acceso ágil al Registro y Documentos del Taller Vinculado */}
                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#202024]/70 backdrop-blur-md border border-white/70 dark:border-neutral-800 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-semibold text-black dark:text-white truncate block">
                          Taller {nextSession.sessionNumber || currentProgress}: Cuaderno & Guía
                        </span>
                        <span className="text-[10px] text-gray-400 font-light">
                          {workshopsViewed.includes(nextSession.sessionNumber || currentProgress)
                            ? '✅ Taller Visto'
                            : '⏳ Pendiente de Ver'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openUnifiedWorkbook('workshop', nextSession.sessionNumber || currentProgress)}
                      className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Abrir Cuaderno</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-white/60 dark:bg-[#202024]/60 backdrop-blur-md border border-white/60 dark:border-neutral-700 hover:bg-white/80 dark:hover:bg-neutral-800 text-xs font-semibold text-black dark:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    title="Abrir página oficial de agendamiento de sesiones uno a uno"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Agendar o Reprogramar Sesión 1 a 1</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>

                  <p className="text-[11px] font-light text-gray-400 dark:text-neutral-500 text-center mt-1">
                    Enlace confidencial cifrado punto a punto
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-black dark:text-white">
                    Agenda tu Sesión 1 a 1
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-neutral-500 font-light max-w-xs mx-auto">
                    Selecciona tu fecha y horario en la agenda de Google Calendar con John Fredy Rengifo Basto.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Sesión 1 a 1</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => openUnifiedWorkbook('session', 1)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold text-blue-900 dark:text-blue-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Diligenciar Cuaderno Sesión 1</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card: 12-Week Roadmap Level Explorer */}
          <div className="bg-white/70 dark:bg-[#18181B]/70 backdrop-blur-xl rounded-3xl p-7 border border-white/75 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
                <h3 className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                  Roadmap de 12 Semanas
                </h3>
              </div>
              <span className="text-xs font-light text-gray-400 dark:text-neutral-500">
                3 Niveles • 6 Nodos
              </span>
            </div>

            {/* Structured Levels with Nodes */}
            <div className="space-y-6">
              {levels.map((lvl) => {
                const isLevelLocked = lvl.nodes.every(
                  (n) => n.step > currentProgress
                );

                return (
                  <div key={lvl.levelId} className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] px-1">
                      <span className="font-semibold text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        {lvl.levelId}: {lvl.title}
                        {isLevelLocked && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-800/60 lowercase first-letter:uppercase">
                            <Lock className="w-2.5 h-2.5" />
                            tu próximo nivel
                          </span>
                        )}
                      </span>
                      <span className="text-gray-400 dark:text-neutral-500 font-light">
                        {lvl.weeks}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {lvl.nodes.map((node) => {
                        const isCompleted = node.step < currentProgress;
                        const isCurrent = node.step === currentProgress;
                        const isLocked = node.step > currentProgress;
                        const isSelected = selectedNodeStep === node.step;
                        const hasForm = forms.some(
                          (f) => f.sessionStep === node.step
                        );
                        const nodeSession = sessions.find((s) => s.sessionNumber === node.step);
                        const isSessionOpen = !isLocked && !isCompleted;

                        return (
                          <button
                            key={node.step}
                            onClick={() => {
                              setSelectedNodeStep(node.step);
                              setIsEditingExisting(false);
                            }}
                            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-[#F9F9F9] dark:bg-[#222226] border-black dark:border-white shadow-xs ring-1 ring-black/5 dark:ring-white/5'
                                : isCompleted
                                ? 'bg-white dark:bg-[#1A1A1E] border-gray-100 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                                : isCurrent
                                ? 'bg-white dark:bg-[#1A1A1E] border-black/40 dark:border-white/40'
                                : 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-200/40 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-800'
                            }`}
                          >
                            {/* Step Icon Badge */}
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0 mt-0.5 ${
                                isCompleted
                                  ? 'bg-black dark:bg-white text-white dark:text-black font-medium'
                                  : isCurrent
                                  ? 'bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white font-semibold'
                                  : 'bg-amber-100/70 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-3 h-3 stroke-[2.5]" />
                              ) : isLocked ? (
                                <Lock className="w-3 h-3 stroke-[2]" />
                              ) : (
                                node.step
                              )}
                            </div>

                            {/* Step Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[10px] font-medium text-gray-400 dark:text-neutral-400 uppercase tracking-wider">
                                  Sesión {node.step} • {node.weekLabel}
                                </span>
                                <div className="flex items-center gap-1">
                                  {hasForm && (
                                    <span
                                      title="Formulario registrado"
                                      className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                                    />
                                  )}
                                  {isCompleted && (
                                    <span className="text-[8px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                                      Realizada
                                    </span>
                                  )}
                                  {isSessionOpen && (
                                    <span className="text-[8px] font-bold bg-emerald-600 text-white dark:bg-emerald-400 dark:text-black px-2 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-2xs">
                                      <Sparkles className="w-2 h-2" />
                                      Abierta
                                    </span>
                                  )}
                                  {isLocked && (
                                    <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Lock className="w-2.5 h-2.5" />
                                      Tu próximo nivel
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs font-semibold text-black dark:text-white tracking-tight mt-0.5 truncate">
                                {node.sessionTitle}
                              </div>
                              <div className="text-[11px] font-light text-gray-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                                {node.objective}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inactive Level Promotion / Payment Upgrade Card */}
            {currentProgress < 6 && (
              <div className="p-5 rounded-2xl bg-linear-to-b from-amber-50/70 to-[#F9F9F9] dark:from-amber-950/25 dark:to-[#1C1C20] border border-amber-200/80 dark:border-amber-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Tu Próximo Nivel
                  </span>
                  <span className="text-[10px] font-light text-gray-500 dark:text-neutral-400">
                    Siguientes 6 Semanas
                  </span>
                </div>
                <p className="text-xs font-light text-gray-700 dark:text-neutral-300 leading-relaxed">
                  Habilita tus próximas sesiones 1-a-1 de consultoría ontológica, la bitácora somática y tus cuadernos de trabajo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const nextLockedNode =
                      PROGRAM_NODES.find((n) => n.step > currentProgress) ||
                      activeNodeInfo;
                    handleOpenPaymentForNode(nextLockedNode);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Enlace de Pago • Tu Próximo Nivel</span>
                </button>
              </div>
            )}

            {/* Indicador de Taller Seleccionado */}
            <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-neutral-400">
              <span>Seleccionado: <strong className="text-black dark:text-white">Taller {activeNodeInfo.step}</strong></span>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('session-workspace-content');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>Ver Espacio de Trabajo</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Level Workspace & Work Materials (7 Cols) */}
        <div className="lg:col-span-7" id="session-workspace-content">
          <div className="bg-white/75 dark:bg-[#18181B]/75 backdrop-blur-xl rounded-3xl p-6 sm:p-9 border border-white/75 dark:border-white/10 shadow-sm space-y-7">
            {/* Header: Selected Session & Level Information */}
            <div className="pb-6 border-b border-black/5 dark:border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-[#202024]/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 text-[11px] font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-widest">
                  <span>{activeNodeInfo.level}: {activeNodeInfo.levelTitle}</span>
                  <span>•</span>
                  <span>{activeNodeInfo.weekLabel}</span>
                </div>

                {/* Level Tag */}
                <div className="flex items-center gap-2">
                  {isNodeLocked && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 text-[11px] font-semibold uppercase tracking-wider">
                      <Lock className="w-3 h-3" />
                      Tu Próximo Nivel
                    </span>
                  )}
                  <span className="text-[11px] font-light text-gray-400 dark:text-neutral-500">
                    Nodo {activeNodeInfo.step} de 6
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black dark:text-white">
                  Sesión {activeNodeInfo.step}: {activeNodeInfo.sessionTitle}
                </h2>
                <p className="text-xs sm:text-sm font-light text-gray-600 dark:text-neutral-300 mt-2 leading-relaxed bg-white/50 dark:bg-[#202024]/50 backdrop-blur-md p-4 rounded-2xl border border-white/60 dark:border-neutral-800">
                  <strong className="font-medium text-black dark:text-white block mb-1">
                    Propósito ontológico de esta etapa:
                  </strong>
                  {activeNodeInfo.objective}
                </p>
              </div>

              {/* Inactive Area Callout Banner with Payment Link */}
              {isNodeLocked && (
                <div className="p-5 sm:p-6 rounded-2xl bg-linear-to-br from-amber-50/80 via-[#FFFDF7] to-amber-100/40 dark:from-amber-950/30 dark:via-[#1A1A1E] dark:to-amber-900/20 border border-amber-200/80 dark:border-amber-800/60 space-y-3.5 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/90 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-semibold uppercase tracking-widest">
                      <Lock className="w-3 h-3" />
                      Área Inactiva • Tu Próximo Nivel
                    </span>
                    <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                      Inversión requerida para habilitar
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-semibold text-black dark:text-white">
                      Desbloquea el {activeNodeInfo.level}: {activeNodeInfo.sessionTitle}
                    </h3>
                    <p className="text-xs font-light text-gray-700 dark:text-neutral-300 leading-relaxed">
                      Esta área aún no se encuentra activa en tu cuenta. Al realizar tu pago, habilitarás tus próximas sesiones 1-a-1 de consultoría ontológica, la bitácora somática, las fichas descargables y el protocolo de refuerzo personalizado.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenPaymentForNode(activeNodeInfo)}
                      className="flex-1 py-3 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Enlace de Pago • Tu Próximo Nivel</span>
                    </button>

                    <a
                      href={`https://wa.me/573234642257?text=${encodeURIComponent(
                        `Hola John, deseo formalizar el pago de mi Próximo Nivel (${activeNodeInfo.level}: ${activeNodeInfo.sessionTitle}) en Rengifo Basto Consultoría Ontológica.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-xl bg-white dark:bg-[#202024] hover:bg-gray-100 dark:hover:bg-neutral-800 border border-gray-200/80 dark:border-neutral-700 text-xs font-medium text-black dark:text-white flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Coordinar por WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs and Content (ONLY shown when node is unlocked/active) */}
            {!isNodeLocked ? (
              <>
                {/* Session Status & Quick Action Callout */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-2xs">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Apertura de Estado: Sesión Habilitada
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-[#1E1E22] px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                        Pago Validado
                      </span>
                    </div>
                    <p className="text-xs font-light text-gray-700 dark:text-neutral-300">
                      Materiales de trabajo y cuestionario ontológico del <strong>Taller {activeNodeInfo.step}</strong> listos para tu proceso.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openUnifiedWorkbook('workshop', activeNodeInfo.step)}
                      className="px-3.5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                      <span>{existingForm ? 'Ver / Descargar Cuaderno' : '✍️ Diligenciar Cuaderno'}</span>
                    </button>
                  </div>
                </div>

                {/* Navigation Tabs for Workspace */}
            <div className="flex border-b border-gray-100 dark:border-neutral-800 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('materials')}
                className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-all cursor-pointer relative flex items-center gap-2 ${
                  activeTab === 'materials'
                    ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                    : 'text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Guía & Materiales
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reinforcement')}
                className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-all cursor-pointer relative flex items-center gap-2 ${
                  activeTab === 'reinforcement'
                    ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                    : 'text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Refuerzo Personalizado
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('workbook');
                  setUnifiedWorkbookMode('workshop');
                }}
                className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-all cursor-pointer relative flex items-center gap-2 ${
                  activeTab === 'workbook' || activeTab === 'form'
                    ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                    : 'text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Cuadernos de Trabajo & Cuestionarios</span>
                {existingForm ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                    Taller {activeNodeInfo.step} Listo
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold hidden sm:inline-flex">
                  {workshopsViewed.length}/6 Talleres
                </span>
                {postSessionForms.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-bold hidden sm:inline-flex">
                    {postSessionForms.length} Sesiones 1 a 1
                  </span>
                )}
              </button>
            </div>

            {/* Notification if submission just succeeded */}
            {submissionSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 dark:text-emerald-200 animate-fade-in">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[1.5] shrink-0" />
                  <div>
                    <strong className="font-semibold block">
                      ¡Cuestionario registrado con éxito! Tu Cuaderno de Trabajo ha sido construido.
                    </strong>
                    <span className="font-light text-emerald-800 dark:text-emerald-300/90 text-[11px]">
                      Tus respuestas del cuestionario han sido integradas en tu cuaderno en PDF listo para descargar.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    PDFGenerator.generateLevelWorkbookPDF(
                      activeNodeInfo,
                      client,
                      existingForm
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                  <span>Descargar Cuaderno PDF</span>
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 1: GUÍA & MATERIALES DE TRABAJO DEL NIVEL */}
            {/* ========================================================================= */}
            {activeTab === 'materials' && (
              <div className="space-y-6">
                {/* Tangible Outcomes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-black dark:text-white" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white">
                      Capacidades & Resultados Tangibles
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeNodeInfo.tangibleOutcomes?.map((outcome, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 text-xs font-light text-gray-700 dark:text-neutral-300 flex items-start gap-2.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-1.5 shrink-0" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 Ontological Domains Methodology */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-black dark:text-white" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white">
                      Metodología de Trabajo en los 3 Dominios Ontológicos
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1.5">
                      <span className="text-[11px] font-semibold text-black dark:text-white flex items-center gap-1.5">
                        🗣️ Lingüístico
                      </span>
                      <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                        {activeNodeInfo.methodology.linguistic}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1.5">
                      <span className="text-[11px] font-semibold text-black dark:text-white flex items-center gap-1.5">
                        🫀 Somático
                      </span>
                      <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                        {activeNodeInfo.methodology.somatic}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1.5">
                      <span className="text-[11px] font-semibold text-black dark:text-white flex items-center gap-1.5">
                        🌊 Emocional
                      </span>
                      <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                        {activeNodeInfo.methodology.emotional}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Daily Micro-Practice */}
                <div className="p-5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-black dark:text-white" />
                      Micro-Práctica de Anclaje Cotidiano
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#18181B] border border-gray-200/70 dark:border-neutral-700 text-[10px] font-medium text-gray-600 dark:text-neutral-400">
                      {activeNodeInfo.dailyMicroPractice.frequency}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-black dark:text-white">
                    {activeNodeInfo.dailyMicroPractice.title}
                  </h4>
                  <p className="text-xs font-light text-gray-600 dark:text-neutral-300 leading-relaxed">
                    {activeNodeInfo.dailyMicroPractice.description}
                  </p>
                </div>

                {/* Recommended Readings & Study Materials */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-black dark:text-white" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white">
                      Materiales de Estudio & Lecturas Clave
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeNodeInfo.studyMaterials?.map((mat, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                            {mat.type}
                          </span>
                          <span className="text-[10px] font-light text-gray-400 dark:text-neutral-500">
                            {mat.pages}
                          </span>
                        </div>
                        <h4 className="text-xs font-medium text-black dark:text-white">
                          {mat.title}
                        </h4>
                        <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                          {mat.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download Workbook Action */}
                <div className="p-5 rounded-2xl bg-black dark:bg-[#222226] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="text-xs font-semibold flex items-center justify-center sm:justify-start gap-2">
                      <span>Cuaderno de Trabajo del Taller (PDF)</span>
                      {existingForm && (
                        <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40">
                          ✓ Con tus Respuestas
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-light text-gray-300 dark:text-neutral-300">
                      Construye tu cuaderno completando el cuestionario ontológico de este taller y descárgalo con tu bitácora integrada.
                    </div>
                  </div>

                  {isNodeLocked ? (
                    <button
                      type="button"
                      onClick={() => handleOpenPaymentForNode(activeNodeInfo)}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 dark:bg-amber-300 hover:bg-amber-300 text-black font-semibold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Enlace de Pago • Tu Próximo Nivel
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('form');
                          const el = document.getElementById('session-workspace-content');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {existingForm
                            ? 'Editar Cuestionario'
                            : '✍️ Diligenciar Cuestionario'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          PDFGenerator.generateLevelWorkbookPDF(
                            activeNodeInfo,
                            client,
                            existingForm
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-2 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer shadow-sm"
                        title={
                          existingForm
                            ? 'Descargar Cuaderno PDF con tus respuestas'
                            : 'Descargar Cuaderno PDF'
                        }
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        Descargar Cuaderno PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: REFUERZO PERSONALIZADO DEL NIVEL */}
            {/* ========================================================================= */}
            {activeTab === 'reinforcement' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-black dark:text-white" />
                      {activeNodeInfo.reinforcementPack.title}
                    </span>
                    <span className="text-[10px] font-light text-gray-400 dark:text-neutral-500">
                      {activeNodeInfo.reinforcementPack.subtitle}
                    </span>
                  </div>
                  <p className="text-xs font-light text-gray-600 dark:text-neutral-300 leading-relaxed">
                    {activeNodeInfo.reinforcementPack.summary}
                  </p>
                </div>

                {/* Audio Guide & Somatic Protocol */}
                <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      🎧 {activeNodeInfo.reinforcementPack.audioGuideTitle}
                    </span>
                    <span className="text-[10px] font-light text-gray-400 dark:text-neutral-500">
                      {activeNodeInfo.reinforcementPack.audioDuration}
                    </span>
                  </div>
                  <p className="text-xs font-light text-gray-600 dark:text-neutral-400 italic">
                    "{activeNodeInfo.reinforcementPack.audioScript}"
                  </p>
                </div>

                {/* Key Practices */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-black dark:text-white" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white">
                      Prácticas Clave de Integración
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {activeNodeInfo.reinforcementPack.keyPractices?.map(
                      (practice, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 text-xs font-light text-gray-700 dark:text-neutral-300 flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-neutral-700 flex items-center justify-center text-[10px] font-semibold text-black dark:text-white shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{practice}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Self-care protocol */}
                {activeNodeInfo.reinforcementPack.selfCareProtocol && (
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1.5">
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
                      Protocolo de Auto-Cuidado & Regulación
                    </span>
                    <p className="text-xs font-light text-gray-700 dark:text-neutral-300 leading-relaxed">
                      {activeNodeInfo.reinforcementPack.selfCareProtocol}
                    </p>
                  </div>
                )}

                {/* Download Reinforcement Pack PDF Action */}
                <div className="p-5 rounded-2xl bg-black dark:bg-[#222226] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <div className="text-xs font-semibold">
                      Pack de Refuerzo Personalizado (PDF)
                    </div>
                    <div className="text-[11px] font-light text-gray-300 dark:text-neutral-300">
                      Imprime o guarda en PDF para tus sesiones de auto-indagación quincenal.
                    </div>
                  </div>

                  {isNodeLocked ? (
                    <button
                      type="button"
                      onClick={() => handleOpenPaymentForNode(activeNodeInfo)}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 dark:bg-amber-300 hover:bg-amber-300 text-black font-semibold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Enlace de Pago • Tu Próximo Nivel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        PDFGenerator.generateReinforcementPackPDF(
                          activeNodeInfo,
                          client
                        )
                      }
                      className="px-4 py-2.5 rounded-xl bg-white text-black font-medium text-xs flex items-center gap-2 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar Refuerzo PDF
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* UNIFIED WORKBOOK & QUESTIONNAIRE SPACE */}
            {/* ========================================================================= */}
            {(activeTab === 'workbook' || activeTab === 'form') && (
              <div id="session-workspace-content" className="animate-fade-in">
                <UnifiedWorkbookSpace
                  client={client}
                  sessions={sessions}
                  forms={forms}
                  postSessionForms={postSessionForms}
                  currentProgress={currentProgress}
                  selectedStep={selectedNodeStep}
                  onStepChange={(step) => setSelectedNodeStep(step)}
                  workshopsViewed={workshopsViewed}
                  onToggleWorkshopViewed={handleToggleWorkshopViewed}
                  onFormSubmitted={(newForm) => {
                    setForms((prev) => {
                      const idx = prev.findIndex(
                        (f) => f.sessionStep === newForm.sessionStep && f.clientId === client.uid
                      );
                      if (idx >= 0) {
                        const updated = [...prev];
                        updated[idx] = newForm;
                        return updated;
                      }
                      return [newForm, ...prev];
                    });
                    setSubmissionSuccess(true);
                    setTimeout(() => setSubmissionSuccess(false), 5000);
                    onUserUpdated?.();
                  }}
                  onPostSessionFormSaved={(savedForm) => {
                    setPostSessionForms((prev) => {
                      const idx = prev.findIndex((f) => f.id === savedForm.id);
                      if (idx >= 0) {
                        const updated = [...prev];
                        updated[idx] = savedForm;
                        return updated;
                      }
                      return [savedForm, ...prev];
                    });
                    onUserUpdated?.();
                  }}
                  onOpenPaymentForNode={handleOpenPaymentForNode}
                  initialMode={unifiedWorkbookMode}
                  initialSessionId={unifiedSessionId}
                />
              </div>
            )}


              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Payment and Unlock Modal for Inactive Areas */}
      <PaymentUnlockModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setClientPaymentRequests(OntologicalStore.getPaymentRequestsForClient(client.uid));
        }}
        node={unlockTargetNode}
        client={client}
        onUnlocked={handleNodeUnlocked}
      />

      {/* 1-on-1 Session Questionnaire & Workbook Modal for Participants */}
      <PostSessionWorkbookModal
        isOpen={isSessionWorkbookModalOpen}
        onClose={() => {
          setIsSessionWorkbookModalOpen(false);
          setSessionForWorkbook(null);
        }}
        session={sessionForWorkbook}
        client={client}
        isParticipant={true}
        onFormSaved={(savedForm) => {
          setPostSessionForms(OntologicalStore.getPostSessionFormsForClient(client.uid));
        }}
      />

      {/* Participant Toast Notification */}
      {participantNotice && (
        <div
          id="participant-dashboard-notice"
          className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-2xl border border-gray-800 dark:border-gray-200 animate-fade-in flex items-center gap-3 text-xs"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="font-medium flex-1">{participantNotice.message}</span>
          <button
            type="button"
            onClick={() => setParticipantNotice(null)}
            className="text-gray-400 hover:text-white dark:hover:text-black cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MODAL 1: CANCELAR / REACTIVAR SUSCRIPCIÓN EN DOS PASOS */}
      {isCancelModalOpen && (
        <div
          id="dashboard-cancel-subscription-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div className="w-full max-w-md bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-neutral-800 shadow-2xl p-6 sm:p-7 space-y-5 text-black dark:text-white">
            <div className="flex items-start justify-between">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  client.status === 'inactive'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                }`}
              >
                {client.status === 'inactive' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <CalendarX className="w-6 h-6" />
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setCancelStep(1);
                  setCancelConsentAcknowledged(false);
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {client.status === 'inactive' ? (
              // Reactivation flow (Single confirmation)
              <>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    Reactivar Suscripción al Programa
                  </h3>
                  <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                    Tu estado actual es <strong>Inactivo / Pausado</strong>. Al reactivar tu suscripción, reanudarás tu acceso normal a las convocatorias de talleres, sesiones quincenales 1 a 1 y seguimiento ontológico continuo.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Puedes reactivar de inmediato sin costo adicional.</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    id="dashboard-confirm-toggle-subscription-button"
                    type="button"
                    onClick={handleConfirmToggleSubscription}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Sí, Reactivar Suscripción
                  </button>
                </div>
              </>
            ) : cancelStep === 1 ? (
              // Step 1: Reason & Information
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      Paso 1 de 2 • Información y Motivo
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    Pausar o Cancelar Suscripción
                  </h3>
                  <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                    Antes de pausar tu proceso de coaching, cuéntanos el motivo principal para adaptar tu expediente:
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                    Motivo de la pausa:
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs text-black dark:text-white font-normal focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Ajuste de tiempos y compromisos laborales">Ajuste de tiempos y compromisos laborales</option>
                    <option value="Motivos presupuestales o financieros">Motivos presupuestales o financieros</option>
                    <option value="Cumplí mis objetivos del ciclo formativo actual">Cumplí mis objetivos del ciclo formativo actual</option>
                    <option value="Deseo tomar una pausa temporal de reflexión">Deseo tomar una pausa temporal de reflexión</option>
                    <option value="Otro motivo">Otro motivo</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>¿Qué sucederá con tu cuenta?</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] font-light space-y-0.5 text-amber-950/90 dark:text-amber-300/90 pl-1">
                    <li>Se pausarán futuras convocatorias y recordatorios de pago.</li>
                    <li>Conservarás acceso para descargar tus <strong>Cuadernos de Trabajo y Bitácoras</strong>.</li>
                  </ul>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCancelModalOpen(false);
                      setCancelStep(1);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer"
                  >
                    Volver al Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setCancelStep(2)}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5"
                  >
                    <span>Continuar al Paso 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              // Step 2: Final Consent & Confirmation
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      Paso 2 de 2 • Confirmación Obligatoria
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400">
                    Confirmación de Cancelación / Pausa
                  </h3>
                  <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                    Para evitar errores accidentales, confirma que comprendes el cambio en tu estado de suscripción.
                  </p>
                </div>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cancelConsentAcknowledged}
                    onChange={(e) => setCancelConsentAcknowledged(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs text-gray-700 dark:text-neutral-300 font-light leading-relaxed">
                    Entiendo que mi cuenta pasará a estado <strong>Inactivo</strong> y que mis sesiones individuales con el coach se pausarán hasta reactivar el servicio.
                  </span>
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancelStep(1)}
                    className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer"
                  >
                    ← Volver al Paso 1
                  </button>
                  <button
                    id="dashboard-confirm-toggle-subscription-button"
                    type="button"
                    disabled={!cancelConsentAcknowledged}
                    onClick={handleConfirmToggleSubscription}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                      cancelConsentAcknowledged
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    Confirmar Cancelación Definitiva
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: ELIMINAR CUENTA DEFINITIVAMENTE EN DOS PASOS */}
      {isDeleteModalOpen && (
        <div
          id="dashboard-delete-account-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
        >
          <div className="w-full max-w-md bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-2xl rounded-3xl border border-rose-200/80 dark:border-rose-900/60 shadow-2xl p-6 sm:p-7 space-y-5 text-black dark:text-white">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteStep(1);
                  setDeleteAcknowledge(false);
                  setDeleteConfirmText('');
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {deleteStep === 1 ? (
              // Step 1: Warning and acknowledgment
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                      Paso 1 de 2 • Advertencia Crítica
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">
                    Eliminar Cuenta de Participante
                  </h3>
                  <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                    ¿Estás seguro de que deseas eliminar permanentemente la cuenta de <strong>{client.name}</strong>?
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Esta acción es irreversible y destruirá tu historial:
                  </div>
                  <ul className="list-disc list-inside text-[11px] font-light space-y-0.5 pl-1">
                    <li>Se borrarán tus cuestionarios y reflexiones de talleres.</li>
                    <li>Se eliminarán tus cuadernos de trabajo 1 a 1 y bitácoras de coherencia.</li>
                    <li>Tu sesión se cerrará de inmediato y no podrás recuperarla.</li>
                  </ul>
                </div>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteAcknowledge}
                    onChange={(e) => setDeleteAcknowledge(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="text-xs text-gray-700 dark:text-neutral-300 font-light leading-relaxed">
                    He leído y comprendo que esta acción eliminará todos mis datos de forma permanente.
                  </span>
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setDeleteStep(1);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer"
                  >
                    Mantener Cuenta
                  </button>
                  <button
                    type="button"
                    disabled={!deleteAcknowledge}
                    onClick={() => setDeleteStep(2)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 ${
                      deleteAcknowledge
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <span>Avanzar al Paso 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              // Step 2: Keyboard text confirmation ("ELIMINAR")
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                      Paso 2 de 2 • Verificación de Seguridad
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">
                    Confirmación por Teclado
                  </h3>
                  <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                    Para evitar cualquier error involuntario, escribe la palabra <strong className="font-bold text-rose-600">ELIMINAR</strong> en el campo de texto a continuación:
                  </p>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Escribe ELIMINAR para confirmar"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-rose-300 dark:border-rose-900 text-sm font-semibold text-rose-700 dark:text-rose-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase"
                    autoFocus
                  />
                  <span className="text-[11px] text-gray-400 font-light block">
                    Distinción no estricta de mayúsculas (escribe &quot;eliminar&quot; o &quot;ELIMINAR&quot;).
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer"
                  >
                    ← Volver al Paso 1
                  </button>
                  <button
                    id="dashboard-confirm-delete-account-button"
                    type="button"
                    disabled={deleteConfirmText.trim().toUpperCase() !== 'ELIMINAR'}
                    onClick={handleConfirmDeleteAccount}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 ${
                      deleteConfirmText.trim().toUpperCase() === 'ELIMINAR'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Confirmar y Borrar Cuenta</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
