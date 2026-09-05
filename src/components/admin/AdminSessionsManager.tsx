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
  Download,
} from 'lucide-react';
import { Session, SessionStatus, User, FormSubmission, PostSessionForm } from '../../types';
import { OntologicalStore } from '../../services/store';
import { FirestoreSyncService } from '../../services/firestoreSync';
import { PostSessionWorkbookModal } from '../PostSessionWorkbookModal';
import { PDFGenerator } from '../../utils/pdfGenerator';

interface AdminSessionsManagerProps {
  onSelectClientForFicha?: (clientId: string) => void;
  onRefreshParent?: () => void;
}

export const AdminSessionsManager: React.FC<AdminSessionsManagerProps> = ({
  onSelectClientForFicha,
  onRefreshParent,
}) => {
  // 1. Estados de Datos
  const [sessions, setSessions] = useState<Session[]>(() => OntologicalStore.getSessions());
  const [users, setUsers] = useState<User[]>(() => OntologicalStore.getUsers());
  const [forms, setForms] = useState<FormSubmission[]>(() => OntologicalStore.getForms());
  const [postSessionForms, setPostSessionForms] = useState<PostSessionForm[]>(() =>
    OntologicalStore.getPostSessionForms()
  );

  // Lista de participantes (clientes)
  const clients = useMemo(
    () => users.filter((u) => u.role === 'client'),
    [users]
  );

  // Sincronización en tiempo real (Eventos locales y Firestore)
  useEffect(() => {
    const handleSync = () => {
      setSessions(OntologicalStore.getSessions());
      setUsers(OntologicalStore.getUsers());
      setForms(OntologicalStore.getForms());
      setPostSessionForms(OntologicalStore.getPostSessionForms());
    };

    window.addEventListener('rbc-sessions-updated', handleSync);
    window.addEventListener('rbc-forms-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('rbc-sessions-updated', handleSync);
      window.removeEventListener('rbc-forms-updated', handleSync);
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

  // 2. Filtros y Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  // Acordeón de cuestionario posterior expandido en tarjeta
  const [expandedFormId, setExpandedFormId] = useState<string | null>(null);

  // Feedback de copiado de enlace Meet
  const [copiedLinkSessionId, setCopiedLinkSessionId] = useState<string | null>(null);

  // 3. Modal de Crear / Editar Sesión Individual (Lienzo en Blanco)
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

  // 4. Modal de Construcción de Ciclo Orgánico (6 o 12 sesiones libres)
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [cycleClientId, setCycleClientId] = useState<string>('');
  const [cycleCount, setCycleCount] = useState<number>(6);
  const [cycleFrequency, setCycleFrequency] = useState<'weekly' | 'biweekly'>('biweekly');
  const [cycleStartDate, setCycleStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  // 5. Modal de Cuestionario Posterior / Bitácora (El Cuestionario como Eje)
  const [isWorkbookModalOpen, setIsWorkbookModalOpen] = useState<boolean>(false);
  const [selectedSessionForWorkbook, setSelectedSessionForWorkbook] = useState<Session | null>(null);
  const [selectedClientForWorkbook, setSelectedClientForWorkbook] = useState<User | null>(null);

  // Apertura de modal de creación con Lienzo en Blanco
  const handleOpenCreateSession = (preselectedClientId?: string) => {
    const targetClientId = preselectedClientId || clients[0]?.uid || '';
    const targetClient = clients.find((c) => c.uid === targetClientId);
    const existingClientSessions = sessions.filter((s) => s.clientId === targetClientId);
    const nextSessionNum = existingClientSessions.length > 0
      ? Math.max(...existingClientSessions.map((s) => s.sessionNumber || 1)) + 1
      : (targetClient?.programProgress || 1);

    const safeNum = Math.min(nextSessionNum, 12);
    const isMilestone = safeNum === 4 || safeNum === 8 || safeNum === 12;
    const cycleNum = Math.ceil(safeNum / 4);

    const d = new Date();
    d.setDate(d.getDate() + 2);
    const dateStr = d.toISOString().split('T')[0];

    setEditingSession(null);
    setSessionFormData({
      clientId: targetClientId,
      sessionNumber: safeNum,
      date: dateStr,
      time: '15:00',
      meetLink: `https://meet.google.com/rbc-${(targetClient?.name || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${safeNum}`,
      status: 'scheduled',
      durationMinutes: 60,
      ontologicalFocus: isMilestone ? `Cierre del Ciclo ${cycleNum} & Cosecha Ontológica` : '',
      notes: isMilestone
        ? 'Cierre de ciclo: consolidación e integración de descubrimientos, patrones recurrentes y cambios de perspectiva observados.'
        : 'Pregunta de apertura: "¿Qué es importante para ti traer a este espacio hoy?". Espacio abierto al emergente del participante.',
    });
    setIsEditModalOpen(true);
  };

  // Apertura de modal de edición
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

  // Guardar sesión (Crear o Actualizar) con sincronización directa en Firestore
  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionFormData.clientId) {
      alert('Por favor selecciona un participante.');
      return;
    }

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

    let savedSession: Session;
    if (editingSession) {
      savedSession = { ...editingSession, ...payload } as Session;
      OntologicalStore.updateSession(editingSession.id, payload);
    } else {
      savedSession = {
        id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        clientId: sessionFormData.clientId,
        ...payload,
      } as Session;
      OntologicalStore.addSession(savedSession);
    }

    // Sincronización en tiempo real a Firestore
    await FirestoreSyncService.syncSession(savedSession);

    refreshAll();
    setIsEditModalOpen(false);
    setEditingSession(null);
  };

  // Cambio rápido de estado (ej: marcar completada)
  const handleToggleStatus = async (sess: Session, newStatus: SessionStatus) => {
    OntologicalStore.updateSession(sess.id, { status: newStatus });
    await FirestoreSyncService.syncSession({ ...sess, status: newStatus });
    refreshAll();
  };

  // Eliminar sesión
  const handleDeleteSession = async (sess: Session) => {
    const clientName = clients.find((c) => c.uid === sess.clientId)?.name || 'el participante';
    if (
      window.confirm(
        `¿Confirmas eliminar la Sesión ${sess.sessionNumber || 1} de ${clientName}?\n\nEsta acción se sincronizará inmediatamente con el participante y ya no aparecerá en su panel.`
      )
    ) {
      OntologicalStore.deleteSession(sess.id);
      await FirestoreSyncService.deleteSession(sess.id);
      refreshAll();
    }
  };

  // Generación de Ciclo Orgánico (Principio de Sesiones Libres)
  const handleGenerateCycle = async () => {
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

      const isMilestone = i === 4 || i === 8 || i === 12;
      const cycleNum = Math.ceil(i / 4);

      const sessionItem: Session = {
        id: `sess-${cycleClientId}-${i}-${Date.now()}`,
        clientId: cycleClientId,
        sessionNumber: i,
        date: sessDate.toISOString(),
        meetLink: `https://meet.google.com/rbc-${(client?.name || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${i}`,
        status: 'scheduled',
        durationMinutes: 60,
        ontologicalFocus: isMilestone
          ? `Cierre del Ciclo ${cycleNum} & Cosecha Ontológica`
          : 'Espacio Abierto • Acompañamiento del Emergente',
        notes: isMilestone
          ? 'Cierre de ciclo: consolidación e integración de descubrimientos, patrones recurrentes y cambios de perspectiva observados.'
          : 'Pregunta de apertura: "¿Qué es importante para ti traer a este espacio hoy?". Espacio abierto al emergente.',
        isPaid: true,
        programNodeStep: i,
      };

      newSessions.push(sessionItem);
    }

    // Persistencia local
    const existing = OntologicalStore.getSessions().filter((s) => s.clientId !== cycleClientId);
    OntologicalStore.saveSessions([...existing, ...newSessions]);

    // Sincronización directa en Firestore
    for (const sess of newSessions) {
      await FirestoreSyncService.syncSession(sess);
    }

    refreshAll();
    setIsCycleModalOpen(false);
    alert(`¡Ciclo de ${cycleCount} sesiones construido con espacio abierto al emergente y sincronizado con éxito para ${client?.name || 'el participante'}!`);
  };

  // Copiar enlace de Google Meet
  const handleCopyMeetLink = (sessId: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLinkSessionId(sessId);
    setTimeout(() => setCopiedLinkSessionId(null), 2500);
  };

  // Abrir Cuestionario Posterior / Bitácora para registrar o editar
  const handleOpenWorkbook = (sess: Session) => {
    const client = clients.find((c) => c.uid === sess.clientId);
    setSelectedSessionForWorkbook(sess);
    setSelectedClientForWorkbook(client || null);
    setIsWorkbookModalOpen(true);
  };

  // Descargar memoria de sesión en PDF
  const handleDownloadMemory = (form: PostSessionForm, sess: Session) => {
    const client = clients.find((c) => c.uid === sess.clientId);
    if (!client) {
      alert('No se encontró el participante asociado.');
      return;
    }
    PDFGenerator.generateSessionWorkbookPDF(form, client, sess);
  };

  // Filtrado de sesiones
  const filteredSessions = useMemo(() => {
    return sessions
      .filter((s) => {
        if (clientFilter !== 'all' && s.clientId !== clientFilter) return false;
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const clientName = clients.find((c) => c.uid === s.clientId)?.name?.toLowerCase() || '';
          const focus = (s.ontologicalFocus || '').toLowerCase();
          const notes = (s.notes || '').toLowerCase();
          const meet = (s.meetLink || '').toLowerCase();
          return (
            clientName.includes(q) ||
            focus.includes(q) ||
            notes.includes(q) ||
            meet.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return timeA - timeB;
      });
  }, [sessions, clientFilter, statusFilter, searchQuery, clients]);

  // Formateadores humanos de fecha y hora
  const formatSessionDate = (dateStr?: string) => {
    if (!dateStr) return 'Por coordinar';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatSessionTime = (dateStr?: string) => {
    if (!dateStr) return '--:--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--:--';
    }
  };

  // Métricas
  const scheduledCount = sessions.filter((s) => s.status === 'scheduled').length;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const uniqueClientsWithSessions = new Set(sessions.map((s) => s.clientId)).size;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. CABECERA DEL EDITOR: IDENTIDAD B&W DE ALTO CONTRASTE                   */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white dark:bg-black border border-black/10 dark:border-white/10 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 dark:text-neutral-400">
                Acompañamiento 1 a 1 • Espacio Abierto
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-black/10 dark:border-white/10">
                Lienzo en Blanco
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-black dark:text-white mt-1">
              Editor de Sesiones Individuales
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5 max-w-2xl leading-relaxed">
              Las sesiones fluyen sin agendas rígidas para honrar el emergente del cliente. El cuestionario posterior consolida el registro de descubrimientos, compromisos y cosechas cada 4 encuentros.
            </p>
          </div>

          {/* Acciones principales */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCycleModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-black dark:text-white cursor-pointer transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span>Construir Ciclo de Sesiones</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCreateSession()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-bold shadow-xs cursor-pointer transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nueva Sesión Individual</span>
            </button>
          </div>
        </div>

        {/* Métricas: Contenedores Transparentes Jerárquicos en B&W */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-5 border-t border-black/10 dark:border-white/10">
          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block font-mono">
              Total Sesiones
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-black dark:text-white">{sessions.length}</span>
              <span className="text-[11px] text-neutral-400 font-light">en agenda</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-black/15 dark:border-white/15">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block font-mono">
              Programadas
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-black dark:text-white">{scheduledCount}</span>
              <span className="text-[11px] text-neutral-400 font-light">por realizar</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-black/15 dark:border-white/15">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block font-mono">
              Completadas
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-black dark:text-white">{completedCount}</span>
              <span className="text-[11px] text-neutral-400 font-light">ejecutadas</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block font-mono">
              Participantes
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-black dark:text-white">{uniqueClientsWithSessions}</span>
              <span className="text-[11px] text-neutral-400 font-light">en proceso</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTROS Y BÚSQUEDA                                                     */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por participante, notas o emergente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 text-xs text-black dark:text-white placeholder-neutral-400 focus:outline-hidden focus:border-black dark:focus:border-white"
          />
        </div>

        {/* Filtro por Participante */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
            Participante:
          </label>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 text-xs font-medium text-black dark:text-white focus:outline-hidden"
          >
            <option value="all">Todos los participantes ({clients.length})</option>
            {clients.map((c) => (
              <option key={c.uid} value={c.uid}>
                {c.name} ({sessions.filter((s) => s.clientId === c.uid).length} sesiones)
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Estado */}
        <div className="flex items-center gap-1.5 border-t md:border-t-0 md:border-l border-black/10 dark:border-white/10 pt-2 md:pt-0 md:pl-3">
          {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-white dark:bg-black text-neutral-600 dark:text-neutral-400 border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {st === 'all' && 'Todas'}
              {st === 'scheduled' && 'Programadas'}
              {st === 'completed' && 'Completadas'}
              {st === 'cancelled' && 'Canceladas'}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LISTADO DE SESIONES: DISEÑO LIMPIO Y HUMANIZADO                         */}
      {/* ========================================================================= */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-black/10 dark:border-white/10 space-y-3">
          <Calendar className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-semibold text-black dark:text-white">
            No se encontraron sesiones con estos filtros
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Puedes registrar una nueva sesión en blanco para cualquier participante o construir su ciclo de encuentros.
          </p>
          <button
            type="button"
            onClick={() => handleOpenCreateSession()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Sesión en Blanco</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((sess) => {
            const client = clients.find((c) => c.uid === sess.clientId);
            const sessNumber = sess.sessionNumber || 1;
            const isMilestone = sessNumber === 4 || sessNumber === 8 || sessNumber === 12;
            const cycleNum = Math.ceil(sessNumber / 4);

            // Cuestionario posterior correspondiente
            const matchingForm =
              postSessionForms.find((f) => f.sessionId === sess.id) ||
              postSessionForms.find(
                (f) => f.clientId === sess.clientId && f.sessionNumber === sessNumber
              );

            const hasPostForm = !!matchingForm;
            const isExpanded = expandedFormId === sess.id;

            return (
              <div
                key={sess.id}
                className={`p-5 rounded-2xl bg-white dark:bg-black border transition-all ${
                  isMilestone
                    ? 'border-black dark:border-white shadow-xs'
                    : 'border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25'
                }`}
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    {/* Fotografía a color del participante (Único elemento cromático) */}
                    <img
                      src={
                        client?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={client?.name || 'Participante'}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-black/10 dark:border-white/10 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-black dark:text-white">
                          {client?.name || 'Participante Sin Asignar'}
                        </span>
                        <span className="text-neutral-400">•</span>
                        <span className="text-xs font-semibold text-black dark:text-white font-mono">
                          Sesión {sessNumber} de 12
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
                          {isMilestone ? `★ Cierre de Ciclo ${cycleNum}` : `Ciclo ${cycleNum} • Exploración Libre`}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                        {sess.ontologicalFocus || (isMilestone ? 'Cierre de Ciclo & Cosecha Ontológica' : 'Espacio Abierto al Emergente (Lienzo en Blanco)')}
                      </p>
                    </div>
                  </div>

                  {/* Estado y Acciones Rápidas */}
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    {/* Botón de Estado */}
                    <div className="flex items-center rounded-xl border border-black/10 dark:border-white/10 p-0.5 bg-neutral-50 dark:bg-neutral-900">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(sess, 'scheduled')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                          sess.status === 'scheduled'
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'text-neutral-500 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        Programada
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(sess, 'completed')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                          sess.status === 'completed'
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'text-neutral-500 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        Completada
                      </button>
                    </div>

                    {/* Editar */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditSession(sess)}
                      className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                      title="Editar sesión"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Eliminar */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(sess)}
                      className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      title="Eliminar sesión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cuerpo de la Sesión: 3 Bloques Sin Ruido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 text-xs">
                  {/* Bloque 1: Fecha y Hora */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 space-y-1.5">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block font-mono">
                      Fecha y Hora
                    </span>
                    <div className="font-semibold text-black dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatSessionDate(sess.date)}</span>
                    </div>
                    <div className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatSessionTime(sess.date)} ({sess.durationMinutes || 60} min)</span>
                    </div>
                  </div>

                  {/* Bloque 2: Sala Google Meet */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block font-mono">
                        Sala Google Meet
                      </span>
                      <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-300 truncate mt-0.5">
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-[11px] hover:opacity-90 transition-opacity"
                          >
                            <Video className="w-3 h-3" />
                            <span>Entrar</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyMeetLink(sess.id, sess.meetLink)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] font-medium cursor-pointer"
                          >
                            {copiedLinkSessionId === sess.id ? (
                              <>
                                <Check className="w-3 h-3" />
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
                          className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 underline cursor-pointer"
                        >
                          + Agregar enlace de Meet
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bloque 3: Cuestionario Posterior (Eje de Captura) */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block font-mono">
                          Cuestionario Posterior
                        </span>
                        {hasPostForm ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-black dark:text-white bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10">
                            <CheckCircle2 className="w-3 h-3" />
                            Registrado
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10">
                            Pendiente
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light line-clamp-2 mt-1">
                        {hasPostForm
                          ? `Emergente: "${matchingForm?.emergentTopic || matchingForm?.masterJudgmentAndNarrative || 'Sin título'}"`
                          : (sess.notes || 'Espacio abierto al emergente. El cuestionario posterior capturará los descubrimientos.')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenWorkbook(sess)}
                        className="text-[11px] font-semibold text-black dark:text-white underline flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>{hasPostForm ? 'Editar Cuestionario' : 'Diligenciar Cuestionario'}</span>
                      </button>

                      {hasPostForm && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedFormId(isExpanded ? null : sess.id)}
                            className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Ocultar' : 'Ver detalle'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadMemory(matchingForm!, sess)}
                            className="p-1 rounded-lg border border-black/10 dark:border-white/10 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-black dark:text-white cursor-pointer"
                            title="Descargar Memoria en PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acordeón de Detalle del Cuestionario Posterior */}
                {isExpanded && matchingForm && (
                  <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 space-y-3 animate-fade-in">
                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px] font-mono">
                          Registro del Cuestionario Posterior • Sesión {sessNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownloadMemory(matchingForm, sess)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-black dark:text-white underline cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Descargar Memoria (PDF)</span>
                        </button>
                      </div>

                      <div className="space-y-2 text-neutral-700 dark:text-neutral-300">
                        <div>
                          <strong className="text-black dark:text-white block font-medium">Tema Emergente de la Sesión:</strong>
                          <p className="mt-0.5 font-light">
                            {matchingForm.emergentTopic || matchingForm.masterJudgmentAndNarrative || 'No especificado.'}
                          </p>
                        </div>

                        {matchingForm.discovery && (
                          <div>
                            <strong className="text-black dark:text-white block font-medium">Descubrimiento / Quiebre Ontológico:</strong>
                            <p className="mt-0.5 font-light">{matchingForm.discovery}</p>
                          </div>
                        )}

                        <div>
                          <strong className="text-black dark:text-white block font-medium">Paso a la Acción Acordado:</strong>
                          <p className="mt-0.5 font-light">
                            {matchingForm.actionStep || matchingForm.agreedActionItems?.[0] || 'No especificado.'}
                          </p>
                        </div>

                        {matchingForm.cycleHarvest && (
                          <div className="p-3 rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/10">
                            <strong className="text-black dark:text-white block font-medium">
                              ★ Cosecha del Ciclo (Sesión {sessNumber}):
                            </strong>
                            <p className="mt-0.5 font-light">{matchingForm.cycleHarvest}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREAR / EDITAR SESIÓN INDIVIDUAL (LIENZO EN BLANCO)               */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#121214] rounded-3xl border border-black/10 dark:border-white/10 max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  {editingSession ? 'Editar Sesión' : 'Nueva Sesión Individual'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light mt-0.5">
                  Principio de Sesiones Libres: Sin agendas rígidas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
              {/* Notificación del Principio de Sesiones Libres */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 space-y-1">
                <span className="font-semibold text-black dark:text-white block font-mono text-[11px]">
                  Lienzo en Blanco
                </span>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                  Este espacio nace completamente abierto al emergente del cliente. El cuestionario posterior cumplirá el rol fundamental de registrar los descubrimientos, acuerdos y cosechas.
                </p>
              </div>

              {/* Participante */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Participante *
                </label>
                <select
                  value={sessionFormData.clientId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    const c = clients.find((u) => u.uid === newId);
                    setSessionFormData({
                      ...sessionFormData,
                      clientId: newId,
                      meetLink: `https://meet.google.com/rbc-${(c?.name || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${sessionFormData.sessionNumber}`,
                    });
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 font-medium text-black dark:text-white focus:outline-hidden"
                >
                  <option value="">-- Seleccionar Participante --</option>
                  {clients.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Número de Sesión (1 a 12) */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Estación / Número de Sesión en el Camino
                </label>
                <select
                  value={sessionFormData.sessionNumber}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    const isMilestone = num === 4 || num === 8 || num === 12;
                    const cycleNum = Math.ceil(num / 4);
                    const c = clients.find((u) => u.uid === sessionFormData.clientId);

                    setSessionFormData({
                      ...sessionFormData,
                      sessionNumber: num,
                      ontologicalFocus: isMilestone ? `Cierre del Ciclo ${cycleNum} & Cosecha Ontológica` : '',
                      notes: isMilestone
                        ? 'Cierre de ciclo: integración de descubrimientos, patrones recurrentes y cambios de perspectiva observados.'
                        : 'Pregunta de apertura: "¿Qué es importante para ti traer a este espacio hoy?". Espacio abierto al emergente del participante.',
                      meetLink: `https://meet.google.com/rbc-${(c?.name || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${num}`,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 font-medium text-black dark:text-white focus:outline-hidden"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                    const cycleNum = Math.ceil(num / 4);
                    const isMilestone = num === 4 || num === 8 || num === 12;
                    return (
                      <option key={num} value={num}>
                        Sesión {num} • Ciclo {cycleNum} {isMilestone ? '(★ Cierre de Ciclo & Cosecha)' : '(Exploración Libre)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Fecha de la Sesión *
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionFormData.date}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Hora (24h) *
                  </label>
                  <input
                    type="time"
                    required
                    value={sessionFormData.time}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Enlace Google Meet */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Enlace Google Meet
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={sessionFormData.meetLink}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, meetLink: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 font-mono text-black dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Tema Emergente / Enfoque (Opcional) */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tema Emergente u Orientación Inicial (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Dejar en blanco para espacio libre u orientar si ya fue conversado..."
                  value={sessionFormData.ontologicalFocus}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, ontologicalFocus: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Notas Preparatorias */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Notas de Apertura o Acuerdos Previos
                </label>
                <textarea
                  rows={2}
                  placeholder="Pregunta de apertura o notas para el encuentro..."
                  value={sessionFormData.notes}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden resize-none"
                />
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold hover:opacity-90 cursor-pointer transition-opacity"
                >
                  {editingSession ? 'Guardar Cambios' : 'Guardar y Sincronizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GENERAR CICLO COMPLETO DE SESIONES LIBRES                        */}
      {/* ========================================================================= */}
      {isCycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#121214] rounded-3xl border border-black/10 dark:border-white/10 max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Construir Ciclo de Sesiones
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light">
                    Genera el cronograma con espacio abierto al emergente del cliente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCycleModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Participante */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Selecciona el Participante *
                </label>
                <select
                  value={cycleClientId}
                  onChange={(e) => setCycleClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 font-medium text-black dark:text-white focus:outline-hidden"
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
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Cantidad de Sesiones
                  </label>
                  <select
                    value={cycleCount}
                    onChange={(e) => setCycleCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 font-medium text-black dark:text-white focus:outline-hidden"
                  >
                    <option value={4}>1 Ciclo (4 Sesiones con Cierre en S4)</option>
                    <option value={8}>2 Ciclos (8 Sesiones con Cierres en S4 y S8)</option>
                    <option value={12}>3 Ciclos (12 Sesiones - Proceso Completo)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Frecuencia
                  </label>
                  <select
                    value={cycleFrequency}
                    onChange={(e) => setCycleFrequency(e.target.value as 'weekly' | 'biweekly')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 font-medium text-black dark:text-white focus:outline-hidden"
                  >
                    <option value="biweekly">Quincenal (Cada 14 días)</option>
                    <option value="weekly">Semanal (Cada 7 días)</option>
                  </select>
                </div>
              </div>

              {/* Fecha de Inicio */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Fecha de Inicio de la Primera Sesión
                </label>
                <input
                  type="date"
                  value={cycleStartDate}
                  onChange={(e) => setCycleStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 font-medium text-black dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 space-y-1">
                <span className="font-semibold text-black dark:text-white block font-mono text-[11px]">
                  Flujo del Ciclo:
                </span>
                <p className="font-light text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Las sesiones se crearán con espacio abierto al emergente y pregunta de apertura ontológica. Los encuentros 4, 8 y 12 se marcarán automáticamente como "Cierre de Ciclo & Cosecha Ontológica".
                </p>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCycleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGenerateCycle}
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold hover:opacity-90 cursor-pointer transition-opacity"
                >
                  Construir Ciclo Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CUESTIONARIO POSTERIOR / BITÁCORA (EL EJE DE CAPTURA)             */}
      {/* ========================================================================= */}
      {isWorkbookModalOpen && selectedSessionForWorkbook && selectedClientForWorkbook && (
        <PostSessionWorkbookModal
          isOpen={isWorkbookModalOpen}
          onClose={() => {
            setIsWorkbookModalOpen(false);
            setSelectedSessionForWorkbook(null);
            setSelectedClientForWorkbook(null);
          }}
          session={selectedSessionForWorkbook}
          client={selectedClientForWorkbook}
          isParticipant={false}
          onFormSaved={() => {
            refreshAll();
          }}
        />
      )}
    </div>
  );
};
