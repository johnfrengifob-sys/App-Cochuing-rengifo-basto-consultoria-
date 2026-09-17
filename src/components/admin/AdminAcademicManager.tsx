import React, { useState, useEffect } from 'react';
import {
  Calendar,
  BookOpen,
  CalendarCheck2,
  FileSpreadsheet,
  UserCheck,
  Zap,
} from 'lucide-react';
import { OntologicalStore } from '../../services/store';
import {
  CronogramaEvent,
  OntologicalProgram,
  EventRegistration,
} from '../../types';
import { ProgramsAndEventsManager } from '../ProgramsAndEventsManager';
import { AdminSessionsManager } from './AdminSessionsManager';

function SubPanelFallback({ title = 'Cargando Sub-Panel...' }: { title?: string }) {
  return (
    <div className="p-10 rounded-2xl glass-panel-opal border border-white/60 dark:border-white/10 flex flex-col items-center justify-center space-y-3 min-h-[260px]">
      <div className="w-7 h-7 rounded-full border-2 border-emerald-500/20 border-t-emerald-600 animate-spin" />
      <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 tracking-wider uppercase animate-pulse">
        {title}
      </span>
    </div>
  );
}

export type AcademicAdminSubTab =
  | 'events'
  | 'sessions'
  | 'automations'
  | 'triggers'
  | 'activadores'
  | 'cerebro'
  | 'participants'
  | 'workbooks'
  | 'editor'
  | string;

interface AdminAcademicManagerProps {
  initialSubTab?: AcademicAdminSubTab | string;
  cronogramaEvents?: CronogramaEvent[];
  programs?: OntologicalProgram[];
  eventRegistrations?: EventRegistration[];
  onRefreshEvents?: () => void;
  onRefreshPrograms?: () => void;
  onRefreshRegistrations?: () => void;
  onOpenRegistrationPortal?: () => void;
}

export const AdminAcademicManager: React.FC<AdminAcademicManagerProps> = ({
  initialSubTab = 'events',
  cronogramaEvents: propEvents,
  programs: propPrograms,
  eventRegistrations: propRegistrations,
  onRefreshEvents: propOnRefreshEvents,
  onRefreshPrograms: propOnRefreshPrograms,
  onRefreshRegistrations: propOnRefreshRegistrations,
  onOpenRegistrationPortal,
}) => {
  const [currentTab, setCurrentTab] = useState<'events' | 'sessions'>(() => {
    return initialSubTab === 'sessions' ? 'sessions' : 'events';
  });

  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (initialSubTab === 'sessions') {
      setCurrentTab('sessions');
    } else {
      setCurrentTab('events');
    }
  }, [initialSubTab]);

  const rawPrograms = propPrograms || OntologicalStore.getPrograms();
  const rawEvents = propEvents || OntologicalStore.getCronogramaEvents();
  const rawRegistrations = propRegistrations || OntologicalStore.getEventRegistrations();
  const programNodes = OntologicalStore.getProgramNodes();
  const homeEventsCount = rawEvents.filter((e) => e.showOnHome !== false).length;

  const handleRefresh = () => {
    setVersion((v) => v + 1);
    propOnRefreshPrograms?.();
    propOnRefreshEvents?.();
    propOnRefreshRegistrations?.();
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal Unificado */}
      <div className="p-6 rounded-3xl banner-executive text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-neutral-300 text-xs font-semibold backdrop-blur-md">
              <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gestión Integral Ontológica</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Eventos, Talleres y Sesiones de Consultoría</span>
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 font-light leading-relaxed">
              Consola unificada para crear talleres y eventos en vivo, integrar activadores de seguimiento, vincular formularios y bases de datos en Google Sheets para el seguimiento 1 a 1 de participantes, y administrar los 12 módulos de sesiones de consultoría.
            </p>
          </div>

          {/* Métricas Clave */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 w-full">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-[10px] text-rose-300 block font-semibold uppercase tracking-wider">
                Eventos y Talleres
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-white">{rawEvents.length}</span>
                <span className="text-[10px] text-neutral-300">({homeEventsCount} en Home)</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-[10px] text-emerald-300 block font-semibold uppercase tracking-wider">
                Sesiones Consultoría
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-white">{programNodes.length}</span>
                <span className="text-[10px] text-emerald-200">Módulos 1 a 1</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-[10px] text-amber-300 block font-semibold uppercase tracking-wider">
                Participantes
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-white">{rawRegistrations.length}</span>
                <span className="text-[10px] text-amber-200">En Base de Datos</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-[10px] text-cyan-300 block font-semibold uppercase tracking-wider">
                Google Sheets & Triggers
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-bold text-white">Sincronizado</span>
                <span className="text-[10px] text-neutral-300">1 a 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN UNIFICADA: EXACTAMENTE DOS BOTONES PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        {/* BOTÓN 1: EVENTOS Y TALLERES */}
        <button
          type="button"
          onClick={() => setCurrentTab('events')}
          className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            currentTab === 'events'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-800/60'
          }`}
        >
          <Calendar className="w-4 h-4 text-rose-500" />
          <span>Eventos y Talleres</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-mono">
            {rawEvents.length}
          </span>
        </button>

        {/* BOTÓN 2: SESIONES DE CONSULTORÍA (12 MÓDULOS) */}
        <button
          type="button"
          onClick={() => setCurrentTab('sessions')}
          className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            currentTab === 'sessions'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <span>Sesiones de Consultoría (12 Módulos)</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono">
            {programNodes.length} Módulos
          </span>
        </button>
      </div>

      {/* RENDERIZADO DEL PANEL ACTIVO */}
      <div key={version}>
        {currentTab === 'events' && (
          <ProgramsAndEventsManager
            cronogramaEvents={rawEvents}
            programs={rawPrograms}
            eventRegistrations={rawRegistrations}
            onRefreshEvents={handleRefresh}
            onRefreshPrograms={handleRefresh}
            onRefreshRegistrations={handleRefresh}
            onOpenRegistrationPortal={onOpenRegistrationPortal}
          />
        )}

        {currentTab === 'sessions' && (
          <AdminSessionsManager onRefreshParent={handleRefresh} />
        )}
      </div>
    </div>
  );
};
