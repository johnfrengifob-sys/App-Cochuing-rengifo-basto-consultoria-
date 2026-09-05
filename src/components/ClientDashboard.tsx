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
import { OntologicalStore, PROGRAM_NODES, COMPANY_INFO } from '../services/store';
import coachAvatarImg from '../assets/images/regenerated_image_1788287101599.jpg';
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
  ShieldCheck,
  CreditCard,
  Download,
  BookOpen,
  Compass,
  Activity,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  Headphones,
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

  // Workspace sub-tab (Default to workbook so participant immediately sees exercises and answers)
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('workbook');

  // Upcoming open community workshop banner toggle state
  const upcomingEvent = OntologicalStore.getUpcomingEvent();
  const [showEventBanner, setShowEventBanner] = useState(false);

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
    <div className="min-h-screen bg-transparent text-black dark:text-neutral-100 py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-10 transition-colors duration-200">
      {/* Personalized Greeting & Program Status Banner with Participant Account Dropdown */}
      <section className="pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-black/5 dark:border-white/10">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Participant Photo */}
            <div className="relative shrink-0">
              <img
                src={client.avatarUrl}
                alt={client.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm ring-2 ring-gray-100 dark:ring-neutral-800"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0D0D0E] ${
                  client.status === 'inactive' ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                title={client.status === 'inactive' ? 'Suscripción Pausada' : 'Suscripción Activa'}
              />
            </div>

            {/* Greeting */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/60 dark:bg-[#18181B]/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 text-xs font-light text-gray-500 dark:text-neutral-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                  Programa 1 a 1 • 12 Semanas
                </div>
                <div className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Espacio Privado & Confidencial</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-black dark:text-white">
                  Bienvenido(a),{' '}
                  <span className="font-semibold text-black dark:text-white">
                    {client.name}
                  </span>
                </h1>
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
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <div className="px-4 py-2 rounded-2xl glass-panel-opal text-xs shadow-xs">
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

      {/* ========================================================================= */}
      {/* 1. TU CAMINO DE TRANSFORMACIÓN (EN BLANCO HASTA HABILITACIÓN DESDE EL ADMIN) */}
      {/* ========================================================================= */}
      {!client.transformationSpacesEnabled ? (
        <section className="p-8 sm:p-12 rounded-3xl border border-dashed border-gray-300 dark:border-neutral-800 text-center space-y-4 bg-white/40 dark:bg-neutral-900/30 backdrop-blur-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Compass className="w-7 h-7 stroke-[1.5]" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Tu Camino de Transformación
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 leading-relaxed font-light">
              Este espacio permanece en blanco y será habilitado formalmente desde el panel del Administrador y Master Coach (John Fredy Rengifo Basto) una vez se active tu ciclo de sesiones individuales.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Espacio en blanco • Pendiente de habilitación desde el panel admin</span>
          </div>
        </section>
      ) : (
        <>
      {/* 1. MAPA INTERACTIVO DE LAS 6 SESIONES: SÚPER VISUAL Y CLARO */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm sm:text-base font-bold text-black dark:text-white tracking-tight">
                Tu Camino de Transformación (6 Sesiones)
              </h2>
            </div>
            <p className="text-xs font-light text-gray-500 dark:text-neutral-400">
              Toca cualquier nivel para ver sus temas, preguntas y cuadernos de trabajo.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-neutral-400 self-start sm:self-auto">
            <span>Progreso Total:</span>
            <div className="w-24 sm:w-32 h-2 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="font-bold text-black dark:text-white">{progressPercentage}%</span>
          </div>
        </div>

        {/* 6 Interactive Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {PROGRAM_NODES.map((node) => {
            const isCompleted = node.step < currentProgress || forms.some((f) => f.sessionStep === node.step);
            const isCurrent = node.step === currentProgress;
            const isSelected = node.step === selectedNodeStep;
            const isLocked = node.step > currentProgress;

            return (
              <button
                key={node.step}
                type="button"
                onClick={() => {
                  setSelectedNodeStep(node.step);
                  const el = document.getElementById('session-workspace-content');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[95px] ${
                  isSelected
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md ring-2 ring-emerald-400/50 scale-[1.02]'
                    : isCurrent
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/40 text-black dark:text-white hover:border-emerald-500'
                    : isCompleted
                    ? 'bg-white/80 dark:bg-[#1E1E22]/80 border-gray-200 dark:border-neutral-800 text-black dark:text-white hover:bg-white dark:hover:bg-[#25252A]'
                    : 'bg-gray-100/60 dark:bg-[#151518]/60 border-gray-200/50 dark:border-neutral-800/50 text-gray-400 dark:text-neutral-500 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-white text-black dark:bg-black dark:text-white'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isCurrent
                        ? 'bg-emerald-500 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : node.step}
                  </span>

                  {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-emerald-500 text-white">
                      Aquí estás
                    </span>
                  )}
                  {isLocked && !isCurrent && (
                    <Lock className="w-3 h-3 text-gray-400 dark:text-neutral-500" />
                  )}
                  {isCompleted && !isCurrent && (
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      Listo
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <div className="text-xs font-bold leading-tight line-clamp-1">
                    {node.sessionTitle}
                  </div>
                  <div className={`text-[10px] font-light mt-0.5 ${isSelected ? 'opacity-80' : 'text-gray-400 dark:text-neutral-500'}`}>
                    {node.weekLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PANEL DE ACCIÓN DINÁMICA: ¿QUÉ DEBO HACER HOY? (MISIÓN ACTUAL) */}
      {/* ========================================================================= */}
      <section className="glass-panel-opal rounded-3xl p-5 sm:p-6 lg:p-7 space-y-5 border border-black/5 dark:border-white/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-black dark:text-white">
                  Tu Misión Actual • Sesión {currentProgress}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Paso Recomendado
                </span>
              </div>
              <p className="text-xs font-light text-gray-500 dark:text-neutral-400">
                Sigue estos dos pasos sencillos para aprovechar al máximo tu consultoría.
              </p>
            </div>
          </div>

          {/* Coach Quick Contact Pill */}
          <div className="flex items-center gap-2.5 bg-white/80 dark:bg-neutral-900/80 py-1.5 px-3 rounded-2xl border border-gray-200/70 dark:border-neutral-800 self-start sm:self-auto shadow-2xs">
            <img
              src={coachAvatarImg}
              alt="John Fredy Rengifo Basto"
              className="w-8 h-8 rounded-xl object-cover ring-1 ring-emerald-500/30 shrink-0"
            />
            <div className="text-[11px] leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-black dark:text-white">John Fredy Rengifo</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-light">Consultor Senior ICF</span>
            </div>
            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] flex items-center gap-1 transition-colors shadow-2xs"
              title="Escribir por WhatsApp a John Fredy Rengifo"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 2 Big Action Cards: Paso 1 (La Cita en Vivo) y Paso 2 (El Cuaderno) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PASO 1: TU ENCUENTRO EN VIVO */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-[#1A1A1E]/70 border border-black/5 dark:border-white/10 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  Paso 1: Sesión con John Rengifo
                </span>
                {nextSession && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Cita Confirmada
                  </span>
                )}
              </div>

              {nextSession ? (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-black dark:text-white capitalize">
                    {formattedDate(nextSession.date)}
                  </h3>
                  <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Duración: 60 min • Google Meet
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-black dark:text-white">
                    Aún no tienes fecha agendada
                  </h3>
                  <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-1">
                    Elige el día y la hora que mejor se ajusten a tu agenda.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              {nextSession ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={nextSession.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-xs"
                  >
                    <Video className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    <span>Entrar a Google Meet</span>
                  </a>
                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-neutral-800 text-black dark:text-white font-medium text-xs flex items-center justify-center gap-1 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                    title="Reprogramar o agendar otra sesión"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Reprogramar</span>
                  </a>
                </div>
              ) : (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Calendar className="w-4 h-4" />
                  <span>📅 Agendar en Google Calendar</span>
                </a>
              )}
            </div>
          </div>

          {/* PASO 2: TU CUADERNO DE TRABAJO */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-[#1A1A1E]/70 border border-black/5 dark:border-white/10 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Paso 2: Tu Cuaderno de Trabajo
                </span>
                {existingForm ? (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    ¡Completado!
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Por responder
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-black dark:text-white">
                  {existingForm ? 'Tus reflexiones están registradas' : 'Diligencia tus reflexiones'}
                </h3>
                <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-1">
                  {existingForm
                    ? 'Puedes consultar tus respuestas guardadas o descargar tu Cuaderno oficial en PDF.'
                    : 'Son 3 preguntas sencillas sobre tus emociones y sensaciones físicas (toma 5 minutos).'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedNodeStep(currentProgress);
                  openUnifiedWorkbook('workshop', currentProgress);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                  existingForm
                    ? 'bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-white'
                    : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>{existingForm ? 'Ver / Modificar Respuestas' : '✍️ Diligenciar Cuaderno Ahora'}</span>
              </button>

              {existingForm && (
                <button
                  type="button"
                  onClick={() =>
                    PDFGenerator.generateLevelWorkbookPDF(
                      activeNodeInfo,
                      client,
                      existingForm
                    )
                  }
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="Descargar Cuaderno Oficial en PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      </>
      )}

      {/* ========================================================================= */}
      {/* 3. TALLER EN VIVO ABIERTO EN COMUNIDAD (Barra compacta con afiche desplegable) */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="glass-panel-opal rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-emerald-500/20 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Taller en Comunidad
                </span>
                <span className="text-xs font-bold text-black dark:text-white truncate">
                  {upcomingEvent.title}
                </span>
              </div>
              <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400 mt-0.5">
                {upcomingEvent.displayDate} ({upcomingEvent.time}) • Taller Abierto para Participantes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowEventBanner(!showEventBanner)}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <span>{showEventBanner ? 'Ocultar Afiche' : 'Ver Afiche & Contador'}</span>
            {showEventBanner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showEventBanner && (
          <div className="animate-fade-in pt-1">
            <PromotionalEventBanner variant="participant" />
          </div>
        )}
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

      {/* ========================================================================= */}
      {/* 3. ESPACIO DE TRABAJO COMPLETO DE LA SESIÓN SELECCIONADA (SOLO SI ESTÁ HABILITADO) */}
      {/* ========================================================================= */}
      {client.transformationSpacesEnabled && (
        <section id="session-workspace-content" className="w-full">
        <div className="glass-panel-sheer rounded-3xl p-5 sm:p-7 lg:p-8 space-y-6 sm:space-y-7">
          {/* Header: Selected Session & Level Information */}
          <div className="pb-6 border-b border-black/5 dark:border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-[#202024]/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 text-[11px] font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-widest">
                <span>{activeNodeInfo.level}: {activeNodeInfo.levelTitle}</span>
                <span>•</span>
                <span>{activeNodeInfo.weekLabel}</span>
              </div>

              {/* Level Tag & Quick Actions */}
              <div className="flex items-center gap-2">
                {isNodeLocked ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 text-[11px] font-semibold uppercase tracking-wider">
                    <Lock className="w-3 h-3" />
                    Área Inactiva • Próximo Nivel
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Sesión Habilitada
                  </span>
                )}
                <span className="text-[11px] font-light text-gray-400 dark:text-neutral-500">
                  Nodo {activeNodeInfo.step} de 6
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
                  Sesión {activeNodeInfo.step}: {activeNodeInfo.sessionTitle}
                </h2>
                <p className="text-xs sm:text-sm font-light text-gray-600 dark:text-neutral-300 mt-2 leading-relaxed bg-white/50 dark:bg-[#202024]/50 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/60 dark:border-neutral-800 max-w-3xl">
                  <strong className="font-medium text-black dark:text-white block mb-1">
                    Propósito ontológico de esta etapa:
                  </strong>
                  {activeNodeInfo.objective}
                </p>
              </div>

              {/* Quick PDF actions in header if unlocked */}
              {!isNodeLocked && (
                <div className="flex flex-row md:flex-col gap-2 shrink-0 self-start md:self-center">
                  <button
                    type="button"
                    onClick={() =>
                      PDFGenerator.generateLevelWorkbookPDF(
                        activeNodeInfo,
                        client,
                        existingForm
                      )
                    }
                    className="py-2.5 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                    <span>Descargar Cuaderno PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      PDFGenerator.generateReinforcementPackPDF(
                        activeNodeInfo,
                        client
                      )
                    }
                    className="py-2 px-3 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>Fichas de Refuerzo</span>
                  </button>
                </div>
              )}
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
              {/* Navigation Tabs for Workspace: Súper claras, numeradas y con estado */}
              <div className="flex border-b border-gray-100 dark:border-neutral-800 gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('workbook');
                  setUnifiedWorkbookMode('workshop');
                }}
                className={`pb-3 px-3.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'workbook' || activeTab === 'form'
                    ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                    : 'text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>📘 1. Mi Cuaderno & Cuestionarios</span>
                {existingForm ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    ✅ Listo
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                    ✍️ Por responder
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('materials')}
                className={`pb-3 px-3.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'materials'
                    ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                    : 'text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300'
                }`}
              >
                <Compass className="w-4 h-4 text-blue-500" />
                <span>💡 2. Guía de la Sesión</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reinforcement')}
                className={`pb-3 px-3.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'reinforcement'
                    ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                    : 'text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300'
                }`}
              >
                <Headphones className="w-4 h-4 text-purple-500" />
                <span>🎧 3. Audio & Prácticas</span>
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
              <div id="unified-workbook-space" className="animate-fade-in">
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
                  hideHeader={true}
                  hideStepSelector={true}
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
      </section>
      )}

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

    </div>
  );
};
