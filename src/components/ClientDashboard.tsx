import React, { useState } from 'react';
import {
  User,
  Session,
  FormSubmission,
  AIInsight,
  ProgramNodeInfo,
  PostSessionForm,
} from '../types';
import { OntologicalStore, PROGRAM_NODES } from '../services/store';
import { PDFGenerator } from '../utils/pdfGenerator';
import { LiquidGlassButton } from './LiquidGlassButton';
import { PulseBadge } from './PulseBadge';
import { PromotionalEventBanner } from './PromotionalEventBanner';
import { PaymentUnlockModal } from './PaymentUnlockModal';
import { PostSessionWorkbookModal } from './PostSessionWorkbookModal';
import { GeminiOntologicalCopilot } from './GeminiOntologicalCopilot';
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
  MessageCircle,
  Zap,
} from 'lucide-react';

interface ClientDashboardProps {
  client: User;
}

type WorkspaceTab = 'materials' | 'reinforcement' | 'form' | 'workbook' | 'gemini';

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ client }) => {
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

  // 1-on-1 Session Questionnaire & Workbook Modal State (for participants)
  const [isSessionWorkbookModalOpen, setIsSessionWorkbookModalOpen] = useState(false);
  const [sessionForWorkbook, setSessionForWorkbook] = useState<Session | null>(null);

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
    <div className="min-h-screen bg-white dark:bg-[#0D0D0E] text-black dark:text-neutral-100 py-10 px-4 sm:px-6 max-w-6xl mx-auto space-y-12 transition-colors duration-200">
      {/* Personalized Greeting & Program Status Banner */}
      <section className="pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-neutral-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F9F9F9] dark:bg-[#18181B] border border-gray-100 dark:border-neutral-800 text-xs font-light text-gray-500 dark:text-neutral-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
              Programa 1 a 1 • 12 Semanas
            </div>

            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-black dark:text-white">
              Bienvenido(a),{' '}
              <span className="font-semibold text-black dark:text-white">
                {client.name}
              </span>
            </h1>
            <p className="text-sm font-light text-gray-500 dark:text-neutral-400 mt-1.5 max-w-xl leading-relaxed">
              Programa:{' '}
              <strong>
                {client.programName || 'Certeza, Fronteras & Dirección Personal'}
              </strong>
            </p>
          </div>

          {/* Payment Status and Roadmap Progress Pill */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <div className="px-4 py-2 rounded-2xl bg-[#F9F9F9] dark:bg-[#18181B] border border-gray-100 dark:border-neutral-800 text-xs">
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-neutral-500 block">
                Estado del Programa
              </span>
              <span className="font-semibold text-black dark:text-white flex items-center gap-1.5 mt-0.5">
                <CreditCard className="w-3.5 h-3.5 text-black dark:text-white" />
                {client.paymentStatus || 'Completado'}
              </span>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs">
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

      {/* AI Advertising Banner: Próximo Evento / Conversatorio en Cronograma */}
      <section className="space-y-3">
        <PromotionalEventBanner />
      </section>

      {/* Grid: Left Column (Next Session & Program Roadmap) / Right Column (Active Session Workspace & Materials) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Next Session & 12-Week Roadmap Explorer (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Próxima Sesión */}
          <div className="bg-[#F9F9F9] dark:bg-[#18181B] rounded-3xl p-7 border border-gray-100 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                Próxima Sesión Quincenal
              </span>
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
            </div>

            {nextSession ? (
              <div className="space-y-5">
                <div>
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

                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-semibold text-black dark:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
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
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar Sesión 1 a 1</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Card: 12-Week Roadmap Level Explorer */}
          <div className="bg-white dark:bg-[#18181B] rounded-3xl p-7 border border-gray-100 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
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
                                  {isCurrent && (
                                    <span className="text-[8px] font-semibold bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                                      En curso
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

            {/* Cuaderno & Cuestionario del Taller */}
            <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
                  Cuaderno & Cuestionario • Taller {activeNodeInfo.step}
                </span>
                {existingForm ? (
                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    Cuestionario Listo
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/40">
                    Pendiente
                  </span>
                )}
              </div>

              {/* Botón directo para ir al formulario del cuestionario */}
              <button
                type="button"
                onClick={() => {
                  if (isNodeLocked) {
                    handleOpenPaymentForNode(activeNodeInfo);
                  } else {
                    setActiveTab('form');
                    const formElement = document.getElementById('session-workspace-content');
                    if (formElement) {
                      formElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-700" />
                <span>
                  {existingForm
                    ? 'Editar Cuestionario del Taller'
                    : '✍️ Diligenciar Cuestionario del Taller'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isNodeLocked) {
                      handleOpenPaymentForNode(activeNodeInfo);
                    } else {
                      PDFGenerator.generateLevelWorkbookPDF(
                        activeNodeInfo,
                        client,
                        existingForm
                      );
                    }
                  }}
                  className={`px-3 py-2 rounded-xl border text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isNodeLocked
                      ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                      : existingForm
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold'
                      : 'bg-[#F9F9F9] dark:bg-[#202024] hover:bg-gray-200/60 dark:hover:bg-neutral-800 border-gray-200/80 dark:border-neutral-700 text-black dark:text-white'
                  }`}
                  title={
                    existingForm
                      ? 'Descargar Cuaderno PDF con tus respuestas del cuestionario'
                      : 'Descargar Cuaderno PDF'
                  }
                >
                  {isNodeLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span>{isNodeLocked ? 'Desbloquear PDF' : 'Cuaderno PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isNodeLocked) {
                      handleOpenPaymentForNode(activeNodeInfo);
                    } else {
                      PDFGenerator.generateReinforcementPackPDF(
                        activeNodeInfo,
                        client
                      );
                    }
                  }}
                  className={`px-3 py-2 rounded-xl border text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isNodeLocked
                      ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                      : 'bg-[#F9F9F9] dark:bg-[#202024] hover:bg-gray-200/60 dark:hover:bg-neutral-800 border-gray-200/80 dark:border-neutral-700 text-black dark:text-white'
                  }`}
                >
                  {isNodeLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {isNodeLocked ? 'Desbloquear Refuerzo' : 'Refuerzo PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Level Workspace & Work Materials (7 Cols) */}
        <div className="lg:col-span-7" id="session-workspace-content">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-9 border border-gray-100 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-7">
            {/* Header: Selected Session & Level Information */}
            <div className="pb-6 border-b border-gray-100 dark:border-neutral-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 text-[11px] font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-widest">
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
                <p className="text-xs sm:text-sm font-light text-gray-600 dark:text-neutral-300 mt-2 leading-relaxed bg-[#F9F9F9] dark:bg-[#202024] p-4 rounded-2xl border border-gray-100 dark:border-neutral-800">
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
                      href={`https://wa.me/573158894411?text=${encodeURIComponent(
                        `Hola John, deseo formalizar el pago de mi Próximo Nivel (${activeNodeInfo.level}: ${activeNodeInfo.sessionTitle}) en el programa Raíz y Balance.`
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
                onClick={() => setActiveTab('form')}
                className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-all cursor-pointer relative flex items-center gap-2 ${
                  activeTab === 'form'
                    ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                    : 'text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Cuestionario del Taller</span>
                {existingForm ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                    Listo
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('workbook')}
                className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-all cursor-pointer relative flex items-center gap-2 ${
                  activeTab === 'workbook'
                    ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                    : 'text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Cuadernos Sesión 1 a 1</span>
                {postSessionForms.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                    {postSessionForms.length}
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
            {/* TAB 3: FORMULARIO & REGISTRO DE QUIEBRES */}
            {/* ========================================================================= */}
            {activeTab === 'form' && (
              <div className="space-y-6">
                {/* Explanatory banner for participants */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3 text-xs text-emerald-950 dark:text-emerald-200">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="font-semibold block">
                      Cuestionario para Construir tu Cuaderno de Trabajo • Taller {activeNodeInfo.step}
                    </strong>
                    <span className="font-light text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                      Este cuestionario está diseñado para que como participante registres tus sensaciones corporales, quiebres ontológicos y reflexiones. Al completarlo, tus respuestas se transfieren directamente a tu <strong>Cuaderno de Trabajo en PDF</strong> para que lo descargues con tu bitácora integrada.
                    </span>
                  </div>
                </div>

                {isNodeLocked ? (
                  <div className="py-12 px-6 rounded-3xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 text-center space-y-4 max-w-lg mx-auto">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold text-black dark:text-white">
                        Formulario de Sesión Inactivo
                      </h3>
                      <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                        El formulario de registro y autodiagnóstico ontológico de la Sesión {activeNodeInfo.step} se habilitará una vez formalices el pago de tu próximo nivel ({activeNodeInfo.level}).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenPaymentForNode(activeNodeInfo)}
                      className="px-5 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-medium inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Enlace de Pago • Tu Próximo Nivel</span>
                    </button>
                  </div>
                ) : existingForm && !isEditingExisting ? (
                  <div className="space-y-6">
                    {/* Header with completion info and Download PDF button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-black dark:text-white">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[1.5]" />
                          Cuestionario Registrado con Éxito
                        </div>
                        <span className="text-[11px] font-light text-gray-400 dark:text-neutral-500 block mt-0.5">
                          Enviado el {formattedDate(existingForm.submittedAt)} • Cuaderno de trabajo listo
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            PDFGenerator.generateLevelWorkbookPDF(
                              activeNodeInfo,
                              client,
                              existingForm
                            )
                          }
                          className="px-3.5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                          title="Descargar Cuaderno PDF con tus respuestas"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                          <span>Descargar Cuaderno PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            PDFGenerator.generateFormSubmissionPDF(
                              existingForm,
                              client,
                              activeNodeInfo,
                              nodeInsight
                            )
                          }
                          className="px-3 py-2 rounded-xl bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          Ficha PDF
                        </button>

                        <button
                          type="button"
                          onClick={handleStartEditForm}
                          className="p-2 rounded-xl bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          title="Editar respuestas del cuestionario"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Submitted details */}
                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="font-semibold text-black dark:text-white uppercase tracking-wider block mb-1">
                          1. Emoción Somática en el Cuerpo:
                        </span>
                        <p className="font-light text-gray-700 dark:text-neutral-300 bg-[#F9F9F9] dark:bg-[#202024] p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 leading-relaxed">
                          {existingForm.bodyEmotion}
                        </p>
                      </div>

                      {existingForm.levelSpecificAnswer && (
                        <div>
                          <span className="font-semibold text-black dark:text-white uppercase tracking-wider block mb-1">
                            2. Respuesta al Eje de Indagación:
                          </span>
                          <p className="font-light text-gray-700 dark:text-neutral-300 bg-[#F9F9F9] dark:bg-[#202024] p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 leading-relaxed">
                            {existingForm.levelSpecificAnswer}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="font-semibold text-black dark:text-white uppercase tracking-wider block mb-1">
                          3. Reflexiones, Juicios y Acuerdos Ontológicos:
                        </span>
                        <p className="font-light text-gray-700 dark:text-neutral-300 bg-[#F9F9F9] dark:bg-[#202024] p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 leading-relaxed">
                          {existingForm.reflections}
                        </p>
                      </div>
                    </div>

                    {/* Ontological AI Diagnostic preview if available */}
                    {nodeInsight && (
                      <div className="p-6 rounded-3xl bg-black dark:bg-[#222226] border dark:border-neutral-700 text-white space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-300 dark:text-neutral-400">
                            <Brain className="w-4 h-4 text-white" />
                            Síntesis de Coherencia Ontológica
                          </div>
                          <PulseBadge flag={nodeInsight.pulseFlag} size="sm" />
                        </div>
                        <p className="text-xs font-light text-gray-200 dark:text-neutral-200 leading-relaxed">
                          {nodeInsight.emotionalWisdom}
                        </p>

                        {nodeInsight.linguisticBarriers?.length > 0 && (
                          <div className="pt-3 border-t border-neutral-700/60 space-y-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              Quiebres & Barreras Identificadas
                            </span>
                            <div className="space-y-1">
                              {nodeInsight.linguisticBarriers.map(
                                (b, idx) => (
                                  <div
                                    key={idx}
                                    className="text-[11px] font-light text-gray-300 flex items-start gap-1.5"
                                  >
                                    <span className="text-gray-500">•</span>
                                    <span>{b}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitForm} className="space-y-7">
                    {/* Header if editing */}
                    {isEditingExisting && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                        <span>Editando registro previo de la Sesión {activeNodeInfo.step}</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingExisting(false)}
                          className="underline cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}

                    {/* Field 1: Bodily Somatic Sensation */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
                        1. ¿Qué emoción tiene una fuerte presencia en tu cuerpo hoy?
                      </label>
                      <p className="text-xs font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                        Ubica la sensación somática exacta (tensión en mandíbula, opresión en el pecho, rigidez en hombros, liviandad, expansión) y cómo afecta tu respiración.
                      </p>
                      <textarea
                        rows={3}
                        value={bodyEmotion}
                        onChange={(e) => setBodyEmotion(e.target.value)}
                        placeholder="Ej. Siento una opresión densa en el pecho y rigidez en la mandíbula al pensar en los plazos del proyecto..."
                        required
                        className="w-full px-4 py-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 font-light focus:bg-white dark:focus:bg-[#26262B] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all resize-y"
                      />
                    </div>

                    {/* Field 2: Level-Specific Reflection Question */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
                        2. {activeNodeInfo.keyQuestion}
                      </label>
                      <p className="text-xs font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                        {activeNodeInfo.levelPrompt}
                      </p>
                      <textarea
                        rows={3}
                        value={levelSpecificAnswer}
                        onChange={(e) => setLevelSpecificAnswer(e.target.value)}
                        placeholder="Escribe aquí tu observación específica para este nivel..."
                        className="w-full px-4 py-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 font-light focus:bg-white dark:focus:bg-[#26262B] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all resize-y"
                      />
                    </div>

                    {/* Field 3: General Ontological Reflections */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
                        3. Reflexiones, Juicios y Acuerdos
                      </label>
                      <p className="text-xs font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                        ¿Qué juicios automáticos descubriste? ¿Qué conversaciones pendientes o promesas no cumplidas reconoces?
                      </p>
                      <textarea
                        rows={3}
                        value={reflections}
                        onChange={(e) => setReflections(e.target.value)}
                        placeholder="Ej. Me doy cuenta de que he estado asumiendo que mi valor depende de tener todas las respuestas..."
                        required
                        className="w-full px-4 py-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 font-light focus:bg-white dark:focus:bg-[#26262B] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all resize-y"
                      />
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-neutral-800">
                      <div className="text-[11px] font-light text-gray-400 dark:text-neutral-500 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-black dark:text-white" />
                        Espacio confidencial protegido
                      </div>

                      <LiquidGlassButton
                        type="submit"
                        isLoading={isSubmitting}
                        disabled={!bodyEmotion.trim() || !reflections.trim()}
                        icon={<Download className="w-4 h-4 stroke-[1.5]" />}
                      >
                        {isEditingExisting
                          ? 'Actualizar y Guardar en Cuaderno PDF'
                          : 'Guardar Cuestionario y Construir Cuaderno PDF'}
                      </LiquidGlassButton>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Sub-Tab 4: Cuaderno de Trabajo Post-Sesión */}
            {activeTab === 'workbook' && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-neutral-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black">
                          Bitácora de Coherencia
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {client.paymentStatus === 'Completado' ? 'Taller 100% Pagado' : client.paymentStatus}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-black dark:text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span>Cuadernos de Trabajo de Sesiones 1 a 1</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                        Documentación de tus quiebres, juicios maestros y acuerdos de acción tras cada sesión 1 a 1 con John Fredy Rengifo Basto.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSessionForWorkbook(sessions[0] || null);
                        setIsSessionWorkbookModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-auto"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-700" />
                      <span>✍️ Diligenciar Cuestionario de Sesión</span>
                    </button>
                  </div>

                  {postSessionForms.length > 0 ? (
                    <div className="space-y-6">
                      {postSessionForms.map((pForm) => {
                        const associatedSession = sessions.find((s) => s.id === pForm.sessionId);
                        return (
                          <div
                            key={pForm.id}
                            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-neutral-800 space-y-5 shadow-2xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-neutral-800">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black">
                                    Sesión {pForm.sessionNumber}
                                  </span>
                                  <span className="text-xs text-gray-400 font-light">
                                    {formattedDate(pForm.sessionDate || pForm.submittedAt)}
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-black dark:text-white">
                                  {pForm.workbookTitle || `Sesión ${pForm.sessionNumber}: Cuaderno Ontológico`}
                                </h4>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSessionForWorkbook(associatedSession || null);
                                    setIsSessionWorkbookModalOpen(true);
                                  }}
                                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#202024] border border-gray-200/80 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 text-xs font-medium hover:text-black dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                  title="Editar cuestionario de sesión"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Editar Cuestionario</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => PDFGenerator.generateSessionWorkbookPDF(pForm, client, associatedSession)}
                                  className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer inline-flex items-center gap-2 shadow-2xs"
                                >
                                  <FileDown className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-700" />
                                  <span>Descargar Cuaderno PDF</span>
                                </button>
                              </div>
                            </div>

                            {/* Key Declaration */}
                            {pForm.coacheeKeyDeclaration && (
                              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5 uppercase tracking-wider text-[10px]">
                                  Declaración Clave de tu Sesión:
                                </span>
                                <p className="italic text-emerald-950 dark:text-emerald-200 font-medium">
                                  &quot;{pForm.coacheeKeyDeclaration}&quot;
                                </p>
                              </div>
                            )}

                            {/* The 4 core dimensions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1.5">
                                <span className="text-[11px] font-bold text-black dark:text-white flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">1</span>
                                  Emoción & Apertura Corporal
                                </span>
                                <p className="text-xs text-gray-600 dark:text-neutral-300 font-light leading-relaxed">
                                  {pForm.coacheeEmotionAndOpenness}
                                </p>
                              </div>

                              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1.5">
                                <span className="text-[11px] font-bold text-black dark:text-white flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">2</span>
                                  Juicio Maestro & Creencia Raíz
                                </span>
                                <p className="text-xs text-gray-600 dark:text-neutral-300 font-light leading-relaxed">
                                  {pForm.masterJudgmentAndNarrative}
                                </p>
                              </div>

                              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1.5">
                                <span className="text-[11px] font-bold text-black dark:text-white flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">3</span>
                                  Cambio de Observador & Consciencia
                                </span>
                                <p className="text-xs text-gray-600 dark:text-neutral-300 font-light leading-relaxed">
                                  {pForm.perspectiveShiftEvidence}
                                </p>
                              </div>

                              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1.5">
                                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] flex items-center justify-center font-bold">4</span>
                                  Foco de Competencia ICF
                                </span>
                                <p className="text-xs text-gray-600 dark:text-neutral-300 font-light leading-relaxed">
                                  {pForm.directivenessAndIcfCompetency}
                                </p>
                              </div>
                            </div>

                            {/* Agreed Action Items */}
                            {pForm.agreedActionItems && pForm.agreedActionItems.length > 0 && (
                              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-2">
                                <strong className="text-xs font-bold text-black dark:text-white block">
                                  Tus Compromisos de Acción Acordados:
                                </strong>
                                <ul className="space-y-1">
                                  {pForm.agreedActionItems.map((act, i) => (
                                    <li key={i} className="text-xs text-gray-600 dark:text-neutral-300 flex items-start gap-2 font-light">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                      <span>{act}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Somatic Homework */}
                            {pForm.somaticHomework && (
                              <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/30 text-xs space-y-1">
                                <strong className="text-purple-900 dark:text-purple-300 font-bold block">
                                  Práctica Somática y Corporal entre Sesiones:
                                </strong>
                                <p className="text-purple-950 dark:text-purple-200 font-light leading-relaxed">
                                  {pForm.somaticHomework}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center rounded-2xl bg-white dark:bg-[#18181B] border border-gray-100 dark:border-neutral-800 space-y-2">
                      <BookOpen className="w-10 h-10 text-gray-300 dark:text-neutral-700 mx-auto" />
                      <h4 className="text-xs font-semibold text-black dark:text-white">
                        Tu Cuaderno de Trabajo se generará al finalizar tu próxima sesión 1 a 1
                      </h4>
                      <p className="text-[11px] text-gray-400 font-light max-w-sm mx-auto">
                        Aquí encontrarás tus reflexiones, quiebres ontológicos y el plan de acción descargable en PDF una vez finalizado el encuentro con tu Coach.
                      </p>
                    </div>
                  )}
                </div>
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
        onClose={() => setIsPaymentModalOpen(false)}
        node={unlockTargetNode}
        client={client}
        onUnlocked={handleNodeUnlocked}
      />
    </div>
  );
};
