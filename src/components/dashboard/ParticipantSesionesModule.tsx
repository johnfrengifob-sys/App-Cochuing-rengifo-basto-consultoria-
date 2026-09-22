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
} from 'lucide-react';
import { Session, PostSessionForm, User, ProgramNodeInfo } from '../../types';
import { OntologicalStore, COMPANY_INFO } from '../../services/store';
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

  // Escuchar cambios reactivos en vivo provenientes del Panel de Administración
  useEffect(() => {
    const handleSync = () => {
      setLiveNodes(OntologicalStore.getProgramNodes());
      setLiveLevelConfigs(OntologicalStore.getLevelConfigs());
      setLiveStoreSessions(OntologicalStore.getSessionsForClient(activeUser.uid));
    };

    window.addEventListener('rbc-sessions-updated', handleSync);
    window.addEventListener('rbc-program-nodes-updated', handleSync);
    window.addEventListener('rbc-levels-updated', handleSync);
    window.addEventListener('rbc-clients-updated', handleSync);

    return () => {
      window.removeEventListener('rbc-sessions-updated', handleSync);
      window.removeEventListener('rbc-program-nodes-updated', handleSync);
      window.removeEventListener('rbc-levels-updated', handleSync);
      window.removeEventListener('rbc-clients-updated', handleSync);
    };
  }, [activeUser.uid]);

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
    return Array.from({ length: 12 }, (_, i) => {
      const step = i + 1;
      const isMilestone = step === 4 || step === 8 || step === 12;

      // Buscar si el administrador configuró una sesión específica para este coachee
      const adminSession =
        liveStoreSessions.find((s) => s.sessionNumber === step) ||
        propSessions.find((s) => s.sessionNumber === step);

      // Buscar el nodo curricular oficial del administrador
      const adminNode = liveNodes.find((n) => n.step === step);

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

      // Título oficial de la sesión desde el catálogo del administrador
      const officialTitle =
        adminNode?.sessionTitle ||
        adminSession?.title ||
        (isMilestone
          ? `Sesión ${step}: Cierre y Medición de Evolución`
          : `Sesión ${step}: Acompañamiento Ontológico 1 a 1`);

      // Objetivo ontológico oficial
      const officialObjective =
        adminNode?.objective ||
        adminSession?.sessionGoal ||
        adminSession?.notes ||
        'Acompañamiento ontológico no direccional, indagación reflexiva y exploración del quiebre.';

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

            <div className="px-3.5 py-2 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-black/10 dark:border-white/10 text-xs shadow-2xs">
              <span className="text-neutral-500 dark:text-neutral-400 text-[10px] block font-medium">Bitácoras Extraídas</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                {formsFilledCount} <span className="text-neutral-400 font-normal text-xs">privadas</span>
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
                  key={id}
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
              className="px-3.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 text-black dark:text-white text-xs font-medium inline-flex items-center gap-2 shadow-2xs"
              title="Tu información de bitácoras, respuestas y acuerdos es 100% privada y solo accesible por ti y tu coach"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Privacidad & Confidencialidad Estricta</span>
            </div>
          </div>
        </div>

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
        {filteredSessions.map((session) => {
          const num = session.sessionNumber || 1;
          const blockNum = getSessionBlock(num);
          const isUnlocked = isBlockUnlocked(blockNum);
          const isCompleted = session.status === 'completed' || num < currentSessionNumber;
          const isCurrent = num === currentSessionNumber;
          const isMilestone = num === 4 || num === 8 || num === 12;

          // Extracción privada de la bitácora individual del cliente
          const postForm = postForms.find(
            (f) => f.sessionNumber === num || f.sessionId === session.id
          );
          const isBitacoraExpanded = expandedBitacoraSessionId === session.id;

          // Has private extraction data?
          const hasPrivateExtraction =
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
              key={session.id || num}
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
                {isUnlocked && hasPrivateExtraction && (
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
      {/* 4. TARJETA DE PERFIL FIJA EN EL PIE DE PÁGINA (COACH ONTOLÓGICO)          */}
      {/* ========================================================================= */}
      <div className="mt-8 p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-neutral-950/40 backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src="/src/assets/images/regenerated_image_1788287101599.jpg"
              alt="John Fredy Rengifo Basto"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-black/15 dark:border-white/15 shadow-sm"
              onError={(e) => {
                // Fallback elegante a logo si la imagen de retrato no carga
                (e.target as HTMLImageElement).src = '/src/assets/images/rengifo_basto_logo_1788288004105.jpg';
              }}
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-950 shadow-xs" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                Canal de Acompañamiento Activo
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight">
              John Fredy Rengifo Basto
            </h3>
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
            href={full12Sessions[currentSessionNumber - 1]?.meetLink || 'https://meet.google.com/new'}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-neutral-900/70 hover:bg-white dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Video className="w-4 h-4 text-indigo-500" />
            <span>Sala Meet 1 a 1</span>
          </a>
        </div>
      </div>
    </div>
  );
};
