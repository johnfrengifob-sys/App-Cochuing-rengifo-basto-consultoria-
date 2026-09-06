import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Search,
  Sparkles,
  Layers,
  HelpCircle,
  FileText,
  Clock,
  Compass,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  Eye,
  X,
  Save,
  MessageSquare,
  Activity,
  Heart,
  Brain,
  ListOrdered,
  Award,
} from 'lucide-react';
import {
  ProgramNodeInfo,
  WorkshopRoadmapStep,
  DynamicQuestionnaire,
  QuestionnaireQuestion,
  QuestionType,
} from '../../types';
import { OntologicalStore } from '../../services/store';

interface AdminSessionsManagerProps {
  onSelectClientForFicha?: (clientId: string) => void;
  onRefreshParent?: () => void;
}

export const AdminSessionsManager: React.FC<AdminSessionsManagerProps> = ({
  onRefreshParent,
}) => {
  // 1. Estados principales de Módulos y Cuestionarios
  const [nodes, setNodes] = useState<ProgramNodeInfo[]>(() =>
    OntologicalStore.getProgramNodes()
  );
  const [questionnaires, setQuestionnaires] = useState<DynamicQuestionnaire[]>(() =>
    OntologicalStore.getQuestionnaires()
  );

  // Filtros de búsqueda en catálogo
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'Nivel I' | 'Nivel II' | 'Nivel III'>('all');

  // Modo de vista: 'catalog' (grilla/lista) o 'editor' (edición exhaustiva de un módulo)
  const [viewMode, setViewMode] = useState<'catalog' | 'editor'>('catalog');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [editorTab, setEditorTab] = useState<'general' | 'content' | 'questions' | 'materials'>('general');

  // Formulario local del módulo en edición
  const [formData, setFormData] = useState<ProgramNodeInfo | null>(null);

  // Estados de modales y herramientas auxiliares
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewStep, setPreviewStep] = useState<number>(1);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Modal para agregar/editar pregunta en el cuestionario
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuestionnaireQuestion> | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState(false);

  // Sincronización con eventos de la aplicación
  useEffect(() => {
    const handleSync = () => {
      const freshNodes = OntologicalStore.getProgramNodes();
      setNodes(freshNodes);
      setQuestionnaires(OntologicalStore.getQuestionnaires());
      if (formData) {
        const updatedTarget = freshNodes.find((n) => n.step === formData.step);
        if (updatedTarget) setFormData(updatedTarget);
      }
    };

    window.addEventListener('rbc-program-nodes-updated', handleSync);
    window.addEventListener('rbc-questionnaires-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('rbc-program-nodes-updated', handleSync);
      window.removeEventListener('rbc-questionnaires-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [formData]);

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const refreshAll = () => {
    const freshNodes = OntologicalStore.getProgramNodes();
    setNodes(freshNodes);
    setQuestionnaires(OntologicalStore.getQuestionnaires());
    if (formData) {
      const refreshed = freshNodes.find((n) => n.step === formData.step);
      if (refreshed) setFormData({ ...refreshed });
    }
    onRefreshParent?.();
  };

  // Filtrado de módulos
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        n.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.keyQuestion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `módulo ${n.step}`.includes(searchQuery.toLowerCase()) ||
        (n.weekLabel && n.weekLabel.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchLevel = levelFilter === 'all' || n.level === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [nodes, searchQuery, levelFilter]);

  // Cuestionario asociado al paso activo en edición
  const activeQuestionnaire = useMemo(() => {
    const currentStep = formData?.step || activeStep;
    return (
      questionnaires.find(
        (q) => q.targetType === 'workshop_node' && q.targetStep === currentStep
      ) || OntologicalStore.getQuestionnaireForWorkshop(currentStep)
    );
  }, [questionnaires, formData, activeStep]);

  // Abrir editor para un módulo existente
  const handleOpenEditor = (step: number, initialTab: 'general' | 'content' | 'questions' | 'materials' = 'general') => {
    const target = nodes.find((n) => n.step === step) || nodes[0];
    setActiveStep(step);
    setFormData(JSON.parse(JSON.stringify(target)));
    setEditorTab(initialTab);
    setViewMode('editor');
  };

  // Crear un nuevo módulo desde cero
  const handleCreateNewModule = () => {
    const created = OntologicalStore.addProgramNode({
      sessionTitle: 'Nuevo Módulo de Consultoría Ontológica',
      level: 'Nivel I',
      levelTitle: 'Fundamentos & Transparencia',
      weekLabel: `Semanas ${nodes.length * 2 - 1}-${nodes.length * 2}`,
      objective: 'Definir el propósito de transformación ontológica y los quiebres clave a intervenir en este módulo.',
      keyQuestion: '¿Qué conversación o juicio determinante estás listo para transformar?',
      levelPrompt: 'Registra los límites, declaraciones y evidencias somáticas de cambio en este espacio.',
      tangibleOutcomes: [
        'Clarificación del quiebre y costos ocultos en la rutina diaria.',
        'Diseño de nuevos acuerdos y compromisos de acción inmediata.',
      ],
      methodology: {
        linguistic: 'Distinciones entre hechos, juicios maestros y actos declarativos.',
        somatic: 'Centramiento corporal, respiración diafragmática y arraigo podal.',
        emotional: 'Transición consciente del estado de resignación a la serenidad y la ambición legítima.',
      },
      dailyMicroPractice: {
        title: 'Pausa Reflexiva de Soberanía',
        description: 'Detente 90 segundos 2 veces al día. Respira y registra tus sensaciones y compromisos.',
        frequency: 'Diaria (2 veces al día)',
      },
      studyMaterials: [
        {
          title: 'Guía de Indagación y Preguntas Poderosas',
          type: 'Guía de Trabajo',
          pages: '4 páginas',
          description: 'Documento descargable para acompañar las reflexiones del coachee.',
        },
      ],
      reflectiveQuestions: [
        '¿A qué le estás diciendo que sí cuando tu cuerpo te pide decir que no?',
        '¿Qué nueva declaración estás dispuesto a emitir hoy?',
      ],
    });

    refreshAll();
    handleOpenEditor(created.step, 'general');
    showNotification(`Módulo ${created.step} creado exitosamente.`);
  };

  // Guardar cambios del módulo en edición
  const handleSaveModule = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData) return;

    OntologicalStore.updateProgramNode(formData.step, formData);
    refreshAll();
    showNotification(`Módulo ${formData.step}: "${formData.sessionTitle}" guardado correctamente.`);
  };

  // Duplicar módulo
  const handleDuplicate = (step: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup = OntologicalStore.duplicateProgramNode(step);
    if (dup) {
      refreshAll();
      showNotification(`Módulo ${step} duplicado como Módulo ${dup.step}.`);
    }
  };

  // Eliminar módulo
  const handleDelete = (step: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodes.length <= 1) {
      alert('Debe existir al menos un módulo de sesión activo.');
      return;
    }
    if (window.confirm(`¿Estás seguro de eliminar el Módulo ${step}? Esta acción no se puede deshacer.`)) {
      OntologicalStore.deleteProgramNode(step);
      refreshAll();
      showNotification(`Módulo ${step} eliminado.`);
      if (viewMode === 'editor' && formData?.step === step) {
        setViewMode('catalog');
        setFormData(null);
      }
    }
  };

  // Restablecer a fábrica (12 módulos estándar RBC)
  const handleResetDefaults = () => {
    if (
      window.confirm(
        '¿Deseas restablecer los módulos de sesión al programa estándar oficial de 12 Módulos RBC? Se sobreescribirán personalizaciones.'
      )
    ) {
      OntologicalStore.resetProgramNodesToDefault();
      refreshAll();
      showNotification('Módulos restablecidos a los 12 módulos estándar oficiales.');
    }
  };

  // Manejo de Outcomes tangibles en el editor
  const handleAddOutcome = () => {
    if (!formData) return;
    const current = formData.tangibleOutcomes || [];
    setFormData({
      ...formData,
      tangibleOutcomes: [...current, 'Nuevo resultado tangible esperado'],
    });
  };

  const handleUpdateOutcome = (index: number, val: string) => {
    if (!formData) return;
    const current = [...(formData.tangibleOutcomes || [])];
    current[index] = val;
    setFormData({ ...formData, tangibleOutcomes: current });
  };

  const handleDeleteOutcome = (index: number) => {
    if (!formData) return;
    const current = (formData.tangibleOutcomes || []).filter((_, i) => i !== index);
    setFormData({ ...formData, tangibleOutcomes: current });
  };

  // Manejo de Materiales de Estudio en el editor
  const handleAddStudyMaterial = () => {
    if (!formData) return;
    const current = formData.studyMaterials || [];
    setFormData({
      ...formData,
      studyMaterials: [
        ...current,
        {
          title: 'Nueva Guía de Indagación Ontológica',
          type: 'Guía de Trabajo',
          pages: '4 páginas',
          description: 'Herramienta descargable para profundizar la distinción de la sesión.',
        },
      ],
    });
  };

  const handleUpdateStudyMaterial = (
    index: number,
    field: 'title' | 'type' | 'pages' | 'description',
    val: string
  ) => {
    if (!formData) return;
    const current = [...(formData.studyMaterials || [])];
    current[index] = { ...current[index], [field]: val };
    setFormData({ ...formData, studyMaterials: current });
  };

  const handleDeleteStudyMaterial = (index: number) => {
    if (!formData) return;
    const current = (formData.studyMaterials || []).filter((_, i) => i !== index);
    setFormData({ ...formData, studyMaterials: current });
  };

  // Manejo de Hoja de Ruta (Roadmap Steps) en el editor
  const handleAddRoadmapStep = () => {
    if (!formData) return;
    const currentSteps = formData.roadmapSteps || [];
    const newStepNum = currentSteps.length + 1;
    const newStep: WorkshopRoadmapStep = {
      id: `step-${formData.step}-${Date.now()}`,
      stepNumber: newStepNum,
      title: `Fase ${newStepNum}: Nueva Dinámica Vivencial`,
      durationMinutes: 15,
      phaseType: 'Dinámica Vivencial',
      description: 'Descripción del ejercicio, preguntas y pauta para el facilitador.',
    };
    setFormData({
      ...formData,
      roadmapSteps: [...currentSteps, newStep],
    });
  };

  const handleUpdateRoadmapStep = (
    stepId: string,
    updates: Partial<WorkshopRoadmapStep>
  ) => {
    if (!formData) return;
    const currentSteps = (formData.roadmapSteps || []).map((s) =>
      s.id === stepId ? { ...s, ...updates } : s
    );
    setFormData({ ...formData, roadmapSteps: currentSteps });
  };

  const handleDeleteRoadmapStep = (stepId: string) => {
    if (!formData) return;
    const currentSteps = (formData.roadmapSteps || [])
      .filter((s) => s.id !== stepId)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setFormData({ ...formData, roadmapSteps: currentSteps });
  };

  // Manejo de Preguntas Guía del Consultor (reflectiveQuestions)
  const handleAddReflectiveQuestion = () => {
    if (!formData) return;
    const current = formData.reflectiveQuestions || [];
    setFormData({
      ...formData,
      reflectiveQuestions: [...current, '¿Qué nueva posibilidad se abre ante esta situación?'],
    });
  };

  const handleUpdateReflectiveQuestion = (index: number, val: string) => {
    if (!formData) return;
    const current = [...(formData.reflectiveQuestions || [])];
    current[index] = val;
    setFormData({ ...formData, reflectiveQuestions: current });
  };

  const handleDeleteReflectiveQuestion = (index: number) => {
    if (!formData) return;
    const current = (formData.reflectiveQuestions || []).filter((_, i) => i !== index);
    setFormData({ ...formData, reflectiveQuestions: current });
  };

  // ---------------------------------------------------------------------------
  // MANEJO DEL CUESTIONARIO DINÁMICO DEL COACparametersEE / PREGUNTAS DEL CUADERNO
  // ---------------------------------------------------------------------------
  const handleOpenAddQuestion = () => {
    if (!activeQuestionnaire) return;
    setIsNewQuestion(true);
    setEditingQuestion({
      id: '',
      questionnaireId: activeQuestionnaire.id,
      label: '',
      type: 'textarea',
      category: 'lingüístico',
      placeholder: 'Escribe tu reflexión ontológica aquí...',
      helperText: 'Considera cómo este quiebre incide en tus decisiones actuales.',
      required: true,
      order: (activeQuestionnaire.questions || []).length + 1,
      options: [],
      scaleMin: 1,
      scaleMax: 5,
      scaleMinLabel: 'Muy bajo',
      scaleMaxLabel: 'Muy alto',
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: QuestionnaireQuestion) => {
    setIsNewQuestion(false);
    setEditingQuestion({ ...q });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestionnaire || !editingQuestion || !editingQuestion.label?.trim()) return;

    if (isNewQuestion) {
      OntologicalStore.addQuestionToQuestionnaire(activeQuestionnaire.id, {
        label: editingQuestion.label.trim(),
        type: (editingQuestion.type as QuestionType) || 'textarea',
        category: editingQuestion.category || 'lingüístico',
        placeholder: editingQuestion.placeholder || '',
        helperText: editingQuestion.helperText || '',
        required: !!editingQuestion.required,
        options: editingQuestion.options || [],
        scaleMin: editingQuestion.scaleMin || 1,
        scaleMax: editingQuestion.scaleMax || 5,
        scaleMinLabel: editingQuestion.scaleMinLabel || 'Bajo',
        scaleMaxLabel: editingQuestion.scaleMaxLabel || 'Alto',
      });
      showNotification('Pregunta agregada exitosamente al cuestionario.');
    } else if (editingQuestion.id) {
      OntologicalStore.updateQuestionInQuestionnaire(
        activeQuestionnaire.id,
        editingQuestion.id,
        {
          label: editingQuestion.label.trim(),
          type: (editingQuestion.type as QuestionType) || 'textarea',
          category: editingQuestion.category || 'lingüístico',
          placeholder: editingQuestion.placeholder || '',
          helperText: editingQuestion.helperText || '',
          required: !!editingQuestion.required,
          options: editingQuestion.options || [],
          scaleMin: editingQuestion.scaleMin || 1,
          scaleMax: editingQuestion.scaleMax || 5,
          scaleMinLabel: editingQuestion.scaleMinLabel || 'Bajo',
          scaleMaxLabel: editingQuestion.scaleMaxLabel || 'Alto',
        }
      );
      showNotification('Pregunta actualizada correctamente.');
    }

    refreshAll();
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!activeQuestionnaire) return;
    if (window.confirm('¿Deseas eliminar esta pregunta del cuestionario?')) {
      OntologicalStore.deleteQuestionFromQuestionnaire(activeQuestionnaire.id, questionId);
      refreshAll();
      showNotification('Pregunta eliminada.');
    }
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!activeQuestionnaire) return;
    const currentQuestions = [...(activeQuestionnaire.questions || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentQuestions.length) return;

    const temp = currentQuestions[index];
    currentQuestions[index] = currentQuestions[targetIndex];
    currentQuestions[targetIndex] = temp;

    const idsInOrder = currentQuestions.map((q) => q.id);
    OntologicalStore.reorderQuestionsInQuestionnaire(activeQuestionnaire.id, idsInOrder);
    refreshAll();
  };

  // Abrir modal de vista previa del cuestionario
  const handleOpenPreview = (step: number) => {
    setPreviewStep(step);
    setIsPreviewModalOpen(true);
  };

  // Contadores métricos rápidos
  const totalQuestionsCount = questionnaires.reduce(
    (acc, q) => acc + (q.questions || []).length,
    0
  );

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Notificación Flotante */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold shadow-2xl border border-neutral-700 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 1: CATÁLOGO Y MALLA DE MÓDULOS DE SESIÓN                           */}
      {/* ========================================================================= */}
      {viewMode === 'catalog' && (
        <div className="space-y-6">
          {/* Encabezado Pedagógico y Métricas */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-600 dark:text-indigo-400">
                    Estructura Curricular & Contenido
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
                    Diseño de Sesiones RBC
                  </span>
                </div>
                <h2 className="text-xl font-bold text-black dark:text-white mt-1">
                  Módulos de Sesiones de Consultoría Ontológica
                </h2>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-1 max-w-2xl leading-relaxed">
                  Administra y crea los módulos estructurados de sesión, sus ejes temáticos en los tres
                  dominios (lingüístico, somático, emocional), las micro-prácticas directivas y los bancos de preguntas
                  reflexivas para el cuaderno del coachee.
                </p>
              </div>

              {/* Botones de Acción Primarios */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer transition-all"
                  title="Restablecer a los 12 módulos estándar de fábrica"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                  <span>Restablecer Estándar</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateNewModule}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Nuevo Módulo</span>
                </button>
              </div>
            </div>

            {/* Fila de Métricas Rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
              <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Módulos Activos
                </span>
                <span className="text-lg font-bold text-black dark:text-white mt-0.5 block">
                  {nodes.length} Módulos
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Preguntas Totales
                </span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                  {totalQuestionsCount} Preguntas
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Dominios Cubiertos
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  3 Dominios
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Enfoque Metodológico
                </span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                  Ontológico & ICF
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-gray-200 dark:border-neutral-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, objetivo, quiebre ontológico o pregunta..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/60 dark:bg-neutral-800/60 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white cursor-pointer"
              >
                <option value="all">Todos los Niveles</option>
                <option value="Nivel I">Nivel I: Fundamentos</option>
                <option value="Nivel II">Nivel II: Relaciones</option>
                <option value="Nivel III">Nivel III: Dirección</option>
              </select>
            </div>
          </div>

          {/* Malla de Tarjetas de Módulos */}
          {filteredNodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredNodes.map((node) => {
                const nodeQuestionnaire = questionnaires.find(
                  (q) => q.targetType === 'workshop_node' && q.targetStep === node.step
                );
                const questionsCount = nodeQuestionnaire?.questions?.length || 0;
                const roadmapCount = node.roadmapSteps?.length || 0;
                const materialsCount = node.studyMaterials?.length || 0;

                return (
                  <div
                    key={node.step}
                    className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
                  >
                    {/* Cabecera de la Tarjeta */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-mono text-xs font-bold flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                            {node.step < 10 ? `0${node.step}` : node.step}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              node.level === 'Nivel I'
                                ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                                : node.level === 'Nivel II'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            }`}
                          >
                            {node.level}
                          </span>
                        </div>

                        <span className="text-[11px] font-medium text-gray-400">
                          {node.weekLabel || `Paso ${node.step}`}
                        </span>
                      </div>

                      {/* Título y Objetivo */}
                      <div>
                        <h3 className="text-sm font-bold text-black dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {node.sessionTitle}
                        </h3>
                        <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1.5 line-clamp-3 leading-relaxed">
                          {node.objective}
                        </p>
                      </div>

                      {/* Pregunta Clave Destacada */}
                      {node.keyQuestion && (
                        <div className="p-2.5 rounded-xl bg-gray-50/90 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800/60">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-indigo-500 block mb-0.5">
                            Pregunta Detonante:
                          </span>
                          <p className="text-[11px] font-medium text-gray-700 dark:text-neutral-300 italic line-clamp-2">
                            "{node.keyQuestion}"
                          </p>
                        </div>
                      )}

                      {/* Insignias de Contenido y Preguntas */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 font-medium flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-indigo-500" />
                          <span>{questionsCount} Pregs. Cuestionario</span>
                        </span>

                        {roadmapCount > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 font-medium flex items-center gap-1">
                            <ListOrdered className="w-3 h-3 text-emerald-500" />
                            <span>{roadmapCount} Fases</span>
                          </span>
                        )}

                        {materialsCount > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 font-medium flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-500" />
                            <span>{materialsCount} Guías</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botonera de Acciones de la Tarjeta */}
                    <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleDuplicate(node.step, e)}
                          title="Duplicar Módulo"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(node.step, e)}
                          title="Eliminar Módulo"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(node.step)}
                          title="Vista Previa de Preguntas"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditor(node.step, 'questions')}
                          className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-[11px] font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                          Preguntas
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditor(node.step, 'general')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-[11px] font-bold shadow-xs cursor-pointer transition-all"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar Módulo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800 space-y-3">
              <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
              <h4 className="text-sm font-bold text-black dark:text-white">
                No se encontraron módulos con el criterio especificado
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Intenta con otra palabra clave o restablece los filtros para ver todos los módulos curriculares.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setLevelFilter('all');
                }}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 rounded-xl hover:bg-gray-200 cursor-pointer"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: EDITOR EXHAUSTIVO DEL MÓDULO, CONTENIDO Y PREGUNTAS             */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && formData && (
        <div className="space-y-6">
          {/* Barra Superior del Editor */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('catalog')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>← Catálogo de Módulos</span>
                  </button>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    Módulo {formData.step} ({formData.level})
                  </span>
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white mt-1 truncate max-w-xl">
                  {formData.sessionTitle || 'Módulo de Consultoría'}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenPreview(formData.step)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Probar Cuaderno</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveModule}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Módulo</span>
                </button>
              </div>
            </div>

            {/* Pestañas de Navegación del Editor */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setEditorTab('general')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  editorTab === 'general'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold">1. Objetivos & Ficha</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Título, nivel, quiebre y outcomes
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('content')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  editorTab === 'content'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold">2. Contenido en 3 Dominios</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Lenguaje, somática y emociones
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('questions')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  editorTab === 'questions'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold">3. Banco de Preguntas</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Preguntas guía y cuestionario coachee
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('materials')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  editorTab === 'materials'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold">4. Guías & Materiales</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Fichas, dinámicas y lecturas
                </p>
              </button>
            </div>
          </div>

          {/* CUERPO DEL EDITOR SEGÚN LA PESTAÑA */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs">
            {/* ------------------------------------------------------------- */}
            {/* PESTAÑA 1: OBJETIVOS & FICHA GENERAL                          */}
            {/* ------------------------------------------------------------- */}
            {editorTab === 'general' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                      Número de Módulo / Paso
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.step}
                      onChange={(e) => setFormData({ ...formData, step: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                      Nivel Formativo
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                    >
                      <option value="Nivel I">Nivel I: Fundamentos & Transparencia</option>
                      <option value="Nivel II">Nivel II: Relaciones & Emocionalidad</option>
                      <option value="Nivel III">Nivel III: Dirección & Trascendencia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                      Temporalidad / Ciclo
                    </label>
                    <input
                      type="text"
                      value={formData.weekLabel || ''}
                      onChange={(e) => setFormData({ ...formData, weekLabel: e.target.value })}
                      placeholder="Ej: Semanas 1-2, Ciclo Inicial"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                    Título Oficial del Módulo de Sesión
                  </label>
                  <input
                    type="text"
                    value={formData.sessionTitle}
                    onChange={(e) => setFormData({ ...formData, sessionTitle: e.target.value })}
                    placeholder="Ej: Mapeo de la Transparencia y Quiebres Inconscientes"
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                    Objetivo Ontológico Central (Propósito Transformacional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    placeholder="¿Qué cambio de observador y recuperación de poder de acción persigue este módulo?"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                    Pregunta Soberana / Clave de Entrada
                  </label>
                  <input
                    type="text"
                    value={formData.keyQuestion}
                    onChange={(e) => setFormData({ ...formData, keyQuestion: e.target.value })}
                    placeholder="¿En qué áreas de tu vida estás tolerando costos ocultos en automático?"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                    Consigna / Prompt de Nivel para el Coachee
                  </label>
                  <input
                    type="text"
                    value={formData.levelPrompt || ''}
                    onChange={(e) => setFormData({ ...formData, levelPrompt: e.target.value })}
                    placeholder="Registra los límites omitidos y acuerdos tácitos que drenan tu energía vital..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                  />
                </div>

                {/* Resultados Tangibles Esperados (Outcomes) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-semibold text-black dark:text-white">
                      Resultados Tangibles Esperados ({formData.tangibleOutcomes?.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddOutcome}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Resultado</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(formData.tangibleOutcomes || []).map((out, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                          ✓
                        </span>
                        <input
                          type="text"
                          value={out}
                          onChange={(e) => handleUpdateOutcome(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteOutcome(idx)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* PESTAÑA 2: CONTENIDO EN LOS 3 DOMINIOS & HOJA DE RUTA        */}
            {/* ------------------------------------------------------------- */}
            {editorTab === 'content' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-black dark:text-white">
                    Metodología en los Tres Dominios Ontológicos
                  </h4>
                  <p className="text-xs text-gray-500 font-light">
                    Define las distinciones concretas que estructuran la intervención pedagógica de esta sesión.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Dominio Lingüístico */}
                  <div className="p-4 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
                      <Brain className="w-4 h-4" />
                      <h5 className="text-xs font-bold">1. Dominio Lingüístico</h5>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                      Distinciones del habla, juicios automáticos, narrativas y declaraciones.
                    </p>
                    <textarea
                      rows={5}
                      value={formData.methodology?.linguistic || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          methodology: {
                            ...(formData.methodology || { linguistic: '', somatic: '', emotional: '' }),
                            linguistic: e.target.value,
                          },
                        })
                      }
                      placeholder="Ej: Diferenciación entre el fluir transparente y la declaración de quiebre..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-neutral-800 text-black dark:text-white"
                    />
                  </div>

                  {/* Dominio Somático */}
                  <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                      <Activity className="w-4 h-4" />
                      <h5 className="text-xs font-bold">2. Dominio Somático</h5>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                      Corporalidad, enraizamiento, respiración y registro de tensiones.
                    </p>
                    <textarea
                      rows={5}
                      value={formData.methodology?.somatic || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          methodology: {
                            ...(formData.methodology || { linguistic: '', somatic: '', emotional: '' }),
                            somatic: e.target.value,
                          },
                        })
                      }
                      placeholder="Ej: Calibración de la tensión muscular postural al momento de asumir compromisos..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-neutral-800 text-black dark:text-white"
                    />
                  </div>

                  {/* Dominio Emocional */}
                  <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                      <Heart className="w-4 h-4" />
                      <h5 className="text-xs font-bold">3. Dominio Emocional</h5>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                      Estados de ánimo basales y transición afectiva hacia la soberanía.
                    </p>
                    <textarea
                      rows={5}
                      value={formData.methodology?.emotional || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          methodology: {
                            ...(formData.methodology || { linguistic: '', somatic: '', emotional: '' }),
                            emotional: e.target.value,
                          },
                        })
                      }
                      placeholder="Ej: Reconocimiento de la resignación y sobrecarga como señales tempranas..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-neutral-800 text-black dark:text-white"
                    />
                  </div>
                </div>

                {/* Micro-práctica Vivencial */}
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <h5 className="text-xs font-bold">Micro-práctica Vivencial entre Sesiones</h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                        Título de la Micro-práctica
                      </label>
                      <input
                        type="text"
                        value={formData.dailyMicroPractice?.title || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dailyMicroPractice: {
                              ...(formData.dailyMicroPractice || {
                                title: '',
                                description: '',
                                frequency: '',
                              }),
                              title: e.target.value,
                            },
                          })
                        }
                        placeholder="Ej: Pausa de Coherencia y Mapeo en 3 Tiempos"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                        Frecuencia Recomendada
                      </label>
                      <input
                        type="text"
                        value={formData.dailyMicroPractice?.frequency || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dailyMicroPractice: {
                              ...(formData.dailyMicroPractice || {
                                title: '',
                                description: '',
                                frequency: '',
                              }),
                              frequency: e.target.value,
                            },
                          })
                        }
                        placeholder="Ej: Diaria (3 veces al día: 9:00 AM, 2:00 PM, 6:00 PM)"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                      Instrucciones Detalladas de la Práctica
                    </label>
                    <textarea
                      rows={3}
                      value={formData.dailyMicroPractice?.description || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dailyMicroPractice: {
                            ...(formData.dailyMicroPractice || {
                              title: '',
                              description: '',
                              frequency: '',
                            }),
                            description: e.target.value,
                          },
                        })
                      }
                      placeholder="Describe los pasos para que el coachee ejecute la práctica en su cotidianidad..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                    />
                  </div>
                </div>

                {/* Hoja de Ruta de la Sesión (Fases / Roadmap Steps) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-black dark:text-white">
                        Hoja de Ruta de la Sesión (Fases Secuenciales)
                      </h5>
                      <p className="text-[11px] text-gray-400 font-light">
                        Estructura temporal y dinámicas recomendadas durante el encuentro 1 a 1.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddRoadmapStep}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Fase</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(formData.roadmapSteps || []).map((step, idx) => (
                      <div
                        key={step.id}
                        className="p-3.5 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/20 space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => handleUpdateRoadmapStep(step.id, { title: e.target.value })}
                              placeholder="Título de la fase"
                              className="font-bold text-xs bg-transparent border-b border-dashed border-gray-300 dark:border-neutral-700 focus:outline-hidden text-black dark:text-white"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={step.phaseType}
                              onChange={(e) =>
                                handleUpdateRoadmapStep(step.id, { phaseType: e.target.value as any })
                              }
                              className="px-2 py-1 text-[11px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                            >
                              <option value="Centramiento & Apertura">Centramiento & Apertura</option>
                              <option value="Marco Teórico Ontológico">Marco Teórico Ontológico</option>
                              <option value="Dinámica Vivencial">Dinámica Vivencial</option>
                              <option value="Práctica Somática">Práctica Somática</option>
                              <option value="Cierre & Acuerdos">Cierre & Acuerdos</option>
                            </select>

                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="5"
                                step="5"
                                value={step.durationMinutes}
                                onChange={(e) =>
                                  handleUpdateRoadmapStep(step.id, {
                                    durationMinutes: parseInt(e.target.value) || 10,
                                  })
                                }
                                className="w-14 px-2 py-1 text-[11px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-center font-mono"
                              />
                              <span className="text-[10px] text-gray-400">min</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteRoadmapStep(step.id)}
                              className="p-1 text-gray-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={step.description}
                          onChange={(e) =>
                            handleUpdateRoadmapStep(step.id, { description: e.target.value })
                          }
                          placeholder="Descripción y pautas para el facilitador..."
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* PESTAÑA 3: BANCO DE PREGUNTAS GUÍA & CUESTIONARIO REFLEXIVO   */}
            {/* ------------------------------------------------------------- */}
            {editorTab === 'questions' && (
              <div className="space-y-6">
                {/* 1. Pregunta Clave Maestra */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <Sparkles className="w-4 h-4" />
                    <h4 className="text-xs font-bold">Pregunta Clave Maestra de la Sesión</h4>
                  </div>
                  <input
                    type="text"
                    value={formData.keyQuestion}
                    onChange={(e) => setFormData({ ...formData, keyQuestion: e.target.value })}
                    placeholder="¿En qué áreas de tu vida estás operando en piloto automático tolerando costos ocultos?"
                    className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-neutral-800 text-black dark:text-white"
                  />
                  <p className="text-[10px] text-gray-400 font-light">
                    Esta es la pregunta detonadora central que abre la indagación ontológica del módulo.
                  </p>
                </div>

                {/* 2. Preguntas Guía para el Consultor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-black dark:text-white">
                        Preguntas Guía de Indagación para el Consultor / Coach ({formData.reflectiveQuestions?.length || 0})
                      </h4>
                      <p className="text-[11px] text-gray-400 font-light">
                        Batería de preguntas poderosas que el consultor tiene a mano durante el diálogo de coaching.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddReflectiveQuestion}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Pregunta Guía</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(formData.reflectiveQuestions || []).map((q, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={q}
                          onChange={(e) => handleUpdateReflectiveQuestion(idx, e.target.value)}
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteReflectiveQuestion(idx)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Cuestionario Dinámico del Coachee (Cuaderno de Trabajo) */}
                <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-black dark:text-white">
                          Cuestionario del Coachee / Cuaderno de Trabajo
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          {activeQuestionnaire?.questions?.length || 0} Preguntas
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-light mt-0.5">
                        Preguntas estructuradas que el coachee responderá en su cuaderno de trabajo antes o después de la sesión.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(formData.step)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Vista Previa</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenAddQuestion}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Pregunta</span>
                      </button>
                    </div>
                  </div>

                  {/* Lista de Preguntas del Cuestionario */}
                  {activeQuestionnaire && activeQuestionnaire.questions && activeQuestionnaire.questions.length > 0 ? (
                    <div className="space-y-3">
                      {activeQuestionnaire.questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/40 dark:bg-neutral-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-300 dark:hover:border-neutral-700 transition-all"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>

                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
                                  {q.category || 'General'}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-neutral-300">
                                  {q.type === 'textarea'
                                    ? 'Texto Largo'
                                    : q.type === 'text'
                                    ? 'Texto Corto'
                                    : q.type === 'rating_scale'
                                    ? 'Escala 1-5'
                                    : q.type === 'select'
                                    ? 'Selección'
                                    : 'Booleano'}
                                </span>
                                {q.required && (
                                  <span className="text-[10px] font-bold text-rose-500">
                                    * Requerida
                                  </span>
                                )}
                              </div>

                              <h5 className="text-xs font-bold text-black dark:text-white leading-snug">
                                {q.label}
                              </h5>

                              {q.helperText && (
                                <p className="text-[11px] text-gray-400 font-light truncate">
                                  {q.helperText}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Acciones de Pregunta */}
                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveQuestion(idx, 'up')}
                              className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Subir orden"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              disabled={idx === (activeQuestionnaire.questions.length - 1)}
                              onClick={() => handleMoveQuestion(idx, 'down')}
                              className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Bajar orden"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditQuestion(q)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 cursor-pointer"
                              title="Editar pregunta"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 cursor-pointer"
                              title="Eliminar pregunta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 text-xs text-gray-400 space-y-2">
                      <p>Este módulo no tiene preguntas en su cuestionario aún.</p>
                      <button
                        type="button"
                        onClick={handleOpenAddQuestion}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        + Agregar la primera pregunta reflexiva
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* PESTAÑA 4: GUÍAS & MATERIALES DESCARGABLES                    */}
            {/* ------------------------------------------------------------- */}
            {editorTab === 'materials' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-black dark:text-white">
                      Guías de Trabajo y Materiales Adjuntos al Módulo ({formData.studyMaterials?.length || 0})
                    </h4>
                    <p className="text-[11px] text-gray-400 font-light">
                      Documentos formativos, matrices de diagnóstico o protocolos descargables vinculados a este módulo.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddStudyMaterial}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Material</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.studyMaterials || []).map((mat, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/40 dark:bg-neutral-800/20 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <input
                          type="text"
                          value={mat.title}
                          onChange={(e) => handleUpdateStudyMaterial(idx, 'title', e.target.value)}
                          placeholder="Título del documento o guía..."
                          className="font-bold text-xs bg-transparent border-b border-dashed border-gray-300 dark:border-neutral-700 text-black dark:text-white flex-1"
                        />

                        <div className="flex items-center gap-2">
                          <select
                            value={mat.type}
                            onChange={(e) => handleUpdateStudyMaterial(idx, 'type', e.target.value)}
                            className="px-2 py-1 text-[11px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                          >
                            <option value="Guía de Trabajo">Guía de Trabajo</option>
                            <option value="Ficha de Ejercicio">Ficha de Ejercicio</option>
                            <option value="Matriz de Diagnóstico">Matriz de Diagnóstico</option>
                            <option value="Protocolo Somático">Protocolo Somático</option>
                          </select>

                          <input
                            type="text"
                            value={mat.pages}
                            onChange={(e) => handleUpdateStudyMaterial(idx, 'pages', e.target.value)}
                            placeholder="4 páginas"
                            className="w-24 px-2 py-1 text-[11px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-center"
                          />

                          <button
                            type="button"
                            onClick={() => handleDeleteStudyMaterial(idx)}
                            className="p-1 text-gray-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={mat.description}
                        onChange={(e) => handleUpdateStudyMaterial(idx, 'description', e.target.value)}
                        placeholder="Descripción del material y objetivo de auto-estudio..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navegación al pie del editor */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  if (editorTab === 'content') setEditorTab('general');
                  else if (editorTab === 'questions') setEditorTab('content');
                  else if (editorTab === 'materials') setEditorTab('questions');
                  else setViewMode('catalog');
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
              >
                {editorTab === 'general' ? '← Volver al Catálogo' : '← Sección Anterior'}
              </button>

              <div className="flex items-center gap-2">
                {editorTab !== 'materials' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (editorTab === 'general') setEditorTab('content');
                      else if (editorTab === 'content') setEditorTab('questions');
                      else if (editorTab === 'questions') setEditorTab('materials');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    <span>Siguiente Sección</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveModule}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Módulo Completo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURAR / CREAR / EDITAR PREGUNTA DEL CUESTIONARIO              */}
      {/* ========================================================================= */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-black dark:text-white">
                  {isNewQuestion ? 'Nueva Pregunta para el Cuaderno' : 'Editar Pregunta del Cuaderno'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Enunciado de la Pregunta
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.label || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, label: e.target.value })}
                  placeholder="Ej: ¿Qué juicio maestro o creencia descubres operando detrás de esta situación?"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                    Tipo de Respuesta
                  </label>
                  <select
                    value={editingQuestion.type || 'textarea'}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, type: e.target.value as QuestionType })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                  >
                    <option value="textarea">Texto Largo / Reflexión Abierta</option>
                    <option value="text">Texto Corto / Frase Breve</option>
                    <option value="rating_scale">Escala Numérica (1 a 5)</option>
                    <option value="boolean">Confirmación (Sí / No)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                    Categoría Ontológica
                  </label>
                  <select
                    value={editingQuestion.category || 'lingüístico'}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                  >
                    <option value="lingüístico">Dominio Lingüístico</option>
                    <option value="somático">Dominio Somático</option>
                    <option value="emocional">Dominio Emocional</option>
                    <option value="acuerdos">Acuerdos & Compromisos</option>
                    <option value="metodológico">Metodológico / Diagnóstico</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Texto de Ayuda u Orientación (Opcional)
                </label>
                <input
                  type="text"
                  value={editingQuestion.helperText || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, helperText: e.target.value })
                  }
                  placeholder="Ej: Distingue entre el hecho fáctico y tu narrativa subjetiva..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Placeholder / Pista en el Campo (Opcional)
                </label>
                <input
                  type="text"
                  value={editingQuestion.placeholder || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, placeholder: e.target.value })
                  }
                  placeholder="Ej: Escribe tu respuesta con serenidad aquí..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqCheck"
                  checked={!!editingQuestion.required}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, required: e.target.checked })
                  }
                  className="rounded-sm text-indigo-600 cursor-pointer"
                />
                <label htmlFor="reqCheck" className="text-xs text-gray-700 dark:text-neutral-300 cursor-pointer">
                  Marcar como obligatoria para completar el cuaderno
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isNewQuestion ? 'Agregar Pregunta' : 'Guardar Pregunta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VISTA PREVIA INTERACTIVA DEL CUADERNO (SIMULADOR DE COACparametersEE)       */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-2xl p-6 space-y-6 text-left">
            {/* Cabecera del Simulador */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  Simulador de Cuaderno del Coachee
                </span>
                <h3 className="text-base font-bold text-black dark:text-white mt-1">
                  Vista Previa: Módulo {previewStep}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Renderizado del Cuestionario del Coachee */}
            {(() => {
              const previewQ =
                questionnaires.find(
                  (q) => q.targetType === 'workshop_node' && q.targetStep === previewStep
                ) || OntologicalStore.getQuestionnaireForWorkshop(previewStep);

              const previewNode = nodes.find((n) => n.step === previewStep);

              return (
                <div className="space-y-6">
                  {/* Tarjeta de Contexto de la Sesión */}
                  {previewNode && (
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                      <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        {previewNode.sessionTitle}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-neutral-300 font-light leading-relaxed">
                        {previewNode.objective}
                      </p>
                      {previewNode.keyQuestion && (
                        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 italic pt-1">
                          Pregunta de inicio: "{previewNode.keyQuestion}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Preguntas Interactivas simuladas */}
                  {previewQ && previewQ.questions && previewQ.questions.length > 0 ? (
                    <div className="space-y-5">
                      {previewQ.questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-gray-50/40 dark:bg-neutral-800/30 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <span>{q.label}</span>
                              {q.required && <span className="text-rose-500">*</span>}
                            </label>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                              {q.category}
                            </span>
                          </div>

                          {q.helperText && (
                            <p className="text-[11px] text-gray-400 font-light pl-6">
                              {q.helperText}
                            </p>
                          )}

                          <div className="pl-6 pt-1">
                            {q.type === 'textarea' && (
                              <textarea
                                rows={3}
                                placeholder={q.placeholder || 'Escribe tu respuesta aquí...'}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                              />
                            )}

                            {q.type === 'text' && (
                              <input
                                type="text"
                                placeholder={q.placeholder || 'Escribe tu respuesta aquí...'}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                              />
                            )}

                            {q.type === 'rating_scale' && (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] text-gray-400">
                                  <span>{q.scaleMinLabel || '1 (Muy bajo)'}</span>
                                  <span>{q.scaleMaxLabel || '5 (Muy alto)'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                      key={val}
                                      type="button"
                                      className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-bold text-center cursor-pointer"
                                    >
                                      {val}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {q.type === 'boolean' && (
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  className="px-4 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold cursor-pointer"
                                >
                                  Sí, confirmado
                                </button>
                                <button
                                  type="button"
                                  className="px-4 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold cursor-pointer"
                                >
                                  No todavía
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-gray-400">
                      Este módulo no contiene preguntas registradas en su cuestionario.
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsPreviewModalOpen(false)}
                      className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold cursor-pointer"
                    >
                      Cerrar Vista Previa
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
