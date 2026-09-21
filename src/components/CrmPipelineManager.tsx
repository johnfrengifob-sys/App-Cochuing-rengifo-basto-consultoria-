import React, { useState, useMemo } from 'react';
import {
  Prospect,
  ProspectStatus,
  PaymentStatus,
  User,
  EventRegistration,
  ClientStatus,
  Session,
} from '../types';
import { OntologicalStore } from '../services/store';
import { safeCopyToClipboard } from '../utils/clipboard';
import { getEmailAvatarUrl } from '../utils/avatar';
import { CORE_WORKSHOPS_CATALOG } from '../data/coreWorkshopsCatalog';
import {
  OFFICIAL_FORMS_SHEETS_BASE_MAP,
  OFFICIAL_FORMS_SHEETS_BASE_LIST,
} from '../data/officialFormsSheetsBase';
import {
  Search,
  Plus,
  Phone,
  UserPlus,
  ArrowRight,
  Workflow,
  ExternalLink,
  Filter,
  FileSpreadsheet,
  FileText,
  Video,
  CheckCircle2,
  Table,
  Kanban,
  Check,
  Award,
  ChevronRight,
  Mail,
} from 'lucide-react';

interface CrmPipelineManagerProps {
  prospects: Prospect[];
  clients: User[];
  sessions?: Session[];
  eventRegistrations?: EventRegistration[];
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
  sessions = [],
  onRefreshProspects,
  onRefreshClients,
  onSelectClientAndOpenWorkstation,
  onOpenMakeModal,
  onUpdateClientStatus,
  onDeleteClient,
  embedded = false,
}) => {
  const safeProspects = Array.isArray(prospects) ? prospects : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeSessions =
    Array.isArray(sessions) && sessions.length > 0 ? sessions : OntologicalStore.getSessions();

  // Primary view toggle: Table (Directorio) vs Kanban (Pipeline por Ciclos)
  const [viewMode, setViewMode] = useState<'directorio' | 'pipeline'>('directorio');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');

  // Modal Google Workspace Sheets & Forms
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Client Modal
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientTitle, setNewClientTitle] = useState('Cliente Directivo');
  const [newClientFee, setNewClientFee] = useState('$1.500.000 COP');
  const [newClientBreakdown, setNewClientBreakdown] = useState('');
  const [newClientStatus, setNewClientStatus] = useState<ClientStatus>('active');

  // New Prospect Modal
  const [showAddProspectModal, setShowAddProspectModal] = useState(false);
  const [prospectName, setProspectName] = useState('');
  const [prospectPhone, setProspectPhone] = useState('');
  const [prospectEmail, setProspectEmail] = useState('');
  const [prospectNotes, setProspectNotes] = useState('');

  // Conversion Modal
  const [convertingProspect, setConvertingProspect] = useState<Prospect | null>(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>('Completado');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = async (text: string, key: string, label = 'Enlace copiado') => {
    await safeCopyToClipboard(text);
    setCopiedKey(key);
    showToast(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    return safeClients.filter((client) => {
      if (!client) return false;
      const matchesStatus = statusFilter === 'all' || (client.status || 'active') === statusFilter;
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
  }, [safeClients, searchQuery, statusFilter]);

  // Filtered prospects
  const filteredProspects = useMemo(() => {
    return safeProspects.filter((p) => {
      if (!p) return false;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.whatsapp || '').toLowerCase().includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
      );
    });
  }, [safeProspects, searchQuery]);

  // Counts
  const countActive = safeClients.filter((c) => (c?.status || 'active') === 'active').length;
  const countWaiting = safeClients.filter((c) => c?.status === 'waiting').length;
  const countInactive = safeClients.filter((c) => c?.status === 'inactive').length;

  // Workshop helpers
  const getClientWorkshopData = (client: User) => {
    const attended = client.attendedWorkshopIds || [];
    const memories = client.workshopMemories || {};

    const t1 = attended.includes('taller-1-raiz') || Boolean(memories['taller-1-raiz']);
    const t2 = attended.includes('taller-2-tallo') || Boolean(memories['taller-2-tallo']);
    const t3 = attended.includes('taller-3-florecimiento') || Boolean(memories['taller-3-florecimiento']);

    const count = (t1 ? 1 : 0) + (t2 ? 1 : 0) + (t3 ? 1 : 0);
    return { t1, t2, t3, count };
  };

  // Session helpers (12 sessions program)
  const getClientSessionData = (client: User) => {
    const progress = Math.max(1, Math.min(12, client.programProgress || 1));
    let cycle = 'Raíz';
    let cycleColor = 'emerald';
    if (progress > 8) {
      cycle = 'Florecimiento';
      cycleColor = 'indigo';
    } else if (progress > 4) {
      cycle = 'Tallo';
      cycleColor = 'amber';
    }
    return { progress, cycle, cycleColor };
  };

  const handleUpdateStatus = (clientId: string, newStatus: ClientStatus) => {
    if (onUpdateClientStatus) {
      onUpdateClientStatus(clientId, newStatus);
    } else {
      OntologicalStore.updateClientStatus(clientId, newStatus);
    }
    onRefreshClients();
    showToast(`Estado actualizado a ${newStatus}`);
  };

  const handleAdvanceStep = (clientId: string, currentStep: number) => {
    const next = Math.min(12, currentStep + 1);
    const users = OntologicalStore.getUsers();
    const updated = users.map((u) => (u.uid === clientId ? { ...u, programProgress: next } : u));
    OntologicalStore.saveUsers(updated);
    onRefreshClients();
    showToast(`Sesión avanzada a ${next}/12`);
  };

  const handleToggleWorkshop = (client: User, wsId: string) => {
    const currentAttended = client.attendedWorkshopIds || [];
    const isAttended = currentAttended.includes(wsId);
    const newAttended = isAttended
      ? currentAttended.filter((id) => id !== wsId)
      : [...currentAttended, wsId];

    const users = OntologicalStore.getUsers();
    const updated = users.map((u) =>
      u.uid === client.uid ? { ...u, attendedWorkshopIds: newAttended } : u
    );
    OntologicalStore.saveUsers(updated);
    onRefreshClients();
    showToast(isAttended ? 'Acreditación retirada' : 'Taller acreditado ✓');
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) return;

    const newClient: User = {
      uid: 'client-' + Date.now(),
      email: newClientEmail.trim().toLowerCase(),
      name: newClientName.trim(),
      role: 'client',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256`,
      title: newClientTitle.trim() || 'Cliente Directivo',
      status: newClientStatus,
      phone: newClientPhone.trim() || undefined,
      programName: 'Certeza, Fronteras & Dirección Personal (12 Sesiones)',
      programProgress: 1,
      programFee: newClientFee,
      totalInvested: newClientFee,
      primaryBreakdown:
        newClientBreakdown.trim() || 'Fronteras, auto-observación y claridad directiva',
      hasWorkshopsAccess: true,
      enrolledWorkshopIds: ['taller-1-raiz', 'taller-2-tallo'],
      attendedWorkshopIds: [],
      joinedAt: new Date().toISOString().split('T')[0],
    };

    const currentUsers = OntologicalStore.getUsers();
    OntologicalStore.saveUsers([...currentUsers, newClient]);
    onRefreshClients();
    setShowAddClientModal(false);

    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientBreakdown('');

    showToast(`Cliente ${newClient.name} creado.`);
    if (onSelectClientAndOpenWorkstation) {
      onSelectClientAndOpenWorkstation(newClient.uid);
    }
  };

  const handleAddProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectName.trim() || !prospectPhone.trim()) return;

    OntologicalStore.addProspect({
      name: prospectName.trim(),
      whatsapp: prospectPhone.trim(),
      email: prospectEmail.trim() || undefined,
      notes: prospectNotes.trim() || 'Participante en proceso de exploración.',
      status: 'matriz_enviada',
      origin: 'Conversatorio Raíz y Balance',
      matrixSentAt: new Date().toISOString(),
    });

    setProspectName('');
    setProspectPhone('');
    setProspectEmail('');
    setProspectNotes('');
    setShowAddProspectModal(false);
    onRefreshProspects();
    showToast('Prospecto guardado.');
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
      showToast(`Prospecto convertido a cliente: ${newClient.name}`);
      if (onSelectClientAndOpenWorkstation) {
        onSelectClientAndOpenWorkstation(newClient.uid);
      }
    }
  };

  return (
    <div
      className={
        embedded
          ? 'w-full flex-1 flex flex-col space-y-4'
          : 'p-4 sm:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-4'
      }
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 dark:border-black/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barra de Control y Acciones Principales (Simple, Limpia, Sin Repetición) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
        {/* Izquierda: Selector de Vista & Buscador */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Alternador de Vista: Directorio vs Pipeline */}
          <div className="flex items-center p-1 bg-gray-100 dark:bg-neutral-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('directorio')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'directorio'
                  ? 'bg-white dark:bg-neutral-900 text-black dark:text-white shadow-2xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Directorio</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-neutral-300">
                {safeClients.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('pipeline')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'pipeline'
                  ? 'bg-white dark:bg-neutral-900 text-black dark:text-white shadow-2xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-neutral-300">
                {safeProspects.length}
              </span>
            </button>
          </div>

          {/* Campo de Búsqueda */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, cargo, correo o quiebre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          {/* Filtros de Estado en Directorio */}
          {viewMode === 'directorio' && (
            <div className="flex items-center gap-1 border-l border-gray-200 dark:border-neutral-800 pl-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                Activos ({countActive})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('waiting')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === 'waiting'
                    ? 'bg-amber-500 text-white font-semibold'
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                Espera ({countWaiting})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === 'inactive'
                    ? 'bg-gray-600 text-white font-semibold'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`}
              >
                Inactivos ({countInactive})
              </button>
            </div>
          )}
        </div>

        {/* Derecha: Accesos a Google Sheets & Botones de Acción */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSheetsModal(true)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1E1E22] hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Ver las 4 bases de datos maestras de Google Workspace"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Google Sheets & Forms</span>
            <span className="sm:hidden">Sheets</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddProspectModal(true)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1E1E22] hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Prospecto</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddClientModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span>+ Nuevo Coachee</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: DIRECTORIO DE FÁCIL LECTURA (TABLA LIMPIA Y CLARA)                */}
      {/* ========================================================================= */}
      {viewMode === 'directorio' && (
        <div className="glass-panel-sheer rounded-2xl overflow-hidden shadow-2xs border border-gray-200/70 dark:border-neutral-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-neutral-800 bg-[#F9F9F9] dark:bg-[#1A1A1E] text-gray-500 dark:text-neutral-400 text-[10px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Coachee</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-4">Sesiones 1 a 1 (12 Pasos)</th>
                  <th className="py-3 px-4">Talleres RBC (3 Fases)</th>
                  <th className="py-3 px-4">Quiebre Central</th>
                  <th className="py-3 px-3">Inversión</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                      No se encontraron coachees registrados.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const avatarUrl = getEmailAvatarUrl(client.email, client.name, client.avatarUrl);
                    const ws = getClientWorkshopData(client);
                    const sess = getClientSessionData(client);
                    const st = client.status || 'active';

                    return (
                      <tr
                        key={client.uid}
                        className="hover:bg-gray-50/80 dark:hover:bg-neutral-800/40 transition-colors group"
                      >
                        {/* 1. Coachee & Contacto */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatarUrl}
                              alt={client.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-neutral-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => onSelectClientAndOpenWorkstation?.(client.uid)}
                                className="font-bold text-sm text-black dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline cursor-pointer text-left block truncate"
                              >
                                {client.name}
                              </button>
                              <div className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                                {client.title || 'Cliente Directivo'}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 dark:text-neutral-500">
                                <span>{client.email}</span>
                                {client.phone && (
                                  <>
                                    <span>&bull;</span>
                                    <a
                                      href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="hover:text-emerald-600 inline-flex items-center gap-0.5 text-emerald-600 font-medium"
                                    >
                                      <Phone className="w-2.5 h-2.5" />
                                      <span>{client.phone}</span>
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Estado */}
                        <td className="py-3.5 px-3">
                          <select
                            value={st}
                            onChange={(e) =>
                              handleUpdateStatus(client.uid, e.target.value as ClientStatus)
                            }
                            className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none transition-all ${
                              st === 'active'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                : st === 'waiting'
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                                : 'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400'
                            }`}
                          >
                            <option value="active">Activo</option>
                            <option value="waiting">En Espera</option>
                            <option value="inactive">Inactivo</option>
                          </select>
                        </td>

                        {/* 3. Sesiones 1 a 1 (12 Pasos) */}
                        <td className="py-3.5 px-4 min-w-[170px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-black dark:text-white">
                                Sesión {sess.progress} / 12
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {Math.round((sess.progress / 12) * 100)}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{ width: `${(sess.progress / 12) * 100}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                              <span className="text-blue-700 dark:text-blue-300 font-medium">
                                Ciclo {sess.cycle}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAdvanceStep(client.uid, sess.progress)}
                                className="hover:text-black dark:hover:text-white hover:underline cursor-pointer"
                                title="Avanzar 1 sesión"
                              >
                                +1 paso
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* 4. Talleres RBC (3 Fases) */}
                        <td className="py-3.5 px-4 min-w-[150px]">
                          <div className="space-y-1.5">
                            <div className="text-xs font-semibold text-black dark:text-white">
                              {ws.count} de 3 Acreditados
                            </div>
                            <div className="flex items-center gap-1 text-[9px]">
                              <button
                                type="button"
                                onClick={() => handleToggleWorkshop(client, 'taller-1-raiz')}
                                title="Taller 1: Raíz (Click para alternar)"
                                className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                                  ws.t1
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                Raíz {ws.t1 ? '✓' : ''}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleWorkshop(client, 'taller-2-tallo')}
                                title="Taller 2: Tallo (Click para alternar)"
                                className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                                  ws.t2
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                Tallo {ws.t2 ? '✓' : ''}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleWorkshop(client, 'taller-3-florecimiento')}
                                title="Taller 3: Florecimiento (Click para alternar)"
                                className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                                  ws.t3
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                Flor {ws.t3 ? '✓' : ''}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* 5. Quiebre Central */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-[11px] text-gray-600 dark:text-neutral-300 italic line-clamp-2 leading-relaxed">
                            &ldquo;{client.primaryBreakdown || 'En diagnóstico inicial'}&rdquo;
                          </p>
                        </td>

                        {/* 6. Inversión */}
                        <td className="py-3.5 px-3 font-mono text-xs font-semibold text-black dark:text-white whitespace-nowrap">
                          {client.totalInvested || client.programFee || '$1.500.000 COP'}
                        </td>

                        {/* 7. Acción: Abrir Ficha */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onSelectClientAndOpenWorkstation?.(client.uid)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-2xs"
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
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: PIPELINE COMERCIAL & ONTOLÓGICO                                  */}
      {/* ========================================================================= */}
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {/* Columna 1: Prospectos en Diagnóstico */}
          <div className="glass-panel-sheer rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                  1. Diagnóstico & Prospectos
                </h3>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.2 rounded-full">
                {filteredProspects.length}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredProspects.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs">Sin prospectos pendientes.</div>
              ) : (
                filteredProspects.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-white dark:bg-[#1E1E22] rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xs space-y-2"
                  >
                    <div className="font-bold text-xs text-black dark:text-white">{p.name}</div>
                    {p.notes && (
                      <p className="text-[11px] text-gray-500 line-clamp-2 italic">{p.notes}</p>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-neutral-800">
                      <a
                        href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{p.whatsapp}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setConvertingProspect(p)}
                        className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-semibold hover:bg-emerald-700 cursor-pointer"
                      >
                        Convertir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna 2: Ciclo I • Raíz */}
          <div className="glass-panel-sheer rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                  2. Ciclo Raíz (1-4)
                </h3>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                {safeClients.filter((c) => (c.programProgress || 1) <= 4).length}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {safeClients
                .filter((c) => (c.programProgress || 1) <= 4)
                .map((client) => (
                  <div
                    key={client.uid}
                    className="p-3 bg-white dark:bg-[#1E1E22] rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-black dark:text-white">
                        {client.name}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">
                        Sess {client.programProgress || 1}/12
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{client.title}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => handleAdvanceStep(client.uid, client.programProgress || 1)}
                        className="text-[10px] text-emerald-600 font-semibold hover:underline cursor-pointer"
                      >
                        +1 Sesión
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectClientAndOpenWorkstation?.(client.uid)}
                        className="text-[10px] text-gray-700 dark:text-neutral-300 font-medium hover:underline flex items-center gap-0.5"
                      >
                        <span>Ficha</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Columna 3: Ciclo II • Tallo */}
          <div className="glass-panel-sheer rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                  3. Ciclo Tallo (5-8)
                </h3>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full">
                {
                  safeClients.filter(
                    (c) => (c.programProgress || 1) >= 5 && (c.programProgress || 1) <= 8
                  ).length
                }
              </span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {safeClients
                .filter((c) => (c.programProgress || 1) >= 5 && (c.programProgress || 1) <= 8)
                .map((client) => (
                  <div
                    key={client.uid}
                    className="p-3 bg-white dark:bg-[#1E1E22] rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-black dark:text-white">
                        {client.name}
                      </span>
                      <span className="text-[10px] font-mono text-amber-600 font-bold">
                        Sess {client.programProgress}/12
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{client.title}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => handleAdvanceStep(client.uid, client.programProgress || 1)}
                        className="text-[10px] text-amber-600 font-semibold hover:underline cursor-pointer"
                      >
                        +1 Sesión
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectClientAndOpenWorkstation?.(client.uid)}
                        className="text-[10px] text-gray-700 dark:text-neutral-300 font-medium hover:underline flex items-center gap-0.5"
                      >
                        <span>Ficha</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Columna 4: Ciclo III • Florecimiento */}
          <div className="glass-panel-sheer rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                  4. Florecimiento (9-12)
                </h3>
              </div>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.2 rounded-full">
                {safeClients.filter((c) => (c.programProgress || 1) >= 9).length}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {safeClients
                .filter((c) => (c.programProgress || 1) >= 9)
                .map((client) => (
                  <div
                    key={client.uid}
                    className="p-3 bg-white dark:bg-[#1E1E22] rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-black dark:text-white">
                        {client.name}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">
                        Sess {client.programProgress}/12
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{client.title}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => onSelectClientAndOpenWorkstation?.(client.uid)}
                        className="text-[10px] text-indigo-600 font-semibold hover:underline flex items-center gap-0.5"
                      >
                        <span>Abrir Cierre</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: GOOGLE SHEETS & FORMS (4 BASES OFICIALES) ================= */}
      {showSheetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl max-w-2xl w-full p-6 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-black dark:text-white">
                    Bases de Datos Oficiales de Google Workspace (RBC)
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Acceso directo a las 4 hojas de cálculo y formularios en vivo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSheetsModal(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {OFFICIAL_FORMS_SHEETS_BASE_LIST.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-gray-50 dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400">{b.category}</span>
                    <h4 className="font-bold text-black dark:text-white text-sm">{b.title}</h4>
                    <p className="text-[11px] text-gray-500 font-light mt-0.5">{b.notes}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={b.sheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1 hover:bg-emerald-700 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Abrir Sheet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={b.formUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-semibold text-xs flex items-center gap-1 hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Formulario</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(b.formUrl, b.id, 'Enlace del formulario copiado')}
                      className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white"
                      title="Copiar enlace del formulario para el coachee"
                    >
                      {copiedKey === b.id ? '✓' : 'Copiar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSheetsModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-black dark:text-white text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: NUEVO COACHEE ================= */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl max-w-md w-full p-6 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-black dark:text-white">
                Registrar Nuevo Coachee
              </h3>
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Gómez"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="laura@empresa.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-black dark:text-white block mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+57 311 234 5678"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-black dark:text-white block mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    placeholder="Directora de Operaciones"
                    value={newClientTitle}
                    onChange={(e) => setNewClientTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Quiebre Central
                </label>
                <textarea
                  rows={2}
                  placeholder="Foco inicial del acompañamiento..."
                  value={newClientBreakdown}
                  onChange={(e) => setNewClientBreakdown(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold"
                >
                  Crear Coachee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NUEVO PROSPECTO ================= */}
      {showAddProspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl max-w-md w-full p-6 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-black dark:text-white">
                Agregar Nuevo Prospecto
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProspectModal(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProspect} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Mejía"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+57 320 123 4567"
                  value={prospectPhone}
                  onChange={(e) => setProspectPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="carlos@empresa.com"
                  value={prospectEmail}
                  onChange={(e) => setProspectEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Notas / Interés
                </label>
                <textarea
                  rows={2}
                  placeholder="Expectativas o tema de interés..."
                  value={prospectNotes}
                  onChange={(e) => setProspectNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
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

      {/* ================= MODAL: CONVERTIR PROSPECTO ================= */}
      {convertingProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl max-w-md w-full p-6 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-black dark:text-white">
                Convertir a Coachee
              </h3>
              <button
                type="button"
                onClick={() => setConvertingProspect(null)}
                className="text-gray-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-600 dark:text-neutral-300">
                Se habilitará la ficha de acompañamiento para <strong>{convertingProspect.name}</strong> en el programa de 12 sesiones.
              </p>

              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Estado de Inversión
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                >
                  <option value="Completado">Pago Completo ($1.500.000 COP)</option>
                  <option value="Cuota 1 de 2">Cuota 1 de 2 ($750.000 COP)</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
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
