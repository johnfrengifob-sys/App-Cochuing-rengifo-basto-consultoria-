import React, { useState } from 'react';
import { User, Session, FormSubmission, AIInsight, ProgramNodeInfo } from '../types';
import { OntologicalStore, PROGRAM_NODES } from '../services/store';
import { LiquidGlassButton } from './LiquidGlassButton';
import { PulseBadge } from './PulseBadge';
import { PromotionalEventBanner } from './PromotionalEventBanner';
import {
  Video,
  Calendar,
  Clock,
  Send,
  Sparkles,
  CheckCircle,
  FileText,
  HeartPulse,
  Brain,
  History,
  Lock,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  Shield,
  CreditCard,
} from 'lucide-react';

interface ClientDashboardProps {
  client: User;
}

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

  // Active step in the 6-node roadmap
  const [currentProgress, setCurrentProgress] = useState<number>(
    client.programProgress || 1
  );

  // Selected node for detailed view / form submission
  const [selectedNodeStep, setSelectedNodeStep] = useState<number>(
    client.programProgress || 1
  );

  // Level-specific Post-session form state
  const [bodyEmotion, setBodyEmotion] = useState('');
  const [reflections, setReflections] = useState('');
  const [levelSpecificAnswer, setLevelSpecificAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const activeNodeInfo: ProgramNodeInfo =
    PROGRAM_NODES.find((n) => n.step === selectedNodeStep) || PROGRAM_NODES[0];

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

      // Trigger automatic background Levý AI evaluation
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
      setSubmissionSuccess(true);
      setTimeout(() => setSubmissionSuccess(false), 6000);
    }, 600);
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
              <span className="font-semibold text-black dark:text-white">{client.name}</span>
            </h1>
            <p className="text-sm font-light text-gray-500 dark:text-neutral-400 mt-1.5 max-w-xl leading-relaxed">
              Programa: <strong>{client.programName || 'Certeza, Fronteras & Dirección Personal'}</strong>
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

      {/* Grid: Left Column (Next Session & Program Roadmap) / Right Column (Active Session Form & Workspace) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Next Session & 12-Week Roadmap (5 Cols) */}
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

                <div className="pt-1">
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
                  <p className="text-[11px] font-light text-gray-400 dark:text-neutral-500 text-center mt-2.5">
                    Enlace confidencial cifrado punto a punto
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm font-light text-gray-500 dark:text-neutral-400 mb-2">
                  No tienes sesiones pendientes por agendar.
                </p>
                <div className="text-xs text-gray-400 dark:text-neutral-500 font-light">
                  Tu coach coordinará la fecha de la próxima sesión quincenal.
                </div>
              </div>
            )}
          </div>

          {/* Card: 12-Week Roadmap Nodes (Timeline) */}
          <div className="bg-white dark:bg-[#18181B] rounded-3xl p-7 border border-gray-100 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
                <h3 className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                  Roadmap de 12 Semanas
                </h3>
              </div>
              <span className="text-xs font-light text-gray-400 dark:text-neutral-500">
                6 Nodos Quincenales
              </span>
            </div>

            {/* Timeline nodes list */}
            <div className="space-y-3">
              {PROGRAM_NODES.map((node) => {
                const isCompleted = node.step < currentProgress;
                const isCurrent = node.step === currentProgress;
                const isLocked = node.step > currentProgress;
                const isSelected = selectedNodeStep === node.step;

                return (
                  <button
                    key={node.step}
                    onClick={() => {
                      if (!isLocked) {
                        setSelectedNodeStep(node.step);
                      }
                    }}
                    disabled={isLocked}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#F9F9F9] dark:bg-[#222226] border-black dark:border-white shadow-xs'
                        : isCompleted
                        ? 'bg-white dark:bg-[#1A1A1E] border-gray-100 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-600'
                        : isCurrent
                        ? 'bg-white dark:bg-[#1A1A1E] border-black/50 dark:border-white/50'
                        : 'bg-gray-50/60 dark:bg-neutral-900/40 border-transparent opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {/* Step Icon Badge */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                        isCompleted
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : isCurrent
                          ? 'bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white font-semibold'
                          : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : isLocked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        node.step
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-neutral-400 uppercase tracking-wider">
                          {node.weekLabel} • {node.level}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-medium bg-black dark:bg-white text-white dark:text-black px-2 py-0.2 rounded-full uppercase tracking-wider">
                            Actual
                          </span>
                        )}
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
        </div>

        {/* RIGHT COLUMN: Active Node Form & Reflection Workspace (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-8">
            {/* Active Node Header */}
            <div className="pb-6 border-b border-gray-100 dark:border-neutral-800">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 text-[11px] font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-widest mb-3">
                <span>{activeNodeInfo.level}: {activeNodeInfo.levelTitle}</span>
                <span>•</span>
                <span>{activeNodeInfo.weekLabel}</span>
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
                Sesión {activeNodeInfo.step}: {activeNodeInfo.sessionTitle}
              </h2>
              <p className="text-xs font-light text-gray-600 dark:text-neutral-300 mt-2 leading-relaxed bg-[#F9F9F9] dark:bg-[#202024] p-4 rounded-2xl border border-gray-100 dark:border-neutral-800">
                <strong className="font-medium text-black dark:text-white block mb-1">
                  Propósito de esta etapa:
                </strong>
                {activeNodeInfo.objective}
              </p>
            </div>

            {submissionSuccess && (
              <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-black/20 dark:border-white/20 flex items-center gap-3 text-xs text-black dark:text-white animate-fade-in">
                <CheckCircle className="w-5 h-5 text-black dark:text-white stroke-[1.5] shrink-0" />
                <div>
                  <strong className="font-semibold block">
                    Formulario y registro ontológico procesados con éxito.
                  </strong>
                  <span className="font-light text-gray-600 dark:text-neutral-400">
                    Tus respuestas han sido integradas en el diagnóstico de Norberto Levý y compartidas con tu coach.
                  </span>
                </div>
              </div>
            )}

            {/* Check if form already submitted for this step */}
            {(() => {
              const existingForm = OntologicalStore.getFormForStep(
                client.uid,
                activeNodeInfo.step
              );
              const nodeInsight = insights.find(
                (i) => i.sessionStep === activeNodeInfo.step
              );

              if (existingForm) {
                return (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800">
                      <div className="flex items-center gap-2 text-xs font-medium text-black dark:text-white">
                        <CheckCircle className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
                        Formulario de esta sesión completado
                      </div>
                      <span className="text-xs font-light text-gray-400 dark:text-neutral-500">
                        {formattedDate(existingForm.submittedAt)}
                      </span>
                    </div>

                    {/* Submitted details */}
                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="font-semibold text-black dark:text-white uppercase tracking-wider block mb-1">
                          Emoción somática en el cuerpo:
                        </span>
                        <p className="font-light text-gray-700 dark:text-neutral-300 bg-[#F9F9F9] dark:bg-[#202024] p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 leading-relaxed">
                          {existingForm.bodyEmotion}
                        </p>
                      </div>

                      {existingForm.levelSpecificAnswer && (
                        <div>
                          <span className="font-semibold text-black dark:text-white uppercase tracking-wider block mb-1">
                            Respuesta al eje del nivel:
                          </span>
                          <p className="font-light text-gray-700 dark:text-neutral-300 bg-[#F9F9F9] dark:bg-[#202024] p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 leading-relaxed">
                            {existingForm.levelSpecificAnswer}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="font-semibold text-black dark:text-white uppercase tracking-wider block mb-1">
                          Reflexiones y quiebres:
                        </span>
                        <p className="font-light text-gray-700 dark:text-neutral-300 bg-[#F9F9F9] dark:bg-[#202024] p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 leading-relaxed">
                          {existingForm.reflections}
                        </p>
                      </div>
                    </div>

                    {/* Levý AI Insight preview if available */}
                    {nodeInsight && (
                      <div className="p-6 rounded-3xl bg-black dark:bg-[#222226] border dark:border-neutral-700 text-white space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-300 dark:text-neutral-400">
                            <Brain className="w-4 h-4 text-white" />
                            Eco Ontológico (Norberto Levý)
                          </div>
                          <PulseBadge flag={nodeInsight.pulseFlag} size="sm" />
                        </div>
                        <p className="text-xs font-light text-gray-200 dark:text-neutral-200 leading-relaxed">
                          {nodeInsight.emotionalWisdom}
                        </p>
                      </div>
                    )}
                  </div>
                );
              }

              // Form input mode for active or past unsubmitted step
              return (
                <form onSubmit={handleSubmitForm} className="space-y-7">
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
                      icon={<Send className="w-4 h-4 stroke-[1.5]" />}
                    >
                      Registrar Formulario de Sesión
                    </LiquidGlassButton>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
