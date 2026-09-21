import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  Download,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  FileSpreadsheet,
  ShieldCheck,
  Brain,
  ChevronDown,
  Layers,
  Award,
  Circle,
  ArrowRight,
} from 'lucide-react';
import { Session, PostSessionForm, User } from '../../types';
import { PROGRAM_NODES } from '../../services/store';
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
  sessions,
  postForms,
  currentSessionNumber,
  currentCycle,
  activeUser,
  onOpenBitacora,
  onDownloadSessionPDF,
  onGoToIntegrations,
}) => {
  // Filtro de ciclo: 0 = Todos, 1 = Ciclo 1 (S1-S4), 2 = Ciclo 2 (S5-S8), 3 = Ciclo 3 (S9-S12)
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<number>(0);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Asegurar que existan las 12 sesiones mapeadas con PROGRAM_NODES
  const full12Sessions: Session[] = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const num = i + 1;
      const existing = sessions.find((s) => s.sessionNumber === num);
      if (existing) return existing;

      const node = PROGRAM_NODES.find((n) => n.step === num);
      const isMilestone = num === 4 || num === 8 || num === 12;

      return {
        id: `sess-${activeUser.uid}-${num}`,
        sessionNumber: num,
        clientId: activeUser.uid,
        clientName: activeUser.name,
        date: new Date(Date.now() + (num - currentSessionNumber) * 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: num < currentSessionNumber ? 'completed' : 'scheduled',
        durationMinutes: 60,
        meetLink: `https://meet.google.com/rbc-${(activeUser.name || 'coachee').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${num}`,
        notes: node ? `Sesión ${num}: ${node.level} • ${node.sessionTitle}` : '',
        keyInsights: [],
        actionAgreements: [],
        somaticFocus: '',
        programNodeStep: num,
        title: node?.sessionTitle || `Sesión ${num}`,
        level: node?.level || (num <= 4 ? 'Nivel I' : num <= 8 ? 'Nivel II' : 'Nivel III'),
        weekLabel: node?.weekLabel || `Semanas ${num * 2 - 1}-${num * 2}`,
        sessionType: isMilestone ? 'cierre_ciclo' : 'sesion',
        sessionGoal: isMilestone
          ? 'Revisión del estado actual, medición de evolución y rediseño de acuerdos.'
          : 'Acompañamiento ontológico no direccional y exploración libre del quiebre.',
        openingQuestion: isMilestone
          ? 'Sesión de Cierre de Ciclo: Revisión del estado actual y aprendizajes consolidados.'
          : '¿Qué es importante para ti traer a este espacio hoy?',
        googleSheetsUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.sheetUrl,
        googleFormsUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl,
        agreementFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl,
        agreementSheetUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.sheetUrl,
        bitacoraFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl,
        bitacoraSheetUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.sheetUrl,
        formsIntegrationId: 'bitacora_sesiones_b2b',
        expedienteSyncStatus: 'synced',
      };
    });
  }, [sessions, activeUser, currentSessionNumber]);

  // Sesiones filtradas por ciclo
  const filteredSessions = useMemo(() => {
    if (selectedCycleFilter === 0) return full12Sessions;
    const start = (selectedCycleFilter - 1) * 4 + 1;
    const end = selectedCycleFilter * 4;
    return full12Sessions.filter((s) => (s.sessionNumber || 1) >= start && (s.sessionNumber || 1) <= end);
  }, [full12Sessions, selectedCycleFilter]);

  // Métricas de progreso en sesiones
  const completedCount = useMemo(() => {
    return full12Sessions.filter(
      (s) => s.status === 'completed' || (s.sessionNumber || 1) < currentSessionNumber
    ).length;
  }, [full12Sessions, currentSessionNumber]);

  const formsFilledCount = useMemo(() => {
    return postForms.length;
  }, [postForms]);

  const formatSessionDate = (dateStr?: string) => {
    if (!dateStr) return 'Fecha por agendar';
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

  const getSessionCycleNumber = (num: number) => Math.ceil(num / 4);

  return (
    <div className="space-y-6">
      {/* Header Banner de Sesiones 1 a 1 */}
      <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/25 dark:bg-neutral-950/35 backdrop-blur-xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-black dark:text-white font-mono uppercase tracking-wider">
                  Panel de Sesiones Ontológicas 1 a 1
                </h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-500/30">
                  Acompañamiento Quincenal
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                Ruta integral de 12 encuentros reflexivos individuales sincronizados con Google Meet, Formularios y Hojas de Cálculo.
              </p>
            </div>
          </div>

          {/* Métricas rápidas de sesiones */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 text-xs font-mono">
              <span className="text-neutral-500 text-[10px] block">Completadas</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                {completedCount} de 12
              </strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 text-xs font-mono">
              <span className="text-neutral-500 text-[10px] block">Bitácoras</span>
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                {formsFilledCount} registradas
              </strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 text-xs font-mono">
              <span className="text-neutral-500 text-[10px] block">Actual</span>
              <strong className="text-black dark:text-white font-bold">
                E{currentSessionNumber.toString().padStart(2, '0')} (Ciclo {currentCycle})
              </strong>
            </div>
          </div>
        </div>

        {/* Filtro por Ciclos: Todos, Ciclo 1, Ciclo 2, Ciclo 3 */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-black/5 dark:border-white/5 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 text-xs font-mono">
            {[
              { id: 0, label: 'Todas las Sesiones (1-12)' },
              { id: 1, label: 'Ciclo 1: Raíz (1-4)' },
              { id: 2, label: 'Ciclo 2: Tallo (5-8)' },
              { id: 3, label: 'Ciclo 3: Florecimiento (9-12)' },
            ].map(({ id, label }) => {
              const isSelected = selectedCycleFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedCycleFilter(id)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {onGoToIntegrations && (
            <button
              type="button"
              onClick={onGoToIntegrations}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ver Base de Datos en Google Sheets</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Sesiones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSessions.map((session) => {
          const num = session.sessionNumber || 1;
          const cycleNum = getSessionCycleNumber(num);
          const isCompleted = session.status === 'completed' || num < currentSessionNumber;
          const isCurrent = num === currentSessionNumber;
          const isMilestone = num === 4 || num === 8 || num === 12;
          const postForm = postForms.find((f) => f.sessionNumber === num || f.sessionId === session.id);
          const node = PROGRAM_NODES.find((n) => n.step === num);
          const isExpanded = expandedSessionId === session.id;

          const sessionTitle = session.title || node?.sessionTitle || `Sesión ${num}: Exploración Libre`;
          const sessionLevel = session.level || node?.level || `Ciclo ${cycleNum}`;
          const weekLabel = session.weekLabel || node?.weekLabel || `Semanas ${num * 2 - 1}-${num * 2}`;

          return (
            <div
              key={session.id}
              className={`rounded-3xl border transition-all backdrop-blur-md overflow-hidden p-5 sm:p-6 space-y-4 shadow-xs ${
                isCurrent
                  ? 'border-emerald-500/40 bg-white/40 dark:bg-neutral-900/50 ring-2 ring-emerald-500/20 shadow-md'
                  : isCompleted
                  ? 'border-black/10 dark:border-white/10 bg-white/20 dark:bg-neutral-950/30 opacity-95'
                  : 'border-black/5 dark:border-white/5 bg-white/15 dark:bg-neutral-950/20'
              }`}
            >
              {/* Header de la Sesión */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : isCompleted
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 border border-black/10 dark:border-white/10'
                      }`}
                    >
                      {num.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Ciclo {cycleNum} • {sessionLevel} • {weekLabel}
                    </span>
                    {isMilestone && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold inline-flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        {num === 12 ? 'Cierre de Programa' : 'Cosecha del Ciclo'}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-black dark:text-white leading-snug">
                    {sessionTitle}
                  </h4>
                </div>

                {/* Badge de Estado */}
                <div className="shrink-0">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Completada</span>
                    </span>
                  ) : isCurrent ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-white shadow-xs animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>En Curso</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono text-neutral-500 dark:text-neutral-400 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                      <Clock className="w-3 h-3" />
                      <span>Programada</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Fecha y Objetivo */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{formatSessionDate(session.date)}</span>
                  <span>•</span>
                  <span>{session.durationMinutes || 60} minutos</span>
                </div>

                <p className="text-neutral-700 dark:text-neutral-300 font-light text-xs leading-relaxed line-clamp-2">
                  {session.sessionGoal || node?.objective || session.notes}
                </p>
              </div>

              {/* Pregunta de Apertura */}
              <div className="p-3 rounded-2xl bg-white/30 dark:bg-neutral-900/40 border border-black/5 dark:border-white/5 space-y-1 text-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                  Pregunta de Apertura
                </span>
                <p className="text-neutral-800 dark:text-neutral-200 font-medium italic">
                  «{session.openingQuestion || '¿Qué es importante para ti traer a este espacio hoy?'}»
                </p>
              </div>

              {/* Acuerdos & Bitácora en Google Workspace (Forms + Sheets) */}
              <div className="pt-1 flex items-center justify-between gap-2 border-t border-black/5 dark:border-white/5 flex-wrap text-[11px]">
                <div className="flex items-center gap-2">
                  <a
                    href={session.agreementFormUrl || OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white inline-flex items-center gap-1 font-mono transition-colors"
                    title="Ver Formulario de Acuerdo en Google Forms"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Acuerdo 1 a 1 (Forms)</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>

                  <span className="text-neutral-300 dark:text-neutral-700">•</span>

                  <a
                    href={session.bitacoraFormUrl || OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white inline-flex items-center gap-1 font-mono transition-colors"
                    title="Ver Formulario de Bitácora B2B en Google Forms"
                  >
                    <Brain className="w-3 h-3 text-indigo-500" />
                    <span>Bitácora B2B (Forms)</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </div>

                <a
                  href={session.bitacoraSheetUrl || OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.sheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono transition-colors text-[10px]"
                  title="Ver Hoja de Respuestas en Google Sheets"
                >
                  <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
                  <span>Google Sheets</span>
                </a>
              </div>

              {/* Síntesis si la sesión tiene PostForm completado */}
              {postForm && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Bitácora de Sesión Registrada
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                      ✓ Sincronizada
                    </span>
                  </div>
                  {postForm.emergentTopic && (
                    <p className="text-emerald-950 dark:text-emerald-200 text-xs font-medium">
                      <strong>Tema emergente:</strong> {postForm.emergentTopic}
                    </p>
                  )}
                  {postForm.actionStep && (
                    <p className="text-emerald-900 dark:text-emerald-300 text-[11px] font-light">
                      <strong>Acción acordada:</strong> {postForm.actionStep}
                    </p>
                  )}
                </div>
              )}

              {/* Botones de Acción */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {/* Botón Meet si es la sesión actual o próxima */}
                <a
                  href={session.meetLink || 'https://meet.google.com/new'}
                  target="_blank"
                  rel="noreferrer"
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-opacity ${
                    isCurrent
                      ? 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                      : 'border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/60 text-black dark:text-white hover:bg-white/80'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Unirme por Meet</span>
                </a>

                {/* Botón Bitácora */}
                <button
                  type="button"
                  onClick={() => onOpenBitacora(session)}
                  className="px-3.5 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/60 backdrop-blur-xs text-xs font-semibold text-black dark:text-white hover:bg-white/80 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{postForm ? 'Editar Bitácora' : 'Registrar Bitácora'}</span>
                </button>

                {/* Botón Descargar PDF si existe formulario o sesión */}
                <button
                  type="button"
                  onClick={() => onDownloadSessionPDF(postForm, session)}
                  className="px-3 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/60 backdrop-blur-xs text-xs font-semibold text-black dark:text-white hover:bg-white/80 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Descargar Memoria de la Sesión en PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
