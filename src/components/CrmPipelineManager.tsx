import React, { useState, useMemo } from 'react';
import { Prospect, ProspectStatus, PaymentStatus, User, EventRegistration, ClientStatus } from '../types';
import { OntologicalStore } from '../services/store';
import { safeCopyToClipboard } from '../utils/clipboard';
import { getEmailAvatarUrl } from '../utils/avatar';
import { ClientTrafficStatusBadge } from './ClientTrafficStatusBadge';
import {
  Kanban,
  Search,
  Plus,
  Phone,
  Calendar,
  UserCheck,
  ArrowRight,
  Workflow,
  Sparkles,
  Copy,
  CheckCheck,
  ExternalLink,
  Ticket,
  Clock,
  Filter,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  Layers,
  TrendingUp,
  UserPlus,
  Users,
  DollarSign,
  Mail,
  Building,
  Briefcase,
  ChevronRight,
  BookOpen,
  Check,
  X,
} from 'lucide-react';

interface CrmPipelineManagerProps {
  prospects: Prospect[];
  clients: User[];
  eventRegistrations: EventRegistration[];
  onRefreshProspects: () => void;
  onRefreshClients: () => void;
  onSelectClientAndOpenWorkstation?: (clientId: string) => void;
  onOpenMakeModal: () => void;
  onOpenRegistrationPortal?: () => void;
  onUpdateClientStatus?: (clientId: string, status: ClientStatus) => void;
  onDeleteClient?: (clientId: string) => void;
  embedded?: boolean;
}

export const CrmPipelineManager: React.FC<CrmPipelineManagerProps> = ({
  prospects = [],
  clients = [],
  eventRegistrations = [],
  onRefreshProspects,
  onRefreshClients,
  onSelectClientAndOpenWorkstation,
  onOpenMakeModal,
  onOpenRegistrationPortal,
  onUpdateClientStatus,
  onDeleteClient,
  embedded = false,
}) => {
  const safeProspects = Array.isArray(prospects) ? prospects : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeRegistrations = Array.isArray(eventRegistrations) ? eventRegistrations : [];

  const [viewLayout, setViewLayout] = useState<'kanban' | 'clients'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOriginFilter, setSelectedOriginFilter] = useState<string>('all');
  const [copiedCalendarLink, setCopiedCalendarLink] = useState(false);

  // Client Directory Filter inside CRM
  const [clientStatusFilter, setClientStatusFilter] = useState<'all' | ClientStatus>('all');

  // New Client Modal
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientTitle, setNewClientTitle] = useState('Cliente Directivo');
  const [newClientProgram, setNewClientProgram] = useState('Certeza, Fronteras & Dirección Personal');
  const [newClientFee, setNewClientFee] = useState('$1.500.000 COP');
  const [newClientBreakdown, setNewClientBreakdown] = useState('Fronteras, auto-observación y claridad directiva');
  const [newClientStatus, setNewClientStatus] = useState<ClientStatus>('active');

  // New Prospect Modal
  const [showAddProspectModal, setShowAddProspectModal] = useState(false);
  const [prospectName, setProspectName] = useState('');
  const [prospectPhone, setProspectPhone] = useState('');
  const [prospectEmail, setProspectEmail] = useState('');
  const [prospectNotes, setProspectNotes] = useState('');
  const [prospectStatus, setProspectStatus] = useState<ProspectStatus>('matriz_enviada');

  // Conversion Modal
  const [convertingProspect, setConvertingProspect] = useState<Prospect | null>(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>('Completado');

  // Date picker modal for session 20 min
  const [schedulingProspect, setSchedulingProspect] = useState<Prospect | null>(null);
  const [scheduleDateTime, setScheduleDateTime] = useState('');

  // Editing notes
  const [editingProspectNotes, setEditingProspectNotes] = useState<{ id: string; notes: string } | null>(null);

  // Filter prospects
  const filteredProspects = useMemo(() => {
    return safeProspects.filter((p) => {
      if (!p) return false;
      const matchesSearch =
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.whatsapp || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesOrigin =
        selectedOriginFilter === 'all' || p.origin === selectedOriginFilter;

      return matchesSearch && matchesOrigin;
    });
  }, [safeProspects, searchQuery, selectedOriginFilter]);

  // Filter clients inside the CRM
  const filteredClients = useMemo(() => {
    return safeClients.filter((client) => {
      if (!client) return false;
      const matchesStatus =
        clientStatusFilter === 'all' || (client.status || 'active') === clientStatusFilter;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesStatus;

      const matchesSearch =
        (client.name || '').toLowerCase().includes(q) ||
        (client.title || '').toLowerCase().includes(q) ||
        (client.email || '').toLowerCase().includes(q) ||
        (client.primaryBreakdown || '').toLowerCase().includes(q) ||
        (client.phone || '').toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [safeClients, searchQuery, clientStatusFilter]);

  const countActiveClients = safeClients.filter((c) => (c?.status || 'active') === 'active').length;
  const countWaitingClients = safeClients.filter((c) => c?.status === 'waiting').length;
  const countInactiveClients = safeClients.filter((c) => c?.status === 'inactive').length;

  const totalClientsInvested = useMemo(() => {
    return safeClients.reduce((acc, c) => {
      if (!c) return acc;
      const cleanStr = (c.totalInvested || c.programFee || '0').replace(/[^0-9]/g, '');
      const num = parseInt(cleanStr, 10) || 0;
      return acc + num;
    }, 0);
  }, [safeClients]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleUpdateClientStatusLocal = (clientId: string, newStatus: ClientStatus) => {
    if (onUpdateClientStatus) {
      onUpdateClientStatus(clientId, newStatus);
    } else {
      OntologicalStore.updateClientStatus(clientId, newStatus);
    }
    onRefreshClients();
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) return;

    const newClientObj: User = {
      uid: 'client-' + Date.now(),
      email: newClientEmail.trim().toLowerCase(),
      name: newClientName.trim(),
      role: 'client',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256`,
      title: newClientTitle.trim() || 'Cliente Directivo',
      status: newClientStatus,
      phone: newClientPhone.trim() || undefined,
      programProgress: 1,
      programFee: newClientFee,
      totalInvested: newClientFee,
      primaryBreakdown: newClientBreakdown.trim(),
      joinedAt: new Date().toISOString().split('T')[0],
    };

    const currentUsers = OntologicalStore.getUsers();
    OntologicalStore.saveUsers([...currentUsers, newClientObj]);
    onRefreshClients();
    setShowAddClientModal(false);

    // Reset form
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');

    // Directly open their individual workstation in the CRM flow
    if (onSelectClientAndOpenWorkstation) {
      onSelectClientAndOpenWorkstation(newClientObj.uid);
    }
  };

  // Stage Grouping
  const groupMatriz = filteredProspects.filter((p) => p && p.status === 'matriz_enviada');
  const groupSesion20 = filteredProspects.filter((p) => p && p.status === 'sesion_20min_agendada');
  const groupConvertidos = filteredProspects.filter((p) => p && p.status === 'convertido');
  const groupDescartados = filteredProspects.filter((p) => p && p.status === 'descartado');

  const totalCount = safeProspects.length;
  const conversionRate =
    totalCount > 0
      ? Math.round(
          (safeProspects.filter((p) => p && p.status === 'convertido').length / totalCount) * 100
        )
      : 0;

  const handleStatusChange = (prospectId: string, newStatus: ProspectStatus) => {
    if (newStatus === 'sesion_20min_agendada') {
      const p = prospects.find((item) => item.id === prospectId);
      if (p) {
        setSchedulingProspect(p);
        setScheduleDateTime(
          p.session20minDate
            ? p.session20minDate.substring(0, 16)
            : new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().substring(0, 16)
        );
        return;
      }
    }
    if (newStatus === 'convertido') {
      const p = prospects.find((item) => item.id === prospectId);
      if (p) {
        setConvertingProspect(p);
        return;
      }
    }

    OntologicalStore.updateProspectStatus(prospectId, newStatus);
    onRefreshProspects();
  };

  const handleSaveScheduledSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingProspect || !scheduleDateTime) return;

    OntologicalStore.updateProspectStatus(
      schedulingProspect.id,
      'sesion_20min_agendada',
      new Date(scheduleDateTime).toISOString()
    );
    setSchedulingProspect(null);
    setScheduleDateTime('');
    onRefreshProspects();
  };

  const handleSaveNotes = (id: string) => {
    if (!editingProspectNotes) return;
    const currentList = OntologicalStore.getProspects();
    const updated = currentList.map((p) =>
      p.id === id ? { ...p, notes: editingProspectNotes.notes.trim() } : p
    );
    OntologicalStore.saveProspects(updated);
    setEditingProspectNotes(null);
    onRefreshProspects();
  };

  const handleDeleteProspect = (id: string, name: string) => {
    if (window.confirm(`¿Deseas eliminar a "${name}" del pipeline comercial?`)) {
      const currentList = OntologicalStore.getProspects();
      const updated = currentList.filter((p) => p.id !== id);
      OntologicalStore.saveProspects(updated);
      onRefreshProspects();
    }
  };

  const handleAddProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectName.trim() || !prospectPhone.trim()) return;

    OntologicalStore.addProspect({
      name: prospectName.trim(),
      whatsapp: prospectPhone.trim(),
      email: prospectEmail.trim() || undefined,
      notes: prospectNotes.trim() || 'Participante registrado en pipeline comercial.',
      status: prospectStatus,
      origin: 'Conversatorio Raíz y Balance',
      matrixSentAt: new Date().toISOString(),
    });

    setProspectName('');
    setProspectPhone('');
    setProspectEmail('');
    setProspectNotes('');
    setProspectStatus('matriz_enviada');
    setShowAddProspectModal(false);
    onRefreshProspects();
  };

  const handleConfirmConversion = () => {
    if (!convertingProspect) return;
    const newClient = OntologicalStore.convertProspectToClient(
      convertingProspect.id,
      selectedPaymentStatus
    );

    if (newClient) {
      setConvertingProspect(null);
      onRefreshProspects();
      onRefreshClients();
      if (onSelectClientAndOpenWorkstation) {
        onSelectClientAndOpenWorkstation(newClient.uid);
      }
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'No registrado';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const getStatusBadge = (status: ProspectStatus) => {
    switch (status) {
      case 'matriz_enviada':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium border border-blue-200/60 dark:border-blue-900/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            1. Matriz Enviada
          </span>
        );
      case 'sesion_20min_agendada':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium border border-amber-200/60 dark:border-amber-900/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            2. Sesión 20m Agendada
          </span>
        );
      case 'convertido':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200/60 dark:border-emerald-900/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            3. Convertido 1 a 1
          </span>
        );
      case 'descartado':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 font-medium border border-gray-200 dark:border-neutral-700">
            <XCircle className="w-3 h-3 text-gray-400" />
            Descartado
          </span>
        );
    }
  };

  return (
    <div className={embedded ? "w-full flex-1 flex flex-col space-y-6" : "p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-6"}>
      {/* 1. Header with Compact Summary Metrics (Solo visible en vista independiente) */}
      {!embedded && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-gray-100 dark:border-neutral-800 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-light text-black dark:text-white tracking-tight">
              CRM & Clientes: <strong className="font-semibold">Pipeline y Directorio</strong>
            </h2>
            <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-0.5 max-w-2xl">
              Embudo comercial ontológico, prospección de talleres y directorio interactivo integrado de clientes activos e inactivos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenMakeModal}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1A1A1E] hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Workflow className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>Make.com & Webhooks</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddProspectModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2]" />
              <span>+ Nuevo Prospecto</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Grouped Summary KPI Metric Pills (Compact & Clean) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl glass-panel-opal flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-neutral-500 block">
              Total Prospectos
            </span>
            <span className="text-lg font-bold text-black dark:text-white">{totalCount}</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gray-200/60 dark:bg-neutral-800 flex items-center justify-center text-gray-700 dark:text-neutral-300">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel-opal flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 block">
              1. Matriz Enviada
            </span>
            <span className="text-lg font-bold text-blue-950 dark:text-blue-100">
              {prospects.filter((p) => p.status === 'matriz_enviada').length}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300">
            <Phone className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel-opal flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 block">
              2. Sesión 20 min
            </span>
            <span className="text-lg font-bold text-amber-950 dark:text-amber-100">
              {prospects.filter((p) => p.status === 'sesion_20min_agendada').length}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel-opal flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">
              3. Convertidos
            </span>
            <span className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
              {prospects.filter((p) => p.status === 'convertido').length}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel-opal flex items-center justify-between col-span-2 sm:col-span-4 lg:col-span-1">
          <div>
            <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-neutral-500 block">
              Conversión
            </span>
            <span className="text-lg font-bold text-black dark:text-white">{conversionRate}%</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gray-200/60 dark:bg-neutral-800 flex items-center justify-center text-gray-700 dark:text-neutral-300">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Controls Toolbar: Search, Filter, Layout Switcher & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 glass-panel-opal rounded-2xl">
        <div className="flex flex-1 items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                viewLayout === 'clients'
                  ? "Buscar coachee por nombre, email, quiebre, teléfono..."
                  : "Buscar por nombre, teléfono, notas..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          {viewLayout !== 'clients' && (
            <select
              value={selectedOriginFilter}
              onChange={(e) => setSelectedOriginFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los orígenes</option>
              <option value="Conversatorio Raíz y Balance">Conversatorio Raíz y Balance</option>
            </select>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Layout Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-white/80 dark:bg-[#1E1E22]/80 border border-gray-200/80 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setViewLayout('kanban')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewLayout === 'kanban'
                  ? 'bg-black dark:bg-white text-white dark:text-black font-semibold shadow-2xs'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Tablero Pipeline</span>
            </button>

            <button
              type="button"
              onClick={() => setViewLayout('clients')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewLayout === 'clients'
                  ? 'bg-black dark:bg-white text-white dark:text-black font-semibold shadow-2xs'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Listado de Clientes</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                viewLayout === 'clients'
                  ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              }`}>
                {safeClients.length}
              </span>
            </button>
          </div>

          {/* Quick Create Buttons */}
          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenMakeModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1E1E22] hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <Workflow className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>Make.com & Webhooks</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddProspectModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1E1E22] hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Prospecto</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddClientModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
              <span>Nuevo Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. MAIN VIEW CONTENT: KANBAN VS LIST */}
      {viewLayout === 'kanban' ? (
        /* ================= COMPACT KANBAN COLUMNS ================= */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 items-start">
          {/* COLUMN 1: MATRIZ ENVIADA */}
          <div className="glass-panel-sheer rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                  1. Matriz Enviada
                </h3>
              </div>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950 px-2 py-0.2 rounded-full border border-blue-200 dark:border-blue-900">
                {groupMatriz.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {groupMatriz.length === 0 ? (
                <div className="p-6 text-center card-solid-white rounded-xl text-xs font-light text-gray-400 dark:text-neutral-500">
                  Sin prospectos en esta etapa.
                </div>
              ) : (
                groupMatriz.map((p) => (
                  <div
                    key={p.id}
                    className="card-solid-white rounded-xl p-3.5 shadow-2xs space-y-2.5 hover:border-black/30 dark:hover:border-neutral-500 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-black dark:text-white">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-neutral-500 font-light">
                          {p.origin}
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-400 dark:text-neutral-500 font-mono">
                        {formatDate(p.createdAt).split(',')[0]}
                      </span>
                    </div>

                    {p.notes && (
                      <p className="text-[11px] font-light text-gray-600 dark:text-neutral-300 bg-[#F9F9F9] dark:bg-[#202024] p-2 rounded-lg border border-gray-100 dark:border-neutral-800/80 leading-relaxed">
                        {p.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                      <a
                        href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-black dark:text-neutral-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-emerald-500" />
                        <span>{p.whatsapp}</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(p.id, 'sesion_20min_agendada')}
                        className="px-2.5 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Agendar 20m</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: SESIÓN 20 MIN AGENDADA */}
          <div className="glass-panel-sheer rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                  2. Sesión 20 min
                </h3>
              </div>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950 px-2 py-0.2 rounded-full border border-amber-200 dark:border-amber-900">
                {groupSesion20.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {groupSesion20.length === 0 ? (
                <div className="p-6 text-center card-solid-white rounded-xl text-xs font-light text-gray-400 dark:text-neutral-500">
                  Sin sesiones agendadas.
                </div>
              ) : (
                groupSesion20.map((p) => (
                  <div
                    key={p.id}
                    className="card-solid-white rounded-xl p-3.5 shadow-2xs space-y-2.5 hover:border-amber-400 dark:hover:border-amber-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-black dark:text-white">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {p.session20minDate ? formatDate(p.session20minDate) : 'Fecha por confirmar'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSchedulingProspect(p);
                          setScheduleDateTime(
                            p.session20minDate
                              ? p.session20minDate.substring(0, 16)
                              : new Date().toISOString().substring(0, 16)
                          );
                        }}
                        title="Modificar fecha de la sesión"
                        className="p-1 rounded-md text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>

                    {p.notes && (
                      <p className="text-[11px] font-light text-gray-600 dark:text-neutral-300 bg-[#F9F9F9] dark:bg-[#202024] p-2 rounded-lg border border-gray-100 dark:border-neutral-800/80 leading-relaxed">
                        {p.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(p.id, 'descartado')}
                        className="text-[10px] text-gray-400 hover:text-red-500 font-medium cursor-pointer transition-colors"
                      >
                        Descartar
                      </button>

                      <button
                        type="button"
                        onClick={() => setConvertingProspect(p)}
                        className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Convertir a Cliente</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: DECISIÓN & CIERRE (CONVERTIDOS Y DESCARTADOS) */}
          <div className="glass-panel-sheer rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                  3. Decisión & Cierre
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950 px-2 py-0.2 rounded-full">
                  {groupConvertidos.length} cerrados
                </span>
                {groupDescartados.length > 0 && (
                  <span className="text-[10px] font-medium text-gray-500 bg-gray-200 dark:bg-neutral-800 px-1.5 py-0.2 rounded-full">
                    {groupDescartados.length} desc.
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {groupConvertidos.length === 0 && groupDescartados.length === 0 ? (
                <div className="p-6 text-center card-solid-white rounded-xl text-xs font-light text-gray-400 dark:text-neutral-500">
                  Sin decisiones registradas.
                </div>
              ) : (
                <>
                  {/* Convertidos */}
                  {groupConvertidos.map((p) => {
                    const matchedClient = clients.find((c) => c.name === p.name || c.email === p.email);
                    return (
                      <div
                        key={p.id}
                        className="card-solid-white rounded-xl p-3.5 shadow-2xs space-y-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            {matchedClient && onSelectClientAndOpenWorkstation ? (
                              <button
                                type="button"
                                onClick={() => onSelectClientAndOpenWorkstation(matchedClient.uid)}
                                className="text-xs font-bold text-black dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1.5 text-left transition-colors"
                                title={`Abrir Ficha Detallada de ${matchedClient.name}`}
                              >
                                <span>{p.name}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              </button>
                            ) : (
                              <div className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                                <span>{p.name}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              </div>
                            )}
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                              Convertido 1 a 1
                            </span>
                          </div>

                          {matchedClient && onSelectClientAndOpenWorkstation && (
                            <button
                              type="button"
                              onClick={() => onSelectClientAndOpenWorkstation(matchedClient.uid)}
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 px-2 py-0.5 rounded-full font-semibold transition-all cursor-pointer"
                            >
                              <span>Abrir Ficha</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        {p.notes && (
                          <p className="text-[11px] font-light text-gray-600 dark:text-neutral-300">
                            {p.notes}
                          </p>
                        )}

                        <div className="text-[9px] text-gray-400 font-mono pt-1">
                          Cierre: {formatDate(p.convertedAt)}
                        </div>
                      </div>
                    );
                  })}

                  {/* Descartados */}
                  {groupDescartados.map((p) => (
                    <div
                      key={p.id}
                      className="card-solid-white rounded-xl p-3 opacity-70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 dark:text-neutral-300 line-through">
                          {p.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(p.id, 'matriz_enviada')}
                          className="text-[10px] text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                        >
                          Reactivar
                        </button>
                      </div>
                      {p.notes && (
                        <p className="text-[10px] font-light text-gray-500 line-clamp-1">{p.notes}</p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= INTERACTIVE CLIENT DIRECTORY VIEW ================= */
        <div className="space-y-4">
          {/* Sub-header & Status Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Estado:
              </span>
              <button
                type="button"
                onClick={() => setClientStatusFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  clientStatusFilter === 'all'
                    ? 'bg-black dark:bg-white text-white dark:text-black font-semibold shadow-2xs'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
              >
                Todos ({safeClients.length})
              </button>
              <button
                type="button"
                onClick={() => setClientStatusFilter('active')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  clientStatusFilter === 'active'
                    ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                }`}
              >
                Activos ({countActiveClients})
              </button>
              <button
                type="button"
                onClick={() => setClientStatusFilter('waiting')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  clientStatusFilter === 'waiting'
                    ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                }`}
              >
                En Espera ({countWaitingClients})
              </button>
              <button
                type="button"
                onClick={() => setClientStatusFilter('inactive')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  clientStatusFilter === 'inactive'
                    ? 'bg-gray-600 text-white font-semibold shadow-2xs'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-200'
                }`}
              >
                Inactivos ({countInactiveClients})
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-black dark:text-white">Cartera Activa:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalClientsInvested)}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Clients Table */}
          <div className="glass-panel-sheer rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200/80 dark:border-neutral-800 bg-[#F9F9F9] dark:bg-[#1A1A1E] text-gray-500 dark:text-neutral-400 text-[10px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Coachee / Datos de Contacto</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Programa & Progreso</th>
                    <th className="py-3 px-4">Quiebre Ontológico Central</th>
                    <th className="py-3 px-4">Inversión</th>
                    <th className="py-3 px-4 text-right">Ficha Individual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 text-xs font-light">
                        <Users className="w-8 h-8 mx-auto text-gray-300 dark:text-neutral-600 mb-2 opacity-60" />
                        <p className="font-medium text-gray-600 dark:text-neutral-400">
                          No se encontraron clientes con los criterios de búsqueda.
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Prueba a restablecer los filtros o registra un nuevo coachee directivo.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const clientStatus = client.status || 'active';
                      const avatarUrl = getEmailAvatarUrl(client.email, client.name, client.avatarUrl);
                      return (
                        <tr
                          key={client.uid}
                          className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors group"
                        >
                          {/* Coachee info with clickable name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={avatarUrl}
                                alt={client.name}
                                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-neutral-700 shrink-0 shadow-2xs"
                              />
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => onSelectClientAndOpenWorkstation?.(client.uid)}
                                  className="font-bold text-sm text-black dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline cursor-pointer transition-colors text-left flex items-center gap-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                                  title={`Abrir Ficha Detallada de ${client.name}`}
                                >
                                  <span className="truncate">{client.name}</span>
                                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                                <div className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                                  {client.title || 'Cliente Directivo'}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 dark:text-neutral-500">
                                  <span className="truncate">{client.email}</span>
                                  {client.phone && (
                                    <>
                                      <span>&bull;</span>
                                      <a
                                        href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:text-emerald-600 transition-colors inline-flex items-center gap-0.5"
                                      >
                                        <Phone className="w-2.5 h-2.5 text-emerald-500" />
                                        <span>{client.phone}</span>
                                      </a>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <select
                              value={clientStatus}
                              onChange={(e) =>
                                handleUpdateClientStatusLocal(client.uid, e.target.value as ClientStatus)
                              }
                              className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none transition-all ${
                                clientStatus === 'active'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                  : clientStatus === 'waiting'
                                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                                  : 'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400'
                              }`}
                            >
                              <option value="active">Activo</option>
                              <option value="waiting">En Espera</option>
                              <option value="inactive">Inactivo</option>
                            </select>
                          </td>

                          {/* Program & Progress */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1 max-w-[200px]">
                              <div className="font-semibold text-black dark:text-white truncate">
                                {client.programName || 'Certeza & Fronteras'}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                    style={{
                                      width: `${Math.min(100, ((client.programProgress || 1) / 6) * 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono text-gray-500 dark:text-neutral-400 shrink-0">
                                  Paso {client.programProgress || 1}/6
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Breakdown / Quiebre */}
                          <td className="py-3.5 px-4 max-w-xs">
                            {client.primaryBreakdown ? (
                              <p className="text-[11px] font-light text-gray-600 dark:text-neutral-300 line-clamp-2 italic">
                                &ldquo;{client.primaryBreakdown}&rdquo;
                              </p>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">
                                En proceso de exploración ontológica
                              </span>
                            )}
                          </td>

                          {/* Investment */}
                          <td className="py-3.5 px-4 font-mono font-semibold text-black dark:text-white">
                            {client.totalInvested || client.programFee || '$1.500.000 COP'}
                          </td>

                          {/* Action Button: Open Ficha */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => onSelectClientAndOpenWorkstation?.(client.uid)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-2xs group-hover:shadow-xs"
                              title={`Abrir Ficha Detallada de ${client.name}`}
                            >
                              <span>Abrir Ficha</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
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

      {/* ================= MODAL: ADD PROSPECT ================= */}
      {showAddProspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl max-w-md w-full p-6 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-base font-semibold text-black dark:text-white">
                Agregar Nuevo Prospecto Comercial
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProspectModal(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProspect} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-black dark:text-white block mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Gómez"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-black dark:text-white block mb-1">
                  WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: +57 311 234 5678"
                  value={prospectPhone}
                  onChange={(e) => setProspectPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-black dark:text-white block mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="laura.gomez@empresa.com"
                  value={prospectEmail}
                  onChange={(e) => setProspectEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-black dark:text-white block mb-1">
                  Etapa Inicial
                </label>
                <select
                  value={prospectStatus}
                  onChange={(e) => setProspectStatus(e.target.value as ProspectStatus)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                >
                  <option value="matriz_enviada">1. Matriz Enviada</option>
                  <option value="sesion_20min_agendada">2. Sesión 20 min Agendada</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-black dark:text-white block mb-1">
                  Notas / Quiebre Inicial
                </label>
                <textarea
                  rows={2}
                  placeholder="Observaciones de su situación o expectativas..."
                  value={prospectNotes}
                  onChange={(e) => setProspectNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProspectModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold"
                >
                  Guardar Prospecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SCHEDULE 20 MIN SESSION ================= */}
      {schedulingProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl max-w-md w-full p-6 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-base font-semibold text-black dark:text-white">
                Agendar Sesión de 20 Minutos
              </h3>
              <button
                type="button"
                onClick={() => setSchedulingProspect(null)}
                className="text-gray-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveScheduledSession} className="space-y-4 text-xs">
              <p className="text-gray-500 dark:text-neutral-400">
                Selecciona la fecha y hora para la exploración ontológica de <strong>{schedulingProspect.name}</strong>:
              </p>

              <div>
                <label className="font-medium text-black dark:text-white block mb-1">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Link Oficial de Agendamiento 1 a 1</span>
                  </span>
                  <a
                    href={OntologicalStore.getCalendarUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1"
                  >
                    <span>Abrir Google Calendar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={OntologicalStore.getCalendarUrl()}
                    className="w-full text-[10px] font-mono bg-white dark:bg-[#121214] border border-blue-200 dark:border-blue-900 rounded-xl px-2.5 py-1.5 text-gray-700 dark:text-neutral-300 select-all"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await safeCopyToClipboard(OntologicalStore.getCalendarUrl());
                      setCopiedCalendarLink(true);
                      setTimeout(() => setCopiedCalendarLink(false), 2000);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCalendarLink ? (
                      <>
                        <CheckCheck className="w-3 h-3" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSchedulingProspect(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold"
                >
                  Confirmar Agendamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONVERT PROSPECT TO CLIENT ================= */}
      {convertingProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl max-w-md w-full p-6 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-base font-semibold text-black dark:text-white">
                Convertir Prospecto a Cliente Ejecutivo
              </h3>
              <button
                type="button"
                onClick={() => setConvertingProspect(null)}
                className="text-gray-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="text-gray-600 dark:text-neutral-300">
                Se creará el usuario de cliente para <strong>{convertingProspect.name}</strong>, se le asignará el <em>Nodo 1 (Nivel I)</em> del programa Certeza y se habilitará su bitácora digital.
              </p>

              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Modalidad de Inversión / Estado de Pago *
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none font-medium"
                >
                  <option value="Completado">Pago Completo ($1.500.000 COP)</option>
                  <option value="Cuota 1 de 2">Cuota 1 de 2 ($750.000 COP)</option>
                  <option value="Pago Único">Pago Único Promocional</option>
                  <option value="Pendiente">Pendiente de Acreditación</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConvertingProspect(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmConversion}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Confirmar & Abrir Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW CLIENT DIRECTLY ================= */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl max-w-lg w-full p-6 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-black dark:text-white">
                    Registrar Nuevo Cliente / Coachee
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    Se creará en el CRM e inmediatamente se abrirá su ficha individual integrada
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-black dark:text-white block mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Andrés Morales"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-medium text-black dark:text-white block mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="andres@empresa.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-black dark:text-white block mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+57 300 123 4567"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-medium text-black dark:text-white block mb-1">
                    Cargo / Rol Profesional
                  </label>
                  <input
                    type="text"
                    placeholder="Director General / VP"
                    value={newClientTitle}
                    onChange={(e) => setNewClientTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-black dark:text-white block mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={newClientStatus}
                    onChange={(e) => setNewClientStatus(e.target.value as ClientStatus)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none font-medium"
                  >
                    <option value="active">Activo (En Acompañamiento)</option>
                    <option value="waiting">En Espera / Pausa</option>
                    <option value="inactive">Inactivo / Completado</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-black dark:text-white block mb-1">
                    Inversión Acordada
                  </label>
                  <input
                    type="text"
                    placeholder="$1.500.000 COP"
                    value={newClientFee}
                    onChange={(e) => setNewClientFee(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-black dark:text-white block mb-1">
                  Quiebre Ontológico / Foco de Intervención
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Dificultad para poner límites a socios; reactividad ante la incertidumbre..."
                  value={newClientBreakdown}
                  onChange={(e) => setNewClientBreakdown(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Crear & Abrir Ficha</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
