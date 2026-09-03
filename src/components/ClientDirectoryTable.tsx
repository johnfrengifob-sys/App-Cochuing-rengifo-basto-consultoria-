import React, { useState, useMemo } from 'react';
import { User, ClientStatus, Session, AIInsight, FormSubmission } from '../types';
import { OntologicalStore } from '../services/store';
import { ClientTrafficStatusBadge } from './ClientTrafficStatusBadge';
import { PulseBadge } from './PulseBadge';
import {
  Search,
  Filter,
  DollarSign,
  Brain,
  ChevronRight,
  Plus,
  Calendar,
  Sparkles,
  Edit2,
  Check,
  X,
  LayoutGrid,
  ListFilter,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Clock,
  ArrowUpDown,
  FileText,
} from 'lucide-react';

interface ClientDirectoryTableProps {
  clients: User[];
  selectedClientId?: string;
  onSelectClient: (clientId: string) => void;
  onQuickSelect?: (clientId: string) => void;
  onUpdateStatus?: (clientId: string, status: ClientStatus) => void;
  onUpdateClientStatus?: (clientId: string, status: ClientStatus) => void;
  onUpdateBreakdown?: (clientId: string, breakdown: string) => void;
  onUpdateClientBreakdown?: (clientId: string, breakdown: string) => void;
  onUpdateInvested?: (clientId: string, invested: string) => void;
  onOpenNewSession?: (clientId: string) => void;
  onScheduleSessionForClient?: (client: User) => void;
  onGenerateAIForClient?: (client: User) => void;
  getInsightsForClient?: (clientId: string) => AIInsight[];
  getSessionsForClient?: (clientId: string) => Session[];
  getFormsForClient?: (clientId: string) => FormSubmission[];
}

export const ClientDirectoryTable: React.FC<ClientDirectoryTableProps> = ({
  clients = [],
  selectedClientId,
  onSelectClient,
  onQuickSelect,
  onUpdateStatus,
  onUpdateClientStatus,
  onUpdateBreakdown,
  onUpdateClientBreakdown,
  onUpdateInvested,
  onOpenNewSession,
  onScheduleSessionForClient,
  onGenerateAIForClient,
  getInsightsForClient,
  getSessionsForClient,
  getFormsForClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
  const [viewLayout, setViewLayout] = useState<'table' | 'cards'>('table');
  const [editingBreakdownId, setEditingBreakdownId] = useState<string | null>(null);
  const [tempBreakdownText, setTempBreakdownText] = useState('');

  const [editingInvestedId, setEditingInvestedId] = useState<string | null>(null);
  const [tempInvestedText, setTempInvestedText] = useState('');

  // Fallback insight and session fetchers
  const safeGetInsights = (uid: string): AIInsight[] => {
    if (getInsightsForClient) return getInsightsForClient(uid) || [];
    return OntologicalStore.getInsightsForClient(uid) || [];
  };

  const safeGetSessions = (uid: string): Session[] => {
    if (getSessionsForClient) return getSessionsForClient(uid) || [];
    return OntologicalStore.getSessionsForClient(uid) || [];
  };

  const safeUpdateStatus = (uid: string, status: ClientStatus) => {
    if (onUpdateStatus) onUpdateStatus(uid, status);
    else if (onUpdateClientStatus) onUpdateClientStatus(uid, status);
    else OntologicalStore.updateClientStatus(uid, status);
  };

  const safeUpdateBreakdown = (uid: string, breakdown: string) => {
    if (onUpdateBreakdown) onUpdateBreakdown(uid, breakdown);
    else if (onUpdateClientBreakdown) onUpdateClientBreakdown(uid, breakdown);
    else OntologicalStore.updateClientBreakdown(uid, breakdown);
  };

  const safeUpdateInvested = (uid: string, invested: string) => {
    if (onUpdateInvested) onUpdateInvested(uid, invested);
    else OntologicalStore.updateClientInvested(uid, invested);
  };

  // Quick preset quiebres for swift selection
  const commonBreakdownPresets = [
    'Gestión de la ira y reactividad impulsiva',
    'Trato y sanación con sus padres & lealtades',
    'Crisis de identidad directiva y propósito',
    'Autoexigencia y límites no dichos con jefes',
    'Miedo al juicio externo y soberanía',
    'Control obsesivo y delegación con angustia',
    'Duelo no procesado y resignación',
    'Falta de asertividad y complacencia crónica',
  ];

  const safeClients = Array.isArray(clients) ? clients : [];

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return safeClients.filter((client) => {
      if (!client) return false;
      const matchesStatus =
        statusFilter === 'all' || (client.status || 'active') === statusFilter;

      const q = searchTerm.toLowerCase().trim();
      if (!q) return matchesStatus;

      const matchesSearch =
        (client.name || '').toLowerCase().includes(q) ||
        (client.title || '').toLowerCase().includes(q) ||
        (client.email || '').toLowerCase().includes(q) ||
        (client.primaryBreakdown || '').toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [safeClients, searchTerm, statusFilter]);

  // Financial calculation: parse and sum invested amounts
  const totalInvestmentAccumulated = useMemo(() => {
    return safeClients.reduce((acc, c) => {
      if (!c) return acc;
      const cleanStr = (c.totalInvested || '0').replace(/[^0-9]/g, '');
      const num = parseInt(cleanStr, 10) || 0;
      return acc + num;
    }, 0);
  }, [safeClients]);

  const filteredInvestmentAccumulated = useMemo(() => {
    return filteredClients.reduce((acc, c) => {
      if (!c) return acc;
      const cleanStr = (c.totalInvested || '0').replace(/[^0-9]/g, '');
      const num = parseInt(cleanStr, 10) || 0;
      return acc + num;
    }, 0);
  }, [filteredClients]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Status breakdown counts
  const countActive = safeClients.filter((c) => (c?.status || 'active') === 'active').length;
  const countWaiting = safeClients.filter((c) => c?.status === 'waiting').length;
  const countInactive = safeClients.filter((c) => c?.status === 'inactive').length;

  const startEditingBreakdown = (client: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBreakdownId(client.uid);
    setTempBreakdownText(client.primaryBreakdown || '');
  };

  const saveBreakdown = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    safeUpdateBreakdown(clientId, tempBreakdownText);
    setEditingBreakdownId(null);
  };

  const cancelBreakdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBreakdownId(null);
  };

  const startEditingInvested = (client: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingInvestedId(client.uid);
    setTempInvestedText(client.totalInvested || client.programFee || '$1.500.000 COP');
  };

  const saveInvested = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    safeUpdateInvested(clientId, tempInvestedText);
    setEditingInvestedId(null);
  };

  const cancelInvested = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingInvestedId(null);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Controls: Search, Filters & View Switcher */}
      <div className="bg-white/70 dark:bg-[#151518]/70 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/75 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-gray-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, quiebre (ej: ira, padres), cargo o correo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-hidden focus:border-black dark:focus:border-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Traffic Light Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-200/70 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-2xs font-semibold'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200/60 dark:bg-neutral-700">
                {clients.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'active'
                  ? 'bg-emerald-500 text-white shadow-2xs font-semibold'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white shrink-0" />
              <span>Activos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-700/20 text-current font-bold">
                {countActive}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('waiting')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'waiting'
                  ? 'bg-amber-500 text-white shadow-2xs font-semibold'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-950/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white shrink-0" />
              <span>En Espera</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-700/20 text-current font-bold">
                {countWaiting}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'inactive'
                  ? 'bg-neutral-600 text-white shadow-2xs font-semibold'
                  : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
              <span>Inactivos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-neutral-700 text-current font-bold">
                {countInactive}
              </span>
            </button>
          </div>

          {/* Table vs Cards Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-200/70 dark:border-neutral-800 shrink-0">
            <button
              type="button"
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewLayout === 'table'
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-2xs'
                  : 'text-gray-400 hover:text-black dark:hover:text-white'
              }`}
              title="Vista de Tabla Ejecutiva (Recomendada para 20-30+ clientes)"
            >
              <ListFilter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('cards')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewLayout === 'cards'
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-2xs'
                  : 'text-gray-400 hover:text-black dark:hover:text-white'
              }`}
              title="Vista de Tarjetas Compactas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Filter Summary Bar with Total Capital Display */}
        <div className="pt-3 border-t border-gray-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400">
            <span className="font-medium text-black dark:text-white">
              Mostrando {filteredClients.length} de {clients.length} clientes
            </span>
            {searchTerm && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-black dark:text-white">
                Filtro: &ldquo;{searchTerm}&rdquo;
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-neutral-500">
              Inversión en progreso (Filtro):
            </span>
            <span className="text-xs font-mono font-bold text-black dark:text-white px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200/80 dark:border-neutral-700">
              {formatCurrency(filteredInvestmentAccumulated)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {filteredClients.length === 0 ? (
        <div className="bg-white/70 dark:bg-[#151518]/70 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/75 dark:border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-black dark:text-white">
            No se encontraron clientes con este filtro
          </h3>
          <p className="text-xs text-gray-400 font-light max-w-sm mx-auto">
            Prueba ajustando el término de búsqueda o cambiando el filtro de semáforo.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-medium cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : viewLayout === 'table' ? (
        /* ========================================================================= */
        /* EXECUTIVE DATA TABLE (Minimalist & High-Scan Density) */
        /* ========================================================================= */
        <div className="bg-white/70 dark:bg-[#151518]/70 backdrop-blur-xl rounded-3xl border border-white/75 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-900/50 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                  <th className="py-3.5 px-5">Cliente & Cargo</th>
                  <th className="py-3.5 px-4 text-center">Semáforo</th>
                  <th className="py-3.5 px-4">Inversión Total</th>
                  <th className="py-3.5 px-4">Quiebre Principal (Sintético IA)</th>
                  <th className="py-3.5 px-4 text-center">Progreso Nodo</th>
                  <th className="py-3.5 px-4 text-center">Pulso</th>
                  <th className="py-3.5 px-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
                {filteredClients.map((client) => {
                  const clientLatestInsight = safeGetInsights(client.uid)[0] || null;
                  const progress = client.programProgress || 1;
                  const isEditingThisBreakdown = editingBreakdownId === client.uid;
                  const isEditingThisInvested = editingInvestedId === client.uid;

                  return (
                    <tr
                      key={client.uid}
                      onClick={() => onSelectClient(client.uid)}
                      className={`hover:bg-gray-50/80 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group ${
                        selectedClientId === client.uid ? 'bg-gray-50/90 dark:bg-neutral-800/50' : ''
                      }`}
                    >
                      {/* 1. Cliente: Avatar + Nombre + Cargo + Email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={client.avatarUrl}
                            alt={client.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover shadow-2xs ring-1 ring-gray-200 dark:ring-neutral-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-black dark:text-white text-xs group-hover:underline flex items-center gap-1.5">
                              <span>{client.name}</span>
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                              {client.title || 'Cliente Programa'}
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-neutral-500 font-mono truncate">
                              {client.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Semáforo de Estado (Activo, En Espera, Inactivo) */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <ClientTrafficStatusBadge
                          status={client.status || 'active'}
                          onChangeStatus={(newStatus) => safeUpdateStatus(client.uid, newStatus)}
                          size="sm"
                        />
                      </td>

                      {/* 3. Inversión Acumulada */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        {isEditingThisInvested ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempInvestedText}
                              onChange={(e) => setTempInvestedText(e.target.value)}
                              className="w-28 px-2 py-1 rounded-lg border border-black dark:border-white bg-white dark:bg-neutral-900 text-xs font-mono"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={(e) => saveInvested(client.uid, e)}
                              className="p-1 rounded-md bg-black dark:bg-white text-white dark:text-black text-[10px]"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelInvested}
                              className="p-1 rounded-md bg-gray-200 dark:bg-neutral-700 text-[10px]"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-0.5 group/invested flex items-start justify-between">
                            <div>
                              <div className="font-mono font-bold text-xs text-black dark:text-white">
                                {client.totalInvested || client.programFee || '$1.500.000 COP'}
                              </div>
                              <div className="text-[10px] text-gray-400 dark:text-neutral-500 font-light flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>{client.paymentStatus || 'Completado'}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => startEditingInvested(client, e)}
                              className="opacity-0 group-hover/invested:opacity-100 p-0.5 text-gray-400 hover:text-black dark:hover:text-white"
                              title="Editar monto invertido"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 4. Quiebre Principal Sintético (Corto y sustancioso) */}
                      <td
                        className="py-4 px-4 max-w-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isEditingThisBreakdown ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={tempBreakdownText}
                              onChange={(e) => setTempBreakdownText(e.target.value)}
                              placeholder="Ej: Gestión de la ira, Trato con padres..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-black dark:border-white bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden"
                              autoFocus
                            />
                            {/* Preset pills for swift selection */}
                            <div className="flex flex-wrap gap-1">
                              {commonBreakdownPresets.slice(0, 4).map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setTempBreakdownText(preset)}
                                  className="text-[9px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                                >
                                  {preset.split(' ')[0]}...
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => saveBreakdown(client.uid, e)}
                                className="px-2 py-1 rounded-md bg-black dark:bg-white text-white dark:text-black text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>Guardar</span>
                              </button>
                              <button
                                type="button"
                                onClick={cancelBreakdown}
                                className="px-2 py-1 rounded-md bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-[10px] cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="group/breakdown flex items-start justify-between gap-2">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-neutral-900/90 border border-gray-200/70 dark:border-neutral-700/80 text-[11px] font-medium text-gray-800 dark:text-neutral-200 leading-snug">
                              <Brain className="w-3 h-3 text-black dark:text-white shrink-0 mt-0.5" />
                              <span>{client.primaryBreakdown || 'Fronteras y auto-observación directiva'}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => startEditingBreakdown(client, e)}
                              className="opacity-0 group-hover/breakdown:opacity-100 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-400 hover:text-black dark:hover:text-white transition-opacity"
                              title="Editar o afinar quiebre principal"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 5. Progreso en Nodo (1 a 6) */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="font-semibold text-xs text-black dark:text-white">
                            Nodo {progress}/6
                          </span>
                          {/* Mini Progress bar */}
                          <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                            <div
                              className="h-full bg-black dark:bg-white rounded-full transition-all"
                              style={{ width: `${(progress / 6) * 100}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-gray-400 font-light">
                            {Math.round((progress / 6) * 100)}% completado
                          </span>
                        </div>
                      </td>

                      {/* 6. Pulso Somático (IA) */}
                      <td className="py-4 px-4 text-center">
                        {clientLatestInsight ? (
                          <PulseBadge flag={clientLatestInsight.pulseFlag} size="sm" />
                        ) : (
                          <span className="text-[10px] text-gray-400 font-light">—</span>
                        )}
                      </td>

                      {/* 7. Acciones directas */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenNewSession) onOpenNewSession(client.uid);
                              else if (onScheduleSessionForClient) onScheduleSessionForClient(client);
                              else onSelectClient(client.uid);
                            }}
                            className="p-1.5 rounded-xl border border-gray-200/80 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300 transition-colors cursor-pointer"
                            title="Agendar sesión para este cliente"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onSelectClient(client.uid)}
                            className="px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-[11px] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap"
                          >
                            <span>Abrir Ficha</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* CARDS GRID VIEW */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const clientLatestInsight = safeGetInsights(client.uid)[0] || null;
            const progress = client.programProgress || 1;

            return (
              <div
                key={client.uid}
                onClick={() => onSelectClient(client.uid)}
                className="bg-white/70 dark:bg-[#151518]/70 backdrop-blur-xl rounded-3xl p-5 border border-white/75 dark:border-white/10 shadow-sm hover:border-black dark:hover:border-neutral-600 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Avatar, Name and Traffic Light Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={client.avatarUrl}
                        alt={client.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-gray-200 dark:ring-neutral-700 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-black dark:text-white text-sm group-hover:underline truncate">
                          {client.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                          {client.title || 'Cliente'}
                        </p>
                      </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <ClientTrafficStatusBadge
                        status={client.status || 'active'}
                        onChangeStatus={(newStatus) => safeUpdateStatus(client.uid, newStatus)}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Financial & Progress Metric Pill */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-neutral-500 block">
                        Inversión Acumulada
                      </span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        {client.totalInvested || client.programFee || '$1.500.000 COP'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-neutral-500 block">
                        Progreso Nodo
                      </span>
                      <span className="font-semibold text-black dark:text-white">
                        Nodo {progress}/6 ({Math.round((progress / 6) * 100)}%)
                      </span>
                    </div>
                  </div>

                  {/* Quiebre Principal Sintético */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                      <Brain className="w-3 h-3 text-black dark:text-white" />
                      Quiebre Principal Ontológico
                    </span>
                    <div className="p-3 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-gray-200/70 dark:border-neutral-700/80 text-xs text-gray-800 dark:text-neutral-200 font-light leading-relaxed">
                      &ldquo;{client.primaryBreakdown || 'Fronteras, auto-observación y claridad directiva'}&rdquo;
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  {clientLatestInsight ? (
                    <PulseBadge flag={clientLatestInsight.pulseFlag} size="sm" />
                  ) : (
                    <span className="text-[10px] text-gray-400">Sin pulso reciente</span>
                  )}

                  <div className="flex items-center gap-1 text-black dark:text-white font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                    <span>Ver Ficha 1 a 1</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
