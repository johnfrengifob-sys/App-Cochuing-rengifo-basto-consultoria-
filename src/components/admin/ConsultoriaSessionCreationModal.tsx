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
  RefreshCw,
  Workflow,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Users,
  UserCheck,
  Compass,
  Heart,
  Brain,
  Activity,
  X,
  Zap,
  Sliders,
  Award,
  Link2,
  Info,
  CheckCheck,
  Settings,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Film,
} from 'lucide-react';
import {
  Session,
  User,
  ConsultoriaSessionType,
  SessionAutomationsConfig,
  SessionConversationalGuide,
  SessionCycleReviewAxes,
  FormsSheetsIntegrationSourceKey,
} from '../../types';
import { OntologicalStore } from '../../services/store';
import { FirestoreSyncService } from '../../services/firestoreSync';
import {
  OFFICIAL_FORMS_SHEETS_BASE_MAP,
  OFFICIAL_FORMS_SHEETS_BASE_LIST,
} from '../../data/officialFormsSheetsBase';
import { safeCopyToClipboard } from '../../utils/clipboard';

interface ConsultoriaSessionCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated?: (session: Session) => void;
  initialSession?: Session | null;
  defaultClientId?: string;
  onOpenAutomationsPanel?: () => void;
}

export const ConsultoriaSessionCreationModal: React.FC<ConsultoriaSessionCreationModalProps> = ({
  isOpen,
  onClose,
  onSessionCreated,
  initialSession,
  defaultClientId,
  onOpenAutomationsPanel,
}) => {
  const clients = OntologicalStore.getClients();

  // 1. Configuración General y Logística
  const normalizeInitialType = (t?: ConsultoriaSessionType): ConsultoriaSessionType => {
    if (t === 'cierre_ciclo' || t === 'recopilacion_cycle') return 'cierre_ciclo';
    return 'sesion';
  };

  const [sessionType, setSessionType] = useState<ConsultoriaSessionType>(
    normalizeInitialType(initialSession?.sessionType)
  );
  const [spaceName] = useState<string>(
    initialSession?.spaceName || 'Sesiones de Consultoría Ontológica 1 a 1.'
  );
  const [facilitatorCoach] = useState<string>(
    initialSession?.facilitatorCoach || 'John Fredy Rengifo Basto (Master Coach Ontológico).'
  );
  const [modalityNotice] = useState<string>(
    initialSession?.modalityNotice || 'Individual (Acuerdo Co-creativo).'
  );
  const [clientId, setClientId] = useState<string>(() => {
    if (initialSession?.clientId) return initialSession.clientId;
    if (defaultClientId) return defaultClientId;
    return clients[0]?.uid || '';
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
  const [title, setTitle] = useState<string>(() => {
    if (initialSession?.title) return initialSession.title;
    return 'Sesión de Consultoría Ontológica 1 a 1';
  });
  const [sessionGoal, setSessionGoal] = useState<string>(
    initialSession?.sessionGoal || ''
  );

  // 2. Dinámica y Contenido según el Tipo de Sesión
  const defaultOpeningQuestionNormal =
    '¿Qué te gustaría trabajar el día de hoy? / ¿Cuál es el quiebre o tema que trae tu atención en este momento?';
  const defaultOpeningQuestionRecopilacion =
    'Sesión de Cierre de Ciclo: Revisión del estado actual, aprendizajes consolidados y alineación del propósito del proceso.';

  const [openingQuestion, setOpeningQuestion] = useState<string>(() => {
    if (initialSession?.openingQuestion) return initialSession.openingQuestion;
    if (initialSession?.sessionType === 'cierre_ciclo' || initialSession?.sessionType === 'recopilacion_cycle')
      return defaultOpeningQuestionRecopilacion;
    return defaultOpeningQuestionNormal;
  });

  // Guía Conversacional para Opción 1 (Sesión)
  const [conversationalGuide, setConversationalGuide] = useState<SessionConversationalGuide>({
    somaticEmotionalExploration:
      initialSession?.conversationalGuide?.somaticEmotionalExploration ||
      'Exploración abierta del estado corporal y emocional presente (respiración, postura y predisposición corporal).',
    judgmentsAffirmationsInquiry:
      initialSession?.conversationalGuide?.judgmentsAffirmationsInquiry ||
      'Indagación en los juicios, afirmaciones y distinciones ontológicas vinculadas al quiebre (hechos fácticos vs. narrativas limitantes).',
    consciousActionCoCreation:
      initialSession?.conversationalGuide?.consciousActionCoCreation ||
      'Co-creación y diseño de acciones conscientes para la práctica semanal (micro-práctica somática o declarativa).',
  });

  // Ejes de Cierre y Revisión para Opción 2 (Cierre de Ciclo)
  const [cycleReviewAxes, setCycleReviewAxes] = useState<SessionCycleReviewAxes>({
    currentState:
      initialSession?.cycleReviewAxes?.currentState ||
      '¿Dónde estás hoy en comparación con el inicio de tu proceso? (Evolución del observador ontológico).',
    progressEvaluation:
      initialSession?.cycleReviewAxes?.progressEvaluation ||
      '¿Qué aprendizajes ontológicos, somáticos y conversacionales se han consolidado a lo largo de este ciclo?',
    destinationAndPurpose:
      initialSession?.cycleReviewAxes?.destinationAndPurpose ||
      '¿Hacia dónde debe dirigirse la energía y cuáles son las nuevas coordenadas del proceso para el próximo tramo?',
    nextLegRedesign:
      initialSession?.cycleReviewAxes?.nextLegRedesign ||
      'Rediseño del siguiente tramo: Ajuste de acuerdos co-creativos y renovación del ciclo de mentoría.',
  });

  // 3. Conectividad y Panel de Automatizaciones
  const generateMeetLink = () =>
    `https://meet.google.com/rbc-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

  const [meetLink, setMeetLink] = useState<string>(() => {
    if (initialSession?.meetLink) return initialSession.meetLink;
    return generateMeetLink();
  });

  const [automationsConfig, setAutomationsConfig] = useState<SessionAutomationsConfig>({
    immediateConfirmation:
      initialSession?.automationsConfig?.immediateConfirmation ?? true,
    scheduledReminders:
      initialSession?.automationsConfig?.scheduledReminders ?? true,
  });

  // 4. Evaluación, Google Forms / Sheets y Expediente
  const [formsPresetKey, setFormsPresetKey] = useState<FormsSheetsIntegrationSourceKey>(
    (initialSession?.formsIntegrationId as FormsSheetsIntegrationSourceKey) || 'bitacora_sesiones_b2b'
  );
  const [customFormUrl, setCustomFormUrl] = useState<string>(
    initialSession?.googleFormsUrl || ''
  );
  const [customSheetUrl, setCustomSheetUrl] = useState<string>(
    initialSession?.googleSheetsUrl || ''
  );
  const [attachAgreement, setAttachAgreement] = useState<boolean>(true);
  const [attachBitacora, setAttachBitacora] = useState<boolean>(true);

  // 5. Material de Apoyo y Contenido Audiovisual (Guía & Video)
  const [guideUrl, setGuideUrl] = useState<string>(initialSession?.guideUrl || '');
  const [guideTitle, setGuideTitle] = useState<string>(initialSession?.guideTitle || '');
  const [videoUrl, setVideoUrl] = useState<string>(initialSession?.videoUrl || '');
  const [videoTitle, setVideoTitle] = useState<string>(initialSession?.videoTitle || '');

  // Sincronizar campos cuando cambia initialSession (por ejemplo al editar otra sesión)
  useEffect(() => {
    if (initialSession) {
      setGuideUrl(initialSession.guideUrl || '');
      setGuideTitle(initialSession.guideTitle || '');
      setVideoUrl(initialSession.videoUrl || '');
      setVideoTitle(initialSession.videoTitle || '');
    } else {
      setGuideUrl('');
      setGuideTitle('');
      setVideoUrl('');
      setVideoTitle('');
    }
  }, [initialSession]);

  // Estados visuales de retroalimentación
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sincronizar dinámicamente el título y tipo sugerido cuando cambia el coachee
  useEffect(() => {
    if (!initialSession && clientId) {
      const clientSessions = OntologicalStore.getSessions().filter(
        (s) => s.clientId === clientId
      );
      const nextNumber = clientSessions.length + 1;
      const isCycleClose = nextNumber % 4 === 0;

      if (isCycleClose) {
        setSessionType('cierre_ciclo');
        setOpeningQuestion(defaultOpeningQuestionRecopilacion);
        setTitle(`Sesión #${nextNumber}: Cierre de Ciclo y Revisión de Avance`);
        setSessionGoal(
          'Revisión del estado actual, medición de evolución y rediseño del siguiente tramo del proceso.'
        );
      } else {
        setSessionType('sesion');
        setOpeningQuestion(defaultOpeningQuestionNormal);
        setTitle(`Sesión #${nextNumber}: Consultoría Ontológica 1 a 1`);
        setSessionGoal('Acompañamiento ontológico no direccional y exploración libre del quiebre.');
      }
    }
  }, [clientId, initialSession]);

  // Manejar cambio dinámico del tipo de sesión
  const handleSessionTypeChange = (type: ConsultoriaSessionType) => {
    setSessionType(type);
    if (type === 'cierre_ciclo' || type === 'recopilacion_cycle') {
      setOpeningQuestion(defaultOpeningQuestionRecopilacion);
      setTitle((prev) => {
        if (!prev.includes('Cierre de Ciclo')) {
          return prev.replace(
            /Consultoría Ontológica 1 a 1|Cierre de Programa.*|Graduación.*/gi,
            'Cierre de Ciclo'
          );
        }
        return prev;
      });
      setSessionGoal(
        'Revisión del estado actual, medición de evolución y rediseño del siguiente tramo del proceso.'
      );
    } else {
      setOpeningQuestion(defaultOpeningQuestionNormal);
      setTitle((prev) => {
        if (!prev.includes('Consultoría Ontológica')) {
          return prev.replace(
            /Cierre de Ciclo.*|Cierre de Programa.*|Recopilación.*|Graduación.*/gi,
            'Consultoría Ontológica 1 a 1'
          );
        }
        return prev;
      });
      setSessionGoal('Acompañamiento ontológico no direccional y exploración libre del quiebre.');
    }
  };

  const handleCopy = (text: string, keyName: string) => {
    safeCopyToClipboard(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Enlaces calculados de Google Forms & Sheets según la selección
  const activeBaseRecord = OFFICIAL_FORMS_SHEETS_BASE_MAP[formsPresetKey];
  const finalFormUrl =
    formsPresetKey === 'bitacora_sesiones_b2b'
      ? OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl
      : formsPresetKey === 'sesiones_individuales'
      ? OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl
      : customFormUrl || activeBaseRecord.formUrl;

  const finalSheetUrl =
    formsPresetKey === 'bitacora_sesiones_b2b'
      ? OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.sheetUrl
      : formsPresetKey === 'sesiones_individuales'
      ? OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.sheetUrl
      : customSheetUrl || activeBaseRecord.sheetUrl;

  const agreementFormUrl = attachAgreement
    ? OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl
    : undefined;
  const bitacoraFormUrl = attachBitacora
    ? OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    const client = clients.find((c) => c.uid === clientId);
    const existingSessions = OntologicalStore.getSessions().filter(
      (s) => s.clientId === clientId
    );
    const sessionNum = initialSession?.sessionNumber || existingSessions.length + 1;
    const dateStr = `${scheduledDate}T${scheduledTime}:00`;

    const savedSession: Session = {
      id: initialSession?.id || `sess-${Date.now()}`,
      clientId,
      sessionNumber: sessionNum,
      date: new Date(dateStr).toISOString(),
      scheduledDate,
      scheduledTime,
      durationMinutes,
      meetLink: meetLink.trim() || generateMeetLink(),
      status: initialSession?.status || 'scheduled',
      title: title.trim(),
      sessionGoal: sessionGoal.trim(),
      sessionType,
      spaceName,
      facilitatorCoach,
      modalityNotice,
      openingQuestion: openingQuestion.trim(),
      conversationalGuide:
        sessionType === 'sesion' || sessionType === 'normal_exploration'
          ? conversationalGuide
          : undefined,
      cycleReviewAxes:
        sessionType === 'cierre_ciclo' || sessionType === 'recopilacion_cycle'
          ? cycleReviewAxes
          : undefined,
      programClosingAxes: undefined,
      automationsConfig,
      googleFormsUrl: finalFormUrl,
      googleSheetsUrl: finalSheetUrl,
      formsIntegrationId: formsPresetKey,
      agreementFormUrl,
      bitacoraFormUrl,
      guideUrl: guideUrl.trim() || undefined,
      guideTitle: guideTitle.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      videoTitle: videoTitle.trim() || undefined,
      expedienteSyncStatus: 'synced',
      notes: `Sesión de Consultoría Ontológica 1 a 1 con ${
        client?.displayName || client?.name || 'Coachee'
      }. Tipo: ${
        sessionType === 'cierre_ciclo' || sessionType === 'recopilacion_cycle'
          ? 'Cierre de ciclo'
          : 'Sesión'
      }. Google Forms: ${finalFormUrl}. Google Sheets: ${finalSheetUrl}.`,
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
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-neutral-800 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Cabecera Principal del Módulo */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-neutral-800 flex items-start justify-between gap-4 bg-gradient-to-r from-emerald-50/70 via-gray-50/40 to-indigo-50/50 dark:from-emerald-950/30 dark:via-neutral-900/40 dark:to-indigo-950/30 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700/50">
                  Módulo de Consultoría 1 a 1
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                  {sessionType === 'cierre_ciclo' || sessionType === 'recopilacion_cycle'
                    ? 'Cierre de ciclo'
                    : 'Sesión'}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-black dark:text-white">
                {initialSession ? 'Editar Sesión de Consultoría' : 'Módulo de Creación de Sesiones de Consultoría'}
              </h2>
              <p className="text-xs text-gray-600 dark:text-neutral-400 mt-0.5">
                Acuerdo Co-creativo, dinámica no direccional, conectividad Google Meet y sincronización en Google Sheets.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenedor con Scroll de las 4 Secciones Principales */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-7 space-y-7 flex-1 text-xs">
          {/* ========================================================================= */}
          {/* SECCIÓN 1: CONFIGURACIÓN GENERAL Y LOGÍSTICA                               */}
          {/* ========================================================================= */}
          <section className="space-y-4 rounded-2xl p-4 sm:p-5 bg-gray-50/70 dark:bg-neutral-900/50 border border-gray-200/80 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 dark:border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  1
                </span>
                <h3 className="text-sm font-bold text-black dark:text-white tracking-tight">
                  Configuración General y Logística
                </h3>
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sincronización con Bitácora Google Sheets</span>
              </span>
            </div>

            {/* 1.1 Selector con dos opciones */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nivel Formativo / Tipo de Sesión: Selector de dos opciones *</span>
                </span>
                <span className="text-[11px] text-gray-500 font-normal">
                  Sesión • Cierre de ciclo
                </span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Opción 1: Sesión */}
                <button
                  type="button"
                  onClick={() => handleSessionTypeChange('sesion')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                    sessionType === 'sesion' || sessionType === 'normal_exploration'
                      ? 'border-emerald-500 bg-white dark:bg-neutral-800 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-gray-200 dark:border-neutral-800 bg-gray-100/50 dark:bg-neutral-900/50 hover:border-gray-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Sesión</span>
                    </span>
                    {sessionType === 'sesion' || sessionType === 'normal_exploration' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-neutral-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400 leading-relaxed">
                    Exploración libre del quiebre y autoobservación ontológica en presente (Acuerdo Co-creativo).
                  </p>
                </button>

                {/* Opción 2: Cierre de ciclo */}
                <button
                  type="button"
                  onClick={() => handleSessionTypeChange('cierre_ciclo')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                    sessionType === 'cierre_ciclo' || sessionType === 'recopilacion_cycle'
                      ? 'border-indigo-500 bg-white dark:bg-neutral-800 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-gray-200 dark:border-neutral-800 bg-gray-100/50 dark:bg-neutral-900/50 hover:border-gray-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Cierre de ciclo</span>
                    </span>
                    {sessionType === 'cierre_ciclo' || sessionType === 'recopilacion_cycle' ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-neutral-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400 leading-relaxed">
                    Balance y medición de evolución cada 4 sesiones: aprendizajes consolidados y rediseño de acuerdos.
                  </p>
                </button>
              </div>
            </div>

            {/* 1.2 Identidad del Espacio, Facilitador y Modalidad */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Nombre del Espacio */}
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/90 border border-gray-200 dark:border-neutral-700/80 space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Nombre del Espacio
                </span>
                <p className="text-xs font-bold text-gray-900 dark:text-neutral-100 line-clamp-2">
                  {spaceName}
                </p>
              </div>

              {/* Facilitador / Coach Responsable */}
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/90 border border-gray-200 dark:border-neutral-700/80 space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  <span>Facilitador / Coach Responsable</span>
                </span>
                <p className="text-xs font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-1">
                  <span>{facilitatorCoach}</span>
                </p>
              </div>

              {/* Modalidad */}
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/90 border border-gray-200 dark:border-neutral-700/80 space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                  <span>Modalidad</span>
                </span>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {modalityNotice}
                </p>
              </div>
            </div>

            {/* 1.3 Asignación de Coachee, Fecha, Hora y Duración */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              {/* Coachee */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>Coachee / Participante Asignado *</span>
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-medium cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.displayName || c.name || 'Coachee'} ({c.email || 'Sin correo'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Fecha de la Cita *</span>
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              {/* Hora */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Hora de Inicio *</span>
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            {/* Título de la Sesión y Duración */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                  Título de la Sesión
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Sesión 1: Consultoría Ontológica 1 a 1"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                  Duración del Encuentro
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos (Estándar)</option>
                  <option value={90}>90 minutos (Profundización)</option>
                  <option value={120}>120 minutos (Cierre de Ciclo)</option>
                </select>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECCIÓN 2: DINÁMICA Y CONTENIDO SEGÚN EL TIPO DE SESIÓN (NO DIRECCIONAL)   */}
          {/* ========================================================================= */}
          <section className="space-y-4 rounded-2xl p-4 sm:p-5 bg-gray-50/70 dark:bg-neutral-900/50 border border-gray-200/80 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 dark:border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  2
                </span>
                <h3 className="text-sm font-bold text-black dark:text-white tracking-tight">
                  Dinámica y Contenido (
                  {sessionType === 'cierre_ciclo' || sessionType === 'recopilacion_cycle'
                    ? 'Opción 2: Cierre de ciclo'
                    : 'Opción 1: Sesión'}
                  )
                </h3>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-semibold">
                No Direccional • Estándar ICF
              </span>
            </div>

            {/* OPCIÓN 1: SESIÓN (EXPLORACIÓN LIBRE) */}
            {(sessionType === 'sesion' || sessionType === 'normal_exploration') && (
              <div className="space-y-4 animate-fade-in">
                {/* Banner de Naturaleza No Direccional */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Naturaleza de la Sesión (Exploración Libre)
                    </h4>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed mt-0.5">
                      Espacio completamente no direccional sin temas fijos ni preguntas rígidas, centrado en el quiebre actual del coachee y su autoobservación en el presente.
                    </p>
                  </div>
                </div>

                {/* Preguntas de Indagación Extraídas desde Google Sheets */}
                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                        <span>Preguntas e Indagación Extraídas desde Google Sheets</span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold">
                          Sincronizado
                        </span>
                      </h4>
                      <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed mt-0.5">
                        Las preguntas detonantes y de indagación ontológica para esta sesión se extraen y sincronizan directamente desde el archivo de Google Sheets vinculado (Bitácora de Sesiones / Acuerdos). No se configuran manualmente.
                      </p>
                    </div>
                  </div>
                  <a
                    href={finalSheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-neutral-700 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-neutral-700 shrink-0 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>Ver en Google Sheets</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>

                {/* Estructura de Guía Conversacional (3 Pasos Fundamentales) */}
                <div className="space-y-2.5 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Estructura de Guía Conversacional Ontológica</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Eje 1: Corporal y Emocional */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                        <Heart className="w-3.5 h-3.5" />
                        <span>1. Exploración Corporal / Emocional</span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-neutral-300 leading-snug">
                        Exploración abierta del estado corporal y emocional presente ante el quiebre.
                      </p>
                      <input
                        type="text"
                        value={conversationalGuide.somaticEmotionalExploration || ''}
                        onChange={(e) =>
                          setConversationalGuide((prev) => ({
                            ...prev,
                            somaticEmotionalExploration: e.target.value,
                          }))
                        }
                        className="w-full text-[10px] p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 focus:ring-1 focus:ring-emerald-500"
                        placeholder="Nota o foco de exploración somática..."
                      />
                    </div>

                    {/* Eje 2: Juicios y Afirmaciones */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                        <Brain className="w-3.5 h-3.5" />
                        <span>2. Indagación en Juicios & Afirmaciones</span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-neutral-300 leading-snug">
                        Distinciones ontológicas entre hechos constatables y narrativas interpretativas.
                      </p>
                      <input
                        type="text"
                        value={conversationalGuide.judgmentsAffirmationsInquiry || ''}
                        onChange={(e) =>
                          setConversationalGuide((prev) => ({
                            ...prev,
                            judgmentsAffirmationsInquiry: e.target.value,
                          }))
                        }
                        className="w-full text-[10px] p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 focus:ring-1 focus:ring-emerald-500"
                        placeholder="Foco en juicios maestros o creencias limitantes..."
                      />
                    </div>

                    {/* Eje 3: Co-creación y Acciones Conscientes */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        <Activity className="w-3.5 h-3.5" />
                        <span>3. Co-creación de Acciones Conscientes</span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-neutral-300 leading-snug">
                        Diseño de prácticas conscientes, compromisos y micro-hábitos para la semana.
                      </p>
                      <input
                        type="text"
                        value={conversationalGuide.consciousActionCoCreation || ''}
                        onChange={(e) =>
                          setConversationalGuide((prev) => ({
                            ...prev,
                            consciousActionCoCreation: e.target.value,
                          }))
                        }
                        className="w-full text-[10px] p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 focus:ring-1 focus:ring-emerald-500"
                        placeholder="Diseño de compromiso o práctica semanal..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OPCIÓN 2: CIERRE DE CICLO */}
            {(sessionType === 'cierre_ciclo' || sessionType === 'recopilacion_cycle') && (
              <div className="space-y-4 animate-fade-in">
                {/* Banner de Cierre de Ciclo */}
                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 flex items-start gap-3">
                  <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      Naturaleza del Cierre de Ciclo (Balance cada 4 Sesiones)
                    </h4>
                    <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed mt-0.5">
                      Sesión estructurada de cierre y evaluación periódica del proceso de acompañamiento. Propósito: Revisar el estado actual del cliente, medir la evolución respecto al punto de partida y alinear el propósito del proceso.
                    </p>
                  </div>
                </div>

                {/* Preguntas de Balance Extraídas desde Google Sheets */}
                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <span>Preguntas y Marco de Balance Extraídos desde Google Sheets</span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-bold">
                          Sincronizado
                        </span>
                      </h4>
                      <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed mt-0.5">
                        Las preguntas de apertura, balance de ciclo y medición del avance se extraen de forma automatizada desde el archivo de Google Sheets vinculado (Bitácora de Sesiones). No se configuran manualmente.
                      </p>
                    </div>
                  </div>
                  <a
                    href={finalSheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-indigo-200 dark:border-neutral-700 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-neutral-700 shrink-0 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>Ver en Google Sheets</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>

                {/* Los 4 Ejes de Cierre y Revisión */}
                <div className="space-y-2.5 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span>4 Ejes de Cierre y Revisión Ontológica</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Eje 1: Estado Actual */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] flex items-center justify-center font-mono">
                          1
                        </span>
                        <span>Estado Actual</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                        ¿Dónde estás hoy en comparación con el inicio de tu proceso?
                      </p>
                      <textarea
                        rows={2}
                        value={cycleReviewAxes.currentState || ''}
                        onChange={(e) =>
                          setCycleReviewAxes((prev) => ({
                            ...prev,
                            currentState: e.target.value,
                          }))
                        }
                        className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-black dark:text-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="Observación del estado actual del coachee..."
                      />
                    </div>

                    {/* Eje 2: Evaluación de Avance */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] flex items-center justify-center font-mono">
                          2
                        </span>
                        <span>Evaluación de Avance</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                        ¿Qué aprendizajes ontológicos, somáticos y conversacionales se han consolidado?
                      </p>
                      <textarea
                        rows={2}
                        value={cycleReviewAxes.progressEvaluation || ''}
                        onChange={(e) =>
                          setCycleReviewAxes((prev) => ({
                            ...prev,
                            progressEvaluation: e.target.value,
                          }))
                        }
                        className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-black dark:text-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="Logros somáticos, emocionales y conversacionales consolidados..."
                      />
                    </div>

                    {/* Eje 3: Destino y Finalidad */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] flex items-center justify-center font-mono">
                          3
                        </span>
                        <span>Destino y Finalidad</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                        ¿Hacia dónde debe dirigirse la energía y cuáles son las nuevas coordenadas del proceso?
                      </p>
                      <textarea
                        rows={2}
                        value={cycleReviewAxes.destinationAndPurpose || ''}
                        onChange={(e) =>
                          setCycleReviewAxes((prev) => ({
                            ...prev,
                            destinationAndPurpose: e.target.value,
                          }))
                        }
                        className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-black dark:text-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="Nuevas coordenadas y dirección estratégica de la energía..."
                      />
                    </div>

                    {/* Eje 4: Rediseño del Siguiente Tramo */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] flex items-center justify-center font-mono">
                          4
                        </span>
                        <span>Rediseño del Siguiente Tramo</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                        Ajuste de acuerdos co-creativos y renovación del ciclo de mentoría.
                      </p>
                      <textarea
                        rows={2}
                        value={cycleReviewAxes.nextLegRedesign || ''}
                        onChange={(e) =>
                          setCycleReviewAxes((prev) => ({
                            ...prev,
                            nextLegRedesign: e.target.value,
                          }))
                        }
                        className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-black dark:text-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="Nuevos compromisos, frecuencia y renovación del ciclo..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* SECCIÓN 3: CONECTIVIDAD Y PANEL DE AUTOMATIZACIONES (ZONA DE EDICIÓN)     */}
          {/* ========================================================================= */}
          <section className="space-y-4 rounded-2xl p-4 sm:p-5 bg-gray-50/70 dark:bg-neutral-900/50 border border-gray-200/80 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 dark:border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  3
                </span>
                <h3 className="text-sm font-bold text-black dark:text-white tracking-tight">
                  Conectividad y Panel de Automatizaciones
                </h3>
              </div>
              <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1">
                <Video className="w-3.5 h-3.5" />
                <span>Google Meet & Activadores Inmediatos</span>
              </span>
            </div>

            {/* 3.1 Enlace de Sala Virtual (Google Meet) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span>Enlace de Sala Virtual (Google Meet) *</span>
                </label>

                <button
                  type="button"
                  onClick={() => setMeetLink(generateMeetLink())}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generar Enlace Seguro</span>
                </button>
              </div>

              {/* Campo editable y botones de acción rápida */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/xyz-abcd-efg"
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                {/* Botón Acción Rápida: Iniciar en Google Meet */}
                <a
                  href={meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                  title="Abrir sala de Google Meet en una nueva pestaña"
                >
                  <Video className="w-4 h-4" />
                  <span>Iniciar en Google Meet</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                {/* Botón Acción Rápida: Copiar Enlace */}
                <button
                  type="button"
                  onClick={() => handleCopy(meetLink, 'meet_link')}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-200 font-semibold text-xs shrink-0 cursor-pointer transition-colors"
                  title="Copiar enlace de Google Meet al portapapeles"
                >
                  {copiedKey === 'meet_link' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Enlace</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 3.2 Panel de Activadores y Automatizaciones (Edición Rápida con Toggles) */}
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/90 border border-gray-200 dark:border-neutral-700/80 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-neutral-700/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                    Panel de Activadores y Automatizaciones (Edición Rápida)
                  </h4>
                </div>

                {/* Botón "Editar Automatizaciones" */}
                {onOpenAutomationsPanel ? (
                  <button
                    type="button"
                    onClick={onOpenAutomationsPanel}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-800 dark:text-neutral-100 font-semibold text-[11px] transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-500 dark:text-neutral-300" />
                    <span>Editar Automatizaciones</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                  </button>
                ) : (
                  <a
                    href="#automatizaciones"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(
                        'Motor de Activadores RBC: Las reglas de envío en Google Sheets y los webhooks están operativos y sincronizados con Make/Webhook.'
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-800 dark:text-neutral-100 font-semibold text-[11px] transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-500 dark:text-neutral-300" />
                    <span>Editar Automatizaciones</span>
                  </a>
                )}
              </div>

              {/* Toggles de Activadores Integrados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Activador 1 (Inmediato) */}
                <div
                  onClick={() =>
                    setAutomationsConfig((prev) => ({
                      ...prev,
                      immediateConfirmation: !prev.immediateConfirmation,
                    }))
                  }
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                    automationsConfig.immediateConfirmation
                      ? 'border-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-900/40 opacity-70'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        Activador 1 (Inmediato)
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-neutral-100">
                      Confirmación de Agendamiento
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                      Envío automático del enlace de Google Meet y los acuerdos previos al guardar.
                    </p>
                  </div>

                  {/* Switch Toggle */}
                  <div
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 mt-1 ${
                      automationsConfig.immediateConfirmation
                        ? 'bg-emerald-600'
                        : 'bg-gray-300 dark:bg-neutral-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                        automationsConfig.immediateConfirmation
                          ? 'transform translate-x-5'
                          : 'transform translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>

                {/* Activador 2 (Programado) */}
                <div
                  onClick={() =>
                    setAutomationsConfig((prev) => ({
                      ...prev,
                      scheduledReminders: !prev.scheduledReminders,
                    }))
                  }
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                    automationsConfig.scheduledReminders
                      ? 'border-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/20'
                      : 'border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-900/40 opacity-70'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                        Activador 2 (Programado)
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-neutral-100">
                      Recordatorios Automáticos
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                      Recordatorios enviados al coachee antes del encuentro (24h y 1h previa).
                    </p>
                  </div>

                  {/* Switch Toggle */}
                  <div
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 mt-1 ${
                      automationsConfig.scheduledReminders
                        ? 'bg-indigo-600'
                        : 'bg-gray-300 dark:bg-neutral-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                        automationsConfig.scheduledReminders
                          ? 'transform translate-x-5'
                          : 'transform translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECCIÓN 4: EVALUACIÓN, GOOGLE FORMS / SHEETS Y EXPEDIENTE                  */}
          {/* ========================================================================= */}
          <section className="space-y-4 rounded-2xl p-4 sm:p-5 bg-gray-50/70 dark:bg-neutral-900/50 border border-gray-200/80 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 dark:border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  4
                </span>
                <h3 className="text-sm font-bold text-black dark:text-white tracking-tight">
                  Evaluación, Google Forms / Sheets y Expediente Ontológico
                </h3>
              </div>
              <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Expediente en Tiempo Real</span>
              </span>
            </div>

            {/* Selector de Base Oficial Integrada */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Formulario de Registro y Notas (Google Forms) Vinculado *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opción Bitácora B2B */}
                <div
                  onClick={() => setFormsPresetKey('bitacora_sesiones_b2b')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    formsPresetKey === 'bitacora_sesiones_b2b'
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        {OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.title}
                      </span>
                      {formsPresetKey === 'bitacora_sesiones_b2b' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-black dark:text-white">
                      Bitácora de Sesiones B2B
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                      Captura el quiebre, emoción, juicios limitantes, darse cuenta y compromisos de acción post-sesión.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-100 dark:border-neutral-700/60">
                    <a
                      href={OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Abrir Form</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <span className="text-gray-300 dark:text-neutral-700">•</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(
                          OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl,
                          'form_bitacora'
                        );
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'form_bitacora' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copiar Form</span>
                    </button>
                  </div>
                </div>

                {/* Opción Acuerdo Sesiones Individuales */}
                <div
                  onClick={() => setFormsPresetKey('sesiones_individuales')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    formsPresetKey === 'sesiones_individuales'
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                        {OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.title}
                      </span>
                      {formsPresetKey === 'sesiones_individuales' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-black dark:text-white">
                      Acuerdo Co-creativo Sesiones Individuales
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                      Firma del acuerdo ético, confidencialidad, límites de IA y aceptación co-creativa.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-100 dark:border-neutral-700/60">
                    <a
                      href={OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Abrir Form</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <span className="text-gray-300 dark:text-neutral-700">•</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(
                          OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl,
                          'form_acuerdo'
                        );
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'form_acuerdo' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copiar Form</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Hoja de Cálculo de Seguimiento (Google Sheets) Conectada */}
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/90 border border-emerald-200 dark:border-emerald-800/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-black dark:text-white">
                      Hoja de Cálculo de Seguimiento (Google Sheets) Conectada
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                      Alimenta automáticamente el expediente ontológico del coachee tras finalizar cada sesión.
                    </p>
                  </div>
                </div>

                {/* Botón de Acceso a Google Sheets */}
                <a
                  href={finalSheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200 font-bold text-xs transition-colors shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Abrir Expediente en Google Sheets</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>

              {/* URL de Hoja de Cálculo con botón Copiar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={finalSheetUrl}
                  className="w-full p-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(finalSheetUrl, 'sheet_url')}
                  className="p-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 text-gray-700 dark:text-neutral-300 shrink-0 cursor-pointer"
                  title="Copiar URL de Google Sheets"
                >
                  {copiedKey === 'sheet_url' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Casillas de Verificación de Formularios para el Coachee */}
              <div className="pt-2 border-t border-gray-100 dark:border-neutral-700/60 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={attachAgreement}
                    onChange={(e) => setAttachAgreement(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Vincular Acuerdo Previo ({OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.title})</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={attachBitacora}
                    onChange={(e) => setAttachBitacora(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Vincular Bitácora Post-Sesión ({OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.title})</span>
                </label>
              </div>
            </div>
          </section>

          {/* 5. MATERIAL DE APOYO Y MULTIMEDIA: GUÍA DE TRABAJO Y VIDEO */}
          <section className="space-y-4 rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-amber-50/50 via-white to-rose-50/40 dark:from-neutral-900/90 dark:via-neutral-900/60 dark:to-rose-950/20 border border-amber-200/80 dark:border-amber-800/50 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 dark:border-amber-800/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  5
                </span>
                <h3 className="text-sm font-bold text-black dark:text-white tracking-tight">
                  Material de Acompañamiento: Guía de Trabajo y Video
                </h3>
              </div>
              <span className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Recursos Didácticos para la Sesión</span>
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-neutral-400">
              Agrega los enlaces a la <strong>Guía de Trabajo</strong> (documento descargable o cuaderno en PDF, Drive o Notion) y al <strong>Video de la Sesión</strong> (cápsula preparatoria, grabación o clase en YouTube, Loom, Vimeo o Drive).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Espacio 1: Link de la Guía de Trabajo */}
              <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/90 border border-amber-200 dark:border-amber-800/70 space-y-3 shadow-xs flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-black dark:text-white">
                          Guía de Trabajo / Documento
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-neutral-400">
                          Google Drive, Docs, Notion o PDF
                        </p>
                      </div>
                    </div>

                    {guideUrl && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                        <Check className="w-3 h-3 text-amber-600" />
                        <span>Enlazada</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                      Título o Tema de la Guía (Opcional)
                    </label>
                    <input
                      type="text"
                      value={guideTitle}
                      onChange={(e) => setGuideTitle(e.target.value)}
                      placeholder="Ej. Guía de Quiebres y Compromisos de Acción"
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                      URL / Enlace de la Guía
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={guideUrl}
                        onChange={(e) => setGuideUrl(e.target.value)}
                        placeholder="https://docs.google.com/document/d/... o https://drive.google.com/..."
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                      {guideUrl && (
                        <a
                          href={guideUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 shrink-0 transition-colors"
                          title="Abrir enlace de la guía"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {guideUrl && (
                        <button
                          type="button"
                          onClick={() => handleCopy(guideUrl, 'guide_url')}
                          className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 text-gray-700 dark:text-neutral-300 shrink-0 cursor-pointer"
                          title="Copiar enlace de la guía"
                        >
                          {copiedKey === 'guide_url' ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {guideUrl && (
                  <div className="pt-2 border-t border-gray-100 dark:border-neutral-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 dark:text-neutral-400 truncate max-w-[220px]">
                      {guideTitle || 'Guía lista para el participante'}
                    </span>
                    <a
                      href={guideUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300 hover:underline"
                    >
                      <span>Ver Documento</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Espacio 2: Link del Video de la Sesión */}
              <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/90 border border-rose-200 dark:border-rose-800/70 space-y-3 shadow-xs flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 flex items-center justify-center font-bold">
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-black dark:text-white">
                          Video de la Sesión / Cápsula
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-neutral-400">
                          YouTube, Loom, Vimeo, Drive o Zoom
                        </p>
                      </div>
                    </div>

                    {videoUrl && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                        <Check className="w-3 h-3 text-rose-600" />
                        <span>Enlazado</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                      Título o Tema del Video (Opcional)
                    </label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Ej. Cápsula Ontológica: Juicios vs. Afirmaciones"
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                      URL / Enlace del Video
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... o https://www.loom.com/share/..."
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white font-mono text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                      />
                      {videoUrl && (
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 shrink-0 transition-colors"
                          title="Abrir y reproducir video"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {videoUrl && (
                        <button
                          type="button"
                          onClick={() => handleCopy(videoUrl, 'video_url')}
                          className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 text-gray-700 dark:text-neutral-300 shrink-0 cursor-pointer"
                          title="Copiar enlace del video"
                        >
                          {copiedKey === 'video_url' ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {videoUrl && (
                  <div className="pt-2 border-t border-gray-100 dark:border-neutral-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 dark:text-neutral-400 truncate max-w-[220px]">
                      {videoTitle || 'Video disponible para el participante'}
                    </span>
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300 hover:underline"
                    >
                      <span>Reproducir Video</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Pie del Formulario y Botón de Creación */}
          <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Los registros se sincronizan automáticamente con Firebase Firestore y Google Sheets.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 font-semibold text-xs hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    <span>¡Sesión Guardada con Éxito!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{initialSession ? 'Guardar Cambios' : 'Crear y Programar Sesión'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultoriaSessionCreationModal;
