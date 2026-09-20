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
  Calendar,
  UserCheck,
  Link2,
  Share2,
  ArrowUpRight,
  Send,
  Globe,
  CheckCheck,
  Users,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Film,
} from 'lucide-react';
import {
  ProgramNodeInfo,
  DynamicQuestionnaire,
  QuestionnaireQuestion,
  QuestionType,
  Session,
  User,
  FormsSheetsIntegrationSourceKey,
} from '../../types';
import { OntologicalStore } from '../../services/store';
import { FirestoreSyncService } from '../../services/firestoreSync';
import {
  OFFICIAL_FORMS_SHEETS_BASE_MAP,
  OFFICIAL_FORMS_SHEETS_BASE_LIST,
  OfficialFormsSheetsRecord,
  getOfficialFormsSheetsBase,
} from '../../data/officialFormsSheetsBase';
import { safeCopyToClipboard } from '../../utils/clipboard';
import { ConsultoriaSessionCreationModal } from './ConsultoriaSessionCreationModal';

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

  // Subpestañas del panel principal de sesiones
  const [catalogSubTab, setCatalogSubTab] = useState<'modules' | 'coachee_sessions' | 'forms_sheets_database'>('modules');

  // Sesiones 1 a 1 de coachees, clientes registrados y base de datos oficial
  const [sessions, setSessions] = useState<Session[]>(() => OntologicalStore.getSessions());
  const [clients, setClients] = useState<User[]>(() => OntologicalStore.getClients());
  const [sesionAcuerdos, setSesionAcuerdos] = useState(() => OntologicalStore.getSesionIndividualAcuerdos());
  const [bitacorasB2B, setBitacorasB2B] = useState(() => OntologicalStore.getBitacorasSesionesB2B());
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Modal Especializado: Módulo de Creación de Sesiones de Consultoría Ontológica 1 a 1
  const [isConsultoriaModalOpen, setIsConsultoriaModalOpen] = useState(false);
  const [selectedConsultoriaSession, setSelectedConsultoriaSession] = useState<Session | null>(null);

  // Modal de Creación "Crear Sesión / Módulo RBC con Google Forms & Sheets"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'module' | 'coachee_session'>('coachee_session');

  // Formulario: Crear Módulo de Consultoría
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleLevel, setNewModuleLevel] = useState<'Nivel I' | 'Nivel II' | 'Nivel III'>('Nivel I');
  const [newModuleObjective, setNewModuleObjective] = useState('');
  const [newModuleKeyQuestion, setNewModuleKeyQuestion] = useState('');
  const [newModuleDatabasePreset, setNewModuleDatabasePreset] = useState<FormsSheetsIntegrationSourceKey | 'none' | 'custom'>('sesiones_individuales');
  const [newModuleCustomFormUrl, setNewModuleCustomFormUrl] = useState('');
  const [newModuleCustomSheetUrl, setNewModuleCustomSheetUrl] = useState('');

  // Formulario: Programar Sesión 1 a 1 para Coachee
  const [newSessionClientId, setNewSessionClientId] = useState('');
  const [newSessionStep, setNewSessionStep] = useState<number>(1);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDate, setNewSessionDate] = useState(() => {
    const d = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);
    return d.toISOString().split('T')[0];
  });
  const [newSessionTime, setNewSessionTime] = useState('10:00');
  const [newSessionDuration, setNewSessionDuration] = useState('60');
  const [newSessionMeetLink, setNewSessionMeetLink] = useState(() => `https://meet.google.com/rbc-${Math.random().toString(36).substring(2, 7)}`);
  const [newSessionGoal, setNewSessionGoal] = useState('');
  const [newSessionDatabasePreset, setNewSessionDatabasePreset] = useState<FormsSheetsIntegrationSourceKey | 'custom'>('sesiones_individuales');
  const [newSessionCustomFormUrl, setNewSessionCustomFormUrl] = useState('');
  const [newSessionCustomSheetUrl, setNewSessionCustomSheetUrl] = useState('');
  const [newSessionAttachAgreement, setNewSessionAttachAgreement] = useState(true);
  const [newSessionAttachBitacora, setNewSessionAttachBitacora] = useState(true);

  // Espacio para Guía de Trabajo y Video en Creación de Sesiones
  const [newSessionGuideUrl, setNewSessionGuideUrl] = useState('');
  const [newSessionGuideTitle, setNewSessionGuideTitle] = useState('');
  const [newSessionVideoUrl, setNewSessionVideoUrl] = useState('');
  const [newSessionVideoTitle, setNewSessionVideoTitle] = useState('');

  // Espacio para Guía y Video en Creación de Módulos
  const [newModuleGuideUrl, setNewModuleGuideUrl] = useState('');
  const [newModuleVideoUrl, setNewModuleVideoUrl] = useState('');

  // Filtros de búsqueda en sesiones programadas
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionStatusFilter, setSessionStatusFilter] = useState<'all' | 'scheduled' | 'completed'>('all');

  // Inspección de estructura de columnas de Google Sheets
  const [inspectingDatabaseKey, setInspectingDatabaseKey] = useState<FormsSheetsIntegrationSourceKey | null>(null);

  // Filtros de búsqueda en catálogo de módulos
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'Nivel I' | 'Nivel II' | 'Nivel III'>('all');

  // Modo de vista: 'catalog' (grilla/lista) o 'editor' (edición exhaustiva de un módulo)
  const [viewMode, setViewMode] = useState<'catalog' | 'editor'>('catalog');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [editorTab, setEditorTab] = useState<'general' | 'integrations'>('general');

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
      setSessions(OntologicalStore.getSessions());
      setClients(OntologicalStore.getClients());
      setSesionAcuerdos(OntologicalStore.getSesionIndividualAcuerdos());
      setBitacorasB2B(OntologicalStore.getBitacorasSesionesB2B());
      if (formData) {
        const updatedTarget = freshNodes.find((n) => n.step === formData.step);
        if (updatedTarget) setFormData(updatedTarget);
      }
    };

    window.addEventListener('rbc-program-nodes-updated', handleSync);
    window.addEventListener('rbc-questionnaires-updated', handleSync);
    window.addEventListener('rbc-sessions-updated', handleSync);
    window.addEventListener('rbc-forms-sheets-updated', handleSync);
    window.addEventListener('rbc-forms-sheets-data-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('rbc-program-nodes-updated', handleSync);
      window.removeEventListener('rbc-questionnaires-updated', handleSync);
      window.removeEventListener('rbc-sessions-updated', handleSync);
      window.removeEventListener('rbc-forms-sheets-updated', handleSync);
      window.removeEventListener('rbc-forms-sheets-data-updated', handleSync);
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

  // Filtrado de sesiones de coachees
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const client = clients.find((c) => c.uid === s.clientId);
      const matchSearch =
        sessionSearch.trim() === '' ||
        (s.title && s.title.toLowerCase().includes(sessionSearch.toLowerCase())) ||
        (s.sessionGoal && s.sessionGoal.toLowerCase().includes(sessionSearch.toLowerCase())) ||
        (client && ((client.displayName || client.name || '').toLowerCase().includes(sessionSearch.toLowerCase()) || client.email.toLowerCase().includes(sessionSearch.toLowerCase()))) ||
        `sesión ${s.sessionNumber}`.includes(sessionSearch.toLowerCase());

      const matchStatus =
        sessionStatusFilter === 'all' || s.status === sessionStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [sessions, clients, sessionSearch, sessionStatusFilter]);

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
  const handleOpenEditor = (step: number, initialTab: 'general' | 'integrations' = 'general') => {
    const target = nodes.find((n) => n.step === step) || nodes[0];
    setActiveStep(step);
    setFormData(JSON.parse(JSON.stringify(target)));
    setEditorTab(initialTab);
    setViewMode('editor');
  };

  // Copiar enlaces oficiales al portapapeles de manera segura
  const handleCopyUrl = async (url: string, label: string) => {
    const ok = await safeCopyToClipboard(url);
    if (ok) {
      setCopiedUrl(url);
      showNotification(`${label} copiado al portapapeles.`);
      setTimeout(() => setCopiedUrl(null), 2500);
    }
  };

  // Generar enlace dinámico de Google Meet para sesiones
  const generateMeetLink = () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const s1 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const s2 = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const s3 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    return `https://meet.google.com/${s1}-${s2}-${s3}`;
  };

  // Sincronizar selección de paso de módulo para sesión 1 a 1
  const handleSelectSessionStep = (stepNum: number) => {
    setNewSessionStep(stepNum);
    const targetNode = nodes.find((n) => n.step === stepNum);
    if (targetNode) {
      setNewSessionTitle(`Sesión ${stepNum}: ${targetNode.sessionTitle}`);
      setNewSessionGoal(targetNode.objective);
    }
  };

  // Abrir modal de creación de Sesión o Módulo con Google Forms & Sheets
  const handleOpenCreateModal = (mode: 'module' | 'coachee_session' = 'coachee_session', sessionToEdit?: Session) => {
    if (mode === 'coachee_session') {
      setSelectedConsultoriaSession(sessionToEdit || null);
      setIsConsultoriaModalOpen(true);
      return;
    }
    setCreateMode(mode);
    const nextStep = nodes.length > 0 ? Math.max(...nodes.map((n) => n.step)) + 1 : 1;
    setNewModuleTitle(`Módulo ${nextStep}: Consultoría y Liderazgo Estratégico`);
    setNewModuleLevel('Nivel I');
    setNewModuleObjective('Definir el propósito y resultados estratégicos a desarrollar en este módulo.');
    setNewModuleKeyQuestion('¿Qué resultados estratégicos y acuerdos buscas consolidar en este módulo?');
    setNewModuleDatabasePreset('sesiones_individuales');
    setNewModuleCustomFormUrl('');
    setNewModuleCustomSheetUrl('');
    setNewModuleGuideUrl('');
    setNewModuleVideoUrl('');
    setNewSessionGuideUrl('');
    setNewSessionGuideTitle('');
    setNewSessionVideoUrl('');
    setNewSessionVideoTitle('');
    setIsCreateModalOpen(true);
  };

  // Confirmar creación de Módulo con Base de Datos Google Forms & Sheets
  const handleConfirmCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    let activeFormUrl = '';
    let activeSheetUrl = '';
    if (newModuleDatabasePreset === 'custom') {
      activeFormUrl = newModuleCustomFormUrl.trim();
      activeSheetUrl = newModuleCustomSheetUrl.trim();
    } else if (newModuleDatabasePreset !== 'none') {
      const preset = OFFICIAL_FORMS_SHEETS_BASE_MAP[newModuleDatabasePreset];
      if (preset) {
        activeFormUrl = preset.formUrl;
        activeSheetUrl = preset.sheetUrl;
      }
    }

    const nextStep = nodes.length > 0 ? Math.max(...nodes.map((n) => n.step)) + 1 : 1;

    const created = OntologicalStore.addProgramNode({
      sessionTitle: newModuleTitle.trim() || `Módulo ${nextStep}: Consultoría y Liderazgo`,
      level: newModuleLevel,
      levelTitle: newModuleLevel === 'Nivel I' ? 'Fundamentos & Estrategia' : newModuleLevel === 'Nivel II' ? 'Relaciones & Compromisos' : 'Dirección & Liderazgo',
      weekLabel: `Semanas ${nextStep * 2 - 1}-${nextStep * 2}`,
      objective: newModuleObjective.trim() || 'Definir el propósito y resultados estratégicos a desarrollar en este módulo.',
      keyQuestion: newModuleKeyQuestion.trim() || '¿Qué resultados estratégicos y acuerdos buscas consolidar en este módulo?',
      levelPrompt: 'Registra los acuerdos, evidencias de cambio y compromisos en este espacio.',
      googleFormsUrl: activeFormUrl,
      googleSheetsUrl: activeSheetUrl,
      guideUrl: newModuleGuideUrl.trim() || undefined,
      videoUrl: newModuleVideoUrl.trim() || undefined,
      tangibleOutcomes: [
        'Clarificación de objetivos y prioridades en la gestión diaria.',
        'Diseño de nuevos acuerdos y compromisos de acción inmediata.',
      ],
      methodology: {
        linguistic: '',
        somatic: '',
        emotional: '',
      },
      dailyMicroPractice: {
        title: 'Pausa Estratégica y Foco Diario',
        description: 'Pausa breve para revisar prioridades, acuerdos asumidos y foco del día.',
        frequency: 'Diaria (2 veces al día)',
      },
      studyMaterials: [
        {
          title: 'Guía de Trabajo y Acuerdos Clave',
          type: 'Guía de Trabajo',
          pages: '4 páginas',
          description: 'Documento descargable para acompañar el trabajo del participante.',
        },
      ],
      reflectiveQuestions: [
        '¿Qué prioridades estratégicas requieren tu atención hoy?',
        '¿Qué nuevos acuerdos y acciones concretas decides asumir?',
      ],
    });

    FirestoreSyncService.syncProgramNode(created).catch(() => {});
    refreshAll();
    setIsCreateModalOpen(false);
    handleOpenEditor(created.step, 'integrations');
    showNotification(`Módulo ${created.step}: "${created.sessionTitle}" creado y vinculado a Google Forms & Sheets.`);
  };

  // Confirmar programación de Sesión 1 a 1 de Acompañamiento
  const handleConfirmScheduleSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionClientId) {
      showNotification('Selecciona un coachee para programar la sesión.');
      return;
    }
    const client = clients.find((c) => c.uid === newSessionClientId);
    const targetNode = nodes.find((n) => n.step === newSessionStep) || nodes[0];
    const dateStr = `${newSessionDate}T${newSessionTime}:00`;

    let activeFormUrl = '';
    let activeSheetUrl = '';
    if (newSessionDatabasePreset === 'custom') {
      activeFormUrl = newSessionCustomFormUrl.trim();
      activeSheetUrl = newSessionCustomSheetUrl.trim();
    } else {
      const preset = OFFICIAL_FORMS_SHEETS_BASE_MAP[newSessionDatabasePreset];
      if (preset) {
        activeFormUrl = preset.formUrl;
        activeSheetUrl = preset.sheetUrl;
      }
    }

    const agreementUrl = newSessionAttachAgreement
      ? OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl
      : undefined;
    const bitacoraUrl = newSessionAttachBitacora
      ? OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl
      : undefined;

    const existingCount = sessions.filter((s) => s.clientId === newSessionClientId).length;
    const sessionNum = existingCount + 1;

    const newSession: Session = {
      id: `sess-${Date.now()}`,
      clientId: newSessionClientId,
      sessionNumber: sessionNum,
      date: new Date(dateStr).toISOString(),
      scheduledDate: newSessionDate,
      scheduledTime: newSessionTime,
      durationMinutes: parseInt(newSessionDuration) || 60,
      meetLink: newSessionMeetLink.trim() || generateMeetLink(),
      status: 'scheduled',
      title: newSessionTitle.trim() || `Sesión de Consultoría #${sessionNum}`,
      sessionGoal: newSessionGoal.trim() || 'Acompañamiento y seguimiento individual',
      programNodeStep: newSessionStep,
      googleFormsUrl: activeFormUrl,
      googleSheetsUrl: activeSheetUrl,
      formsIntegrationId: newSessionDatabasePreset,
      agreementFormUrl: agreementUrl,
      bitacoraFormUrl: bitacoraUrl,
      guideUrl: newSessionGuideUrl.trim() || undefined,
      guideTitle: newSessionGuideTitle.trim() || undefined,
      videoUrl: newSessionVideoUrl.trim() || undefined,
      videoTitle: newSessionVideoTitle.trim() || undefined,
      notes: `Sesión con ${client?.displayName || client?.name || 'Coachee'}. Forms: ${activeFormUrl || 'N/A'}. Sheets: ${activeSheetUrl || 'N/A'}.`,
    };

    OntologicalStore.addSession(newSession);
    FirestoreSyncService.syncSession(newSession).catch(() => {});
    setSessions(OntologicalStore.getSessions());
    setIsCreateModalOpen(false);
    setCatalogSubTab('coachee_sessions');
    showNotification(`Sesión "${newSession.title}" agendada exitosamente con Google Forms & Sheets.`);
  };

  const handleToggleSessionStatus = (sessionId: string) => {
    const current = OntologicalStore.getSessions().find((s) => s.id === sessionId);
    if (!current) return;
    const nextStatus = current.status === 'scheduled' ? 'completed' : 'scheduled';
    OntologicalStore.updateSession(sessionId, { status: nextStatus });
    setSessions(OntologicalStore.getSessions());
    showNotification(`Estado de la sesión actualizado a: ${nextStatus === 'completed' ? 'Completada' : 'Programada'}.`);
  };

  const handleDeleteSession = (sessionId: string) => {
    OntologicalStore.deleteSession(sessionId);
    setSessions(OntologicalStore.getSessions());
    showNotification('Sesión eliminada.');
  };

  // Crear un nuevo módulo desde cero (acceso rápido)
  const handleCreateNewModule = () => {
    handleOpenCreateModal('module');
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
    OntologicalStore.deleteQuestionFromQuestionnaire(activeQuestionnaire.id, questionId);
    refreshAll();
    showNotification('Pregunta eliminada.');
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
          {/* Encabezado Pedagógico, Bases de Datos & Acciones */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-600 dark:text-indigo-400">
                    Estructura Curricular & Google Forms / Sheets Database
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
                    Diseño & Sesiones RBC
                  </span>
                </div>
                <h2 className="text-xl font-bold text-black dark:text-white mt-1">
                  Gestión y Creación de Sesiones de Consultoría Ontológica
                </h2>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-1 max-w-2xl leading-relaxed">
                  Administra los módulos del programa, programa sesiones 1 a 1 para tus coachees y sincroniza todo con la nueva base de datos oficial de Google Forms & Sheets de Rengifo Basto Consultoría.
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
                  onClick={() => handleOpenCreateModal('coachee_session')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Programar Sesión 1 a 1</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('module')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Nuevo Módulo</span>
                </button>
              </div>
            </div>

            {/* Subpestañas del Panel de Sesiones */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setCatalogSubTab('modules')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogSubTab === 'modules'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'bg-gray-50 dark:bg-neutral-800/60 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Módulos & Temario Curricular</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 dark:bg-black/20 font-mono">
                  {nodes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCatalogSubTab('coachee_sessions')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogSubTab === 'coachee_sessions'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'bg-gray-50 dark:bg-neutral-800/60 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Sesiones 1 a 1 Programadas</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 dark:bg-black/20 font-mono">
                  {sessions.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCatalogSubTab('forms_sheets_database')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogSubTab === 'forms_sheets_database'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-900/40'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Base Oficial Google Forms & Sheets</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 font-mono">
                  2 Bases B2B
                </span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUBPESTAÑA 1: MÓDULOS & TEMARIO CURRICULAR                               */}
          {/* ========================================================================= */}
          {catalogSubTab === 'modules' && (
            <div className="space-y-6">
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

                      {/* Insignia y Acceso a la Base Oficial Google Forms & Sheets */}
                      {node.googleFormsUrl ? (
                        <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-[10px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-bold text-emerald-900 dark:text-emerald-300 truncate">
                              {node.googleFormsUrl.includes('dfStXtTyb1MW6W5K9')
                                ? 'Acuerdo Sesiones B2B'
                                : node.googleFormsUrl.includes('APUFto8sGbJt322WA')
                                ? 'Bitácora Sesiones B2B'
                                : 'Google Forms & Sheets'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyUrl(node.googleFormsUrl || '', 'Enlace Formulario Coachee');
                              }}
                              title="Copiar enlace oficial de Google Forms para el coachee"
                              className="p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                            >
                              {copiedUrl === node.googleFormsUrl ? (
                                <CheckCheck className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <a
                              href={node.googleFormsUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                              title="Abrir formulario en Google Forms"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenEditor(node.step, 'integrations')}
                          className="w-full py-1.5 px-2 rounded-xl border border-dashed border-gray-200 dark:border-neutral-800 hover:border-indigo-300 text-[10px] text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Link2 className="w-3 h-3" />
                          <span>Vincular Base de Datos Google Forms & Sheets</span>
                        </button>
                      )}

                      {/* Insignias de Metodología */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {roadmapCount > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 font-medium flex items-center gap-1">
                            <ListOrdered className="w-3 h-3 text-emerald-500" />
                            <span>{roadmapCount} Fases</span>
                          </span>
                        )}

                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          <span>Ontológico</span>
                        </span>
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
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditor(node.step, 'integrations')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-[11px] font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                          title="Gestionar Google Forms & Sheets del módulo"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                          <span>Forms & Sheets</span>
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
        {/* SUBPESTAÑA 2: SESIONES 1 A 1 PROGRAMADAS PARA COACHEES                   */}
        {/* ========================================================================= */}
        {catalogSubTab === 'coachee_sessions' && (
          <div className="space-y-6">
            {/* Métricas de Sesiones 1 a 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 shadow-xs">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Sesiones Programadas
                </span>
                <span className="text-lg font-bold text-black dark:text-white mt-0.5 block">
                  {sessions.length} Citas
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 shadow-xs">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Completadas con Éxito
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {sessions.filter((s) => s.status === 'completed').length} Sesiones
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 shadow-xs">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Coachees Activos
                </span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                  {clients.length} Usuarios
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 shadow-xs">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Bases Oficiales
                </span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                  100% Sheets B2B
                </span>
              </div>
            </div>

            {/* Barra de Búsqueda y Filtros de Sesiones */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  placeholder="Buscar por coachee, número de sesión, objetivo o enlace Meet..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/60 dark:bg-neutral-800/60 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={sessionStatusFilter}
                  onChange={(e) => setSessionStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white cursor-pointer"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="scheduled">Programadas</option>
                  <option value="completed">Completadas</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('coachee_session')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Nueva Cita 1 a 1</span>
                </button>
              </div>
            </div>

            {/* Lista de Sesiones 1 a 1 */}
            {filteredSessions.length > 0 ? (
              <div className="space-y-3">
                {filteredSessions.map((session) => {
                  const client = clients.find((c) => c.uid === session.clientId);
                  const isCompleted = session.status === 'completed';

                  return (
                    <div
                      key={session.id}
                      className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Avatar del Coachee */}
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm shrink-0">
                          {client ? (client.displayName || client.name).substring(0, 2).toUpperCase() : `S${session.sessionNumber}`}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-black dark:text-white">
                              {client ? (client.displayName || client.name) : 'Coachee sin Asignar'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-700 dark:text-indigo-300 font-mono">
                              Sesión #{session.sessionNumber}
                            </span>
                            {/* Badge Dinámico del Tipo de Sesión */}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                session.sessionType === 'cierre_programa'
                                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40'
                                  : session.sessionType === 'cierre_ciclo' || session.sessionType === 'recopilacion_cycle'
                                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40'
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40'
                              }`}
                            >
                              {session.sessionType === 'cierre_programa'
                                ? '🏆 Cierre de programa'
                                : session.sessionType === 'cierre_ciclo' || session.sessionType === 'recopilacion_cycle'
                                ? '🔄 Cierre de ciclo'
                                : '✨ Sesión'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                              onClick={() => handleToggleSessionStatus(session.id)}
                              title="Click para cambiar estado"
                            >
                              {isCompleted ? '✓ Completada' : '⏱ Programada'}
                            </span>
                          </div>

                          <h4 className="text-xs font-semibold text-gray-800 dark:text-neutral-200 truncate">
                            {session.title || `Acompañamiento Ontológico #${session.sessionNumber}`}
                          </h4>

                          {session.sessionGoal && (
                            <p className="text-[11px] text-gray-500 dark:text-neutral-400 italic line-clamp-1">
                              Foco: "{session.sessionGoal}"
                            </p>
                          )}

                          {/* Fecha, Hora y Enlace de Google Meet */}
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-500 dark:text-neutral-400">
                            <span className="flex items-center gap-1 font-medium text-black dark:text-white">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {session.scheduledDate || (session.date ? new Date(session.date).toLocaleDateString() : 'Por definir')} {session.scheduledTime && `• ${session.scheduledTime}`}
                            </span>

                            {session.meetLink && (
                              <a
                                href={session.meetLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Google Meet</span>
                              </a>
                            )}
                          </div>

                          {/* Formularios y Bases de Datos Google Forms & Sheets Vinculadas */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                            {(session.googleFormsUrl || session.agreementFormUrl) && (
                              <a
                                href={session.googleFormsUrl || session.agreementFormUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/50 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                title="Abrir Google Form en nueva pestaña"
                              >
                                <FileText className="w-3 h-3 text-indigo-500" />
                                <span>Google Form</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            )}

                            {session.googleSheetsUrl && (
                              <a
                                href={session.googleSheetsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/50 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                                title="Abrir Google Sheets en nueva pestaña"
                              >
                                <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
                                <span>Google Sheets</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            )}

                            {session.bitacoraFormUrl && session.bitacoraFormUrl !== session.googleFormsUrl && (
                              <a
                                href={session.bitacoraFormUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-200/70 dark:border-purple-800/50 text-[10px] font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                                title="Abrir Bitácora en Google Forms"
                              >
                                <FileText className="w-3 h-3 text-purple-500" />
                                <span>Bitácora B2B</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            )}

                            {session.guideUrl && (
                              <a
                                href={session.guideUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-800/50 text-[10px] font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                                title={session.guideTitle ? `Guía: ${session.guideTitle}` : 'Abrir Guía de Trabajo'}
                              >
                                <BookOpen className="w-3 h-3 text-amber-500" />
                                <span className="max-w-[130px] truncate">{session.guideTitle || 'Guía de Trabajo'}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            )}

                            {session.videoUrl && (
                              <a
                                href={session.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 border border-rose-200/70 dark:border-rose-800/50 text-[10px] font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                                title={session.videoTitle ? `Video: ${session.videoTitle}` : 'Abrir Video de la Sesión'}
                              >
                                <Film className="w-3 h-3 text-rose-500" />
                                <span className="max-w-[130px] truncate">{session.videoTitle || 'Video de Sesión'}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botones de Envío Rápido de Formularios Oficiales y Acciones */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-neutral-800">
                        {/* Botón Acción Rápida: Iniciar en Google Meet */}
                        {session.meetLink && (
                          <a
                            href={session.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                            title="Iniciar sala en Google Meet"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Iniciar Meet</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                          </a>
                        )}

                        {/* Botón Configurar y Editar Dinámica */}
                        <button
                          type="button"
                          onClick={() => handleOpenCreateModal('coachee_session', session)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer transition-colors"
                          title="Configurar y editar dinámica ontológica, ejes y automatizaciones de la sesión"
                        >
                          <Sliders className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Editar Dinámica</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyUrl(
                              OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl,
                              'Acuerdo de Sesión (Google Forms)'
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/60 dark:bg-neutral-800/60 text-[11px] font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 cursor-pointer"
                          title="Copiar formulario de acuerdo para enviar al coachee"
                        >
                          <Copy className="w-3 h-3 text-indigo-500" />
                          <span>Copiar Acuerdo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyUrl(
                              OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl,
                              'Bitácora de Sesión (Google Forms)'
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/60 dark:bg-neutral-800/60 text-[11px] font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 cursor-pointer"
                          title="Copiar formulario de bitácora para enviar al coachee"
                        >
                          <Copy className="w-3 h-3 text-emerald-500" />
                          <span>Copiar Bitácora B2B</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleSessionStatus(session.id)}
                          className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                            isCompleted
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 dark:border-neutral-700 hover:bg-gray-50 text-gray-600'
                          }`}
                          title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Eliminar sesión programada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800 space-y-3">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto" />
                <h4 className="text-sm font-bold text-black dark:text-white">
                  No hay sesiones programadas con estos filtros
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Programa la primera sesión 1 a 1 para tus coachees y asígnales los acuerdos y bitácoras de Google Forms & Sheets.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('coachee_session')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Programar Primera Sesión 1 a 1</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBPESTAÑA 3: BASE DE DATOS GOOGLE FORMS & SHEETS OFICIALES RBC           */}
        {/* ========================================================================= */}
        {catalogSubTab === 'forms_sheets_database' && (
          <div className="space-y-6">
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  Bases de Datos Oficiales de Google Forms & Sheets para Sesiones RBC
                </h3>
              </div>
              <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 font-light leading-relaxed">
                Estas son las dos fuentes de datos canónicas para el acompañamiento 1 a 1 de Rengifo Basto Consultoría: el Acuerdo Co-creativo (14 columnas oficiales de encuadre ontológico e ICF) y la Bitácora de Sesión B2B (12 columnas de registro de quiebre, emociones y compromisos).
              </p>
            </div>

            {/* Grilla de las 2 Bases de Datos Oficiales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* 1. Base Acuerdo Sesiones Individuales */}
              {(() => {
                const item = OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales;
                const isInspecting = inspectingDatabaseKey === 'sesiones_individuales';

                return (
                  <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 uppercase">
                          Base de Datos #1 • Encuadre & Legal
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {sesionAcuerdos.length} Respuestas
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-black dark:text-white">
                        {item.title}
                      </h3>

                      <p className="text-xs text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
                        {item.notes}
                      </p>

                      <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Hoja de Cálculo:</span>
                          <span className="font-bold text-black dark:text-white font-mono text-[10px]">
                            {item.officialDatabaseName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Estructura Canónica:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">
                            {item.sheetHeaders.length} Columnas Oficiales
                          </span>
                        </div>
                      </div>

                      {/* Columnas desplegables */}
                      {isInspecting && (
                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 space-y-2 animate-fade-in">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                            Mapeo de Columnas ({item.sheetHeaders.length} Campos Oficiales):
                          </span>
                          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 text-[11px] font-mono">
                            {item.sheetHeaders.map((header, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between py-0.5 border-b border-gray-200/50 dark:border-neutral-700/50 text-gray-700 dark:text-neutral-300"
                              >
                                <span className="text-gray-400 w-5">{idx + 1}.</span>
                                <span className="flex-1 truncate">{header}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-neutral-400">
                                  Texto/Campo
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botonera de Acciones para Acuerdo */}
                    <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectingDatabaseKey(isInspecting ? null : 'sesiones_individuales')}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {isInspecting ? 'Ocultar Columnas' : 'Inspeccionar 14 Columnas'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item.formUrl, 'Enlace de Google Forms (Acuerdo)')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-[11px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 cursor-pointer"
                        >
                          <Copy className="w-3 h-3 text-indigo-500" />
                          <span>Copiar Form</span>
                        </button>

                        <a
                          href={item.formUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-[11px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Forms</span>
                        </a>

                        <a
                          href={item.sheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-all"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Abrir Sheets</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Base Bitácora Sesiones B2B */}
              {(() => {
                const item = OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b;
                const isInspecting = inspectingDatabaseKey === 'bitacora_sesiones_b2b';

                return (
                  <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 uppercase">
                          Base de Datos #2 • Cuaderno & Quiebres
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {bitacorasB2B.length} Respuestas
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-black dark:text-white">
                        {item.title}
                      </h3>

                      <p className="text-xs text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
                        {item.notes}
                      </p>

                      <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Hoja de Cálculo:</span>
                          <span className="font-bold text-black dark:text-white font-mono text-[10px]">
                            {item.officialDatabaseName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Estructura Canónica:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                            {item.sheetHeaders.length} Columnas Oficiales
                          </span>
                        </div>
                      </div>

                      {/* Columnas desplegables */}
                      {isInspecting && (
                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 space-y-2 animate-fade-in">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                            Mapeo de Columnas ({item.sheetHeaders.length} Campos Oficiales):
                          </span>
                          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 text-[11px] font-mono">
                            {item.sheetHeaders.map((header, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between py-0.5 border-b border-gray-200/50 dark:border-neutral-700/50 text-gray-700 dark:text-neutral-300"
                              >
                                <span className="text-gray-400 w-5">{idx + 1}.</span>
                                <span className="flex-1 truncate">{header}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-neutral-400">
                                  Texto/Campo
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botonera de Acciones para Bitácora */}
                    <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectingDatabaseKey(isInspecting ? null : 'bitacora_sesiones_b2b')}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        {isInspecting ? 'Ocultar Columnas' : 'Inspeccionar 12 Columnas'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item.formUrl, 'Enlace de Google Forms (Bitácora)')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-[11px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 cursor-pointer"
                        >
                          <Copy className="w-3 h-3 text-emerald-500" />
                          <span>Copiar Form</span>
                        </button>

                        <a
                          href={item.formUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-[11px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Forms</span>
                        </a>

                        <a
                          href={item.sheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-all"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Abrir Sheets</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Registro Reciente de Respuestas en Sistema */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-sm font-bold text-black dark:text-white">
                    Respuestas Registradas en las Hojas de Cálculo Oficiales
                  </h4>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {sesionAcuerdos.length + bitacorasB2B.length} Registros totales
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Acuerdos Recientes */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Últimos Acuerdos Registrados ({sesionAcuerdos.length})
                  </span>
                  {sesionAcuerdos.length > 0 ? (
                    <div className="space-y-2">
                      {sesionAcuerdos.slice(0, 3).map((ac, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-gray-50/70 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-black dark:text-white">
                              {ac.fullName || 'Participante'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {ac.timestamp ? new Date(ac.timestamp).toLocaleDateString() : 'Reciente'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate">{ac.email}</p>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                            ✓ Aceptación ICF & Confidencialidad
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 text-center text-xs text-gray-400">
                      No hay respuestas de acuerdos aún en la base de datos.
                    </div>
                  )}
                </div>

                {/* Bitácoras Recientes */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Últimas Bitácoras B2B ({bitacorasB2B.length})
                  </span>
                  {bitacorasB2B.length > 0 ? (
                    <div className="space-y-2">
                      {bitacorasB2B.slice(0, 3).map((bit, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-gray-50/70 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-black dark:text-white">
                              {bit.fullName || 'Coachee'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {bit.timestamp ? new Date(bit.timestamp).toLocaleDateString() : 'Reciente'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 dark:text-neutral-300 line-clamp-1 italic">
                            "{bit.centralChallenge || bit.valuableLearning || 'Sin quiebre registrado'}"
                          </p>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block">
                            Emoción: {bit.primaryEmotion || 'Reflexiva'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 text-center text-xs text-gray-400">
                      No hay bitácoras de sesión aún en la base de datos.
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                  onClick={handleSaveModule}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Módulo</span>
                </button>
              </div>
            </div>

            {/* Pestañas de Navegación del Editor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                  <span className="text-xs font-bold">1. Ficha General & Metodología</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Título, objetivos, outcomes y práctica reflexiva
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
                  <span className="text-xs font-bold">2. Google Forms & Integraciones</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Google Forms, Sheets y Triggers
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
                    Objetivo Central de la Sesión / Módulo
                  </label>
                  <textarea
                    rows={3}
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    placeholder="¿Qué objetivo, metas y resultados clave persigue esta sesión o módulo?"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white leading-relaxed"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-black dark:text-white">
                      Pregunta Clave de Entrada
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Sincronizada vía Google Sheets
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-dashed border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-gray-700 dark:text-neutral-300 italic flex items-center justify-between gap-2">
                    <span>"{formData.keyQuestion || '¿Qué conversación o resultado decisivo estás listo para consolidar?'}"</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                      Google Sheets
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                    Consigna / Prompt de Trabajo para el Participante
                  </label>
                  <input
                    type="text"
                    value={formData.levelPrompt || ''}
                    onChange={(e) => setFormData({ ...formData, levelPrompt: e.target.value })}
                    placeholder="Registra los acuerdos, prioridades y compromisos de acción en este espacio..."
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

                {/* Práctica Vivencial */}
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <h5 className="text-xs font-bold">Práctica Vivencial entre Sesiones</h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                        Título de la Práctica
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
                        placeholder="Ej: Pausa Estratégica y Foco Diario"
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
                        placeholder="Ej: Diaria (2 veces al día)"
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
                      placeholder="Describe los pasos para que el participante ejecute la práctica en su cotidianidad..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* PESTAÑA 3: GOOGLE FORMS, SHEETS & INTEGRACIONES               */}
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
                      placeholder="https://docs.google.com/spreadsheets/d/1RBC_Bitacora_Sesiones_B2B_Sheets/edit"
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
                      onClick={() => setFormData({ ...formData, googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1RBC_Bitacora_Sesiones_B2B_Sheets/edit' })}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-800/40 transition-colors"
                    >
                      Bitácora Sesiones B2B
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1RBC_Acuerdo_Sesiones_Sheets/edit' })}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors"
                    >
                      Acuerdo Sesiones
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

                {/* Enlaces a Guía de Trabajo y Video del Módulo */}
                <div className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">
                        Recursos Didácticos: Guía de Trabajo y Video
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                      Material del Módulo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Guía */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-amber-200/70 dark:border-amber-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-amber-500" />
                          <span>Guía de Trabajo (Enlace)</span>
                        </span>
                        {formData.guideUrl && (
                          <a
                            href={formData.guideUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 dark:text-amber-300 font-bold hover:underline"
                          >
                            <span>Abrir</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://docs.google.com/... o Notion / PDF"
                        value={formData.guideUrl || ''}
                        onChange={(e) => setFormData({ ...formData, guideUrl: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono placeholder:font-sans"
                      />
                    </div>

                    {/* Video */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-rose-200/70 dark:border-rose-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1">
                          <Film className="w-3 h-3 text-rose-500" />
                          <span>Video / Masterclass (Enlace)</span>
                        </span>
                        {formData.videoUrl && (
                          <a
                            href={formData.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 text-[10px] text-rose-700 dark:text-rose-300 font-bold hover:underline"
                          >
                            <span>Reproducir</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://youtube.com/... o Loom / Vimeo"
                        value={formData.videoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono placeholder:font-sans"
                      />
                    </div>
                  </div>
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
                  if (editorTab === 'integrations') setEditorTab('general');
                  else setViewMode('catalog');
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
              >
                {editorTab === 'general' ? '← Volver al Catálogo' : '← Volver a Ficha General'}
              </button>

              <div className="flex items-center gap-2">
                {editorTab === 'general' ? (
                  <button
                    type="button"
                    onClick={() => setEditorTab('integrations')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    <span>Siguiente: Google Forms & Integraciones</span>
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

      {/* MODAL INTEGRADO DE CREACIÓN: PROGRAMAR SESIÓN 1 A 1 / CREAR MÓDULO CON GOOGLE FORMS & SHEETS */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Cabecera del Modal */}
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-neutral-800 flex items-start justify-between gap-4 bg-gray-50/50 dark:bg-neutral-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                  {createMode === 'coachee_session' ? (
                    <Calendar className="w-5 h-5" />
                  ) : (
                    <BookOpen className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-black dark:text-white">
                    {createMode === 'coachee_session'
                      ? 'Programar Sesión 1 a 1 de Consultoría'
                      : 'Crear Nuevo Módulo Curricular RBC'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {createMode === 'coachee_session'
                      ? 'Agenda la cita con Google Meet y escoge los formularios integrados en Forms & Sheets'
                      : 'Diseña un nuevo módulo del programa y vincula su base de datos'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Modo: Sesión 1 a 1 vs Módulo Curricular */}
            <div className="px-5 sm:px-6 pt-4 pb-2 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-2 bg-white dark:bg-[#18181B] shrink-0">
              <button
                type="button"
                onClick={() => setCreateMode('coachee_session')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  createMode === 'coachee_session'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-neutral-800/70 text-gray-600 dark:text-neutral-400 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Programar Sesión 1 a 1 (Coachee)</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateMode('module')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  createMode === 'module'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-neutral-800/70 text-gray-600 dark:text-neutral-400 hover:bg-gray-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Crear Módulo Curricular</span>
              </button>
            </div>

            {/* Contenido Desplazable del Formulario */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {createMode === 'coachee_session' ? (
                <form id="create-session-form" onSubmit={handleConfirmScheduleSession} className="space-y-6">
                  {/* Bloque 1: Datos Principales de la Sesión */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>1. Participante & Enlace Google Meet</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Coachee */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span>Coachee / Participante *</span>
                        </label>
                        <select
                          value={newSessionClientId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewSessionClientId(val);
                            const count = sessions.filter((s) => s.clientId === val).length;
                            setNewSessionTitle(`Sesión de Consultoría #${count + 1}`);
                          }}
                          className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/60 dark:bg-neutral-800/60 text-black dark:text-white font-medium cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          required
                        >
                          {clients.map((c) => (
                            <option key={c.uid} value={c.uid}>
                              {c.displayName || c.name || 'Coachee'} ({c.email || 'Sin correo'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Título de la Sesión */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                          Título de la Sesión *
                        </label>
                        <input
                          type="text"
                          value={newSessionTitle}
                          onChange={(e) => setNewSessionTitle(e.target.value)}
                          placeholder="Ej. Sesión 1: Diagnóstico y Acuerdos Estratégicos"
                          className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          required
                        />
                      </div>
                    </div>

                    {/* Fecha, Hora y Duración */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Fecha *</span>
                        </label>
                        <input
                          type="date"
                          value={newSessionDate}
                          onChange={(e) => setNewSessionDate(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Hora de Inicio *</span>
                        </label>
                        <input
                          type="time"
                          value={newSessionTime}
                          onChange={(e) => setNewSessionTime(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                          Duración Estimada
                        </label>
                        <select
                          value={newSessionDuration}
                          onChange={(e) => setNewSessionDuration(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        >
                          <option value="45">45 minutos</option>
                          <option value="60">60 minutos (Estándar)</option>
                          <option value="90">90 minutos (Profundización)</option>
                          <option value="120">120 minutos (Cierre de Ciclo)</option>
                        </select>
                      </div>
                    </div>

                    {/* Enlace de Google Meet */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Enlace de Google Meet *</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setNewSessionMeetLink(generateMeetLink())}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Generar Nuevo Enlace</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={newSessionMeetLink}
                          onChange={(e) => setNewSessionMeetLink(e.target.value)}
                          placeholder="https://meet.google.com/xyz-abcd-efg"
                          className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(newSessionMeetLink, 'Enlace de Google Meet')}
                          className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 text-gray-700 dark:text-neutral-300 shrink-0 cursor-pointer"
                          title="Copiar enlace Meet"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Objetivo o Agenda de la Sesión */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                        Objetivo o Agenda de la Sesión
                      </label>
                      <textarea
                        rows={2}
                        value={newSessionGoal}
                        onChange={(e) => setNewSessionGoal(e.target.value)}
                        placeholder="Ej. Revisar avances en metas estratégicas, compromisos asumidos y plan de acción..."
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Bloque 2: Integración Google Forms & Google Sheets (Selector Interactivo) */}
                  <div className="space-y-3.5 pt-4 border-t border-gray-100 dark:border-neutral-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 flex items-center gap-1.5">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
                          <span>2. Escoger Formularios Integrados en Forms & Google Sheets</span>
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                          Selecciona la base oficial de Google Forms & Sheets que acompañará esta sesión:
                        </p>
                      </div>
                    </div>

                    {/* Grid de Formularios Oficiales Integrados */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {OFFICIAL_FORMS_SHEETS_BASE_LIST.map((item) => {
                        const isSelected = newSessionDatabasePreset === item.id;

                        return (
                          <div
                            key={item.id}
                            onClick={() => setNewSessionDatabasePreset(item.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:border-gray-300 dark:hover:border-neutral-700'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                  {item.category}
                                </span>
                                {isSelected ? (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Seleccionado</span>
                                  </span>
                                ) : (
                                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-neutral-600 inline-block" />
                                )}
                              </div>

                              <h5 className="text-xs font-bold text-black dark:text-white">
                                {item.title}
                              </h5>
                              <p className="text-[11px] text-gray-500 dark:text-neutral-400 line-clamp-2">
                                {item.notes}
                              </p>
                            </div>

                            {/* Enlaces de prueba rápida */}
                            <div className="flex items-center gap-2 pt-2.5 mt-2 border-t border-gray-100 dark:border-neutral-800/60">
                              <a
                                href={item.formUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Ver Formulario</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                              <span className="text-gray-300 dark:text-neutral-700">•</span>
                              <a
                                href={item.sheetUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                <FileSpreadsheet className="w-3 h-3" />
                                <span>Ver Sheets</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}

                      {/* Tarjeta de Formulario Personalizado */}
                      <div
                        onClick={() => setNewSessionDatabasePreset('custom')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          newSessionDatabasePreset === 'custom'
                            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:border-gray-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300">
                              Personalizado
                            </span>
                            {newSessionDatabasePreset === 'custom' ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Seleccionado</span>
                              </span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-neutral-600 inline-block" />
                            )}
                          </div>
                          <h5 className="text-xs font-bold text-black dark:text-white">
                            Formulario & Sheets Propios
                          </h5>
                          <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                            Pega tus propios enlaces directos de Google Forms y Google Sheets si usas otra base externa.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Inputs de URLs personalizadas si se seleccionó 'custom' */}
                    {newSessionDatabasePreset === 'custom' && (
                      <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 space-y-3 animate-fade-in">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-indigo-500" />
                            <span>URL de Google Forms Personalizado</span>
                          </label>
                          <input
                            type="url"
                            value={newSessionCustomFormUrl}
                            onChange={(e) => setNewSessionCustomFormUrl(e.target.value)}
                            placeholder="https://forms.gle/..."
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1">
                            <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
                            <span>URL de Google Sheets Personalizado</span>
                          </label>
                          <input
                            type="url"
                            value={newSessionCustomSheetUrl}
                            onChange={(e) => setNewSessionCustomSheetUrl(e.target.value)}
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    )}

                    {/* Casillas de Verificación de Integración */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 space-y-2">
                      <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newSessionAttachAgreement}
                          onChange={(e) => setNewSessionAttachAgreement(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>
                          <strong>Vincular Formulario de Acuerdo Previo</strong> ({OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.title}) para firma del coachee
                        </span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newSessionAttachBitacora}
                          onChange={(e) => setNewSessionAttachBitacora(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>
                          <strong>Vincular Formulario de Bitácora Post-Sesión</strong> ({OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.title}) para reflexiones y plan de acción
                        </span>
                      </label>
                    </div>

                    {/* Espacio para Subir Enlace de Guía y Video */}
                    <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-3.5">
                      <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/40 pb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <h5 className="text-xs font-bold text-black dark:text-white">
                            Material de Acompañamiento: Guía y Video (Opcional)
                          </h5>
                        </div>
                        <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
                          Recursos para el Coachee
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Guía de Trabajo */}
                        <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-neutral-800/90 border border-amber-200/70 dark:border-amber-800/50 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                              <span>Guía de Trabajo / Documento</span>
                            </span>
                            {newSessionGuideUrl && (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3" />
                                <span>Lista</span>
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={newSessionGuideTitle}
                            onChange={(e) => setNewSessionGuideTitle(e.target.value)}
                            placeholder="Título de la Guía (ej. Ejercicios Ontológicos)"
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                          />
                          <input
                            type="url"
                            value={newSessionGuideUrl}
                            onChange={(e) => setNewSessionGuideUrl(e.target.value)}
                            placeholder="https://docs.google.com/... o Drive / Notion"
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                          />
                        </div>

                        {/* Video de la Sesión */}
                        <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-neutral-800/90 border border-rose-200/70 dark:border-rose-800/50 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
                              <Film className="w-3.5 h-3.5 text-rose-500" />
                              <span>Video de la Sesión / Cápsula</span>
                            </span>
                            {newSessionVideoUrl && (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3" />
                                <span>Listo</span>
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={newSessionVideoTitle}
                            onChange={(e) => setNewSessionVideoTitle(e.target.value)}
                            placeholder="Título del Video (ej. Distinciones Clave)"
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                          />
                          <input
                            type="url"
                            value={newSessionVideoUrl}
                            onChange={(e) => setNewSessionVideoUrl(e.target.value)}
                            placeholder="https://youtube.com/... o Loom / Vimeo"
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                /* Formulario: Crear Módulo Curricular RBC */
                <form id="create-module-form" onSubmit={handleConfirmCreateModule} className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>1. Configuración del Módulo</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                          Título del Módulo *
                        </label>
                        <input
                          type="text"
                          value={newModuleTitle}
                          onChange={(e) => setNewModuleTitle(e.target.value)}
                          placeholder="Ej. Módulo 13: Liderazgo Estratégico y Conversaciones Decisivas"
                          className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                          Nivel Curricular *
                        </label>
                        <select
                          value={newModuleLevel}
                          onChange={(e) => setNewModuleLevel(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        >
                          <option value="Nivel I">Nivel I (Fundamentos)</option>
                          <option value="Nivel II">Nivel II (Relaciones & Compromisos)</option>
                          <option value="Nivel III">Nivel III (Dirección & Liderazgo)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                        Objetivo Central del Módulo *
                      </label>
                      <textarea
                        rows={2}
                        value={newModuleObjective}
                        onChange={(e) => setNewModuleObjective(e.target.value)}
                        placeholder="Define el propósito, metas y resultados estratégicos que abordará este módulo..."
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                        Pregunta Detonadora Maestra
                      </label>
                      <input
                        type="text"
                        value={newModuleKeyQuestion}
                        onChange={(e) => setNewModuleKeyQuestion(e.target.value)}
                        placeholder="¿Qué conversación decisiva has venido postergando?"
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Selector de Base de Datos Google Forms & Sheets para el Módulo */}
                  <div className="space-y-3.5 pt-4 border-t border-gray-100 dark:border-neutral-800">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
                        <span>2. Vincular Base de Datos Google Forms & Sheets al Módulo</span>
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                        Escoge el formulario integrado que recopilará las respuestas de los participantes en este módulo:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {OFFICIAL_FORMS_SHEETS_BASE_LIST.map((item) => {
                        const isSelected = newModuleDatabasePreset === item.id;

                        return (
                          <div
                            key={item.id}
                            onClick={() => setNewModuleDatabasePreset(item.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-xs'
                                : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:border-gray-300 dark:hover:border-neutral-700'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                  {item.category}
                                </span>
                                {isSelected ? (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Seleccionado</span>
                                  </span>
                                ) : (
                                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-neutral-600 inline-block" />
                                )}
                              </div>

                              <h5 className="text-xs font-bold text-black dark:text-white">
                                {item.title}
                              </h5>
                              <p className="text-[11px] text-gray-500 dark:text-neutral-400 line-clamp-2">
                                {item.notes}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 pt-2.5 mt-2 border-t border-gray-100 dark:border-neutral-800/60">
                              <a
                                href={item.formUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Ver Formulario</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                              <span className="text-gray-300 dark:text-neutral-700">•</span>
                              <a
                                href={item.sheetUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                <FileSpreadsheet className="w-3 h-3" />
                                <span>Ver Sheets</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}

                      {/* Opción personalizada */}
                      <div
                        onClick={() => setNewModuleDatabasePreset('custom')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          newModuleDatabasePreset === 'custom'
                            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:border-gray-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300">
                              Personalizado
                            </span>
                            {newModuleDatabasePreset === 'custom' ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Seleccionado</span>
                              </span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-neutral-600 inline-block" />
                            )}
                          </div>
                          <h5 className="text-xs font-bold text-black dark:text-white">
                            Formulario & Sheets Propios
                          </h5>
                          <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                            Ingresa tus propias URLs directas de Google Forms y Google Sheets para este módulo.
                          </p>
                        </div>
                      </div>
                    </div>

                    {newModuleDatabasePreset === 'custom' && (
                      <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 space-y-3 animate-fade-in">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                            URL de Google Forms Personalizado
                          </label>
                          <input
                            type="url"
                            value={newModuleCustomFormUrl}
                            onChange={(e) => setNewModuleCustomFormUrl(e.target.value)}
                            placeholder="https://forms.gle/..."
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                            URL de Google Sheets Personalizado
                          </label>
                          <input
                            type="url"
                            value={newModuleCustomSheetUrl}
                            onChange={(e) => setNewModuleCustomSheetUrl(e.target.value)}
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    )}

                    {/* Espacio para Subir Enlace de Guía y Video del Módulo */}
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 space-y-3.5">
                      <div className="flex items-center justify-between border-b border-indigo-200/60 dark:border-indigo-800/40 pb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <h5 className="text-xs font-bold text-black dark:text-white">
                            Material Didáctico del Módulo: Guía y Video (Opcional)
                          </h5>
                        </div>
                        <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold">
                          Recursos Formativos
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Guía del Módulo */}
                        <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-neutral-800/90 border border-indigo-200/70 dark:border-indigo-800/50 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Enlace a Guía / Cuaderno</span>
                            </span>
                            {newModuleGuideUrl && (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3" />
                                <span>Lista</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-neutral-400">
                            Enlace a Google Drive, Notion o documento de trabajo del módulo.
                          </p>
                          <input
                            type="url"
                            value={newModuleGuideUrl}
                            onChange={(e) => setNewModuleGuideUrl(e.target.value)}
                            placeholder="https://docs.google.com/... o Drive / Notion"
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        {/* Video del Módulo */}
                        <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-neutral-800/90 border border-rose-200/70 dark:border-rose-800/50 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
                              <Film className="w-3.5 h-3.5 text-rose-500" />
                              <span>Enlace al Video / Masterclass</span>
                            </span>
                            {newModuleVideoUrl && (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3" />
                                <span>Listo</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-neutral-400">
                            Enlace a YouTube, Loom, Vimeo o grabación explicativa.
                          </p>
                          <input
                            type="url"
                            value={newModuleVideoUrl}
                            onChange={(e) => setNewModuleVideoUrl(e.target.value)}
                            placeholder="https://youtube.com/... o Loom / Vimeo"
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Pie de Acciones del Modal */}
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-3 bg-gray-50/60 dark:bg-neutral-900/60 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer transition-all"
              >
                Cancelar
              </button>

              <button
                type="submit"
                form={createMode === 'coachee_session' ? 'create-session-form' : 'create-module-form'}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer transition-all ${
                  createMode === 'coachee_session'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {createMode === 'coachee_session'
                    ? 'Programar Sesión con Forms & Sheets'
                    : 'Crear Módulo con Forms & Sheets'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ESPECIALIZADO: MÓDULO DE CREACIÓN DE SESIONES DE CONSULTORÍA 1 A 1 */}
      <ConsultoriaSessionCreationModal
        isOpen={isConsultoriaModalOpen}
        onClose={() => {
          setIsConsultoriaModalOpen(false);
          setSelectedConsultoriaSession(null);
        }}
        initialSession={selectedConsultoriaSession}
        onSessionCreated={(newOrUpdatedSession) => {
          setSessions(OntologicalStore.getSessions());
          if (onRefreshParent) onRefreshParent();
        }}
        onOpenAutomationsPanel={() => {
          setIsConsultoriaModalOpen(false);
          alert(
            'Panel de Activadores y Automatizaciones RBC: Sincronización activa con Google Sheets y webhooks de recordatorio programado.'
          );
        }}
      />
    </div>
  );
};

export default AdminSessionsManager;
