import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  Download,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Lock,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  FileCheck,
  UserCheck,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  X,
  Award,
} from 'lucide-react';
import { Session, PostSessionForm, User, ProgramNodeInfo, BitacoraSesionB2BEntry } from '../../types';
import { OntologicalStore, COMPANY_INFO } from '../../services/store';
import { FirestoreSyncService } from '../../services/firestoreSync';
import { OFFICIAL_FORMS_SHEETS_BASE_MAP } from '../../data/officialFormsSheetsBase';

interface ParticipantSesionesModuleProps {
  sessions: Session[];
  postForms: PostSessionForm[];
  currentSessionNumber: number;
  currentCycle: number;
  activeUser: User;
  onOpenBitacora: (session: Session) => void;
  onDownloadSessionPDF: (form?: Partial<PostSessionForm> | null, session?: Session) => void;
  onGoToIntegrations?: () => void;
}

export const ParticipantSesionesModule: React.FC<ParticipantSesionesModuleProps> = ({
  sessions: propSessions,
  postForms,
  currentSessionNumber,
  currentCycle,
  activeUser,
  onOpenBitacora,
  onDownloadSessionPDF,
}) => {
  // Estado local sincronizado con el Administrador
  const [liveNodes, setLiveNodes] = useState<ProgramNodeInfo[]>(() => OntologicalStore.getProgramNodes());
  const [liveLevelConfigs, setLiveLevelConfigs] = useState(() => OntologicalStore.getLevelConfigs());
  const [liveStoreSessions, setLiveStoreSessions] = useState<Session[]>(() =>
    OntologicalStore.getSessionsForClient(activeUser.uid)
  );

  // Bitácoras oficiales de Google Sheets con aislamiento estricto por correo de participante
  const [participantBitacoras, setParticipantBitacoras] = useState<BitacoraSesionB2BEntry[]>(() =>
    OntologicalStore.getBitacorasSesionesB2BForClient(activeUser.email)
  );
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsSyncMsg, setSheetsSyncMsg] = useState<string | null>(null);
  const [selectedBitacoraDetail, setSelectedBitacoraDetail] = useState<BitacoraSesionB2BEntry | null>(null);

  // Escuchar cambios reactivos en vivo provenientes del Panel de Administración y Google Sheets
  useEffect(() => {
    const handleSync = () => {
      setLiveNodes(OntologicalStore.getProgramNodes());
      setLiveLevelConfigs(OntologicalStore.getLevelConfigs());
      setLiveStoreSessions(OntologicalStore.getSessionsForClient(activeUser.uid));
      setParticipantBitacoras(OntologicalStore.getBitacorasSesionesB2BForClient(activeUser.email));
    };

    window.addEventListener('rbc-sessions-updated', handleSync);
    window.addEventListener('rbc-program-nodes-updated', handleSync);
    window.addEventListener('rbc-levels-updated', handleSync);
    window.addEventListener('rbc-clients-updated', handleSync);
    window.addEventListener('rbc-forms-sheets-data-updated', handleSync);
    window.addEventListener('rbc-bitacoras-sheets-synced', handleSync);

    // Suscripción reactiva en tiempo real a Firestore con filtro exclusivo de email para este cliente
    const unsubscribeFirestore = FirestoreSyncService.subscribeToClientBitacorasSesionesB2B(
      activeUser.email,
      (liveBitacoras) => {
        if (Array.isArray(liveBitacoras) && liveBitacoras.length > 0) {
          setParticipantBitacoras(liveBitacoras);
        }
      }
    );

    return () => {
      window.removeEventListener('rbc-sessions-updated', handleSync);
      window.removeEventListener('rbc-program-nodes-updated', handleSync);
      window.removeEventListener('rbc-levels-updated', handleSync);
      window.removeEventListener('rbc-clients-updated', handleSync);
      window.removeEventListener('rbc-forms-sheets-data-updated', handleSync);
      window.removeEventListener('rbc-bitacoras-sheets-synced', handleSync);
      unsubscribeFirestore();
    };
  }, [activeUser.uid, activeUser.email]);

  const handleSyncSheets = async () => {
    setIsSyncingSheets(true);
    try {
      await OntologicalStore.syncBitacorasFromGoogleSheets();
      const fresh = OntologicalStore.getBitacorasSesionesB2BForClient(activeUser.email);
      setParticipantBitacoras(fresh);
      setSheetsSyncMsg(
        `Tus avances y bitácoras se sincronizaron con Google Sheets (${fresh.length} registro(s) encontrado(s)).`
      );
      setTimeout(() => setSheetsSyncMsg(null), 4000);
    } catch (err) {
      console.error('Error syncing Google Sheets:', err);
      setSheetsSyncMsg('Error al conectar con Google Sheets.');
      setTimeout(() => setSheetsSyncMsg(null), 3000);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Filtro de bloque: 0 = Todas las 12 sesiones, 1 = Bloque 1 (1-4), 2 = Bloque 2 (5-8), 3 = Bloque 3 (9-12)
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<number>(0);
  const [expandedBitacoraSessionId, setExpandedBitacoraSessionId] = useState<string | null>(null);

  // Validación de acceso a bloques completos
  const isFullProgramPaid =
    activeUser.paymentStatus === 'Pago Único' ||
    activeUser.programAccessLevel === 'premium';

  const isBlockUnlocked = (cycle: number) => {
    if (cycle <= 1) return true;
    if (isFullProgramPaid) return true;
    return currentCycle >= cycle;
  };

  // Construcción de las 12 Sesiones Oficiales ancladas directamente al Panel de Administración
  const full12Sessions: Session[] = useMemo(() => {
    // Normalizar y ordenar nodos del programa para asegurar 12 pasos consecutivos
    const cleanNodes = Array.isArray(liveNodes) ? [...liveNodes] : [];

    return Array.from({ length: 12 }, (_, i) => {
      const step = i + 1; // 1 a 12 garantizado estrictamente consecutivo
      const cycleStep = ((step - 1) % 4) + 1; // 1, 2, 3 o 4 dentro del ciclo
      const isMilestone = cycleStep === 4;

      // Buscar si el administrador configuró una sesión específica para este coachee
      const adminSession =
        liveStoreSessions.find((s) => s.sessionNumber === step) ||
        propSessions.find((s) => s.sessionNumber === step);

      // Buscar el nodo curricular oficial por step exacto o por índice
      const adminNode =
        cleanNodes.find((n) => n.step === step) ||
        cleanNodes[i] ||
        null;

      // Asignación de Bloque / Nivel Ontológico oficial
      const levelKey: 'Nivel I' | 'Nivel II' | 'Nivel III' =
        step <= 4 ? 'Nivel I' : step <= 8 ? 'Nivel II' : 'Nivel III';
      const levelTitle =
        liveLevelConfigs[levelKey]?.title ||
        adminNode?.levelTitle ||
        adminSession?.levelTitle ||
        (levelKey === 'Nivel I'
          ? 'Nivel I: Fundamentos & Transparencia'
          : levelKey === 'Nivel II'
          ? 'Nivel II: Corporalidad, Relaciones & Emocionalidad'
          : 'Nivel III: Dirección & Trascendencia');

      // Título oficial garantizado: enumeración consecutiva que nunca se salta la sesión 2
      let officialTitle = '';
      if (isMilestone) {
        officialTitle = '4- Cierre de Ciclo: Integración, Cosecha de Aprendizajes y Evolución del Ser';
      } else {
        officialTitle = `${cycleStep}- Espacio de Indagación Autónoma y Construcción de Sentido`;
      }

      // Objetivo ontológico oficial
      const officialObjective =
        adminNode?.objective ||
        adminSession?.sessionGoal ||
        adminSession?.notes ||
        (isMilestone
          ? 'Revisión del estado actual, medición de evolución y rediseño de acuerdos al culminar el ciclo.'
          : 'Acompañamiento ontológico no direccional, indagación reflexiva y exploración del quiebre.');

      // Pregunta de apertura oficial
      const officialOpeningQuestion =
        adminNode?.keyQuestion ||
        adminSession?.openingQuestion ||
        (isMilestone
          ? '¿Qué transformaciones y nuevos límites consolidas al cerrar este ciclo?'
          : '¿Qué es importante para ti traer a este espacio reflexivo hoy?');

      // Semanas limpias según requerimiento
      const cleanWeekLabel =
        adminNode?.weekLabel ||
        adminSession?.weekLabel ||
        (step <= 2
          ? 'Semanas 1-2'
          : step <= 4
          ? 'Semanas 3-4'
          : step <= 6
          ? 'Semanas 5-6'
          : step <= 8
          ? 'Semanas 7-8'
          : step <= 10
          ? 'Semanas 9-10'
          : 'Semanas 11-12');

      // Fecha agendada
      const scheduledIsoDate =
        adminSession?.date ||
        (adminSession?.scheduledDate
          ? `${adminSession.scheduledDate}T${adminSession.scheduledTime || '10:00'}:00.000Z`
          : new Date(Date.now() + (step - currentSessionNumber) * 14 * 24 * 60 * 60 * 1000).toISOString());

      // Estado de la sesión
      const sessionStatus =
        adminSession?.status ||
        (step < currentSessionNumber ? 'completed' : 'scheduled');

      // Enlace de Google Meet oficial
      const cleanClientTag = (activeUser.name || activeUser.uid || 'coachee')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const officialMeetLink =
        adminSession?.meetLink || `https://meet.google.com/rbc-${cleanClientTag}-s${step}`;

      return {
        id: adminSession?.id || `sess-${activeUser.uid}-${step}`,
        sessionNumber: step,
        clientId: activeUser.uid,
        clientName: activeUser.name,
        date: scheduledIsoDate,
        scheduledDate: scheduledIsoDate.split('T')[0],
        scheduledTime: adminSession?.scheduledTime || '10:00',
        status: sessionStatus,
        durationMinutes: adminSession?.durationMinutes || 60,
        meetLink: officialMeetLink,
        notes: adminSession?.notes || officialObjective,
        keyInsights: adminSession?.keyInsights || [],
        actionAgreements: adminSession?.actionAgreements || [],
        somaticFocus: adminSession?.somaticFocus || '',
        programNodeStep: step,
        title: officialTitle,
        level: levelKey,
        levelTitle: levelTitle,
        weekLabel: cleanWeekLabel,
        sessionType: isMilestone ? 'cierre_ciclo' : 'sesion',
        sessionGoal: officialObjective,
        openingQuestion: officialOpeningQuestion,
        // FORMULARIOS DE BITÁCORA Y ACUERDO (SIN ENLACES A SHEETS POR PRIVACIDAD)
        googleFormsUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl,
        bitacoraFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl,
        agreementFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl,
        formsIntegrationId: 'bitacora_sesiones_b2b',
        expedienteSyncStatus: 'synced',
      };
    });
  }, [liveStoreSessions, propSessions, liveNodes, liveLevelConfigs, activeUser, currentSessionNumber]);

  // Sesiones filtradas según el bloque seleccionado
  const filteredSessions = useMemo(() => {
    if (selectedCycleFilter === 0) return full12Sessions;
    const start = (selectedCycleFilter - 1) * 4 + 1;
    const end = selectedCycleFilter * 4;
    return full12Sessions.filter((s) => (s.sessionNumber || 1) >= start && (s.sessionNumber || 1) <= end);
  }, [full12Sessions, selectedCycleFilter]);

  // Indicadores y métricas calculadas
  const completedCount = useMemo(() => {
    return full12Sessions.filter(
      (s) => s.status === 'completed' || (s.sessionNumber || 1) < currentSessionNumber
    ).length;
  }, [full12Sessions, currentSessionNumber]);

  const formsFilledCount = useMemo(() => {
    return postForms.length;
  }, [postForms]);

  const formatSessionDate = (dateStr?: string) => {
    if (!dateStr) return 'Fecha por coordinar';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getSessionBlock = (num: number) => Math.ceil(num / 4);

  return (
    <div className="space-y-6 font-sans">
      {/* ========================================================================= */}
      {/* 1. RESUMEN VERTICAL LIMPIO EN LIQUID GLASS Y ALTO CONTRASTE              */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-neutral-950/40 backdrop-blur-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-black dark:text-white uppercase tracking-wider">
                  Sesiones 1 a 1 de Consultoría Ontológica
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/20">
                  Espacio Individual Directo
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                Ruta integral de 12 sesiones individuales basada en la malla curricular oficial del proceso.
              </p>
            </div>
          </div>

          {/* Resumen Métrico Vertical y Limpio */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3.5 py-2 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-black/10 dark:border-white/10 text-xs shadow-2xs">
              <span className="text-neutral-500 dark:text-neutral-400 text-[10px] block font-medium">Completadas</span>
              <strong className="text-black dark:text-white font-bold text-sm">
                {completedCount} <span className="text-neutral-400 font-normal text-xs">/ 12</span>
              </strong>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-emerald-500/20 text-xs shadow-2xs">
              <span className="text-emerald-700 dark:text-emerald-400 text-[10px] block font-medium">Google Sheets</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                {participantBitacoras.length} <span className="text-neutral-400 font-normal text-xs">sincronizadas</span>
              </strong>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-black/10 dark:border-white/10 text-xs shadow-2xs">
              <span className="text-neutral-500 dark:text-neutral-400 text-[10px] block font-medium">Sesión Actual</span>
              <strong className="text-black dark:text-white font-bold text-sm">
                #{currentSessionNumber.toString().padStart(2, '0')}{' '}
                <span className="text-neutral-400 font-normal text-xs">(Bloque {currentCycle})</span>
              </strong>
            </div>
          </div>
        </div>

        {/* Selector de Bloques Oficiales (Bloque 1: 1-4, Bloque 2: 5-8, Bloque 3: 9-12) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs flex-wrap">
            {[
              { id: 0, label: 'Todas las 12 Sesiones', subtitle: 'Ruta Completa', cycle: 0 },
              { id: 1, label: 'Bloque 1 (Sesiones 1-4)', subtitle: 'Fundamentos', cycle: 1 },
              { id: 2, label: 'Bloque 2 (Sesiones 5-8)', subtitle: 'Corporalidad & Emoción', cycle: 2 },
              { id: 3, label: 'Bloque 3 (Sesiones 9-12)', subtitle: 'Dirección & Trascendencia', cycle: 3 },
            ].map(({ id, label, cycle }) => {
              const isSelected = selectedCycleFilter === id;
              const isLocked = cycle > 0 && !isBlockUnlocked(cycle);
              return (
                <button
                  key={`cycle-filter-${id}`}
                  type="button"
                  onClick={() => setSelectedCycleFilter(id)}
                  className={`px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap text-xs font-semibold inline-flex items-center gap-2 ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <Layers className="w-3.5 h-3.5 opacity-70" />
                  )}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Sello de Confidencialidad y Privacidad Total (CERO Enlaces a Sheets) */}
          <div className="flex items-center gap-2">
            <div
              className="px-3.5 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium inline-flex items-center gap-2 shadow-2xs"
              title="Tu información de bitácoras, respuestas y acuerdos es 100% privada y solo accesible por ti y tu coach"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Aislamiento & Privacidad Estricta por Participante</span>
            </div>
          </div>
        </div>

        {/* Banner de Sincronización Oficial con Google Sheets */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-black shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-black dark:text-white">
                  Bitácoras Oficiales Extraídas de Google Sheets
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                  {participantBitacoras.length} registro(s) para {activeUser.email}
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                Tus reflexiones, quiebres y compromisos se sincronizan automáticamente con la fuente oficial asegurando que ningún compañero acceda a tu expediente.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSyncSheets}
            disabled={isSyncingSheets}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
            <span>{isSyncingSheets ? 'Sincronizando...' : 'Sincronizar Mis Avances'}</span>
          </button>
        </div>

        {sheetsSyncMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sheetsSyncMsg}</span>
          </div>
        )}

        {/* Advertencia elegante si se selecciona un bloque pendiente de desbloqueo */}
        {selectedCycleFilter > 0 && !isBlockUnlocked(selectedCycleFilter) && (
          <div className="p-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 dark:text-amber-200">
                  Bloque {selectedCycleFilter} en Fase Preparatoria
                </span>
                <p className="text-amber-900 dark:text-amber-300 text-[11px] mt-0.5 font-light">
                  Este bloque se desbloqueará una vez concluyas las sesiones del Bloque {selectedCycleFilter - 1} y confirmes el avance con tu coach.
                </p>
              </div>
            </div>
            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs inline-flex items-center justify-center gap-1.5 shrink-0 transition-opacity hover:opacity-90 shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Consultar con Coach</span>
            </a>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. LISTA DE LAS 12 SESIONES OFICIALES (ALTO CONTRASTE LIQUID GLASS)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSessions.map((session, idx) => {
          const num = session.sessionNumber || (selectedCycleFilter === 0 ? idx + 1 : (selectedCycleFilter - 1) * 4 + idx + 1);
          const blockNum = getSessionBlock(num);
          const isUnlocked = isBlockUnlocked(blockNum);
          const isCompleted = session.status === 'completed' || num < currentSessionNumber;
          const isCurrent = num === currentSessionNumber;
          const isMilestone = num === 4 || num === 8 || num === 12;

          // Extracción privada de la bitácora individual del cliente desde Google Sheets (Aislamiento Estricto)
          const sheetBitacora =
            participantBitacoras.find(
              (b, bIdx) =>
                bIdx === num - 1 ||
                (b.rawSource?.sessionNumber && Number(b.rawSource.sessionNumber) === num)
            ) ||
            (num === 1 && participantBitacoras.length > 0 ? participantBitacoras[0] : null);

          const hasSheetExtraction = Boolean(
            sheetBitacora &&
              (sheetBitacora.centralChallenge ||
                sheetBitacora.primaryEmotion ||
                sheetBitacora.realizationOrPerspective ||
                sheetBitacora.concreteActionCommitment)
          );

          // Extracción privada de la bitácora individual local
          const postForm = postForms.find(
            (f) => f.sessionNumber === num || f.sessionId === session.id
          );
          const isBitacoraExpanded = expandedBitacoraSessionId === session.id;

          // Has private extraction data?
          const hasPrivateExtraction =
            hasSheetExtraction ||
            Boolean(
              postForm?.emergentTopic ||
                postForm?.actionStep ||
                postForm?.discovery ||
                postForm?.perspectiveShiftEvidence
            ) ||
            (session.actionAgreements && session.actionAgreements.length > 0) ||
            (session.keyInsights && session.keyInsights.length > 0);

          return (
            <div
              key={session.id || `participant-session-${num}`}
              className={`rounded-3xl border transition-all duration-300 backdrop-blur-xl p-5 sm:p-6 space-y-4 shadow-xs flex flex-col justify-between ${
                !isUnlocked
                  ? 'border-black/5 dark:border-white/5 bg-neutral-100/40 dark:bg-neutral-900/30 opacity-70'
                  : isCurrent
                  ? 'border-black dark:border-white bg-white/60 dark:bg-neutral-900/60 ring-2 ring-black/10 dark:ring-white/10 shadow-md'
                  : isCompleted
                  ? 'border-black/15 dark:border-white/15 bg-white/30 dark:bg-neutral-950/30'
                  : 'border-black/10 dark:border-white/10 bg-white/20 dark:bg-neutral-950/20'
              }`}
            >
              {/* Cabecera de la Sesión: Número, Bloque y Estado */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                          !isUnlocked
                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                            : isCurrent
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : isCompleted
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-black/5 dark:bg-white/10 text-black dark:text-white border border-black/10 dark:border-white/10'
                        }`}
                      >
                        {!isUnlocked ? <Lock className="w-3.5 h-3.5" /> : num.toString().padStart(2, '0')}
                      </span>

                      <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                        Bloque {blockNum} • {session.weekLabel}
                      </span>

                      {isMilestone && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-200 font-bold border border-amber-500/30 inline-flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{num === 12 ? 'Graduación' : 'Cierre de Bloque'}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-black dark:text-white leading-snug">
                      {session.title}
                    </h3>
                  </div>

                  {/* Insignia de Estado */}
                  <div className="shrink-0">
                    {!isUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] text-neutral-500 dark:text-neutral-400 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-medium">
                        <Lock className="w-3 h-3" />
                        <span>Bloque {blockNum}</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Completada</span>
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>En Curso</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] text-neutral-600 dark:text-neutral-400 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Programada</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Fecha y Temporalidad */}
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-xs font-light">
                  <Clock className="w-3.5 h-3.5 opacity-70 shrink-0" />
                  <span>{formatSessionDate(session.date)}</span>
                  <span>•</span>
                  <span>{session.durationMinutes || 60} minutos</span>
                </div>

                {/* Enfoque y Dinámica de la Sesión (del catálogo oficial) */}
                <div className="space-y-2">
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-light">
                    {session.sessionGoal || session.notes}
                  </p>

                  {/* Pregunta de Apertura Oficial */}
                  <div className="p-3 rounded-2xl bg-white/40 dark:bg-neutral-900/40 border border-black/5 dark:border-white/5 text-xs space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                      Pregunta de Apertura
                    </span>
                    <p className="text-black dark:text-white font-medium italic">
                      «{session.openingQuestion}»
                    </p>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* 3. EXTRACCIÓN PRIVADA DE RESPUESTAS DE BITÁCORA Y ACUERDOS ESPECÍFICOS    */}
                {/* ========================================================================= */}
                {isUnlocked && hasSheetExtraction && sheetBitacora && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 p-3.5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Bitácora Oficial Sincronizada</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium">
                          Sheets
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBitacoraDetail(sheetBitacora)}
                          className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ficha Completa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedBitacoraSessionId(isBitacoraExpanded ? null : session.id)
                          }
                          className="text-[10px] font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-0.5"
                        >
                          <span>{isBitacoraExpanded ? 'Menos' : 'Detalle'}</span>
                          {isBitacoraExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Desafío Central */}
                    {sheetBitacora.centralChallenge && (
                      <p className="text-neutral-900 dark:text-neutral-100 text-xs font-semibold line-clamp-2">
                        <strong className="text-emerald-800 dark:text-emerald-300 font-bold">Desafío central:</strong>{' '}
                        {sheetBitacora.centralChallenge}
                      </p>
                    )}

                    {/* Emoción presente */}
                    {sheetBitacora.primaryEmotion && (
                      <p className="text-neutral-700 dark:text-neutral-300 text-[11px] font-medium line-clamp-1">
                        <strong className="text-amber-700 dark:text-amber-400 font-bold">Emoción:</strong>{' '}
                        {sheetBitacora.primaryEmotion}
                      </p>
                    )}

                    {/* Compromiso de Acción */}
                    {sheetBitacora.concreteActionCommitment && (
                      <p className="text-neutral-800 dark:text-neutral-200 text-[11px] font-medium line-clamp-2">
                        <strong className="text-black dark:text-white font-bold">Compromiso:</strong>{' '}
                        {sheetBitacora.concreteActionCommitment}
                      </p>
                    )}

                    {/* Detalle Desplegable con Todos los Campos Ontológicos */}
                    {isBitacoraExpanded && (
                      <div className="pt-2.5 border-t border-emerald-500/20 space-y-2 text-[11px] animate-fadeIn">
                        {sheetBitacora.limitingBeliefsAndJudgments && (
                          <div className="p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30">
                            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 block uppercase">
                              Juicios o historias limitantes:
                            </span>
                            <p className="text-neutral-800 dark:text-neutral-200 mt-0.5">
                              {sheetBitacora.limitingBeliefsAndJudgments}
                            </p>
                          </div>
                        )}

                        {(sheetBitacora.realizationOrPerspective || sheetBitacora.realizationMoment) && (
                          <div className="p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40">
                            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 block uppercase">
                              "Darse cuenta" (Insight ontológico):
                            </span>
                            <p className="text-indigo-950 dark:text-indigo-200 font-medium mt-0.5">
                              {sheetBitacora.realizationOrPerspective || sheetBitacora.realizationMoment}
                            </p>
                          </div>
                        )}

                        {sheetBitacora.balanceAreaNeeded && (
                          <div>
                            <span className="text-cyan-700 dark:text-cyan-400 font-bold block text-[10px] uppercase">
                              Llamado al equilibrio:
                            </span>
                            <p className="text-neutral-700 dark:text-neutral-300 mt-0.5">
                              {sheetBitacora.balanceAreaNeeded}
                            </p>
                          </div>
                        )}

                        {sheetBitacora.valuableLearning && (
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold block text-[10px] uppercase">
                              Aprendizaje más valioso:
                            </span>
                            <p className="text-neutral-800 dark:text-neutral-200 font-medium mt-0.5">
                              {sheetBitacora.valuableLearning}
                            </p>
                          </div>
                        )}

                        {sheetBitacora.digitalValidationSignatureAndId && (
                          <div className="pt-1 text-[10px] text-neutral-500 font-mono">
                            <span>Firma digital: {sheetBitacora.digitalValidationSignatureAndId}</span>
                          </div>
                        )}

                        <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-400">
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Confidencial • Solo visible por ti</span>
                          </span>
                          {sheetBitacora.timestamp && (
                            <span>
                              {new Date(sheetBitacora.timestamp).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Si no hay extracción de Sheets, pero sí local */}
                {isUnlocked && !hasSheetExtraction && hasPrivateExtraction && (
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-900/50 p-3.5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-black dark:text-white font-bold text-[11px]">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Tus Registros & Acuerdos Privados</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedBitacoraSessionId(isBitacoraExpanded ? null : session.id)
                        }
                        className="text-[10px] font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>{isBitacoraExpanded ? 'Ocultar' : 'Ver Detalle'}</span>
                        {isBitacoraExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Resumen preliminar */}
                    {postForm?.emergentTopic && (
                      <p className="text-neutral-800 dark:text-neutral-200 text-xs font-medium line-clamp-2">
                        <strong className="text-black dark:text-white font-bold">Quiebre declarado:</strong>{' '}
                        {postForm.emergentTopic}
                      </p>
                    )}

                    {postForm?.actionStep && (
                      <p className="text-neutral-700 dark:text-neutral-300 text-[11px] font-light line-clamp-2">
                        <strong className="text-black dark:text-white font-semibold">Acuerdo de acción:</strong>{' '}
                        {postForm.actionStep}
                      </p>
                    )}

                    {/* Detalle desplegable de la extracción privada */}
                    {isBitacoraExpanded && (
                      <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2 text-[11px] animate-fadeIn">
                        {(postForm?.discovery || postForm?.perspectiveShiftEvidence) && (
                          <div>
                            <span className="text-neutral-500 block font-medium">Distinciones e Insights:</span>
                            <p className="text-black dark:text-white font-light mt-0.5">
                              {postForm.discovery || postForm.perspectiveShiftEvidence}
                            </p>
                          </div>
                        )}

                        {session.actionAgreements && session.actionAgreements.length > 0 && (
                          <div>
                            <span className="text-neutral-500 block font-medium">Compromisos de Sesión:</span>
                            <ul className="list-disc list-inside space-y-0.5 mt-0.5 text-neutral-800 dark:text-neutral-200">
                              {session.actionAgreements.map((agr, idx) => (
                                <li key={idx}>{agr}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-400">
                          <span>✓ Confidencial • Privado de tu expediente</span>
                          {postForm?.submittedAt && (
                            <span>Registrado: {new Date(postForm.submittedAt).toLocaleDateString('es-ES')}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Si la sesión está desbloqueada pero no tiene bitácora registrada aún */}
                {isUnlocked && !hasSheetExtraction && !hasPrivateExtraction && (
                  <div className="rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 p-3 bg-gray-50/50 dark:bg-neutral-900/30 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                        Bitácora pendiente de registro para esta sesión.
                      </span>
                    </div>
                    <a
                      href={session.bitacoraFormUrl || OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                    >
                      <span>Llenar en Forms</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Acciones y Enlaces Directos para el Participante (CERO Google Sheets) */}
              {isUnlocked ? (
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center gap-2">
                  {/* Enlace Directo a Sala Meet */}
                  <a
                    href={session.meetLink || 'https://meet.google.com/new'}
                    target="_blank"
                    rel="noreferrer"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-opacity ${
                      isCurrent
                        ? 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                        : 'border border-black/15 dark:border-white/15 bg-white/70 dark:bg-neutral-800/70 text-black dark:text-white hover:bg-white dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Unirme a Meet</span>
                  </a>

                  {/* Formulario de Bitácora Oficial en Google Forms */}
                  <a
                    href={session.bitacoraFormUrl || OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-700 text-black dark:text-white text-xs font-medium transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Registrar Bitácora Oficial en Google Forms"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Bitácora Forms</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>

                  {/* Formulario de Acuerdo Co-creativo en Google Forms */}
                  <a
                    href={session.agreementFormUrl || OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-neutral-800/40 hover:bg-white dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Registrar o Actualizar Acuerdo Co-creativo"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Acuerdo</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>

                  {/* Bitácora / Cuestionario Local */}
                  <button
                    type="button"
                    onClick={() => onOpenBitacora(session)}
                    className="px-3 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-700 text-xs font-semibold text-black dark:text-white transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span>{postForm ? 'Editar Registro' : 'Bitácora Local'}</span>
                  </button>

                  {/* Descarga de Memoria Privada en PDF */}
                  <button
                    type="button"
                    onClick={() => onDownloadSessionPDF(postForm, session)}
                    className="px-2.5 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-700 text-xs font-semibold text-black dark:text-white transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Descargar memoria privada de la sesión en PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2 text-xs text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sesión programada para la etapa {blockNum}.</span>
                  </div>
                  <a
                    href={COMPANY_INFO.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-black dark:text-white hover:underline cursor-pointer"
                  >
                    Coordinar
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL VISOR DETALLADO DE BITÁCORA ONTOLÓGICA (GOOGLE SHEETS)           */}
      {/* ========================================================================= */}
      {selectedBitacoraDetail && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-emerald-500/30 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Cabecera */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-emerald-950/20 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500 text-black">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Memoria de Bitácora Ontológica Sincronizada
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Expediente individual y confidencial de {selectedBitacoraDetail.fullName || activeUser.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBitacoraDetail(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Completo del Registro */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Participante:</span>
                  <span className="font-bold text-black dark:text-white">{selectedBitacoraDetail.fullName || activeUser.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Correo Registrado:</span>
                  <span className="font-mono text-black dark:text-white">{selectedBitacoraDetail.email || activeUser.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Fecha & Ciudad:</span>
                  <span className="text-black dark:text-white">
                    {selectedBitacoraDetail.timestamp ? new Date(selectedBitacoraDetail.timestamp).toLocaleString('es-CO') : 'Al día'}
                    {selectedBitacoraDetail.city ? ` • ${selectedBitacoraDetail.city}` : ''}
                  </span>
                </div>
              </div>

              {/* 1. Desafío Central */}
              <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  📌 1. Situación o Desafío Central Trabajado:
                </span>
                <p className="text-sm font-semibold text-black dark:text-white leading-relaxed">
                  {selectedBitacoraDetail.centralChallenge || 'No registrado'}
                </p>
              </div>

              {/* 2. Emoción Presente */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  🎭 2. Emoción Principal Presente & Mensaje que Trae:
                </span>
                <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                  {selectedBitacoraDetail.primaryEmotion || 'No registrado'}
                </p>
              </div>

              {/* 3. Juicios e Historias Limitantes */}
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-1">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                  🧠 3. Ideas, Juicios o Historias Repetitivas Descubiertas:
                </span>
                <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {selectedBitacoraDetail.limitingBeliefsAndJudgments || 'No registrado'}
                </p>
              </div>

              {/* 4. Darse Cuenta */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/50 space-y-1">
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
                  💡 4. "Darse Cuenta" (Nueva Perspectiva Ontológica / Insight):
                </span>
                <p className="text-xs font-semibold text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  {selectedBitacoraDetail.realizationOrPerspective || selectedBitacoraDetail.realizationMoment || 'No registrado'}
                </p>
              </div>

              {/* 5. Área de Equilibrio */}
              <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-900/40 space-y-1">
                <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider block">
                  ⚖️ 5. Llamado al Equilibrio (Área o Entorno con Mayor Atención):
                </span>
                <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {selectedBitacoraDetail.balanceAreaNeeded || 'No registrado'}
                </p>
              </div>

              {/* 6. Aprendizaje Más Valioso */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  🎁 6. Aprendizaje Más Valioso que te Regalas:
                </span>
                <p className="text-xs text-neutral-900 dark:text-neutral-100 font-medium leading-relaxed">
                  {selectedBitacoraDetail.valuableLearning || 'No registrado'}
                </p>
              </div>

              {/* 7. Acción Concreta y Compromisos */}
              <div className="p-4 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-black space-y-1 shadow-sm">
                <span className="text-[10px] font-bold text-emerald-400 dark:text-emerald-600 uppercase tracking-wider block">
                  🎯 7. Acción Concreta & Compromiso para la Próxima Sesión:
                </span>
                <p className="text-xs font-semibold leading-relaxed">
                  {selectedBitacoraDetail.concreteActionCommitment || 'No registrado'}
                </p>
              </div>

              {/* Firma y Validación Digital */}
              {selectedBitacoraDetail.digitalValidationSignatureAndId && (
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Validación Digital Registrada:</span>
                  </div>
                  <span className="font-mono font-bold text-black dark:text-white">
                    {selectedBitacoraDetail.digitalValidationSignatureAndId}
                  </span>
                </div>
              )}
            </div>

            {/* Pie de Modal */}
            <div className="p-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
              <span className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Documento Confidencial • Expediente RBC</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedBitacoraDetail(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 cursor-pointer transition-all"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
