import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  ListOrdered,
  HelpCircle,
  Sparkles,
  Layers,
  Settings,
  ShieldCheck,
  GraduationCap,
  Workflow,
  Zap,
  Mail,
  DollarSign,
  BookOpen,
  Calendar,
  Ticket,
  UserCheck,
} from 'lucide-react';
import { AdminCoursesManager } from './AdminCoursesManager';
import { AdminTemariosManager } from './AdminTemariosManager';
import { AdminRoadmapStepsManager } from './AdminRoadmapStepsManager';
import { AdminQuestionnairesManager } from './AdminQuestionnairesManager';
import { AdminAutomationsManager } from './AdminAutomationsManager';
import { AutomatedTriggersManager } from '../AutomatedTriggersManager';
import { ClientEmailFollowupManager } from '../ClientEmailFollowupManager';
import { PricingAndValuesBuilder } from '../PricingAndValuesBuilder';
import { WorkshopsAndAcademicHub } from '../WorkshopsAndAcademicHub';
import { ProgramsAndEventsManager } from '../ProgramsAndEventsManager';
import { OntologicalStore } from '../../services/store';
import {
  CronogramaEvent,
  OntologicalProgram,
  EventRegistration,
} from '../../types';

export type AcademicAdminSubTab =
  | 'events'
  | 'participants'
  | 'courses'
  | 'temarios'
  | 'steps'
  | 'questionnaires'
  | 'generator'
  | 'triggers'
  | 'emails'
  | 'pricing'
  | 'automations';

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
  initialSubTab = 'courses',
  cronogramaEvents: propEvents,
  programs: propPrograms,
  eventRegistrations: propRegistrations,
  onRefreshEvents: propOnRefreshEvents,
  onRefreshPrograms: propOnRefreshPrograms,
  onRefreshRegistrations: propOnRefreshRegistrations,
  onOpenRegistrationPortal,
}) => {
  const [currentTab, setCurrentTab] = useState<AcademicAdminSubTab>(() => {
    if (initialSubTab === 'meet_workshops') return 'events';
    return (initialSubTab || 'courses') as AcademicAdminSubTab;
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (initialSubTab) {
      if (initialSubTab === 'meet_workshops') {
        setCurrentTab('events');
      } else {
        setCurrentTab(initialSubTab as AcademicAdminSubTab);
      }
    }
  }, [initialSubTab]);

  const rawPrograms = propPrograms || OntologicalStore.getPrograms();
  const rawEvents = propEvents || OntologicalStore.getCronogramaEvents();
  const rawRegistrations = propRegistrations || OntologicalStore.getEventRegistrations();
  const nodes = OntologicalStore.getProgramNodes();
  const questionnaires = OntologicalStore.getQuestionnaires();

  const totalCapacity = rawPrograms.reduce((acc, p) => acc + (p.totalCapacity || 15), 0);
  const totalAvailable = rawPrograms.reduce(
    (acc, p) => acc + (p.availableSpots !== undefined ? p.availableSpots : p.totalCapacity || 15),
    0
  );
  const totalSteps = nodes.reduce((acc, n) => acc + (n.roadmapSteps || []).length, 0);
  const totalQuestions = questionnaires.reduce((acc, q) => acc + (q.questions || []).length, 0);

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
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Eventos y sesiones RBC</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Eventos y sesiones: Convocatorias, Talleres & Formación</span>
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 font-light max-w-2xl leading-relaxed">
              Consola integral para agendar conversatorios y masterclasses en vivo, monitorear pre-inscritos y RSVP, administrar la oferta de programas ontológicos, temarios, cuestionarios y disparadores automáticos.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-rose-300 block font-medium uppercase tracking-wider">
                Eventos
              </span>
              <span className="text-base font-black font-mono text-white">{rawEvents.length}</span>
              <span className="text-[9px] text-neutral-300 block">En Vivo</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-amber-300 block font-medium uppercase tracking-wider">
                Asistentes
              </span>
              <span className="text-base font-black font-mono text-white">{rawRegistrations.length}</span>
              <span className="text-[9px] text-neutral-300 block">Pre-Registros</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-indigo-300 block font-medium uppercase tracking-wider">
                Programas
              </span>
              <span className="text-base font-black font-mono text-white">{rawPrograms.length}</span>
              <span className="text-[9px] text-neutral-300 block">Activos</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-neutral-400 block font-medium uppercase tracking-wider">
                Capacidad
              </span>
              <span className="text-base font-black font-mono text-white">{totalCapacity}</span>
              <span className="text-[9px] text-emerald-300 block">{totalAvailable} libres</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-neutral-400 block font-medium uppercase tracking-wider">
                Nodos & Pasos
              </span>
              <span className="text-base font-black font-mono text-white">{nodes.length}</span>
              <span className="text-[9px] text-emerald-300 block">{totalSteps} Pasos</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[9px] text-neutral-400 block font-medium uppercase tracking-wider">
                Preguntas
              </span>
              <span className="text-base font-black font-mono text-white">{totalQuestions}</span>
              <span className="text-[9px] text-neutral-300 block">En Cuadernos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Homogenized Appearance) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-100/90 dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setCurrentTab('events')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'events'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <Ticket className="w-3.5 h-3.5 text-rose-500" />
          <span>1. Eventos & Cronograma</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
              currentTab === 'events'
                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
            }`}
          >
            {rawEvents.length}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('participants')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'participants'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>2. Asistentes & Convocatoria</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
              currentTab === 'participants'
                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
            }`}
          >
            {rawRegistrations.length}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('courses')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'courses'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
          <span>3. Cursos & Programas</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
              currentTab === 'courses'
                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {rawPrograms.length}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('temarios')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'temarios'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>4. Formularios de Temarios</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
              currentTab === 'temarios'
                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {nodes.length}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('steps')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'steps'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>5. Pasos de Talleres</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
              currentTab === 'steps'
                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {totalSteps}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('questionnaires')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'questionnaires'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>6. Cuestionarios & Preguntas</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
              currentTab === 'questionnaires'
                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {totalQuestions}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('generator')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'generator'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>7. Generador Talleres IA</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
              currentTab === 'generator'
                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Gemini
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('triggers')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'triggers'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>8. Activadores Automáticos</span>
        </button>

        <button
          onClick={() => setCurrentTab('emails')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'emails'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-sky-500" />
          <span>9. Seguimiento por Correo</span>
        </button>

        <button
          onClick={() => setCurrentTab('pricing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'pricing'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          <span>10. Construir Valores & Tarifas</span>
        </button>

        <button
          onClick={() => setCurrentTab('automations')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'automations'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <Workflow className="w-3.5 h-3.5 text-amber-500" />
          <span>11. Automatizaciones & Make</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
              currentTab === 'automations'
                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Make.com
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
            initialSubTab="events"
          />
        )}
        {currentTab === 'participants' && (
          <ProgramsAndEventsManager
            cronogramaEvents={rawEvents}
            programs={rawPrograms}
            eventRegistrations={rawRegistrations}
            onRefreshEvents={handleRefresh}
            onRefreshPrograms={handleRefresh}
            onRefreshRegistrations={handleRefresh}
            onOpenRegistrationPortal={onOpenRegistrationPortal}
            initialSubTab="participants"
          />
        )}
        {currentTab === 'courses' && <AdminCoursesManager onRefresh={handleRefresh} />}
        {currentTab === 'temarios' && <AdminTemariosManager onRefresh={handleRefresh} />}
        {currentTab === 'steps' && <AdminRoadmapStepsManager onRefresh={handleRefresh} />}
        {currentTab === 'questionnaires' && (
          <AdminQuestionnairesManager onRefresh={handleRefresh} />
        )}
        {currentTab === 'generator' && (
          <WorkshopsAndAcademicHub />
        )}
        {currentTab === 'triggers' && (
          <AutomatedTriggersManager />
        )}
        {currentTab === 'emails' && (
          <ClientEmailFollowupManager />
        )}
        {currentTab === 'pricing' && (
          <PricingAndValuesBuilder />
        )}
        {currentTab === 'automations' && (
          <AdminAutomationsManager onRefresh={handleRefresh} />
        )}
      </div>
    </div>
  );
};

