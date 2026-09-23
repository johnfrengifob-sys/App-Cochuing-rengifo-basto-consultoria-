import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  Users,
  Compass,
  Sliders,
  Award,
  BookOpen,
  Film,
  Layers,
  X,
  ShieldCheck,
  Zap,
  Trash2,
} from 'lucide-react';
import {
  Session,
  ConsultoriaSessionType,
  FormsSheetsIntegrationSourceKey,
  SessionAutomationsConfig,
  SessionConversationalGuide,
  SessionCycleReviewAxes,
} from '../../types';
import { OntologicalStore } from '../../services/store';
import { FirestoreSyncService } from '../../services/firestoreSync';
import { OFFICIAL_FORMS_SHEETS_BASE_MAP } from '../../data/officialFormsSheetsBase';
import { safeCopyToClipboard } from '../../utils/clipboard';

interface ConsultoriaSessionCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated?: (session: Session) => void;
  onSessionDeleted?: (sessionId: string) => void;
  initialSession?: Session | null;
  defaultClientId?: string;
  onOpenAutomationsPanel?: () => void;
}

export const ConsultoriaSessionCreationModal: React.FC<ConsultoriaSessionCreationModalProps> = ({
  isOpen,
  onClose,
  onSessionCreated,
  onSessionDeleted,
  initialSession,
  defaultClientId,
}) => {
  const clients = OntologicalStore.getClients();
  const levelConfigs = OntologicalStore.getLevelConfigs();

  const normalizeInitialType = (t?: ConsultoriaSessionType): ConsultoriaSessionType => {
    if (t === 'cierre_ciclo' || t === 'recopilacion_cycle') return 'cierre_ciclo';
    return 'sesion';
  };

  const [activeTab, setActiveTab] = useState<'logistics' | 'focus' | 'resources'>('logistics');

  // 1. Datos & Logística
  const [sessionType, setSessionType] = useState<ConsultoriaSessionType>(
    normalizeInitialType(initialSession?.sessionType)
  );
  const [clientId, setClientId] = useState<string>(() => {
    if (initialSession?.clientId) return initialSession.clientId;
    if (defaultClientId) return defaultClientId;
    return clients[0]?.uid || '';
  });
  const [title, setTitle] = useState<string>(() => {
    if (initialSession?.title) return initialSession.title;
    return 'Sesión de Consultoría Ontológica 1 a 1';
  });
  const [sessionNumber, setSessionNumber] = useState<number>(() => {
    if (initialSession?.sessionNumber) return initialSession.sessionNumber;
    return 1;
  });
  const [level, setLevel] = useState<'Nivel I' | 'Nivel II' | 'Nivel III'>(() => {
    if (initialSession?.level) return initialSession.level as 'Nivel I' | 'Nivel II' | 'Nivel III';
    return 'Nivel I';
  });
  const [weekLabel, setWeekLabel] = useState<string>(() => {
    if (initialSession?.weekLabel) return initialSession.weekLabel;
    return 'Semanas 1-2';
  });
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    if (initialSession?.scheduledDate) return initialSession.scheduledDate;
    const d = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState<string>(
    initialSession?.scheduledTime || '10:00'
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    initialSession?.durationMinutes || 60
  );

  // Meet Link
  const generateMeetLink = () =>
    `https://meet.google.com/rbc-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

  const [meetLink, setMeetLink] = useState<string>(() => {
    if (initialSession?.meetLink) return initialSession.meetLink;
    return generateMeetLink();
  });

  // 2. Enfoque Ontológico y Preguntas
  const defaultOpeningNormal = '¿Qué te gustaría trabajar el día de hoy? / ¿Cuál es el quiebre que trae tu atención?';
  const defaultOpeningCycle = 'Sesión de Cierre de Ciclo: Revisión del estado actual, aprendizajes consolidados y rediseño del siguiente tramo.';

  const [sessionGoal, setSessionGoal] = useState<string>(initialSession?.sessionGoal || '');
  const [openingQuestion, setOpeningQuestion] = useState<string>(() => {
    if (initialSession?.openingQuestion) return initialSession.openingQuestion;
    if (initialSession?.sessionType === 'cierre_ciclo' || initialSession?.sessionType === 'recopilacion_cycle') {
      return defaultOpeningCycle;
    }
    return defaultOpeningNormal;
  });

  // Guía y Ejes
  const [somaticFocus, setSomaticFocus] = useState<string>(
    initialSession?.conversationalGuide?.somaticEmotionalExploration || ''
  );
  const [actionAgreement, setActionAgreement] = useState<string>(
    initialSession?.conversationalGuide?.consciousActionCoCreation || ''
  );
  const [progressEvaluation, setProgressEvaluation] = useState<string>(
    initialSession?.cycleReviewAxes?.progressEvaluation || ''
  );
  const [nextLegRedesign, setNextLegRedesign] = useState<string>(
    initialSession?.cycleReviewAxes?.nextLegRedesign || ''
  );

  // 3. Formularios & Recursos
  const [formsPresetKey, setFormsPresetKey] = useState<FormsSheetsIntegrationSourceKey>(
    (initialSession?.formsIntegrationId as FormsSheetsIntegrationSourceKey) || 'bitacora_sesiones_b2b'
  );
  const [customFormUrl, setCustomFormUrl] = useState<string>(initialSession?.googleFormsUrl || '');
  const [customSheetUrl, setCustomSheetUrl] = useState<string>(initialSession?.googleSheetsUrl || '');

  // Material de Apoyo (Opcional)
  const [guideUrl, setGuideUrl] = useState<string>(initialSession?.guideUrl || '');
  const [guideTitle, setGuideTitle] = useState<string>(initialSession?.guideTitle || '');
  const [videoUrl, setVideoUrl] = useState<string>(initialSession?.videoUrl || '');
  const [videoTitle, setVideoTitle] = useState<string>(initialSession?.videoTitle || '');

  // Automatizaciones mínimas
  const [triggersEnabled, setTriggersEnabled] = useState<boolean>(
    initialSession?.automationsConfig?.triggersEnabled ?? true
  );

  // Copiado
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Sincronizar todos los campos de estado cuando se abre el modal o cambia la sesión inicial
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      return;
    }

    if (initialSession) {
      setSessionType(normalizeInitialType(initialSession.sessionType));
      setClientId(initialSession.clientId || defaultClientId || clients[0]?.uid || '');
      setTitle(initialSession.title || 'Sesión de Consultoría Ontológica 1 a 1');
      setSessionNumber(initialSession.sessionNumber || 1);
      setLevel((initialSession.level as 'Nivel I' | 'Nivel II' | 'Nivel III') || 'Nivel I');
      setWeekLabel(initialSession.weekLabel || 'Semanas 1-2');
      setScheduledDate(
        initialSession.scheduledDate ||
          (initialSession.date ? initialSession.date.split('T')[0] : new Date().toISOString().split('T')[0])
      );
      setScheduledTime(initialSession.scheduledTime || '10:00');
      setDurationMinutes(initialSession.durationMinutes || 60);
      setMeetLink(initialSession.meetLink || generateMeetLink());
      setSessionGoal(initialSession.sessionGoal || '');
      setOpeningQuestion(
        initialSession.openingQuestion ||
          (initialSession.sessionType === 'cierre_ciclo' || initialSession.sessionType === 'recopilacion_cycle'
            ? defaultOpeningCycle
            : defaultOpeningNormal)
      );
      setSomaticFocus(initialSession.conversationalGuide?.somaticEmotionalExploration || '');
      setActionAgreement(initialSession.conversationalGuide?.consciousActionCoCreation || '');
      setProgressEvaluation(initialSession.cycleReviewAxes?.progressEvaluation || '');
      setNextLegRedesign(initialSession.cycleReviewAxes?.nextLegRedesign || '');
      setFormsPresetKey(
        (initialSession.formsIntegrationId as FormsSheetsIntegrationSourceKey) || 'bitacora_sesiones_b2b'
      );
      setCustomFormUrl(initialSession.googleFormsUrl || '');
      setCustomSheetUrl(initialSession.googleSheetsUrl || '');
      setGuideUrl(initialSession.guideUrl || '');
      setGuideTitle(initialSession.guideTitle || '');
      setVideoUrl(initialSession.videoUrl || '');
      setVideoTitle(initialSession.videoTitle || '');
      setTriggersEnabled(initialSession.automationsConfig?.triggersEnabled ?? true);
      setShowDeleteConfirm(false);
    } else {
      const targetClientId = defaultClientId || clients[0]?.uid || '';
      setClientId(targetClientId);
      const clientSessions = targetClientId
        ? OntologicalStore.getSessions().filter((s) => s.clientId === targetClientId)
        : [];
      const nextNumber = clientSessions.length + 1;
      setSessionNumber(nextNumber);
      setSessionType('sesion');
      setTitle(`Sesión #${nextNumber}: Consultoría Ontológica 1 a 1`);
      setSessionGoal('Acompañamiento ontológico no direccional y exploración libre del quiebre.');
      setOpeningQuestion(defaultOpeningNormal);
      const d = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);
      setScheduledDate(d.toISOString().split('T')[0]);
      setScheduledTime('10:00');
      setDurationMinutes(60);
      setMeetLink(generateMeetLink());
      setSomaticFocus('');
      setActionAgreement('');
      setProgressEvaluation('');
      setNextLegRedesign('');
      setFormsPresetKey('bitacora_sesiones_b2b');
      setCustomFormUrl('');
      setCustomSheetUrl('');
      setGuideUrl('');
      setGuideTitle('');
      setVideoUrl('');
      setVideoTitle('');
      setTriggersEnabled(true);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, initialSession, defaultClientId]);

  // Manejo de eliminación definitiva de la sesión
  const handleDeleteThisSession = () => {
    if (!initialSession?.id) return;
    OntologicalStore.deleteSession(initialSession.id);
    FirestoreSyncService.deleteSession(initialSession.id).catch(() => {});
    if (onSessionDeleted) {
      onSessionDeleted(initialSession.id);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleSessionTypeChange = (type: ConsultoriaSessionType) => {
    setSessionType(type);
    if (type === 'cierre_ciclo' || type === 'recopilacion_cycle') {
      setOpeningQuestion(defaultOpeningCycle);
      setTitle((prev) =>
        prev.includes('Cierre de Ciclo') ? prev : prev.replace(/Consultoría Ontológica 1 a 1/gi, 'Cierre de Ciclo')
      );
      if (!sessionGoal) {
        setSessionGoal('Revisión del estado actual, medición de evolución y rediseño del siguiente tramo.');
      }
    } else {
      setOpeningQuestion(defaultOpeningNormal);
      setTitle((prev) =>
        prev.includes('Consultoría Ontológica') ? prev : prev.replace(/Cierre de Ciclo/gi, 'Consultoría Ontológica 1 a 1')
      );
      if (!sessionGoal) {
        setSessionGoal('Acompañamiento ontológico no direccional y exploración libre del quiebre.');
      }
    }
  };

  const handleCopy = (text: string, keyName: string) => {
    safeCopyToClipboard(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Preset de Google Forms & Sheets
  const activeBase = OFFICIAL_FORMS_SHEETS_BASE_MAP[formsPresetKey] || OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b;
  const finalFormUrl = customFormUrl || activeBase.formUrl;
  const finalSheetUrl = customSheetUrl || activeBase.sheetUrl;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    const client = clients.find((c) => c.uid === clientId);
    const existingSessions = OntologicalStore.getSessions().filter((s) => s.clientId === clientId);
    const sessionNum = sessionNumber || initialSession?.sessionNumber || existingSessions.length + 1;
    const dateStr = `${scheduledDate}T${scheduledTime}:00`;

    const conversationalGuide: SessionConversationalGuide | undefined =
      sessionType === 'sesion'
        ? {
            somaticEmotionalExploration: somaticFocus || 'Exploración abierta del estado corporal y emocional.',
            judgmentsAffirmationsInquiry: 'Indagación ontológica en juicios y hechos fácticos.',
            consciousActionCoCreation: actionAgreement || 'Diseño de acciones conscientes para la práctica semanal.',
          }
        : undefined;

    const cycleReviewAxes: SessionCycleReviewAxes | undefined =
      sessionType === 'cierre_ciclo' || sessionType === 'recopilacion_cycle'
        ? {
            currentState: 'Evolución del observador ontológico a lo largo del ciclo.',
            progressEvaluation: progressEvaluation || 'Aprendizajes y distinciones ontológicas consolidadas.',
            destinationAndPurpose: 'Coordenadas del proceso para el próximo tramo.',
            nextLegRedesign: nextLegRedesign || 'Ajuste de acuerdos co-creativos.',
          }
        : undefined;

    const automationsConfig: SessionAutomationsConfig = {
      triggersEnabled,
      immediateConfirmation: triggersEnabled,
      scheduledReminders: triggersEnabled,
      postSurveyDispatched: triggersEnabled,
    };

    const savedSession: Session = {
      id: initialSession?.id || `sess-${Date.now()}`,
      clientId,
      sessionNumber: sessionNum,
      level,
      levelTitle: levelConfigs[level]?.title || (level === 'Nivel I' ? 'Nivel I: Fundamentos & Transparencia' : level === 'Nivel II' ? 'Nivel II: Corporalidad, Relaciones & Emocionalidad' : 'Nivel III: Dirección & Trascendencia'),
      weekLabel,
      weekNumber: parseInt(weekLabel.replace(/\D/g, '') || String(sessionNum), 10),
      date: new Date(dateStr).toISOString(),
      scheduledDate,
      scheduledTime,
      durationMinutes,
      meetLink: meetLink.trim() || generateMeetLink(),
      status: initialSession?.status || 'scheduled',
      title: title.trim(),
      sessionGoal: sessionGoal.trim(),
      sessionType,
      spaceName: 'Sesiones de Consultoría Ontológica 1 a 1.',
      facilitatorCoach: 'John Fredy Rengifo Basto (Master Coach Ontológico).',
      modalityNotice: 'Individual (Acuerdo Co-creativo).',
      openingQuestion: openingQuestion.trim(),
      conversationalGuide,
      cycleReviewAxes,
      automationsConfig,
      googleFormsUrl: finalFormUrl,
      googleSheetsUrl: finalSheetUrl,
      formsIntegrationId: formsPresetKey,
      agreementFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales?.formUrl,
      bitacoraFormUrl: finalFormUrl,
      guideUrl: guideUrl.trim() || undefined,
      guideTitle: guideTitle.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      videoTitle: videoTitle.trim() || undefined,
      expedienteSyncStatus: 'synced',
      notes: `Sesión de Consultoría Ontológica con ${client?.displayName || client?.name || 'Coachee'}. Tipo: ${sessionType === 'cierre_ciclo' ? 'Cierre de ciclo' : 'Sesión'}.`,
    };

    if (initialSession?.id) {
      OntologicalStore.updateSession(initialSession.id, savedSession);
    } else {
      OntologicalStore.addSession(savedSession);
    }

    FirestoreSyncService.syncSession(savedSession).catch(() => {});

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onSessionCreated) onSessionCreated(savedSession);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-neutral-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Cabecera Limpia y Concisa */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-4 bg-gray-50/60 dark:bg-neutral-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-black dark:text-white">
                  {initialSession ? 'Editar Sesión 1 a 1' : 'Nueva Sesión de Consultoría'}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                  {sessionType === 'cierre_ciclo' ? 'Cierre de ciclo' : 'Sesión'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                Acompañamiento individual ontológico, sala Meet y bitácora en Sheets.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación Rápida */}
        <div className="flex border-b border-gray-100 dark:border-neutral-800 px-5 pt-2 gap-2 shrink-0 bg-white dark:bg-[#121216]">
          <button
            type="button"
            onClick={() => setActiveTab('logistics')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logistics'
                ? 'border-neutral-950 dark:border-white text-black dark:text-white'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>1. Datos & Logística</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('focus')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'focus'
                ? 'border-neutral-950 dark:border-white text-black dark:text-white'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>2. Enfoque Ontológico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resources')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'resources'
                ? 'border-neutral-950 dark:border-white text-black dark:text-white'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>3. Bitácora & Recursos</span>
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 text-xs">
          
          {/* TAB 1: DATOS & LOGÍSTICA */}
          {activeTab === 'logistics' && (
            <div className="space-y-4 animate-fade-in">
              {/* Selector de Tipo de Sesión */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Tipo de Sesión</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSessionTypeChange('sesion')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      sessionType === 'sesion'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/60 text-gray-600 dark:text-neutral-400'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">Sesión Regular</span>
                      <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                        Exploración abierta del quiebre
                      </span>
                    </div>
                    {sessionType === 'sesion' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSessionTypeChange('cierre_ciclo')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      sessionType === 'cierre_ciclo'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/60 text-gray-600 dark:text-neutral-400'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">Cierre de Ciclo</span>
                      <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                        Balance e integración (cada 4 sesiones)
                      </span>
                    </div>
                    {sessionType === 'cierre_ciclo' && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Coachee y Título */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>Coachee Asignado *</span>
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-medium cursor-pointer focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                    required
                  >
                    {clients.map((c) => (
                      <option key={c.uid} value={c.uid}>
                        {c.displayName || c.name || 'Coachee'} ({c.email || 'Sin correo'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                    Título de la Sesión *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Sesión 1: Consultoría Ontológica 1 a 1"
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Organización Curricular: Nivel, Semanas y Número */}
              <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-neutral-800/40 border border-gray-200/80 dark:border-neutral-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-neutral-300 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-500" />
                    <span>Nivel Formativo</span>
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white cursor-pointer"
                  >
                    <option value="Nivel I">{levelConfigs['Nivel I']?.title || 'Nivel I (Fundamentos & Transparencia)'}</option>
                    <option value="Nivel II">{levelConfigs['Nivel II']?.title || 'Nivel II (Corporalidad, Relaciones & Emocionalidad)'}</option>
                    <option value="Nivel III">{levelConfigs['Nivel III']?.title || 'Nivel III (Dirección & Trascendencia)'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-neutral-300">
                    Semanas Sugeridas
                  </label>
                  <select
                    value={weekLabel}
                    onChange={(e) => setWeekLabel(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white cursor-pointer"
                  >
                    <option value="Semanas 1-2">Semanas 1-2</option>
                    <option value="Semanas 3-4">Semanas 3-4</option>
                    <option value="Semanas 5-6">Semanas 5-6</option>
                    <option value="Semanas 7-8">Semanas 7-8</option>
                    <option value="Semanas 9-10">Semanas 9-10</option>
                    <option value="Semanas 11-12">Semanas 11-12</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-neutral-300">
                    Número de Sesión
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Fecha, Hora y Duración */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Fecha *</span>
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Hora *</span>
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                    Duración
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white cursor-pointer focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                  >
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos (Estándar)</option>
                    <option value={90}>90 minutos</option>
                    <option value={120}>120 minutos</option>
                  </select>
                </div>
              </div>

              {/* Sala Google Meet */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Sala de Google Meet</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMeetLink(generateMeetLink())}
                    className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Generar nuevo enlace
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(meetLink, 'meet')}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 text-gray-700 dark:text-neutral-300 shrink-0 cursor-pointer"
                    title="Copiar enlace"
                  >
                    {copiedKey === 'meet' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {meetLink && (
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                      title="Probar sala"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENFOQUE ONTOLÓGICO */}
          {activeTab === 'focus' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-800 dark:text-neutral-200">
                  Objetivo / Enfoque de la Sesión
                </label>
                <input
                  type="text"
                  value={sessionGoal}
                  onChange={(e) => setSessionGoal(e.target.value)}
                  placeholder="Ej. Exploración libre del quiebre y autoobservación ontológica"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-800 dark:text-neutral-200">
                  Pregunta de Apertura
                </label>
                <textarea
                  rows={2}
                  value={openingQuestion}
                  onChange={(e) => setOpeningQuestion(e.target.value)}
                  placeholder="¿Qué te gustaría trabajar el día de hoy?"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-neutral-900 focus:outline-hidden leading-relaxed resize-none"
                />
              </div>

              {sessionType === 'sesion' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/60 space-y-1">
                    <span className="text-[11px] font-bold text-gray-800 dark:text-neutral-200 block">
                      Foco Somático / Emocional
                    </span>
                    <input
                      type="text"
                      value={somaticFocus}
                      onChange={(e) => setSomaticFocus(e.target.value)}
                      placeholder="Exploración corporal y emocional presente..."
                      className="w-full p-2 text-[11px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/60 space-y-1">
                    <span className="text-[11px] font-bold text-gray-800 dark:text-neutral-200 block">
                      Compromiso / Acción Consciente
                    </span>
                    <input
                      type="text"
                      value={actionAgreement}
                      onChange={(e) => setActionAgreement(e.target.value)}
                      placeholder="Micro-práctica declarativa o somática..."
                      className="w-full p-2 text-[11px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                    <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 block">
                      Balance de Avance del Ciclo
                    </span>
                    <input
                      type="text"
                      value={progressEvaluation}
                      onChange={(e) => setProgressEvaluation(e.target.value)}
                      placeholder="Aprendizajes consolidados en las últimas 4 semanas..."
                      className="w-full p-2 text-[11px] rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-neutral-900 text-black dark:text-white"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                    <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 block">
                      Rediseño del Siguiente Tramo
                    </span>
                    <input
                      type="text"
                      value={nextLegRedesign}
                      onChange={(e) => setNextLegRedesign(e.target.value)}
                      placeholder="Nuevas metas y acuerdos para el siguiente ciclo..."
                      className="w-full p-2 text-[11px] rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-neutral-900 text-black dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BITÁCORA & RECURSOS */}
          {activeTab === 'resources' && (
            <div className="space-y-4 animate-fade-in">
              {/* Ecosistema Google Forms & Sheets */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bitácora Oficial en Google Sheets & Form</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-semibold">
                    En Tiempo Real
                  </span>
                </div>

                <div className="space-y-2">
                  <select
                    value={formsPresetKey}
                    onChange={(e) => {
                      const key = e.target.value as FormsSheetsIntegrationSourceKey;
                      setFormsPresetKey(key);
                      const base = OFFICIAL_FORMS_SHEETS_BASE_MAP[key];
                      if (base) {
                        setCustomFormUrl(base.formUrl);
                        setCustomSheetUrl(base.sheetUrl);
                      }
                    }}
                    className="w-full p-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-neutral-800 text-black dark:text-white text-xs cursor-pointer"
                  >
                    <option value="bitacora_sesiones_b2b">Bitácora de Sesiones B2B (Recomendado)</option>
                    <option value="sesiones_individuales">Acuerdo de Sesión Individual</option>
                  </select>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                    <a
                      href={finalSheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 hover:underline font-semibold"
                    >
                      <span>Abrir Hoja de Google Sheets</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-gray-300 dark:text-neutral-700">•</span>
                    <a
                      href={finalFormUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 hover:underline font-semibold"
                    >
                      <span>Abrir Formulario Google</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Material Opcional: Guía y Video */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Guía */}
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-neutral-200">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span>Guía de Trabajo (Opcional)</span>
                  </div>
                  <input
                    type="text"
                    value={guideTitle}
                    onChange={(e) => setGuideTitle(e.target.value)}
                    placeholder="Título de la guía..."
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white text-[11px]"
                  />
                  <input
                    type="url"
                    value={guideUrl}
                    onChange={(e) => setGuideUrl(e.target.value)}
                    placeholder="Enlace de Drive / Notion / PDF..."
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono text-[10px]"
                  />
                </div>

                {/* Video */}
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-neutral-200">
                    <Film className="w-3.5 h-3.5 text-rose-500" />
                    <span>Video de la Sesión (Opcional)</span>
                  </div>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Título del video..."
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white text-[11px]"
                  />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Enlace de YouTube / Loom / Drive..."
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono text-[10px]"
                  />
                </div>
              </div>

              {/* Automatización simple */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-xs font-bold block text-black dark:text-white">
                      Confirmaciones y Recordatorios Automáticos
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                      Disparar confirmación de Meet y recordatorio 24h
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={triggersEnabled}
                  onChange={(e) => setTriggersEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-neutral-900 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Pie del Formulario y Botones */}
          <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {initialSession && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold cursor-pointer transition-colors"
                  title="Eliminar esta sesión de la base de datos"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Eliminar Sesión</span>
                </button>
              )}

              {initialSession && showDeleteConfirm && (
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 animate-fade-in">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 pl-1">
                    ¿Eliminar definitivamente?
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteThisSession}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-white/60 text-[11px] font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {!initialSession && (
                <div className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sincronización en Firebase Firestore y Google Sheets</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 font-semibold text-xs hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saveSuccess}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Guardado</span>
                  </>
                ) : (
                  <span>{initialSession ? 'Actualizar Sesión' : 'Guardar y Programar Sesión'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
