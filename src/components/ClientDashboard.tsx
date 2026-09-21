import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Video,
  Download,
  FileText,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  Sparkles,
  Clock,
  Layers,
  BookOpen,
  Circle,
  Compass,
  Award,
  BookMarked,
  ShieldCheck,
  Check,
  CreditCard,
  Smartphone,
  Copy,
  Lock,
  ExternalLink,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  Eye,
  Brain,
} from 'lucide-react';
import { User, Session, PostSessionForm, CronogramaEvent, ProgramNodeInfo } from '../types';
import { OntologicalStore, COMPANY_INFO, PROGRAM_NODES, BRE_B_NU_CONFIG } from '../services/store';
import { getEmailAvatarUrl } from '../utils/avatar';
import { FirestoreSyncService } from '../services/firestoreSync';
import { PDFGenerator } from '../utils/pdfGenerator';
import { safeCopyToClipboard } from '../utils/clipboard';
import { PostSessionWorkbookModal } from './PostSessionWorkbookModal';
import { ParticipantTemarioSyllabus } from './dashboard/ParticipantTemarioSyllabus';
import { ParticipantTalleresModule, CoreWorkshopTrack } from './dashboard/ParticipantTalleresModule';
import { CORE_WORKSHOPS_CATALOG as CORE_WORKSHOPS } from '../data/coreWorkshopsCatalog';
import { ParticipantSesionesModule } from './dashboard/ParticipantSesionesModule';
import { ParticipantIntegracionesModule } from './dashboard/ParticipantIntegracionesModule';
import { TemarioSyllabusItem } from '../data/temarioOntologico';
import { CURATED_EXPERIENCE_PHOTOS } from '../data/initialExperiences';
import { OFFICIAL_FORMS_SHEETS_BASE_MAP, OFFICIAL_FORMS_SHEETS_BASE_LIST } from '../data/officialFormsSheetsBase';
import coachAvatarImg from '../assets/images/regenerated_image_1788287101599.jpg';
import whiteWavesBg from '../assets/images/white_waves_bg_1788461168119.jpg';
import { PromotionalEventBanner } from './PromotionalEventBanner';

interface ClientDashboardProps {
  client: User;
  onLogout?: () => void;
  onUserUpdated?: () => void;
  onViewSessionForm?: (session: Session) => void;
  onOpenDiagnosticWorkspace?: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  client,
  onLogout,
  onUserUpdated,
}) => {
  // Estado local sincronizado del usuario
  const [activeUser, setActiveUser] = useState<User>(client);

  useEffect(() => {
    setActiveUser(client);
  }, [client]);

  // Tab activo de navegación del panel de clientes
  const [dashboardTab, setDashboardTab] = useState<
    'resumen' | 'talleres' | 'sesiones' | 'integraciones' | 'temario'
  >('resumen');

  // Estados de datos sincronizados con Store y Firestore
  const [sessions, setSessions] = useState<Session[]>(() =>
    OntologicalStore.getSessionsForClient(client.uid)
  );
  const [postForms, setPostForms] = useState<PostSessionForm[]>(() =>
    OntologicalStore.getPostSessionFormsForClient(client.uid)
  );
  const [cronogramaEvents, setCronogramaEvents] = useState<CronogramaEvent[]>(() =>
    OntologicalStore.getCronogramaEvents()
  );

  // Estado de navegación del Temario Ontológico (Syllabus de lectura)
  const [selectedTemarioItemId, setSelectedTemarioItemId] = useState<string>(() => {
    if (client.programProgress && client.programProgress > 1) {
      return `station-${client.programProgress}`;
    }
    return 'workshop-1-raiz';
  });

  // Modal para edición/registro de bitácora
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeSessionForModal, setActiveSessionForModal] = useState<Session | null>(null);

  // Estado de descarga de PDF con confirmación visual
  const [downloadToastMessage, setDownloadToastMessage] = useState<string | null>(null);

  // Estado de expansión del módulo de talleres
  const [isTalleresModuleExpanded, setIsTalleresModuleExpanded] = useState<boolean>(true);
  const [selectedWorkshopTrackId, setSelectedWorkshopTrackId] = useState<string>('taller-1-raiz');

  // Estado de copiado de llave de pago Bre-B Nu
  const [copiedPaymentKey, setCopiedPaymentKey] = useState(false);
  const handleCopyPaymentKey = async () => {
    await safeCopyToClipboard(BRE_B_NU_CONFIG.llave);
    setCopiedPaymentKey(true);
    setTimeout(() => setCopiedPaymentKey(false), 2500);
  };

  // Sincronización en tiempo real (Local Store + Firestore)
  useEffect(() => {
    const reloadData = () => {
      const currentSessions = OntologicalStore.getSessionsForClient(activeUser.uid);
      const currentForms = OntologicalStore.getPostSessionFormsForClient(activeUser.uid);
      const currentEvents = OntologicalStore.getCronogramaEvents();
      const updatedUser = OntologicalStore.getUsers().find((u) => u.uid === activeUser.uid);

      setSessions(currentSessions);
      setPostForms(currentForms);
      setCronogramaEvents(currentEvents);
      if (updatedUser) {
        setActiveUser(updatedUser);
      }
    };

    window.addEventListener('rbc-sessions-updated', reloadData);
    window.addEventListener('rbc-forms-updated', reloadData);
    window.addEventListener('rbc-workshops-updated', reloadData);
    window.addEventListener('rbc-user-updated', reloadData);
    window.addEventListener('storage', reloadData);

    // Suscripciones activas en tiempo real a Google Cloud Firestore
    const unsubSessions = FirestoreSyncService.subscribeToClientSessions(
      activeUser.uid,
      (syncedSessions) => {
        if (Array.isArray(syncedSessions) && syncedSessions.length > 0) {
          setSessions(syncedSessions);
        }
      }
    );

    const unsubForms = FirestoreSyncService.subscribeToClientPostForms(
      activeUser.uid,
      (syncedForms) => {
        if (Array.isArray(syncedForms) && syncedForms.length > 0) {
          setPostForms(syncedForms);
        }
      }
    );

    const unsubProfile = FirestoreSyncService.subscribeToUserProfile(
      activeUser.uid,
      (syncedProfile) => {
        if (syncedProfile) {
          setActiveUser(syncedProfile);
        }
      }
    );

    const unsubEvents = FirestoreSyncService.subscribeToCronogramaEvents((syncedEvents) => {
      if (Array.isArray(syncedEvents) && syncedEvents.length > 0) {
        setCronogramaEvents(syncedEvents);
      }
    });

    return () => {
      window.removeEventListener('rbc-sessions-updated', reloadData);
      window.removeEventListener('rbc-forms-updated', reloadData);
      window.removeEventListener('rbc-workshops-updated', reloadData);
      window.removeEventListener('rbc-user-updated', reloadData);
      window.removeEventListener('storage', reloadData);
      unsubSessions();
      unsubForms();
      unsubProfile();
      unsubEvents();
    };
  }, [activeUser.uid]);

  // Cálculo del momento actual y ciclo del usuario
  const currentSessionNumber = activeUser.programProgress || 1;
  const currentCycle = Math.ceil(currentSessionNumber / 4); // Ciclo 1 (1-4), Ciclo 2 (5-8), Ciclo 3 (9-12)
  const isCycleMilestone =
    currentSessionNumber === 4 || currentSessionNumber === 8 || currentSessionNumber === 12;

  const cyclePhaseLabel = isCycleMilestone
    ? 'Fase de Consolidación • Cierre de Ciclo'
    : 'Fase de Exploración Libre';

  // Obtener acento sutil según el ciclo
  const getCycleAccent = (cycle: number) => {
    switch (cycle) {
      case 1:
        return {
          name: 'emerald',
          text: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-500',
          border: 'border-emerald-500/30',
          softBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
          borderLeft: 'border-l-emerald-500',
          dot: 'bg-emerald-500',
          badgeText: 'text-emerald-700 dark:text-emerald-300',
        };
      case 2:
        return {
          name: 'amber',
          text: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500',
          border: 'border-amber-500/30',
          softBg: 'bg-amber-500/10 dark:bg-amber-500/15',
          borderLeft: 'border-l-amber-500',
          dot: 'bg-amber-500',
          badgeText: 'text-amber-700 dark:text-amber-300',
        };
      case 3:
      default:
        return {
          name: 'indigo',
          text: 'text-indigo-600 dark:text-indigo-400',
          bg: 'bg-indigo-500',
          border: 'border-indigo-500/30',
          softBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
          borderLeft: 'border-l-indigo-500',
          dot: 'bg-indigo-500',
          badgeText: 'text-indigo-700 dark:text-indigo-300',
        };
    }
  };

  const activeCycleAccent = getCycleAccent(currentCycle);

  // Sesión actual
  const currentSession: Session = useMemo(() => {
    const found = sessions.find((s) => s.sessionNumber === currentSessionNumber);
    if (found) return found;

    return {
      id: `sess-${activeUser.uid}-${currentSessionNumber}`,
      sessionNumber: currentSessionNumber,
      clientId: activeUser.uid,
      clientName: activeUser.name,
      date: new Date().toISOString(),
      status: 'scheduled',
      durationMinutes: 60,
      meetLink: `https://meet.google.com/rbc-${(activeUser.name || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${currentSessionNumber}`,
      notes: isCycleMilestone
        ? 'Cierre de ciclo: integración de descubrimientos, patrones recurrentes y cambios de perspectiva observados.'
        : 'Pregunta de apertura: "¿Qué es importante para ti traer a este espacio hoy?". Espacio abierto al emergente.',
      keyInsights: [],
      actionAgreements: [],
      somaticFocus: '',
      programNodeStep: currentSessionNumber,
      googleSheetsUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.sheetUrl,
      googleFormsUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl,
      agreementFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl,
      agreementSheetUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.sheetUrl,
      bitacoraFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl,
      bitacoraSheetUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.sheetUrl,
      formsIntegrationId: 'bitacora_sesiones_b2b',
      expedienteSyncStatus: 'synced',
    };
  }, [sessions, currentSessionNumber, activeUser, isCycleMilestone]);

  // Cuestionario asociado a la sesión activa
  const currentPostForm: PostSessionForm | undefined = useMemo(() => {
    return (
      postForms.find((f) => f.sessionId === currentSession.id) ||
      postForms.find((f) => f.sessionNumber === currentSessionNumber)
    );
  }, [postForms, currentSession.id, currentSessionNumber]);

  // Fotografía a color curada según el ciclo
  const currentPhoto = useMemo(() => {
    if (currentSessionNumber === 4 || currentSessionNumber === 8) {
      return CURATED_EXPERIENCE_PHOTOS[2]; // Florecimiento (Cierre de ciclo)
    }
    if (currentSessionNumber >= 9) {
      return CURATED_EXPERIENCE_PHOTOS[5]; // Montaña y horizonte
    }
    if (currentSessionNumber >= 5) {
      return CURATED_EXPERIENCE_PHOTOS[1]; // Tallo lingüístico
    }
    return CURATED_EXPERIENCE_PHOTOS[0]; // Raíz somática y presencia
  }, [currentSessionNumber]);

  // Verificación de asistencia a talleres (por objeto o por identificador)
  const isWorkshopAttended = (wsOrId: CoreWorkshopTrack | string) => {
    const ws =
      typeof wsOrId === 'string'
        ? CORE_WORKSHOPS.find((w) => w.id === wsOrId || w.matchIds.includes(wsOrId))
        : wsOrId;

    if (!ws) {
      const idStr = typeof wsOrId === 'string' ? wsOrId : '';
      return (activeUser.completedWorkshopIds || []).includes(idStr);
    }

    const completedIds = activeUser.completedWorkshopIds || [];
    if (
      completedIds.some(
        (id) =>
          ws.matchIds.includes(id) || id.toLowerCase().includes(ws.stageName.toLowerCase())
      )
    ) {
      return true;
    }

    if (
      activeUser.workshopMemories &&
      (activeUser.workshopMemories[ws.id] ||
        Object.keys(activeUser.workshopMemories).some((k) => ws.matchIds.includes(k)))
    ) {
      return true;
    }

    const regFound = cronogramaEvents.some((evt) => {
      const isMatchingEvt = ws.matchIds.some(
        (id) =>
          evt.id.toLowerCase().includes(id) ||
          evt.title.toLowerCase().includes(ws.stageName.toLowerCase())
      );
      if (!isMatchingEvt) return false;
      const isUserSubmission = evt.workbookSubmissions?.some(
        (sub) =>
          sub.participantEmail?.toLowerCase() === activeUser.email.toLowerCase() ||
          sub.participantName?.toLowerCase() === activeUser.name.toLowerCase()
      );
      return isUserSubmission;
    });
    if (regFound) return true;

    // Progresión del programa
    if (ws.stageName === 'Raíz' && currentSessionNumber >= 4) return true;
    if (ws.stageName === 'Tallo' && currentSessionNumber >= 8) return true;
    if (ws.stageName === 'Florecimiento' && currentSessionNumber >= 12) return true;

    return false;
  };

  // Taller en curso seleccionado para el banner del participante
  const defaultDashboardWorkshopId = useMemo(() => {
    if (currentCycle === 1) return 'taller-1-raiz';
    if (currentCycle === 2) return 'taller-2-tallo';
    return 'taller-3-florecimiento';
  }, [currentCycle]);

  const [selectedDashboardWorkshopId, setSelectedDashboardWorkshopId] =
    useState<string>(defaultDashboardWorkshopId);

  useEffect(() => {
    setSelectedDashboardWorkshopId(defaultDashboardWorkshopId);
  }, [defaultDashboardWorkshopId]);

  const selectedWorkshopEvent = useMemo(() => {
    const found = cronogramaEvents.find((evt) => evt.id === selectedDashboardWorkshopId);
    if (found) return found;
    return (
      cronogramaEvents.find((evt) => evt.id === defaultDashboardWorkshopId) ||
      cronogramaEvents[0] ||
      OntologicalStore.getUpcomingEvent()
    );
  }, [cronogramaEvents, selectedDashboardWorkshopId, defaultDashboardWorkshopId]);

  // Obtención de respuestas y memorias del taller
  const getWorkshopMemoryDetails = (ws: CoreWorkshopTrack) => {
    const mem =
      activeUser.workshopMemories?.[ws.id] ||
      (activeUser.workshopMemories
        ? Object.entries(activeUser.workshopMemories).find(([k]) =>
            ws.matchIds.includes(k)
          )?.[1]
        : undefined);

    const matchingEvt = cronogramaEvents.find((evt) =>
      ws.matchIds.some(
        (id) =>
          evt.id.toLowerCase().includes(id) ||
          evt.title.toLowerCase().includes(ws.stageName.toLowerCase())
      )
    );
    const submission = matchingEvt?.workbookSubmissions?.find(
      (s) =>
        s.participantEmail?.toLowerCase() === activeUser.email.toLowerCase() ||
        s.participantName?.toLowerCase() === activeUser.name.toLowerCase()
    );

    return {
      completedAt: mem?.completedAt || submission?.submittedAt || ws.defaultDate,
      keyBreakthrough:
        mem?.keyBreakthrough ||
        (submission?.answers?.['quiebre_principal']
          ? String(submission.answers['quiebre_principal'])
          : ws.defaultBreakthrough),
      commitments:
        mem?.commitments ||
        (submission?.answers?.['compromisos']
          ? String(submission.answers['compromisos'])
          : ws.defaultCommitments),
      pdfUrl: mem?.pdfUrl,
      answers: submission?.answers,
    };
  };

  const handleDownloadWorkshopMemory = (ws: CoreWorkshopTrack) => {
    const details = getWorkshopMemoryDetails(ws);
    setDownloadToastMessage(`Preparando Memoria de Taller "${ws.title}" (PDF)...`);
    try {
      PDFGenerator.generateWorkshopMemoryPDF(ws.title, activeUser, {
        workshopCategory: ws.levelBadge,
        completedAt: details.completedAt,
        keyBreakthrough: details.keyBreakthrough,
        commitments: details.commitments,
        somaticPractice: ws.somaticPractice,
        answers: details.answers,
      });
      setTimeout(() => {
        setDownloadToastMessage('¡PDF de taller descargado correctamente!');
        setTimeout(() => setDownloadToastMessage(null), 3000);
      }, 600);
    } catch (err) {
      console.error('Error al generar PDF de taller:', err);
      setDownloadToastMessage('Error al generar el PDF. Intenta nuevamente.');
      setTimeout(() => setDownloadToastMessage(null), 3500);
    }
  };

  const handleDownloadWorkshopMemoryFromSyllabus = (item: TemarioSyllabusItem) => {
    const matchingTrack =
      CORE_WORKSHOPS.find(
        (w) => w.id === item.workshopId || w.matchIds.includes(item.workshopId || '')
      ) || CORE_WORKSHOPS[item.cycleNumber - 1];
    handleDownloadWorkshopMemory(matchingTrack);
  };

  const isWorkshopAttendedById = (workshopId: string, stageName: string) => {
    const ws = CORE_WORKSHOPS.find(
      (w) =>
        w.id === workshopId ||
        w.matchIds.includes(workshopId) ||
        w.stageName.toLowerCase() === stageName.toLowerCase()
    );
    if (!ws) return false;
    return isWorkshopAttended(ws);
  };

  const formatHumanDate = (dateStr?: string) => {
    if (!dateStr) return 'Próximamente por agendar';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleOpenBitacora = (sessionToEdit: Session) => {
    setActiveSessionForModal(sessionToEdit);
    setIsModalOpen(true);
  };

  const handleDownloadMemory = (form?: Partial<PostSessionForm> | null, sess?: Session) => {
    const targetSession = sess || currentSession;
    const effectiveForm =
      form ||
      postForms.find((f) => f.sessionNumber === targetSession.sessionNumber) ||
      (targetSession.sessionNumber === currentSessionNumber ? currentPostForm : null);

    setDownloadToastMessage(`Generando Bitácora de Sesión ${targetSession.sessionNumber} en formato PDF...`);
    try {
      PDFGenerator.generateSessionWorkbookPDF(effectiveForm, activeUser, targetSession);
      setTimeout(() => {
        setDownloadToastMessage(`¡Bitácora Sesión ${targetSession.sessionNumber} descargada en PDF!`);
        setTimeout(() => setDownloadToastMessage(null), 3000);
      }, 600);
    } catch (err) {
      console.error('Error al generar PDF de bitácora:', err);
      setDownloadToastMessage('Hubo un inconveniente al generar el PDF.');
      setTimeout(() => setDownloadToastMessage(null), 3500);
    }
  };

  // Contar talleres acreditados y sesiones completadas para el avance integral
  const accreditedWorkshopsCount = useMemo(() => {
    return CORE_WORKSHOPS.filter((w) => isWorkshopAttended(w)).length;
  }, [activeUser, cronogramaEvents, currentSessionNumber]);

  const completedSessionsCount = useMemo(() => {
    const completedExplicit = sessions.filter((s) => s.status === 'completed').length;
    const progressiveCount = Math.max(0, currentSessionNumber - 1);
    return Math.min(12, Math.max(completedExplicit, progressiveCount));
  }, [sessions, currentSessionNumber]);

  const totalJourneyItems = 12 + CORE_WORKSHOPS.length; // 12 sesiones + 3 talleres = 15 hitos totales
  const completedJourneyItems = completedSessionsCount + accreditedWorkshopsCount;
  const overallProgressPercentage = Math.min(
    100,
    Math.round((completedJourneyItems / totalJourneyItems) * 100)
  );

  return (
    <div className="relative isolate min-h-screen bg-transparent text-black dark:text-white font-sans antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Fondo escultural de ondas blancas de la aplicación */}
      <div
        className="fixed inset-0 pointer-events-none -z-50 overflow-hidden select-none bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${whiteWavesBg})` }}
      >
        {/* Velo de calibración óptica con transparencia graduada */}
        <div className="absolute inset-0 bg-white/60 dark:bg-neutral-950/75 backdrop-blur-[1px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-7">
        {/* ========================================================================= */}
        {/* 1. CABECERA LIMPIA: IDENTIFICACIÓN Y ANILLO INTEGRAL DE AVANCE            */}
        {/* ========================================================================= */}
        <header className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl p-6 sm:p-7 space-y-5 shadow-xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={getEmailAvatarUrl(activeUser.email, activeUser.name, activeUser.avatarUrl)}
                  alt={activeUser.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      activeUser.name
                    )}&background=111827&color=ffffff&size=256&bold=true`;
                  }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-black/15 dark:border-white/15 shrink-0 shadow-xs"
                />
                {/* Acento sutil de presencia */}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900 shadow-2xs" />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block font-mono">
                  Rengifo Basto Consultoría Ontológica
                </span>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-black dark:text-white">
                  Hola, {activeUser.name}
                </h1>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light">
                  Acompañamiento Individual 1 a 1 • Espacio confidencial y reflexivo
                </p>
              </div>
            </div>

            {/* Acción sobria en cabecera: Cerrar sesión */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-xl hover:bg-white/40 dark:hover:bg-neutral-900/40 border border-transparent hover:border-black/10 dark:hover:border-white/10"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>

          {/* BLOQUE CENTRAL UNIFICADO DE PROGRESO */}
          <div className="p-4 sm:p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/25 dark:bg-neutral-900/35 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`w-2 h-2 rounded-full ${activeCycleAccent.dot} shrink-0 animate-pulse`} />
              <span className="font-bold text-black dark:text-white text-xs sm:text-sm">
                Ciclo {currentCycle} de 3
              </span>
              <span className="text-neutral-400 dark:text-neutral-600">•</span>
              <span className="text-neutral-700 dark:text-neutral-300 font-medium text-xs sm:text-sm">
                Encuentro {currentSessionNumber} de 12
              </span>
              <span className="text-neutral-400 dark:text-neutral-600">•</span>
              <span className="font-semibold text-black dark:text-white">
                {cyclePhaseLabel}
              </span>
            </div>

            {/* LÍNEA CIRCULAR DE AVANCE DEL PROCESO COMPLETO (SESIONES + TALLERES) */}
            <div className="flex items-center gap-3 self-start md:self-auto pt-2.5 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/5">
              <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                <svg className="w-11 h-11 -rotate-90 transform" viewBox="0 0 44 44">
                  <circle
                    cx="22"
                    cy="22"
                    r="17"
                    className="text-black/10 dark:text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r="17"
                    className={`${activeCycleAccent.text} transition-all duration-700 ease-out`}
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 17}
                    strokeDashoffset={
                      2 * Math.PI * 17 - (2 * Math.PI * 17 * overallProgressPercentage) / 100
                    }
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-black dark:text-white">
                    {overallProgressPercentage}%
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Avance Integral
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-medium border ${activeCycleAccent.border} ${activeCycleAccent.softBg} ${activeCycleAccent.badgeText}`}
                  >
                    {isCycleMilestone ? '★ Cosecha del Ciclo' : 'Lienzo en Blanco'}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-300 font-mono">
                  <strong className="text-black dark:text-white font-semibold">
                    {completedJourneyItems} de {totalJourneyItems}
                  </strong>{' '}
                  hitos ({completedSessionsCount}/12 sesiones + {accreditedWorkshopsCount}/3 talleres)
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BARRA DE NAVEGACIÓN PRINCIPAL: PANELES DE TALLERES, SESIONES E INTEGRACIONES */}
          {/* ========================================================================= */}
          <nav aria-label="Secciones del Panel de Clientes" className="pt-2 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                {
                  id: 'resumen',
                  label: 'Resumen & Momento Actual',
                  icon: Sparkles,
                  badge: null,
                },
                {
                  id: 'talleres',
                  label: 'Paneles de Talleres Ontológicos',
                  icon: BookOpen,
                  badge: `${accreditedWorkshopsCount}/3`,
                },
                {
                  id: 'sesiones',
                  label: 'Paneles de Sesiones 1 a 1',
                  icon: Calendar,
                  badge: `${completedSessionsCount}/12`,
                },
                {
                  id: 'integraciones',
                  label: 'Formularios & Google Sheets',
                  icon: FileSpreadsheet,
                  badge: '4 Conectadas',
                },
                {
                  id: 'temario',
                  label: 'Temario & Syllabus',
                  icon: BookMarked,
                  badge: '12 Estaciones',
                },
              ].map(({ id, label, icon: Icon, badge }) => {
                const isSelected = dashboardTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDashboardTab(id as any)}
                    className={`px-3.5 py-2.5 rounded-2xl text-xs font-mono font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/40 dark:hover:bg-neutral-900/40 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                    {badge && (
                      <span
                        className={`text-[9px] px-2 py-0.2 rounded-full font-mono ${
                          isSelected
                            ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                            : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </header>

        {/* ========================================================================= */}
        {/* VISTA 1: RESUMEN Y MOMENTO ACTUAL                                         */}
        {/* ========================================================================= */}
        {dashboardTab === 'resumen' && (
          <div className="space-y-7">
            {/* 3 Tarjetas de Acceso Rápido a los nuevos Paneles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tarjeta 1: Talleres Ontológicos */}
              <button
                type="button"
                onClick={() => setDashboardTab('talleres')}
                className="p-5 rounded-3xl border border-black/10 dark:border-white/10 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl text-left hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">
                    {accreditedWorkshopsCount} de 3 Acreditados
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black dark:text-white font-mono uppercase tracking-wider">
                    Paneles de Talleres
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5 line-clamp-2">
                    Raíz, Tallo y Florecimiento • Salas Meet, formularios de inscripción y memorias en PDF.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-black dark:text-white font-bold group-hover:translate-x-1 transition-transform">
                  <span>Ver paneles de talleres</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              {/* Tarjeta 2: Sesiones 1 a 1 */}
              <button
                type="button"
                onClick={() => setDashboardTab('sesiones')}
                className="p-5 rounded-3xl border border-black/10 dark:border-white/10 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl text-left hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold">
                    {completedSessionsCount} de 12 Realizadas
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black dark:text-white font-mono uppercase tracking-wider">
                    Paneles de Sesiones
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5 line-clamp-2">
                    Las 12 estaciones reflexivas quincenales, enlaces Meet, acuerdos 1 a 1 y bitácoras B2B.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-black dark:text-white font-bold group-hover:translate-x-1 transition-transform">
                  <span>Ver todas las sesiones</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              {/* Tarjeta 3: Integraciones Formularios & Google Sheets */}
              <button
                type="button"
                onClick={() => setDashboardTab('integraciones')}
                className="p-5 rounded-3xl border border-black/10 dark:border-white/10 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl text-left hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                    4 Bases Oficiales
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black dark:text-white font-mono uppercase tracking-wider">
                    Formularios & Sheets
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5 line-clamp-2">
                    Expediente consolidado en vivo: acuerdos, bitácoras y hojas de respuestas auditadas.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-black dark:text-white font-bold group-hover:translate-x-1 transition-transform">
                  <span>Ver expediente Sheets</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            </div>

            {/* Banner Taller Ontológico en Curso */}
            <section id="banner-taller-en-curso" className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black dark:text-white font-mono">
                    Taller Ontológico en Curso • Espacio Vivencial Grupal
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 text-[11px] font-mono self-start sm:self-auto shadow-xs">
                  {[
                    { id: 'taller-1-raiz', cycle: 1, label: 'Raíz (Ciclo 1)' },
                    { id: 'taller-2-tallo', cycle: 2, label: 'Tallo (Ciclo 2)' },
                    { id: 'taller-3-florecimiento', cycle: 3, label: 'Florecimiento (Ciclo 3)' },
                  ].map(({ id, cycle, label }) => {
                    const isSelected = selectedDashboardWorkshopId === id;
                    const isMyCurrentCycle = currentCycle === cycle;
                    const isAccredited = isWorkshopAttended(id);

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedDashboardWorkshopId(id)}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                          isSelected
                            ? 'bg-black dark:bg-white text-white dark:text-black font-bold shadow-xs'
                            : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <span>{label}</span>
                        {isMyCurrentCycle && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
                            title="Tu ciclo actual"
                          />
                        )}
                        {isAccredited && (
                          <span className="text-[10px] text-emerald-500 font-bold shrink-0" title="Acreditado">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <PromotionalEventBanner
                event={selectedWorkshopEvent}
                variant="participant"
                isAttended={isWorkshopAttended(selectedWorkshopEvent.id)}
                participantCycle={currentCycle}
                onNavigateToSyllabus={() => {
                  setDashboardTab('talleres');
                }}
                onDownloadWorkbookPDF={() => {
                  const matchingCoreWs = CORE_WORKSHOPS.find(
                    (w) => w.id === selectedWorkshopEvent.id || w.matchIds.includes(selectedWorkshopEvent.id)
                  );
                  if (matchingCoreWs) {
                    handleDownloadWorkshopMemory(matchingCoreWs);
                  }
                }}
              />
            </section>

            {/* Tu Momento Actual: Fotografía, Pregunta y Próximo Paso */}
            <section
              id="tu-momento-actual"
              className="rounded-3xl border border-black/10 dark:border-white/15 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-56 sm:h-64 w-full overflow-hidden border-b border-black/10 dark:border-white/10">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                />
                <div className="absolute top-4 left-4 bg-black/90 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xs flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeCycleAccent.dot}`} />
                  <span>Tu momento actual</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-md text-white p-3.5 rounded-2xl border border-white/15">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-300 block font-mono">
                    {currentPhoto.title}
                  </span>
                  <p className="text-xs font-light text-neutral-200 mt-0.5 leading-snug">
                    {currentPhoto.description}
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Pregunta de Apertura Ontológica */}
                <div className="p-5 rounded-2xl bg-white/30 dark:bg-neutral-900/40 backdrop-blur-md border border-black/10 dark:border-white/10 space-y-2 shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block font-mono">
                      Pregunta de Apertura Ontológica
                    </span>
                    <h2 className="text-base sm:text-lg font-normal text-black dark:text-white leading-snug mt-1">
                      {isCycleMilestone
                        ? '«¿Qué grandes descubrimientos o patrones has notado en estas semanas y cómo sientes que tu perspectiva ha cambiado?»'
                        : '«¿Qué es importante para ti traer a este espacio hoy?»'}
                    </h2>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed mt-1">
                      Este espacio nace completamente abierto a tu emergente. No hay temas predeterminados ni respuestas correctas. Conversaremos sobre lo que esté vivo en ti.
                    </p>
                  </div>
                </div>

                {/* Cosecha de Ciclo (Hito de 4 sesiones) */}
                {isCycleMilestone && (
                  <div className="p-5 rounded-2xl bg-white/30 dark:bg-neutral-900/45 backdrop-blur-md border border-black dark:border-white space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider font-mono">
                        Cosecha del Ciclo {currentCycle}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      Hemos completado 4 encuentros. Este espacio está dedicado a integrar la siembra:
                    </p>
                    <ul className="list-disc list-inside text-xs text-neutral-800 dark:text-neutral-200 space-y-1 font-light">
                      <li>¿Qué descubrimientos o patrones recurrentes has identificado?</li>
                      <li>¿Cómo se ha transformado tu manera de observar tus quiebres y decisiones?</li>
                    </ul>
                    {currentPostForm?.cycleHarvest && (
                      <div className="mt-2 p-3.5 rounded-xl bg-white/40 dark:bg-black/40 backdrop-blur-sm border border-black/15 dark:border-white/15 text-xs text-neutral-800 dark:text-neutral-200 font-light shadow-2xs">
                        <strong className="font-semibold text-black dark:text-white block mb-0.5">
                          Tu cosecha registrada:
                        </strong>
                        {currentPostForm.cycleHarvest}
                      </div>
                    )}
                  </div>
                )}

                {/* Bloques de Próximo Paso */}
                <div className="space-y-4 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block font-mono">
                    Información Esencial del Próximo Paso
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Próximo Encuentro */}
                    <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/25 dark:bg-neutral-900/35 backdrop-blur-md space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white">
                        <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Tu Próxima Sesión</span>
                      </div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300">
                        {formatHumanDate(currentSession.date)}
                      </p>
                      <div className="pt-2 flex flex-wrap gap-2">
                        <a
                          href={currentSession.meetLink || 'https://meet.google.com/new'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                          <span>Unirme por Meet</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setDashboardTab('sesiones')}
                          className="px-4 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-black/50 backdrop-blur-xs text-xs font-semibold hover:bg-white/70 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Ver todas las sesiones</span>
                        </button>
                      </div>
                    </div>

                    {/* Memoria de Sesión & Cuestionario Posterior */}
                    <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/25 dark:bg-neutral-900/35 backdrop-blur-md space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Memoria y Bitácora Posterior</span>
                      </div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300">
                        {currentPostForm
                          ? 'Tu memoria de sesión está registrada y lista para consultar.'
                          : 'Registra el emergente y el paso a la acción tras tu encuentro.'}
                      </p>
                      <div className="pt-2 flex flex-wrap gap-2">
                        {currentPostForm ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadMemory(currentPostForm, currentSession)}
                            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar Memoria (PDF)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenBitacora(currentSession)}
                            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Registrar Bitácora</span>
                          </button>
                        )}

                        {currentPostForm && (
                          <button
                            type="button"
                            onClick={() => handleOpenBitacora(currentSession)}
                            className="px-3.5 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-black/50 backdrop-blur-xs text-xs font-semibold hover:bg-white/70 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          >
                            Editar registro
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Síntesis del Tema Emergente */}
                  {currentPostForm && (
                    <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white/25 dark:bg-neutral-900/35 backdrop-blur-md space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                          El tema emergente de este encuentro:
                        </span>
                        <p className="text-xs font-medium text-black dark:text-white mt-0.5">
                          {currentPostForm.emergentTopic || currentPostForm.masterJudgmentAndNarrative}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                          El paso a la acción acordado:
                        </span>
                        <p className="text-xs font-medium text-black dark:text-white mt-0.5">
                          {currentPostForm.actionStep || currentPostForm.agreedActionItems?.[0]}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 2: PANELES DE TALLERES ONTOLÓGICOS                                  */}
        {/* ========================================================================= */}
        {dashboardTab === 'talleres' && (
          <div className="space-y-7">
            {/* Banner del taller */}
            <PromotionalEventBanner
              event={selectedWorkshopEvent}
              variant="participant"
              isAttended={isWorkshopAttended(selectedWorkshopEvent.id)}
              participantCycle={currentCycle}
              onNavigateToSyllabus={() => {
                setSelectedWorkshopTrackId(selectedWorkshopEvent.id);
                setIsTalleresModuleExpanded(true);
              }}
              onDownloadWorkbookPDF={() => {
                const matchingCoreWs = CORE_WORKSHOPS.find(
                  (w) => w.id === selectedWorkshopEvent.id || w.matchIds.includes(selectedWorkshopEvent.id)
                );
                if (matchingCoreWs) {
                  handleDownloadWorkshopMemory(matchingCoreWs);
                }
              }}
            />

            {/* Módulo interactivo de los 3 Talleres Troncales */}
            <ParticipantTalleresModule
              isExpanded={isTalleresModuleExpanded}
              onToggle={() => setIsTalleresModuleExpanded(!isTalleresModuleExpanded)}
              accreditedWorkshopsCount={accreditedWorkshopsCount}
              coreWorkshops={CORE_WORKSHOPS}
              selectedWorkshopId={selectedWorkshopTrackId}
              onSelectWorkshopId={setSelectedWorkshopTrackId}
              isWorkshopAttended={isWorkshopAttended}
              getWorkshopMemoryDetails={getWorkshopMemoryDetails}
              onDownloadWorkshopMemory={handleDownloadWorkshopMemory}
              onCopyPaymentKey={handleCopyPaymentKey}
              copiedPaymentKey={copiedPaymentKey}
              hasWorkshopsAccess={activeUser.hasWorkshopsAccess ?? true}
              enrolledWorkshopIds={activeUser.enrolledWorkshopIds || ['taller-1-raiz', 'taller-2-tallo']}
              onGoToIntegrations={() => setDashboardTab('integraciones')}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 3: PANELES DE SESIONES 1 A 1                                        */}
        {/* ========================================================================= */}
        {dashboardTab === 'sesiones' && (
          <div className="space-y-7">
            <ParticipantSesionesModule
              sessions={sessions}
              postForms={postForms}
              currentSessionNumber={currentSessionNumber}
              currentCycle={currentCycle}
              activeUser={activeUser}
              onOpenBitacora={handleOpenBitacora}
              onDownloadSessionPDF={handleDownloadMemory}
              onGoToIntegrations={() => setDashboardTab('integraciones')}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 4: INTEGRACIONES DE FORMULARIOS Y GOOGLE SHEETS                     */}
        {/* ========================================================================= */}
        {dashboardTab === 'integraciones' && (
          <div className="space-y-7">
            <ParticipantIntegracionesModule
              activeUser={activeUser}
              sessions={sessions}
              postForms={postForms}
              onRefresh={() => {
                const currentSessions = OntologicalStore.getSessionsForClient(activeUser.uid);
                const currentForms = OntologicalStore.getPostSessionFormsForClient(activeUser.uid);
                setSessions(currentSessions);
                setPostForms(currentForms);
              }}
              onSelectSession={(sess) => {
                handleOpenBitacora(sess);
              }}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 5: TEMARIO & SYLLABUS ONTOLÓGICO                                    */}
        {/* ========================================================================= */}
        {dashboardTab === 'temario' && (
          <section id="temario-ontologico-syllabus" className="space-y-4">
            <ParticipantTemarioSyllabus
              activeUser={activeUser}
              sessions={sessions}
              postForms={postForms}
              cronogramaEvents={cronogramaEvents}
              currentSessionNumber={currentSessionNumber}
              currentCycle={currentCycle}
              selectedItemId={selectedTemarioItemId}
              onSelectItem={setSelectedTemarioItemId}
              onOpenBitacora={handleOpenBitacora}
              onDownloadSessionPDF={handleDownloadMemory}
              onDownloadWorkshopPDF={handleDownloadWorkshopMemoryFromSyllabus}
              onCopyPaymentKey={handleCopyPaymentKey}
              copiedPaymentKey={copiedPaymentKey}
              isWorkshopAttended={isWorkshopAttendedById}
            />
          </section>
        )}

        {/* ========================================================================= */}
        {/* FOOTER: CONTACTO DIRECTO CON EL FACILITADOR                               */}
        {/* ========================================================================= */}
        <footer className="p-5 rounded-3xl border border-black/10 dark:border-white/10 bg-white/85 dark:bg-neutral-950/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <img
              src={coachAvatarImg}
              alt="John Fredy Rengifo Basto"
              className="w-12 h-12 rounded-full object-cover border border-black/15 dark:border-white/15 shrink-0"
            />
            <div>
              <div className="font-bold text-black dark:text-white">
                John Fredy Rengifo Basto
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                Master Coach Ontológico • Acompañamiento entre encuentros
              </div>
            </div>
          </div>

          <a
            href={COMPANY_INFO.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-500" />
            <span>Mensaje directo por WhatsApp</span>
          </a>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CUESTIONARIO POSTERIOR / BITÁCORA                                 */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <PostSessionWorkbookModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          session={activeSessionForModal}
          client={activeUser}
          isParticipant={true}
          onFormSaved={() => {
            const updatedForms = OntologicalStore.getPostSessionFormsForClient(activeUser.uid);
            setPostForms(updatedForms);
            if (onUserUpdated) onUserUpdated();
          }}
        />
      )}

      {/* Floating Toast de Descarga Directa de PDF */}
      {downloadToastMessage && (
        <div
          id="pdf-download-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-2xl shadow-2xl border border-slate-700/50 text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span>{downloadToastMessage}</span>
        </div>
      )}
    </div>
  );
};
