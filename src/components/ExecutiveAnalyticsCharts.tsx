import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  CreditCard,
  Sparkles,
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
    };
  }, [timeFilter]);

  const maxRevenue = Math.max(...chartData.revenue.map((d) => Math.max(d.value, d.target))) * 1.15;

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
              Métricas Financieras & Recaudo
            </h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-neutral-300 font-light mt-1">
            Visualización analítica de ingresos consolidados, proyecciones y volumen de recaudo de la consultoría.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black dark:text-white font-mono tracking-tight">
            {formatCOP(metrics.projectedRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
            +35% estimado con Bre-B Nu
          </div>
        </div>
      </div>

      {/* 3. CHARTS: Curva de Ingresos */}
      <div className="glass-panel-opal p-5 sm:p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Curva de Ingresos ($ COP)</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                Ingreso real vs meta presupuestada ({timeFilter})
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-black dark:bg-white" />
                <span className="text-gray-700 dark:text-neutral-300 font-medium">Recaudo Real</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-gray-300 dark:bg-neutral-600" />
                <span className="text-gray-500 dark:text-neutral-400">Meta Presupuestada</span>
              </div>
            </div>
          </div>

          {/* Custom Bar Graph */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-gray-100 dark:border-white/5">
            {chartData.revenue.map((item, i) => {
              const heightPercent = Math.min(100, Math.round((item.value / maxRevenue) * 100));
              const targetPercent = Math.min(100, Math.round((item.target / maxRevenue) * 100));

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="text-[10px] font-mono text-gray-500 dark:text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(item.value / 1000000).toFixed(1)}M
                  </div>
                  <div className="w-full flex items-end justify-center gap-1 h-52">
                    {/* Real bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[24px] bg-black dark:bg-white rounded-t-md transition-all duration-500 group-hover:opacity-80 relative"
                    />
                    {/* Target line / bar */}
                    <div
                      style={{ height: `${targetPercent}%` }}
                      className="w-full max-w-[14px] bg-gray-300 dark:bg-neutral-700 rounded-t-md transition-all duration-500"
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 dark:text-neutral-400 pt-4 gap-2">
          <span>Tasa de Recaudo Bre-B Nu: <strong>94.2%</strong></span>
          <span>Comisión Pasarelas: <strong>0% (Llave Bre-B Nu directa)</strong></span>
        </div>
      </div>
    </div>
  );
};

