import React, { useState } from 'react';
import {
  GraduationCap,
  FileText,
  ListOrdered,
  HelpCircle,
  DollarSign,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { AdminCoursesManager } from './AdminCoursesManager';
import { AdminTemariosManager } from './AdminTemariosManager';
import { AdminRoadmapStepsManager } from './AdminRoadmapStepsManager';
import { AdminQuestionnairesManager } from './AdminQuestionnairesManager';
import { PricingAndValuesBuilder } from '../PricingAndValuesBuilder';
import { OntologicalStore } from '../../services/store';

export type CurriculumSubModule =
  | 'courses'
  | 'temarios'
  | 'steps'
  | 'questionnaires'
  | 'pricing';

interface AdminCurriculumAndProgramsHubProps {
  initialSubModule?: CurriculumSubModule;
  onRefresh?: () => void;
}

export const AdminCurriculumAndProgramsHub: React.FC<AdminCurriculumAndProgramsHubProps> = ({
  initialSubModule = 'courses',
  onRefresh,
}) => {
  const [activeSubModule, setActiveSubModule] = useState<CurriculumSubModule>(initialSubModule);

  const programs = OntologicalStore.getPrograms();
  const nodes = OntologicalStore.getProgramNodes();
  const questionnaires = OntologicalStore.getQuestionnaires();
  const totalSteps = nodes.reduce((acc, n) => acc + (n.roadmapSteps || []).length, 0);
  const totalQuestions = questionnaires.reduce((acc, q) => acc + (q.questions || []).length, 0);

  const handleChildRefresh = () => {
    if (onRefresh) onRefresh();
  };

  const navItems: {
    id: CurriculumSubModule;
    label: string;
    description: string;
    icon: React.ElementType;
    badge: string | number;
    color: string;
  }[] = [
    {
      id: 'courses',
      label: 'Cursos',
      description: 'Oferta y capacidad',
      icon: GraduationCap,
      badge: programs.length,
      color: 'text-indigo-500 dark:text-indigo-400',
    },
    {
      id: 'temarios',
      label: 'Temarios',
      description: 'Estructura por nodos',
      icon: FileText,
      badge: `${nodes.length} Nodos`,
      color: 'text-sky-500 dark:text-sky-400',
    },
    {
      id: 'steps',
      label: 'Pasos de Taller',
      description: 'Hoja de ruta vivencial',
      icon: ListOrdered,
      badge: `${totalSteps} Pasos`,
      color: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      id: 'questionnaires',
      label: 'Cuestionarios',
      description: 'Diagnósticos y autoevaluación',
      icon: HelpCircle,
      badge: `${totalQuestions} Pregs`,
      color: 'text-amber-500 dark:text-amber-400',
    },
    {
      id: 'pricing',
      label: 'Tarifas',
      description: 'Matriz de precios & inversión',
      icon: DollarSign,
      badge: 'Tarifas RBC',
      color: 'text-rose-500 dark:text-rose-400',
    },
  ];

  return (
    <div className="space-y-6 w-full animate-fade-in text-left">
      {/* Module Overview Banner */}
      <div className="p-5 sm:p-6 rounded-3xl glass-panel-opal border border-gray-200/80 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Catálogo Académico</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-black dark:text-white tracking-tight">
            Cursos, Temarios & Tarifas
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-light max-w-3xl">
            Centro integral de diseño pedagógico ontológico. Configura la oferta de programas, temarios modulares, pasos de ruta, instrumentos de indagación y la política de inversión económica.
          </p>
        </div>

        {/* Quick totals badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-700 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase font-semibold block">
              Dimensiones
            </span>
            <span className="text-sm font-black font-mono text-black dark:text-white">
              5 en 1
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Sub-Navigation Switcher */}
      <div className="p-1.5 rounded-2xl bg-neutral-100/90 dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubModule === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSubModule(item.id)}
              className={`p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer text-left flex flex-col justify-between gap-2 ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold ring-1 ring-black/10 dark:ring-white/20'
                  : 'bg-white/60 dark:bg-[#202024]/60 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-[#26262B] border border-transparent hover:border-gray-200 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isActive
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-neutral-800 ' + item.color
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium truncate ${
                    isActive
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                  }`}
                >
                  {item.badge}
                </span>
              </div>

              <div className="min-w-0">
                <span className="text-xs font-bold block truncate leading-tight">
                  {item.label}
                </span>
                <span
                  className={`text-[10px] block truncate font-light mt-0.5 leading-tight ${
                    isActive
                      ? 'text-white/80 dark:text-black/70'
                      : 'text-gray-400 dark:text-neutral-500'
                  }`}
                >
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Sub-Module View */}
      <div className="pt-2">
        {activeSubModule === 'courses' && (
          <AdminCoursesManager onRefresh={handleChildRefresh} />
        )}
        {activeSubModule === 'temarios' && (
          <AdminTemariosManager onRefresh={handleChildRefresh} />
        )}
        {activeSubModule === 'steps' && (
          <AdminRoadmapStepsManager onRefresh={handleChildRefresh} />
        )}
        {activeSubModule === 'questionnaires' && (
          <AdminQuestionnairesManager onRefresh={handleChildRefresh} />
        )}
        {activeSubModule === 'pricing' && (
          <PricingAndValuesBuilder />
        )}
      </div>
    </div>
  );
};
