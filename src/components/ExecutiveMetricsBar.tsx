import React from 'react';
import { User, Session, AIInsight, Prospect } from '../types';
import {
  Users,
  DollarSign,
  HeartPulse,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface ExecutiveMetricsBarProps {
  clients?: User[];
  prospects?: Prospect[];
  sessions?: Session[];
  allInsights?: AIInsight[];
  insights?: AIInsight[];
  onGoToClients?: () => void;
  onGoToCRM?: () => void;
  onGoToEvents?: () => void;
}

export const ExecutiveMetricsBar: React.FC<ExecutiveMetricsBarProps> = ({
  clients = [],
  prospects = [],
  sessions = [],
  allInsights,
  insights,
  onGoToClients,
  onGoToCRM,
  onGoToEvents,
}) => {
  const safeInsights = Array.isArray(allInsights)
    ? allInsights
    : Array.isArray(insights)
    ? insights
    : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeProspects = Array.isArray(prospects) ? prospects : [];

  // Counts by traffic light status
  const countActive = safeClients.filter((c) => (c.status || 'active') === 'active').length;
  const countWaiting = safeClients.filter((c) => c.status === 'waiting').length;
  const countInactive = safeClients.filter((c) => c.status === 'inactive').length;

  // Investment accumulated
  const totalInvestmentAccumulated = safeClients.reduce((acc, c) => {
    const cleanStr = (c.totalInvested || c.programFee || '0').replace(/[^0-9]/g, '');
    const num = parseInt(cleanStr, 10) || 0;
    return acc + num;
  }, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Somatic pulse flags
  const redAlerts = safeInsights.filter((i) => i?.pulseFlag === 'Red').length;
  const yellowAlerts = safeInsights.filter((i) => i?.pulseFlag === 'Yellow').length;
  const greenAlerts = safeInsights.filter((i) => i?.pulseFlag === 'Green').length;

  // Scheduled sessions in future
  const upcomingSessionsCount = safeSessions.filter((s) => s?.status === 'scheduled').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Clientes & Semáforo */}
      <div
        onClick={onGoToClients}
        className="glass-panel-opal rounded-3xl p-5 hover:border-black dark:hover:border-neutral-500 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
            Directorio Clientes
          </span>
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-600 dark:text-neutral-300 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-black dark:text-white">
              {clients.length}
            </span>
            <span className="text-xs text-gray-400 font-light">en el programa</span>
          </div>

          {/* Traffic Light Breakdown Pills */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-neutral-800/80 text-[11px]">
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{countActive} Activos</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{countWaiting} Espera</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-gray-500 dark:text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <span>{countInactive} Inactivos</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Inversión Acumulada */}
      <div
        onClick={onGoToClients}
        className="glass-panel-opal rounded-3xl p-5 hover:border-black dark:hover:border-neutral-500 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
            Inversión Acumulada
          </span>
          <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-black dark:text-white">
            {formatCurrency(totalInvestmentAccumulated)}
          </div>
          <div className="text-[11px] text-gray-400 font-light mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>Total invertido en el programa</span>
          </div>
        </div>
      </div>

      {/* 3. Semáforo Somático / Pulso Ontológico */}
      <div
        onClick={onGoToClients}
        className="glass-panel-opal rounded-3xl p-5 hover:border-black dark:hover:border-neutral-500 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
            Pulso Somático & IA
          </span>
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-600 dark:text-neutral-300">
            <HeartPulse className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-black dark:text-white">
              {safeInsights.length}
            </span>
            <span className="text-xs text-gray-400 font-light">diagnósticos IA</span>
          </div>

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-neutral-800/80 text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {greenAlerts} Estables
            </span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {yellowAlerts} Atención
            </span>
            {redAlerts > 0 && (
              <>
                <span>•</span>
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  {redAlerts} Quiebre Agudo
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. Sesiones y Agenda */}
      <div
        onClick={onGoToEvents}
        className="glass-panel-opal rounded-3xl p-5 hover:border-black dark:hover:border-neutral-500 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
            Sesiones & Calendario
          </span>
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-600 dark:text-neutral-300">
            <Calendar className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-black dark:text-white">
              {upcomingSessionsCount}
            </span>
            <span className="text-xs text-gray-400 font-light">agendadas</span>
          </div>
          <div className="text-[11px] text-gray-400 font-light mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
            <span>Google Meet sincronizado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
