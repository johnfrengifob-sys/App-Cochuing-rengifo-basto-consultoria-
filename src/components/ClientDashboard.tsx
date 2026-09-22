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
  CheckCircle2,
  Activity,
  TrendingUp,
  Table,
  ExternalLink,
  FileSpreadsheet,
  RefreshCw,
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

  // Estado de despliegue directo (accordion inline) para los espacios principales
  // Inicia por defecto en null (todos los botones recogidos/plegados)
  const [expandedSection, setExpandedSection] = useState<'resumen' | 'talleres' | 'sesiones' | 'expediente' | null>(null);

  const toggleSection = (section: 'resumen' | 'talleres' | 'sesiones' | 'expediente') => {
    setExpandedSection((curr) => (curr === section ? null : section));
  };

  const openSection = (section: 'resumen' | 'talleres' | 'sesiones' | 'expediente') => {
    setExpandedSection(section);
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

  // Expediente unificado extraído de Formularios y Hojas de Cálculo
  const [clientCrossData, setClientCrossData] = useState(() =>
    OntologicalStore.getUnifiedClientOntologicalCrossData(activeUser.email, activeUser.uid, activeUser.name)
  );
  const [isSyncingExpediente, setIsSyncingExpediente] = useState<boolean>(false);
  const [expedienteSyncSuccess, setExpedienteSyncSuccess] = useState<string | null>(null);

  const handleSyncExpedienteLive = async () => {
    setIsSyncingExpediente(true);
    setExpedienteSyncSuccess(null);
    try {
      if (activeUser.email) {
        await OntologicalStore.fetchServerExtractedExpediente(activeUser.email);
      }
      const refreshed = OntologicalStore.getUnifiedClientOntologicalCrossData(activeUser.email, activeUser.uid, activeUser.name);
      setClientCrossData(refreshed);
      setExpedienteSyncSuccess('Expediente y bitácoras sincronizados exitosamente con Google Workspace en tiempo real.');
    } catch (e) {
      console.warn('Error syncing expediente live:', e);
    } finally {
      setIsSyncingExpediente(false);
      setTimeout(() => setExpedienteSyncSuccess(null), 4000);
    }
  };

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

  // Talleres troncales enriquecidos con enlaces oficiales de Google Workspace en tiempo real
  const enrichedCoreWorkshops: CoreWorkshopTrack[] = useMemo(() => {
    return CORE_WORKSHOPS.map((cw) => {
      const matchingEvt = cronogramaEvents.find((evt) =>
        cw.matchIds.some(
          (id) =>
            evt.id.toLowerCase().includes(id) ||
            evt.title.toLowerCase().includes(cw.stageName.toLowerCase())
        )
      );
      return {
        ...cw,
        meetLink: matchingEvt?.meetUrl || cw.meetLink,
        googleFormsUrl: matchingEvt?.googleFormsUrl || cw.googleFormsUrl,
        googleSheetsUrl: matchingEvt?.googleSheetsUrl || cw.googleSheetsUrl,
        autocratUrl: matchingEvt?.autocratUrl || cw.autocratUrl,
        autocratFolderUrl: matchingEvt?.autocratMergeUrl || matchingEvt?.googleDriveFolderUrl || cw.autocratFolderUrl,
      };
    });
  }, [cronogramaEvents]);

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
        ? enrichedCoreWorkshops.find((w) => w.id === wsOrId || w.matchIds.includes(wsOrId))
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
    if (currentCycle === 1) return enrichedCoreWorkshops[0];
    if (currentCycle === 2) return enrichedCoreWorkshops[1];
    return enrichedCoreWorkshops[2];
  }, [currentCycle, enrichedCoreWorkshops]);

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
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block font-medium">
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
                  <span className="text-[11px] font-sans font-bold text-black dark:text-white">
                    {overallProgressPercentage}%
                  </span>
                </div>
              </div>

              <div className="space-y-0.5 font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Avance Integral
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${activeCycleAccent.border} ${activeCycleAccent.softBg} ${activeCycleAccent.badgeText}`}
                  >
                    {isCycleMilestone ? '★ Cosecha del Ciclo' : 'Lienzo en Blanco'}
                  </span>
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-300">
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
        {/* 2. ACORDEÓN INLINE EJECUTIVO: 3 ESPACIOS PRINCIPALES                      */}
        {/* ========================================================================= */}
        <section
          id="client-panel-accordion-container"
          aria-label="Espacios principales del participante"
          className="space-y-4"
        >
          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 1: RESUMEN GENERAL                                              */}
          {/* ----------------------------------------------------------------------- */}
          <div id="accordion-item-resumen" className="space-y-3">
            <button
              id="btn-accordion-resumen"
              type="button"
              onClick={() => toggleSection('resumen')}
              aria-expanded={expandedSection === 'resumen'}
              className={`w-full p-4 sm:p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 select-none ${
                expandedSection === 'resumen'
                  ? 'bg-white/85 dark:bg-white/95 text-black dark:text-neutral-950 border-white/90 dark:border-white shadow-xl shadow-black/5 dark:shadow-white/10 ring-2 ring-black/10 dark:ring-white/30 backdrop-blur-2xl'
                  : 'bg-white/40 dark:bg-neutral-950/40 backdrop-blur-xl text-neutral-800 dark:text-neutral-200 border-black/10 dark:border-white/10 hover:bg-white/65 dark:hover:bg-neutral-900/60 hover:border-black/20 dark:hover:border-white/20 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    expandedSection === 'resumen'
                      ? 'bg-black/10 text-neutral-950 shadow-xs'
                      : 'bg-black/5 dark:bg-white/10 text-amber-500'
                  }`}
                >
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                </div>
                <div className="min-w-0 font-sans">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-xl transition-colors ${
                        expandedSection === 'resumen'
                          ? 'bg-black/10 text-neutral-900'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      01
                    </span>
                    <h3 className="text-base sm:text-lg font-bold truncate tracking-tight">
                      Resumen General
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        expandedSection === 'resumen'
                          ? 'bg-black/10 text-black'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {overallProgressPercentage}% Avance Integral
                    </span>
                  </div>
                  <p
                    className={`text-xs font-normal truncate mt-1 ${
                      expandedSection === 'resumen'
                        ? 'text-neutral-600'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    Talleres troncales, sesiones individuales y próximos hitos
                  </p>
                </div>
              </div>

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                  expandedSection === 'resumen'
                    ? 'rotate-180 bg-black/10 text-black'
                    : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === 'resumen' && (
                <motion.div
                  key="accordion-content-resumen"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden space-y-5 pt-1 pb-2 font-sans"
                >
                  {/* ========================================================================= */}
                  {/* 1. PRIMERO: TALLERES TRONCALES (RAÍZ, TALLO, FLORECIMIENTO)                */}
                  {/* ========================================================================= */}
                  <section
                    id="panel-progreso-talleres-troncales"
                    className="p-5 sm:p-7 rounded-3xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-neutral-950/40 backdrop-blur-2xl shadow-xs space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                              Tronco Académico & Ontológico
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 text-[10px] font-semibold">
                              3 Ciclos RBC
                            </span>
                          </div>
                          <h2 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight">
                            Talleres Troncales (Raíz, Tallo, Florecimiento)
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                            {accreditedWorkshopsCount} de 3 Talleres Acreditados
                          </div>
                          <div className="text-lg sm:text-xl font-extrabold text-black dark:text-white leading-tight">
                            {Math.round((accreditedWorkshopsCount / 3) * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progreso Continua de Talleres */}
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-black dark:bg-white transition-all duration-700 ease-out"
                          style={{ width: `${Math.min(100, Math.round((accreditedWorkshopsCount / 3) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* 3 Bloques Visuales de Talleres (Raíz, Tallo, Florecimiento) Sincronizados con Admin y Google Workspace */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {enrichedCoreWorkshops.map((ws, idx) => {
                        const isAttended = isWorkshopAttended(ws);
                        const isCurrentCycleWs = currentCycle === idx + 1;
                        const matchingEvt = cronogramaEvents.find(evt =>
                          ws.matchIds.some(
                            id =>
                              evt.id.toLowerCase().includes(id) ||
                              evt.title.toLowerCase().includes(ws.stageName.toLowerCase())
                          )
                        );
                        const dateLabel = matchingEvt?.date ? formatHumanDate(matchingEvt.date) : ws.defaultDate;
                        const formLink = ws.googleFormsUrl || ws.agreementFormUrl || OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.formUrl;
                        const sheetLink = ws.googleSheetsUrl || ws.agreementSheetUrl || OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.sheetUrl;
                        const autocratLink = ws.autocratFolderUrl || ws.autocratUrl || OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.autocratFolderUrl;

                        return (
                          <div
                            key={ws.id}
                            className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 text-xs transition-all ${
                              isAttended
                                ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                                : isCurrentCycleWs
                                ? 'bg-black/5 dark:bg-white/10 border-black/20 dark:border-white/20 text-black dark:text-white font-medium ring-1 ring-black/10 dark:ring-white/20'
                                : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-neutral-500 dark:text-neutral-400 opacity-90'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                  Ciclo 0{idx + 1} • {ws.stageName}
                                </span>
                                <div>
                                  {isAttended ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                      <span>Acreditado</span>
                                    </span>
                                  ) : isCurrentCycleWs ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                      <span>En Curso</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-neutral-500 dark:text-neutral-400 text-[10px] font-medium">
                                      Programado
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="font-bold text-sm text-black dark:text-white leading-snug">
                                {ws.title}
                              </div>

                              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                                {ws.thematicFocus || ws.subtitle}
                              </p>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                              <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                                <span className="truncate">{dateLabel}</span>
                                <span className="shrink-0 font-medium">Facilitador: John Fredy Rengifo</span>
                              </div>

                              {/* Accesos rápidos Workspace para cada Taller: Meet, Forms, Sheets, AutoCrat */}
                              <div className="grid grid-cols-2 gap-1.5 pt-1">
                                <a
                                  href={ws.meetLink || 'https://meet.google.com/rbc-conversatorio-ontologico'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-black text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                  title="Ingresar a la Sala Google Meet del Taller"
                                >
                                  <Video className="w-2.5 h-2.5 text-emerald-400 dark:text-emerald-600" />
                                  <span>Google Meet</span>
                                </a>

                                <a
                                  href={formLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors border border-purple-500/20 cursor-pointer"
                                  title="Formulario Oficial de Evaluación y Registro en Google Forms"
                                >
                                  <FileText className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                                  <span>Google Forms</span>
                                </a>

                                <a
                                  href={sheetLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors border border-emerald-500/20 cursor-pointer"
                                  title="Hoja de Cálculo en Google Sheets con Expediente y Respuestas"
                                >
                                  <FileSpreadsheet className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Google Sheets</span>
                                </a>

                                {autocratLink ? (
                                  <a
                                    href={autocratLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors border border-amber-500/20 cursor-pointer"
                                    title="Carpeta de Documentos y Automatizaciones de AutoCrat en Google Drive"
                                  >
                                    <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                    <span>AutoCrat Drive</span>
                                  </a>
                                ) : (
                                  <div className="px-2 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-neutral-400 text-[10px] font-medium flex items-center justify-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 opacity-40" />
                                    <span>AutoCrat Auto</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-black/10 dark:border-white/10">
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="font-semibold text-black dark:text-white">Avance Integral Global:</span> {overallProgressPercentage}% ({completedJourneyItems} de {totalJourneyItems} hitos acreditados)
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-1.5"
                          title="Tus respuestas y bitácoras se resguardan de forma privada en tu expediente personal"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Expediente Privado</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openSection('talleres')}
                          className="px-4 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-700 text-xs font-semibold text-black dark:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Consultar Temario Completo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* ========================================================================= */}
                  {/* 2. SEGUNDO: SESIONES INDIVIDUALES 1 A 1                                   */}
                  {/* ========================================================================= */}
                  <section
                    id="panel-progreso-sesiones-individuales"
                    className="p-5 sm:p-7 rounded-3xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-neutral-950/40 backdrop-blur-2xl shadow-xs space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                              Acompañamiento Personalizado
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 text-[10px] font-semibold">
                              12 Estaciones
                            </span>
                          </div>
                          <h2 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight">
                            Sesiones Individuales 1 a 1
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                            {completedSessionsCount} de 12 Sesiones Acreditadas
                          </div>
                          <div className="text-lg sm:text-xl font-extrabold text-black dark:text-white leading-tight">
                            {Math.round((completedSessionsCount / 12) * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progreso Continua con Hitos de Ciclos */}
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-black dark:bg-white transition-all duration-700 ease-out"
                          style={{ width: `${Math.min(100, Math.round((completedSessionsCount / 12) * 100))}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                        <span>Ciclo 1: Raíz (Estaciones 1-4)</span>
                        <span>Ciclo 2: Tallo (Estaciones 5-8)</span>
                        <span>Ciclo 3: Florecimiento (Estaciones 9-12)</span>
                      </div>
                    </div>

                    {/* Gráfico Visual de las 12 Estaciones */}
                    <div className="space-y-2.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block">
                        Ruta de las 12 Estaciones Ontológicas
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
                        {Array.from({ length: 12 }, (_, i) => {
                          const stepNum = i + 1;
                          const isCompleted = stepNum < currentSessionNumber || sessions.some(s => s.sessionNumber === stepNum && s.status === 'completed');
                          const isCurrent = stepNum === currentSessionNumber;

                          return (
                            <div
                              key={`station-node-${stepNum}`}
                              title={`Estación ${stepNum}: ${PROGRAM_NODES[i]?.sessionTitle || ''}`}
                              className={`h-11 rounded-2xl flex flex-col items-center justify-center text-[10px] font-bold transition-all relative group cursor-default border ${
                                isCurrent
                                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm ring-2 ring-emerald-500/60 scale-102'
                                  : isCompleted
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                  : 'bg-black/5 dark:bg-white/5 text-neutral-400 dark:text-neutral-600 border-black/5 dark:border-white/5'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              ) : isCurrent ? (
                                <span className="flex items-center justify-center">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
                                  <span>{stepNum < 10 ? `0${stepNum}` : stepNum}</span>
                                </span>
                              ) : (
                                <span>{stepNum < 10 ? `0${stepNum}` : stepNum}</span>
                              )}
                              <span className="text-[8px] font-semibold opacity-75 mt-0.5">
                                {isCurrent ? 'Actual' : isCompleted ? 'Listo' : `E${stepNum}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-black/10 dark:border-white/10">
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="font-semibold text-black dark:text-white">Estación activa:</span> #{currentSessionNumber} ({currentNodeInfo.sessionTitle})
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Abrir Formulario Oficial de Bitácora Coach"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Bitácora Coach</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openSection('sesiones')}
                          className="px-4 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-700 text-xs font-semibold text-black dark:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Consultar Sesiones & Expediente</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* ========================================================================= */}
                  {/* 3. TERCERO: PANEL DE PRÓXIMOS HITOS CONECTADOS                            */}
                  {/* ========================================================================= */}
                  <section
                    id="panel-proximos-hitos-conectados"
                    className="p-5 sm:p-7 rounded-3xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-neutral-950/40 backdrop-blur-2xl shadow-xs space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block">
                            Sincronizado con Panel de Administración
                          </span>
                          <h2 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight">
                            Próximos Hitos Conectados
                          </h2>
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                        <Activity className="w-3 h-3 animate-pulse text-emerald-500" />
                        <span>Conexión en Tiempo Real</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Hito A: Próxima Sesión Individual 1 a 1 */}
                      <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Próxima Sesión Individual 1 a 1</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              {currentSession.status === 'completed' ? 'Completada ✓' : 'Agendada en Calendario'}
                            </span>
                          </div>
                          <div className="text-sm sm:text-base font-bold text-black dark:text-white">
                            Sesión #{currentSessionNumber} de 12: {currentNodeInfo.sessionTitle}
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {formatHumanDate(currentSession.date)} • Duración: {currentSession.durationMinutes || 60} minutos
                          </p>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                          <a
                            href={currentSession.meetLink || 'https://meet.google.com/new'}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                          >
                            <Video className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                            <span>Unirme por Google Meet</span>
                          </a>
                          <div className="grid grid-cols-2 gap-1.5">
                            <a
                              href={currentSessionGCalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-800/60 text-[10px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-700 transition-colors text-center inline-flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                              title="Agendar en Google Calendar"
                            >
                              <Calendar className="w-3 h-3 text-neutral-500" />
                              <span>Calendar</span>
                            </a>
                            <a
                              href={OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-800/60 text-[10px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-700 transition-colors text-center inline-flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                              title="Abrir Formulario de Bitácora"
                            >
                              <FileText className="w-3 h-3 text-indigo-500" />
                              <span>Bitácora (Forms)</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Hito B: Próximo Taller Troncal en Vivo */}
                      <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Taller Troncal RBC en Vivo</span>
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
                          <div className="text-sm sm:text-base font-bold text-black dark:text-white line-clamp-1">
                            {currentCycleWorkshop.title}
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            Ciclo {currentCycle} ({currentCycleWorkshop.stageName}) • Facilitador: John Fredy Rengifo Basto
                          </p>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                          <a
                            href={currentCycleWorkshop.meetLink || 'https://meet.google.com/rbc-conversatorio-ontologico'}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                          >
                            <Video className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600" />
                            <span>Sala del Taller (Meet)</span>
                          </a>
                          <div className="grid grid-cols-2 gap-1.5">
                            <a
                              href={OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.formUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-800/60 text-[10px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-700 transition-colors text-center inline-flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                              title="Acuerdo de Convivencia en Google Forms"
                            >
                              <span>Acuerdo (Forms)</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                            <a
                              href={OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.formUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-800/60 text-[10px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-700 transition-colors text-center inline-flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                              title="Bitácora de Cosecha del Taller"
                            >
                              <span>Bitácora (Forms)</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 2: TALLERES & TEMARIO                                           */}
          {/* ----------------------------------------------------------------------- */}
          <div id="accordion-item-talleres" className="space-y-3">
            <button
              id="btn-accordion-talleres"
              type="button"
              onClick={() => toggleSection('talleres')}
              aria-expanded={expandedSection === 'talleres'}
              className={`w-full p-4 sm:p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 select-none ${
                expandedSection === 'talleres'
                  ? 'bg-white/85 dark:bg-white/95 text-black dark:text-neutral-950 border-white/90 dark:border-white shadow-xl shadow-black/5 dark:shadow-white/10 ring-2 ring-black/10 dark:ring-white/30 backdrop-blur-2xl'
                  : 'bg-white/40 dark:bg-neutral-950/40 backdrop-blur-xl text-neutral-800 dark:text-neutral-200 border-black/10 dark:border-white/10 hover:bg-white/65 dark:hover:bg-neutral-900/60 hover:border-black/20 dark:hover:border-white/20 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    expandedSection === 'talleres'
                      ? 'bg-black/10 text-neutral-950 shadow-xs'
                      : 'bg-black/5 dark:bg-white/10 text-indigo-500'
                  }`}
                >
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                </div>
                <div className="min-w-0 font-sans">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-xl transition-colors ${
                        expandedSection === 'talleres'
                          ? 'bg-black/10 text-neutral-900'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      02
                    </span>
                    <h3 className="text-base sm:text-lg font-bold truncate tracking-tight">
                      Talleres & Temario
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        expandedSection === 'talleres'
                          ? 'bg-black/10 text-black'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {accreditedWorkshopsCount} de 3 Acreditados
                    </span>
                  </div>
                  <p
                    className={`text-xs font-normal truncate mt-1 ${
                      expandedSection === 'talleres'
                        ? 'text-neutral-600'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    Ruta de los 3 ciclos troncales, temario vivencial y compendio
                  </p>
                </div>
              </div>

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                  expandedSection === 'talleres'
                    ? 'rotate-180 bg-black/10 text-black'
                    : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === 'talleres' && (
                <motion.div
                  key="accordion-content-talleres"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden space-y-6 pt-1 pb-2 font-sans"
                >
                  <ParticipantTalleresModule
                    accreditedWorkshopsCount={accreditedWorkshopsCount}
                    coreWorkshops={enrichedCoreWorkshops}
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

          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 3: SESIONES                                                     */}
          {/* ----------------------------------------------------------------------- */}
          <div id="accordion-item-sesiones" className="space-y-3">
            <button
              id="btn-accordion-sesiones"
              type="button"
              onClick={() => toggleSection('sesiones')}
              aria-expanded={expandedSection === 'sesiones'}
              className={`w-full p-4 sm:p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 select-none ${
                expandedSection === 'sesiones'
                  ? 'bg-white/85 dark:bg-white/95 text-black dark:text-neutral-950 border-white/90 dark:border-white shadow-xl shadow-black/5 dark:shadow-white/10 ring-2 ring-black/10 dark:ring-white/30 backdrop-blur-2xl'
                  : 'bg-white/40 dark:bg-neutral-950/40 backdrop-blur-xl text-neutral-800 dark:text-neutral-200 border-black/10 dark:border-white/10 hover:bg-white/65 dark:hover:bg-neutral-900/60 hover:border-black/20 dark:hover:border-white/20 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    expandedSection === 'sesiones'
                      ? 'bg-black/10 text-neutral-950 shadow-xs'
                      : 'bg-black/5 dark:bg-white/10 text-emerald-500'
                  }`}
                >
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                </div>
                <div className="min-w-0 font-sans">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-xl transition-colors ${
                        expandedSection === 'sesiones'
                          ? 'bg-black/10 text-neutral-900'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      03
                    </span>
                    <h3 className="text-base sm:text-lg font-bold truncate tracking-tight">
                      Sesiones
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        expandedSection === 'sesiones'
                          ? 'bg-black/10 text-black'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {completedSessionsCount} de 12 Realizadas
                    </span>
                  </div>
                  <p
                    className={`text-xs font-normal truncate mt-1 ${
                      expandedSection === 'sesiones'
                        ? 'text-neutral-600'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    Acompañamiento individual, bitácoras y memorias descargables
                  </p>
                </div>
              </div>

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                  expandedSection === 'sesiones'
                    ? 'rotate-180 bg-black/10 text-black'
                    : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === 'sesiones' && (
                <motion.div
                  key="accordion-content-sesiones"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden space-y-6 pt-1 pb-2 font-sans"
                >
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

          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 4: EXPEDIENTE ONTOLÓGICO, BITÁCORAS & AUTOMATIZACIONES (WORKSPACE) */}
          {/* ----------------------------------------------------------------------- */}
          <div id="accordion-item-expediente" className="space-y-3">
            <button
              id="btn-accordion-expediente"
              type="button"
              onClick={() => toggleSection('expediente')}
              aria-expanded={expandedSection === 'expediente'}
              className={`w-full p-4 sm:p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 select-none ${
                expandedSection === 'expediente'
                  ? 'bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/30 text-black dark:text-white shadow-xs'
                  : 'bg-white/40 dark:bg-neutral-900/40 border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-black dark:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                    expandedSection === 'expediente'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        expandedSection === 'expediente'
                          ? 'bg-purple-500/20 text-purple-900 dark:text-purple-200'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      04
                    </span>
                    <h3 className="text-base sm:text-lg font-bold truncate tracking-tight">
                      Expediente en Vivo & Workspace
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        expandedSection === 'expediente'
                          ? 'bg-purple-500/20 text-purple-900 dark:text-purple-200'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {clientCrossData.talleres.length + clientCrossData.bitacorasTalleres.length + clientCrossData.acuerdos.length + clientCrossData.b2b.length} Registros
                    </span>
                  </div>
                  <p
                    className={`text-xs font-normal truncate mt-1 ${
                      expandedSection === 'expediente'
                        ? 'text-neutral-700 dark:text-neutral-300'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    Google Meet, Forms, Sheets, expedientes procesados y automatizaciones AutoCrat
                  </p>
                </div>
              </div>

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                  expandedSection === 'expediente'
                    ? 'rotate-180 bg-black/10 text-black dark:text-white'
                    : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === 'expediente' && (
                <motion.div
                  key="accordion-content-expediente"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden space-y-6 pt-1 pb-2 font-sans"
                >
                  <div className="p-5 sm:p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl space-y-6">
                    {/* Barra Superior de Sincronización en Tiempo Real */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                            <span>Sincronización en Tiempo Real Activa</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                              Google Workspace & AutoCrat
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                            Tus respuestas en formularios de Google Forms y hojas de cálculo se integran instantáneamente a tu expediente.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSyncExpedienteLive}
                        disabled={isSyncingExpediente}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingExpediente ? 'animate-spin' : ''}`} />
                        <span>{isSyncingExpediente ? 'Sincronizando...' : 'Actualizar Expediente'}</span>
                      </button>
                    </div>

                    {expedienteSyncSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{expedienteSyncSuccess}</span>
                      </div>
                    )}

                    {/* Botonera de Enlaces Oficiales de Google Workspace */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Enlaces Directos de Acceso y Formularios Oficiales
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* 1. Salas Virtuales Google Meet */}
                        <div className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-800/70 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white">
                            <Video className="w-4 h-4 text-emerald-500" />
                            <span>Salas Google Meet</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                            Acceso directo a las salas virtuales de encuentros y talleres en vivo.
                          </p>
                          <div className="pt-1 flex flex-col gap-1.5">
                            <a
                              href={currentSession.meetLink || 'https://meet.google.com/rbc-sesion'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-black text-[11px] font-semibold flex items-center justify-between"
                            >
                              <span>Sala Sesión #{currentSessionNumber}</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                            <a
                              href={currentCycleWorkshop.meetLink || 'https://meet.google.com/rbc-conversatorio-ontologico'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold flex items-center justify-between"
                            >
                              <span>Sala Taller ({currentCycleWorkshop.stageName})</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                          </div>
                        </div>

                        {/* 2. Formularios Oficiales Google Forms */}
                        <div className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-800/70 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400">
                            <FileText className="w-4 h-4" />
                            <span>Google Forms</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                            Diligencia o actualiza tus acuerdos y bitácoras de cosecha vivencial.
                          </p>
                          <div className="pt-1 flex flex-col gap-1.5">
                            <a
                              href={OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.formUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] font-semibold flex items-center justify-between"
                            >
                              <span>Registro a Talleres</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                            <a
                              href={OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.formUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] font-semibold flex items-center justify-between"
                            >
                              <span>Bitácora de Talleres</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                            <a
                              href={OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] font-semibold flex items-center justify-between"
                            >
                              <span>Acuerdo Co-creativo 1 a 1</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                          </div>
                        </div>

                        {/* 3. Hojas de Cálculo Google Sheets */}
                        <div className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-800/70 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Google Sheets</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                            Hojas maestras con respuestas, marcas temporales y registro estructurado.
                          </p>
                          <div className="pt-1 flex flex-col gap-1.5">
                            <a
                              href={OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.sheetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold flex items-center justify-between"
                            >
                              <span>Hojas Talleres (1 a 1)</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                            <a
                              href={OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.sheetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold flex items-center justify-between"
                            >
                              <span>Hojas Bitácoras Cosecha</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                            <a
                              href={OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.sheetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold flex items-center justify-between"
                            >
                              <span>Hojas Acuerdos 1 a 1</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                          </div>
                        </div>

                        {/* 4. Google Drive & Automatizaciones AutoCrat */}
                        <div className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-800/70 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                            <Sparkles className="w-4 h-4" />
                            <span>AutoCrat & Drive</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                            Carpeta de expedientes, acuerdos combinados y constancias generadas en PDF.
                          </p>
                          <div className="pt-1 flex flex-col gap-1.5">
                            <a
                              href={OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.autocratFolderUrl || 'https://drive.google.com/drive/folders/1aG0XqgL0tHw2r9X8Q6Wz'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-center justify-between"
                            >
                              <span>Carpeta AutoCrat Drive</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                            <a
                              href={OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.autocratFolderUrl || 'https://drive.google.com/drive/folders/1bH1YrhM1uIx3s0Y9R7Xa'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-center justify-between"
                            >
                              <span>Expedientes Acuerdos</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resumen del Expediente Registrado en Tiempo Real */}
                    <div className="space-y-4 pt-2 border-t border-black/10 dark:border-white/10">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                          Bitácoras Vivenciales y Registros del Participante
                        </h4>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {clientCrossData.bitacorasTalleres.length} bitácora(s) de taller procesada(s)
                        </span>
                      </div>

                      {clientCrossData.bitacorasTalleres.length > 0 ? (
                        <div className="space-y-3">
                          {clientCrossData.bitacorasTalleres.map((bt) => (
                            <div
                              key={bt.id}
                              className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80 space-y-3 text-xs"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-black/5 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-900 dark:text-purple-300 font-bold text-[10px]">
                                    {bt.workshopTitle || 'Taller Ontológico RBC'}
                                  </span>
                                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                    {bt.timestamp ? new Date(bt.timestamp).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Fecha registrada'}
                                  </span>
                                </div>
                                {bt.somaticEmotion && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-500/20">
                                    Emoción: {bt.somaticEmotion}
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                {bt.breakthrough && (
                                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                                    <span className="font-bold text-neutral-700 dark:text-neutral-300 uppercase text-[9px] block">
                                      Quiebre / Situación
                                    </span>
                                    <p className="text-neutral-800 dark:text-neutral-200">{bt.breakthrough}</p>
                                  </div>
                                )}
                                {bt.limitingBelief && (
                                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                                    <span className="font-bold text-neutral-700 dark:text-neutral-300 uppercase text-[9px] block">
                                      Juicio Limitante
                                    </span>
                                    <p className="text-neutral-800 dark:text-neutral-200">{bt.limitingBelief}</p>
                                  </div>
                                )}
                                {bt.newObserver && (
                                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                                    <span className="font-bold text-neutral-700 dark:text-neutral-300 uppercase text-[9px] block">
                                      Nuevo Observador
                                    </span>
                                    <p className="text-neutral-800 dark:text-neutral-200">{bt.newObserver}</p>
                                  </div>
                                )}
                                {bt.actionCommitment && (
                                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                                    <span className="font-bold text-neutral-700 dark:text-neutral-300 uppercase text-[9px] block">
                                      Compromiso y Acción
                                    </span>
                                    <p className="text-neutral-800 dark:text-neutral-200">{bt.actionCommitment}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl border border-dashed border-black/15 dark:border-white/15 text-center space-y-2">
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            Aún no hay bitácoras vivenciales registradas desde los formularios de Google Forms para tu correo electrónico.
                          </p>
                          <a
                            href={OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.formUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Diligenciar Bitácora de Cosecha Ahora</span>
                          </a>
                        </div>
                      )}

                      {/* Registro a Talleres Confirmado */}
                      {clientCrossData.talleres.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block">
                            Inscripciones de Taller Confirmadas:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {clientCrossData.talleres.map((t) => (
                              <div
                                key={t.id}
                                className="p-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-black dark:text-white">
                                    {t.workshopTitle || 'Taller RBC'}
                                  </div>
                                  <div className="text-[10px] text-neutral-500">
                                    {t.timestamp ? new Date(t.timestamp).toLocaleDateString() : 'Registrado'} • {t.agreedEthics ? 'Ética Aceptada' : 'Confirmado'}
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                                  Activo ✓
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. PIE DE PÁGINA (FOOTER) INTEGRADO: PERFIL DEL COACH Y CONTACTO DIRECTO  */}
        {/* ========================================================================= */}
        <footer
          id="app-footer-coach"
          aria-label="Pie de página institucional y contacto del Coach Ontológico"
          className="pt-4 space-y-6 font-sans"
        >
          {/* Tarjeta de perfil y canales directos en Liquid Glass */}
          <div className="p-5 sm:p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-950/30 backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs hover:border-black/20 dark:hover:border-white/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={coachAvatarImg}
                  alt="John Fredy Rengifo Basto"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-black/15 dark:border-white/15 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-950 shadow-xs" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                    Canal Directo Activo
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight">
                  John Fredy Rengifo Basto
                </h2>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Coach Ontológico
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                  Rengifo Basto Consultoría Ontológica
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
                className="px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-neutral-900/70 hover:bg-white dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Video className="w-4 h-4 text-indigo-500" />
                <span>Sala Meet 1 a 1</span>
              </a>
            </div>
          </div>

          {/* Cierre institucional de confidencialidad */}
          <div className="pb-4 text-center text-xs text-neutral-500 dark:text-neutral-400 font-light border-t border-black/5 dark:border-white/5 pt-4 space-y-1">
            <div className="font-semibold text-black dark:text-white">
              Rengifo Basto Consultoría Ontológica
            </div>
            <p className="text-[11px] opacity-75">
              Espacio confidencial y transformacional de acompañamiento ontológico ejecutivo
            </p>
          </div>
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
