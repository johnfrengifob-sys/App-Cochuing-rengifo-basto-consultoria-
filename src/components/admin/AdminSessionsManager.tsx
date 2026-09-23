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
  Filter,
  LayoutGrid,
} from 'lucide-react';
import {
  ProgramNodeInfo,
  DynamicQuestionnaire,
  QuestionnaireQuestion,
  QuestionType,
  Session,
  User,
  FormsSheetsIntegrationSourceKey,
  CronogramaEvent,
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
import { EventEvaluationAndTriggersSection } from './events/EventEvaluationAndTriggersSection';
import AdminAutomationsManager from './AdminAutomationsManager';

interface AdminSessionsManagerProps {
  onSelectClientForFicha?: (clientId: string) => void;
  onRefreshParent?: () => void;
  onGoToAutomations?: () => void;
}

export const AdminSessionsManager: React.FC<AdminSessionsManagerProps> = ({
  onRefreshParent,
  onGoToAutomations,
}) => {
  // 1. Estados principales de Módulos y Cuestionarios
  const [nodes, setNodes] = useState<ProgramNodeInfo[]>(() =>
    OntologicalStore.getProgramNodes()
  );
  const [questionnaires, setQuestionnaires] = useState<DynamicQuestionnaire[]>(() =>
    OntologicalStore.getQuestionnaires()
  );

  // Sesiones 1 a 1 de coachees, clientes registrados y base de datos oficial
  const [sessions, setSessions] = useState<Session[]>(() => OntologicalStore.getSessions());
  const [clients, setClients] = useState<User[]>(() => OntologicalStore.getClients());
  const [sesionAcuerdos, setSesionAcuerdos] = useState(() => OntologicalStore.getSesionIndividualAcuerdos());
  const [bitacorasB2B, setBitacorasB2B] = useState(() => OntologicalStore.getBitacorasSesionesB2B());
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Generador de Sesiones Modal State
  const [isConsultoriaModalOpen, setIsConsultoriaModalOpen] = useState(false);
  const [selectedConsultoriaSession, setSelectedConsultoriaSession] = useState<Session | null>(null);

  // Modal de Automatizaciones Make.com
  const [isAutomationsModalOpen, setIsAutomationsModalOpen] = useState(false);

  // Estado del Editor de Niveles
  const [isLevelEditorOpen, setIsLevelEditorOpen] = useState(false);
  const [activeLevelTab, setActiveLevelTab] = useState<'Nivel I' | 'Nivel II' | 'Nivel III'>('Nivel I');
  const [liveLevelConfigs, setLiveLevelConfigs] = useState(() => OntologicalStore.getLevelConfigs());
  const [editingLevels, setEditingLevels] = useState<{
    'Nivel I': { title: string; prompt: string; focus: string };
    'Nivel II': { title: string; prompt: string; focus: string };
    'Nivel III': { title: string; prompt: string; focus: string };
  }>(() => {
    const cfgs = OntologicalStore.getLevelConfigs();
    return {
      'Nivel I': {
        title: cfgs['Nivel I']?.title || 'Nivel I: Fundamentos & Transparencia',
        prompt: cfgs['Nivel I']?.prompt || '',
        focus: cfgs['Nivel I']?.focus || '',
      },
      'Nivel II': {
        title: cfgs['Nivel II']?.title || 'Nivel II: Corporalidad, Relaciones & Emocionalidad',
        prompt: cfgs['Nivel II']?.prompt || '',
        focus: cfgs['Nivel II']?.focus || '',
      },
      'Nivel III': {
        title: cfgs['Nivel III']?.title || 'Nivel III: Dirección & Trascendencia',
        prompt: cfgs['Nivel III']?.prompt || '',
        focus: cfgs['Nivel III']?.focus || '',
      },
    };
  });

  // Filtros de búsqueda en sesiones programadas
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionStatusFilter, setSessionStatusFilter] = useState<'all' | 'scheduled' | 'completed'>('all');

  // Sub-pestaña de visualización en el panel
  // 'modules': Malla Curricular y Módulos de Sesión (12 Semanas)
  // 'scheduled': Agenda de Sesiones 1 a 1 de Coachees
  const [catalogSubTab, setCatalogSubTab] = useState<'modules' | 'scheduled'>('modules');

  // Organización de sesiones por nivel o por semanas:
  // 'none' (cuadrícula corrida) | 'by_level' (agrupado por nivel) | 'by_week' (agrupado por semanas)
  const [groupBy, setGroupBy] = useState<'none' | 'by_level' | 'by_week'>('none');

  // Inspección de estructura de columnas de Google Sheets
  const [inspectingDatabaseKey, setInspectingDatabaseKey] = useState<FormsSheetsIntegrationSourceKey | null>(null);

  // Filtros de búsqueda en catálogo de módulos y agenda
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'Nivel I' | 'Nivel II' | 'Nivel III'>('all');
  const [weekFilter, setWeekFilter] = useState<string>('all');

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
  // Safe modal state for deleting 1-on-1 scheduled sessions
  const [deleteScheduledSessionTarget, setDeleteScheduledSessionTarget] = useState<{
    id: string;
    title: string;
    clientName: string;
  } | null>(null);

  const confirmDeleteModule = () => {
    if (!deleteModuleTarget) return;
    const { step } = deleteModuleTarget;
    const ok = OntologicalStore.deleteProgramNode(step);
    if (ok) {
      const freshNodes = OntologicalStore.getProgramNodes();
      setNodes(freshNodes);
      showNotification(`Módulo ${step} eliminado con éxito de la base de datos.`);
      if (viewMode === 'editor') {
        setViewMode('catalog');
        setFormData(null);
      }
      onRefreshParent?.();
    } else {
      showNotification('No se puede eliminar el módulo (debe existir al menos un módulo activo).');
    }
    setDeleteModuleTarget(null);
  };

  const confirmDeleteScheduledSession = () => {
    if (!deleteScheduledSessionTarget) return;
    const { id, title } = deleteScheduledSessionTarget;
    OntologicalStore.deleteSession(id);
    FirestoreSyncService.deleteSession(id).catch(() => {});
    setSessions(OntologicalStore.getSessions());
    showNotification(`Sesión "${title}" eliminada de la base de datos y Firestore.`);
    setDeleteScheduledSessionTarget(null);
    if (onRefreshParent) onRefreshParent();
  };

  // Sincronización con eventos de la aplicación
  useEffect(() => {
    const handleSync = () => {
      const freshNodes = OntologicalStore.getProgramNodes();
      setNodes(freshNodes);
      setLiveLevelConfigs(OntologicalStore.getLevelConfigs());
      setQuestionnaires(OntologicalStore.getQuestionnaires());
      setSessions(OntologicalStore.getSessions());
      setClients(OntologicalStore.getClients());
      setSesionAcuerdos(OntologicalStore.getSesionIndividualAcuerdos());
      setBitacorasB2B(OntologicalStore.getBitacorasSesionesB2B());
    };

    window.addEventListener('rbc-levels-updated', handleSync);
    window.addEventListener('rbc-program-nodes-updated', handleSync);
    window.addEventListener('rbc-questionnaires-updated', handleSync);
    window.addEventListener('rbc-sessions-updated', handleSync);
    window.addEventListener('rbc-forms-sheets-updated', handleSync);
    window.addEventListener('rbc-forms-sheets-data-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('rbc-levels-updated', handleSync);
      window.removeEventListener('rbc-program-nodes-updated', handleSync);
      window.removeEventListener('rbc-questionnaires-updated', handleSync);
      window.removeEventListener('rbc-sessions-updated', handleSync);
      window.removeEventListener('rbc-forms-sheets-updated', handleSync);
      window.removeEventListener('rbc-forms-sheets-data-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

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

  // Helper para determinar nivel de una sesión (con fallback según número de sesión)
  const getSessionLevel = (s: Session): 'Nivel I' | 'Nivel II' | 'Nivel III' => {
    if (s.level === 'Nivel I' || s.level === 'Nivel II' || s.level === 'Nivel III') {
      return s.level;
    }
    const num = s.sessionNumber || 1;
    if (num <= 4) return 'Nivel I';
    if (num <= 8) return 'Nivel II';
    return 'Nivel III';
  };

  // Helper para determinar bloque de semanas de una sesión
  const getSessionWeek = (s: Session): string => {
    if (s.weekLabel) return s.weekLabel;
    const num = s.sessionNumber || 1;
    if (num <= 2) return 'Semanas 1-2';
    if (num <= 4) return 'Semanas 3-4';
    if (num <= 6) return 'Semanas 5-6';
    if (num <= 8) return 'Semanas 7-8';
    if (num <= 10) return 'Semanas 9-10';
    return 'Semanas 11-12';
  };

  // Helper para normalizar la semana de un módulo
  const getNodeWeekKey = (n: ProgramNodeInfo): string => {
    if (n.weekLabel && n.weekLabel.includes('1-2')) return 'Semanas 1-2';
    if (n.weekLabel && n.weekLabel.includes('3-4')) return 'Semanas 3-4';
    if (n.weekLabel && n.weekLabel.includes('5-6')) return 'Semanas 5-6';
    if (n.weekLabel && n.weekLabel.includes('7-8')) return 'Semanas 7-8';
    if (n.weekLabel && n.weekLabel.includes('9-10')) return 'Semanas 9-10';
    if (n.weekLabel && n.weekLabel.includes('11-12')) return 'Semanas 11-12';
    if (n.step === 1) return 'Semanas 1-2';
    if (n.step === 2) return 'Semanas 3-4';
    if (n.step === 3) return 'Semanas 5-6';
    if (n.step === 4) return 'Semanas 7-8';
    if (n.step === 5) return 'Semanas 9-10';
    if (n.step === 6) return 'Semanas 11-12';
    return n.weekLabel || 'Semanas 1-2';
  };

  // Filtrado de sesiones y módulos creados
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        n.sessionTitle.toLowerCase().includes(q) ||
        n.objective.toLowerCase().includes(q) ||
        n.keyQuestion.toLowerCase().includes(q) ||
        (n.levelTitle && n.levelTitle.toLowerCase().includes(q)) ||
        (n.levelPrompt && n.levelPrompt.toLowerCase().includes(q)) ||
        `sesión ${n.step}`.includes(q) ||
        `módulo ${n.step}`.includes(q) ||
        (n.weekLabel && n.weekLabel.toLowerCase().includes(q));

      const matchLevel = levelFilter === 'all' || n.level === levelFilter;

      const nodeWeek = getNodeWeekKey(n);
      const matchWeek =
        weekFilter === 'all' ||
        nodeWeek === weekFilter ||
        (n.weekLabel && n.weekLabel.toLowerCase().includes(weekFilter.toLowerCase()));

      return matchSearch && matchLevel && matchWeek;
    });
  }, [nodes, searchQuery, levelFilter, weekFilter]);

  // Filtrado de sesiones de coachees
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const client = clients.find((c) => c.uid === s.clientId);
      const activeSearch = (searchQuery || sessionSearch).trim().toLowerCase();
      const matchSearch =
        activeSearch === '' ||
        (s.title && s.title.toLowerCase().includes(activeSearch)) ||
        (s.sessionGoal && s.sessionGoal.toLowerCase().includes(activeSearch)) ||
        (client && (
          (client.displayName || client.name || '').toLowerCase().includes(activeSearch) ||
          client.email.toLowerCase().includes(activeSearch)
        )) ||
        `sesión ${s.sessionNumber}`.includes(activeSearch) ||
        (s.weekLabel && s.weekLabel.toLowerCase().includes(activeSearch));

      const matchStatus =
        sessionStatusFilter === 'all' || s.status === sessionStatusFilter;

      const sLevel = getSessionLevel(s);
      const matchLevel = levelFilter === 'all' || sLevel === levelFilter;

      const sWeek = getSessionWeek(s);
      const matchWeek =
        weekFilter === 'all' ||
        sWeek === weekFilter ||
        (s.weekLabel && s.weekLabel.toLowerCase().includes(weekFilter.toLowerCase()));

      return matchSearch && matchStatus && matchLevel && matchWeek;
    });
  }, [sessions, clients, searchQuery, sessionSearch, sessionStatusFilter, levelFilter, weekFilter]);

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

  // Abrir y configurar el Editor de Niveles
  const handleOpenLevelEditor = () => {
    const cfgs = OntologicalStore.getLevelConfigs();
    setLiveLevelConfigs(cfgs);
    setEditingLevels({
      'Nivel I': {
        title: cfgs['Nivel I']?.title || 'Nivel I: Fundamentos & Transparencia',
        prompt: cfgs['Nivel I']?.prompt || '',
        focus: cfgs['Nivel I']?.focus || '',
      },
      'Nivel II': {
        title: cfgs['Nivel II']?.title || 'Nivel II: Corporalidad, Relaciones & Emocionalidad',
        prompt: cfgs['Nivel II']?.prompt || '',
        focus: cfgs['Nivel II']?.focus || '',
      },
      'Nivel III': {
        title: cfgs['Nivel III']?.title || 'Nivel III: Dirección & Trascendencia',
        prompt: cfgs['Nivel III']?.prompt || '',
        focus: cfgs['Nivel III']?.focus || '',
      },
    });

    setIsLevelEditorOpen(true);
  };

  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [isPurgingOld, setIsPurgingOld] = useState(false);

  // Sincronizar base de datos de sesiones con Firebase Firestore
  const handleSyncFirebaseSessions = async () => {
    setIsSyncingFirebase(true);
    try {
      const res = await OntologicalStore.syncSessionsWithFirestore();
      setSessions(OntologicalStore.getSessions());
      showNotification(`Base de datos de sesiones sincronizada con Firebase (${res.count} sesiones activas).`);
    } catch (e) {
      console.error('Error syncing sessions with Firebase:', e);
      showNotification('Error al sincronizar con Firebase.');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  // Depurar y eliminar registros de sesiones antiguos o huérfanos
  const handlePurgeOldSessions = async () => {
    setIsPurgingOld(true);
    try {
      const res = await OntologicalStore.purgeOldOrOrphanedSessions();
      setSessions(OntologicalStore.getSessions());
      if (res.deletedCount > 0) {
        showNotification(`Se eliminaron ${res.deletedCount} registros antiguos. ${res.remainingCount} sesiones activas conservadas.`);
      } else {
        showNotification(`La base de datos de sesiones está al día (${res.remainingCount} sesiones activas).`);
      }
    } catch (e) {
      console.error('Error purging old sessions:', e);
      showNotification('Error al depurar registros antiguos.');
    } finally {
      setIsPurgingOld(false);
    }
  };

  // Guardar cambios del Editor de Niveles en todas las sesiones y sincronizar
  const handleSaveLevels = () => {
    OntologicalStore.saveLevelConfigs(editingLevels as any);
    const updatedCfgs = OntologicalStore.getLevelConfigs();
    setLiveLevelConfigs(updatedCfgs);
    const updatedNodes = OntologicalStore.getProgramNodes();
    const updatedSessions = OntologicalStore.getSessions();
    setNodes(updatedNodes);
    setSessions(updatedSessions);

    if (formData) {
      const activeLvl = (formData.level as 'Nivel I' | 'Nivel II' | 'Nivel III') || 'Nivel I';
      const meta = updatedCfgs[activeLvl];
      if (meta) {
        setFormData((prev) => prev ? ({
          ...prev,
          levelTitle: meta.title || prev.levelTitle,
          levelPrompt: meta.prompt || prev.levelPrompt,
        }) : null);
      }
    }

    if (onRefreshParent) onRefreshParent();
    setIsLevelEditorOpen(false);
    showNotification('Nombres de niveles actualizados en toda la interfaz y anclados a las sesiones.');
  };

  // Guardar cambios del módulo en edición
  const handleSaveModule = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData) return;

    OntologicalStore.updateProgramNode(activeStep, formData);
    setActiveStep(formData.step);
    const freshNodes = OntologicalStore.getProgramNodes();
    setNodes(freshNodes);
    setFormData({ ...formData });
    showNotification(`Módulo ${formData.step}: "${formData.sessionTitle}" guardado correctamente.`);
    onRefreshParent?.();
  };

  // Crear un nuevo módulo curricular desde el administrador
  const handleAddNewModule = () => {
    const currentNodes = OntologicalStore.getProgramNodes();
    const nextStep = currentNodes.length + 1;
    const added = OntologicalStore.addProgramNode({
      sessionTitle: `Módulo ${nextStep}: Nueva Sesión Formativa`,
      objective: 'Definir el objetivo ontológico de transformación para este módulo.',
      level: nextStep <= 4 ? 'Nivel I' : nextStep <= 8 ? 'Nivel II' : 'Nivel III',
      weekLabel: nextStep <= 2 ? 'Semanas 1-2' : nextStep <= 4 ? 'Semanas 3-4' : nextStep <= 6 ? 'Semanas 5-6' : nextStep <= 8 ? 'Semanas 7-8' : nextStep <= 10 ? 'Semanas 9-10' : 'Semanas 11-12',
    });
    const freshNodes = OntologicalStore.getProgramNodes();
    setNodes(freshNodes);
    if (added) {
      showNotification(`Módulo ${added.step} creado exitosamente.`);
      handleOpenEditor(added.step, 'general');
    }
  };

  // Adaptador de eventos para EventEvaluationAndTriggersSection en el Módulo de Sesión
  const nodeEventData: Partial<CronogramaEvent> = useMemo(() => {
    if (!formData) return {};
    return {
      id: `modulo-sesion-${formData.step}`,
      title: formData.sessionTitle || `Módulo ${formData.step}`,
      googleFormsUrl: formData.googleFormsUrl,
      googleSheetsUrl: formData.googleSheetsUrl,
      formsIntegrationId:
        (formData as any).formsIntegrationId ||
        (formData.googleFormsUrl?.includes('APUFto8sGbJt322WA')
          ? 'bitacora_sesiones_b2b'
          : 'sesiones_individuales'),
      agreementFormUrl: (formData as any).agreementFormUrl,
      agreementSheetUrl: (formData as any).agreementSheetUrl,
      bitacoraFormUrl: (formData as any).bitacoraFormUrl || formData.googleFormsUrl,
      bitacoraSheetUrl: (formData as any).bitacoraSheetUrl || formData.googleSheetsUrl,
      guideUrl: formData.guideUrl,
      guideTitle: formData.guideTitle,
      videoUrl: formData.videoUrl,
      videoTitle: formData.videoTitle,
      triggersEnabled: formData.triggersEnabled ?? true,
      immediateConfirmation: (formData as any).immediateConfirmation ?? true,
      scheduledReminders: (formData as any).scheduledReminders ?? true,
      customTriggers: {
        welcomeImmediate: (formData as any).immediateConfirmation ?? true,
        welcomeMessage:
          (formData as any).welcomeMessage ||
          `¡Hola! Tu módulo de sesión "${formData.sessionTitle || ''}" ha sido habilitado con éxito.`,
        reminder24h: (formData as any).scheduledReminders ?? true,
        reminderMessage:
          (formData as any).reminderMessage ||
          `Recordatorio: Tu módulo de sesión "${formData.sessionTitle || ''}" requiere revisión de compromisos y cuaderno de trabajo.`,
        postSurveyDispatched: (formData as any).postSurveyDispatched ?? true,
        postSurveyMessage:
          (formData as any).postSurveyMessage ||
          `Por favor diligencia la Bitácora del módulo "${formData.sessionTitle || ''}".`,
        customWebhookUrl: (formData as any).customWebhookUrl || '',
      },
    };
  }, [formData]);

  const handleNodeEventChange = (updates: Partial<CronogramaEvent>) => {
    if (!formData) return;
    setFormData((prev) => {
      if (!prev) return prev;
      const updated: any = { ...prev };
      if (updates.googleFormsUrl !== undefined) updated.googleFormsUrl = updates.googleFormsUrl;
      if (updates.googleSheetsUrl !== undefined) updated.googleSheetsUrl = updates.googleSheetsUrl;
      if (updates.formsIntegrationId !== undefined) updated.formsIntegrationId = updates.formsIntegrationId;
      if (updates.agreementFormUrl !== undefined) updated.agreementFormUrl = updates.agreementFormUrl;
      if (updates.agreementSheetUrl !== undefined) updated.agreementSheetUrl = updates.agreementSheetUrl;
      if (updates.bitacoraFormUrl !== undefined) updated.bitacoraFormUrl = updates.bitacoraFormUrl;
      if (updates.bitacoraSheetUrl !== undefined) updated.bitacoraSheetUrl = updates.bitacoraSheetUrl;
      if (updates.guideUrl !== undefined) updated.guideUrl = updates.guideUrl;
      if (updates.guideTitle !== undefined) updated.guideTitle = updates.guideTitle;
      if (updates.videoUrl !== undefined) updated.videoUrl = updates.videoUrl;
      if (updates.videoTitle !== undefined) updated.videoTitle = updates.videoTitle;
      if (updates.triggersEnabled !== undefined) updated.triggersEnabled = updates.triggersEnabled;
      if (updates.immediateConfirmation !== undefined) updated.immediateConfirmation = updates.immediateConfirmation;
      if (updates.scheduledReminders !== undefined) updated.scheduledReminders = updates.scheduledReminders;
      if (updates.customTriggers !== undefined) {
        const ct = updates.customTriggers;
        if (ct.welcomeImmediate !== undefined) updated.immediateConfirmation = ct.welcomeImmediate;
        if (ct.reminder24h !== undefined) updated.scheduledReminders = ct.reminder24h;
        if (ct.postSurveyDispatched !== undefined) updated.postSurveyDispatched = ct.postSurveyDispatched;
        if (ct.welcomeMessage !== undefined) updated.welcomeMessage = ct.welcomeMessage;
        if (ct.reminderMessage !== undefined) updated.reminderMessage = ct.reminderMessage;
        if (ct.postSurveyMessage !== undefined) updated.postSurveyMessage = ct.postSurveyMessage;
        if (ct.customWebhookUrl !== undefined) updated.customWebhookUrl = ct.customWebhookUrl;
      }
      return updated as ProgramNodeInfo;
    });
  };

  // Duplicar módulo / tablero desde el catálogo
  const handleDuplicate = (step: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup = OntologicalStore.duplicateProgramNode(step);
    if (dup) {
      refreshAll();
      showNotification(`Tablero duplicado con éxito como Módulo ${dup.step} ("${dup.sessionTitle}").`);
    }
  };

  // Duplicar tablero directamente desde el panel editor
  const handleDuplicateFromEditor = () => {
    if (!formData) return;
    // Guardar cambios actuales en el nodo antes de duplicar
    OntologicalStore.updateProgramNode(formData.step, formData);
    const dup = OntologicalStore.duplicateProgramNode(formData.step);
    if (dup) {
      refreshAll();
      setFormData(JSON.parse(JSON.stringify(dup)));
      setActiveStep(dup.step);
      showNotification(
        `Tablero duplicado con éxito como Módulo ${dup.step} ("${dup.sessionTitle}"). Ahora estás editando la copia.`
      );
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

  // Configuraciones temáticas para agrupación por nivel (dinámicas y reactivas)
  const LEVEL_CONFIGS = useMemo(() => [
    {
      id: 'Nivel I' as const,
      title: liveLevelConfigs['Nivel I']?.title || 'Nivel I: Fundamentos & Transparencia',
      weeks: 'Semanas 1 a 4',
      badgeColor: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      dotColor: 'bg-sky-500',
      borderAccent: 'border-sky-200/80 dark:border-sky-800/60',
      description: liveLevelConfigs['Nivel I']?.description || liveLevelConfigs['Nivel I']?.focus || 'Mapeo de la transparencia cotidiana, suspensión de automatismos, quiebres ocultos y anclaje somático inicial.',
    },
    {
      id: 'Nivel II' as const,
      title: liveLevelConfigs['Nivel II']?.title || 'Nivel II: Corporalidad, Relaciones & Emocionalidad',
      weeks: 'Semanas 5 a 8',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dotColor: 'bg-emerald-500',
      borderAccent: 'border-emerald-200/80 dark:border-emerald-800/60',
      description: liveLevelConfigs['Nivel II']?.description || liveLevelConfigs['Nivel II']?.focus || 'Sabiduría somático-emocional, disolución de resignaciones y resentimientos, y diseño de conversaciones de coordinación de acciones.',
    },
    {
      id: 'Nivel III' as const,
      title: liveLevelConfigs['Nivel III']?.title || 'Nivel III: Dirección & Trascendencia',
      weeks: 'Semanas 9 a 12',
      badgeColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      dotColor: 'bg-purple-500',
      borderAccent: 'border-purple-200/80 dark:border-purple-800/60',
      description: liveLevelConfigs['Nivel III']?.description || liveLevelConfigs['Nivel III']?.focus || 'Liderazgo ontológico, visión directiva compartida, maestría en la acción directiva y trascendencia transformacional.',
    },
  ], [liveLevelConfigs]);

  // Configuraciones temáticas para agrupación cronológica por semanas (solo semanas, sin nombres)
  const WEEK_CONFIGS = [
    {
      key: 'Semanas 1-2',
      title: 'Semanas 1-2',
      level: 'Nivel I',
      badgeColor: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    },
    {
      key: 'Semanas 3-4',
      title: 'Semanas 3-4',
      level: 'Nivel I',
      badgeColor: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    },
    {
      key: 'Semanas 5-6',
      title: 'Semanas 5-6',
      level: 'Nivel II',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    {
      key: 'Semanas 7-8',
      title: 'Semanas 7-8',
      level: 'Nivel II',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    {
      key: 'Semanas 9-10',
      title: 'Semanas 9-10',
      level: 'Nivel III',
      badgeColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    },
    {
      key: 'Semanas 11-12',
      title: 'Semanas 11-12',
      level: 'Nivel III',
      badgeColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    },
  ];

  // Renderizador unificado de tarjeta de módulo curricular
  const renderModuleCard = (node: ProgramNodeInfo) => {
    return (
      <div
        key={`admin-module-step-${node.step}`}
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
                {node.levelTitle || liveLevelConfigs[node.level as 'Nivel I' | 'Nivel II' | 'Nivel III']?.title || node.level}
              </span>
            </div>

            <span className="text-[11px] font-medium text-gray-500 dark:text-neutral-400 bg-gray-100/80 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md">
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
        </div>

        {/* Botonera de Acciones de la Tarjeta */}
        <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => handleDuplicate(node.step, e)}
              title="Duplicar este tablero"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200/80 dark:border-neutral-700/80 text-gray-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Duplicar Tablero</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleDelete(node.step, e)}
              title="Eliminar Módulo"
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenEditor(node.step, 'integrations')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-[11px] font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:border-gray-300 dark:hover:border-neutral-600 transition-all cursor-pointer shadow-2xs"
              title="Gestionar Google Forms & Sheets del módulo"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Forms & Sheets</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenEditor(node.step, 'general')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-[11px] font-bold shadow-xs cursor-pointer transition-all active:scale-[0.98]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Módulo</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizador unificado de tarjeta de sesión 1 a 1 de coachee
  const renderScheduledSessionCard = (sess: Session) => {
    const client = clients.find((c) => c.uid === sess.clientId);
    const clientName = client?.displayName || client?.name || 'Coachee sin nombre';
    const clientEmail = client?.email || 'Sin correo';
    const isCompleted = sess.status === 'completed';
    const sessLevel = getSessionLevel(sess);
    const sessWeek = getSessionWeek(sess);

    return (
      <div
        key={sess.id}
        className={`rounded-3xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all group ${
          isCompleted
            ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/70 dark:border-emerald-800/40'
            : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-800'
        }`}
      >
        <div className="space-y-3">
          {/* Cabecera: Sesión #, Coachee y Estado */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 font-mono text-xs font-bold flex items-center justify-center text-indigo-700 dark:text-indigo-300">
                #{sess.sessionNumber || 1}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  sessLevel === 'Nivel I'
                    ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                    : sessLevel === 'Nivel II'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                }`}
              >
                {sess.levelTitle || liveLevelConfigs[sessLevel as 'Nivel I' | 'Nivel II' | 'Nivel III']?.title || sessLevel}
              </span>
              <span className="text-[10px] font-medium text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                {sessWeek}
              </span>
            </div>

            {/* Alternador de Estado */}
            <button
              type="button"
              onClick={() => {
                const nextStatus = isCompleted ? 'scheduled' : 'completed';
                OntologicalStore.updateSession(sess.id, { status: nextStatus });
                FirestoreSyncService.syncSession({ ...sess, status: nextStatus });
                setSessions(OntologicalStore.getSessions());
                showNotification(
                  `Sesión marcada como ${nextStatus === 'completed' ? 'Completada' : 'Programada'}`
                );
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-200'
              }`}
              title="Clic para cambiar estado"
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Completada</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" />
                  <span>Programada</span>
                </>
              )}
            </button>
          </div>

          {/* Información del Coachee */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-800">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
              {clientName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-black dark:text-white truncate">
                {clientName}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate">
                {clientEmail}
              </p>
            </div>
          </div>

          {/* Título de la Sesión y Objetivo */}
          <div>
            <h4 className="text-sm font-bold text-black dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
              {sess.title || `Sesión #${sess.sessionNumber || 1}: Consultoría Ontológica 1 a 1`}
            </h4>
            {sess.sessionGoal && (
              <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 line-clamp-2 leading-relaxed">
                {sess.sessionGoal}
              </p>
            )}
          </div>

          {/* Fecha, Hora y Duración */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600 dark:text-neutral-300 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{sess.scheduledDate || (sess.date ? sess.date.split('T')[0] : 'Fecha por fijar')}</span>
            </span>
            <span className="text-gray-300 dark:text-neutral-700">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{sess.scheduledTime || '10:00'} ({sess.durationMinutes || 60} min)</span>
            </span>
          </div>

          {/* Enlace de Google Meet */}
          {sess.meetLink && (
            <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-[10px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Video className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="font-semibold text-indigo-900 dark:text-indigo-200 truncate">
                  {sess.meetLink}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    safeCopyToClipboard(sess.meetLink);
                    showNotification('Enlace de Meet copiado al portapapeles');
                  }}
                  className="p-1 rounded-md text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200/50 dark:hover:bg-indigo-900/50 cursor-pointer"
                  title="Copiar enlace"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <a
                  href={sess.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white font-bold text-[10px] hover:bg-indigo-700 flex items-center gap-1"
                >
                  <span>Entrar</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )}

          {/* Enlace de Google Calendar Agenda */}
          {(sess.calendarLink || OntologicalStore.getCalendarUrl()) && (
            <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-[10px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                  {sess.calendarLink || OntologicalStore.getCalendarUrl()}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    safeCopyToClipboard(sess.calendarLink || OntologicalStore.getCalendarUrl());
                    showNotification('Enlace de Agenda Google Calendar copiado');
                  }}
                  className="p-1 rounded-md text-emerald-600 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 cursor-pointer"
                  title="Copiar enlace de Google Calendar"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <a
                  href={sess.calendarLink || OntologicalStore.getCalendarUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 flex items-center gap-1"
                >
                  <span>Agenda</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )}

          {/* Ecosistema Google Forms & Sheets */}
          {(sess.googleFormsUrl || sess.formsIntegrationId) && (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
              <FileSpreadsheet className="w-3 h-3 shrink-0" />
              <span className="font-medium truncate">
                Bitácora vinculada a Google Sheets en tiempo real
              </span>
            </div>
          )}
        </div>

        {/* Acciones de la Tarjeta */}
        <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setDeleteScheduledSessionTarget({
                id: sess.id,
                title: sess.title || `Sesión #${sess.sessionNumber || 1}`,
                clientName,
              });
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Eliminar sesión"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedConsultoriaSession(sess);
              setIsConsultoriaModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-[11px] font-bold shadow-xs cursor-pointer transition-all active:scale-[0.98]"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Sesión</span>
          </button>
        </div>
      </div>
    );
  };

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
        <div className="space-y-4">
          {/* Sub-pestañas principales: Módulos (12 Semanas) vs Agenda de Sesiones 1 a 1 */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCatalogSubTab('modules')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  catalogSubTab === 'modules'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs border border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : 'bg-gray-100 dark:bg-neutral-800/80 text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Malla Curricular (12 Semanas)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  catalogSubTab === 'modules'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                    : 'bg-white/20 dark:bg-black/20'
                }`}>
                  {nodes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCatalogSubTab('scheduled')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  catalogSubTab === 'scheduled'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs border border-indigo-500/40 ring-1 ring-indigo-500/20'
                    : 'bg-gray-100 dark:bg-neutral-800/80 text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-indigo-500" />
                <span>Agenda de Sesiones 1 a 1</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  {sessions.length}
                </span>
              </button>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  safeCopyToClipboard(OntologicalStore.getCalendarUrl());
                  showNotification('Enlace de Agenda Google Calendar copiado (https://calendar.app.google/b5h9YrYnyjME7LbD7)');
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-[0.98]"
                title="Copiar enlace oficial de Google Calendar para citas de sesiones (https://calendar.app.google/b5h9YrYnyjME7LbD7)"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Link Agenda Citas</span>
              </button>

              <button
                type="button"
                onClick={handleSyncFirebaseSessions}
                disabled={isSyncingFirebase}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-200 text-xs font-semibold shadow-2xs cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                title="Sincronizar base de datos de sesiones con Firebase Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncingFirebase ? 'animate-spin' : ''}`} />
                <span>{isSyncingFirebase ? 'Sincronizando...' : 'Sincronizar Firebase'}</span>
              </button>

              <button
                type="button"
                onClick={handlePurgeOldSessions}
                disabled={isPurgingOld}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-semibold shadow-2xs cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                title="Depurar y eliminar registros de sesiones antiguos o huérfanos"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>{isPurgingOld ? 'Depurando...' : 'Depurar antiguos'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenLevelEditor}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-800 dark:text-neutral-200 text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-[0.98]"
                title="Configurar y editar títulos, focos y preguntas ontológicas por nivel"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Editor de Niveles</span>
              </button>

              {catalogSubTab === 'modules' && (
                <button
                  type="button"
                  onClick={handleAddNewModule}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                  title="Crear un nuevo módulo curricular de sesión ontológica"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Módulo</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedConsultoriaSession(null);
                  setIsConsultoriaModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                title="Programar una nueva sesión de consultoría ontológica 1 a 1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Sesión 1 a 1</span>
              </button>
            </div>
          </div>

          {/* Barra de Herramientas: Buscador + Organización + Filtros de Nivel & Semanas */}
          <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 dark:border-neutral-800 shadow-xs space-y-3">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
              {/* Buscador Rápido */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    catalogSubTab === 'modules'
                      ? 'Buscar módulo por título, objetivo, quiebre ontológico o semana...'
                      : 'Buscar sesión agendada por coachee, correo, fecha, objetivo o semana...'
                  }
                  className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-gray-200/80 dark:border-neutral-700 bg-gray-50/70 dark:bg-neutral-800/60 text-black dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Selector de Organización (Agrupación) */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 dark:bg-neutral-800/80 rounded-xl border border-gray-200/60 dark:border-neutral-700/60 shrink-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-indigo-500" />
                  <span>Organizar:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setGroupBy('none')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    groupBy === 'none'
                      ? 'bg-white dark:bg-neutral-900 text-black dark:text-white shadow-2xs font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                  title="Ver en cuadrícula continua"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cuadrícula</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGroupBy('by_level')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    groupBy === 'by_level'
                      ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold ring-1 ring-indigo-500/20'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                  title="Organizar sesiones agrupadas por Nivel Ontológico (Nivel I, II, III)"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Por Nivel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGroupBy('by_week')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    groupBy === 'by_week'
                      ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold ring-1 ring-emerald-500/20'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                  title="Organizar sesiones cronológicamente por Semanas (1-2, 3-4, ...)"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Por Semanas</span>
                </button>
              </div>
            </div>

            {/* Filtros Activos: Filtro de Nivel + Filtro de Semanas */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-gray-100 dark:border-neutral-800 text-xs">
              {/* Filtro por Nivel */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">
                  Nivel:
                </span>
                {(['all', 'Nivel I', 'Nivel II', 'Nivel III'] as const).map((lvl) => {
                  const active = levelFilter === lvl;
                  const count =
                    lvl === 'all'
                      ? (catalogSubTab === 'modules' ? nodes.length : sessions.length)
                      : (catalogSubTab === 'modules'
                          ? nodes.filter((n) => n.level === lvl).length
                          : sessions.filter((s) => getSessionLevel(s) === lvl).length);
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevelFilter(lvl)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? 'bg-white dark:bg-neutral-850 text-neutral-950 dark:text-white shadow-2xs border border-emerald-500/40 ring-1 ring-emerald-500/20 font-bold'
                          : 'bg-gray-100/70 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <span>{lvl === 'all' ? 'Todos los Niveles' : (liveLevelConfigs[lvl]?.title || lvl)}</span>
                      <span
                        className={`text-[10px] font-mono px-1 rounded-full ${
                          active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold' : 'bg-gray-200/80 dark:bg-neutral-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Filtro por Semanas */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Semanas:
                </span>
                <select
                  value={weekFilter}
                  onChange={(e) => setWeekFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="all">Todas las semanas (1 a 12)</option>
                  <option value="Semanas 1-2">Semanas 1-2</option>
                  <option value="Semanas 3-4">Semanas 3-4</option>
                  <option value="Semanas 5-6">Semanas 5-6</option>
                  <option value="Semanas 7-8">Semanas 7-8</option>
                  <option value="Semanas 9-10">Semanas 9-10</option>
                  <option value="Semanas 11-12">Semanas 11-12</option>
                </select>
                {(levelFilter !== 'all' || weekFilter !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setLevelFilter('all');
                      setWeekFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-[10px] text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline cursor-pointer ml-1"
                  >
                    Restablecer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CONTENIDO 1: MALLA DE MÓDULOS DE SESIÓN (12 SEMANAS)                      */}
          {/* ========================================================================= */}
          {catalogSubTab === 'modules' && (
            <div className="space-y-6">
              {filteredNodes.length > 0 ? (
                <>
                  {/* CASO A: ORGANIZACIÓN POR NIVEL */}
                  {groupBy === 'by_level' && (
                    <div className="space-y-8">
                      {LEVEL_CONFIGS.map((lvl) => {
                        const levelNodes = filteredNodes.filter((n) => n.level === lvl.id);
                        if (levelNodes.length === 0) return null;

                        return (
                          <div
                            key={lvl.id}
                            className={`p-5 rounded-3xl border ${lvl.borderAccent} bg-gray-50/50 dark:bg-neutral-900/40 space-y-4`}
                          >
                            {/* Cabecera del Nivel */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/70 dark:border-neutral-800 pb-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${lvl.dotColor}`} />
                                  <h3 className="text-base font-bold text-black dark:text-white">
                                    {lvl.title}
                                  </h3>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lvl.badgeColor}`}>
                                    {lvl.weeks}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-neutral-400 max-w-2xl font-light">
                                  {lvl.description}
                                </p>
                              </div>
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 self-start sm:self-auto shrink-0">
                                {levelNodes.length} {levelNodes.length === 1 ? 'Módulo' : 'Módulos'}
                              </span>
                            </div>

                            {/* Malla de Tarjetas del Nivel */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {levelNodes.map(renderModuleCard)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* CASO B: ORGANIZACIÓN POR SEMANAS */}
                  {groupBy === 'by_week' && (
                    <div className="space-y-8">
                      {WEEK_CONFIGS.map((wk) => {
                        const weekNodes = filteredNodes.filter(
                          (n) => getNodeWeekKey(n) === wk.key
                        );
                        if (weekNodes.length === 0) return null;

                        return (
                          <div
                            key={wk.key}
                            className="p-5 rounded-3xl border border-gray-200/80 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/40 space-y-4"
                          >
                            {/* Cabecera del Bloque Semanal */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/70 dark:border-neutral-800 pb-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-emerald-500" />
                                  <h3 className="text-base font-bold text-black dark:text-white">
                                    {wk.title}
                                  </h3>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${wk.badgeColor}`}>
                                    {wk.level}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 self-start sm:self-auto shrink-0">
                                {weekNodes.length} {weekNodes.length === 1 ? 'Módulo' : 'Módulos'}
                              </span>
                            </div>

                            {/* Malla de Tarjetas del Bloque de Semanas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {weekNodes.map(renderModuleCard)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* CASO C: CUADRÍCULA CORRIDA (SIN AGRUPAR) */}
                  {groupBy === 'none' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredNodes.map(renderModuleCard)}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800 space-y-3">
                  <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
                  <h4 className="text-sm font-bold text-black dark:text-white">
                    No se encontraron módulos con el criterio especificado
                  </h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Intenta con otra palabra clave o restablece los filtros de nivel y semanas.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setLevelFilter('all');
                      setWeekFilter('all');
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 rounded-xl hover:bg-gray-200 cursor-pointer"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* CONTENIDO 2: AGENDA DE SESIONES 1 A 1 DE COACHEES                        */}
          {/* ========================================================================= */}
          {catalogSubTab === 'scheduled' && (
            <div className="space-y-6">
              {filteredSessions.length > 0 ? (
                <>
                  {/* CASO A: SESIONES 1 A 1 ORGANIZADAS POR NIVEL */}
                  {groupBy === 'by_level' && (
                    <div className="space-y-8">
                      {LEVEL_CONFIGS.map((lvl) => {
                        const levelSessions = filteredSessions.filter(
                          (s) => getSessionLevel(s) === lvl.id
                        );
                        if (levelSessions.length === 0) return null;

                        return (
                          <div
                            key={lvl.id}
                            className={`p-5 rounded-3xl border ${lvl.borderAccent} bg-gray-50/50 dark:bg-neutral-900/40 space-y-4`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/70 dark:border-neutral-800 pb-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${lvl.dotColor}`} />
                                  <h3 className="text-base font-bold text-black dark:text-white">
                                    {lvl.title}
                                  </h3>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lvl.badgeColor}`}>
                                    {lvl.weeks}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                                  Sesiones de acompañamiento ontológico 1 a 1 correspondientes a este nivel formativo.
                                </p>
                              </div>
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 self-start sm:self-auto shrink-0">
                                {levelSessions.length} {levelSessions.length === 1 ? 'Sesión' : 'Sesiones'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {levelSessions.map(renderScheduledSessionCard)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* CASO B: SESIONES 1 A 1 ORGANIZADAS POR SEMANAS */}
                  {groupBy === 'by_week' && (
                    <div className="space-y-8">
                      {WEEK_CONFIGS.map((wk) => {
                        const weekSessions = filteredSessions.filter(
                          (s) => getSessionWeek(s) === wk.key
                        );
                        if (weekSessions.length === 0) return null;

                        return (
                          <div
                            key={wk.key}
                            className="p-5 rounded-3xl border border-gray-200/80 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/40 space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/70 dark:border-neutral-800 pb-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-emerald-500" />
                                  <h3 className="text-base font-bold text-black dark:text-white">
                                    {wk.title}
                                  </h3>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${wk.badgeColor}`}>
                                    {wk.level}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 self-start sm:self-auto shrink-0">
                                {weekSessions.length} {weekSessions.length === 1 ? 'Sesión' : 'Sesiones'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {weekSessions.map(renderScheduledSessionCard)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* CASO C: SESIONES 1 A 1 EN CUADRÍCULA CORRIDA */}
                  {groupBy === 'none' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredSessions.map(renderScheduledSessionCard)}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800 space-y-3">
                  <Video className="w-8 h-8 text-indigo-400 mx-auto" />
                  <h4 className="text-sm font-bold text-black dark:text-white">
                    No hay sesiones 1 a 1 agendadas con los criterios seleccionados
                  </h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Puedes programar una nueva sesión con tu coachee haciendo clic en "Nueva Sesión 1 a 1" o restablecer los filtros de búsqueda.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedConsultoriaSession(null);
                        setIsConsultoriaModalOpen(true);
                      }}
                      className="px-4 py-2 text-xs font-bold bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-xl hover:bg-neutral-800 transition-all cursor-pointer"
                    >
                      + Programar Nueva Sesión
                    </button>
                    {(levelFilter !== 'all' || weekFilter !== 'all' || searchQuery) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setLevelFilter('all');
                          setWeekFilter('all');
                        }}
                        className="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 rounded-xl hover:bg-gray-200 cursor-pointer"
                      >
                        Limpiar Filtros
                      </button>
                    )}
                  </div>
                </div>
              )}
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
                  onClick={(e) => handleDelete(formData.step, e)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold shadow-2xs cursor-pointer transition-all active:scale-[0.98]"
                  title="Eliminar este módulo de sesión permanentemente"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Eliminar Módulo</span>
                </button>

                <button
                  type="button"
                  onClick={handleDuplicateFromEditor}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 text-gray-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold shadow-2xs cursor-pointer transition-all active:scale-[0.98]"
                  title="Duplicar este tablero con su contenido actual"
                >
                  <Copy className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Duplicar Tablero</span>
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
                  <span className="text-xs font-bold">2. Automatizaciones & Evaluación • Ecosistema Google Forms & Sheets</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Ecosistema Google Forms, Sheets en vivo, confirmaciones inmediatas y recordatorios
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
                      onChange={(e) => {
                        const newLvl = e.target.value as 'Nivel I' | 'Nivel II' | 'Nivel III';
                        const lvlMeta = liveLevelConfigs[newLvl];
                        setFormData({
                          ...formData,
                          level: newLvl,
                          levelTitle: lvlMeta?.title || formData.levelTitle,
                          levelPrompt: lvlMeta?.prompt || formData.levelPrompt,
                        });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                    >
                      <option value="Nivel I">{liveLevelConfigs['Nivel I']?.title || 'Nivel I: Fundamentos & Transparencia'}</option>
                      <option value="Nivel II">{liveLevelConfigs['Nivel II']?.title || 'Nivel II: Corporalidad, Relaciones & Emocionalidad'}</option>
                      <option value="Nivel III">{liveLevelConfigs['Nivel III']?.title || 'Nivel III: Dirección & Trascendencia'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                      Temporalidad / Semanas
                    </label>
                    <input
                      type="text"
                      value={formData.weekLabel || ''}
                      onChange={(e) => setFormData({ ...formData, weekLabel: e.target.value })}
                      placeholder="Ej: Semanas 1-2"
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
                  <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                    Requerimientos para el Espacio
                  </label>
                  <input
                    type="text"
                    value={formData.levelPrompt || ''}
                    onChange={(e) => setFormData({ ...formData, levelPrompt: e.target.value })}
                    placeholder="Requerimientos, condiciones previas y preparación para este espacio..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* PESTAÑA 2: AUTOMATIZACIONES & EVALUACIÓN • GOOGLE FORMS & SHEETS */}
            {/* ------------------------------------------------------------- */}
            {editorTab === 'integrations' && (
              <div className="space-y-6">
                <EventEvaluationAndTriggersSection
                  event={nodeEventData}
                  onChange={handleNodeEventChange}
                  entityType="sesion"
                  badgeText="2. Automatizaciones & Evaluación • Ecosistema Google Forms & Sheets"
                  customTitle="Flujo de Automatizaciones y Evaluación para Módulo de Sesión"
                />
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-gray-200 dark:border-neutral-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500/40 text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    <span>Siguiente: Automatizaciones & Evaluación (Paso 2)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
                      {previewNode.keyQuestion && !previewNode.keyQuestion.includes('nueva identidad pública y profesional') && (
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
                                      key={`rating-val-${q.id}-${val}`}
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
                      className="px-5 py-2 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-xs font-bold cursor-pointer shadow-2xs transition-all"
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

      {/* Modal de confirmación para eliminar sesión agendada 1 a 1 */}
      {deleteScheduledSessionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  ¿Eliminar Sesión?
                </h3>
                <p className="text-xs text-neutral-500">Acción permanente</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente la sesión{' '}
              <strong className="text-neutral-900 dark:text-white font-semibold">
                "{deleteScheduledSessionTarget.title}"
              </strong>{' '}
              del coachee{' '}
              <strong className="text-neutral-900 dark:text-white font-semibold">
                {deleteScheduledSessionTarget.clientName}
              </strong>? Se eliminará de la base de datos local y de Firebase Firestore.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteScheduledSessionTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteScheduledSession}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
              >
                Sí, eliminar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITOR DE NIVELES Y ASIGNACIÓN DE SESIONES                         */}
      {/* ========================================================================= */}
      {isLevelEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Cabecera del Modal */}
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-neutral-800 flex items-start justify-between gap-4 bg-gray-50/50 dark:bg-neutral-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-black dark:text-white">
                    Editor de Niveles Formativos RBC
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    Configura la identidad pedagógica y requerimientos de cada nivel formativo.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLevelEditorOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas de Niveles */}
            <div className="px-5 sm:px-6 pt-4 pb-2 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-2 bg-white dark:bg-[#18181B] shrink-0">
              {(['Nivel I', 'Nivel II', 'Nivel III'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setActiveLevelTab(lvl)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeLevelTab === lvl
                      ? lvl === 'Nivel I'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : lvl === 'Nivel II'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-purple-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-neutral-800/70 text-gray-600 dark:text-neutral-400 hover:bg-gray-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{lvl}</span>
                </button>
              ))}
            </div>

            {/* Contenido Desplazable de Edición de Nivel */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-[11px] text-indigo-900 dark:text-indigo-200">
                <p className="font-semibold">
                  Sincronización Global de Nivel:
                </p>
                <p className="text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
                  Al modificar el nombre o descriptor de este nivel, se actualizarán y anclarán de manera automática todas las sesiones, módulos de bitácora y vistas de participantes en la base de datos oficial.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    Nombre o Descriptor Oficial del {activeLevelTab}
                  </label>
                  <input
                    type="text"
                    value={editingLevels[activeLevelTab]?.title || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingLevels((prev) => ({
                        ...prev,
                        [activeLevelTab]: {
                          ...prev[activeLevelTab],
                          title: val,
                        },
                      }));
                    }}
                    placeholder={`Ej. ${activeLevelTab}: Fundamentos & Transparencia`}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Este nombre se mostrará en los encabezados de sesiones, insignias y expedientes de coachees.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    Enfoque Temático & Competencias Ontológicas
                  </label>
                  <input
                    type="text"
                    value={editingLevels[activeLevelTab]?.focus || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingLevels((prev) => ({
                        ...prev,
                        [activeLevelTab]: {
                          ...prev[activeLevelTab],
                          focus: val,
                        },
                      }));
                    }}
                    placeholder="Bases del observador ontológico, quiebres cotidianos, juicios y coherencia..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    Pregunta Orientadora / Requerimientos para el Espacio
                  </label>
                  <textarea
                    rows={3}
                    value={editingLevels[activeLevelTab]?.prompt || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingLevels((prev) => ({
                        ...prev,
                        [activeLevelTab]: {
                          ...prev[activeLevelTab],
                          prompt: val,
                        },
                      }));
                    }}
                    placeholder="Requerimientos, acuerdos previos, condiciones y preparación necesarios para este espacio..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Pie del Modal */}
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-neutral-900/50 shrink-0">
              <button
                type="button"
                onClick={() => setIsLevelEditorOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer transition-all"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveLevels}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios de Niveles</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GENERADOR DE SESIONES */}
      <ConsultoriaSessionCreationModal
        isOpen={isConsultoriaModalOpen}
        onClose={() => {
          setIsConsultoriaModalOpen(false);
          setSelectedConsultoriaSession(null);
        }}
        initialSession={selectedConsultoriaSession}
        onSessionCreated={(newOrUpdatedSession) => {
          setSessions(OntologicalStore.getSessions());
          refreshAll();
          showNotification(
            `Sesión "${newOrUpdatedSession.title || 'Consultoría'}" programada con éxito en el Generador de Sesiones.`
          );
          if (onRefreshParent) onRefreshParent();
        }}
        onSessionDeleted={(deletedSessionId) => {
          setSessions(OntologicalStore.getSessions());
          refreshAll();
          showNotification('Sesión eliminada de la base de datos y Firestore.');
          if (onRefreshParent) onRefreshParent();
        }}
        onOpenAutomationsPanel={() => {
          if (onGoToAutomations) {
            setSelectedConsultoriaSession(null);
            setIsConsultoriaModalOpen(false);
            onGoToAutomations();
          } else {
            setIsAutomationsModalOpen(true);
          }
        }}
      />

      {/* MODAL: CENTRO GLOBAL DE AUTOMATIZACIONES MAKE.COM & WEBHOOKS */}
      {isAutomationsModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50/80 dark:bg-neutral-900/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Centro Global de Automatizaciones & Webhooks Make.com
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    Gestión y prueba en vivo de activadores, disparadores y escenarios de integración
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAutomationsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <AdminAutomationsManager onRefresh={refreshAll} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSessionsManager;
