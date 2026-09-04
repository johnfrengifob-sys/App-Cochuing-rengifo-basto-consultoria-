import React, { useState } from 'react';
import {
  CronogramaEvent,
  OntologicalProgram,
  EventRegistration,
  EventCategory,
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
  Sliders,
  DollarSign,
  AlertCircle,
  Copy,
  CheckCheck,
  Award,
  Radio,
  Link as LinkIcon,
  Check,
} from 'lucide-react';

interface ProgramsAndEventsManagerProps {
  cronogramaEvents: CronogramaEvent[];
  programs: OntologicalProgram[];
  eventRegistrations: EventRegistration[];
  onRefreshEvents: () => void;
  onRefreshPrograms: () => void;
  onRefreshRegistrations: () => void;
  onOpenRegistrationPortal?: () => void;
  initialSubTab?: 'events' | 'participants' | 'banner';
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
  const safePrograms = Array.isArray(programs) ? programs : [];
  const safeRegistrations = Array.isArray(eventRegistrations) ? eventRegistrations : [];

  const [activeSubTab, setActiveSubTab] = useState<'events' | 'participants' | 'banner'>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [copiedLinkFeedback, setCopiedLinkFeedback] = useState(false);

  // Master Google Meet Room State
  const defaultMeet = cronogramaEvents[0]?.meetUrl || 'https://meet.google.com/rbc-conversatorio-ontologico';
  const [masterMeetUrl, setMasterMeetUrl] = useState(() => {
    return localStorage.getItem('rbc_master_meet_url') || defaultMeet;
  });
  const [isEditingMasterMeet, setIsEditingMasterMeet] = useState(false);
  const [tempMasterMeet, setTempMasterMeet] = useState(masterMeetUrl);
  const [copiedMeetFeedback, setCopiedMeetFeedback] = useState(false);

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

  // Modal: Create / Edit Event
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState<Omit<CronogramaEvent, 'id'>>({
    title: '',
    subtitle: '',
    category: 'Conversatorio Quincenal',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    displayDate: '',
    time: '7:00 PM - 9:00 PM (GMT-5)',
    mode: 'Online (Google Meet)',
    meetUrl: masterMeetUrl,
    description: '',
    imageUrl: '',
    aiPromptUsed: '',
    facilitator: 'John Fredy Rengifo Basto',
    spotsLeft: 15,
    totalSpots: 30,
    featured: false,
    status: 'upcoming',
    price: 'Acceso Libre con Pre-Registro',
  });

  // Modal: Manual Participant Registration
  const [isManualRegModalOpen, setIsManualRegModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEventId, setRegEventId] = useState('');
  const [regAttended, setRegAttended] = useState(false);

  // Quick Spot Adjustments for Events
  const handleAdjustEventSpots = (eventId: string, delta: number) => {
    const target = cronogramaEvents.find((e) => e.id === eventId);
    if (!target) return;
    const newSpotsLeft = Math.max(0, Math.min(target.totalSpots, target.spotsLeft + delta));
    OntologicalStore.updateCronogramaEvent(eventId, { spotsLeft: newSpotsLeft });
    onRefreshEvents();
  };

  // Open Event Modal for New
  const handleOpenNewEventModal = () => {
    setEditingEventId(null);
    setEventFormData({
      title: '',
      subtitle: '',
      category: 'Conversatorio Quincenal',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      displayDate: 'Jueves 24 de Septiembre',
      time: '7:00 PM - 8:30 PM (GMT-5)',
      mode: 'Online (Google Meet)',
      meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
      description: 'Espacio reflexivo y de calibración ontológica sobre límites, quiebres y soberanía personal.',
      imageUrl: cronogramaEvents[0]?.imageUrl || '',
      aiPromptUsed: 'Minimalist executive leadership conference banner with botanical shadow.',
      facilitator: 'John Fredy Rengifo Basto',
      spotsLeft: 20,
      totalSpots: 30,
      featured: false,
      status: 'upcoming',
      price: 'Acceso Libre con Pre-Registro',
    });
    setIsEventModalOpen(true);
  };

  // Open Event Modal for Edit
  const handleOpenEditEventModal = (event: CronogramaEvent) => {
    setEditingEventId(event.id);
    setEventFormData({
      title: event.title,
      subtitle: event.subtitle,
      category: event.category,
      date: event.date,
      displayDate: event.displayDate,
      time: event.time,
      mode: event.mode,
      meetUrl: event.meetUrl || '',
      location: event.location || '',
      description: event.description,
      imageUrl: event.imageUrl,
      aiPromptUsed: event.aiPromptUsed || '',
      facilitator: event.facilitator,
      spotsLeft: event.spotsLeft,
      totalSpots: event.totalSpots,
      featured: event.featured,
      status: event.status,
      price: event.price || 'Acceso Libre con Pre-Registro',
    });
    setIsEventModalOpen(true);
  };

  // Save Event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.title.trim()) return;

    if (editingEventId) {
      OntologicalStore.updateCronogramaEvent(editingEventId, eventFormData);
    } else {
      OntologicalStore.addCronogramaEvent(eventFormData);
    }

    setIsEventModalOpen(false);
    setEditingEventId(null);
    onRefreshEvents();
  };

  // Delete Event
  const handleDeleteEvent = (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el evento "${title}"?`)) {
      OntologicalStore.deleteCronogramaEvent(id);
      onRefreshEvents();
    }
  };

  // Toggle Featured Event
  const handleToggleFeatured = (id: string) => {
    const target = cronogramaEvents.find((e) => e.id === id);
    if (!target) return;
    const events = OntologicalStore.getCronogramaEvents();
    const updated = events.map((e) => ({
      ...e,
      featured: e.id === id ? true : false,
    }));
    OntologicalStore.saveCronogramaEvents(updated);
    onRefreshEvents();
  };

  // Manual Registration
  const handleSaveManualRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) return;

    OntologicalStore.addManualEventRegistration({
      eventId: regEventId || cronogramaEvents[0]?.id || 'event-1',
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      attended: regAttended,
    });

    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegAttended(false);
    setIsManualRegModalOpen(false);
    onRefreshRegistrations();
    onRefreshEvents();
  };

  const handleConfirmAttendance = (ticketCodeOrId: string) => {
    OntologicalStore.confirmEventAttendance(ticketCodeOrId);
    onRefreshRegistrations();
  };

  const handleDeleteRegistration = (id: string, name: string) => {
    if (window.confirm(`¿Deseas cancelar la inscripción de ${name} y liberar el cupo?`)) {
      OntologicalStore.deleteEventRegistration(id);
      onRefreshRegistrations();
      onRefreshEvents();
    }
  };

  const handleCopyRegistrationLink = () => {
    const url = `${window.location.origin}/?view=registro`;
    navigator.clipboard.writeText(url);
    setCopiedLinkFeedback(true);
    setTimeout(() => setCopiedLinkFeedback(false), 2500);
  };

  // Filtered registrations
  const filteredRegistrations = safeRegistrations.filter((r) => {
    if (!r) return false;
    const matchesSearch =
      (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.ticketCode || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEvent =
      selectedEventFilter === 'all' || r.eventId === selectedEventFilter;

    return matchesSearch && matchesEvent;
  });

  const featuredEvent = safeEvents.find((e) => e && e.featured) || safeEvents[0];

  return (
    <div className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-6">
      {/* 1. Header with Primary Sub-Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-gray-100 dark:border-neutral-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#F5F5F7] dark:bg-neutral-800 border border-gray-200/80 dark:border-neutral-700 text-[10px] font-semibold text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
            <Calendar className="w-3 h-3 text-black dark:text-white" />
            Gestión de Eventos & Conversatorios en Vivo
          </div>
          <h2 className="text-xl sm:text-2xl font-light text-black dark:text-white tracking-tight">
            Agenda en Vivo, <strong className="font-semibold">Meet & Participantes</strong>
          </h2>
          <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-0.5 max-w-2xl">
            Gestiona los conversatorios y talleres en vivo, sala Google Meet central, monitorea participantes y configura el banner activo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {activeSubTab === 'events' && (
            <button
              type="button"
              onClick={handleOpenNewEventModal}
              className="px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2]" />
              <span>+ Nuevo Evento / Conversatorio</span>
            </button>
          )}

          {activeSubTab === 'participants' && (
            <button
              type="button"
              onClick={() => {
                setRegEventId(cronogramaEvents[0]?.id || '');
                setIsManualRegModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2]" />
              <span>+ Inscribir Participante</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-Tab Switcher Bar */}
      <div className="flex items-center justify-between gap-3 p-1.5 glass-panel-opal rounded-2xl overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            type="button"
            onClick={() => setActiveSubTab('events')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'events'
                ? 'bg-white dark:bg-[#202024] text-black dark:text-white font-bold shadow-2xs border border-gray-200/80 dark:border-neutral-700'
                : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Eventos & Conversatorios ({cronogramaEvents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('participants')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'participants'
                ? 'bg-white dark:bg-[#202024] text-black dark:text-white font-bold shadow-2xs border border-gray-200/80 dark:border-neutral-700'
                : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Participantes & Cupos ({eventRegistrations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('banner')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'banner'
                ? 'bg-white dark:bg-[#202024] text-black dark:text-white font-bold shadow-2xs border border-gray-200/80 dark:border-neutral-700'
                : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Banner Activo en Inicio</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400 font-light pr-2">
          <span>Capacidad total activa:</span>
          <strong className="font-bold text-black dark:text-white">
            {cronogramaEvents.reduce((acc, curr) => acc + curr.totalSpots, 0)} cupos
          </strong>
        </div>
      </div>

      {/* ================= SUB-TAB 1: EVENTOS & CONVERSATORIOS ================= */}
      {activeSubTab === 'events' && (
        <div className="space-y-4">
          {/* Master Google Meet Card */}
          <div className="p-5 rounded-2xl bg-linear-to-r from-neutral-900 via-indigo-950 to-neutral-900 text-white shadow-lg relative overflow-hidden border border-indigo-900/50">
            <div className="absolute right-0 top-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-semibold">
                  <Radio className="w-3 h-3 animate-pulse text-indigo-400" />
                  <span>Sala Virtual Central Google Meet</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Enlace Maestro para Talleres y Conversatorios en Vivo</span>
                </h3>
                <p className="text-xs text-neutral-300 font-light max-w-xl">
                  Enlace único sincronizado para los conversatorios quincenales, masterclasses y sesiones ontológicas grupales.
                </p>
                <div className="pt-1 flex items-center gap-2 text-xs font-mono text-indigo-200">
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  {isEditingMasterMeet ? (
                    <form onSubmit={handleSaveMasterMeet} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={tempMasterMeet}
                        onChange={(e) => setTempMasterMeet(e.target.value)}
                        className="px-2.5 py-1 text-xs bg-white/20 rounded-lg text-white border border-white/30 focus:outline-none w-72"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 bg-white text-black text-[11px] font-bold rounded-lg hover:bg-gray-100"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingMasterMeet(false)}
                        className="px-2 py-1 bg-white/10 text-white text-[11px] rounded-lg hover:bg-white/20"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <span className="truncate max-w-sm bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                      {masterMeetUrl}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={masterMeetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-100 text-xs font-bold transition-all shadow-xs"
                >
                  <Video className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Abrir Sala Meet</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyMasterMeet}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-all cursor-pointer"
                >
                  {copiedMeetFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>

                {!isEditingMasterMeet && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempMasterMeet(masterMeetUrl);
                      setIsEditingMasterMeet(true);
                    }}
                    title="Editar enlace Google Meet maestro"
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cronogramaEvents.map((event) => {
              const enrolledCount = Math.max(0, event.totalSpots - event.spotsLeft);
              const percentage = Math.min(100, Math.round((enrolledCount / event.totalSpots) * 100));

              return (
                <div
                  key={event.id}
                  className={`card-solid-white rounded-2xl p-5 border transition-all duration-200 space-y-4 shadow-2xs ${
                    event.featured
                      ? 'border-black dark:border-white ring-1 ring-black/5 dark:ring-white/10'
                      : 'border-gray-200/80 dark:border-neutral-800'
                  }`}
                >
                  {/* Top Bar: Category & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300">
                        {event.category}
                      </span>
                      {event.featured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-300/40 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          Fijado en Inicio
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          event.status === 'upcoming'
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : event.status === 'live'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 animate-pulse'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {event.status === 'upcoming'
                          ? 'Próximo'
                          : event.status === 'live'
                          ? 'En Vivo'
                          : 'Finalizado'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(event.id)}
                        title={event.featured ? 'Evento fijado en banner principal' : 'Fijar en banner de inicio'}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          event.featured
                            ? 'bg-amber-400/10 border-amber-400/40 text-amber-500'
                            : 'border-gray-200 dark:border-neutral-700 text-gray-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${event.featured ? 'fill-amber-400' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditEventModal(event)}
                        title="Editar programa o evento"
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        title="Eliminar evento"
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-base font-bold text-black dark:text-white leading-snug">
                      {event.title}
                    </h3>
                    {event.subtitle && (
                      <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-1">
                        {event.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Date, Time, Mode */}
                  <div className="grid grid-cols-2 gap-2 text-xs glass-panel-opal p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium">{event.displayDate || event.date.split('T')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300 col-span-2">
                      <Video className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{event.mode}</span>
                    </div>
                  </div>

                  {/* QUOTA CONTROL & PARTICIPANTS CAPACITY BAR */}
                  <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-black dark:text-white" />
                        <span className="font-semibold text-black dark:text-white">
                          Ocupación & Cupos:
                        </span>
                        <span className="text-gray-500 dark:text-neutral-400">
                          {enrolledCount} de {event.totalSpots} inscritos
                        </span>
                      </div>
                      <span className="font-bold text-black dark:text-white">
                        {event.spotsLeft} cupos libres
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${
                          percentage >= 90
                            ? 'bg-red-500'
                            : percentage >= 60
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Fast Quota Buttons */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] text-gray-400">Ajuste rápido de disponibilidad:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustEventSpots(event.id, -1)}
                          disabled={event.spotsLeft <= 0}
                          title="Reducir 1 cupo disponible"
                          className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-black dark:text-white rounded-md text-[10px] font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-30 cursor-pointer"
                        >
                          -1 Cupo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustEventSpots(event.id, 1)}
                          disabled={event.spotsLeft >= event.totalSpots}
                          title="Aumentar 1 cupo disponible"
                          className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-black dark:text-white rounded-md text-[10px] font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-30 cursor-pointer"
                        >
                          +1 Cupo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditEventModal(event)}
                          className="px-2.5 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded-md text-[10px] font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer"
                        >
                          Modificar Total
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 3: PARTICIPANTES & CONTROL DE CUPOS ================= */}
      {activeSubTab === 'participants' && (
        <div className="space-y-4">
          {/* Filter toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 glass-panel-opal rounded-2xl">
            <div className="flex flex-1 items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, ticket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white placeholder-gray-400 focus:outline-none"
                />
              </div>

              <select
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="all">Todos los eventos</option>
                {cronogramaEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyRegistrationLink}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1E1E22] text-xs font-medium text-black dark:text-white flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedLinkFeedback ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link de Registro</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel-sheer rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200/80 dark:border-neutral-800 bg-[#F9F9F9] dark:bg-[#1A1A1E] text-gray-500 dark:text-neutral-400 text-[10px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Participante</th>
                    <th className="py-3 px-4">Evento / Programa</th>
                    <th className="py-3 px-4">Ticket RSVP</th>
                    <th className="py-3 px-4">Fecha Registro</th>
                    <th className="py-3 px-4">Asistencia</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 text-xs font-light">
                        No hay participantes registrados para los criterios seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr
                        key={reg.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-black dark:text-white">{reg.name}</div>
                          <div className="text-[11px] text-gray-400">{reg.email} &bull; {reg.phone}</div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="text-black dark:text-white font-medium truncate">
                            {reg.eventTitle}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                          {reg.ticketCode}
                        </td>

                        <td className="py-3 px-4 text-gray-500 dark:text-neutral-400">
                          {new Date(reg.registeredAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-3 px-4">
                          {reg.attendedEvent ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Confirmado
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConfirmAttendance(reg.ticketCode)}
                              className="text-[10px] px-2 py-1 rounded-lg bg-amber-400 text-black font-semibold hover:bg-amber-300 cursor-pointer"
                            >
                              Confirmar en vivo
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRegistration(reg.id, reg.name)}
                            title="Cancelar inscripción y liberar cupo"
                            className="p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 4: BANNER ACTIVO EN INICIO ================= */}
      {activeSubTab === 'banner' && (
        <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300">
                Banner Activo en Portada Principal
              </span>
              <h3 className="text-xl font-bold text-black dark:text-white mt-1">
                {featuredEvent.title}
              </h3>
              <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-0.5">
                {featuredEvent.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEditEventModal(featuredEvent)}
                className="px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Información del Banner</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-md">
              <img
                src={featuredEvent.imageUrl}
                alt={featuredEvent.title}
                className="w-full h-64 object-cover"
              />
            </div>

            <div className="lg:col-span-6 space-y-4 text-xs">
              <div className="p-4 glass-panel-opal rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Prompt Utilizado para Generación IA:
                </span>
                <p className="text-gray-700 dark:text-neutral-300 font-mono text-[11px] leading-relaxed">
                  {featuredEvent.aiPromptUsed || 'Banner minimalista de consultoría ontológica ejecutiva con atmósfera zen y sobria.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 glass-panel-opal rounded-xl">
                  <span className="text-[10px] text-gray-400 block">Fecha en Portada</span>
                  <span className="font-bold text-black dark:text-white">{featuredEvent.displayDate}</span>
                </div>
                <div className="p-3 glass-panel-opal rounded-xl">
                  <span className="text-[10px] text-gray-400 block">Cupos Disponibles</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{featuredEvent.spotsLeft} de {featuredEvent.totalSpots}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT EVENT ================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-black dark:text-white">
                {editingEventId ? 'Editar Evento / Conversatorio' : 'Crear Nuevo Evento / Conversatorio'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Conversatorio: Límites, Quiebres & Soberanía Personal"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Subtítulo / Enfoque
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sesión Ontológica y Diagnóstico en Vivo"
                  value={eventFormData.subtitle}
                  onChange={(e) => setEventFormData({ ...eventFormData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-black dark:text-white block mb-1">
                    Categoría
                  </label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, category: e.target.value as EventCategory })
                    }
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                  >
                    <option value="Conversatorio Quincenal">Conversatorio Quincenal</option>
                    <option value="Masterclass Ontológica">Masterclass Ontológica</option>
                    <option value="Taller Vivencial">Taller Vivencial</option>
                    <option value="Círculo de Liderazgo">Círculo de Liderazgo</option>
                    <option value="Seminario Ejecutivo">Seminario Ejecutivo</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-black dark:text-white block mb-1">
                    Modalidad
                  </label>
                  <select
                    value={eventFormData.mode}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        mode: e.target.value as 'Online (Google Meet)' | 'Presencial & Streaming' | 'Híbrido',
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                  >
                    <option value="Online (Google Meet)">Online (Google Meet)</option>
                    <option value="Presencial & Streaming">Presencial & Streaming</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
              </div>

              {/* CUPOS & CAPACIDAD */}
              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 space-y-3">
                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">
                  Control de Cupos y Capacidad
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-black dark:text-white block mb-1">
                      Cupos Totales / Aforo *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={500}
                      value={eventFormData.totalSpots}
                      onChange={(e) => {
                        const total = parseInt(e.target.value) || 1;
                        setEventFormData({
                          ...eventFormData,
                          totalSpots: total,
                          spotsLeft: Math.min(total, eventFormData.spotsLeft),
                        });
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-black dark:text-white block mb-1">
                      Cupos Disponibles Libres *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={eventFormData.totalSpots}
                      value={eventFormData.spotsLeft}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          spotsLeft: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-black dark:text-white block mb-1">
                    Fecha Visible en Banner
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Jueves 17 de Septiembre"
                    value={eventFormData.displayDate}
                    onChange={(e) => setEventFormData({ ...eventFormData, displayDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-black dark:text-white block mb-1">
                    Horario
                  </label>
                  <input
                    type="text"
                    placeholder="7:00 PM - 9:00 PM (GMT-5)"
                    value={eventFormData.time}
                    onChange={(e) => setEventFormData({ ...eventFormData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Enlace de Google Meet / Acceso
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/rbc-..."
                  value={eventFormData.meetUrl}
                  onChange={(e) => setEventFormData({ ...eventFormData, meetUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Descripción del Evento
                </label>
                <textarea
                  rows={2}
                  placeholder="Objetivos y dinámica pedagógica de la sesión..."
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={eventFormData.featured}
                  onChange={(e) => setEventFormData({ ...eventFormData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-black cursor-pointer"
                />
                <label htmlFor="featured-checkbox" className="font-medium text-black dark:text-white cursor-pointer">
                  Fijar este evento como principal en el Banner de Inicio
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold"
                >
                  {editingEventId ? 'Guardar Cambios' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANUAL PARTICIPANT REGISTRATION ================= */}
      {isManualRegModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl max-w-md w-full p-6 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-black dark:text-white">
                Inscribir Participante Manualmente
              </h3>
              <button
                type="button"
                onClick={() => setIsManualRegModalOpen(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManualRegistration} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Evento o Conversatorio *
                </label>
                <select
                  required
                  value={regEventId}
                  onChange={(e) => setRegEventId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none font-medium"
                >
                  {cronogramaEvents.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.spotsLeft} cupos libres)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Andrés Morales"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
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
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-black dark:text-white block mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="andres.morales@empresa.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reg-attended"
                  checked={regAttended}
                  onChange={(e) => setRegAttended(e.target.checked)}
                  className="w-4 h-4 rounded text-black cursor-pointer"
                />
                <label htmlFor="reg-attended" className="font-medium text-black dark:text-white cursor-pointer">
                  Marcar asistencia como ya confirmada
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsManualRegModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold"
                >
                  Generar Ticket & Inscribir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
