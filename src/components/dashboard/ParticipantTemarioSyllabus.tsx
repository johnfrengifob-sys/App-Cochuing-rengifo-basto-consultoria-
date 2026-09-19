import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Layers,
  MessageCircle,
  Sparkles,
  Video,
  Copy,
  Check,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Compass,
  HeartPulse,
  Brain,
  Award,
} from 'lucide-react';
import {
  TemarioSyllabusItem,
  TEMARIO_SYLLABUS_DATA,
  TemarioCycleConfig,
} from '../../data/temarioOntologico';
import {
  User,
  Session,
  PostSessionForm,
  CronogramaEvent,
} from '../../types';
import { BRE_B_NU_CONFIG } from '../../services/store';
import { UnifiedFormsSheetsClientView } from '../UnifiedFormsSheetsClientView';

interface ParticipantTemarioSyllabusProps {
  activeUser: User;
  sessions: Session[];
  postForms: PostSessionForm[];
  cronogramaEvents: CronogramaEvent[];
  currentSessionNumber: number;
  currentCycle: number;
  selectedItemId: string;
  onSelectItem: (itemId: string) => void;
  onOpenBitacora: (session: Session) => void;
  onDownloadSessionPDF: (form?: Partial<PostSessionForm> | null, session?: Session) => void;
  onDownloadWorkshopPDF: (item: TemarioSyllabusItem) => void;
  onCopyPaymentKey: () => void;
  copiedPaymentKey: boolean;
  isWorkshopAttended: (workshopId: string, stageName: string) => boolean;
}

export const ParticipantTemarioSyllabus: React.FC<ParticipantTemarioSyllabusProps> = ({
  activeUser,
  sessions,
  postForms,
  cronogramaEvents,
  currentSessionNumber,
  currentCycle,
  selectedItemId,
  onSelectItem,
  onOpenBitacora,
  onDownloadSessionPDF,
  onDownloadWorkshopPDF,
  onCopyPaymentKey,
  copiedPaymentKey,
  isWorkshopAttended,
}) => {
  // Pestaña activa del Temario (Ciclo 1, 2, 3 o Expediente Google Workspace)
  const [activeCycleTab, setActiveCycleTab] = useState<number | 'expediente'>(currentCycle);

  // Ciclo seleccionado en la configuración
  const currentCycleData = TEMARIO_SYLLABUS_DATA.find((c) => c.cycleNumber === activeCycleTab);

  // Elemento activo seleccionado para lectura de información
  const allItems = TEMARIO_SYLLABUS_DATA.flatMap((c) => c.items);
  const activeItem =
    allItems.find((item) => item.id === selectedItemId) ||
    currentCycleData?.items[0] ||
    allItems[0];

  const activeItemCycle =
    TEMARIO_SYLLABUS_DATA.find((c) => c.items.some((it) => it.id === activeItem.id)) ||
    currentCycleData ||
    TEMARIO_SYLLABUS_DATA[0];

  // Helper para verificar el estado de una estación individual
  const getStationStatus = (stationNum: number) => {
    if (stationNum < currentSessionNumber) return 'completed';
    if (stationNum === currentSessionNumber) return 'in_progress';
    return 'upcoming';
  };

  // Sesión y formulario asociados al elemento activo
  const activeSession: Session | undefined =
    activeItem.itemType === 'session' && activeItem.stationNumber
      ? sessions.find((s) => s.sessionNumber === activeItem.stationNumber) || {
          id: `sess-${activeUser.uid}-${activeItem.stationNumber}`,
          sessionNumber: activeItem.stationNumber,
          clientId: activeUser.uid,
          date: new Date().toISOString(),
          status: activeItem.stationNumber < currentSessionNumber ? 'completed' : 'scheduled',
          durationMinutes: 60,
          meetLink: activeItem.googleMeetUrl,
          notes: '',
          keyInsights: [],
          actionAgreements: [],
          somaticFocus: '',
          programNodeStep: activeItem.stationNumber,
        }
      : undefined;

  const activePostForm: PostSessionForm | undefined =
    activeItem.itemType === 'session' && activeItem.stationNumber
      ? postForms.find((f) => f.sessionNumber === activeItem.stationNumber)
      : undefined;

  // Estado del elemento activo
  const isItemCompleted =
    activeItem.itemType === 'workshop'
      ? isWorkshopAttended(
          activeItem.workshopId || '',
          activeItem.cycleNumber === 1 ? 'Raíz' : activeItem.cycleNumber === 2 ? 'Tallo' : 'Florecimiento'
        )
      : (activeItem.stationNumber || 1) < currentSessionNumber;

  const isItemActive =
    activeItem.itemType === 'session' && activeItem.stationNumber === currentSessionNumber;

  return (
    <div className="rounded-3xl border border-black/10 dark:border-white/15 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl overflow-hidden shadow-sm transition-all space-y-0">
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR DE PESTAÑAS DEL TEMARIO                                  */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 border-b border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-900/40 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 text-black dark:text-white flex items-center justify-center shrink-0 border border-black/10 dark:border-white/15">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-black dark:text-white font-mono uppercase tracking-wider">
                  Temario Ontológico & Syllabus de Información
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30">
                  Lectura & Acreditación Continua
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                3 ciclos formativos, 12 estaciones temáticas y 3 talleres troncales integrados con Google Workspace.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-neutral-500 shrink-0">
            Estación actual:{' '}
            <strong className="text-black dark:text-white font-bold">
              E{currentSessionNumber.toString().padStart(2, '0')}
            </strong>{' '}
            (Ciclo {currentCycle})
          </div>
        </div>

        {/* Pestañas de Selección de Ciclo & Expediente */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          {TEMARIO_SYLLABUS_DATA.map((cycle) => {
            const isTabActive = activeCycleTab === cycle.cycleNumber;
            const isCurrentCycle = currentCycle === cycle.cycleNumber;

            return (
              <button
                key={cycle.cycleNumber}
                type="button"
                onClick={() => {
                  setActiveCycleTab(cycle.cycleNumber);
                  onSelectItem(cycle.items[0].id);
                }}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer select-none flex flex-col justify-between gap-1.5 ${
                  isTabActive
                    ? 'ring-2 ring-black dark:ring-white bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                    : 'bg-white/30 dark:bg-neutral-900/35 backdrop-blur-xs border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:border-black/25 dark:hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                    Ciclo {cycle.cycleNumber}
                  </span>
                  {isCurrentCycle && (
                    <span
                      className={`text-[9px] font-mono px-2 py-0.2 rounded-full font-bold uppercase ${
                        isTabActive
                          ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      En Curso
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold truncate">{cycle.badge}</div>
                <div
                  className={`text-[10px] font-light truncate ${
                    isTabActive ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-500'
                  }`}
                >
                  4 Estaciones + 1 Taller
                </div>
              </button>
            );
          })}

          {/* 4ta Pestaña: Expediente Google Workspace */}
          <button
            type="button"
            onClick={() => setActiveCycleTab('expediente')}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer select-none flex flex-col justify-between gap-1.5 ${
              activeCycleTab === 'expediente'
                ? 'ring-2 ring-black dark:ring-white bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                : 'bg-white/30 dark:bg-neutral-900/35 backdrop-blur-xs border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:border-black/25 dark:hover:border-white/25'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
                Expediente
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold uppercase ${
                  activeCycleTab === 'expediente'
                    ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                4 Fuentes
              </span>
            </div>
            <div className="text-xs font-semibold truncate">Google Workspace</div>
            <div
              className={`text-[10px] font-light truncate ${
                activeCycleTab === 'expediente'
                  ? 'text-neutral-300 dark:text-neutral-700'
                  : 'text-neutral-500'
              }`}
            >
              Forms & Sheets en Vivo
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA                                 */}
      {/* ========================================================================= */}
      {activeCycleTab === 'expediente' ? (
        <div className="p-5 sm:p-8 space-y-6">
          <UnifiedFormsSheetsClientView client={activeUser} />
        </div>
      ) : currentCycleData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
          {/* ======================================================================= */}
          {/* PANEL LATERAL: ÍNDICE DE TEMAS DEL CICLO (SYLLABUS INDEX)               */}
          {/* ======================================================================= */}
          <div className="lg:col-span-4 border-r border-black/10 dark:border-white/10 p-4 sm:p-5 space-y-3 bg-white/10 dark:bg-neutral-900/20 backdrop-blur-xs">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 px-1">
              Contenido Temático • {currentCycleData.badge}
            </div>

            <div className="space-y-2">
              {currentCycleData.items.map((item) => {
                const isSelected = activeItem.id === item.id;
                const isWorkshop = item.itemType === 'workshop';
                const stationNum = item.stationNumber || 0;
                const completed = isWorkshop
                  ? isWorkshopAttended(
                      item.workshopId || '',
                      item.cycleNumber === 1 ? 'Raíz' : item.cycleNumber === 2 ? 'Tallo' : 'Florecimiento'
                    )
                  : stationNum < currentSessionNumber;
                const inProgress = !isWorkshop && stationNum === currentSessionNumber;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectItem(item.id)}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer select-none flex items-start gap-3 group relative ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                        : 'bg-white/30 dark:bg-neutral-900/35 backdrop-blur-xs border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:border-black/25 dark:hover:border-white/25 hover:bg-white/45 dark:hover:bg-neutral-900/50'
                    }`}
                  >
                    {/* Icono de Tipo e Indicador */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5 ${
                        isSelected
                          ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                          : isWorkshop
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                          : inProgress
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : completed
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {isWorkshop ? 'TR' : `E${stationNum.toString().padStart(2, '0')}`}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-mono uppercase tracking-wider font-semibold truncate ${
                            isSelected
                              ? 'text-neutral-300 dark:text-neutral-600'
                              : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          {item.phaseLabel}
                        </span>
                        {completed ? (
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected
                                ? 'text-white dark:text-black'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          />
                        ) : inProgress ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                        ) : (
                          <Circle className="w-3 h-3 shrink-0 opacity-25" />
                        )}
                      </div>

                      <h4 className="text-xs font-bold leading-snug truncate mt-0.5">
                        {item.title}
                      </h4>

                      <p
                        className={`text-[11px] truncate font-light mt-0.5 ${
                          isSelected
                            ? 'text-neutral-300 dark:text-neutral-700'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Micro-resumen del Ciclo */}
            <div className="p-3.5 rounded-2xl bg-white/20 dark:bg-neutral-900/30 border border-black/10 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed mt-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black dark:text-white block mb-1">
                Propósito del Ciclo {currentCycleData.cycleNumber}:
              </span>
              {currentCycleData.essence}
            </div>
          </div>

          {/* ======================================================================= */}
          {/* PANEL CENTRAL: LECTOR DE INFORMACIÓN DEL TEMA (THEME READER VIEW)       */}
          {/* ======================================================================= */}
          <div className="lg:col-span-8 p-5 sm:p-8 space-y-6 overflow-y-auto">
            {/* Cabecera del Tema en Lectura */}
            <div className="space-y-2 pb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold border ${activeItemCycle.accent.border} ${activeItemCycle.accent.softBg} ${activeItemCycle.accent.badgeText}`}
                  >
                    {activeItem.phaseLabel}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">•</span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {activeItem.levelBadge}
                  </span>
                </div>

                <div>
                  {isItemCompleted ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tema Acreditado / Completado
                    </span>
                  ) : isItemActive ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xs border border-black/20 dark:border-white/20 px-3 py-1 rounded-full shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Tema Activo • Tu Encuentro Actual
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-500 font-mono bg-white/20 dark:bg-neutral-800/30 border border-black/5 dark:border-white/5 px-3 py-1 rounded-full">
                      ○ Próximo en tu Ruta de Formación
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">
                {activeItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                {activeItem.subtitle}
              </p>
            </div>

            {/* 1. MARCO TEÓRICO ONTOLÓGICO: LECTURA DE INFORMACIÓN */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/30 dark:bg-neutral-900/40 backdrop-blur-md border border-black/10 dark:border-white/10 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-black dark:text-white">
                  Marco Teórico Ontológico & Lectura Conceptual
                </h4>
              </div>

              <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 font-light leading-relaxed">
                {activeItem.theoreticalFramework.summary}
              </p>

              {/* Conceptos Clave en Tarjetas de Lectura */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {activeItem.theoreticalFramework.keyConcepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/40 dark:bg-neutral-950/45 border border-black/10 dark:border-white/10 space-y-1"
                  >
                    <span className="text-[11px] font-mono font-bold uppercase text-black dark:text-white block">
                      {concept.term}
                    </span>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-snug">
                      {concept.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-[11px] font-mono text-neutral-500 pt-1">
                <strong>Eje Ontológico:</strong> {activeItem.theoreticalFramework.ontologicalAxis}
              </div>
            </div>

            {/* 2. PREGUNTA GUÍA ONTOLÓGICA (DESTAQUE EDITORIAL) */}
            <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-500/10 via-white/30 to-transparent dark:from-emerald-950/30 dark:via-neutral-900/35 dark:to-transparent border border-emerald-500/25 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono block">
                Pregunta de Indagación & Auto-Observación
              </span>
              <blockquote className="text-sm sm:text-base font-medium text-black dark:text-white italic leading-snug">
                «{activeItem.guidingQuestion}»
              </blockquote>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                Dedica unos minutos a respirar con esta pregunta antes de continuar. No busques respuestas inmediatas; permite que tu cuerpo y tus emociones hablen.
              </p>
            </div>

            {/* 3. OBJETIVO & RESULTADOS TANGIBLES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/25 dark:bg-neutral-900/35 border border-black/10 dark:border-white/10 space-y-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                  Propósito de Transformación
                </span>
                <p className="text-xs text-neutral-800 dark:text-neutral-200 font-light leading-relaxed">
                  {activeItem.objective}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/25 dark:bg-neutral-900/35 border border-black/10 dark:border-white/10 space-y-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                  Resultados Tangibles Conquistados
                </span>
                <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 font-light">
                  {activeItem.tangibleOutcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. PRÁCTICA SOMÁTICA DIARIA & METODOLOGÍA */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/30 dark:bg-neutral-900/40 backdrop-blur-md border border-black/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-black dark:text-white">
                  Micro-Práctica Somática Diaria
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-white/40 dark:bg-black/35 border border-black/10 dark:border-white/10 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <strong className="text-xs font-semibold text-black dark:text-white">
                    {activeItem.somaticPractice.title}
                  </strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    Frecuencia: {activeItem.somaticPractice.frequency}
                  </span>
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                  {activeItem.somaticPractice.instruction}
                </p>
                <div className="text-[11px] font-mono text-neutral-500">
                  <strong>Anclaje somático:</strong> {activeItem.somaticPractice.bodyAnchor}
                </div>
              </div>

              {/* Metodología en 3 Dominios */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                <div className="p-3 rounded-xl bg-white/20 dark:bg-neutral-950/30 border border-black/10 dark:border-white/10">
                  <span className="font-mono font-bold block text-neutral-500 uppercase mb-1">
                    1. Lingüístico
                  </span>
                  <p className="text-neutral-700 dark:text-neutral-300 font-light">
                    {activeItem.methodology.linguistic}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/20 dark:bg-neutral-950/30 border border-black/10 dark:border-white/10">
                  <span className="font-mono font-bold block text-neutral-500 uppercase mb-1">
                    2. Somático
                  </span>
                  <p className="text-neutral-700 dark:text-neutral-300 font-light">
                    {activeItem.methodology.somatic}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/20 dark:bg-neutral-950/30 border border-black/10 dark:border-white/10">
                  <span className="font-mono font-bold block text-neutral-500 uppercase mb-1">
                    3. Emocional
                  </span>
                  <p className="text-neutral-700 dark:text-neutral-300 font-light">
                    {activeItem.methodology.emotional}
                  </p>
                </div>
              </div>
            </div>

            {/* 5. MATERIALES DE ESTUDIO ASOCIADOS */}
            {activeItem.studyMaterials && activeItem.studyMaterials.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                  Materiales de Estudio & Guías de Trabajo
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeItem.studyMaterials.map((mat, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/25 dark:bg-neutral-900/35 backdrop-blur-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-black dark:text-white">
                          {mat.title}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">{mat.pages}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 block">
                        {mat.type}
                      </span>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                        {mat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 6. NUEVAS INTEGRACIONES DE LA APLICACIÓN & ACCIONES                   */}
            {/* ===================================================================== */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/40 dark:bg-neutral-900/50 backdrop-blur-md border border-black/10 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-black dark:text-white">
                    Integraciones Oficiales & Acciones del Tema
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  Google Workspace & Cloud Sync
                </span>
              </div>

              {/* Botones de Integración */}
              <div className="flex flex-wrap items-center gap-3">
                {/* 1. GOOGLE MEET */}
                <a
                  href={activeItem.googleMeetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Video className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Unirme por Google Meet</span>
                </a>

                {/* 2. GOOGLE FORMS */}
                <a
                  href={activeItem.googleFormsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xs text-xs font-semibold text-black dark:text-white hover:bg-white/80 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>{activeItem.googleFormsLabel}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>

                {/* 3. DESCARGA DE MEMORIA / CUADERNO (PDF) */}
                {activeItem.itemType === 'workshop' ? (
                  <button
                    type="button"
                    onClick={() => onDownloadWorkshopPDF(activeItem)}
                    className="px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xs text-xs font-semibold text-black dark:text-white hover:bg-white/80 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-500" />
                    <span>Descargar Memoria de Taller (PDF)</span>
                  </button>
                ) : activePostForm ? (
                  <button
                    type="button"
                    onClick={() => onDownloadSessionPDF(activePostForm, activeSession)}
                    className="px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xs text-xs font-semibold text-black dark:text-white hover:bg-white/80 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-500" />
                    <span>Descargar Bitácora E{activeItem.stationNumber} (PDF)</span>
                  </button>
                ) : null}

                {/* 4. EDITAR O REGISTRAR BITÁCORA (MODAL) */}
                {activeItem.itemType === 'session' && activeSession && (
                  <button
                    type="button"
                    onClick={() => onOpenBitacora(activeSession)}
                    className="px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xs text-xs font-semibold text-black dark:text-white hover:bg-white/80 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-neutral-500" />
                    <span>
                      {activePostForm ? 'Ver / Editar Bitácora en Modal' : 'Registrar Bitácora'}
                    </span>
                  </button>
                )}

                {/* 5. AGENDAR CON GOOGLE CALENDAR */}
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Google Calendar</span>
                </a>
              </div>

              {/* Registro previo si existe en bitácora */}
              {activePostForm && (
                <div className="p-4 rounded-xl bg-white/40 dark:bg-black/40 border border-black/10 dark:border-white/10 space-y-2 text-xs">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    ✓ Registro ontológico archivado para esta estación:
                  </div>
                  <div>
                    <strong className="text-black dark:text-white">Tema Emergente:</strong>{' '}
                    <span className="text-neutral-700 dark:text-neutral-300 font-light">
                      {activePostForm.emergentTopic || activePostForm.masterJudgmentAndNarrative}
                    </span>
                  </div>
                  {activePostForm.actionStep && (
                    <div>
                      <strong className="text-black dark:text-white">Paso a la Acción:</strong>{' '}
                      <span className="text-neutral-700 dark:text-neutral-300 font-light">
                        {activePostForm.actionStep}
                      </span>
                    </div>
                  )}
                  {activePostForm.cycleHarvest && (
                    <div className="mt-1 p-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black text-[11px] font-light">
                      <strong className="text-amber-400 dark:text-amber-600 block font-semibold mb-0.5">
                        ★ Cosecha del Ciclo:
                      </strong>
                      {activePostForm.cycleHarvest}
                    </div>
                  )}
                </div>
              )}

              {/* Si la estación es futura o inactiva: Mostrar información de pago Bre-B Nu */}
              {!isItemCompleted && !isItemActive && activeItem.itemType === 'session' && (
                <div className="p-4 rounded-xl bg-white/30 dark:bg-neutral-950/40 border border-black/10 dark:border-white/10 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-black dark:text-white shrink-0" />
                      <span className="font-semibold text-black dark:text-white">
                        Habilitación vía {BRE_B_NU_CONFIG.title} ({BRE_B_NU_CONFIG.bank})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs">
                        {BRE_B_NU_CONFIG.llave}
                      </span>
                      <button
                        type="button"
                        onClick={onCopyPaymentKey}
                        className="px-3 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white/60 dark:bg-neutral-800 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                      >
                        {copiedPaymentKey ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Copiado</span>
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

                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                    Inversión por ciclo de 4 sesiones: $500.000 COP • Proceso integral (12 sesiones): $1.500.000 COP. Transferencias gratuitas desde Nu, Bancolombia, Nequi, Daviplata, BBVA o Dale.
                  </p>

                  <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-neutral-500 font-light">
                      Al transferir, reporta tu comprobante para habilitación inmediata:
                    </span>
                    <a
                      href={`https://wa.me/${BRE_B_NU_CONFIG.whatsappRaw}?text=${encodeURIComponent(
                        `Hola Coach John Fredy, adjunto soporte de pago para habilitar la ${activeItem.title} en mi portal Certeza.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-500" />
                      <span>Validar por WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
