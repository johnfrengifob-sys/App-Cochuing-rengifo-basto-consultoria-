import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Video,
  Download,
  FileText,
  ChevronDown,
  MessageCircle,
  Sparkles,
  Clock,
  BookOpen,
  Compass,
  Award,
  ShieldCheck,
  Brain,
  ArrowRight,
} from 'lucide-react';
import { User, Session, PostSessionForm, CronogramaEvent, ProgramNodeInfo } from '../types';
import { OntologicalStore, COMPANY_INFO, PROGRAM_NODES, BRE_B_NU_CONFIG } from '../services/store';
import { getEmailAvatarUrl } from '../utils/avatar';
import { FirestoreSyncService } from '../services/firestoreSync';
import { PDFGenerator } from '../utils/pdfGenerator';
import { safeCopyToClipboard } from '../utils/clipboard';
import { PostSessionWorkbookModal } from './PostSessionWorkbookModal';
import { ParticipantTalleresModule, CoreWorkshopTrack } from './dashboard/ParticipantTalleresModule';
import { CORE_WORKSHOPS_CATALOG as CORE_WORKSHOPS } from '../data/coreWorkshopsCatalog';
import { ParticipantSesionesModule } from './dashboard/ParticipantSesionesModule';
import { CURATED_EXPERIENCE_PHOTOS } from '../data/initialExperiences';
import { OFFICIAL_FORMS_SHEETS_BASE_MAP } from '../data/officialFormsSheetsBase';
import coachAvatarImg from '../assets/images/regenerated_image_1788287101599.jpg';
import whiteWavesBg from '../assets/images/white_waves_bg_1788461168119.jpg';

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

  // Estado de navegación por acordeón/toggle con los tres botones principales destacados
  // Por defecto, las secciones de contenido detallado debajo de estos botones permanecen colapsadas (null)
  const [expandedSection, setExpandedSection] = useState<'resumen' | 'talleres' | 'sesiones' | null>(null);

  // Lógica de acordeón estándar: si hace clic en la sección activa, se colapsa (toggle); si hace clic en otra, se despliega fluidamente
  const toggleSection = (section: 'resumen' | 'talleres' | 'sesiones') => {
    setExpandedSection((current) => (current === section ? null : section));
  };

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

  // Modal para edición/registro de bitácora
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeSessionForModal, setActiveSessionForModal] = useState<Session | null>(null);

  // Estado de descarga de PDF con confirmación visual
  const [downloadToastMessage, setDownloadToastMessage] = useState<string | null>(null);

  // ID del taller seleccionado
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

  // Estación del programa actual (1 a 12)
  const currentNodeInfo: ProgramNodeInfo = useMemo(() => {
    return (
      PROGRAM_NODES.find((n) => n.step === currentSessionNumber) ||
      PROGRAM_NODES[0]
    );
  }, [currentSessionNumber]);

  // Taller Troncal correspondiente al Ciclo en curso
  const currentCycleWorkshop: CoreWorkshopTrack = useMemo(() => {
    if (currentCycle === 1) return CORE_WORKSHOPS[0];
    if (currentCycle === 2) return CORE_WORKSHOPS[1];
    return CORE_WORKSHOPS[2];
  }, [currentCycle]);

  // Estado de acreditación del taller troncal
  const isCurrentCycleWorkshopAttended = useMemo(() => {
    return isWorkshopAttended(currentCycleWorkshop);
  }, [currentCycleWorkshop, activeUser, cronogramaEvents]);

  // Generador de enlace de Google Calendar para la sesión actual
  const currentSessionGCalUrl = useMemo(() => {
    try {
      const startDate = new Date(currentSession.date);
      if (isNaN(startDate.getTime())) {
        return OntologicalStore.getCalendarUrl();
      }
      const endDate = new Date(startDate.getTime() + (currentSession.durationMinutes || 60) * 60000);
      const pad = (n: number) => (n < 10 ? '0' + n : String(n));
      const toGCalIso = (d: Date) =>
        String(d.getUTCFullYear()) +
        pad(d.getUTCMonth() + 1) +
        pad(d.getUTCDate()) +
        'T' +
        pad(d.getUTCHours()) +
        pad(d.getUTCMinutes()) +
        '00Z';

      const title = encodeURIComponent(`Sesión Ontológica RBC #${currentSessionNumber}: ${activeUser.name}`);
      const details = encodeURIComponent(
        `Sesión ${currentSessionNumber} de 12 • Programa RBC\nTema: ${currentNodeInfo.sessionTitle}\nFoco: ${currentNodeInfo.objective}\nEnlace Google Meet: ${currentSession.meetLink || 'https://meet.google.com/rbc-sesion'}\n\nCoordinado desde Plataforma RBC.`
      );
      const location = encodeURIComponent(currentSession.meetLink || 'Google Meet');
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${toGCalIso(startDate)}/${toGCalIso(endDate)}&details=${details}&location=${location}`;
    } catch {
      return OntologicalStore.getCalendarUrl();
    }
  }, [currentSession, currentSessionNumber, activeUser.name, currentNodeInfo]);

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

        </header>

        {/* ========================================================================= */}
        {/* 1.1 CANAL DIRECTO Y ACOMPAÑAMIENTO CON EL COACH                           */}
        {/* ========================================================================= */}
        <section
          id="superior-comunicacion-directa"
          className="p-5 sm:p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-950/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-black/20 dark:hover:border-white/20 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={coachAvatarImg}
                alt="John Fredy Rengifo Basto"
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border border-black/15 dark:border-white/15 shadow-2xs"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-950 shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                  Canal Directo Activo
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-black dark:text-white">
                John Fredy Rengifo Basto
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light">
                Master Coach Ontológico • Acompañamiento 1 a 1 y espacio confidencial
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:pt-0">
            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:shadow-md active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4 text-emerald-100" />
              <span>WhatsApp Directo</span>
            </a>
            <a
              href={currentSession.meetLink || 'https://meet.google.com/rbc-sesion'}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/60 dark:bg-neutral-900/60 hover:bg-white dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Video className="w-4 h-4 text-indigo-500" />
              <span>Sala Meet 1 a 1</span>
            </a>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. ESTRUCTURA DE DESPLIEGUE DIRECTO (ACORDEÓN INLINE CON LIQUID GLASS)    */}
        {/* Cada botón despliega su información INMEDIATAMENTE DEBAJO de sí mismo      */}
        {/* ========================================================================= */}
        <section
          id="main-navigation-inline-accordion"
          className="space-y-4"
        >
          {/* ========================================================================= */}
          {/* ITEM 1: RESUMEN GENERAL (BOTÓN + CONTENIDO INLINE)                         */}
          {/* ========================================================================= */}
          <div className="space-y-3" id="accordion-item-resumen">
            <button
              id="btn-toggle-resumen-general"
              type="button"
              onClick={() => toggleSection('resumen')}
              aria-expanded={expandedSection === 'resumen'}
              className={`w-full group relative px-6 sm:px-8 py-5 sm:py-6 rounded-3xl text-left transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden border ${
                expandedSection === 'resumen'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black/40 dark:border-white shadow-xl ring-2 ring-black/15 dark:ring-white/20'
                  : 'bg-white/35 dark:bg-neutral-950/35 backdrop-blur-2xl text-black dark:text-white border-black/10 dark:border-white/10 hover:bg-white/65 dark:hover:bg-neutral-900/65 hover:border-black/25 dark:hover:border-white/25 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-xl transition-colors ${
                    expandedSection === 'resumen'
                      ? 'bg-white/15 dark:bg-black/15 text-white dark:text-black'
                      : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  01
                </span>
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${
                    expandedSection === 'resumen'
                      ? 'bg-white text-black dark:bg-black dark:text-white shadow-sm'
                      : 'bg-black/5 dark:bg-white/10 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight font-sans">
                      Resumen General
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold ${
                        expandedSection === 'resumen'
                          ? 'bg-white/20 dark:bg-black/15 text-white dark:text-black'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {overallProgressPercentage}% Avance
                    </span>
                  </div>
                  <p
                    className={`text-xs font-light mt-1 max-w-2xl ${
                      expandedSection === 'resumen'
                        ? 'text-neutral-300 dark:text-neutral-700'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Métricas clave, estado del proceso, foco somático y tu momento actual.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                <span
                  className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
                    expandedSection === 'resumen'
                      ? 'text-emerald-400 dark:text-emerald-700 font-extrabold'
                      : 'text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white'
                  }`}
                >
                  {expandedSection === 'resumen' ? 'Desplegado ▲' : 'Desplegar ▼'}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 shrink-0 ${
                    expandedSection === 'resumen'
                      ? 'rotate-180 bg-white/20 dark:bg-black/20 text-white dark:text-black'
                      : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 group-hover:bg-black/10 dark:group-hover:bg-white/20'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* DESPLIEGUE DIRECTO DE RESUMEN INMEDIATAMENTE DEBAJO DEL BOTÓN */}
            <AnimatePresence initial={false}>
              {expandedSection === 'resumen' && (
                <motion.div
                  key="accordion-resumen-inline"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden space-y-6 pt-1 pb-2"
                >
                  {/* Encabezado con botón para colapsar */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black dark:text-white font-mono">
                        Panel de Resumen General & Estado Actual
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedSection(null)}
                      className="text-[11px] font-mono text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer px-3 py-1 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-black/10 dark:border-white/10"
                    >
                      Colapsar Sección ▲
                    </button>
                  </div>

                  {/* Tu Momento Actual */}
                  <section
                    id="panel-momento-actual"
                    className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/25 dark:bg-neutral-950/30 backdrop-blur-xl overflow-hidden shadow-xs space-y-0"
                  >
                    {/* Visual con fotografía curada */}
                    <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-neutral-900">
                      <img
                        src={CURATED_EXPERIENCE_PHOTOS[currentSessionNumber % CURATED_EXPERIENCE_PHOTOS.length].url}
                        alt={currentNodeInfo.sessionTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                        <div className="bg-black/90 text-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xs flex items-center gap-2 border border-white/20">
                          <span className={`w-2 h-2 rounded-full ${activeCycleAccent.dot} animate-pulse`} />
                          <span>Tu Momento Actual</span>
                        </div>
                        <span className="bg-white/90 dark:bg-black/80 text-black dark:text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md shadow-xs border border-black/10 dark:border-white/20">
                          Ciclo {currentCycle}: {currentCycle === 1 ? 'Raíz' : currentCycle === 2 ? 'Tallo' : 'Florecimiento'} • Sesión {currentSessionNumber} de 12
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/15 max-w-3xl">
                          <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono font-bold">
                            Estación #{currentSessionNumber}: {currentNodeInfo.weekLabel}
                          </div>
                          <h2 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                            {currentNodeInfo.sessionTitle}
                          </h2>
                          <p className="text-xs font-light text-neutral-200 mt-1 leading-relaxed line-clamp-2">
                            {currentNodeInfo.objective}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                      {/* 3 Pilares Fundamentales del Momento Actual */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Pilar 1: Próxima Sesión 1 a 1 */}
                        <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-mono flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Sesión Individual
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                {currentSession.status === 'completed' ? 'Completada' : 'Programada'}
                              </span>
                            </div>
                            <div className="text-sm font-bold text-black dark:text-white">
                              Sesión #{currentSessionNumber} de 12
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              {formatHumanDate(currentSession.date)}
                            </p>
                          </div>

                          <div className="pt-2 flex flex-col gap-2">
                            <a
                              href={currentSession.meetLink || 'https://meet.google.com/new'}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full px-3.5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Video className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                              <span>Unirme por Meet</span>
                            </a>
                            <div className="flex items-center gap-2">
                              <a
                                href={currentSessionGCalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-800/60 text-[11px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white/80 dark:hover:bg-neutral-700 transition-colors text-center inline-flex items-center justify-center gap-1"
                              >
                                <Calendar className="w-3 h-3 text-neutral-500" />
                                <span>Google Calendar</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => toggleSection('sesiones')}
                                className="px-2.5 py-1.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/60 dark:bg-neutral-800/80 text-[11px] font-semibold text-black dark:text-white hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              >
                                <span>Ver Sesiones</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Pilar 2: Taller Troncal RBC en Curso */}
                        <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-mono flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                Taller Troncal
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  isCurrentCycleWorkshopAttended
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20'
                                }`}
                              >
                                {isCurrentCycleWorkshopAttended ? 'Acreditado ✓' : 'En Curso'}
                              </span>
                            </div>
                            <div className="text-sm font-bold text-black dark:text-white line-clamp-1">
                              {currentCycleWorkshop.title}
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              Ciclo {currentCycle} ({currentCycleWorkshop.stageName}) • {currentCycleWorkshop.levelBadge}
                            </p>
                          </div>

                          <div className="pt-2 flex flex-col gap-2">
                            <a
                              href={currentCycleWorkshop.meetLink || 'https://meet.google.com/rbc-conversatorio-ontologico'}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Video className="w-3.5 h-3.5 text-indigo-200" />
                              <span>Sala del Taller (Meet)</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => toggleSection('talleres')}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-800/60 text-[11px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white/80 dark:hover:bg-neutral-700 transition-colors text-center inline-flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <BookOpen className="w-3 h-3 text-neutral-500" />
                              <span>Ver Talleres & Temario</span>
                            </button>
                          </div>
                        </div>

                        {/* Pilar 3: Avance Global & Cosecha Integral */}
                        <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-mono flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                Avance Integral
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/15 text-black dark:text-white font-mono">
                                {overallProgressPercentage}%
                              </span>
                            </div>
                            <div className="text-sm font-bold text-black dark:text-white">
                              Cosecha del Ciclo {currentCycle}
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              {completedSessionsCount} de 12 sesiones • {accreditedWorkshopsCount} de 3 talleres acreditados.
                            </p>
                          </div>

                          <div className="pt-2 flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => toggleSection('sesiones')}
                              className="w-full px-3 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/60 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-700 text-xs font-semibold text-black dark:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Ir a las Sesiones</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Pregunta de Apertura Ontológica & Foco Somático */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pregunta de Apertura */}
                        <div className="p-5 rounded-2xl bg-white/30 dark:bg-neutral-900/40 backdrop-blur-md border border-black/10 dark:border-white/10 space-y-2 shadow-xs">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block font-mono">
                            Pregunta de Apertura del Momento
                          </span>
                          <h3 className="text-sm sm:text-base font-medium text-black dark:text-white leading-snug">
                            «{currentNodeInfo.keyQuestion || (isCycleMilestone
                              ? '¿Qué grandes descubrimientos o patrones has notado en estas semanas y cómo sientes que tu perspectiva ha cambiado?'
                              : '¿Qué es importante para ti traer a este espacio hoy?')}»
                          </h3>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                            Espacio abierto al emergente. Conversamos sobre lo que hoy demanda sentido y coherencia en tus decisiones.
                          </p>
                        </div>

                        {/* Foco Somático & Micro-Práctica */}
                        <div className="p-5 rounded-2xl bg-white/30 dark:bg-neutral-900/40 backdrop-blur-md border border-black/10 dark:border-white/10 space-y-2 shadow-xs">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block font-mono flex items-center gap-1">
                            <Brain className="w-3 h-3 text-indigo-500" />
                            Foco Somático & Encarnación
                          </span>
                          <h3 className="text-sm sm:text-base font-medium text-black dark:text-white leading-snug">
                            {currentNodeInfo.dailyMicroPractice?.title || 'Pausa de Coherencia y Centramiento'}
                          </h3>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                            {currentNodeInfo.dailyMicroPractice?.description ||
                              currentNodeInfo.methodology?.somatic ||
                              'Calibración de la tensión diafragmática y presencia corporal previa a cada decisión.'}
                          </p>
                        </div>
                      </div>

                      {/* Cosecha de Ciclo si corresponde */}
                      {isCycleMilestone && (
                        <div className="p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 backdrop-blur-md border border-amber-500/30 space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider font-mono">
                              Cosecha del Ciclo {currentCycle} (Hito de Integración)
                            </h3>
                          </div>
                          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                            Has completado las sesiones de este ciclo. Es momento de recoger las distinciones adquiridas, verificar cambios de observador y consolidar los nuevos acuerdos.
                          </p>
                        </div>
                      )}

                      {/* Acciones de Memoria y Bitácora de Sesión */}
                      <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white/20 dark:bg-neutral-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-black dark:text-white">
                              {currentPostForm ? 'Memoria de Sesión Registrada' : 'Bitácora de Sesión Pendiente'}
                            </div>
                            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              {currentPostForm
                                ? `Registrada para la Sesión #${currentSessionNumber}`
                                : `Registra el emergente y los acuerdos de la Sesión #${currentSessionNumber}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {currentPostForm && (
                            <button
                              type="button"
                              onClick={() => handleDownloadMemory(currentPostForm, currentSession)}
                              className="px-3.5 py-1.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-black/50 text-xs font-semibold hover:bg-white/80 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Descargar PDF</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenBitacora(currentSession)}
                            className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{currentPostForm ? 'Editar Bitácora' : 'Registrar Bitácora'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ========================================================================= */}
          {/* ITEM 2: TALLERES & TEMARIO (BOTÓN + CONTENIDO INLINE)                      */}
          {/* ========================================================================= */}
          <div className="space-y-3" id="accordion-item-talleres">
            <button
              id="btn-toggle-talleres"
              type="button"
              onClick={() => toggleSection('talleres')}
              aria-expanded={expandedSection === 'talleres'}
              className={`w-full group relative px-6 sm:px-8 py-5 sm:py-6 rounded-3xl text-left transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden border ${
                expandedSection === 'talleres'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black/40 dark:border-white shadow-xl ring-2 ring-black/15 dark:ring-white/20'
                  : 'bg-white/35 dark:bg-neutral-950/35 backdrop-blur-2xl text-black dark:text-white border-black/10 dark:border-white/10 hover:bg-white/65 dark:hover:bg-neutral-900/65 hover:border-black/25 dark:hover:border-white/25 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-xl transition-colors ${
                    expandedSection === 'talleres'
                      ? 'bg-white/15 dark:bg-black/15 text-white dark:text-black'
                      : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  02
                </span>
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${
                    expandedSection === 'talleres'
                      ? 'bg-white text-black dark:bg-black dark:text-white shadow-sm'
                      : 'bg-black/5 dark:bg-white/10 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black'
                  }`}
                >
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight font-sans">
                      Talleres & Temario
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold ${
                        expandedSection === 'talleres'
                          ? 'bg-white/20 dark:bg-black/15 text-white dark:text-black'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {accreditedWorkshopsCount}/3 Acreditados
                    </span>
                  </div>
                  <p
                    className={`text-xs font-light mt-1 max-w-2xl ${
                      expandedSection === 'talleres'
                        ? 'text-neutral-300 dark:text-neutral-700'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Los 3 talleres troncales vivenciales: Raíz, Tallo y Florecimiento. Salas virtuales, bitácoras y memorias.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                <span
                  className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
                    expandedSection === 'talleres'
                      ? 'text-indigo-400 dark:text-indigo-700 font-extrabold'
                      : 'text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white'
                  }`}
                >
                  {expandedSection === 'talleres' ? 'Desplegado ▲' : 'Desplegar ▼'}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 shrink-0 ${
                    expandedSection === 'talleres'
                      ? 'rotate-180 bg-white/20 dark:bg-black/20 text-white dark:text-black'
                      : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 group-hover:bg-black/10 dark:group-hover:bg-white/20'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* DESPLIEGUE DIRECTO DE TALLERES INMEDIATAMENTE DEBAJO DEL BOTÓN */}
            <AnimatePresence initial={false}>
              {expandedSection === 'talleres' && (
                <motion.div
                  key="accordion-talleres-inline"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden space-y-6 pt-1 pb-2"
                >
                  {/* Encabezado con botón para colapsar */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black dark:text-white font-mono">
                        Talleres Ontológicos Troncales (Raíz, Tallo & Florecimiento)
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedSection(null)}
                      className="text-[11px] font-mono text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer px-3 py-1 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-black/10 dark:border-white/10"
                    >
                      Colapsar Sección ▲
                    </button>
                  </div>

                  {/* Módulo directo y simplificado de los 3 Talleres Troncales */}
                  <ParticipantTalleresModule
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
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ========================================================================= */}
          {/* ITEM 3: SESIONES (BOTÓN + CONTENIDO INLINE)                                */}
          {/* ========================================================================= */}
          <div className="space-y-3" id="accordion-item-sesiones">
            <button
              id="btn-toggle-sesiones"
              type="button"
              onClick={() => toggleSection('sesiones')}
              aria-expanded={expandedSection === 'sesiones'}
              className={`w-full group relative px-6 sm:px-8 py-5 sm:py-6 rounded-3xl text-left transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden border ${
                expandedSection === 'sesiones'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black/40 dark:border-white shadow-xl ring-2 ring-black/15 dark:ring-white/20'
                  : 'bg-white/35 dark:bg-neutral-950/35 backdrop-blur-2xl text-black dark:text-white border-black/10 dark:border-white/10 hover:bg-white/65 dark:hover:bg-neutral-900/65 hover:border-black/25 dark:hover:border-white/25 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-xl transition-colors ${
                    expandedSection === 'sesiones'
                      ? 'bg-white/15 dark:bg-black/15 text-white dark:text-black'
                      : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  03
                </span>
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${
                    expandedSection === 'sesiones'
                      ? 'bg-white text-black dark:bg-black dark:text-white shadow-sm'
                      : 'bg-black/5 dark:bg-white/10 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black'
                  }`}
                >
                  <Calendar className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight font-sans">
                      Sesiones
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold ${
                        expandedSection === 'sesiones'
                          ? 'bg-white/20 dark:bg-black/15 text-white dark:text-black'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {completedSessionsCount}/12 Realizadas
                    </span>
                  </div>
                  <p
                    className={`text-xs font-light mt-1 max-w-2xl ${
                      expandedSection === 'sesiones'
                        ? 'text-neutral-300 dark:text-neutral-700'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Listado completo de los 12 encuentros 1 a 1, bitácoras reflexivas y acuerdos de proceso.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                <span
                  className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
                    expandedSection === 'sesiones'
                      ? 'text-emerald-400 dark:text-emerald-700 font-extrabold'
                      : 'text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white'
                  }`}
                >
                  {expandedSection === 'sesiones' ? 'Desplegado ▲' : 'Desplegar ▼'}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 shrink-0 ${
                    expandedSection === 'sesiones'
                      ? 'rotate-180 bg-white/20 dark:bg-black/20 text-white dark:text-black'
                      : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 group-hover:bg-black/10 dark:group-hover:bg-white/20'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* DESPLIEGUE DIRECTO DE SESIONES INMEDIATAMENTE DEBAJO DEL BOTÓN */}
            <AnimatePresence initial={false}>
              {expandedSection === 'sesiones' && (
                <motion.div
                  key="accordion-sesiones-inline"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden space-y-6 pt-1 pb-2"
                >
                  {/* Encabezado con botón para colapsar */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black dark:text-white font-mono">
                        Sesiones Individuales 1 a 1 • 12 Encuentros Ontológicos
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedSection(null)}
                      className="text-[11px] font-mono text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer px-3 py-1 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-black/10 dark:border-white/10"
                    >
                      Colapsar Sección ▲
                    </button>
                  </div>

                  {/* Módulo completo de Sesiones */}
                  <ParticipantSesionesModule
                    sessions={sessions}
                    postForms={postForms}
                    currentSessionNumber={currentSessionNumber}
                    currentCycle={currentCycle}
                    activeUser={activeUser}
                    onOpenBitacora={handleOpenBitacora}
                    onDownloadSessionPDF={handleDownloadMemory}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

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
