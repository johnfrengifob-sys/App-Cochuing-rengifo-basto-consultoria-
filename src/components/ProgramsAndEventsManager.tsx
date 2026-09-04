import React, { useState, useEffect } from 'react';
import {
  CronogramaEvent,
  OntologicalProgram,
  EventRegistration,
  EventCategory,
  WorkshopWorkbookSubmission,
} from '../types';
import { OntologicalStore } from '../services/store';
import {
  Calendar,
  Clock,
  Video,
  Users,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Star,
  ExternalLink,
  Search,
  Ticket,
  UserPlus,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Copy,
  CheckCheck,
  Award,
  Link as LinkIcon,
  Check,
  FileText,
  Download,
  BookOpen,
  FileCheck,
  Eye,
  EyeOff,
  ChevronRight,
  Shield,
  Filter,
} from 'lucide-react';
import { EventGeneralConfigSection } from './admin/events/EventGeneralConfigSection';
import { EventContentSyllabusSection } from './admin/events/EventContentSyllabusSection';
import { EventEvaluationWorkbookSection } from './admin/events/EventEvaluationWorkbookSection';
import {
  downloadWorkshopNotebookPdf,
  generateWorkshopNotebookPdf,
} from '../services/notebookPdfGenerator';

interface ProgramsAndEventsManagerProps {
  cronogramaEvents: CronogramaEvent[];
  programs?: OntologicalProgram[];
  eventRegistrations?: EventRegistration[];
  onRefreshEvents: () => void;
  onRefreshPrograms?: () => void;
  onRefreshRegistrations?: () => void;
  onOpenRegistrationPortal?: () => void;
  initialSubTab?: 'events' | 'participants' | 'editor' | 'workbooks' | 'banner' | string;
}

export const ProgramsAndEventsManager: React.FC<ProgramsAndEventsManagerProps> = ({
  cronogramaEvents = [],
  programs = [],
  eventRegistrations = [],
  onRefreshEvents,
  onRefreshPrograms,
  onRefreshRegistrations,
  onOpenRegistrationPortal,
  initialSubTab = 'events',
}) => {
  const safeEvents = Array.isArray(cronogramaEvents) ? cronogramaEvents : [];
  const safeRegistrations = Array.isArray(eventRegistrations) ? eventRegistrations : [];

  // Active navigation sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'events' | 'editor' | 'workbooks' | 'participants'>(() => {
    if (initialSubTab === 'participants') return 'participants';
    if (initialSubTab === 'editor') return 'editor';
    if (initialSubTab === 'workbooks') return 'workbooks';
    return 'events';
  });

  useEffect(() => {
    if (initialSubTab === 'participants') setActiveSubTab('participants');
    else if (initialSubTab === 'editor') setActiveSubTab('editor');
    else if (initialSubTab === 'workbooks') setActiveSubTab('workbooks');
  }, [initialSubTab]);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'home' | 'internal'>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Master Google Meet Room State
  const defaultMeet = safeEvents[0]?.meetUrl || 'https://meet.google.com/rbc-conversatorio-ontologico';
  const [masterMeetUrl, setMasterMeetUrl] = useState<string>(() => {
    return localStorage.getItem('rbc_master_meet_url') || defaultMeet;
  });
  const [isEditingMasterMeet, setIsEditingMasterMeet] = useState(false);
  const [tempMasterMeet, setTempMasterMeet] = useState(masterMeetUrl);
  const [copiedMeetFeedback, setCopiedMeetFeedback] = useState(false);

  // Editor states (for creating or editing an event with the 3 sections)
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editorActiveSection, setEditorActiveSection] = useState<'general' | 'content' | 'evaluation'>('general');
  const [eventFormData, setEventFormData] = useState<Partial<CronogramaEvent>>({
    title: '',
    subtitle: '',
    eventType: 'Taller',
    category: 'Primer Taller • En Vivo',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    displayDate: '',
    time: '7:00 PM - 8:30 PM (GMT-5)',
    mode: 'Online (Google Meet)',
    meetUrl: masterMeetUrl,
    description: '',
    imageUrl: '',
    coverImage: '',
    showOnHome: true,
    capacityType: 'grupal',
    capacity: 30,
    priceAmount: 180000,
    price: '$180.000 COP',
    launchDate: new Date().toISOString().split('T')[0],
    facilitator: 'John Fredy Rengifo Basto (Master Coach Ontológico)',
    spotsLeft: 20,
    totalSpots: 30,
    featured: true,
    status: 'upcoming',
    syllabus: [],
    guidingQuestions: [],
    supportMaterials: [],
    postWorkshopQuestions: [],
    workbookSubmissions: [],
  });

  // Modal: Manual Participant Registration
  const [isManualRegModalOpen, setIsManualRegModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEventId, setRegEventId] = useState(safeEvents[0]?.id || '');
  const [regAttended, setRegAttended] = useState(false);

  // Filtered events
  const filteredEvents = safeEvents.filter((evt) => {
    const matchesSearch =
      (evt.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.eventType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.facilitator || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isHome = evt.showOnHome ?? true;
    const matchesVisibility =
      filterVisibility === 'all'
        ? true
        : filterVisibility === 'home'
        ? isHome
        : !isHome;

    const matchesType =
      filterType === 'all'
        ? true
        : (evt.eventType || evt.category || '').toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesVisibility && matchesType;
  });

  // Quick stats
  const totalEventsCount = safeEvents.length;
  const homeFeaturedCount = safeEvents.filter((e) => e.showOnHome ?? true).length;
  const internalCount = safeEvents.filter((e) => (e.showOnHome ?? true) === false).length;
  const totalSubmissionsCount = safeEvents.reduce(
    (acc, curr) => acc + (curr.workbookSubmissions?.length || 0),
    0
  );

  // Handlers for Google Meet
  const handleCopyMasterMeet = () => {
    navigator.clipboard.writeText(masterMeetUrl);
    setCopiedMeetFeedback(true);
    setTimeout(() => setCopiedMeetFeedback(false), 2500);
  };

  const handleSaveMasterMeet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempMasterMeet.trim()) return;
    localStorage.setItem('rbc_master_meet_url', tempMasterMeet.trim());
    setMasterMeetUrl(tempMasterMeet.trim());
    setIsEditingMasterMeet(false);
  };

  // Open New Event
  const handleOpenCreateEvent = () => {
    setEditingEventId(null);
    setEditorActiveSection('general');
    setEventFormData({
      title: '',
      subtitle: '',
      eventType: 'Taller',
      category: 'Primer Taller • En Vivo',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      displayDate: 'Jueves Próximo (En Vivo)',
      time: '7:00 PM - 8:30 PM (GMT-5)',
      mode: 'Online (Google Meet)',
      meetUrl: masterMeetUrl,
      description: 'Inmersión ontológica en vivo para abordar quiebres, deconstrucción somática y soberanía relacional.',
      imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1000&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1000&auto=format&fit=crop&q=80',
      showOnHome: true,
      capacityType: 'grupal',
      capacity: 30,
      priceAmount: 180000,
      price: '$180.000 COP',
      launchDate: new Date().toISOString().split('T')[0],
      facilitator: 'John Fredy Rengifo Basto (Master Coach Ontológico)',
      spotsLeft: 25,
      totalSpots: 30,
      featured: true,
      status: 'upcoming',
      syllabus: [
        {
          id: 'syl-' + Date.now() + '-1',
          title: 'Bloque 1: Mapeo de la Transparencia y Quiebres Inconscientes',
          duration: '30 min',
          description: 'Identificación de mandatos automáticos y exigencias descalificadoras.',
        },
        {
          id: 'syl-' + Date.now() + '-2',
          title: 'Bloque 2: Decodificación Somática del Miedo y la Culpa',
          duration: '35 min',
          description: 'Lectura corporal y reencuadre de la vulnerabilidad en el liderazgo.',
        },
      ],
      guidingQuestions: [
        '¿En qué áreas estás diciendo "Sí" por complacencia cuando tu cuerpo grita "Basta"?',
        '¿Cuál es el costo somático y relacional de intentar controlarlo todo?',
      ],
      supportMaterials: [
        {
          id: 'mat-' + Date.now() + '-1',
          title: 'Guía de Trabajo: Protocolo de Soberanía Ontológica (PDF)',
          type: 'pdf',
          url: 'https://rbc.edu.co/recursos/protocolo-soberania-ontologica.pdf',
          sizeOrDuration: '2.1 MB',
        },
      ],
      postWorkshopQuestions: [
        {
          id: 'pwq-1',
          question: '¿Cuál fue el quiebre principal que descubriste en esta sesión?',
          type: 'textarea',
          category: 'reflexion',
          required: true,
        },
        {
          id: 'pwq-2',
          question: '¿Qué sensación corporal o mensaje somático lograste decodificar?',
          type: 'textarea',
          category: 'somatica',
          required: true,
        },
        {
          id: 'pwq-3',
          question: '¿A qué compromiso o nuevo acuerdo te declaras leal para esta semana?',
          type: 'textarea',
          category: 'compromiso',
          required: true,
        },
      ],
      workbookSubmissions: [],
    });
    setActiveSubTab('editor');
  };

  // Open Edit Event
  const handleOpenEditEvent = (evt: CronogramaEvent) => {
    setEditingEventId(evt.id);
    setEditorActiveSection('general');
    setEventFormData({
      ...evt,
      showOnHome: evt.showOnHome ?? true,
      capacityType: evt.capacityType || (evt.totalSpots === 1 ? 'individual' : 'grupal'),
      capacity: evt.capacity || evt.totalSpots || 25,
      priceAmount: evt.priceAmount !== undefined ? evt.priceAmount : 180000,
      launchDate: evt.launchDate || (evt.date ? evt.date.split('T')[0] : ''),
    });
    setActiveSubTab('editor');
  };

  // Save Event from Editor
  const handleSaveEditorEvent = () => {
    if (!eventFormData.title?.trim()) {
      alert('Por favor especifica el nombre del evento o taller.');
      setEditorActiveSection('general');
      return;
    }

    const payload: Partial<CronogramaEvent> = {
      ...eventFormData,
      totalSpots: eventFormData.capacity || eventFormData.totalSpots || 25,
      spotsLeft: eventFormData.spotsLeft !== undefined ? eventFormData.spotsLeft : (eventFormData.capacity || 25),
      featured: eventFormData.showOnHome ?? true,
    };

    if (editingEventId) {
      OntologicalStore.updateCronogramaEvent(editingEventId, payload);
    } else {
      OntologicalStore.addCronogramaEvent(payload as Omit<CronogramaEvent, 'id'>);
    }

    onRefreshEvents();
    setActiveSubTab('events');
    setEditingEventId(null);
  };

  // Delete Event
  const handleDeleteEvent = (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el taller o evento "${title}"? Esta acción no se puede deshacer.`)) {
      OntologicalStore.deleteCronogramaEvent(id);
      onRefreshEvents();
      if (editingEventId === id) {
        setActiveSubTab('events');
        setEditingEventId(null);
      }
    }
  };

  // Duplicate Event
  const handleDuplicateEvent = (evt: CronogramaEvent) => {
    const duplicated: Omit<CronogramaEvent, 'id'> = {
      ...evt,
      title: `${evt.title} (Copia)`,
      showOnHome: false,
      featured: false,
      workbookSubmissions: [],
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      displayDate: 'Próxima Fecha a Definir',
    };
    OntologicalStore.addCronogramaEvent(duplicated);
    onRefreshEvents();
  };

  // Manual participant registration submit
  const handleSaveManualRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regEventId) return;

    const result = OntologicalStore.registerForEvent({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim() || '+57 300 000 0000',
      eventId: regEventId,
    });

    if (regAttended && result?.registration?.id) {
      OntologicalStore.updateEventRegistration(result.registration.id, { attendedEvent: true });
    }

    onRefreshRegistrations?.();
    onRefreshEvents();
    setIsManualRegModalOpen(false);
    setRegName('');
    setRegEmail('');
    setRegPhone('');
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER EJECUTIVO & MÉTRICAS PRINCIPALES */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                Módulo Oficial RBC
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 dark:text-neutral-400">
                Gestión de Talleres, Temarios y Cuadernos
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white mt-1">
              Eventos y Sesiones
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 font-light max-w-2xl mt-0.5">
              Administra los talleres ontológicos, define sus temarios pedagógicos, preguntas guía y compila automáticamente las evaluaciones en cuadernos descargables en formato PDF.
            </p>
          </div>

          {/* Botones de acción directos */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenRegistrationPortal && (
              <button
                type="button"
                onClick={onOpenRegistrationPortal}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-xs font-semibold text-black dark:text-white cursor-pointer transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Portal Público</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenCreateEvent}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Evento o Taller</span>
            </button>
          </div>
        </div>

        {/* BARRAS DE MÉTRICAS RÁPIDAS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-neutral-800">
          <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800/80">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
              Total Talleres
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-black text-black dark:text-white">
                {totalEventsCount}
              </span>
              <span className="text-[11px] text-gray-400 font-light">creados</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Portada Principal
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                {homeFeaturedCount}
              </span>
              <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400 font-light">
                en Home
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800/80">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
              Solo Internos
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-black text-neutral-700 dark:text-neutral-300">
                {internalCount}
              </span>
              <span className="text-[11px] text-gray-400 font-light">privados</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
            <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
              Cuadernos PDF
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                {totalSubmissionsCount}
              </span>
              <span className="text-[11px] text-indigo-600/70 dark:text-indigo-400 font-light">
                generados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE NAVEGACIÓN ENTRE SUB-PESTAÑAS */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shrink-0">
          {/* Pestaña Catálogo */}
          <button
            type="button"
            onClick={() => setActiveSubTab('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'events'
                ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Eventos y Talleres</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-neutral-700 font-mono">
              {safeEvents.length}
            </span>
          </button>

          {/* Pestaña Editor */}
          <button
            type="button"
            onClick={() => {
              if (!editingEventId && safeEvents.length > 0) {
                handleOpenEditEvent(safeEvents[0]);
              } else {
                setActiveSubTab('editor');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'editor'
                ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
            <span>Editor del Taller</span>
            {editingEventId && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                Editando
              </span>
            )}
          </button>

          {/* Pestaña Cuadernos Descargables */}
          <button
            type="button"
            onClick={() => setActiveSubTab('workbooks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'workbooks'
                ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>Cuadernos y Memorias</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono">
              PDF
            </span>
          </button>

          {/* Pestaña Asistentes */}
          <button
            type="button"
            onClick={() => setActiveSubTab('participants')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'participants'
                ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Asistentes & Sala Meet</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-neutral-700 font-mono">
              {safeRegistrations.length}
            </span>
          </button>
        </div>

        {/* Botón rápido para abrir editor nuevo */}
        {activeSubTab !== 'editor' && (
          <button
            type="button"
            onClick={handleOpenCreateEvent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Taller</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: CATÁLOGO DE EVENTOS Y TALLERES                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'events' && (
        <div className="space-y-4">
          {/* Barra de Búsqueda y Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-gray-200 dark:border-neutral-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, facilitador, tipo..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/60 dark:bg-neutral-800/60 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Filtro Visibilidad */}
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white cursor-pointer"
              >
                <option value="all">Todas las visibilidades</option>
                <option value="home">Destacados en Home</option>
                <option value="internal">Solo Internos / Privados</option>
              </select>

              <button
                type="button"
                onClick={handleOpenCreateEvent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo</span>
              </button>
            </div>
          </div>

          {/* Grilla de Tarjetas de Talleres y Eventos */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEvents.map((evt) => {
                const isHome = evt.showOnHome ?? true;
                const capacity = evt.capacity || evt.totalSpots || 25;
                const capacityType = evt.capacityType || (capacity === 1 ? 'individual' : 'grupal');
                const priceFormatted = evt.price || (evt.priceAmount ? `$${evt.priceAmount.toLocaleString()} COP` : 'Acceso Libre');
                const cover = evt.coverImage || evt.imageUrl || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1000&auto=format&fit=crop&q=80';
                const submissionsCount = evt.workbookSubmissions?.length || 0;

                return (
                  <div
                    key={evt.id}
                    className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:border-gray-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Portada con Insignias de Portada e Identidad */}
                      <div className="relative aspect-video sm:aspect-21/9 overflow-hidden bg-neutral-950">
                        <img
                          src={cover}
                          alt={evt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-between text-white">
                          <div className="flex items-center justify-between gap-2">
                            {/* Tipo de Módulo / Evento */}
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                              {evt.eventType || evt.category || 'Taller'}
                            </span>

                            {/* Tag: Portada Principal vs Solo Interno */}
                            {isHome ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/90 text-white backdrop-blur-md shadow-xs">
                                <Eye className="w-3 h-3" />
                                <span>Visible en Home</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-neutral-800/90 text-neutral-300 backdrop-blur-md border border-white/10">
                                <EyeOff className="w-3 h-3" />
                                <span>Solo Interno</span>
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-[11px] font-mono text-emerald-300 block font-medium">
                              {evt.displayDate || (evt.date ? evt.date.split('T')[0] : 'Fecha por definir')} • {evt.time}
                            </span>
                            <h3 className="text-base font-bold text-white line-clamp-1 mt-0.5">
                              {evt.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Cuerpo de la Tarjeta */}
                      <div className="p-5 space-y-4">
                        {evt.subtitle && (
                          <p className="text-xs text-gray-600 dark:text-neutral-400 font-light line-clamp-2">
                            {evt.subtitle}
                          </p>
                        )}

                        {/* Datos Clave: Capacidad, Precio, Temario */}
                        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800 text-center">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                              Capacidad
                            </span>
                            <span className="text-xs font-bold text-black dark:text-white capitalize">
                              {capacityType === 'individual' ? '1 a 1' : `${capacity} cupos`}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                              Inversión
                            </span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate block">
                              {priceFormatted}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                              Temario
                            </span>
                            <span className="text-xs font-bold text-black dark:text-white">
                              {evt.syllabus?.length || 0} bloques
                            </span>
                          </div>
                        </div>

                        {/* Enlace de sala Google Meet si existe */}
                        {evt.meetUrl && (
                          <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                            <div className="flex items-center gap-2 truncate">
                              <Video className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              <span className="text-[11px] font-mono text-indigo-800 dark:text-indigo-300 truncate">
                                {evt.meetUrl}
                              </span>
                            </div>
                            <a
                              href={evt.meetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2"
                            >
                              Abrir
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Barra de Acciones Inferior */}
                    <div className="p-4 bg-gray-50/70 dark:bg-neutral-800/30 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => downloadWorkshopNotebookPdf(evt)}
                          title="Descargar Cuaderno Base de la Sesión en PDF"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer transition-all shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Cuaderno PDF</span>
                        </button>

                        {submissionsCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                            {submissionsCount} {submissionsCount === 1 ? 'respuesta' : 'respuestas'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDuplicateEvent(evt)}
                          title="Duplicar taller"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditEvent(evt)}
                          title="Editar configuración completa"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          title="Eliminar taller"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 space-y-3">
              <Calendar className="w-10 h-10 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-black dark:text-white">
                  No se encontraron talleres o eventos
                </h4>
                <p className="text-xs text-gray-400 font-light max-w-sm mx-auto">
                  Ajusta los filtros de búsqueda o haz clic en "Nuevo Evento o Taller" para configurar el primer espacio formativo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateEvent}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Taller Ahora</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: EDITOR COMPLETO (LAS 3 SECCIONES REQUERIDAS)                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'editor' && (
        <div className="space-y-6">
          {/* Cabecera del Editor & Stepper de las 3 Secciones */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                    {editingEventId ? 'Modo Edición' : 'Nuevo Taller'}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-semibold text-gray-600 dark:text-neutral-400">
                    {eventFormData.title || 'Configura el taller'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white mt-1">
                  Estructura del Módulo de Eventos y Sesiones
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('events')}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 font-medium cursor-pointer"
                >
                  Volver al Catálogo
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditorEvent}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Evento</span>
                </button>
              </div>
            </div>

            {/* Stepper de navegación entre las 3 Secciones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEditorActiveSection('general')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  editorActiveSection === 'general'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    1
                  </span>
                  <span className="text-xs font-bold">1. Configuración General</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Nombre, Portada & Toggle Home, Capacidad, Precio
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEditorActiveSection('content')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  editorActiveSection === 'content'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    2
                  </span>
                  <span className="text-xs font-bold">2. Contenido y Temario</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Temario, Preguntas Guía y Suministros Adjuntos
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEditorActiveSection('evaluation')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  editorActiveSection === 'evaluation'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    3
                  </span>
                  <span className="text-xs font-bold">3. Evaluación y Cuaderno</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 truncate">
                  Cuestionario Posterior & Descarga de PDF
                </p>
              </button>
            </div>
          </div>

          {/* CONTENEDOR ACTIVO DE LA SECCIÓN SELECCIONADA */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-5 sm:p-7 shadow-xs">
            {editorActiveSection === 'general' && (
              <EventGeneralConfigSection
                event={eventFormData}
                onChange={(updates) => setEventFormData((prev) => ({ ...prev, ...updates }))}
              />
            )}

            {editorActiveSection === 'content' && (
              <EventContentSyllabusSection
                event={eventFormData}
                onChange={(updates) => setEventFormData((prev) => ({ ...prev, ...updates }))}
              />
            )}

            {editorActiveSection === 'evaluation' && (
              <EventEvaluationWorkbookSection
                event={eventFormData}
                onChange={(updates) => setEventFormData((prev) => ({ ...prev, ...updates }))}
                onRefreshEvents={onRefreshEvents}
              />
            )}

            {/* Navegación al pie del editor */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  if (editorActiveSection === 'content') setEditorActiveSection('general');
                  else if (editorActiveSection === 'evaluation') setEditorActiveSection('content');
                  else setActiveSubTab('events');
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
              >
                {editorActiveSection === 'general' ? 'Cancelar y Salir' : '← Sección Anterior'}
              </button>

              <div className="flex items-center gap-2">
                {editorActiveSection !== 'evaluation' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (editorActiveSection === 'general') setEditorActiveSection('content');
                      else if (editorActiveSection === 'content') setEditorActiveSection('evaluation');
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    <span>Siguiente Sección</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveEditorEvent}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Finalizar y Guardar Taller</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: CENTRO DE CUADERNOS Y MEMORIAS DESCARGABLES (PDF)                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'workbooks' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-black dark:text-white">
                Centro de Descarga de Cuadernos y Memorias Ontológicas
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light max-w-2xl leading-relaxed">
              Descarga en cualquier momento las plantillas oficiales en blanco para imprimir o los cuadernos personalizados compilados con las respuestas de cada participante.
            </p>
          </div>

          <div className="space-y-4">
            {safeEvents.map((evt) => {
              const subs = evt.workbookSubmissions || [];
              return (
                <div
                  key={evt.id}
                  className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-neutral-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-bold text-neutral-600 dark:text-neutral-300">
                          {evt.eventType || 'Taller'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {evt.displayDate || evt.date?.split('T')[0]}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-black dark:text-white mt-1">
                        {evt.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadWorkshopNotebookPdf(evt)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-semibold cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar Plantilla Base (PDF)</span>
                    </button>
                  </div>

                  {/* Lista de cuadernos personalizados generados */}
                  {subs.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Cuadernos de Asistentes Disponibles ({subs.length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {subs.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-3.5 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-black dark:text-white truncate">
                                {sub.participantName}
                              </h5>
                              <span className="text-[10px] text-gray-400 block truncate">
                                {sub.participantEmail}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                downloadWorkshopNotebookPdf(evt, {
                                  participantSubmission: sub,
                                  includeAnswers: true,
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer shadow-xs shrink-0"
                            >
                              <Download className="w-3 h-3" />
                              <span>PDF Personal</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-neutral-800 text-center text-xs text-gray-400">
                      Aún no hay respuestas de participantes compiladas para este taller.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 4: CONTROL DE ASISTENTES & SALA VIRTUAL GOOGLE MEET                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'participants' && (
        <div className="space-y-6">
          {/* Sala Google Meet Centralizada */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-bold text-black dark:text-white">
                    Sala Virtual Centralizada (Google Meet)
                  </h3>
                  <p className="text-[11px] text-gray-400 font-light">
                    Enlace permanente utilizado para las transmisiones oficiales de los talleres.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMasterMeet}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  {copiedMeetFeedback ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Enlace</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditingMasterMeet(!isEditingMasterMeet)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-xs font-semibold text-black dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 cursor-pointer"
                >
                  {isEditingMasterMeet ? 'Cerrar' : 'Editar Sala'}
                </button>
              </div>
            </div>

            {isEditingMasterMeet ? (
              <form onSubmit={handleSaveMasterMeet} className="flex gap-2 pt-2">
                <input
                  type="url"
                  required
                  value={tempMasterMeet}
                  onChange={(e) => setTempMasterMeet(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Guardar
                </button>
              </form>
            ) : (
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/40 font-mono text-xs text-indigo-700 dark:text-indigo-400 truncate">
                {masterMeetUrl}
              </div>
            )}
          </div>

          {/* Tabla de Asistentes Registrados */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Participantes Registrados en Talleres
                </h3>
                <span className="text-xs text-gray-400">
                  {safeRegistrations.length} registros totales
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsManualRegModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Inscribir Participante</span>
              </button>
            </div>

            {safeRegistrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-neutral-800/50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-neutral-800">
                    <tr>
                      <th className="px-5 py-3">Código</th>
                      <th className="px-5 py-3">Participante</th>
                      <th className="px-5 py-3">Contacto</th>
                      <th className="px-5 py-3">Taller Asignado</th>
                      <th className="px-5 py-3 text-right">Asistencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {safeRegistrations.map((reg) => {
                      const eventMatch = safeEvents.find((e) => e.id === reg.eventId);
                      return (
                        <tr key={reg.id} className="hover:bg-gray-50/60 dark:hover:bg-neutral-800/40">
                          <td className="px-5 py-3 font-mono text-gray-500">
                            {reg.ticketCode || reg.id.slice(0, 8)}
                          </td>
                          <td className="px-5 py-3">
                            <span className="font-bold text-black dark:text-white block">
                              {reg.name}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-500 dark:text-neutral-400">
                            <span>{reg.email}</span>
                            {reg.phone && <span className="block text-[10px]">{reg.phone}</span>}
                          </td>
                          <td className="px-5 py-3 font-medium text-black dark:text-white">
                            {eventMatch?.title || reg.eventId}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                OntologicalStore.updateEventRegistration(reg.id, { attendedEvent: !reg.attendedEvent });
                                onRefreshRegistrations?.();
                              }}
                              className={`text-[10px] px-2.5 py-1 rounded-full font-semibold cursor-pointer transition-all ${
                                reg.attendedEvent
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-200'
                              }`}
                            >
                              {reg.attendedEvent ? '✓ Asistió' : 'Pendiente'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                No hay asistentes registrados aún en este momento.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: REGISTRO MANUAL DE PARTICIPANTE */}
      {isManualRegModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
              <h4 className="text-sm font-bold text-black dark:text-white">
                Inscribir Participante Manualmente
              </h4>
              <button
                type="button"
                onClick={() => setIsManualRegModalOpen(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManualRegistration} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ej: Carolina Rojas"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Taller o Evento
                </label>
                <select
                  value={regEventId}
                  onChange={(e) => setRegEventId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                >
                  {safeEvents.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.displayDate || evt.date?.split('T')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="regAttendedCheck"
                  checked={regAttended}
                  onChange={(e) => setRegAttended(e.target.checked)}
                  className="rounded-sm text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="regAttendedCheck" className="text-xs text-gray-700 dark:text-neutral-300 cursor-pointer">
                  Marcar como asistente confirmado
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsManualRegModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-neutral-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  Registrar Asistente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
