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
} from 'lucide-react';
import { User, Session, PostSessionForm, CronogramaEvent, ProgramNodeInfo } from '../types';
import { OntologicalStore, COMPANY_INFO, PROGRAM_NODES, BRE_B_NU_CONFIG } from '../services/store';
import { FirestoreSyncService } from '../services/firestoreSync';
import { PDFGenerator } from '../utils/pdfGenerator';
import { safeCopyToClipboard } from '../utils/clipboard';
import { PostSessionWorkbookModal } from './PostSessionWorkbookModal';
import { CURATED_EXPERIENCE_PHOTOS } from '../data/initialExperiences';
import coachAvatarImg from '../assets/images/regenerated_image_1788287101599.jpg';
import whiteWavesBg from '../assets/images/white_waves_bg_1788461168119.jpg';

interface ClientDashboardProps {
  client: User;
  onLogout?: () => void;
  onUserUpdated?: () => void;
  onViewSessionForm?: (session: Session) => void;
  onOpenDiagnosticWorkspace?: () => void;
}

// Definición canónica de los 3 talleres ontológicos fundamentales
interface CoreWorkshopTrack {
  id: string;
  matchIds: string[];
  stageName: 'Raíz' | 'Tallo' | 'Florecimiento';
  phase: string;
  levelBadge: string;
  accentColor: 'emerald' | 'amber' | 'indigo';
  title: string;
  subtitle: string;
  thematicFocus: string;
  guidingQuestion: string;
  somaticPractice: string;
  meetLink: string;
  defaultDate: string;
  defaultBreakthrough: string;
  defaultCommitments: string;
}

const CORE_WORKSHOPS: CoreWorkshopTrack[] = [
  {
    id: 'taller-1-raiz',
    matchIds: ['taller-1-raiz', 'taller-1', 'raiz', 'event-raiz-balance'],
    stageName: 'Raíz',
    phase: 'Fase I • Fundamentos & Transparencia',
    levelBadge: 'Nivel I • Fase Raíz',
    accentColor: 'emerald',
    title: 'Taller 1: Raíz y Balance Ontológico',
    subtitle: 'Mapeo de la Transparencia, Decodificación Somática & Quiebres Inconscientes',
    thematicFocus:
      'Suspensión reflexiva del piloto automático, decodificación de tensiones musculares y reconocimiento de quiebres ocultos en la rutina ejecutiva.',
    guidingQuestion:
      '¿En qué áreas de tu vida estás operando en piloto automático tolerando costos ocultos que drenan tu energía vital?',
    somaticPractice:
      'Respiración diafragmática 4-2-6 y enraizamiento en planta de pies ante situaciones de alta fricción o reactividad.',
    meetLink: 'https://meet.google.com/hxt-rbco-grp',
    defaultDate: 'Ciclo Raíz',
    defaultBreakthrough:
      'Identificación de automatismos reactivos y apertura deliberada de espacio para la pausa reflexiva antes de responder.',
    defaultCommitments:
      'Pausa somática de 90 segundos al percibir tensión; registro quincenal de quiebres en la bitácora personal.',
  },
  {
    id: 'taller-2-tallo',
    matchIds: ['taller-2-tallo', 'taller-2', 'tallo', 'event-tallo'],
    stageName: 'Tallo',
    phase: 'Fase II • Fronteras & Soberanía Relacional',
    levelBadge: 'Nivel II • Fase Tallo',
    accentColor: 'amber',
    title: 'Taller 2: Tallo & Soberanía Relacional',
    subtitle: 'Fronteras, Actos Declarativos & Deconstrucción de la Culpa',
    thematicFocus:
      'El poder fundacional del "No" y del "Basta" ontológico. Deconstrucción de la culpa condicionada y diseño de conversaciones de frontera.',
    guidingQuestion:
      '¿Qué límites has omitido declarar por temor al conflicto o por necesidad aprendida de aprobación?',
    somaticPractice:
      'Apertura de caja torácica, alineación de eje vertical y anclaje de mirada asertiva sin contracción mandibular.',
    meetLink: 'https://meet.google.com/hxt-rbco-grp',
    defaultDate: 'Ciclo Tallo',
    defaultBreakthrough:
      'Declaración clara de fronteras personales sin culpa ni necesidad de justificaciones reactivas excesivas.',
    defaultCommitments:
      'Sostener el "No" limpio y respetuoso ante peticiones que vulneren el descanso o la coherencia interna.',
  },
  {
    id: 'taller-3-florecimiento',
    matchIds: ['taller-3-florecimiento', 'taller-3', 'florecimiento', 'event-florecimiento'],
    stageName: 'Florecimiento',
    phase: 'Fase III • Maestría Lingüística & Cosecha',
    levelBadge: 'Nivel III • Fase Florecimiento',
    accentColor: 'indigo',
    title: 'Taller 3: Florecimiento & Integración',
    subtitle: 'El Nuevo Observador, Maestría Lingüística & Cosecha Integral',
    thematicFocus:
      'Integración coherente de cuerpo, emoción y lenguaje. Proclamación del Manifiesto de Soberanía Personal y coordinación impecable de compromisos.',
    guidingQuestion:
      '¿Desde qué nuevo observador estás eligiendo diseñar tu futuro y tus acuerdos relacionales?',
    somaticPractice:
      'Presencia centrada, respiración fluida y soltura mandibular para articulación de juicios fundados y promesas claras.',
    meetLink: 'https://meet.google.com/hxt-rbco-grp',
    defaultDate: 'Ciclo Florecimiento',
    defaultBreakthrough:
      'Habitar un observador reflexivo con capacidad de generar nuevas realidades a través de la palabra comprometida.',
    defaultCommitments:
      'Revisión periódica del Manifiesto Ontológico y cumplimiento riguroso de promesas y pedidos directivos.',
  },
];

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

  // Estados de navegación e interacción modular (todos cerrados por defecto al entrar)
  const [expandedModules, setExpandedModules] = useState<{
    rutaGrafica: boolean;
    talleres: boolean;
    bitacoras: boolean;
  }>({
    rutaGrafica: false, // Inicia cerrado
    talleres: false,    // Inicia cerrado
    bitacoras: false,   // Inicia cerrado
  });

  const toggleModule = (moduleKey: 'rutaGrafica' | 'talleres' | 'bitacoras') => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }));
  };

  const [selectedStationNumber, setSelectedStationNumber] = useState<number>(() =>
    client.programProgress || 1
  );
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('taller-1-raiz');

  // Modal para edición/registro de bitácora
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeSessionForModal, setActiveSessionForModal] = useState<Session | null>(null);

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

  // Información de la estación seleccionada en el Módulo 1
  const selectedNodeInfo: ProgramNodeInfo | undefined = useMemo(() => {
    return (
      PROGRAM_NODES.find((node) => node.step === selectedStationNumber) ||
      PROGRAM_NODES[Math.min(selectedStationNumber - 1, PROGRAM_NODES.length - 1)]
    );
  }, [selectedStationNumber]);

  const selectedSession: Session = useMemo(() => {
    const found = sessions.find((s) => s.sessionNumber === selectedStationNumber);
    if (found) return found;

    return {
      id: `sess-${activeUser.uid}-${selectedStationNumber}`,
      sessionNumber: selectedStationNumber,
      clientId: activeUser.uid,
      clientName: activeUser.name,
      date: new Date().toISOString(),
      status: selectedStationNumber < currentSessionNumber ? 'completed' : 'scheduled',
      durationMinutes: 60,
      meetLink: `https://meet.google.com/rbc-${(activeUser.name || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${selectedStationNumber}`,
      notes: '',
      keyInsights: [],
      actionAgreements: [],
      somaticFocus: '',
      programNodeStep: selectedStationNumber,
    };
  }, [sessions, selectedStationNumber, activeUser, currentSessionNumber]);

  const selectedForm: PostSessionForm | undefined = useMemo(() => {
    return postForms.find((f) => f.sessionNumber === selectedStationNumber);
  }, [postForms, selectedStationNumber]);

  // Historial condensado de cuestionarios finalizados
  const pastForms = useMemo(() => {
    return postForms.slice().sort((a, b) => b.sessionNumber - a.sessionNumber);
  }, [postForms]);

  // Verificación de asistencia a talleres
  const isWorkshopAttended = (ws: CoreWorkshopTrack) => {
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
    PDFGenerator.generateWorkshopMemoryPDF(ws.title, activeUser, {
      workshopCategory: ws.levelBadge,
      completedAt: details.completedAt,
      keyBreakthrough: details.keyBreakthrough,
      commitments: details.commitments,
      somaticPractice: ws.somaticPractice,
      answers: details.answers,
    });
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

  const handleDownloadMemory = (form: PostSessionForm, sess?: Session) => {
    PDFGenerator.generateSessionWorkbookPDF(form, activeUser, sess || currentSession);
  };

  // Contar talleres acreditados y sesiones completadas para el avance integral
  const accreditedWorkshopsCount = useMemo(() => {
    return CORE_WORKSHOPS.filter((w) => isWorkshopAttended(w)).length;
  }, [activeUser, cronogramaEvents, currentSessionNumber]);

  const completedSessionsCount = useMemo(() => {
    const completedExplicit = sessions.filter((s) => s.status === 'completed').length;
    // Si el participante está en el encuentro N, ha completado al menos N-1 encuentros
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
        {/* 1. CABECERA LIMPIA: SIN BOTONES DE PAGO NI PROGRESO INDEPENDIENTE          */}
        {/* ========================================================================= */}
        <header className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl p-6 sm:p-7 space-y-5 shadow-xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    activeUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={activeUser.name}
                  referrerPolicy="no-referrer"
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

            {/* Acción sobria en cabecera: Únicamente Cerrar sesión */}
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

          {/* BLOQUE CENTRAL UNIFICADO DE PROGRESO CON ACENTO SUTIL DE COLOR Y LÍNEA CIRCULAR DE AVANCE */}
          <div className="p-4 sm:p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/25 dark:bg-neutral-900/35 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Indicador pulsante con acento según el ciclo */}
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
              {/* Anillo circular de carga con porcentaje */}
              <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                <svg className="w-11 h-11 -rotate-90 transform" viewBox="0 0 44 44">
                  {/* Anillo de fondo */}
                  <circle
                    cx="22"
                    cy="22"
                    r="17"
                    className="text-black/10 dark:text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Anillo de avance dinámico */}
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

              {/* Indicadores contextuales: detalle de avance sumando talleres y sesiones */}
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
        {/* 2. EL LIENZO CENTRAL: "TU MOMENTO ACTUAL" (ESPACIO 1 A 1)                 */}
        {/* ========================================================================= */}
        <section
          id="tu-momento-actual"
          className="rounded-3xl border border-black/10 dark:border-white/15 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Fotografía a color curada */}
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

          {/* Contenido Interior del Lienzo */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Pregunta de Apertura Ontológica: Contenedor limpio con transparencia elegante */}
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

                    <a
                      href="https://calendar.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-black/50 backdrop-blur-xs text-xs font-semibold hover:bg-white/70 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Reprogramar</span>
                    </a>
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

        {/* ========================================================================= */}
        {/* 3. MÓDULO 1: TU RUTA GRÁFICA (BOTÓN GENERAL LARGO Y EXPANDIBLE)           */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-black/10 dark:border-white/15 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
          {/* Botón General Largo de Apertura/Cierre */}
          <button
            type="button"
            onClick={() => toggleModule('rutaGrafica')}
            className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/30 dark:hover:bg-neutral-900/30 transition-colors select-none group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wider font-mono">
                    Módulo 1: Tu Ruta Gráfica & Progreso Integral
                  </h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30">
                    Estación E{currentSessionNumber.toString().padStart(2, '0')} en Curso
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                  12 estaciones individuales en 3 ciclos • Selección rápida, detalle del proceso y cuadernos de trabajo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-medium text-neutral-500 hidden sm:inline">
                {expandedModules.rutaGrafica ? 'Contraer' : 'Expandir módulo'}
              </span>
              <div
                className={`p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-transform duration-300 ${
                  expandedModules.rutaGrafica ? 'rotate-180' : ''
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Contenido Interior Desplegado */}
          {expandedModules.rutaGrafica && (
            <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-2 space-y-6 border-t border-black/5 dark:border-white/5">
              {/* Navegación Compacta de Estaciones (12 Botones Sutiles) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>Selecciona una estación para ver su detalle:</span>
                  <span className="hidden sm:inline">
                    Ciclo 1: E01-E04 • Ciclo 2: E05-E08 • Ciclo 3: E09-E12
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 sm:gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((stepNum) => {
                    const cycleNum = Math.ceil(stepNum / 4);
                    const isMilestone = stepNum === 4 || stepNum === 8 || stepNum === 12;
                    const isCompleted = stepNum < currentSessionNumber;
                    const isCurrent = stepNum === currentSessionNumber;
                    const isSelected = selectedStationNumber === stepNum;
                    const cycleAccent = getCycleAccent(cycleNum);

                    return (
                      <button
                        key={stepNum}
                        type="button"
                        onClick={() => setSelectedStationNumber(stepNum)}
                        title={`Estación ${stepNum} (Ciclo ${cycleNum})`}
                        className={`h-12 sm:h-14 p-1.5 sm:p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none relative ${
                          isSelected
                            ? 'ring-2 ring-black dark:ring-white bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                            : isCurrent
                            ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs border-black dark:border-white text-black dark:text-white font-semibold shadow-2xs'
                            : isCompleted
                            ? 'bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xs border-black/15 dark:border-white/15 text-neutral-800 dark:text-neutral-200 hover:border-black/30 dark:hover:border-white/30'
                            : 'bg-white/25 dark:bg-neutral-900/25 backdrop-blur-xs border-black/10 dark:border-white/10 text-neutral-400 dark:text-neutral-500 hover:bg-white/40 dark:hover:bg-neutral-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-mono font-bold tracking-tight">
                            E{stepNum.toString().padStart(2, '0')}
                          </span>
                          {isCompleted ? (
                            <CheckCircle2
                              className={`w-3 h-3 shrink-0 ${
                                isSelected
                                  ? 'text-white dark:text-black'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            />
                          ) : isCurrent ? (
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isSelected
                                  ? 'bg-white dark:bg-black'
                                  : 'bg-emerald-500 animate-pulse'
                              }`}
                            />
                          ) : (
                            <Circle className="w-2.5 h-2.5 shrink-0 opacity-30" />
                          )}
                        </div>

                        <div className="text-[9px] font-mono truncate tracking-tight flex items-center justify-between w-full opacity-85">
                          <span>C{cycleNum}</span>
                          {isMilestone && (
                            <span className="text-[9px] font-bold text-amber-500">★</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* INFORMACIÓN DETALLADA: CONTENEDOR CON TRANSPARENCIA ELEGANTE */}
              <div
                className="p-5 sm:p-6 rounded-2xl bg-white/30 dark:bg-neutral-900/40 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-sm space-y-4 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-black dark:text-white">
                        Estación {selectedStationNumber} •{' '}
                        {selectedNodeInfo?.sessionTitle || `Sesión ${selectedStationNumber}`}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase bg-neutral-100/70 dark:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10">
                        Ciclo {Math.ceil(selectedStationNumber / 4)}:{' '}
                        {selectedStationNumber % 4 === 0 ? 'Consolidación' : 'Exploración Libre'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light">
                      {selectedNodeInfo?.objective ||
                        'Espacio abierto al emergente y transformación del observador.'}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {selectedStationNumber < currentSessionNumber ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Estación Completada
                      </span>
                    ) : selectedStationNumber === currentSessionNumber ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-black dark:text-white bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xs border border-black/20 dark:border-white/20 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Estación Activa • Encuentro Actual
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 font-mono bg-white/20 dark:bg-neutral-800/30 border border-black/5 dark:border-white/5 px-2.5 py-1 rounded-full">
                        ○ En tu Ruta Próxima
                      </span>
                    )}
                  </div>
                </div>

                {/* Detalle del Proceso según Estado */}
                {selectedForm ? (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-white/25 dark:bg-neutral-950/40 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                          Tema Emergente & Quiebre Exploratorio:
                        </span>
                        <p className="text-neutral-900 dark:text-neutral-100 font-medium leading-relaxed">
                          {selectedForm.emergentTopic || selectedForm.masterJudgmentAndNarrative}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/25 dark:bg-neutral-950/40 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                          Paso a la Acción & Compromiso Asumido:
                        </span>
                        <p className="text-neutral-900 dark:text-neutral-100 font-medium leading-relaxed">
                          {selectedForm.actionStep ||
                            selectedForm.agreedActionItems?.[0] ||
                            selectedForm.coacheeKeyDeclaration ||
                            'Compromiso reflexivo y presencia consciente.'}
                        </p>
                      </div>
                    </div>

                    {selectedForm.discovery && (
                      <div className="p-3.5 rounded-xl bg-white/25 dark:bg-neutral-950/40 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                          Descubrimiento / Cambio de Perspectiva:
                        </span>
                        <p className="text-neutral-800 dark:text-neutral-200 font-light leading-relaxed">
                          {selectedForm.discovery}
                        </p>
                      </div>
                    )}

                    {selectedForm.cycleHarvest && (
                      <div className="p-3.5 rounded-xl bg-neutral-950/90 text-white dark:bg-white/90 dark:text-black space-y-1 shadow-2xs border border-amber-500/30 backdrop-blur-xs">
                        <span className="text-[10px] font-bold uppercase tracking-widest font-mono block text-amber-400 dark:text-amber-600">
                          ★ Cosecha del Ciclo Registrada:
                        </span>
                        <p className="font-light leading-relaxed">
                          {selectedForm.cycleHarvest}
                        </p>
                      </div>
                    )}

                    {/* Acceso Directo a Descarga de Cuaderno / Memoria */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDownloadMemory(selectedForm, selectedSession)}
                        className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                        <span>Descargar Cuaderno de Trabajo / Memoria (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenBitacora(selectedSession)}
                        className="px-3.5 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/60 backdrop-blur-xs text-xs font-medium hover:bg-white/70 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ver / Editar Bitácora Completa</span>
                      </button>
                    </div>
                  </div>
                ) : selectedStationNumber === currentSessionNumber ? (
                  <div className="space-y-3 text-xs">
                    <p className="text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                      Esta es tu estación activa en el ciclo actual. Al concluir tu sesión 1 a 1 con tu facilitador, podrás registrar la bitácora reflexiva y se generará automáticamente tu cuaderno de trabajo descargable.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <a
                        href={currentSession.meetLink || 'https://meet.google.com/new'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                        <span>Unirme a Sesión por Meet</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleOpenBitacora(selectedSession)}
                        className="px-4 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/60 backdrop-blur-xs text-xs font-semibold hover:bg-white/70 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Registrar Bitácora de la Sesión</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ================================================================ */
                  /* ESTACIÓN INACTIVA: SOLO INFORMACIÓN DE PAGO                      */
                  /* ================================================================ */
                  <div className="space-y-4 text-xs">
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/20 dark:bg-neutral-950/40 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 dark:bg-neutral-500 shrink-0" />
                          <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[11px] font-mono">
                            Estación {selectedStationNumber} • Inactiva
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                          Requiere formalización de inversión para su habilitación
                        </span>
                      </div>

                      {/* Opciones de Inversión */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-900/40 backdrop-blur-xs space-y-1 shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                            Inversión por Ciclo (4 Sesiones)
                          </span>
                          <div className="text-base font-bold text-black dark:text-white">
                            $500.000 COP
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                            Habilita las 4 estaciones del ciclo formativo con acompañamiento individual y bitácora reflexiva.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-900/40 backdrop-blur-xs space-y-1 shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                            Inversión Integral (12 Sesiones)
                          </span>
                          <div className="text-base font-bold text-black dark:text-white">
                            $1.500.000 COP
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                            Proceso completo de 12 semanas integrales (o 2 cuotas quincenales de $750.000 COP).
                          </p>
                        </div>
                      </div>

                      {/* Canales Oficiales de Pago */}
                      <div className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-900/40 backdrop-blur-xs space-y-3 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <Smartphone className="w-4 h-4 text-black dark:text-white shrink-0" />
                            <div>
                              <div className="text-xs font-semibold text-black dark:text-white">
                                {BRE_B_NU_CONFIG.title} ({BRE_B_NU_CONFIG.bank})
                              </div>
                              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light">
                                Llave oficial para transferencias sin costo desde cualquier entidad financiera
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs">
                              {BRE_B_NU_CONFIG.llave}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyPaymentKey}
                              className="px-3 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/60 backdrop-blur-xs text-black dark:text-white font-semibold text-[11px] hover:bg-white/70 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Copiar llave de pago"
                            >
                              {copiedPaymentKey ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span>¡Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                          Entidades compatibles: Nu, Bancolombia, Nequi, Daviplata, Dale, BBVA, Davivienda y Banco de Bogotá.
                        </div>
                      </div>

                      {/* Botón de Confirmación / Envío de Comprobante por WhatsApp */}
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light">
                          Al realizar tu transferencia, reporta el comprobante para habilitar esta estación:
                        </span>
                        <a
                          href={`https://wa.me/${BRE_B_NU_CONFIG.whatsappRaw}?text=${encodeURIComponent(
                            `Hola Coach John Fredy, adjunto comprobante de pago para habilitar la Estación ${selectedStationNumber} (${selectedNodeInfo?.sessionTitle || '1 a 1'}) del programa Certeza.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                          <span>Validar Comprobante por WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. MÓDULO 2: HISTORIAL DE TALLERES ASISTIDOS (BOTÓN GENERAL EXPANDIBLE)    */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-black/10 dark:border-white/15 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
          {/* Botón General Largo de Apertura/Cierre */}
          <button
            type="button"
            onClick={() => toggleModule('talleres')}
            className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/30 dark:hover:bg-neutral-900/30 transition-colors select-none group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wider font-mono">
                    Módulo 2: Historial de Talleres Asistidos
                  </h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30">
                    {accreditedWorkshopsCount} de 3 Talleres Acreditados
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                  Raíz, Tallo y Florecimiento • Respuestas registradas, quiebres ontológicos y memorias de cohorte
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-medium text-neutral-500 hidden sm:inline">
                {expandedModules.talleres ? 'Contraer' : 'Expandir módulo'}
              </span>
              <div
                className={`p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-transform duration-300 ${
                  expandedModules.talleres ? 'rotate-180' : ''
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Contenido Interior Desplegado */}
          {expandedModules.talleres && (
            <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-2 space-y-6 border-t border-black/5 dark:border-white/5">
              {/* Selector Compacto de Talleres (Fase 1, Fase 2, Fase 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-2">
                {CORE_WORKSHOPS.map((ws, idx) => {
                  const attended = isWorkshopAttended(ws);
                  const isSelected = selectedWorkshopId === ws.id;
                  const phaseNum = idx + 1;

                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => setSelectedWorkshopId(ws.id)}
                      className={`p-3 sm:py-3 sm:px-3.5 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'ring-2 ring-black dark:ring-white bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                          : 'bg-white/25 dark:bg-neutral-900/35 backdrop-blur-xs border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:border-black/30 dark:hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          F{phaseNum}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold font-mono uppercase tracking-wide truncate">
                            Fase {phaseNum}: {ws.stageName}
                          </div>
                          <div
                            className={`text-[11px] truncate font-light ${
                              isSelected
                                ? 'text-neutral-300 dark:text-neutral-700'
                                : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            {ws.stageName === 'Raíz'
                              ? 'Balance Ontológico'
                              : ws.stageName === 'Tallo'
                              ? 'Soberanía Relacional'
                              : 'Integración & Cosecha'}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {attended ? (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                              isSelected
                                ? 'bg-white text-black dark:bg-black dark:text-white'
                                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            }`}
                            title="Taller Acreditado"
                          >
                            ✓ <span className="hidden lg:inline">Acreditado</span>
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                                : 'bg-neutral-100/70 dark:bg-neutral-800/70 text-neutral-500'
                            }`}
                            title="Taller Programado"
                          >
                            ○ <span className="hidden lg:inline">Programado</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detalle y Memoria del Taller Seleccionado */}
              {(() => {
                const activeWorkshop =
                  CORE_WORKSHOPS.find((w) => w.id === selectedWorkshopId) || CORE_WORKSHOPS[0];
                const attended = isWorkshopAttended(activeWorkshop);
                const details = getWorkshopMemoryDetails(activeWorkshop);

                return (
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/30 dark:bg-neutral-900/40 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wider font-mono text-black dark:text-white">
                            {activeWorkshop.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase bg-neutral-100/70 dark:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10">
                            {activeWorkshop.levelBadge}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light">
                          {activeWorkshop.subtitle}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {attended ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Asistencia Acreditada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 font-mono bg-white/20 dark:bg-neutral-800/30 border border-black/10 dark:border-white/10 px-3 py-1 rounded-full">
                            ○ Taller en Tu Ruta
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contenido según acreditación: Taller Inactivo muestra SOLO PAGO */}
                    {!attended ? (
                      /* ============================================================ */
                      /* TALLER INACTIVO: SOLO INFORMACIÓN DE PAGO                    */
                      /* ============================================================ */
                      <div className="space-y-4 text-xs">
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/20 dark:bg-neutral-950/40 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 dark:bg-neutral-500 shrink-0" />
                              <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[11px] font-mono">
                                Taller No Acreditado • Cupo Inactivo
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                              Formaliza tu cupo para acceder a la sala virtual y compendio vivencial
                            </span>
                          </div>

                          {/* Inversión del Taller */}
                          <div className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-900/40 backdrop-blur-xs space-y-1 shadow-2xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                              Inversión Taller Individual Vivencial ({activeWorkshop.title})
                            </span>
                            <div className="text-base font-bold text-black dark:text-white">
                              $350.000 COP
                            </div>
                            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                              Incluye acceso en vivo a la sala virtual de 3 horas, cuaderno de trabajo somático y memoria integral en PDF.
                            </p>
                          </div>

                          {/* Canales Oficiales de Pago */}
                          <div className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-900/40 backdrop-blur-xs space-y-3 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <Smartphone className="w-4 h-4 text-black dark:text-white shrink-0" />
                                <div>
                                  <div className="text-xs font-semibold text-black dark:text-white">
                                    {BRE_B_NU_CONFIG.title} ({BRE_B_NU_CONFIG.bank})
                                  </div>
                                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light">
                                    Llave oficial para transferencias sin costo desde cualquier entidad
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs">
                                  {BRE_B_NU_CONFIG.llave}
                                </span>
                                <button
                                  type="button"
                                  onClick={handleCopyPaymentKey}
                                  className="px-3 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/60 backdrop-blur-xs text-black dark:text-white font-semibold text-[11px] hover:bg-white/70 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                  title="Copiar llave de pago"
                                >
                                  {copiedPaymentKey ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-500" />
                                      <span>¡Copiado!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copiar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                              Entidades compatibles: Nu, Bancolombia, Nequi, Daviplata, Dale, BBVA, Davivienda y Banco de Bogotá.
                            </div>
                          </div>

                          {/* Botón de Confirmación / Envío de Comprobante por WhatsApp */}
                          <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light">
                              Envía tu comprobante para reservar tu cupo y habilitar tus accesos:
                            </span>
                            <a
                              href={`https://wa.me/${BRE_B_NU_CONFIG.whatsappRaw}?text=${encodeURIComponent(
                                `Hola Coach John Fredy, adjunto comprobante de pago para reservar cupo en el Taller ${activeWorkshop.title} del programa Certeza.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer shadow-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                              <span>Validar Cupo por WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Contenido y Memorias Propias del Taller Acreditado */
                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-4 rounded-xl bg-white/25 dark:bg-neutral-950/40 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                              Quiebre Ontológico Central del Taller:
                            </span>
                            <p className="text-neutral-900 dark:text-neutral-100 font-medium leading-relaxed">
                              {details.keyBreakthrough}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-white/25 dark:bg-neutral-950/40 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                              Compromisos Adquiridos & Declaraciones:
                            </span>
                            <p className="text-neutral-900 dark:text-neutral-100 font-medium leading-relaxed">
                              {details.commitments}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xs border border-black/5 dark:border-white/5 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                            Foco Temático y Práctica Somática Vivencial:
                          </span>
                          <p className="text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                            {activeWorkshop.thematicFocus}
                          </p>
                          <p className="text-neutral-600 dark:text-neutral-400 font-light italic mt-1 text-[11px]">
                            Anclaje somático: {activeWorkshop.somaticPractice}
                          </p>
                        </div>

                        {/* Botones de Acción del Taller */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleDownloadWorkshopMemory(activeWorkshop)}
                            className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                            <span>Descargar Memoria del Taller (PDF)</span>
                          </button>

                          <a
                            href={activeWorkshop.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/60 backdrop-blur-xs text-xs font-semibold hover:bg-white/70 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Sala Virtual de Talleres</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. MÓDULO 3: HISTÓRICO DE BITÁCORAS 1 A 1 (BOTÓN GENERAL EXPANDIBLE)       */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-black/10 dark:border-white/15 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
          {/* Botón General Largo de Apertura/Cierre */}
          <button
            type="button"
            onClick={() => toggleModule('bitacoras')}
            className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/30 dark:hover:bg-neutral-900/30 transition-colors select-none group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wider font-mono">
                    Módulo 3: Histórico de Bitácoras 1 a 1
                  </h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-500/30">
                    {pastForms.length} {pastForms.length === 1 ? 'Bitácora' : 'Bitácoras'} Registradas
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                  Archivo documental de todas tus memorias y compromisos individuales sesión por sesión
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-medium text-neutral-500 hidden sm:inline">
                {expandedModules.bitacoras ? 'Contraer' : 'Ver histórico'}
              </span>
              <div
                className={`p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-transform duration-300 ${
                  expandedModules.bitacoras ? 'rotate-180' : ''
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Contenido Interior Desplegado */}
          {expandedModules.bitacoras && (
            <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-2 space-y-3 border-t border-black/5 dark:border-white/5">
              {pastForms.length === 0 ? (
                <p className="text-xs text-neutral-500 font-light italic p-4 rounded-2xl bg-white/25 dark:bg-neutral-900/35 backdrop-blur-xs border border-black/10 dark:border-white/10 mt-2">
                  Aún no has registrado cuestionarios de bitácora posterior. Tras tu primer encuentro individual aparecerán aquí tus registros y cuadernos descargables.
                </p>
              ) : (
                pastForms.map((item) => {
                  const cycleNum = Math.ceil(item.sessionNumber / 4);
                  const isMilestone =
                    item.sessionNumber === 4 || item.sessionNumber === 8 || item.sessionNumber === 12;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white/25 dark:bg-neutral-900/35 backdrop-blur-xs space-y-2 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-black dark:text-white">
                            Sesión {item.sessionNumber}
                          </span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-neutral-600 dark:text-neutral-400">
                            Ciclo {cycleNum} {isMilestone ? '(★ Cierre de Ciclo)' : ''}
                          </span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            {item.submittedAt
                              ? new Date(item.submittedAt).toLocaleDateString('es-ES')
                              : 'Registrado'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadMemory(item)}
                          className="px-3 py-1.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-black/50 backdrop-blur-xs text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Descargar PDF</span>
                        </button>
                      </div>

                      <div className="space-y-1 text-neutral-700 dark:text-neutral-300 font-light">
                        <p>
                          <strong className="font-semibold text-black dark:text-white">
                            Tema Emergente:
                          </strong>{' '}
                          {item.emergentTopic || item.masterJudgmentAndNarrative}
                        </p>
                        {item.discovery && (
                          <p>
                            <strong className="font-semibold text-black dark:text-white">
                              Descubrimiento:
                            </strong>{' '}
                            {item.discovery}
                          </p>
                        )}
                        {item.actionStep && (
                          <p>
                            <strong className="font-semibold text-black dark:text-white">
                              Acción Acordada:
                            </strong>{' '}
                            {item.actionStep}
                          </p>
                        )}
                        {item.cycleHarvest && (
                          <div className="mt-1.5 p-2.5 rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 text-neutral-900 dark:text-neutral-100 shadow-2xs">
                            <strong className="font-semibold block text-[11px] text-amber-500">
                              ★ Cosecha del Ciclo:
                            </strong>
                            <span>{item.cycleHarvest}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 6. ACOMPAÑAMIENTO CERCANO: CONTACTO DIRECTO CON EL FACILITADOR           */}
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
      {/* 7. MODAL DE CUESTIONARIO POSTERIOR / BITÁCORA                             */}
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
    </div>
  );
};
