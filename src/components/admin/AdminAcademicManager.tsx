import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  ShieldCheck,
  Workflow,
  Zap,
  Ticket,
  Link2,
  CalendarCheck2,
  Layers,
} from 'lucide-react';
import { OntologicalStore } from '../../services/store';
import {
  CronogramaEvent,
  OntologicalProgram,
  EventRegistration,
} from '../../types';

const AdminAutomationsManager = lazy(() =>
  import('./AdminAutomationsManager').then((m) => ({ default: m.AdminAutomationsManager }))
);
const AutomatedTriggersManager = lazy(() =>
  import('../AutomatedTriggersManager').then((m) => ({ default: m.AutomatedTriggersManager }))
);
const ProgramsAndEventsManager = lazy(() =>
  import('../ProgramsAndEventsManager').then((m) => ({ default: m.ProgramsAndEventsManager }))
);
const CerebroVinculacionManager = lazy(() =>
  import('../CerebroVinculacionManager').then((m) => ({ default: m.CerebroVinculacionManager }))
);
const ExperienceEditorManager = lazy(() =>
  import('./ExperienceEditorManager').then((m) => ({ default: m.ExperienceEditorManager }))
);

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
  | 'experiences'
  | 'activadores'
  | 'cerebro'
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
  const [currentTab, setCurrentTab] = useState<'events' | 'activadores' | 'cerebro' | 'espacios' | 'experiences'>(() => {
    if (initialSubTab === 'cerebro') return 'cerebro';
    if (initialSubTab === 'espacios') return 'espacios';
    if (initialSubTab === 'experiences') return 'experiences';
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

  const [eventsInitialSubTab, setEventsInitialSubTab] = useState<'events' | 'sessions' | 'participants'>(() => {
    if (initialSubTab === 'sessions') return 'sessions';
    if (initialSubTab === 'participants') return 'participants';
    return 'events';
  });

  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (initialSubTab) {
      if (initialSubTab === 'cerebro') {
        setCurrentTab('cerebro');
      } else if (initialSubTab === 'espacios') {
        setCurrentTab('espacios');
      } else if (initialSubTab === 'experiences') {
        setCurrentTab('experiences');
      } else if (initialSubTab === 'automations') {
        setCurrentTab('activadores');
        setActivadoresMode('automations');
      } else if (initialSubTab === 'triggers' || initialSubTab === 'activadores') {
        setCurrentTab('activadores');
        setActivadoresMode('triggers');
      } else if (initialSubTab === 'sessions') {
        setCurrentTab('events');
        setEventsInitialSubTab('sessions');
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
  const rawSessions = OntologicalStore.getSessions();
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 border-t border-white/10 w-full">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-rose-300 block font-medium uppercase tracking-wider">
                Talleres
              </span>
              <span className="text-base font-black font-mono text-white">{rawEvents.length}</span>
              <span className="text-[9px] text-neutral-300 block">{homeEventsCount} en Home</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-emerald-300 block font-medium uppercase tracking-wider">
                Sesiones 1 a 1
              </span>
              <span className="text-base font-black font-mono text-white">{rawSessions.length}</span>
              <span className="text-[9px] text-emerald-200 block">Sincronizadas</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-amber-300 block font-medium uppercase tracking-wider">
                Asistentes
              </span>
              <span className="text-base font-black font-mono text-white">{rawRegistrations.length}</span>
              <span className="text-[9px] text-neutral-300 block">Pre-Registros</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-sky-300 block font-medium uppercase tracking-wider">
                Activadores
              </span>
              <span className="text-base font-black font-mono text-white">
                {activeTriggersCount} / {automatedTriggers.length}
              </span>
              <span className="text-[9px] text-neutral-300 block">Reglas Activas</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center col-span-2 sm:col-span-1">
              <span className="text-[9px] text-indigo-300 block font-medium uppercase tracking-wider">
                Automatizaciones
              </span>
              <span className="text-base font-black font-mono text-white">4 Fases</span>
              <span className="text-[9px] text-neutral-300 block">Make.com Webhooks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs: 1. Eventos & Talleres, 2. Sesiones 1 a 1, 3. Activadores, 4. Cerebro */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-100/90 dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 overflow-x-auto no-scrollbar">
        {/* Tab 1: Eventos & Talleres */}
        <button
          type="button"
          onClick={() => {
            setCurrentTab('events');
            setEventsInitialSubTab('events');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'events' && eventsInitialSubTab !== 'sessions'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <Ticket className="w-3.5 h-3.5 text-rose-500" />
          <span>Eventos y Talleres ({rawEvents.length})</span>
        </button>

        {/* Tab 2: Sesiones 1 a 1 */}
        <button
          type="button"
          onClick={() => {
            setCurrentTab('events');
            setEventsInitialSubTab('sessions');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'events' && eventsInitialSubTab === 'sessions'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Sesiones de Consultoría ({rawSessions.length})</span>
        </button>

        {/* Tab 3: Activadores */}
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
          <span>Activadores ({activeTriggersCount})</span>
        </button>

        {/* Tab 4: Cerebro & Vinculación */}
        <button
          type="button"
          onClick={() => setCurrentTab('cerebro')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'cerebro'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <Link2 className="w-3.5 h-3.5 text-indigo-500" />
          <span>Cerebro & Enlaces</span>
        </button>

        {/* Tab 5: Editor de Experiencias B&W */}
        <button
          type="button"
          onClick={() => setCurrentTab('experiences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'experiences'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-500" />
          <span>Editor de Experiencias (Lienzo B&W)</span>
        </button>
      </div>

      {/* Render Active Sub-Panel */}
      <div key={version}>
        {currentTab === 'experiences' && (
          <Suspense fallback={<SubPanelFallback title="Cargando Constructor de Experiencias B&W..." />}>
            <ExperienceEditorManager />
          </Suspense>
        )}

        {currentTab === 'events' && (
          <Suspense fallback={<SubPanelFallback title="Cargando Programas y Eventos..." />}>
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
          </Suspense>
        )}

        {currentTab === 'cerebro' && (
          <Suspense fallback={<SubPanelFallback title="Cargando Cerebro de Vinculaciones & Enlaces..." />}>
            <CerebroVinculacionManager />
          </Suspense>
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

            <Suspense fallback={<SubPanelFallback title="Cargando Módulo de Automatización..." />}>
              {activadoresMode === 'triggers' ? (
                <AutomatedTriggersManager />
              ) : (
                <AdminAutomationsManager onRefresh={handleRefresh} />
              )}
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

