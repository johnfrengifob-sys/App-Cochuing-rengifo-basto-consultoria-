import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Workflow,
  Zap,
  Ticket,
} from 'lucide-react';
import { AdminAutomationsManager } from './AdminAutomationsManager';
import { AutomatedTriggersManager } from '../AutomatedTriggersManager';
import { ProgramsAndEventsManager } from '../ProgramsAndEventsManager';
import { OntologicalStore } from '../../services/store';
import {
  CronogramaEvent,
  OntologicalProgram,
  EventRegistration,
} from '../../types';

export type AcademicAdminSubTab =
  | 'events'
  | 'activadores'
  | 'triggers'
  | 'automations'
  | 'participants'
  // Backward compatibility aliases
  | 'curriculum'
  | 'generator'
  | 'emails'
  | 'courses'
  | 'temarios'
  | 'steps'
  | 'questionnaires'
  | 'pricing';

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
  const [currentTab, setCurrentTab] = useState<'events' | 'activadores'>(() => {
    if (
      initialSubTab === 'automations' ||
      initialSubTab === 'triggers' ||
      initialSubTab === 'activadores'
    ) {
      return 'activadores';
    }
    return 'events';
  });

  const [activadoresMode, setActivadoresMode] = useState<'triggers' | 'automations'>(() => {
    return initialSubTab === 'automations' ? 'automations' : 'triggers';
  });

  const [eventsInitialSubTab, setEventsInitialSubTab] = useState<'events' | 'participants'>(() => {
    return initialSubTab === 'participants' ? 'participants' : 'events';
  });

  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (initialSubTab) {
      if (initialSubTab === 'automations') {
        setCurrentTab('activadores');
        setActivadoresMode('automations');
      } else if (initialSubTab === 'triggers' || initialSubTab === 'activadores') {
        setCurrentTab('activadores');
        setActivadoresMode('triggers');
      } else if (initialSubTab === 'participants') {
        setCurrentTab('events');
        setEventsInitialSubTab('participants');
      } else {
        setCurrentTab('events');
        setEventsInitialSubTab('events');
      }
    }
  }, [initialSubTab]);

  const rawPrograms = propPrograms || OntologicalStore.getPrograms();
  const rawEvents = propEvents || OntologicalStore.getCronogramaEvents();
  const rawRegistrations = propRegistrations || OntologicalStore.getEventRegistrations();
  const automatedTriggers = OntologicalStore.getAutomatedTriggers();
  const activeTriggersCount = automatedTriggers.filter((t) => t.enabled).length;
  const homeEventsCount = rawEvents.filter((e) => e.showOnHome !== false).length;

  const handleRefresh = () => {
    setVersion((v) => v + 1);
    propOnRefreshPrograms?.();
    propOnRefreshEvents?.();
    propOnRefreshRegistrations?.();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-neutral-900 via-indigo-950 to-neutral-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Eventos y Sesiones</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Eventos y Sesiones</span>
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 font-light leading-relaxed">
              Consola integral para agendar conversatorios y talleres en vivo, gestionar asistentes RSVP, emitir cuadernos de trabajo en PDF y configurar activadores automáticos de integración.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10 w-full">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-rose-300 block font-medium uppercase tracking-wider">
                Eventos
              </span>
              <span className="text-base font-black font-mono text-white">{rawEvents.length}</span>
              <span className="text-[9px] text-neutral-300 block">{homeEventsCount} en Home</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-amber-300 block font-medium uppercase tracking-wider">
                Asistentes
              </span>
              <span className="text-base font-black font-mono text-white">{rawRegistrations.length}</span>
              <span className="text-[9px] text-neutral-300 block">Pre-Registros</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-emerald-300 block font-medium uppercase tracking-wider">
                Activadores
              </span>
              <span className="text-base font-black font-mono text-white">
                {activeTriggersCount} / {automatedTriggers.length}
              </span>
              <span className="text-[9px] text-neutral-300 block">Reglas Activas</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-indigo-300 block font-medium uppercase tracking-wider">
                Automatizaciones
              </span>
              <span className="text-base font-black font-mono text-white">4 Fases</span>
              <span className="text-[9px] text-neutral-300 block">Make.com Webhooks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs: 1. Eventos & Asistentes, 2. Activadores */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-100/90 dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 overflow-x-auto no-scrollbar">
        {/* Tab 1: Eventos & Asistentes */}
        <button
          type="button"
          onClick={() => {
            setCurrentTab('events');
            setEventsInitialSubTab('events');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'events'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <Ticket className="w-3.5 h-3.5 text-rose-500" />
          <span>Eventos & Asistentes</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
              currentTab === 'events'
                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
            }`}
          >
            {rawEvents.length} ev. · {rawRegistrations.length} asis.
          </span>
        </button>

        {/* Tab 2: Activadores (Agrupa Activadores y Automatizaciones Make.com) */}
        <button
          type="button"
          onClick={() => setCurrentTab('activadores')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'activadores'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Activadores</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
              currentTab === 'activadores'
                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
            }`}
          >
            {activeTriggersCount} activas · Make.com
          </span>
        </button>
      </div>

      {/* Render Active Sub-Panel */}
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
            initialSubTab={eventsInitialSubTab}
          />
        )}

        {currentTab === 'activadores' && (
          <div className="space-y-6">
            {/* Header switcher between Triggers and Automations within Activadores */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Activadores y Automatizaciones</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  Gestión centralizada de reglas automáticas de eventos, webhooks y flujos de integración Make.com
                </p>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200/70 dark:border-neutral-800 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActivadoresMode('triggers')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activadoresMode === 'triggers'
                      ? 'bg-white dark:bg-[#202024] text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Disparadores de Eventos ({activeTriggersCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivadoresMode('automations')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activadoresMode === 'automations'
                      ? 'bg-white dark:bg-[#202024] text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Workflow className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Automatizaciones Make.com (Webhooks)</span>
                </button>
              </div>
            </div>

            {activadoresMode === 'triggers' ? (
              <AutomatedTriggersManager />
            ) : (
              <AdminAutomationsManager onRefresh={handleRefresh} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

