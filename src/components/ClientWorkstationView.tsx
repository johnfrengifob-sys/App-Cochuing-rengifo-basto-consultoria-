import React, { useState } from 'react';
import {
  User,
  FormSubmission,
  AIInsight,
  Session,
  ClientStatus,
  ProgramNodeInfo,
  PostSessionForm,
} from '../types';
import { PROGRAM_NODES, OntologicalStore } from '../services/store';
import { PDFGenerator } from '../utils/pdfGenerator';
import { LiquidGlassButton } from './LiquidGlassButton';
import { PulseBadge } from './PulseBadge';
import { ClientTrafficStatusBadge } from './ClientTrafficStatusBadge';
import { GeminiOntologicalCopilot } from './GeminiOntologicalCopilot';
import { PostSessionWorkbookModal } from './PostSessionWorkbookModal';
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Brain,
  FileText,
  DollarSign,
  HeartPulse,
  Plus,
  Video,
  ChevronRight,
  Download,
  FileDown,
  CheckCircle2,
  AlertCircle,
  Quote,
  Layers,
  Edit2,
  Check,
  X,
  Lock,
  ExternalLink,
  BookOpen,
  Award,
  Compass,
  Shield,
  Copy,
} from 'lucide-react';

interface ClientWorkstationViewProps {
  client: User;
  forms: FormSubmission[];
  insights: AIInsight[];
  sessions: Session[];
  isGeneratingAI: boolean;
  generationFeedback: {
    type: 'success' | 'info' | 'error';
    message: string;
    payloadPreview?: string;
  } | null;
  onBackToDirectory: () => void;
  onUpdateClientStatus: (status: ClientStatus) => void;
  onUpdateClientBreakdown: (breakdown: string) => void;
  onUpdateClientInvested: (invested: string) => void;
  onAdvanceStep: () => void;
  onOpenNewSessionModal: () => void;
  onGenerateAIAnalysis: () => void;
}

export const ClientWorkstationView: React.FC<ClientWorkstationViewProps> = ({
  client,
  forms,
  insights,
  sessions,
  isGeneratingAI,
  generationFeedback,
  onBackToDirectory,
  onUpdateClientStatus,
  onUpdateClientBreakdown,
  onUpdateClientInvested,
  onAdvanceStep,
  onOpenNewSessionModal,
  onGenerateAIAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'sessions' | 'workbook' | 'forms' | 'nodes' | 'report' | 'gemini'>('diagnosis');
  const [isEditingBreakdown, setIsEditingBreakdown] = useState(false);
  const [tempBreakdown, setTempBreakdown] = useState(client.primaryBreakdown || '');
  const [isEditingInvested, setIsEditingInvested] = useState(false);
  const [tempInvested, setTempInvested] = useState(client.totalInvested || client.programFee || '$1.500.000 COP');

  // Post-session form & workbook state
  const [isWorkbookModalOpen, setIsWorkbookModalOpen] = useState(false);
  const [selectedSessionForWorkbook, setSelectedSessionForWorkbook] = useState<Session | null>(null);
  const [postSessionForms, setPostSessionForms] = useState<PostSessionForm[]>(() =>
    OntologicalStore.getPostSessionFormsForClient(client.uid)
  );
  const [copiedCalendar, setCopiedCalendar] = useState(false);

  const handleOpenWorkbookForSession = (sess: Session) => {
    setSelectedSessionForWorkbook(sess);
    setIsWorkbookModalOpen(true);
  };

  const handleWorkbookSaved = (savedForm: PostSessionForm) => {
    setPostSessionForms(OntologicalStore.getPostSessionFormsForClient(client.uid));
  };

  const latestInsight = insights[0] || null;
  const latestForm = forms[0] || null;
  const currentStep = client.programProgress || 1;
  const currentNodeInfo = PROGRAM_NODES.find((n) => n.step === currentStep) || PROGRAM_NODES[0];

  const handleSaveBreakdown = () => {
    onUpdateClientBreakdown(tempBreakdown);
    setIsEditingBreakdown(false);
  };

  const handleSaveInvested = () => {
    onUpdateClientInvested(tempInvested);
    setIsEditingInvested(false);
  };

  const handleDownloadPDF = () => {
    const dummyForm: FormSubmission = latestForm || {
      id: `form-${client.uid}-latest`,
      clientId: client.uid,
      sessionId: `ses-${client.uid}-current`,
      sessionStep: currentStep,
      level: currentNodeInfo.level,
      bodyEmotion: latestInsight?.emotionalWisdom || 'Registro somático en proceso de indagación.',
      reflections: client.primaryBreakdown || 'Quiebre ontológico en exploración.',
      submittedAt: new Date().toISOString(),
    };
    PDFGenerator.generateFormSubmissionPDF(
      dummyForm,
      client,
      currentNodeInfo,
      latestInsight || undefined
    );
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Top Bar: Back navigation & Fast status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
        <button
          type="button"
          onClick={onBackToDirectory}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-xs font-semibold text-gray-700 dark:text-neutral-300 transition-all cursor-pointer shadow-2xs self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Directorio de Clientes</span>
        </button>

        {/* Traffic Light Quick Status */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-light">Estado del Proceso:</span>
          <ClientTrafficStatusBadge
            status={client.status || 'active'}
            onChangeStatus={onUpdateClientStatus}
            size="md"
          />
        </div>
      </div>

      {/* Main Client Profile Header & Strategic Cards */}
      <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar & Identifiers */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <img
                src={client.avatarUrl}
                alt={client.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-sm ring-2 ring-gray-100 dark:ring-neutral-800"
              />
              {latestInsight && (
                <div className="absolute -bottom-1 -right-1">
                  <PulseBadge flag={latestInsight.pulseFlag} size="sm" showLabel={false} />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
                  {client.name}
                </h1>
                {latestInsight && (
                  <PulseBadge flag={latestInsight.pulseFlag} size="sm" />
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400">
                {client.title || 'Cliente Directivo'} • <span className="font-mono text-gray-400">{client.email}</span>
              </p>
              <div className="text-[11px] text-gray-400 font-light flex items-center gap-2 pt-1">
                <span>Miembro desde: {client.joinedAt || '2024'}</span>
                <span>•</span>
                <span>Programa: Certeza, Fronteras & Dirección (12 Semanas)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenNewSessionModal}
              className="px-4 py-2.5 rounded-2xl border border-gray-200/90 dark:border-neutral-700 bg-white dark:bg-[#1A1A1E] hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:border-black dark:hover:border-neutral-500"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar Sesión</span>
            </button>

            <LiquidGlassButton
              onClick={onGenerateAIAnalysis}
              isLoading={isGeneratingAI}
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />}
            >
              Generar Diagnóstico IA
            </LiquidGlassButton>
          </div>
        </div>

        {/* Row 2: Inversión en Progreso & Quiebre Principal Sintético */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-neutral-800">
          {/* Card 1: Inversión Total Invertida */}
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-4 border border-gray-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Inversión Total en el Programa
              </span>
              {isEditingInvested ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={tempInvested}
                    onChange={(e) => setTempInvested(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-black dark:border-white bg-white dark:bg-[#151518] text-xs font-mono font-bold text-black dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleSaveInvested}
                    className="p-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingInvested(false)}
                    className="p-1.5 rounded-lg bg-gray-200 dark:bg-neutral-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold font-mono text-black dark:text-white">
                    {client.totalInvested || client.programFee || '$1.500.000 COP'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-light">
                    ({client.paymentStatus || 'Completado'})
                  </span>
                </div>
              )}
            </div>

            {!isEditingInvested && (
              <button
                type="button"
                onClick={() => {
                  setTempInvested(client.totalInvested || client.programFee || '$1.500.000 COP');
                  setIsEditingInvested(true);
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-neutral-800 transition-colors"
                title="Editar valor invertido"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Card 2: Quiebre Principal Sintético (Corto y sustancioso) */}
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-4 border border-gray-100 dark:border-neutral-800 flex items-start justify-between">
            <div className="space-y-1 flex-1 pr-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                <Brain className="w-3 h-3 text-black dark:text-white" />
                Quiebre Principal Ontológico (Sintético)
              </span>

              {isEditingBreakdown ? (
                <div className="space-y-2 mt-1">
                  <input
                    type="text"
                    value={tempBreakdown}
                    onChange={(e) => setTempBreakdown(e.target.value)}
                    placeholder="Ej: Gestión de la ira, Trato con sus padres..."
                    className="w-full px-2.5 py-1 rounded-lg border border-black dark:border-white bg-white dark:bg-[#151518] text-xs text-black dark:text-white"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveBreakdown}
                      className="px-2.5 py-1 rounded-md bg-black dark:bg-white text-white dark:text-black text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Guardar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingBreakdown(false)}
                      className="px-2 py-1 rounded-md bg-gray-200 dark:bg-neutral-700 text-[11px]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-semibold text-black dark:text-white leading-snug">
                  &ldquo;{client.primaryBreakdown || 'Fronteras, auto-observación y claridad directiva'}&rdquo;
                </p>
              )}
            </div>

            {!isEditingBreakdown && (
              <button
                type="button"
                onClick={() => {
                  setTempBreakdown(client.primaryBreakdown || '');
                  setIsEditingBreakdown(true);
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-neutral-800 transition-colors shrink-0"
                title="Editar quiebre principal"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Progression Bar of 12-week program */}
        <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                Ruta del Programa (12 Semanas)
              </span>
              <div className="text-xs font-semibold text-black dark:text-white mt-0.5">
                Nodo Actual: Sesión {currentStep} de 6 — {currentNodeInfo.sessionTitle}
              </div>
            </div>

            {currentStep < 6 && (
              <button
                type="button"
                onClick={() => onAdvanceStep(client.uid)}
                className="text-[11px] px-3 py-1 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Avanzar a Sesión {currentStep + 1}
              </button>
            )}
          </div>

          <div className="grid grid-cols-6 gap-2">
            {PROGRAM_NODES.map((node) => {
              const isDone = node.step < currentStep;
              const isCurrent = node.step === currentStep;

              return (
                <div
                  key={node.step}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs'
                      : isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-gray-50 dark:bg-neutral-900 text-gray-400 dark:text-neutral-500 border-gray-100 dark:border-neutral-800'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider">
                    Sesión {node.step}
                  </div>
                  <div className="text-[10px] font-medium truncate mt-0.5">
                    {node.level}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generation Feedback alert */}
      {generationFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            generationFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{generationFeedback.message}</p>
              {generationFeedback.payloadPreview && (
                <pre className="mt-2 p-3 bg-black/5 dark:bg-white/5 rounded-xl font-mono text-[10px] overflow-x-auto">
                  {generationFeedback.payloadPreview}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Selector for grouped functions */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 dark:bg-neutral-900 rounded-2xl border border-gray-200/80 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setActiveTab('diagnosis')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'diagnosis'
              ? 'bg-white dark:bg-[#1A1A1E] text-black dark:text-white shadow-2xs'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Diagnóstico & Quiebres IA</span>
          {insights.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-neutral-700">
              {insights.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'sessions'
              ? 'bg-white dark:bg-[#1A1A1E] text-black dark:text-white shadow-2xs'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Sesiones & Calendario</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-neutral-700">
            {sessions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workbook')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'workbook'
              ? 'bg-white dark:bg-[#1A1A1E] text-black dark:text-white shadow-2xs'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Cuaderno Post-Sesión</span>
          {postSessionForms.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
              {postSessionForms.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('forms')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'forms'
              ? 'bg-white dark:bg-[#1A1A1E] text-black dark:text-white shadow-2xs'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Reflexiones & Formularios</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-neutral-700">
            {forms.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nodes')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'nodes'
              ? 'bg-white dark:bg-[#1A1A1E] text-black dark:text-white shadow-2xs'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Materiales del Nodo {currentStep}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'report'
              ? 'bg-white dark:bg-[#1A1A1E] text-black dark:text-white shadow-2xs'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Informe PDF</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gemini')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'gemini'
              ? 'bg-black dark:bg-white text-white dark:text-black shadow-2xs'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Gemini 3.7 Copiloto</span>
        </button>
      </div>

      {/* Tab 1: Diagnóstico IA & Quiebres */}
      {activeTab === 'diagnosis' && (
        <div className="space-y-6">
          {latestInsight ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coherencia Somática & Emocional */}
              <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-neutral-800">
                  <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-semibold text-sm text-black dark:text-white">
                    Coherencia Somática & Emocional
                  </h3>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-gray-700 dark:text-neutral-300">
                  <div>
                    <span className="font-semibold text-black dark:text-white block mb-1">
                      Sabiduría Emocional Identificada:
                    </span>
                    <p className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-2xl border border-gray-100 dark:border-neutral-800">
                      {latestInsight.emotionalWisdom}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-black dark:text-white block mb-1">
                      Patrones Somáticos & Corporales:
                    </span>
                    <p className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-2xl border border-gray-100 dark:border-neutral-800">
                      {latestInsight.somaticPatterns}
                    </p>
                  </div>
                </div>
              </div>

              {/* Barreras Lingüísticas & Creencias Limitantes */}
              <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-neutral-800">
                  <Brain className="w-4 h-4 text-black dark:text-white" />
                  <h3 className="font-semibold text-sm text-black dark:text-white">
                    Estructura Lingüística & Creencias Limitantes
                  </h3>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-gray-700 dark:text-neutral-300">
                  <div>
                    <span className="font-semibold text-black dark:text-white block mb-1">
                      Juicios y Creencias Raíz:
                    </span>
                    <p className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-2xl border border-gray-100 dark:border-neutral-800">
                      {latestInsight.limitingBeliefs}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-black dark:text-white block mb-1">
                      Barreras del Lenguaje & Juicios Automáticos:
                    </span>
                    <p className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-2xl border border-gray-100 dark:border-neutral-800">
                      {latestInsight.linguisticBarriers}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preguntas de Quiebre Ontológico */}
              <div className="lg:col-span-2 bg-white dark:bg-[#151518] rounded-3xl p-6 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-neutral-800">
                  <Quote className="w-4 h-4 text-black dark:text-white" />
                  <h3 className="font-semibold text-sm text-black dark:text-white">
                    Preguntas Poderosas de Indagación para la Próxima Sesión
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {latestInsight.actionQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 text-xs font-light text-gray-800 dark:text-neutral-200 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>&ldquo;{q}&rdquo;</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#151518] rounded-3xl p-10 text-center border border-gray-200/80 dark:border-neutral-800 space-y-3">
              <Brain className="w-10 h-10 text-gray-300 dark:text-neutral-600 mx-auto" />
              <h4 className="font-semibold text-sm text-black dark:text-white">
                Aún no hay un diagnóstico ontológico generado para {client.name}
              </h4>
              <p className="text-xs text-gray-400 font-light max-w-md mx-auto">
                Haz clic en el botón superior &ldquo;Generar Diagnóstico IA&rdquo; para analizar la corporalidad, lenguaje y quiebres inconscientes del cliente.
              </p>
              <LiquidGlassButton
                onClick={onGenerateAIAnalysis}
                isLoading={isGeneratingAI}
                size="sm"
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Generar Diagnóstico IA Ahora
              </LiquidGlassButton>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sesiones & Calendario */}
      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-neutral-800">
            <div>
              <h3 className="font-semibold text-sm text-black dark:text-white">
                Historial y Agenda de Sesiones 1 a 1
              </h3>
              <p className="text-xs text-gray-400 font-light">
                {sessions.length} sesiones registradas con Google Meet integrado
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={OntologicalStore.getCalendarUrl()}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Abrir página oficial de agendamiento de Google Calendar para sesiones 1 a 1"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Agendamiento 1 a 1</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(OntologicalStore.getCalendarUrl());
                  setCopiedCalendar(true);
                  setTimeout(() => setCopiedCalendar(false), 2000);
                }}
                className="px-2.5 py-2 rounded-xl bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 text-xs text-gray-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Copiar link de agendamiento para enviar por WhatsApp o correo al coachee"
              >
                {copiedCalendar ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenNewSessionModal}
                className="px-3.5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Programar Nueva Sesión</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {sessions.map((sess) => {
              const postForm = postSessionForms.find((f) => f.sessionId === sess.id);
              return (
                <div
                  key={sess.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs text-black dark:text-white">
                        Sesión {sess.sessionNumber}: {formatDate(sess.date)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          sess.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {sess.status === 'completed' ? 'Completada' : 'Programada'}
                      </span>
                      {postForm && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Cuaderno Generado</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                      {sess.notes || 'Enfoque: Indagación ontológica y acuerdos de sesión.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Botones de Cuaderno Post-Sesión */}
                    {postForm ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenWorkbookForSession(sess)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-neutral-700 text-xs font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="w-3 h-3 text-blue-600" />
                          <span>Editar Post-Sesión</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => PDFGenerator.generateSessionWorkbookPDF(postForm, client, sess)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer shadow-2xs"
                          title="Descargar Cuaderno de Trabajo en formato PDF para el Coachee"
                        >
                          <Download className="w-3 h-3 text-emerald-400 dark:text-emerald-700" />
                          <span>Descargar Cuaderno PDF</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenWorkbookForSession(sess)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Llenar Formulario Post-Sesión & Generar Cuaderno</span>
                      </button>
                    )}

                    {sess.meetLink && (
                      <a
                        href={sess.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-neutral-700 text-xs font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-2xs"
                      >
                        <Video className="w-3.5 h-3.5 text-red-500" />
                        <span>Google Meet</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Cuaderno de Trabajo Post-Sesión */}
      {activeTab === 'workbook' && (
        <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black">
                  Espacio Post-Sesión
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {client.paymentStatus === 'Completado' ? 'Taller 100% Pagado' : client.paymentStatus}
                </span>
              </div>
              <h3 className="font-bold text-base text-black dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Cuadernos de Trabajo & Evaluaciones Post-Sesión</span>
              </h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                Formularios de reflexión ética y somática tras cada encuentro individual bajo estándares ICF.
              </p>
            </div>

            {sessions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const targetSess = sessions[0];
                  handleOpenWorkbookForSession(targetSess);
                }}
                className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Registro Post-Sesión</span>
              </button>
            )}
          </div>

          {/* List of completed post-session forms */}
          {postSessionForms.length > 0 ? (
            <div className="space-y-6">
              {postSessionForms.map((pForm) => {
                const associatedSession = sessions.find((s) => s.id === pForm.sessionId);
                return (
                  <div
                    key={pForm.id}
                    className="p-5 sm:p-6 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 space-y-4"
                  >
                    {/* Form Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-gray-200 dark:border-neutral-800">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black">
                            Sesión {pForm.sessionNumber}
                          </span>
                          <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
                            {formatDate(pForm.sessionDate || pForm.submittedAt)}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-black dark:text-white">
                          {pForm.workbookTitle || `Sesión ${pForm.sessionNumber}: Cuaderno Ontológico`}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const sess = associatedSession || {
                              id: pForm.sessionId,
                              clientId: client.uid,
                              sessionNumber: pForm.sessionNumber,
                              date: pForm.sessionDate,
                              meetLink: '',
                              status: 'completed',
                            };
                            handleOpenWorkbookForSession(sess);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-neutral-700 text-xs font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Edit2 className="w-3 h-3 text-blue-600" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => PDFGenerator.generateSessionWorkbookPDF(pForm, client, associatedSession)}
                          className="px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Download className="w-3 h-3 text-emerald-400 dark:text-emerald-700" />
                          <span>Descargar Cuaderno PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* The 4 Answered Questions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Q1 */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200/80 dark:border-neutral-800 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-white">
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">1</span>
                          <span>Emoción Principal & Apertura</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-neutral-300 font-light leading-relaxed">
                          {pForm.coacheeEmotionAndOpenness}
                        </p>
                      </div>

                      {/* Q2 */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200/80 dark:border-neutral-800 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-white">
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">2</span>
                          <span>Juicio Maestro & Narrativa</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-neutral-300 font-light leading-relaxed">
                          {pForm.masterJudgmentAndNarrative}
                        </p>
                      </div>

                      {/* Q3 */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200/80 dark:border-neutral-800 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-white">
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">3</span>
                          <span>Cambio de Perspectiva / Consciencia</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-neutral-300 font-light leading-relaxed">
                          {pForm.perspectiveShiftEvidence}
                        </p>
                      </div>

                      {/* Q4 */}
                      <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                          <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] flex items-center justify-center font-bold">4</span>
                          <span>Directividad & Competencia ICF</span>
                        </div>
                        <p className="text-xs text-amber-900/90 dark:text-amber-200/90 font-light leading-relaxed">
                          {pForm.directivenessAndIcfCompetency}
                        </p>
                      </div>
                    </div>

                    {/* Practical workbook section preview */}
                    <div className="pt-2 border-t border-gray-200/60 dark:border-neutral-800 space-y-2">
                      {pForm.coacheeKeyDeclaration && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300">
                          <strong className="font-semibold block mb-0.5">Declaración Central del Coachee:</strong>
                          &quot;{pForm.coacheeKeyDeclaration}&quot;
                        </div>
                      )}

                      {pForm.agreedActionItems && pForm.agreedActionItems.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-neutral-400 space-y-1">
                          <strong className="text-black dark:text-white font-medium block">
                            Compromisos de Acción Acordados ({pForm.agreedActionItems.length}):
                          </strong>
                          <ul className="list-disc list-inside space-y-0.5 pl-1">
                            {pForm.agreedActionItems.map((act, i) => (
                              <li key={i} className="font-light">{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-3">
              <BookOpen className="w-10 h-10 text-gray-300 dark:text-neutral-700 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-black dark:text-white">
                  Aún no has registrado el formulario post-sesión para este coachee
                </h4>
                <p className="text-[11px] text-gray-400 font-light max-w-md mx-auto">
                  Al terminar cada sesión individual, llena el formulario con las 4 preguntas ontológicas para generar el Cuaderno de Trabajo en PDF.
                </p>
              </div>
              {sessions.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleOpenWorkbookForSession(sessions[0])}
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Llenar Formulario de Sesión 1</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reflexiones & Formularios */}
      {activeTab === 'forms' && (
        <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
          <div className="pb-4 border-b border-gray-100 dark:border-neutral-800">
            <h3 className="font-semibold text-sm text-black dark:text-white">
              Respuestas y Bitácoras Entregadas por el Cliente
            </h3>
            <p className="text-xs text-gray-400 font-light">
              Entregables previos a cada sesión quincenal
            </p>
          </div>

          {forms.length > 0 ? (
            <div className="space-y-4">
              {forms.map((f, idx) => (
                <div
                  key={f.id || idx}
                  className="p-5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-black dark:text-white">
                      Entrega para {f.level} (Sesión {f.sessionStep})
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {f.submittedAt ? formatDate(f.submittedAt) : 'Registrado'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-700 dark:text-neutral-300">
                    <div className="bg-white dark:bg-[#151518] p-3 rounded-xl border border-gray-200/70 dark:border-neutral-700">
                      <span className="font-semibold text-black dark:text-white block text-[11px] mb-0.5">
                        Corporalidad y Emoción:
                      </span>
                      <p className="font-light">{f.bodyEmotion}</p>
                    </div>

                    <div className="bg-white dark:bg-[#151518] p-3 rounded-xl border border-gray-200/70 dark:border-neutral-700">
                      <span className="font-semibold text-black dark:text-white block text-[11px] mb-0.5">
                        Reflexiones del Quiebre:
                      </span>
                      <p className="font-light">{f.reflections}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">
              No hay respuestas de formularios registradas aún.
            </p>
          )}
        </div>
      )}

      {/* Tab 4: Materiales del Nodo */}
      {activeTab === 'nodes' && (
        <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
          <div className="pb-4 border-b border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block">
              {currentNodeInfo.level} • {currentNodeInfo.levelTitle}
            </span>
            <h3 className="text-base font-bold text-black dark:text-white mt-0.5">
              Sesión {currentNodeInfo.step}: {currentNodeInfo.sessionTitle}
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
              {currentNodeInfo.objective}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-2">
              <span className="font-semibold text-xs text-black dark:text-white block">
                Pregunta Clave & Eje de Indagación:
              </span>
              <p className="text-xs text-gray-600 dark:text-neutral-300 font-light leading-relaxed">
                {currentNodeInfo.keyQuestion}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-2">
              <span className="font-semibold text-xs text-black dark:text-white block">
                Resultados Tangibles del Nodo:
              </span>
              <p className="text-xs text-gray-600 dark:text-neutral-300 font-light leading-relaxed">
                {currentNodeInfo.tangibleOutcomes.join(' • ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Reporte PDF */}
      {activeTab === 'report' && (
        <div className="bg-white dark:bg-[#151518] rounded-3xl p-8 border border-gray-200/80 dark:border-neutral-800 shadow-2xs text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-black dark:text-white">
            <FileDown className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-black dark:text-white">
              Informe Ontológico Confidencial en PDF
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
              Genera y descarga el documento formal para {client.name} con el mapeo de coherencia somática, barreras lingüísticas, preguntas clave y estado de avance.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={!latestInsight}
            className={`px-6 py-3 rounded-2xl text-xs font-semibold transition-all inline-flex items-center gap-2 shadow-sm ${
              latestInsight
                ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer'
                : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Descargar Informe PDF</span>
          </button>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sincronizado con Google Drive (rengifobastoco@gmail.com)</span>
            </div>
          </div>

          {!latestInsight && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-light">
              * Requiere generar primero el Diagnóstico IA del cliente.
            </p>
          )}
        </div>
      )}

      {/* Tab 6: Gemini Ontological Copilot */}
      {activeTab === 'gemini' && (
        <div className="space-y-4">
          <GeminiOntologicalCopilot
            currentClient={client}
            userRole="coach"
            onApplyInsightToClient={(diag) => {
              onGenerateAIAnalysis(client.uid, {
                id: 'form-' + client.uid + '-' + Date.now(),
                clientId: client.uid,
                sessionId: 'session-live',
                sessionStep: client.programProgress || 1,
                level: (client.programProgress || 1) <= 2 ? 'Nivel I' : 'Nivel II',
                bodyEmotion: diag.somaticIndicators || 'Tensión somática en sesión',
                reflections: diag.recommendedShift || 'Reencuadre ontológico',
                levelSpecificAnswer: diag.linguisticBarriers || '',
                submittedAt: new Date().toISOString(),
              });
            }}
          />
        </div>
      )}

      {/* Modal de Formulario Post-Sesión & Generación de Cuaderno de Trabajo */}
      <PostSessionWorkbookModal
        isOpen={isWorkbookModalOpen}
        onClose={() => {
          setIsWorkbookModalOpen(false);
          setSelectedSessionForWorkbook(null);
        }}
        session={selectedSessionForWorkbook}
        client={client}
        onFormSaved={handleWorkbookSaved}
      />
    </div>
  );
};
