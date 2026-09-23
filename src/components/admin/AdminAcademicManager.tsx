import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Calendar,
  BookOpen,
  FileSpreadsheet,
  Zap,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { OntologicalStore } from '../../services/store';
import { safeCopyToClipboard } from '../../utils/clipboard';
import {
  CronogramaEvent,
  OntologicalProgram,
  EventRegistration,
} from '../../types';
import { ProgramsAndEventsManager } from '../ProgramsAndEventsManager';
import { AdminSessionsManager } from './AdminSessionsManager';
import { AdminFormsSheetsIntegrationPanel } from './AdminFormsSheetsIntegrationPanel';
import AdminAutomationsManager from './AdminAutomationsManager';

export type AcademicAdminSubTab =
  | 'events'
  | 'sessions'
  | 'forms_sheets'
  | 'integrations'
  | 'sheets'
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
  const [currentTab, setCurrentTab] = useState<'events' | 'sessions' | 'forms_sheets' | 'automations'>(() => {
    if (initialSubTab === 'sessions') return 'sessions';
    if (initialSubTab === 'forms_sheets' || initialSubTab === 'sheets' || initialSubTab === 'integrations') return 'forms_sheets';
    if (initialSubTab === 'automations' || initialSubTab === 'triggers' || initialSubTab === 'activadores') return 'automations';
    return 'events';
  });

  const [version, setVersion] = useState(0);
  const [copiedCalendar, setCopiedCalendar] = useState(false);
  const calendarSessionsUrl = OntologicalStore.getCalendarUrl(); // https://calendar.app.google/b5h9YrYnyjME7LbD7

  useEffect(() => {
    if (initialSubTab === 'sessions') {
      setCurrentTab('sessions');
    } else if (initialSubTab === 'forms_sheets' || initialSubTab === 'sheets' || initialSubTab === 'integrations') {
      setCurrentTab('forms_sheets');
    } else if (initialSubTab === 'automations' || initialSubTab === 'triggers' || initialSubTab === 'activadores') {
      setCurrentTab('automations');
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
      {/* Encabezado Principal de Eventos, Talleres, Sesiones & Google Forms/Sheets */}
      <div className="p-6 sm:p-7 rounded-3xl banner-executive text-black dark:text-white shadow-xs relative overflow-hidden transition-all">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Gestión Integral: Eventos, Sesiones & Google Workspace</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-black dark:text-white flex items-center gap-2.5">
                <span>Eventos, Talleres y Sesiones</span>
              </h2>
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 font-light leading-relaxed">
                Consola para gestionar talleres ontológicos en vivo, catálogo formativo de sesiones organizadas por niveles y sincronización con Google Forms & Sheets.
              </p>
            </div>

            {/* Acceso Directo a Agenda Google Calendar para Sesiones */}
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0 bg-white/70 dark:bg-neutral-900/70 p-3 rounded-2xl border border-emerald-500/20 shadow-2xs backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <a
                  href={calendarSessionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
                  title="Abrir página de reservas en Google Calendar"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agenda Sesiones</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    safeCopyToClipboard(calendarSessionsUrl);
                    setCopiedCalendar(true);
                    setTimeout(() => setCopiedCalendar(false), 2500);
                  }}
                  className="p-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 text-gray-700 dark:text-neutral-300 transition-all cursor-pointer"
                  title="Copiar enlace de Google Calendar"
                >
                  {copiedCalendar ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-mono truncate max-w-[220px]">
                {calendarSessionsUrl}
              </span>
            </div>
          </div>

          {/* Métricas Clave */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-black/5 dark:border-white/10 w-full">
            <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-2xs">
              <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-semibold uppercase tracking-wider">
                Eventos y Talleres
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-black dark:text-white">{rawEvents.length}</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">({homeEventsCount} en Home)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-2xs">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold uppercase tracking-wider">
                Sesiones
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-black dark:text-white">{programNodes.length}</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Sesiones Creadas</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-2xs">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold uppercase tracking-wider">
                Participantes
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-black dark:text-white">{rawRegistrations.length}</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">En Base de Datos</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-2xs">
              <span className="text-[10px] text-sky-600 dark:text-sky-400 block font-semibold uppercase tracking-wider">
                Google Forms & Sheets
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-bold text-black dark:text-white">4 Enlaces</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Sincronizado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN: EVENTOS Y TALLERES | SESIONES | GOOGLE FORMS & SHEETS | AUTOMATIZACIONES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-1.5 rounded-2xl glass-panel-opal border border-white/60 dark:border-white/10 shadow-2xs">
        {/* BOTÓN 1: EVENTOS Y TALLERES */}
        <button
          type="button"
          onClick={() => setCurrentTab('events')}
          className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            currentTab === 'events'
              ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-md ring-2 ring-rose-500/40 border border-rose-500/30'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80'
          }`}
        >
          <Calendar className="w-4 h-4 text-rose-500" />
          <span>Eventos y Talleres</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
            currentTab === 'events'
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
              : 'bg-neutral-200/80 dark:bg-neutral-700/80 text-neutral-800 dark:text-neutral-200'
          }`}>
            {rawEvents.length}
          </span>
        </button>

        {/* BOTÓN 2: SESIONES */}
        <button
          type="button"
          onClick={() => setCurrentTab('sessions')}
          className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            currentTab === 'sessions'
              ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-md ring-2 ring-emerald-500/40 border border-emerald-500/30'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Sesiones</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
            currentTab === 'sessions'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
              : 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
          }`}>
            {programNodes.length} Sesiones
          </span>
        </button>

        {/* BOTÓN 3: GOOGLE FORMS & SHEETS */}
        <button
          type="button"
          onClick={() => setCurrentTab('forms_sheets')}
          className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            currentTab === 'forms_sheets'
              ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-md ring-2 ring-emerald-500/40 border border-emerald-500/30'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Google Forms & Sheets</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
            currentTab === 'forms_sheets'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
              : 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
          }`}>
            4 Fuentes
          </span>
        </button>

        {/* BOTÓN 4: AUTOMATIZACIONES & WEBHOOKS */}
        <button
          type="button"
          onClick={() => setCurrentTab('automations')}
          className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            currentTab === 'automations'
              ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-md ring-2 ring-amber-500/40 border border-amber-500/30'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Automatizaciones</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
            currentTab === 'automations'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
              : 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
          }`}>
            Make & Logs
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
          <AdminSessionsManager
            onRefreshParent={handleRefresh}
            onGoToAutomations={() => setCurrentTab('automations')}
          />
        )}

        {currentTab === 'forms_sheets' && (
          <AdminFormsSheetsIntegrationPanel />
        )}

        {currentTab === 'automations' && (
          <AdminAutomationsManager onRefresh={handleRefresh} />
        )}
      </div>
    </div>
  );
};
