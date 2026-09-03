import React, { useState, useMemo } from 'react';
import { Prospect, ProspectStatus, PaymentStatus, User, EventRegistration } from '../types';
import { OntologicalStore } from '../services/store';
import {
  Kanban,
  List,
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
}) => {
  const safeProspects = Array.isArray(prospects) ? prospects : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeRegistrations = Array.isArray(eventRegistrations) ? eventRegistrations : [];

  const [viewLayout, setViewLayout] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOriginFilter, setSelectedOriginFilter] = useState<string>('all');
  const [copiedLinkFeedback, setCopiedLinkFeedback] = useState(false);
  const [copiedCalendarLink, setCopiedCalendarLink] = useState(false);

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

  const handleCopyRegistrationLink = () => {
    const url = `${window.location.origin}/?view=registro`;
    navigator.clipboard.writeText(url);
    setCopiedLinkFeedback(true);
    setTimeout(() => setCopiedLinkFeedback(false), 2500);
  };

  const handleConfirmAttendance = (ticketCodeOrId: string) => {
    OntologicalStore.confirmEventAttendance(ticketCodeOrId);
    onRefreshProspects();
    onRefreshClients();
  };

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
    <div className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-6">
      {/* 1. Header with Compact Summary Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-gray-100 dark:border-neutral-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#F5F5F7] dark:bg-neutral-800 border border-gray-200/80 dark:border-neutral-700 text-[10px] font-semibold text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
            <Kanban className="w-3 h-3 text-black dark:text-white" />
            Embudo de Atracción & Conversión Comercial
          </div>
          <h2 className="text-xl sm:text-2xl font-light text-black dark:text-white tracking-tight">
            Pipeline Ontológico: <strong className="font-semibold">Conversatorio Raíz y Balance</strong>
          </h2>
          <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-0.5 max-w-2xl">
            Control de prospectos, agendamiento de sesiones de 20 minutos y conversión al programa ejecutivo de 12 semanas.
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

      {/* 3. Pre-Inscripción Direct Link & Live RSVPs Ticket Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 text-white dark:bg-[#151518] border border-neutral-800 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white tracking-tight flex items-center gap-2">
                <span>Portal Público de Registro & Ticket RSVP ({eventRegistrations.length} inscritos)</span>
                <span className="text-[9px] px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-medium">
                  Enlace Independiente
                </span>
              </div>
              <p className="text-[11px] font-light text-neutral-300 dark:text-neutral-400">
                Al confirmar asistencia en vivo con su ticket digital, el asistente activa su acceso al portal directivo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyRegistrationLink}
              className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedLinkFeedback ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>¡Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            {onOpenRegistrationPortal && (
              <button
                type="button"
                onClick={onOpenRegistrationPortal}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Landing</span>
              </button>
            )}
          </div>
        </div>

        {/* Compact RSVP List */}
        {eventRegistrations.length > 0 && (
          <div className="pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            {eventRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[11px]"
              >
                <span className="font-semibold text-white truncate max-w-[130px]">{reg.name}</span>
                <span className="font-mono text-[9px] text-amber-300">{reg.ticketCode}</span>
                {reg.attendedEvent ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 font-semibold">
                    Asistió
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConfirmAttendance(reg.ticketCode)}
                    title="Confirmar asistencia para activar acceso al portal"
                    className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-semibold hover:bg-amber-300 cursor-pointer transition-all"
                  >
                    Confirmar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Controls Toolbar: Search, Origin Filter & Layout Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 glass-panel-opal rounded-2xl">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          <select
            value={selectedOriginFilter}
            onChange={(e) => setSelectedOriginFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="all">Todos los orígenes</option>
            <option value="Conversatorio Raíz y Balance">Conversatorio Raíz y Balance</option>
          </select>
        </div>

        {/* Layout Switcher */}
        <div className="inline-flex items-center p-1 rounded-xl bg-white/80 dark:bg-[#1E1E22]/80 border border-gray-200/80 dark:border-neutral-700 self-start sm:self-auto">
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
            <span>Tablero Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => setViewLayout('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewLayout === 'list'
                ? 'bg-black dark:bg-white text-white dark:text-black font-semibold shadow-2xs'
                : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Lista Agrupada</span>
          </button>
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
                            <div className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                              <span>{p.name}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            </div>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                              Convertido 1 a 1
                            </span>
                          </div>

                          {matchedClient && onSelectClientAndOpenWorkstation && (
                            <button
                              type="button"
                              onClick={() => onSelectClientAndOpenWorkstation(matchedClient.uid)}
                              className="text-[10px] text-black dark:text-white underline font-semibold cursor-pointer"
                            >
                              Ver en Clientes
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
        /* ================= COMPACT GROUPED LIST VIEW ================= */
        <div className="glass-panel-sheer rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-neutral-800 bg-[#F9F9F9] dark:bg-[#1A1A1E] text-gray-500 dark:text-neutral-400 text-[10px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Prospecto / Contacto</th>
                  <th className="py-3 px-4">Etapa del Embudo</th>
                  <th className="py-3 px-4">Fecha Sesión 20m</th>
                  <th className="py-3 px-4">Notas / Quiebre Detectado</th>
                  <th className="py-3 px-4 text-right">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {filteredProspects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 text-xs font-light">
                      No se encontraron prospectos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredProspects.map((p) => {
                    const isEditingNote = editingProspectNotes?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-black dark:text-white">{p.name}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-neutral-400">
                            <a
                              href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 hover:text-emerald-600 transition-colors"
                            >
                              <Phone className="w-2.5 h-2.5 text-emerald-500" />
                              <span>{p.whatsapp}</span>
                            </a>
                            {p.email && <span>&bull; {p.email}</span>}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={p.status}
                            onChange={(e) =>
                              handleStatusChange(p.id, e.target.value as ProspectStatus)
                            }
                            className="text-xs bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1 font-medium text-black dark:text-white cursor-pointer focus:outline-none"
                          >
                            <option value="matriz_enviada">1. Matriz Enviada</option>
                            <option value="sesion_20min_agendada">2. Sesión 20m Agendada</option>
                            <option value="convertido">3. Convertido 1 a 1</option>
                            <option value="descartado">Descartado</option>
                          </select>
                        </td>

                        <td className="py-3 px-4">
                          {p.session20minDate ? (
                            <div className="text-amber-800 dark:text-amber-300 font-medium">
                              {formatDate(p.session20minDate)}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSchedulingProspect(p);
                                setScheduleDateTime(new Date().toISOString().substring(0, 16));
                              }}
                              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              + Agendar Fecha
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          {isEditingNote ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editingProspectNotes.notes}
                                onChange={(e) =>
                                  setEditingProspectNotes({
                                    id: p.id,
                                    notes: e.target.value,
                                  })
                                }
                                className="w-full text-xs px-2 py-1 bg-white dark:bg-[#202024] border border-gray-300 dark:border-neutral-600 rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveNotes(p.id)}
                                className="px-2 py-1 bg-black text-white text-[10px] rounded-md font-semibold"
                              >
                                Guardar
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() =>
                                setEditingProspectNotes({
                                  id: p.id,
                                  notes: p.notes || '',
                                })
                              }
                              className="text-[11px] text-gray-600 dark:text-neutral-300 truncate cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 p-1 rounded-md transition-colors"
                              title="Haz clic para editar notas"
                            >
                              {p.notes || <span className="italic text-gray-400">Sin notas (clic para añadir)</span>}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.status !== 'convertido' && (
                              <button
                                type="button"
                                onClick={() => setConvertingProspect(p)}
                                title="Convertir a Cliente 1 a 1"
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold transition-all"
                              >
                                Convertir
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteProspect(p.id, p.name)}
                              title="Eliminar del pipeline"
                              className="p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
                    onClick={() => {
                      navigator.clipboard.writeText(OntologicalStore.getCalendarUrl());
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
    </div>
  );
};
