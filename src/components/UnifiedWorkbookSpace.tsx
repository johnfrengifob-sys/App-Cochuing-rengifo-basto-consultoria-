import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Download,
  Save,
  CheckCircle2,
  Lock,
  CreditCard,
  Edit3,
  FileDown,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  ExternalLink,
  ChevronRight,
  Check,
} from 'lucide-react';
import { User, Session, FormSubmission, PostSessionForm, ProgramNodeInfo } from '../types';
import { OntologicalStore, PROGRAM_NODES } from '../services/store';
import { PDFGenerator } from '../utils/pdfGenerator';

interface UnifiedWorkbookSpaceProps {
  client: User;
  sessions: Session[];
  forms: FormSubmission[];
  postSessionForms: PostSessionForm[];
  currentProgress: number;
  selectedStep: number;
  onStepChange: (step: number) => void;
  workshopsViewed: number[];
  onToggleWorkshopViewed: (step: number) => void;
  onFormSubmitted?: (newForm: FormSubmission) => void;
  onPostSessionFormSaved?: (savedForm: PostSessionForm) => void;
  onOpenPaymentForNode: (node: ProgramNodeInfo) => void;
  initialMode?: 'workshop' | 'session' | 'all';
  initialSessionId?: string | null;
}

export const UnifiedWorkbookSpace: React.FC<UnifiedWorkbookSpaceProps> = ({
  client,
  sessions,
  forms,
  postSessionForms,
  currentProgress,
  selectedStep,
  onStepChange,
  workshopsViewed,
  onToggleWorkshopViewed,
  onFormSubmitted,
  onPostSessionFormSaved,
  onOpenPaymentForNode,
  initialMode = 'workshop',
  initialSessionId,
}) => {
  // Main view mode: 'workshop' (Cuaderno del Taller) | 'session' (Cuaderno Sesión 1 a 1) | 'all' (Registro & Descargas)
  const [activeMode, setActiveMode] = useState<'workshop' | 'session' | 'all'>(initialMode);

  // Workshop Questionnaire State
  const programNodes = OntologicalStore.getProgramNodes();
  const activeNodeInfo: ProgramNodeInfo =
    programNodes.find((n) => n.step === selectedStep) || programNodes[0] || PROGRAM_NODES[0];
  const isNodeLocked = activeNodeInfo.step > currentProgress;
  const existingWorkshopForm = OntologicalStore.getFormForStep(client.uid, activeNodeInfo.step);
  const dynamicQuestionnaire = OntologicalStore.getQuestionnaireForWorkshop(activeNodeInfo.step);

  const [bodyEmotion, setBodyEmotion] = useState('');
  const [reflections, setReflections] = useState('');
  const [levelSpecificAnswer, setLevelSpecificAnswer] = useState('');
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string | number>>({});
  const [isEditingWorkshopForm, setIsEditingWorkshopForm] = useState(false);
  const [workshopSavedSuccess, setWorkshopSavedSuccess] = useState(false);
  const [isSubmittingWorkshop, setIsSubmittingWorkshop] = useState(false);

  // Load existing workshop form data when step changes
  useEffect(() => {
    if (existingWorkshopForm) {
      setBodyEmotion(existingWorkshopForm.bodyEmotion || '');
      setReflections(existingWorkshopForm.reflections || '');
      setLevelSpecificAnswer(existingWorkshopForm.levelSpecificAnswer || '');
      setDynamicAnswers(existingWorkshopForm.dynamicAnswers || {});
      setIsEditingWorkshopForm(false);
    } else {
      setBodyEmotion('');
      setReflections('');
      setLevelSpecificAnswer('');
      setDynamicAnswers({});
      setIsEditingWorkshopForm(true);
    }
    setWorkshopSavedSuccess(false);
  }, [selectedStep, existingWorkshopForm?.id]);

  // Session Questionnaire State
  const [selectedSessionNumber, setSelectedSessionNumber] = useState<number>(() => {
    if (initialSessionId) {
      const found = sessions.find((s) => s.id === initialSessionId);
      if (found?.sessionNumber) return found.sessionNumber;
    }
    return sessions[0]?.sessionNumber || client.programProgress || 1;
  });

  useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialSessionId) {
      const found = sessions.find((s) => s.id === initialSessionId);
      if (found?.sessionNumber) {
        setSelectedSessionNumber(found.sessionNumber);
        return;
      }
    }
    if (selectedStep && selectedStep >= 1 && selectedStep <= 6) {
      setSelectedSessionNumber(selectedStep);
    }
  }, [initialSessionId, selectedStep, sessions]);

  const activeSession: Session | undefined =
    sessions.find((s) => s.sessionNumber === selectedSessionNumber);

  const existingSessionForm = postSessionForms.find(
    (f) => f.sessionNumber === selectedSessionNumber
  );

  const [sessionWorkbookTitle, setSessionWorkbookTitle] = useState('');
  const [q1Emotion, setQ1Emotion] = useState('');
  const [q2Judgment, setQ2Judgment] = useState('');
  const [q3Perspective, setQ3Perspective] = useState('');
  const [q4Directiveness, setQ4Directiveness] = useState('');
  const [keyDeclaration, setKeyDeclaration] = useState('');
  const [actionItems, setActionItems] = useState<string[]>([
    'Sostener presencia reflexiva ante situaciones de sobrecarga.',
    'Registrar en la bitácora somática los impulsos de reactividad o control.',
  ]);
  const [newActionItem, setNewActionItem] = useState('');
  const [somaticHomework, setSomaticHomework] = useState('');
  const [sessionSavedSuccess, setSessionSavedSuccess] = useState(false);
  const [isEditingSessionForm, setIsEditingSessionForm] = useState(false);

  // Load existing session form data
  useEffect(() => {
    if (existingSessionForm) {
      setSessionWorkbookTitle(
        existingSessionForm.workbookTitle ||
          `Sesión ${existingSessionForm.sessionNumber}: Dominio y Arquitectura Ontológica`
      );
      setQ1Emotion(existingSessionForm.coacheeEmotionAndOpenness || '');
      setQ2Judgment(existingSessionForm.masterJudgmentAndNarrative || '');
      setQ3Perspective(existingSessionForm.perspectiveShiftEvidence || '');
      setQ4Directiveness(existingSessionForm.directivenessAndIcfCompetency || '');
      setKeyDeclaration(existingSessionForm.coacheeKeyDeclaration || '');
      setActionItems(
        existingSessionForm.agreedActionItems && existingSessionForm.agreedActionItems.length > 0
          ? existingSessionForm.agreedActionItems
          : [
              'Sostener presencia reflexiva ante situaciones de sobrecarga.',
              'Registrar en la bitácora somática los impulsos de reactividad o control.',
            ]
      );
      setSomaticHomework(existingSessionForm.somaticHomework || '');
      setIsEditingSessionForm(false);
    } else {
      setSessionWorkbookTitle(
        `Sesión ${selectedSessionNumber}: Claridad Ontológica y Acuerdos de Acción`
      );
      setQ1Emotion('');
      setQ2Judgment('');
      setQ3Perspective('');
      setQ4Directiveness('');
      setKeyDeclaration('');
      setActionItems([
        'Sostener presencia reflexiva ante situaciones de sobrecarga.',
        'Registrar en la bitácora somática los impulsos de reactividad o control.',
      ]);
      setSomaticHomework('5 minutos diarios de centramiento y respiración consciente al iniciar la jornada.');
      setIsEditingSessionForm(true);
    }
    setSessionSavedSuccess(false);
  }, [selectedSessionNumber, existingSessionForm?.id]);

  // Handle saving workshop questionnaire
  const handleSaveWorkshopForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bodyEmotion.trim() || !reflections.trim()) return;

    setIsSubmittingWorkshop(true);
    setTimeout(() => {
      const activeSessionId = activeSession?.id || `sess-step-${selectedStep}-${Date.now()}`;
      const saved = OntologicalStore.submitForm({
        clientId: client.uid,
        sessionId: activeSessionId,
        sessionStep: activeNodeInfo.step,
        level: activeNodeInfo.level,
        bodyEmotion: bodyEmotion.trim(),
        reflections: reflections.trim(),
        levelSpecificAnswer: levelSpecificAnswer.trim(),
        dynamicAnswers: dynamicAnswers,
      });

      setIsSubmittingWorkshop(false);
      setWorkshopSavedSuccess(true);
      setIsEditingWorkshopForm(false);
      onFormSubmitted?.(saved);
      setTimeout(() => setWorkshopSavedSuccess(false), 5000);
    }, 400);
  };

  // Handle saving 1-on-1 session questionnaire
  const handleSaveSessionForm = (e: React.FormEvent) => {
    e.preventDefault();

    const effSession: Session = activeSession || {
      id: `sess-${client.uid}-${selectedSessionNumber}`,
      sessionNumber: selectedSessionNumber,
      clientId: client.uid,
      date: new Date().toISOString(),
      meetLink: 'https://meet.google.com/rbc-sesion',
      status: 'completed',
    };

    const formToSave: PostSessionForm = {
      id: existingSessionForm?.id || `post-form-${effSession.id}-${Date.now()}`,
      sessionId: effSession.id,
      sessionNumber: selectedSessionNumber,
      clientId: client.uid,
      clientName: client.name,
      sessionDate: effSession.date,
      submittedAt: new Date().toISOString(),
      workbookTitle:
        sessionWorkbookTitle.trim() ||
        `Sesión ${selectedSessionNumber}: Cuaderno de Trabajo Ontológico`,
      coacheeEmotionAndOpenness: q1Emotion.trim(),
      masterJudgmentAndNarrative: q2Judgment.trim(),
      perspectiveShiftEvidence: q3Perspective.trim(),
      directivenessAndIcfCompetency: q4Directiveness.trim(),
      coacheeKeyDeclaration: keyDeclaration.trim(),
      agreedActionItems: actionItems.filter((item) => item.trim().length > 0),
      somaticHomework: somaticHomework.trim(),
    };

    const saved = OntologicalStore.savePostSessionForm(formToSave);
    setSessionSavedSuccess(true);
    setIsEditingSessionForm(false);
    onPostSessionFormSaved?.(saved);
    setTimeout(() => setSessionSavedSuccess(false), 5000);
  };

  const handleAddActionItem = () => {
    if (!newActionItem.trim()) return;
    setActionItems((prev) => [...prev, newActionItem.trim()]);
    setNewActionItem('');
  };

  const handleRemoveActionItem = (idx: number) => {
    setActionItems((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div id="unified-workbook-space" className="space-y-6">
      {/* Space Hero & Unified Navigation Selector */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-[#151518]/70 backdrop-blur-xl border border-white/75 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-black dark:text-white">
                  Espacio Único de Cuadernos & Cuestionarios
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 uppercase tracking-wider">
                  Oficial RBC
                </span>
              </div>
              <p className="text-xs font-light text-gray-500 dark:text-neutral-400">
                Completa tus cuestionarios ontológicos y descarga tus Cuadernos de Trabajo oficiales en PDF en un solo lugar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-neutral-400 font-light hidden sm:inline">
              Progreso:
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#222226] border border-gray-200 dark:border-neutral-700 text-black dark:text-white">
              {forms.length}/6 Talleres • {postSessionForms.length} Sesiones
            </span>
          </div>
        </div>

        {/* PRIMARY TOGGLE: UNIFIES WORKSHOP AND 1-ON-1 SESSION WORKBOOKS */}
        <div className="flex items-center p-1.5 rounded-2xl bg-white/60 dark:bg-[#121214]/60 backdrop-blur-md border border-white/75 dark:border-white/10 gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveMode('workshop')}
            className={`flex-1 min-w-[180px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeMode === 'workshop'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>1. Cuaderno del Taller (Quiebres & Bitácora)</span>
            {forms.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeMode === 'workshop'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {forms.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('session')}
            className={`flex-1 min-w-[180px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeMode === 'session'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>2. Cuaderno Sesión 1 a 1 (Post-Sesión)</span>
            {postSessionForms.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeMode === 'session'
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}
              >
                {postSessionForms.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('all')}
            className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === 'all'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-800/50'
            }`}
            title="Ver catálogo completo de descargas en PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Centro de Descargas PDF</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: CUADERNO DEL TALLER (CUESTIONARIO + BITÁCORA + DESCARGA PDF)   */}
      {/* ========================================================================= */}
      {activeMode === 'workshop' && (
        <div className="space-y-6 animate-fade-in">
          {/* Workshop Step Selector */}
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#18181B]/70 backdrop-blur-md border border-white/75 dark:border-white/10 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Selecciona el Taller a Diligenciar o Descargar:
              </span>
              <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                {activeNodeInfo.level} • {activeNodeInfo.weekLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {PROGRAM_NODES.map((node) => {
                const isCompleted = forms.some((f) => f.sessionStep === node.step);
                const isSelected = selectedStep === node.step;
                const isLocked = node.step > currentProgress;

                return (
                  <button
                    key={node.step}
                    type="button"
                    onClick={() => onStepChange(node.step)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                        : isCompleted
                        ? 'bg-white dark:bg-[#202024] border-emerald-300 dark:border-emerald-800 text-black dark:text-white hover:border-emerald-500'
                        : isLocked
                        ? 'bg-gray-100/70 dark:bg-neutral-900/60 border-gray-200 dark:border-neutral-800 text-gray-400 dark:text-neutral-600'
                        : 'bg-white dark:bg-[#202024] border-gray-200 dark:border-neutral-700 text-black dark:text-white hover:border-black dark:hover:border-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Taller {node.step}</span>
                      {isCompleted ? (
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            isSelected
                              ? 'text-emerald-400 dark:text-emerald-600'
                              : 'text-emerald-600'
                          }`}
                        />
                      ) : isLocked ? (
                        <Lock className="w-3 h-3 text-gray-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] truncate block ${
                        isSelected
                          ? 'text-neutral-300 dark:text-neutral-600 font-medium'
                          : 'text-gray-500 dark:text-neutral-400'
                      }`}
                    >
                      {node.sessionTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Success Banner if Saved */}
          {workshopSavedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong>¡Cuestionario guardado con éxito!</strong>
                  <span className="block text-[11px] font-light">
                    Tus respuestas se integraron en tu Cuaderno de Trabajo en PDF del Taller {activeNodeInfo.step}.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  PDFGenerator.generateLevelWorkbookPDF(
                    activeNodeInfo,
                    client,
                    existingWorkshopForm || undefined
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>Descargar Cuaderno PDF</span>
              </button>
            </div>
          )}

          {/* Locked Step Notice */}
          {isNodeLocked ? (
            <div className="py-12 px-6 rounded-3xl bg-white/70 dark:bg-[#18181B]/70 backdrop-blur-xl border border-white/75 dark:border-white/10 text-center space-y-4 max-w-lg mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-black dark:text-white">
                  Taller {activeNodeInfo.step} Inactivo
                </h3>
                <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                  El cuestionario y cuaderno de trabajo del Taller {activeNodeInfo.step} se habilitarán al formalizar el pago de tu próximo ciclo formativo ({activeNodeInfo.level}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenPaymentForNode(activeNodeInfo)}
                className="px-5 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-medium inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <CreditCard className="w-4 h-4" />
                <span>Habilitar Taller con Pago</span>
              </button>
            </div>
          ) : (
            /* Active Workshop Form & Download Workspace */
            <div className="p-6 sm:p-7 rounded-3xl bg-white/70 dark:bg-[#18181B]/70 backdrop-blur-xl border border-white/75 dark:border-white/10 space-y-6 shadow-sm">
              {/* Header Bar of the Selected Workshop */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black">
                      Taller {activeNodeInfo.step} • {activeNodeInfo.level}
                    </span>
                    {existingWorkshopForm && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Cuestionario Respondido</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    {activeNodeInfo.sessionTitle}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                    {activeNodeInfo.objective}
                  </p>
                </div>

                {/* Direct Action Bar to Download PDF */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      PDFGenerator.generateLevelWorkbookPDF(
                        activeNodeInfo,
                        client,
                        existingWorkshopForm || undefined
                      )
                    }
                    className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                    title="Descargar Cuaderno de Trabajo en PDF con tus respuestas integradas"
                  >
                    <Download className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    <span>Descargar Cuaderno PDF</span>
                  </button>

                  {existingWorkshopForm && (
                    <button
                      type="button"
                      onClick={() =>
                        PDFGenerator.generateFormSubmissionPDF(
                          existingWorkshopForm,
                          client,
                          activeNodeInfo
                        )
                      }
                      className="px-3 py-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Descargar Ficha de Entrega del Cuestionario"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Ficha PDF</span>
                    </button>
                  )}

                  {existingWorkshopForm && !isEditingWorkshopForm && (
                    <button
                      type="button"
                      onClick={() => setIsEditingWorkshopForm(true)}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      title="Editar respuestas de este cuestionario"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notice explaining that answers feed the workbook */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-light leading-relaxed">
                  Tus respuestas en este cuestionario se transfieren directamente a tu <strong>Cuaderno de Trabajo en PDF</strong>. Puedes responderlo antes de tu sesión o actualizarlo cuando lo desees para descargar una nueva versión actualizada.
                </span>
              </div>

              {/* Workshop Roadmap Steps (Estructura Cronológica del Taller) */}
              {activeNodeInfo.roadmapSteps && activeNodeInfo.roadmapSteps.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Estructura & Pasos de la Sesión ({activeNodeInfo.roadmapSteps.length} Fases)</span>
                    </span>
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-mono">
                      {activeNodeInfo.roadmapSteps.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)} min total
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {activeNodeInfo.roadmapSteps.map((step, sIdx) => (
                      <div
                        key={step.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                            Paso {sIdx + 1} • {step.durationMinutes} min
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-neutral-800 text-gray-500 truncate max-w-[90px]">
                            {step.phaseType}
                          </span>
                        </div>
                        <h5 className="font-semibold text-black dark:text-white text-[11px] line-clamp-1">{step.title}</h5>
                        <p className="text-[10px] text-gray-500 dark:text-neutral-400 line-clamp-2 leading-relaxed font-light">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IF ALREADY SUBMITTED AND NOT EDITING: SHOW CLEAN READ VIEW */}
              {existingWorkshopForm && !isEditingWorkshopForm ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1.5">
                    <span className="font-bold text-black dark:text-white uppercase tracking-wider block text-[11px]">
                      1. Corporalidad & Sensaciones Presentes
                    </span>
                    <p className="text-gray-700 dark:text-neutral-300 font-light leading-relaxed whitespace-pre-wrap">
                      {existingWorkshopForm.bodyEmotion}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1.5">
                    <span className="font-bold text-black dark:text-white uppercase tracking-wider block text-[11px]">
                      2. Quiebres Ontológicos & Juicios Automáticos
                    </span>
                    <p className="text-gray-700 dark:text-neutral-300 font-light leading-relaxed whitespace-pre-wrap">
                      {existingWorkshopForm.reflections}
                    </p>
                  </div>

                  {existingWorkshopForm.levelSpecificAnswer && (
                    <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1.5">
                      <span className="font-bold text-black dark:text-white uppercase tracking-wider block text-[11px]">
                        3. Eje Temático: {activeNodeInfo.keyQuestion}
                      </span>
                      <p className="text-gray-700 dark:text-neutral-300 font-light leading-relaxed whitespace-pre-wrap">
                        {existingWorkshopForm.levelSpecificAnswer}
                      </p>
                    </div>
                  )}

                  {/* Read view for dynamic questions */}
                  {existingWorkshopForm.dynamicAnswers &&
                    Object.keys(existingWorkshopForm.dynamicAnswers).length > 0 &&
                    dynamicQuestionnaire?.questions && (
                      <div className="space-y-3 pt-2">
                        {dynamicQuestionnaire.questions.map((q, idx) => {
                          const val = existingWorkshopForm.dynamicAnswers?.[q.id];
                          if (val === undefined || val === '') return null;
                          return (
                            <div
                              key={q.id}
                              className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1.5"
                            >
                              <span className="font-bold text-black dark:text-white uppercase tracking-wider block text-[11px]">
                                {idx + 4}. {q.label}
                              </span>
                              <p className="text-gray-700 dark:text-neutral-300 font-light leading-relaxed whitespace-pre-wrap">
                                {String(val)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingWorkshopForm(true)}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modificar Mis Respuestas</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* FORM INPUT VIEW */
                <form onSubmit={handleSaveWorkshopForm} className="space-y-5 text-xs">
                  {/* Q1: Corporalidad */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-black dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] flex items-center justify-center">
                        1
                      </span>
                      <span>Corporalidad: ¿Qué emoción o sensación física identificas hoy?</span>
                    </label>
                    <p className="text-[11px] font-light text-gray-400 dark:text-neutral-500 pl-6">
                      Describe tensión en hombros, peso en el pecho, ritmo respiratorio o mandíbula apretada.
                    </p>
                    <textarea
                      rows={3}
                      required
                      value={bodyEmotion}
                      onChange={(e) => setBodyEmotion(e.target.value)}
                      placeholder="Ej: Percibo una tensión constante en los trapecios y una respiración superficial al pensar en delegar..."
                      className="w-full p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white font-light text-xs"
                    />
                  </div>

                  {/* Q2: Quiebres y Juicios */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-black dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] flex items-center justify-center">
                        2
                      </span>
                      <span>Quiebres: ¿Qué juicios automáticos o narrativas te están limitando?</span>
                    </label>
                    <p className="text-[11px] font-light text-gray-400 dark:text-neutral-500 pl-6">
                      ¿Qué juicios sobre ti o sobre tu equipo aparecen en automático cuando pierdes el control?
                    </p>
                    <textarea
                      rows={3}
                      required
                      value={reflections}
                      onChange={(e) => setReflections(e.target.value)}
                      placeholder="Ej: Aparece el juicio automático 'si no lo hago yo mismo no quedará con el estándar requerido'..."
                      className="w-full p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white font-light text-xs"
                    />
                  </div>

                  {/* Q3: Eje del Taller */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-black dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] flex items-center justify-center">
                        3
                      </span>
                      <span>Eje del Taller: {activeNodeInfo.keyQuestion}</span>
                    </label>
                    <p className="text-[11px] font-light text-gray-400 dark:text-neutral-500 pl-6">
                      {activeNodeInfo.levelPrompt}
                    </p>
                    <textarea
                      rows={3}
                      value={levelSpecificAnswer}
                      onChange={(e) => setLevelSpecificAnswer(e.target.value)}
                      placeholder="Escribe aquí tu análisis o reflexión para este eje temático..."
                      className="w-full p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white font-light text-xs"
                    />
                  </div>

                  {/* Dynamic Questions configured by Coach in Admin Académico */}
                  {dynamicQuestionnaire?.questions && dynamicQuestionnaire.questions.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                          Preguntas de Profundización (Configuradas por el Coach)
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-light">
                          {dynamicQuestionnaire.questions.length} preguntas adicionales
                        </span>
                      </div>
                      {dynamicQuestionnaire.questions.map((q, idx) => (
                        <div key={q.id} className="space-y-1.5">
                          <label className="font-bold text-black dark:text-white flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-mono text-[10px] flex items-center justify-center font-bold">
                              {idx + 4}
                            </span>
                            <span>{q.label}</span>
                            {q.required && <span className="text-rose-500 font-normal">*</span>}
                          </label>
                          {q.helperText && (
                            <p className="text-[11px] font-light text-gray-400 dark:text-neutral-500 pl-6">
                              {q.helperText}
                            </p>
                          )}

                          {q.type === 'textarea' && (
                            <textarea
                              rows={3}
                              required={q.required}
                              value={(dynamicAnswers[q.id] as string) || ''}
                              onChange={(e) =>
                                setDynamicAnswers({ ...dynamicAnswers, [q.id]: e.target.value })
                              }
                              placeholder={q.placeholder || 'Escribe tu respuesta...'}
                              className="w-full p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white font-light text-xs"
                            />
                          )}

                          {q.type === 'text' && (
                            <input
                              type="text"
                              required={q.required}
                              value={(dynamicAnswers[q.id] as string) || ''}
                              onChange={(e) =>
                                setDynamicAnswers({ ...dynamicAnswers, [q.id]: e.target.value })
                              }
                              placeholder={q.placeholder || 'Respuesta breve...'}
                              className="w-full p-2.5 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-light text-xs"
                            />
                          )}

                          {q.type === 'rating_scale' && (
                            <div className="flex items-center gap-1 pl-6 pt-1">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                                const isSelected = dynamicAnswers[q.id] === num;
                                return (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() =>
                                      setDynamicAnswers({ ...dynamicAnswers, [q.id]: num })
                                    }
                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                      isSelected
                                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                                        : 'bg-white dark:bg-[#202024] text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-neutral-700 hover:border-black'
                                    }`}
                                  >
                                    {num}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {q.type === 'select' && q.options && (
                            <select
                              value={(dynamicAnswers[q.id] as string) || ''}
                              onChange={(e) =>
                                setDynamicAnswers({ ...dynamicAnswers, [q.id]: e.target.value })
                              }
                              className="w-full p-2.5 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-light"
                            >
                              <option value="">Selecciona una opción...</option>
                              {q.options.map((opt, i) => (
                                <option key={i} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
                    {existingWorkshopForm && (
                      <button
                        type="button"
                        onClick={() => setIsEditingWorkshopForm(false)}
                        className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer"
                      >
                        Cancelar Edición
                      </button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="submit"
                        disabled={isSubmittingWorkshop || !bodyEmotion.trim() || !reflections.trim()}
                        className="py-2.5 px-5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-700" />
                        <span>
                          {isSubmittingWorkshop
                            ? 'Guardando...'
                            : existingWorkshopForm
                            ? 'Actualizar en Cuaderno PDF'
                            : 'Guardar Cuestionario & Construir Cuaderno'}
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 2: CUADERNO DE SESIÓN 1 A 1 (POST-SESIÓN + ACUERDOS + PDF)        */}
      {/* ========================================================================= */}
      {activeMode === 'session' && (
        <div className="space-y-6 animate-fade-in">
          {/* Session Selector */}
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#18181B]/70 backdrop-blur-md border border-white/75 dark:border-white/10 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Selecciona la Sesión 1 a 1 a Diligenciar o Descargar:
              </span>
              <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                Consultoría Individual con John Fredy Rengifo Basto
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const hasForm = postSessionForms.some((f) => f.sessionNumber === num);
                const isSelected = selectedSessionNumber === num;
                const sess = sessions.find((s) => s.sessionNumber === num);

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedSessionNumber(num)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                        : hasForm
                        ? 'bg-white dark:bg-[#202024] border-blue-300 dark:border-blue-800 text-black dark:text-white hover:border-blue-500'
                        : 'bg-white dark:bg-[#202024] border-gray-200 dark:border-neutral-700 text-black dark:text-white hover:border-black dark:hover:border-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Sesión {num}</span>
                      {hasForm ? (
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            isSelected ? 'text-blue-400 dark:text-blue-600' : 'text-blue-600'
                          }`}
                        />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-neutral-600" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] truncate block ${
                        isSelected
                          ? 'text-neutral-300 dark:text-neutral-600 font-medium'
                          : 'text-gray-500 dark:text-neutral-400'
                      }`}
                    >
                      {sess?.status === 'completed'
                        ? 'Completada'
                        : sess?.date
                        ? new Date(sess.date).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'Programada'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Success Banner if Saved */}
          {sessionSavedSuccess && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <strong>¡Cuestionario de sesión guardado con éxito!</strong>
                  <span className="block text-[11px] font-light">
                    Tu Cuaderno de Trabajo en PDF de la Sesión {selectedSessionNumber} ha sido generado y actualizado.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  existingSessionForm &&
                  PDFGenerator.generateSessionWorkbookPDF(
                    existingSessionForm,
                    client,
                    activeSession
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
                <span>Descargar Cuaderno PDF</span>
              </button>
            </div>
          )}

          {/* 1-on-1 Session Form & Download Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white/70 dark:bg-[#18181B]/70 backdrop-blur-xl border border-white/75 dark:border-white/10 space-y-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black">
                    Sesión Quincenal {selectedSessionNumber}
                  </span>
                  {existingSessionForm && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      <span>Cuaderno Listo para Descargar</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  {sessionWorkbookTitle || `Sesión ${selectedSessionNumber}: Cuaderno Ontológico`}
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                  Estructura tus quiebres, nuevo observador y compromisos acordados tras tu sesión 1 a 1.
                </p>
              </div>

              {/* Direct Download Button */}
              {existingSessionForm && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      PDFGenerator.generateSessionWorkbookPDF(
                        existingSessionForm,
                        client,
                        activeSession
                      )
                    }
                    className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                    title="Descargar Cuaderno de Trabajo en PDF de esta sesión"
                  >
                    <Download className="w-4 h-4 text-blue-400 dark:text-blue-600" />
                    <span>Descargar Cuaderno PDF</span>
                  </button>

                  {!isEditingSessionForm && (
                    <button
                      type="button"
                      onClick={() => setIsEditingSessionForm(true)}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      title="Editar respuestas de esta sesión"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Read View or Form View */}
            {existingSessionForm && !isEditingSessionForm ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="font-bold text-black dark:text-white uppercase tracking-wider block text-[10px]">
                      1. Emocionalidad & Apertura
                    </span>
                    <p className="text-gray-700 dark:text-neutral-300 font-light leading-relaxed">
                      {existingSessionForm.coacheeEmotionAndOpenness || 'Sin registro'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="font-bold text-black dark:text-white uppercase tracking-wider block text-[10px]">
                      2. Juicio Maestro & Creencia Deconstruida
                    </span>
                    <p className="text-gray-700 dark:text-neutral-300 font-light leading-relaxed">
                      {existingSessionForm.masterJudgmentAndNarrative || 'Sin registro'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="font-bold text-black dark:text-white uppercase tracking-wider block text-[10px]">
                      3. Nuevo Observador & Evidencia de Cambio
                    </span>
                    <p className="text-gray-700 dark:text-neutral-300 font-light leading-relaxed">
                      {existingSessionForm.perspectiveShiftEvidence || 'Sin registro'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="font-bold text-black dark:text-white uppercase tracking-wider block text-[10px]">
                      4. Tarea Somática & Centramiento
                    </span>
                    <p className="text-gray-700 dark:text-neutral-300 font-light leading-relaxed">
                      {existingSessionForm.somaticHomework || 'Sin registro'}
                    </p>
                  </div>
                </div>

                {existingSessionForm.agreedActionItems &&
                  existingSessionForm.agreedActionItems.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-2">
                      <span className="font-bold text-black dark:text-white uppercase tracking-wider block text-[10px]">
                        Acuerdos de Acción Quincenales
                      </span>
                      <ul className="space-y-1">
                        {existingSessionForm.agreedActionItems.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-gray-700 dark:text-neutral-300 font-light"
                          >
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingSessionForm(true)}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modificar Respuestas de Sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              /* EDIT/CREATE FORM */
              <form onSubmit={handleSaveSessionForm} className="space-y-5 text-xs">
                {/* Workbook Title */}
                <div className="space-y-1.5">
                  <label className="font-bold text-black dark:text-white block">
                    Título o Eje Temático del Cuaderno de la Sesión:
                  </label>
                  <input
                    type="text"
                    value={sessionWorkbookTitle}
                    onChange={(e) => setSessionWorkbookTitle(e.target.value)}
                    placeholder={`Sesión ${selectedSessionNumber}: Claridad Ontológica y Acuerdos`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Q1 */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-black dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center">
                        1
                      </span>
                      <span>Emocionalidad & Nivel de Apertura:</span>
                    </label>
                    <textarea
                      rows={3}
                      value={q1Emotion}
                      onChange={(e) => setQ1Emotion(e.target.value)}
                      placeholder="Ej: Reconocimiento de frustración contenida, transitando hacia mayor serenidad y disposición al aprendizaje..."
                      className="w-full p-3 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  {/* Q2 */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-black dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center">
                        2
                      </span>
                      <span>Juicio Maestro o Creencia Desafiada:</span>
                    </label>
                    <textarea
                      rows={3}
                      value={q2Judgment}
                      onChange={(e) => setQ2Judgment(e.target.value)}
                      placeholder="Ej: 'Si delego pierdo la excelencia y el control'. Desafiado con la distinción entre control y coordinación de acciones..."
                      className="w-full p-3 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  {/* Q3 */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-black dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center">
                        3
                      </span>
                      <span>Nuevo Observador / Cambio de Consciencia:</span>
                    </label>
                    <textarea
                      rows={3}
                      value={q3Perspective}
                      onChange={(e) => setQ3Perspective(e.target.value)}
                      placeholder="Ej: Comprensión de que la vulnerabilidad y el pedido efectivo no disminuyen mi liderazgo..."
                      className="w-full p-3 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  {/* Q4 ICF Competency & Directiveness */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-black dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center">
                        4
                      </span>
                      <span>Reflexión ICF & Presencia del Coach:</span>
                    </label>
                    <textarea
                      rows={3}
                      value={q4Directiveness}
                      onChange={(e) => setQ4Directiveness(e.target.value)}
                      placeholder="Ej: Momento de mayor directividad en sesión y competencia ICF a cuidar en el próximo encuentro (ej. Competencia 5: Mantiene la presencia)..."
                      className="w-full p-3 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  {/* Q5 Somatic Homework */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-black dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center">
                        5
                      </span>
                      <span>Práctica Somática de Centramiento:</span>
                    </label>
                    <textarea
                      rows={3}
                      value={somaticHomework}
                      onChange={(e) => setSomaticHomework(e.target.value)}
                      placeholder="Ej: 3 minutos de respiración diafragmática y arraigo de pies antes de reuniones críticas..."
                      className="w-full p-3 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                </div>

                {/* Declaración Clave */}
                <div className="space-y-1.5">
                  <label className="font-bold text-black dark:text-white block">
                    Declaración Clave o Quiebre Declarado:
                  </label>
                  <input
                    type="text"
                    value={keyDeclaration}
                    onChange={(e) => setKeyDeclaration(e.target.value)}
                    placeholder="Ej: 'Elijo confiar y fundar mis pedidos con condiciones de satisfacción explícitas.'"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                {/* Action Items List */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
                  <label className="font-bold text-black dark:text-white block">
                    Acuerdos de Acción para las Próximas 2 Semanas:
                  </label>
                  <div className="space-y-2">
                    {actionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200/80 dark:border-neutral-800"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="flex-1 text-xs text-gray-800 dark:text-neutral-200 font-light">
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveActionItem(idx)}
                          className="p-1 rounded-lg text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newActionItem}
                        onChange={(e) => setNewActionItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddActionItem();
                          }
                        }}
                        placeholder="Agregar nuevo acuerdo o compromiso de acción..."
                        className="flex-1 px-3.5 py-2 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddActionItem}
                        disabled={!newActionItem.trim()}
                        className="px-3.5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                  {existingSessionForm && (
                    <button
                      type="button"
                      onClick={() => setIsEditingSessionForm(false)}
                      className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}

                  <button
                    type="submit"
                    className="ml-auto py-2.5 px-5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-xs flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5 text-blue-400 dark:text-blue-700" />
                    <span>Guardar Cuestionario & Construir Cuaderno PDF</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 3: CENTRO DE DESCARGAS Y REGISTRO COMPLETO EN PDF                  */}
      {/* ========================================================================= */}
      {activeMode === 'all' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Banner */}
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#18181B]/70 backdrop-blur-xl border border-white/75 dark:border-white/10 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Catálogo Unificado de Cuadernos Descargables</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                  Descarga tus materiales oficiales en PDF con formato editorial de alta resolución.
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Formato PDF Oficial RBC
              </span>
            </div>

            {/* Grid of Workbooks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Cuadernos de los 6 Talleres */}
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#202024]/70 backdrop-blur-md border border-white/80 dark:border-neutral-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    Cuadernos de los 6 Talleres
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    {forms.length}/6 Respondidos
                  </span>
                </div>

                <div className="space-y-2">
                  {PROGRAM_NODES.map((node) => {
                    const form = forms.find((f) => f.sessionStep === node.step);
                    const isViewed = workshopsViewed.includes(node.step);

                    return (
                      <div
                        key={node.step}
                        className="p-3 rounded-xl bg-white dark:bg-[#18181B] border border-gray-200/70 dark:border-neutral-700/60 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-black dark:text-white">
                              Taller {node.step}:
                            </span>
                            <span className="text-xs text-gray-600 dark:text-neutral-300 truncate font-light">
                              {node.sessionTitle}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {form ? '✓ Cuestionario Integrado' : 'Plantilla para diligenciar'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onToggleWorkshopViewed(node.step)}
                            className={`p-1.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                              isViewed
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 hover:text-black dark:hover:text-white'
                            }`}
                            title={isViewed ? 'Taller visto' : 'Marcar taller como visto'}
                          >
                            <Check className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              PDFGenerator.generateLevelWorkbookPDF(node, client, form || undefined)
                            }
                            className="px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Descargar Cuaderno del Taller en PDF"
                          >
                            <Download className="w-3 h-3 text-emerald-400 dark:text-emerald-600" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box 2: Cuadernos de Sesiones 1 a 1 */}
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#202024]/70 backdrop-blur-md border border-white/80 dark:border-neutral-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Cuadernos de Sesiones 1 a 1
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    {postSessionForms.length} Disponibles
                  </span>
                </div>

                {postSessionForms.length > 0 ? (
                  <div className="space-y-2">
                    {postSessionForms.map((pForm) => {
                      const sess = sessions.find((s) => s.id === pForm.sessionId);
                      return (
                        <div
                          key={pForm.id}
                          className="p-3 rounded-xl bg-white dark:bg-[#18181B] border border-gray-200/70 dark:border-neutral-700/60 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-black dark:text-white truncate">
                              {pForm.workbookTitle || `Sesión ${pForm.sessionNumber}`}
                            </div>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              {pForm.submittedAt
                                ? new Date(pForm.submittedAt).toLocaleDateString('es-CO')
                                : 'Registrado'} • Quiebres y Acuerdos
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              PDFGenerator.generateSessionWorkbookPDF(pForm, client, sess)
                            }
                            className="px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1 shadow-2xs shrink-0"
                            title="Descargar Cuaderno de Sesión en PDF"
                          >
                            <Download className="w-3 h-3 text-blue-400 dark:text-blue-600" />
                            <span>PDF</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl space-y-2">
                    <BookOpen className="w-8 h-8 text-gray-300 dark:text-neutral-600 mx-auto" />
                    <p className="text-xs text-gray-500 font-light">
                      Aún no has diligenciado cuestionarios de sesiones 1 a 1.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveMode('session')}
                      className="px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Diligenciar Sesión 1 Ahora</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
