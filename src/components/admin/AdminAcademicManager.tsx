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
} from 'lucide-react';
import { AdminCoursesManager } from './AdminCoursesManager';
import { AdminTemariosManager } from './AdminTemariosManager';
import { AdminRoadmapStepsManager } from './AdminRoadmapStepsManager';
import { AdminQuestionnairesManager } from './AdminQuestionnairesManager';
import { AdminAutomationsManager } from './AdminAutomationsManager';
import { OntologicalStore } from '../../services/store';

export type AcademicAdminSubTab =
  | 'courses'
  | 'temarios'
  | 'steps'
  | 'questionnaires'
  | 'automations';

interface AdminAcademicManagerProps {
  initialSubTab?: AcademicAdminSubTab | string;
}

export const AdminAcademicManager: React.FC<AdminAcademicManagerProps> = ({
  initialSubTab = 'courses',
}) => {
  const [currentTab, setCurrentTab] = useState<AcademicAdminSubTab>(
    (initialSubTab === 'meet_workshops' ? 'courses' : initialSubTab) as AcademicAdminSubTab
  );
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (initialSubTab) {
      setCurrentTab(
        (initialSubTab === 'meet_workshops' ? 'courses' : initialSubTab) as AcademicAdminSubTab
      );
    }
  }, [initialSubTab]);

  const programs = OntologicalStore.getPrograms();
  const nodes = OntologicalStore.getProgramNodes();
  const questionnaires = OntologicalStore.getQuestionnaires();

  const totalCapacity = programs.reduce((acc, p) => acc + (p.totalCapacity || 15), 0);
  const totalAvailable = programs.reduce(
    (acc, p) => acc + (p.availableSpots !== undefined ? p.availableSpots : p.totalCapacity || 15),
    0
  );
  const totalSteps = nodes.reduce((acc, n) => acc + (n.roadmapSteps || []).length, 0);
  const totalQuestions = questionnaires.reduce((acc, q) => acc + (q.questions || []).length, 0);

  const handleRefresh = () => {
    setVersion((v) => v + 1);
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
              <span>Espacio Administrador Académico</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Gestión Pedagógica, Programas, Temarios & Automatizaciones</span>
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 font-light max-w-2xl leading-relaxed">
              Panel unificado para administrar la oferta formativa, aforo y cupos, temarios y syllabus, pasos de taller, preguntas reflexivas de cuadernos y automatizaciones Make.com.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 block font-medium uppercase tracking-wider">
                Capacidad
              </span>
              <span className="text-lg font-black font-mono text-white">{totalCapacity}</span>
              <span className="text-[10px] text-emerald-300 block">{totalAvailable} libres</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 block font-medium uppercase tracking-wider">
                Programas
              </span>
              <span className="text-lg font-black font-mono text-white">{programs.length}</span>
              <span className="text-[10px] text-indigo-300 block">Activos</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 block font-medium uppercase tracking-wider">
                Nodos & Pasos
              </span>
              <span className="text-lg font-black font-mono text-white">{nodes.length}</span>
              <span className="text-[10px] text-emerald-300 block">{totalSteps} Pasos</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 block font-medium uppercase tracking-wider">
                Preguntas
              </span>
              <span className="text-lg font-black font-mono text-white">{totalQuestions}</span>
              <span className="text-[10px] text-neutral-300 block">En Cuadernos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Homogenized Appearance) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-100/90 dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setCurrentTab('courses')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'courses'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>1. Cursos & Programas</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
              currentTab === 'courses'
                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {programs.length}
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
          <span>2. Formularios de Temarios</span>
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
          <span>3. Pasos de Talleres</span>
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
          <span>4. Cuestionarios & Preguntas</span>
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
          onClick={() => setCurrentTab('automations')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
            currentTab === 'automations'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-neutral-800/70'
          }`}
        >
          <Workflow className="w-3.5 h-3.5 text-amber-500" />
          <span>5. Automatizaciones & Make</span>
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
        {currentTab === 'courses' && <AdminCoursesManager onRefresh={handleRefresh} />}
        {currentTab === 'temarios' && <AdminTemariosManager onRefresh={handleRefresh} />}
        {currentTab === 'steps' && <AdminRoadmapStepsManager onRefresh={handleRefresh} />}
        {currentTab === 'questionnaires' && (
          <AdminQuestionnairesManager onRefresh={handleRefresh} />
        )}
        {currentTab === 'automations' && (
          <AdminAutomationsManager onRefresh={handleRefresh} />
        )}
      </div>
    </div>
  );
};

