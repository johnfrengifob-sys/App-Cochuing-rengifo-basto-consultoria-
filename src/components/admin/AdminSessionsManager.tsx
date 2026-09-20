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
  Zap,
  HardDrive,
  Video,
  ExternalLink,
  Radio,
  Workflow,
  FileSpreadsheet,
  Database,
} from 'lucide-react';
import {
  ProgramNodeInfo,
  WorkshopRoadmapStep,
  DynamicQuestionnaire,
  QuestionnaireQuestion,
  QuestionType,
} from '../../types';
import { OntologicalStore } from '../../services/store';
import { FirestoreSyncService } from '../../services/firestoreSync';

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
  const [editorTab, setEditorTab] = useState<'general' | 'materials' | 'integrations'>('general');

  // Formulario local del módulo en edición
  const [formData, setFormData] = useState<ProgramNodeInfo | null>(null);

  // Estados de modales y herramientas auxiliares
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewStep, setPreviewStep] = useState<number>(1);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Safe modal state for deleting session modules (avoids blocked window.confirm in iframes)
  const [deleteModuleTarget, setDeleteModuleTarget] = useState<{ step: number; title: string } | null>(null);

  const confirmDeleteModule = () => {
    if (!deleteModuleTarget) return;
    const { step } = deleteModuleTarget;
    OntologicalStore.deleteProgramNode(step);
    refreshAll();
    showNotification(`Módulo ${step} eliminado.`);
    if (viewMode === 'editor' && formData?.step === step) {
      setViewMode('catalog');
      setFormData(null);
    }
    setDeleteModuleTarget(null);
  };

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
        (n.keyQuestion && n.keyQuestion.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
  const handleOpenEditor = (step: number, initialTab: 'general' | 'materials' | 'integrations' = 'general') => {
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
      showNotification('Debe existir al menos un módulo de sesión activo.');
      return;
    }
    const targetNode = nodes.find((n) => n.step === step);
    setDeleteModuleTarget({
      step,
      title: targetNode?.sessionTitle || `Módulo ${step}`,
    });
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

  // Abrir modal de vista previa del módulo
  const handleOpenPreview = (step: number) => {
    setPreviewStep(step);
    setIsPreviewModalOpen(true);
  };

  // Contadores métricos rápidos
  const totalMaterialsCount = nodes.reduce(
    (acc, n) => acc + (n.studyMaterials || []).length,
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
                  Administra y diseña los módulos de consultoría, fichas técnicas, objetivos de intervención,
                  materiales de apoyo y la vinculación con bitácoras de aprendizaje post-sesión.
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
                  Guías y Materiales
                </span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                  {totalMaterialsCount} Guías
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

                      {/* Insignias del Módulo */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {node.tangibleOutcomes && node.tangibleOutcomes.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 font-medium flex items-center gap-1">
                            <Award className="w-3 h-3 text-indigo-500" />
                            <span>{node.tangibleOutcomes.length} Resultados</span>
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
                          title="Vista Previa de la Ficha"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
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
                  <span>Vista Previa Ficha</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                  <span className="text-xs font-bold">1. Ficha</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Título, nivel y outcomes
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
                  <span className="text-xs font-bold">2. Guías</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Fichas y lecturas
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('integrations')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  editorTab === 'integrations'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold">3. Formularios & Triggers</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Google Forms, Drive y Lienzo
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
            {/* PESTAÑA 2: GUÍAS & MATERIALES DESCARGABLES                    */}
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

            {/* ------------------------------------------------------------- */}
            {/* PESTAÑA 5: FORMULARIOS, ACTIVADORES Y RECURSOS INTEGRADOS     */}
            {/* ------------------------------------------------------------- */}
            {editorTab === 'integrations' && (
              <div className="space-y-6">
                <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Gestión Integrada del Módulo de Consultoría
                    </h4>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 font-light mt-1">
                    Enlaza directamente los formularios de diagnóstico, carpetas de Google Drive, automatizaciones de seguimiento y herramientas vivenciales de este paso formativo.
                  </p>
                </div>

                {/* 1. Google Forms */}
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">
                        Formulario de Google Forms Vinculado
                      </span>
                    </div>
                    {formData.googleFormsUrl && (
                      <a
                        href={formData.googleFormsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>Abrir Formulario</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                    Pega el enlace de Google Forms para que el coachee complete su acuerdo co-creativo, bitácora o evaluación previa/posterior.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://forms.gle/qYd64L1q521hD6Vj9"
                      value={formData.googleFormsUrl || ''}
                      onChange={(e) => setFormData({ ...formData, googleFormsUrl: e.target.value })}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono placeholder:font-sans"
                    />
                    {formData.googleFormsUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, googleFormsUrl: '' })}
                        className="px-2.5 py-2 text-xs text-gray-400 hover:text-rose-600 cursor-pointer"
                        title="Limpiar enlace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Preajustes rápidos oficiales de Google Forms */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-gray-400 font-medium mr-1">Preajustes oficiales:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, googleFormsUrl: 'https://forms.gle/qYd64L1q521hD6Vj9' })}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors"
                    >
                      Acuerdo Co-creativo Sesiones
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, googleFormsUrl: 'https://forms.gle/4N1x2K3z7g9fQ5wR8' })}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors"
                    >
                      Bitácora Sesiones B2B
                    </button>
                  </div>
                </div>

                {/* 2. Google Sheets */}
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">
                        Hoja de Google Sheets Vinculada
                      </span>
                    </div>
                    {formData.googleSheetsUrl && (
                      <a
                        href={formData.googleSheetsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <span>Abrir Hoja</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                    Planilla de cálculo donde se almacenan las respuestas, acuerdos o bitácoras asociadas a este módulo.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/1_9i5jB1j4sV61h8Wk3Y6W1J-k-B_bK7cK0o5tV8wR2M/edit"
                      value={formData.googleSheetsUrl || ''}
                      onChange={(e) => setFormData({ ...formData, googleSheetsUrl: e.target.value })}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono placeholder:font-sans"
                    />
                    {formData.googleSheetsUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, googleSheetsUrl: '' })}
                        className="px-2.5 py-2 text-xs text-gray-400 hover:text-rose-600 cursor-pointer"
                        title="Limpiar enlace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Preajustes rápidos oficiales de Google Sheets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-gray-400 font-medium mr-1">Preajustes oficiales:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1_9i5jB1j4sV61h8Wk3Y6W1J-k-B_bK7cK0o5tV8wR2M/edit' })}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-800/40 transition-colors"
                    >
                      Planilla Maestra Sesiones & Acuerdos
                    </button>
                  </div>
                </div>

                {/* 3. Estado de Integración con Firebase Firestore */}
                <div className="p-3.5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Database className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                          Base de Datos Integrada en Firebase Firestore
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Colección programNodes
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70 truncate font-light mt-0.5">
                        Al guardar, este módulo, sus Google Forms y Google Sheets se respaldan en la nube automáticamente.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData) return;
                      await FirestoreSyncService.syncProgramNode(formData);
                      showNotification(`Módulo ${formData.step} sincronizado directamente en Firebase.`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shrink-0 transition-colors shadow-sm"
                  >
                    Sincronizar Nube
                  </button>
                </div>

                {/* 2. Google Drive y Carpeta Compartida */}
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                        <HardDrive className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">
                        Google Drive: Carpeta de Materiales & Grabaciones
                      </span>
                    </div>
                    {formData.googleDriveFolderUrl && (
                      <a
                        href={formData.googleDriveFolderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <span>Ver en Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <input
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={formData.googleDriveFolderUrl || ''}
                    onChange={(e) => setFormData({ ...formData, googleDriveFolderUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono placeholder:font-sans"
                  />
                </div>

                {/* 3. Activadores Automáticos de Seguimiento */}
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">
                        Activadores de Seguimiento Automático
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.triggersEnabled ?? true}
                        onChange={(e) => setFormData({ ...formData, triggersEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-gray-600 dark:text-neutral-400 font-light">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
                      <span className="font-semibold text-black dark:text-white block mb-0.5">Recordatorio 24h</span>
                      Alerta automática de la sesión por WhatsApp y correo.
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
                      <span className="font-semibold text-black dark:text-white block mb-0.5">Alerta Inactividad</span>
                      Disparo a los 7 y 14 días si no hay avance en el cuaderno.
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
                      <span className="font-semibold text-black dark:text-white block mb-0.5">Entrega de Cuaderno</span>
                      Notificación al coach y confirmación de generación de PDF.
                    </div>
                  </div>
                </div>

                {/* 4. Herramientas de Experiencia (Lienzo B&W) */}
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">
                        Herramienta Vivencial Asignada (Lienzo B&W)
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.experienceToolEnabled ?? true}
                        onChange={(e) => setFormData({ ...formData, experienceToolEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900 dark:peer-checked:bg-white" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'somatic_wheel', title: 'Rueda de Coherencia Somática', desc: 'Matriz corporal de 4 disposiciones y respiración' },
                      { id: 'conversational_matrix', title: 'Matriz de Actos Lingüísticos', desc: 'Afirmaciones, juicios, promesas y pedidos' },
                      { id: 'breakdown_canvas', title: 'Lienzo de Declaración de Quiebre', desc: 'Desarticulación del relato limitante' },
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, experienceCanvasType: tool.id })}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          (formData.experienceCanvasType || 'somatic_wheel') === tool.id
                            ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 font-semibold text-black dark:text-white'
                            : 'border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                        }`}
                      >
                        <span className="text-xs block font-bold">{tool.title}</span>
                        <span className="text-[10px] text-gray-500 font-light mt-0.5 block">{tool.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navegación al pie del editor */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  if (editorTab === 'integrations') setEditorTab('materials');
                  else if (editorTab === 'materials') setEditorTab('general');
                  else setViewMode('catalog');
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
              >
                {editorTab === 'general' ? '← Volver al Catálogo' : '← Sección Anterior'}
              </button>

              <div className="flex items-center gap-2">
                {editorTab !== 'integrations' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (editorTab === 'general') setEditorTab('materials');
                      else if (editorTab === 'materials') setEditorTab('integrations');
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
      {/* MODAL: VISTA PREVIA DE LA FICHA TÉCNICA DEL MÓDULO                       */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-2xl p-6 space-y-6 text-left">
            {/* Cabecera del Simulador */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                  Ficha Técnica del Módulo
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

            {/* Renderizado de la Ficha Técnica del Módulo */}
            {(() => {
              const previewNode = nodes.find((n) => n.step === previewStep);

              if (!previewNode) {
                return (
                  <div className="p-8 text-center text-xs text-gray-400">
                    No se encontró información para este módulo.
                  </div>
                );
              }

              return (
                <div className="space-y-5">
                  {/* Tarjeta de Contexto de la Sesión */}
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        Nivel {previewNode.level}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-semibold text-gray-600 dark:text-neutral-400">
                        Paso {previewNode.step}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                      {previewNode.sessionTitle}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-neutral-300 font-light leading-relaxed">
                      {previewNode.objective}
                    </p>
                    {previewNode.levelPrompt && (
                      <p className="text-xs text-gray-500 dark:text-neutral-400 italic pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
                        Consigna: {previewNode.levelPrompt}
                      </p>
                    )}
                  </div>

                  {/* Resultados Tangibles Esperados */}
                  {previewNode.tangibleOutcomes && previewNode.tangibleOutcomes.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Resultados Tangibles ({previewNode.tangibleOutcomes.length})</span>
                      </h5>
                      <div className="space-y-1.5">
                        {previewNode.tangibleOutcomes.map((out, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800 text-xs text-gray-700 dark:text-neutral-300"
                          >
                            <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center justify-center font-bold shrink-0">
                              ✓
                            </span>
                            <span>{out}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Guías y Materiales */}
                  {previewNode.studyMaterials && previewNode.studyMaterials.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-purple-500" />
                        <span>Guías y Materiales Adjuntos ({previewNode.studyMaterials.length})</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {previewNode.studyMaterials.map((mat, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50/40 dark:bg-neutral-800/20 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                {mat.type || 'guía'}
                              </span>
                              {mat.pages && (
                                <span className="text-[10px] text-gray-400">{mat.pages}</span>
                              )}
                            </div>
                            <h6 className="text-xs font-semibold text-black dark:text-white truncate">
                              {mat.title}
                            </h6>
                            {mat.description && (
                              <p className="text-[11px] text-gray-400 font-light line-clamp-2">
                                {mat.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nota explicativa de Bitácoras */}
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <p>
                      <strong>Bitácora del participante:</strong> Las preguntas de indagación y reflexión se registran y procesan directamente a través de las bitácoras que los participantes completan después de cada sesión de consultoría.
                    </p>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsPreviewModalOpen(false)}
                      className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold cursor-pointer"
                    >
                      Cerrar Ficha
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar módulo de sesión */}
      {deleteModuleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  ¿Eliminar Módulo {deleteModuleTarget.step}?
                </h3>
                <p className="text-xs text-neutral-500">Acción permanente</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente el módulo{' '}
              <strong className="text-neutral-900 dark:text-white font-semibold">
                "{deleteModuleTarget.title}"
              </strong>
              ? Se eliminarán su temario, materiales y cuestionarios reflexivos asociados.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModuleTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteModule}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
              >
                Sí, eliminar módulo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSessionsManager;
