import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Users,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Search,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Filter,
  Layers,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  UserCheck,
  CalendarCheck2,
  Link as LinkIcon,
  X,
  FileText,
} from 'lucide-react';
import { Session, SessionStatus, User, FormSubmission, PostSessionForm } from '../../types';
import { OntologicalStore, PROGRAM_NODES } from '../../services/store';

interface AdminSessionsManagerProps {
  onSelectClientForFicha?: (clientId: string) => void;
  onRefreshParent?: () => void;
}

export const AdminSessionsManager: React.FC<AdminSessionsManagerProps> = ({
  onSelectClientForFicha,
  onRefreshParent,
}) => {
  // 1. Data Store States
  const [sessions, setSessions] = useState<Session[]>(() => OntologicalStore.getSessions());
  const [users, setUsers] = useState<User[]>(() => OntologicalStore.getUsers());
  const [forms, setForms] = useState<FormSubmission[]>(() => OntologicalStore.getForms());
  const [postSessionForms, setPostSessionForms] = useState<PostSessionForm[]>(() =>
    OntologicalStore.getPostSessionForms()
  );

  // Clients list only
  const clients = useMemo(
    () => users.filter((u) => u.role === 'client'),
    [users]
  );

  // Listen for real-time synchronization events across tabs / windows
  useEffect(() => {
    const handleSync = () => {
      setSessions(OntologicalStore.getSessions());
      setUsers(OntologicalStore.getUsers());
      setForms(OntologicalStore.getForms());
      setPostSessionForms(OntologicalStore.getPostSessionForms());
    };

    window.addEventListener('rbc-sessions-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('rbc-sessions-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const refreshAll = () => {
    setSessions(OntologicalStore.getSessions());
    setUsers(OntologicalStore.getUsers());
    setForms(OntologicalStore.getForms());
    setPostSessionForms(OntologicalStore.getPostSessionForms());
    onRefreshParent?.();
  };

  // 2. Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  // Expanded reflections accordion for specific sessions
  const [expandedReflectionId, setExpandedReflectionId] = useState<string | null>(null);

  // Clipboard feedback
  const [copiedLinkSessionId, setCopiedLinkSessionId] = useState<string | null>(null);

  // 3. Modals: Create / Edit Session
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionFormData, setSessionFormData] = useState<{
    clientId: string;
    sessionNumber: number;
    date: string;
    time: string;
    meetLink: string;
    status: SessionStatus;
    durationMinutes: number;
    ontologicalFocus: string;
    notes: string;
  }>({
    clientId: '',
    sessionNumber: 1,
    date: '',
    time: '15:00',
    meetLink: '',
    status: 'scheduled',
    durationMinutes: 60,
    ontologicalFocus: '',
    notes: '',
  });

  // Modal: Generate Full Cycle
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [cycleClientId, setCycleClientId] = useState<string>('');
  const [cycleCount, setCycleCount] = useState<number>(6);
  const [cycleFrequency, setCycleFrequency] = useState<'weekly' | 'biweekly'>('biweekly');
  const [cycleStartDate, setCycleStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  // Helper to open creation modal
  const handleOpenCreateSession = (preselectedClientId?: string) => {
    const targetClientId = preselectedClientId || clients[0]?.uid || '';
    const targetClient = clients.find((c) => c.uid === targetClientId);
    const existingClientSessions = sessions.filter((s) => s.clientId === targetClientId);
    const nextSessionNum = existingClientSessions.length > 0
      ? Math.max(...existingClientSessions.map((s) => s.sessionNumber || 1)) + 1
      : (targetClient?.programProgress || 1);

    const defaultNode = PROGRAM_NODES.find((n) => n.step === nextSessionNum) || PROGRAM_NODES[0];

    const d = new Date();
    d.setDate(d.getDate() + 2);
    const dateStr = d.toISOString().split('T')[0];

    setEditingSession(null);
    setSessionFormData({
      clientId: targetClientId,
      sessionNumber: Math.min(nextSessionNum, 12),
      date: dateStr,
      time: '15:00',
      meetLink: `https://meet.google.com/rbc-${(targetClient?.name || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${nextSessionNum}`,
      status: 'scheduled',
      durationMinutes: 60,
      ontologicalFocus: defaultNode ? `${defaultNode.level}: ${defaultNode.sessionTitle}` : '',
      notes: defaultNode?.objective || '',
    });
    setIsEditModalOpen(true);
  };

  // Helper to open edit modal
  const handleOpenEditSession = (sess: Session) => {
    setEditingSession(sess);
    let dateStr = '';
    let timeStr = '15:00';
    try {
      if (sess.date) {
        const d = new Date(sess.date);
        dateStr = d.toISOString().split('T')[0];
        timeStr = d.toTimeString().substring(0, 5);
      }
    } catch {
      // ignore
    }

    setSessionFormData({
      clientId: sess.clientId,
      sessionNumber: sess.sessionNumber || 1,
      date: dateStr,
      time: timeStr,
      meetLink: sess.meetLink || '',
      status: sess.status || 'scheduled',
      durationMinutes: sess.durationMinutes || 60,
      ontologicalFocus: sess.ontologicalFocus || '',
      notes: sess.notes || '',
    });
    setIsEditModalOpen(true);
  };

  // Save session (create or update)
  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionFormData.clientId) {
      alert('Por favor selecciona un participante.');
      return;
    }

    // Combine date and time to ISO
    let finalIsoDate = new Date().toISOString();
    if (sessionFormData.date) {
      const [year, month, day] = sessionFormData.date.split('-').map(Number);
      const [hour, minute] = sessionFormData.time.split(':').map(Number);
      const combined = new Date(year, month - 1, day, hour || 0, minute || 0);
      finalIsoDate = combined.toISOString();
    }

    const payload: Partial<Session> = {
      clientId: sessionFormData.clientId,
      sessionNumber: Number(sessionFormData.sessionNumber),
      date: finalIsoDate,
      meetLink: sessionFormData.meetLink.trim() || `https://meet.google.com/rbc-${Math.random().toString(36).substring(2, 7)}`,
      status: sessionFormData.status,
      durationMinutes: Number(sessionFormData.durationMinutes) || 60,
      ontologicalFocus: sessionFormData.ontologicalFocus.trim(),
      notes: sessionFormData.notes.trim(),
      isPaid: true,
      programNodeStep: Number(sessionFormData.sessionNumber),
    };

    if (editingSession) {
      OntologicalStore.updateSession(editingSession.id, payload);
    } else {
      const newSession: Session = {
        id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        clientId: sessionFormData.clientId,
        ...payload,
      } as Session;
      OntologicalStore.addSession(newSession);
    }

    refreshAll();
    setIsEditModalOpen(false);
    setEditingSession(null);
  };

  // Quick toggle status (e.g. mark as completed)
  const handleToggleStatus = (sess: Session, newStatus: SessionStatus) => {
    OntologicalStore.updateSession(sess.id, { status: newStatus });
    refreshAll();
  };

  // Delete session with confirmation
  const handleDeleteSession = (sess: Session) => {
    const clientName = clients.find((c) => c.uid === sess.clientId)?.name || 'el participante';
    if (
      window.confirm(
        `¿Confirmas eliminar la Sesión ${sess.sessionNumber || 1} de ${clientName}?\n\nEsta acción se sincronizará inmediatamente con el participante y ya no aparecerá en su panel.`
      )
    ) {
      OntologicalStore.deleteSession(sess.id);
      refreshAll();
    }
  };

  // Generate Full Cycle for a client
  const handleGenerateCycle = () => {
    if (!cycleClientId) {
      alert('Por favor selecciona un participante.');
      return;
    }

    const client = clients.find((c) => c.uid === cycleClientId);
    const start = new Date(cycleStartDate);
    const dayInterval = cycleFrequency === 'weekly' ? 7 : 14;

    const newSessions: Session[] = [];
    for (let i = 1; i <= cycleCount; i++) {
      const sessDate = new Date(start.getTime() + (i - 1) * dayInterval * 24 * 60 * 60 * 1000);
      sessDate.setHours(15, 0, 0, 0);

      const nodeInfo = PROGRAM_NODES.find((n) => n.step === i) || PROGRAM_NODES[0];

      newSessions.push({
        id: `sess-${cycleClientId}-${i}-${Date.now()}`,
        clientId: cycleClientId,
        sessionNumber: i,
        date: sessDate.toISOString(),
        meetLink: `https://meet.google.com/rbc-${(client?.name || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${i}`,
        status: 'scheduled',
        durationMinutes: 60,
        ontologicalFocus: `${nodeInfo.level}: ${nodeInfo.sessionTitle}`,
        notes: `Objetivo: ${nodeInfo.objective}`,
        isPaid: true,
        programNodeStep: i,
      });
    }

    // Save alongside existing sessions for other clients
    const existing = OntologicalStore.getSessions().filter((s) => s.clientId !== cycleClientId);
    OntologicalStore.saveSessions([...existing, ...newSessions]);

    refreshAll();
    setIsCycleModalOpen(false);
    alert(`¡Ciclo de ${cycleCount} sesiones construido y sincronizado con éxito para ${client?.name || 'el participante'}!`);
  };

  // Copy Meet link to clipboard
  const handleCopyMeetLink = (sessId: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLinkSessionId(sessId);
    setTimeout(() => setCopiedLinkSessionId(null), 2000);
  };

  // Format date helper
  const formatSessionDate = (isoString?: string) => {
    if (!isoString) return 'Fecha por coordinar';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatSessionTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // Filtered sessions calculation
  const filteredSessions = useMemo(() => {
    return sessions
      .filter((s) => {
        // Client filter
        if (clientFilter !== 'all' && s.clientId !== clientFilter) return false;

        // Status filter
        if (statusFilter !== 'all') {
          const isCompleted = s.status === 'completed' || s.status === 'Completada';
          if (statusFilter === 'completed' && !isCompleted) return false;
          if (statusFilter === 'scheduled' && (s.status !== 'scheduled' || isCompleted)) return false;
          if (statusFilter === 'cancelled' && s.status !== 'cancelled') return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const client = clients.find((c) => c.uid === s.clientId);
          const clientName = client?.name?.toLowerCase() || '';
          const clientEmail = client?.email?.toLowerCase() || '';
          const focus = s.ontologicalFocus?.toLowerCase() || '';
          const notes = s.notes?.toLowerCase() || '';
          const sessNum = `sesion ${s.sessionNumber || ''}`;

          if (
            !clientName.includes(q) &&
            !clientEmail.includes(q) &&
            !focus.includes(q) &&
            !notes.includes(q) &&
            !sessNum.includes(q)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, clientFilter, statusFilter, searchQuery, clients]);

  // Metric stats
  const scheduledCount = sessions.filter((s) => s.status === 'scheduled').length;
  const completedCount = sessions.filter((s) => s.status === 'completed' || s.status === 'Completada').length;
  const uniqueClientsWithSessions = new Set(sessions.map((s) => s.clientId)).size;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. HEADER EJECUTIVO & RESUMEN */}
      <div className="bg-white dark:bg-[#18181B] rounded-3xl border border-gray-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                <CalendarCheck2 className="w-3 h-3" />
                Sincronización Directa con Participantes
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 dark:text-neutral-400">
                1 a 1 & Acompañamiento Ontológico
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-black dark:text-white mt-1">
              Sesiones de Consultoría
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 font-light max-w-2xl mt-0.5">
              Construye, revisa o elimina sesiones individuales para cada participante. Cualquier cambio, fecha, enlace o nota se sincroniza automáticamente en el portal del cliente.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCycleModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/80 hover:bg-gray-100 dark:hover:bg-neutral-700 text-xs font-semibold text-black dark:text-white cursor-pointer transition-all shadow-2xs"
              title="Construir ciclo completo de 6 o 12 sesiones para un cliente"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Construir Ciclo Completo</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCreateSession()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>+ Nueva Sesión Individual</span>
            </button>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-neutral-800">
          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
              Total Sesiones
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-black dark:text-white">{sessions.length}</span>
              <span className="text-[11px] text-gray-400 font-light">en agenda</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
            <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
              Programadas
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-blue-700 dark:text-blue-300">
                {scheduledCount}
              </span>
              <span className="text-[11px] text-blue-600/70 dark:text-blue-400 font-light">por realizar</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Completadas
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                {completedCount}
              </span>
              <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400 font-light">ejecutadas</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">
              Participantes
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-purple-700 dark:text-purple-300">
                {uniqueClientsWithSessions}
              </span>
              <span className="text-[11px] text-purple-600/70 dark:text-purple-400 font-light">con sesiones</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTROS & BARRA DE BÚSQUEDA */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por participante, enfoque ontológico o notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-black dark:focus:border-white"
          />
        </div>

        {/* Filtro por Participante */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 dark:text-neutral-400 whitespace-nowrap">
            Participante:
          </label>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-xs font-medium text-black dark:text-white focus:outline-hidden"
          >
            <option value="all">Todos los participantes ({clients.length})</option>
            {clients.map((c) => (
              <option key={c.uid} value={c.uid}>
                {c.name} ({sessions.filter((s) => s.clientId === c.uid).length} sesiones)
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Estado (Tabs) */}
        <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200/70 dark:border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-[#202024] text-black dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Todas ({sessions.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'scheduled'
                ? 'bg-white dark:bg-[#202024] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Programadas ({scheduledCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-white dark:bg-[#202024] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Completadas ({completedCount})
          </button>
        </div>
      </div>

      {/* 3. LISTADO DE SESIONES CONSTRUIDAS */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-[#18181B] rounded-3xl border border-dashed border-gray-300 dark:border-neutral-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-400 mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-black dark:text-white">
              No hay sesiones con los filtros actuales
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
              {sessions.length === 0
                ? 'Aún no se han construido sesiones. Crea una sesión individual o genera un ciclo completo para comenzar.'
                : 'Prueba cambiando los filtros de búsqueda o participante para ver más sesiones.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleOpenCreateSession(clientFilter !== 'all' ? clientFilter : undefined)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Construir Primera Sesión</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSessions.map((sess) => {
            const client = clients.find((c) => c.uid === sess.clientId);
            const isCompleted = sess.status === 'completed' || sess.status === 'Completada';
            const nodeInfo = PROGRAM_NODES.find((n) => n.step === sess.sessionNumber) || PROGRAM_NODES[0];

            // Check if participant submitted reflections for this session
            const matchingForm = forms.find(
              (f) => f.clientId === sess.clientId && f.sessionStep === sess.sessionNumber
            );
            const matchingPostForm = postSessionForms.find(
              (f) => f.sessionId === sess.id || (f.clientId === sess.clientId && f.sessionNumber === sess.sessionNumber)
            );

            const hasReflections = Boolean(matchingForm || matchingPostForm);
            const isExpanded = expandedReflectionId === sess.id;

            return (
              <div
                key={sess.id}
                className={`rounded-3xl border transition-all p-5 sm:p-6 bg-white dark:bg-[#18181B] ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10'
                    : 'border-gray-200/90 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 shadow-2xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-neutral-800/80">
                  {/* Participant & Session ID header */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-900/40">
                      S{sess.sessionNumber || 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-black dark:text-white">
                          Sesión {sess.sessionNumber || 1}: {sess.ontologicalFocus || nodeInfo.sessionTitle}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 font-medium">
                          {nodeInfo.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-semibold text-black dark:text-white">
                          {client?.name || 'Participante sin asignar'}
                        </span>
                        {client?.email && <span>• {client.email}</span>}
                        {client?.company && <span>• {client.company}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Status toggle & Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-auto">
                    {/* Status Pill with Toggle */}
                    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(sess, 'scheduled')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          !isCompleted
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-gray-500 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        Programada
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(sess, 'completed')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-gray-500 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>Completada</span>
                      </button>
                    </div>

                    {/* Edit Session */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditSession(sess)}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                      title="Editar o reprogramar sesión"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Session */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(sess)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                      title="Eliminar sesión de forma permanente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Session Body: Date, Meet & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                  {/* Col 1: Fecha y Hora */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-gray-50/70 dark:bg-neutral-900/50 border border-gray-100 dark:border-neutral-800/80">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Fecha y Hora Confirmada
                    </span>
                    <div className="font-bold text-black dark:text-white capitalize flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>{formatSessionDate(sess.date)}</span>
                    </div>
                    <div className="text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatSessionTime(sess.date)} ({sess.durationMinutes || 60} minutos)</span>
                    </div>
                  </div>

                  {/* Col 2: Enlace Google Meet */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-gray-50/70 dark:bg-neutral-900/50 border border-gray-100 dark:border-neutral-800/80 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Sala Google Meet
                      </span>
                      <p className="text-[11px] font-mono text-gray-600 dark:text-neutral-300 truncate mt-0.5">
                        {sess.meetLink || 'Sin enlace configurado'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {sess.meetLink ? (
                        <>
                          <a
                            href={sess.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-[11px] hover:opacity-90 transition-opacity shadow-xs"
                          >
                            <Video className="w-3 h-3 text-emerald-400 dark:text-emerald-600" />
                            <span>Entrar a Meet</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyMeetLink(sess.id, sess.meetLink)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 text-[11px] font-medium cursor-pointer"
                          >
                            {copiedLinkSessionId === sess.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenEditSession(sess)}
                          className="text-[11px] font-medium text-blue-600 dark:text-blue-400 underline cursor-pointer"
                        >
                          + Agregar enlace de Meet
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Col 3: Enfoque y Cuaderno */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-gray-50/70 dark:bg-neutral-900/50 border border-gray-100 dark:border-neutral-800/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                          Cuaderno / Reflexiones
                        </span>
                        {hasReflections ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Respondido
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                            Pendiente
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-neutral-300 font-light line-clamp-2 mt-1">
                        {sess.notes || 'Sin notas preparatorias registradas para esta sesión.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      {hasReflections && (
                        <button
                          type="button"
                          onClick={() => setExpandedReflectionId(isExpanded ? null : sess.id)}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{isExpanded ? 'Ocultar Reflexiones' : 'Revisar Reflexiones'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}

                      {onSelectClientForFicha && client && (
                        <button
                          type="button"
                          onClick={() => onSelectClientForFicha(client.uid)}
                          className="ml-auto text-[11px] font-medium text-gray-500 hover:text-black dark:hover:text-white underline cursor-pointer"
                        >
                          Ver Ficha 1 a 1 →
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Reflections View for this Session */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800 animate-fade-in">
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Reflexiones y Cuaderno Directivo Diligenciado por {client?.name}</span>
                        </h4>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                          {matchingForm?.submittedAt
                            ? new Date(matchingForm.submittedAt).toLocaleDateString('es-ES')
                            : 'Registro oficial'}
                        </span>
                      </div>

                      {matchingForm && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-white/90 dark:bg-[#1E1E22] border border-indigo-100/60 dark:border-neutral-800">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                              Sensación Corporal & Somática
                            </span>
                            <p className="text-gray-800 dark:text-neutral-200 font-light whitespace-pre-wrap">
                              {matchingForm.bodyEmotion || 'Sin registro somático.'}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-white/90 dark:bg-[#1E1E22] border border-indigo-100/60 dark:border-neutral-800">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                              Quiebre Declarado & Reflexiones
                            </span>
                            <p className="text-gray-800 dark:text-neutral-200 font-light whitespace-pre-wrap">
                              {matchingForm.reflections || 'Sin reflexiones registradas.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {matchingPostForm && (
                        <div className="p-3 rounded-xl bg-white/90 dark:bg-[#1E1E22] border border-indigo-100/60 dark:border-neutral-800 text-xs space-y-2">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase block">
                            Evaluación Post-Sesión & Aprendizaje Central
                          </span>
                          <p className="text-gray-800 dark:text-neutral-200 font-light">
                            <strong>Quiebre abordado:</strong> {matchingPostForm.keyBreakthrough || 'N/A'}
                          </p>
                          <p className="text-gray-800 dark:text-neutral-200 font-light">
                            <strong>Compromiso directivo:</strong> {matchingPostForm.actionCommitment || 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CONSTRUIR / EDITAR SESIÓN INDIVIDUAL                             */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl border border-gray-200 dark:border-neutral-800 max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    {editingSession ? 'Revisar / Modificar Sesión' : 'Construir Nueva Sesión Individual'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                    Sincronización en tiempo real con el panel del participante.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4">
              {/* Participante */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Participante / Cliente *
                </label>
                <select
                  required
                  value={sessionFormData.clientId}
                  onChange={(e) => {
                    const newCId = e.target.value;
                    const c = clients.find((u) => u.uid === newCId);
                    setSessionFormData({
                      ...sessionFormData,
                      clientId: newCId,
                      meetLink: `https://meet.google.com/rbc-${(c?.name || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${sessionFormData.sessionNumber}`,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                >
                  <option value="">-- Seleccionar Participante --</option>
                  {clients.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.name} ({c.email}) • Progreso: Nivel {c.programProgress || 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Número de Sesión y Sugerencias de Temario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                    Número de Sesión (1 a 12)
                  </label>
                  <select
                    value={sessionFormData.sessionNumber}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      const node = PROGRAM_NODES.find((n) => n.step === num) || PROGRAM_NODES[0];
                      const c = clients.find((u) => u.uid === sessionFormData.clientId);
                      setSessionFormData({
                        ...sessionFormData,
                        sessionNumber: num,
                        ontologicalFocus: `${node.level}: ${node.sessionTitle}`,
                        notes: node.objective || '',
                        meetLink: `https://meet.google.com/rbc-${(c?.name || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${num}`,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                  >
                    {PROGRAM_NODES.map((node) => (
                      <option key={node.step} value={node.step}>
                        Sesión {node.step} ({node.level}): {node.sessionTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                    Estado de la Sesión
                  </label>
                  <select
                    value={sessionFormData.status}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, status: e.target.value as SessionStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                  >
                    <option value="scheduled">Programada / En Espera</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Fecha, Hora y Duración */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionFormData.date}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    required
                    value={sessionFormData.time}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={180}
                    step={15}
                    value={sessionFormData.durationMinutes}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Enlace Google Meet */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                    Enlace de Google Meet *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const c = clients.find((u) => u.uid === sessionFormData.clientId);
                      const link = `https://meet.google.com/rbc-${(c?.name || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${sessionFormData.sessionNumber}`;
                      setSessionFormData({ ...sessionFormData, meetLink: link });
                    }}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Generar enlace automático RBC
                  </button>
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/..."
                  value={sessionFormData.meetLink}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, meetLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Enfoque Ontológico */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Enfoque Ontológico / Quiebre
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mapeo de la Transparencia y Declaración de Límites"
                  value={sessionFormData.ontologicalFocus}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, ontologicalFocus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Notas Preparatorias */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Notas Preparatorias / Consignas
                </label>
                <textarea
                  rows={3}
                  placeholder="Instrucciones previas, acuerdos o reflexiones para la sesión..."
                  value={sessionFormData.notes}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Botones de guardar */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {editingSession ? 'Guardar Cambios' : 'Construir Sesión & Sincronizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GENERAR CICLO COMPLETO DE SESIONES (1-6 o 1-12)                  */}
      {/* ========================================================================= */}
      {isCycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl border border-gray-200 dark:border-neutral-800 max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Construir Ciclo de Sesiones
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                    Genera el cronograma de 6 o 12 sesiones con temarios ontológicos oficiales.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCycleModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Participante */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Selecciona el Participante *
                </label>
                <select
                  value={cycleClientId}
                  onChange={(e) => setCycleClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                >
                  <option value="">-- Seleccionar Participante --</option>
                  {clients.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cantidad de Sesiones */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                    Cantidad de Sesiones
                  </label>
                  <select
                    value={cycleCount}
                    onChange={(e) => setCycleCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                  >
                    <option value={6}>Ciclo Estándar (6 Sesiones - Nivel I a III)</option>
                    <option value={12}>Ciclo Completo (12 Sesiones - Maestría)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                    Frecuencia
                  </label>
                  <select
                    value={cycleFrequency}
                    onChange={(e) => setCycleFrequency(e.target.value as 'weekly' | 'biweekly')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                  >
                    <option value="biweekly">Quincenal (Cada 14 días)</option>
                    <option value="weekly">Semanal (Cada 7 días)</option>
                  </select>
                </div>
              </div>

              {/* Fecha de Inicio */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Fecha de Inicio de la Primera Sesión
                </label>
                <input
                  type="date"
                  value={cycleStartDate}
                  onChange={(e) => setCycleStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Beneficio de la Construcción Automatizada:</span>
                </div>
                <p className="font-light text-[11px] leading-relaxed">
                  Se asignarán los títulos temáticos oficiales de RBC (Mapeo de Transparencia, Fronteras, Desarticulación de Juicios, Liderazgo, etc.) y se generarán las salas Google Meet correspondientes. Todo se reflejará al instante en el portal del participante.
                </p>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCycleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGenerateCycle}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  Construir Ciclo Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
