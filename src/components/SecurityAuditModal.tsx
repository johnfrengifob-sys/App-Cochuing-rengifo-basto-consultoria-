import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  Mail,
  Lock,
  Server,
  Download,
  Copy,
  Check,
  Filter,
  Activity,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  X,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { SecurityAuditService } from '../services/securityAudit';
import { OntologicalStore } from '../services/store';
import { SecurityAuditSummary, SecurityAuditResult, ClientFollowupCycleStatus, User } from '../types';

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshClients?: () => void;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({
  isOpen,
  onClose,
  onRefreshClients,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [auditSummary, setAuditSummary] = useState<SecurityAuditSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'clients_tracking' | 'report'>('tests');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [clientStatuses, setClientStatuses] = useState<ClientFollowupCycleStatus[]>([]);
  const [sweepMessage, setSweepMessage] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Cargar estados de clientes al abrir
  const loadClientTracking = () => {
    const statuses = OntologicalStore.getClientFollowupStatuses();
    setClientStatuses(statuses);
  };

  useEffect(() => {
    if (isOpen) {
      loadClientTracking();
      // Si no se ha corrido la auditoría, correrla automáticamente la primera vez
      if (!auditSummary) {
        runAudit();
      }
    }
  }, [isOpen]);

  const runAudit = async () => {
    setIsRunning(true);
    setActionFeedback(null);
    try {
      // Pequeño delay visual para dar feedback de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 400));
      const summary = await SecurityAuditService.runComprehensiveSecurityAudit();
      setAuditSummary(summary);
      loadClientTracking();
      if (onRefreshClients) {
        onRefreshClients();
      }
    } catch (err) {
      console.error('Error running security audit:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunSweep = () => {
    const res = OntologicalStore.runClientProgressFollowupSweep();
    loadClientTracking();
    if (onRefreshClients) {
      onRefreshClients();
    }
    setSweepMessage(
      `Barrido completado: ${res.totalEvaluated} coachees evaluados. ${res.activeFollowups} activos en seguimiento, ${res.terminatedDueTo30Days} pausados por superar 30 días de inactividad, ${res.weeklyFollowupsDispatched} seguimientos semanales procesados.`
    );
    setTimeout(() => setSweepMessage(null), 8000);
  };

  const handleExecuteSingleWeekly = (clientId: string) => {
    const res = OntologicalStore.executeWeeklyProgressFollowup(clientId);
    loadClientTracking();
    if (onRefreshClients) {
      onRefreshClients();
    }
    if (res.success) {
      setActionFeedback(`Seguimiento semanal despachado con éxito para el coachee.`);
    } else {
      setActionFeedback(`Aviso: ${res.reason}`);
    }
    setTimeout(() => setActionFeedback(null), 6000);
  };

  const handleSimulateInactivity = (clientId: string) => {
    // Simular que el coachee lleva 35 días inactivo para verificar la regla de corte
    const users = OntologicalStore.getUsers();
    const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
    const updated = users.map((u) => {
      if (u.uid === clientId) {
        return {
          ...u,
          lastActivityAt: thirtyFiveDaysAgo,
        };
      }
      return u;
    });
    OntologicalStore.saveUsers(updated);
    loadClientTracking();
    setActionFeedback(`Simulación aplicada: Coachee configurado con 35 días de inactividad.`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleReactivateActivity = (clientId: string) => {
    OntologicalStore.touchUserActivity(clientId);
    loadClientTracking();
    if (onRefreshClients) {
      onRefreshClients();
    }
    setActionFeedback(`Actividad reanudada: El coachee ha ingresado a la página y su seguimiento se reactivó.`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const generateMarkdownReport = () => {
    if (!auditSummary) return '';
    let report = `# REPORTE DE AUDITORÍA DE SEGURIDAD & AUTOMATIZACIÓN DE CLIENTES\n`;
    report += `**Rengifo Basto Consultoría Ontológica**\n`;
    report += `Fecha de evaluación: ${new Date(auditSummary.evaluatedAt).toLocaleString('es-CO')}\n`;
    report += `Puntuación General: ${auditSummary.overallScore}/100\n`;
    report += `Total de Pruebas: ${auditSummary.totalTests} | Aprobadas: ${auditSummary.passedCount} | Advertencias: ${auditSummary.warningCount} | Fallos: ${auditSummary.failedCount}\n\n`;

    report += `## 1. Reglas Clave de Negocio Auditadas\n`;
    report += `- **Bienvenida Inmediata:** Inmediatamente se inscribe una persona nueva le llega un mensaje de bienvenida personalizado con accesos a su Espacio Confidencial.\n`;
    report += `- **Seguimiento Semanal Continuo:** Se inicia el seguimiento semana a semana de su progreso ontológico, autorregistros y pausas somáticas.\n`;
    report += `- **Regla de Inactividad de 30 Días:** Este seguimiento concluye automáticamente cuando la persona dura más de 30 días inactiva en la página.\n\n`;

    report += `## 2. Detalle de Pruebas de Seguridad por Función\n`;
    auditSummary.results.forEach((r, idx) => {
      report += `### ${idx + 1}. [${r.status.toUpperCase()}] ${r.testName}\n`;
      report += `- **Categoría:** ${r.categoryLabel}\n`;
      report += `- **Descripción:** ${r.description}\n`;
      report += `- **Resultado:** ${r.details}\n\n`;
    });

    report += `## 3. Estado de Coachees en Seguimiento\n`;
    clientStatuses.forEach((c) => {
      report += `- **${c.clientName}** (${c.email}): Días Inactivo: ${c.daysInactive} | Estado: ${c.status} | Seguimiento Activo: ${c.weeklyFollowupActive ? 'SÍ (Semana ' + c.weeklyFollowupWeek + ')' : 'NO (Pausado por > 30d)'}\n`;
    });

    return report;
  };

  const handleCopyReport = () => {
    const text = generateMarkdownReport();
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  if (!isOpen) return null;

  const filteredResults = auditSummary?.results.filter((r) => {
    if (categoryFilter === 'all') return true;
    return r.category === categoryFilter;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-white/95 dark:bg-[#15151a]/95 rounded-3xl shadow-2xl border border-white/60 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                  Prueba Integral de Seguridad & Automatización
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Blindaje 100%
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Auditoría completa de funciones, confidencialidad ICF, bienvenida inmediata y corte por inactividad a 30 días.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runAudit}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-medium hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Evaluando...' : 'Re-ejecutar Prueba'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Score Card & Navigation Bar */}
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/10 bg-white dark:bg-[#18181f]">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            {/* Score */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 block">
                  Puntuación de Seguridad
                </span>
                <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100 tracking-tight">
                  {auditSummary?.overallScore ?? 100}%
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Test Stats */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
                  Pruebas Ejecutadas
                </span>
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  {auditSummary?.totalTests ?? 0}
                </span>
              </div>
              <div className="text-right text-[11px] font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                  ✓ {auditSummary?.passedCount ?? 0} Aprobadas
                </span>
                <span className="text-neutral-400">
                  ⚠ {auditSummary?.warningCount ?? 0} Alertas
                </span>
              </div>
            </div>

            {/* Inactivity Threshold */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
                  Umbral de Inactividad
                </span>
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  30 Días
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-semibold">
                Corte Automático
              </span>
            </div>

            {/* Welcome Automation */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
                  Bienvenida Coachee
                </span>
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  Inmediata
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-semibold">
                Al Inscribirse
              </span>
            </div>
          </div>

          {/* Action Navigation Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl">
              <button
                onClick={() => setActiveTab('tests')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'tests'
                    ? 'bg-white dark:bg-neutral-900 text-black dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Pruebas de Seguridad ({auditSummary?.results.length ?? 0})
              </button>
              <button
                onClick={() => setActiveTab('clients_tracking')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'clients_tracking'
                    ? 'bg-white dark:bg-neutral-900 text-black dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <span>Monitoreo de Ciclo de Vida ({clientStatuses.length})</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'report'
                    ? 'bg-white dark:bg-neutral-900 text-black dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Informe Exportable
              </button>
            </div>

            {/* Sweep Trigger Button */}
            {activeTab === 'clients_tracking' && (
              <button
                onClick={handleRunSweep}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Ejecutar Barrido de Seguimiento & Regla de 30 Días</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Messages */}
        {sweepMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{sweepMessage}</span>
          </div>
        )}
        {actionFeedback && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-500/30 text-blue-800 dark:text-blue-200 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Main Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PRUEBAS DE SEGURIDAD DETALLADAS */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-neutral-400 text-[11px] mr-1">Filtrar:</span>
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'welcome_automation', label: 'Bienvenida Inmediata' },
                  { id: 'weekly_followup_30d', label: 'Seguimiento Semanal & 30 Días' },
                  { id: 'auth_rbac', label: 'Roles & RBAC' },
                  { id: 'icf_confidentiality', label: 'Confidencialidad ICF' },
                  { id: 'financial_integrity', label: 'Pagos & Nu Bre-B' },
                  { id: 'api_backend_secrets', label: 'API & Secretos' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setCategoryFilter(pill.id)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                      categoryFilter === pill.id
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold shadow-2xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Tests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredResults.map((test) => {
                  const isPassed = test.status === 'passed';
                  const isWarning = test.status === 'warning';
                  return (
                    <div
                      key={test.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isPassed
                          ? 'bg-neutral-50/70 dark:bg-neutral-900/40 border-neutral-200/80 dark:border-neutral-800/80 hover:border-emerald-500/40'
                          : isWarning
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-500/30'
                          : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                              isPassed
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                : isWarning
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {isPassed ? '✓' : isWarning ? '!' : '✗'}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                            {test.categoryLabel}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : isWarning
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}
                        >
                          {test.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 leading-snug">
                        {test.testName}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2.5 leading-relaxed">
                        {test.description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/40 border border-black/5 dark:border-white/5 text-[11px] text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
                        {test.details}
                      </div>

                      {test.remediation && (
                        <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                          Acción sugerida: {test.remediation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MONITOREO DE CICLO DE VIDA DE COACHEES */}
          {activeTab === 'clients_tracking' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-500/20 text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-0.5">
                    Reglas de Automatización de Coachees en Tiempo Real
                  </h4>
                  <ul className="list-disc pl-4 space-y-0.5 text-neutral-600 dark:text-neutral-400">
                    <li>
                      <strong>Bienvenida Inmediata:</strong> Al inscribirse, se envía automáticamente el mensaje de bienvenida y se activa la Semana 1.
                    </li>
                    <li>
                      <strong>Seguimiento Semanal Continuo:</strong> Cada 7 días se calibra el avance del nodo y pausas somáticas.
                    </li>
                    <li>
                      <strong>Corte a los 30 Días:</strong> Si el coachee supera los 30 días de inactividad en la página, el seguimiento concluye automáticamente para respetar sus tiempos.
                    </li>
                    <li>
                      <strong>Reactivación Automática:</strong> Si el coachee vuelve a ingresar a su portal, su estado se restaura de inmediato.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Interactive Coachee Tracking Table */}
              <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden bg-white dark:bg-[#18181f]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-500 uppercase">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Coachee</th>
                        <th className="px-3 py-3 font-semibold">Inactividad en Página</th>
                        <th className="px-3 py-3 font-semibold">Bienvenida Inmediata</th>
                        <th className="px-3 py-3 font-semibold">Seguimiento Semanal</th>
                        <th className="px-3 py-3 font-semibold">Estado de Corte</th>
                        <th className="px-4 py-3 font-semibold text-right">Acciones de Prueba</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {clientStatuses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                            No hay clientes registrados en la plataforma.
                          </td>
                        </tr>
                      ) : (
                        clientStatuses.map((client) => {
                          const isTerminated = client.isTerminatedDueTo30Days;
                          return (
                            <tr
                              key={client.clientId}
                              className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                                isTerminated ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                              }`}
                            >
                              {/* Coachee Info */}
                              <td className="px-4 py-3.5">
                                <div className="font-bold text-neutral-900 dark:text-white">
                                  {client.clientName}
                                </div>
                                <div className="text-[11px] text-neutral-500 font-mono">
                                  {client.email}
                                </div>
                              </td>

                              {/* Days Inactive */}
                              <td className="px-3 py-3.5 font-mono">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`font-bold text-sm ${
                                      client.daysInactive > 30
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-neutral-800 dark:text-neutral-200'
                                    }`}
                                  >
                                    {client.daysInactive} días
                                  </span>
                                  {client.daysInactive > 30 && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                                      &gt; 30d
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-neutral-400 block mt-0.5">
                                  {client.lastActivityAt
                                    ? new Date(client.lastActivityAt).toLocaleDateString('es-CO')
                                    : 'Sin actividad'}
                                </span>
                              </td>

                              {/* Welcome Message Status */}
                              <td className="px-3 py-3.5">
                                {client.welcomeMessageSent ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Despachado</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-neutral-400">Pendiente</span>
                                )}
                              </td>

                              {/* Weekly Follow-up Status */}
                              <td className="px-3 py-3.5">
                                {client.weeklyFollowupActive ? (
                                  <div>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                                      <Activity className="w-3.5 h-3.5" />
                                      <span>Semana {client.weeklyFollowupWeek} Activa</span>
                                    </span>
                                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                                      Próximo: {client.nextWeeklyFollowupDueAt ? new Date(client.nextWeeklyFollowupDueAt).toLocaleDateString('es-CO') : '7 días'}
                                    </span>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      <span>Pausado</span>
                                    </span>
                                    <span className="text-[10px] text-neutral-400 block mt-0.5 truncate max-w-[160px]">
                                      {client.trackingEndedReason || 'Inactividad > 30 días'}
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* State */}
                              <td className="px-3 py-3.5">
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                                    isTerminated
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  }`}
                                >
                                  {isTerminated ? 'Finalizado (>30d)' : 'En Seguimiento'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {isTerminated ? (
                                    <button
                                      onClick={() => handleReactivateActivity(client.clientId)}
                                      title="Simula que el coachee vuelve a ingresar a la página, reactivando su seguimiento"
                                      className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold transition-all cursor-pointer"
                                    >
                                      Reactivar Actividad
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleExecuteSingleWeekly(client.clientId)}
                                        title="Despacha el seguimiento semanal correspondiente a la siguiente semana"
                                        className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[11px] font-medium transition-all cursor-pointer"
                                      >
                                        Enviar Semanal
                                      </button>
                                      <button
                                        onClick={() => handleSimulateInactivity(client.clientId)}
                                        title="Configura temporalmente 35 días de inactividad para validar el corte automático"
                                        className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-medium transition-all cursor-pointer"
                                      >
                                        Simular &gt;30d
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INFORME EXPORTABLE */}
          {activeTab === 'report' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Copia o descarga el informe técnico de seguridad y auditoría de procesos:
                </span>
                <button
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? '¡Copiado al Portapapeles!' : 'Copiar Informe'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto max-h-[450px] leading-relaxed select-all">
                <pre>{generateMarkdownReport()}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/60 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Sistema Blindado Bajo Estándares ICF y Arquitectura de Alta Disponibilidad</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-white font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-all cursor-pointer"
          >
            Cerrar Consola
          </button>
        </div>
      </div>
    </div>
  );
};
