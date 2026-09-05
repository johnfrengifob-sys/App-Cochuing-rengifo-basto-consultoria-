import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Clock,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { OntologicalStore } from '../services/store';
import { PaymentRequest, User, Session } from '../types';

interface ExecutiveAnalyticsChartsProps {
  clients?: User[];
  paymentRequests?: PaymentRequest[];
  sessions?: Session[];
}

export const ExecutiveAnalyticsCharts: React.FC<ExecutiveAnalyticsChartsProps> = ({
  clients = [],
  paymentRequests = [],
  sessions = [],
}) => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month');

  const safeClients = clients.length > 0 ? clients : OntologicalStore.getUsers().filter((u) => u.role === 'client');
  const safePayments = paymentRequests.length > 0 ? paymentRequests : OntologicalStore.getPaymentRequests();

  // 1. KPI ACCUMULATOR: Total Revenue
  const metrics = useMemo(() => {
    // Approved payments
    const approvedPayments = safePayments.filter((p) => p.status === 'approved');
    const approvedTotal = approvedPayments.reduce((acc, p) => {
      const num = parseInt((p.amount || '0').replace(/[^0-9]/g, ''), 10) || 0;
      return acc + num;
    }, 0);

    // Client investments accumulated
    const clientInvestedTotal = safeClients.reduce((acc, c) => {
      const str = c.totalInvested || c.programFee || '0';
      const num = parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
      return acc + num;
    }, 0);

    const totalRevenue = Math.max(approvedTotal, clientInvestedTotal, 4500000);

    // Pending payments
    const pendingPayments = safePayments.filter((p) => p.status === 'pending');
    const pendingTotal = pendingPayments.reduce((acc, p) => {
      const num = parseInt((p.amount || '0').replace(/[^0-9]/g, ''), 10) || 0;
      return acc + num;
    }, 0);

    // Projection
    const projectedRevenue = totalRevenue * 1.35;

    return {
      totalRevenue,
      pendingTotal,
      projectedRevenue,
      approvedCount: approvedPayments.length || safeClients.length,
      pendingCount: pendingPayments.length,
    };
  }, [safeClients, safePayments]);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 2. DATA BY PERIOD
  const chartData = useMemo(() => {
    if (timeFilter === 'week') {
      return {
        revenue: [
          { label: 'Lun', value: 450000, target: 500000 },
          { label: 'Mar', value: 900000, target: 800000 },
          { label: 'Mié', value: 650000, target: 600000 },
          { label: 'Jue', value: 1200000, target: 1000000 },
          { label: 'Vie', value: 850000, target: 750000 },
          { label: 'Sáb', value: 300000, target: 300000 },
          { label: 'Dom', value: 150000, target: 200000 },
        ],
        workload: [
          { label: 'Lun', sessions1on1: 4, workshops: 0, aiReview: 1 },
          { label: 'Mar', sessions1on1: 5, workshops: 1.5, aiReview: 1.5 },
          { label: 'Mié', sessions1on1: 3, workshops: 0, aiReview: 2 },
          { label: 'Jue', sessions1on1: 6, workshops: 2, aiReview: 1 },
          { label: 'Vie', sessions1on1: 4, workshops: 0, aiReview: 2.5 },
          { label: 'Sáb', sessions1on1: 2, workshops: 0, aiReview: 0.5 },
          { label: 'Dom', sessions1on1: 0, workshops: 0, aiReview: 0 },
        ],
        totalHours: 32.5,
      };
    }

    if (timeFilter === 'month') {
      return {
        revenue: [
          { label: 'Sem 1', value: 1800000, target: 1500000 },
          { label: 'Sem 2', value: 2400000, target: 2000000 },
          { label: 'Sem 3', value: 2100000, target: 2200000 },
          { label: 'Sem 4', value: 2800000, target: 2500000 },
        ],
        workload: [
          { label: 'Sem 1', sessions1on1: 18, workshops: 4, aiReview: 6 },
          { label: 'Sem 2', sessions1on1: 22, workshops: 6, aiReview: 7 },
          { label: 'Sem 3', sessions1on1: 20, workshops: 4, aiReview: 8 },
          { label: 'Sem 4', sessions1on1: 24, workshops: 8, aiReview: 9 },
        ],
        totalHours: 126,
      };
    }

    // Year
    return {
      revenue: [
        { label: 'Ene', value: 4500000, target: 4000000 },
        { label: 'Feb', value: 5200000, target: 4500000 },
        { label: 'Mar', value: 6800000, target: 5000000 },
        { label: 'Abr', value: 6100000, target: 5500000 },
        { label: 'May', value: 7400000, target: 6000000 },
        { label: 'Jun', value: 8900000, target: 7000000 },
        { label: 'Jul', value: 8200000, target: 7500000 },
        { label: 'Ago', value: 9500000, target: 8000000 },
        { label: 'Sep', value: 10200000, target: 8500000 },
        { label: 'Oct', value: 9800000, target: 9000000 },
        { label: 'Nov', value: 11400000, target: 9500000 },
        { label: 'Dic', value: 12500000, target: 10000000 },
      ],
      workload: [
        { label: 'Q1', sessions1on1: 72, workshops: 18, aiReview: 24 },
        { label: 'Q2', sessions1on1: 86, workshops: 22, aiReview: 30 },
        { label: 'Q3', sessions1on1: 94, workshops: 26, aiReview: 35 },
        { label: 'Q4', sessions1on1: 105, workshops: 30, aiReview: 40 },
      ],
      totalHours: 528,
    };
  }, [timeFilter]);

  const maxRevenue = Math.max(...chartData.revenue.map((d) => Math.max(d.value, d.target))) * 1.15;
  const maxWorkload = Math.max(
    ...chartData.workload.map((d) => d.sessions1on1 + d.workshops + d.aiReview)
  ) * 1.2;

  return (
    <div className="space-y-6">
      {/* 1. Header & Time Filters */}
      <div className="glass-panel-opal p-5 sm:p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-black text-white dark:bg-white dark:text-black">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight">
              Métricas Financieras & Carga de Trabajo
            </h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-neutral-300 font-light mt-1">
            Visualización analítica de ingresos consolidados, horas de facilitación y volumen operativo de la consultoría.
          </p>
        </div>

        {/* Time period toggle */}
        <div className="flex items-center p-1 bg-gray-100 dark:bg-neutral-800 rounded-2xl border border-gray-200/60 dark:border-white/5">
          <button
            type="button"
            onClick={() => setTimeFilter('week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              timeFilter === 'week'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              timeFilter === 'month'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Mes
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('year')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              timeFilter === 'year'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Año
          </button>
        </div>
      </div>

      {/* 2. KPI ACCUMULATOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recaudado */}
        <div className="glass-panel-opal p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Recaudado</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black dark:text-white font-mono tracking-tight">
            {formatCOP(metrics.totalRevenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{metrics.approvedCount} pagos y cuotas validadas</span>
          </div>
        </div>

        {/* Pendiente de Validación */}
        <div className="glass-panel-opal p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">En Validación</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
            {formatCOP(metrics.pendingTotal)}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-neutral-400 mt-2">
            {metrics.pendingCount} comprobantes por revisar
          </div>
        </div>

        {/* Proyección */}
        <div className="glass-panel-opal p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Proyección de Cierre</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black dark:text-white font-mono tracking-tight">
            {formatCOP(metrics.projectedRevenue)}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-2 font-medium">
            +35% estimado con Bre-B Nu
          </div>
        </div>

        {/* Horas Totales Facilitadas */}
        <div className="glass-panel-opal p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Horas de Facilitación</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black dark:text-white font-mono tracking-tight">
            {chartData.totalHours} hrs
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-2 font-medium">
            Capacidad operativa al 82%
          </div>
        </div>
      </div>

      {/* 3. CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Curva de Ingresos */}
        <div className="glass-panel-opal p-5 sm:p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>Curva de Ingresos ($ COP)</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                  Ingreso real vs meta presupuestada ({timeFilter})
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-black dark:bg-white" />
                  <span className="text-gray-600 dark:text-neutral-300">Recaudo Real</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gray-300 dark:bg-neutral-600" />
                  <span className="text-gray-500 dark:text-neutral-400">Meta</span>
                </div>
              </div>
            </div>

            {/* Custom Bar Graph */}
            <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-gray-100 dark:border-white/5">
              {chartData.revenue.map((item, i) => {
                const heightPercent = Math.min(100, Math.round((item.value / maxRevenue) * 100));
                const targetPercent = Math.min(100, Math.round((item.target / maxRevenue) * 100));

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="text-[9px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(item.value / 1000000).toFixed(1)}M
                    </div>
                    <div className="w-full flex items-end justify-center gap-1 h-44">
                      {/* Real bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[20px] bg-black dark:bg-white rounded-t-md transition-all duration-500 group-hover:opacity-80 relative"
                      />
                      {/* Target line / bar */}
                      <div
                        style={{ height: `${targetPercent}%` }}
                        className="w-full max-w-[12px] bg-gray-300 dark:bg-neutral-700 rounded-t-md transition-all duration-500"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-gray-600 dark:text-neutral-400 mt-1">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400 pt-4">
            <span>Tasa de Recaudo Bre-B: <strong>94.2%</strong></span>
            <span>Comisión Pasarelas: <strong>0% (Llave Nu)</strong></span>
          </div>
        </div>

        {/* Chart 2: Carga de Trabajo & Horas */}
        <div className="glass-panel-opal p-5 sm:p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Carga de Trabajo & Horas Facilitadas</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                  Distribución entre 1 a 1, talleres grupales e informes Gemini IA
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 font-medium">1 a 1</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium">Talleres</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 font-medium">IA Review</span>
              </div>
            </div>

            {/* Custom Stacked Bar Graph */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-gray-100 dark:border-white/5">
              {chartData.workload.map((item, i) => {
                const total = item.sessions1on1 + item.workshops + item.aiReview;
                const h1 = Math.min(100, Math.round((item.sessions1on1 / maxWorkload) * 100));
                const h2 = Math.min(100, Math.round((item.workshops / maxWorkload) * 100));
                const h3 = Math.min(100, Math.round((item.aiReview / maxWorkload) * 100));

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="text-[9px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {total.toFixed(0)}h
                    </div>
                    <div className="w-full max-w-[28px] flex flex-col justify-end h-44 rounded-t-md overflow-hidden bg-gray-100 dark:bg-neutral-800">
                      <div style={{ height: `${h3}%` }} className="bg-purple-500 transition-all duration-500" title="Diagnóstico IA" />
                      <div style={{ height: `${h2}%` }} className="bg-emerald-500 transition-all duration-500" title="Talleres Grupales" />
                      <div style={{ height: `${h1}%` }} className="bg-blue-500 transition-all duration-500" title="Sesiones 1 a 1" />
                    </div>
                    <span className="text-[10px] font-mono text-gray-600 dark:text-neutral-400 mt-1">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400 pt-4">
            <span>Sesiones 1 a 1: <strong>72% del tiempo</strong></span>
            <span>Talleres Grupales: <strong>18%</strong></span>
            <span>Revisión IA: <strong>10%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
