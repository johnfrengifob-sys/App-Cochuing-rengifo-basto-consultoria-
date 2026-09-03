import React, { useState, useEffect } from 'react';
import {
  Video,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Clock,
  Users,
  Plus,
  Edit2,
  Trash2,
  Radio,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  UserX,
  Search,
} from 'lucide-react';
import { OntologicalStore } from '../../services/store';
import { CronogramaEvent, EventRegistration } from '../../types';

interface AdminMeetWorkshopsManagerProps {
  onRefresh?: () => void;
}

export const AdminMeetWorkshopsManager: React.FC<AdminMeetWorkshopsManagerProps> = ({
  onRefresh,
}) => {
  const [events, setEvents] = useState<CronogramaEvent[]>(() =>
    OntologicalStore.getCronogramaEvents()
  );
  const [registrations, setRegistrations] = useState<EventRegistration[]>(() =>
    OntologicalStore.getEventRegistrations()
  );

  // Master Meet Link state
  const defaultMeet = events[0]?.meetUrl || 'https://meet.google.com/rbc-conversatorio-ontologico';
  const [masterMeetUrl, setMasterMeetUrl] = useState(() => {
    return localStorage.getItem('rbc_master_meet_url') || defaultMeet;
  });
  const [isEditingMasterMeet, setIsEditingMasterMeet] = useState(false);
  const [tempMasterMeet, setTempMasterMeet] = useState(masterMeetUrl);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Filter & Search
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Modal: Create / Edit Event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CronogramaEvent | null>(null);
  const [eventForm, setEventForm] = useState<Omit<CronogramaEvent, 'id'>>({
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
    facilitator: 'John Fredy Rengifo Basto',
    spotsLeft: 15,
    totalSpots: 30,
    featured: false,
    status: 'upcoming',
    price: 'Acceso Libre con Pre-Registro',
  });

  // Manual participant add
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');
  const [participantEventId, setParticipantEventId] = useState(events[0]?.id || '');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopyLink = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(label);
    showNotification(`Enlace de Google Meet copiado: ${url}`);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleSaveMasterMeet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempMasterMeet.trim()) return;
    localStorage.setItem('rbc_master_meet_url', tempMasterMeet.trim());
    setMasterMeetUrl(tempMasterMeet.trim());
    setIsEditingMasterMeet(false);
    showNotification('Enlace maestro de Google Meet actualizado correctamente.');
    if (onRefresh) onRefresh();
  };

  const handleOpenNewEvent = () => {
    setEditingEvent(null);
    setEventForm({
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
      facilitator: 'John Fredy Rengifo Basto',
      spotsLeft: 20,
      totalSpots: 30,
      featured: false,
      status: 'upcoming',
      price: 'Acceso Libre con Pre-Registro',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditEvent = (evt: CronogramaEvent) => {
    setEditingEvent(evt);
    setEventForm({
      title: evt.title,
      subtitle: evt.subtitle || '',
      category: evt.category,
      date: evt.date,
      displayDate: evt.displayDate || '',
      time: evt.time,
      mode: evt.mode,
      meetUrl: evt.meetUrl || masterMeetUrl,
      description: evt.description,
      imageUrl: evt.imageUrl || '',
      facilitator: evt.facilitator,
      spotsLeft: evt.spotsLeft,
      totalSpots: evt.totalSpots,
      featured: evt.featured,
      status: evt.status,
      price: evt.price || 'Acceso Libre con Pre-Registro',
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    if (editingEvent) {
      OntologicalStore.updateCronogramaEvent(editingEvent.id, eventForm);
      showNotification(`Taller "${eventForm.title}" actualizado con éxito.`);
    } else {
      OntologicalStore.addCronogramaEvent(eventForm);
      showNotification(`Nuevo taller "${eventForm.title}" programado.`);
    }

    setEvents(OntologicalStore.getCronogramaEvents());
    setIsModalOpen(false);
    if (onRefresh) onRefresh();
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el taller "${title}"?`)) {
      OntologicalStore.deleteCronogramaEvent(id);
      setEvents(OntologicalStore.getCronogramaEvents());
      showNotification(`Taller "${title}" eliminado.`);
      if (onRefresh) onRefresh();
    }
  };

  const handleAdjustSpots = (eventId: string, delta: number) => {
    const target = events.find((e) => e.id === eventId);
    if (!target) return;
    const newSpots = Math.max(0, Math.min(target.totalSpots, target.spotsLeft + delta));
    OntologicalStore.updateCronogramaEvent(eventId, { spotsLeft: newSpots });
    setEvents(OntologicalStore.getCronogramaEvents());
    showNotification(`Cupos de "${target.title}" ajustados a ${newSpots}.`);
    if (onRefresh) onRefresh();
  };

  const handleToggleAttendance = (regId: string) => {
    const reg = registrations.find((r) => r.id === regId);
    if (!reg) return;
    const newAttended = !reg.attendedEvent;
    OntologicalStore.updateEventRegistration(regId, { attendedEvent: newAttended });
    setRegistrations(OntologicalStore.getEventRegistrations());
    showNotification(
      `Asistencia de ${reg.name} marcada como: ${newAttended ? 'Asistió' : 'Pendiente'}.`
    );
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim() || !participantEmail.trim()) return;
    OntologicalStore.addEventRegistration({
      eventId: participantEventId,
      name: participantName.trim(),
      email: participantEmail.trim(),
      phone: participantPhone.trim() || undefined,
      attended: false,
    });
    setRegistrations(OntologicalStore.getEventRegistrations());
    setIsAddParticipantOpen(false);
    setParticipantName('');
    setParticipantEmail('');
    setParticipantPhone('');
    showNotification(`Participante ${participantName} registrado al taller.`);
  };

  const filteredEvents = events.filter((evt) => {
    const matchSearch =
      evt.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (evt.subtitle && evt.subtitle.toLowerCase().includes(searchFilter.toLowerCase()));
    if (statusFilter === 'all') return matchSearch;
    return matchSearch && evt.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-neutral-950 text-white text-xs shadow-2xl flex items-center gap-2 border border-neutral-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* SALA VIRTUAL GOOGLE MEET CENTRAL */}
      <div className="p-6 rounded-3xl bg-linear-to-br from-neutral-900 via-indigo-950 to-neutral-900 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
              <span>Sala Virtual Google Meet Directa</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Espacio de Encuentro & Talleres Ontológicos</span>
            </h3>
            <p className="text-xs md:text-sm text-neutral-300 font-light max-w-2xl leading-relaxed">
              Enlace centralizado de Google Meet configurado para las transmisiones en vivo, talleres de profundización, conversatorios quincenales y sesiones grupales sincrónicas.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-indigo-200">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate max-w-md bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                {masterMeetUrl}
              </span>
            </div>
          </div>

          {/* Direct Actions: Join Room, Copy Link, Edit URL */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <a
              href={masterMeetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black hover:bg-neutral-100 text-xs font-bold transition-all shadow-md cursor-pointer group"
            >
              <Video className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>Ingresar a la Sala Meet</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </a>

            <button
              type="button"
              onClick={() => handleCopyLink(masterMeetUrl, 'master')}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-all cursor-pointer backdrop-blur-sm"
            >
              {copiedLink === 'master' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setTempMasterMeet(masterMeetUrl);
                setIsEditingMasterMeet(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-all cursor-pointer backdrop-blur-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Configurar URL</span>
            </button>
          </div>
        </div>

        {/* Inline URL Edit Form */}
        {isEditingMasterMeet && (
          <form
            onSubmit={handleSaveMasterMeet}
            className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-in fade-in duration-200"
          >
            <div className="flex-1">
              <label className="text-[11px] text-neutral-300 font-medium block mb-1">
                Nueva URL Maestra de Google Meet:
              </label>
              <input
                type="url"
                required
                value={tempMasterMeet}
                onChange={(e) => setTempMasterMeet(e.target.value)}
                placeholder="https://meet.google.com/xyz-abcd-efg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>
            <div className="flex items-center gap-2 sm:self-end">
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 cursor-pointer"
              >
                Guardar URL
              </button>
              <button
                type="button"
                onClick={() => setIsEditingMasterMeet(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs hover:bg-white/20 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* CRONOGRAMA DE TALLERES & CONVERSATORIOS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-1">
              <Calendar className="w-3 h-3 text-indigo-600" />
              <span>Programación Pedagógica en Vivo</span>
            </div>
            <h4 className="text-lg font-bold text-black dark:text-white">
              Talleres Grupales & Conversatorios Ontológicos
            </h4>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
              Administra las fechas, cupos, enlaces de Meet específicos y asistencia a cada taller.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenNewEvent}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Programar Nuevo Taller</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar taller por nombre o temática..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-neutral-800/80 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-2xs font-semibold'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Todos ({events.length})
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'upcoming'
                  ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-2xs font-semibold'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Próximos ({events.filter((e) => e.status === 'upcoming').length})
            </button>
            <button
              onClick={() => setStatusFilter('past')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'past'
                  ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-2xs font-semibold'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Realizados ({events.filter((e) => e.status === 'past').length})
            </button>
          </div>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((evt) => {
            const meetUrl = evt.meetUrl || masterMeetUrl;
            const regCount = registrations.filter((r) => r.eventId === evt.id).length;
            const isFeatured = evt.featured;

            return (
              <div
                key={evt.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isFeatured
                    ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                    : 'bg-gray-50/60 dark:bg-[#202024] border-gray-200 dark:border-neutral-700'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 font-mono">
                      {evt.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        evt.status === 'upcoming'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-gray-200 text-gray-700 dark:bg-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {evt.status === 'upcoming' ? 'En Agenda' : 'Concluido'}
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-black dark:text-white line-clamp-1">
                    {evt.title}
                  </h5>
                  {evt.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-neutral-400 font-light line-clamp-2">
                      {evt.subtitle}
                    </p>
                  )}

                  <div className="space-y-1 text-xs text-gray-600 dark:text-neutral-400 pt-1">
                    <div className="flex items-center gap-1.5 font-light">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{evt.displayDate || new Date(evt.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-light">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-light">
                      <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>
                        {evt.spotsLeft} cupos libres de {evt.totalSpots} ({regCount} inscritos)
                      </span>
                    </div>
                  </div>

                  {/* Spot Adjustment Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-neutral-700 text-xs">
                    <span className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                      Gestionar Cupos:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAdjustSpots(evt.id, -1)}
                        className="w-6 h-6 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-bold hover:bg-gray-100 cursor-pointer"
                        title="Restar 1 cupo"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold px-1.5 text-black dark:text-white">
                        {evt.spotsLeft}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustSpots(evt.id, 1)}
                        className="w-6 h-6 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-bold hover:bg-gray-100 cursor-pointer"
                        title="Sumar 1 cupo"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions: Meet, Copy, Edit, Delete */}
                <div className="space-y-2 pt-3 border-t border-gray-200/60 dark:border-neutral-700">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Abrir Meet</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(meetUrl, evt.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white text-xs font-medium cursor-pointer"
                    >
                      {copiedLink === evt.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedLink === evt.id ? 'Copiado' : 'Link Meet'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditEvent(evt)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                      title="Editar detalles del taller"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(evt.id, evt.title)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Eliminar taller"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PARTICIPANTES & ASISTENCIA EN VIVO */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Registro de Asistencia a Talleres & Meet</span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
              Participantes inscritos y control de asistencia presencial/virtual ({registrations.length} registros).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddParticipantOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 text-xs font-semibold text-black dark:text-white cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Inscribir Participante Manualmente</span>
          </button>
        </div>

        {registrations.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-gray-50 dark:bg-neutral-800/40 text-xs text-gray-500 font-light">
            No hay participantes registrados todavía en los talleres de Google Meet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-neutral-700 text-gray-400 uppercase font-semibold text-[10px]">
                  <th className="py-2.5 px-3">Participante</th>
                  <th className="py-2.5 px-3">Contacto</th>
                  <th className="py-2.5 px-3">Taller / Evento</th>
                  <th className="py-2.5 px-3 text-center">Estado Asistencia</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 font-light">
                {registrations.map((reg) => {
                  const targetEvent = events.find((e) => e.id === reg.eventId);
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/50">
                      <td className="py-3 px-3 font-medium text-black dark:text-white">
                        {reg.name}
                      </td>
                      <td className="py-3 px-3 text-gray-500 dark:text-neutral-400">
                        <div>{reg.email}</div>
                        {reg.phone && <div className="text-[10px] text-gray-400">{reg.phone}</div>}
                      </td>
                      <td className="py-3 px-3 text-indigo-600 dark:text-indigo-400 font-medium">
                        {targetEvent ? targetEvent.title : 'Taller Ontológico'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            reg.attendedEvent
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {reg.attendedEvent ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              Asistió
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Pendiente
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(reg.id)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-[11px] font-medium text-black dark:text-white cursor-pointer"
                        >
                          {reg.attendedEvent ? 'Marcar Pendiente' : 'Confirmar Asistencia'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: PROGRAMAR / EDITAR TALLER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gray-200 dark:border-neutral-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-bold text-black dark:text-white">
              {editingEvent ? 'Editar Taller / Conversatorio' : 'Programar Nuevo Taller en Google Meet'}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-black dark:text-white">Título del Taller *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Ej: Conversatorio Raíz y Balance Directivo"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-black dark:text-white">Subtítulo o Enfoque</label>
                <input
                  type="text"
                  value={eventForm.subtitle}
                  onChange={(e) => setEventForm({ ...eventForm, subtitle: e.target.value })}
                  placeholder="Ej: Espacio Abierto de Indagación y Soberanía Directiva"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-black dark:text-white">Categoría</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  >
                    <option value="Conversatorio Quincenal">Conversatorio Quincenal</option>
                    <option value="Masterclass Abierta">Masterclass Abierta</option>
                    <option value="Taller de Indagación">Taller de Indagación</option>
                    <option value="Círculo de Liderazgo">Círculo de Liderazgo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-black dark:text-white">Horario</label>
                  <input
                    type="text"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    placeholder="Ej: 7:00 PM - 9:00 PM (GMT-5)"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-black dark:text-white flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Enlace Google Meet para este taller</span>
                </label>
                <input
                  type="url"
                  required
                  value={eventForm.meetUrl}
                  onChange={(e) => setEventForm({ ...eventForm, meetUrl: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-black dark:text-white">Cupos Totales</label>
                  <input
                    type="number"
                    min="1"
                    value={eventForm.totalSpots}
                    onChange={(e) => {
                      const tot = parseInt(e.target.value) || 20;
                      setEventForm({ ...eventForm, totalSpots: tot, spotsLeft: Math.min(eventForm.spotsLeft, tot) });
                    }}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-black dark:text-white">Cupos Libres</label>
                  <input
                    type="number"
                    min="0"
                    max={eventForm.totalSpots}
                    value={eventForm.spotsLeft}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, spotsLeft: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-black dark:text-white">Descripción pedagógica</label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Temática, dinámica y objetivos del conversatorio..."
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-light"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 font-medium hover:bg-gray-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-neutral-800 cursor-pointer shadow-xs"
                >
                  {editingEvent ? 'Guardar Cambios' : 'Crear Taller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSCRIBIR MANUALMENTE A UN PARTICIPANTE */}
      {isAddParticipantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-black dark:text-white">
              Inscribir Participante al Taller
            </h3>

            <form onSubmit={handleAddParticipant} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-black dark:text-white">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Ej: Andrés Felipe Silva"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-black dark:text-white">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="andres@ejemplo.com"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-black dark:text-white">WhatsApp / Teléfono</label>
                <input
                  type="tel"
                  value={participantPhone}
                  onChange={(e) => setParticipantPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-black dark:text-white">Taller Asignado</label>
                <select
                  value={participantEventId}
                  onChange={(e) => setParticipantEventId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.time})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setIsAddParticipantOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 font-medium hover:bg-gray-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-neutral-800 cursor-pointer shadow-xs"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
