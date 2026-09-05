import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  Video,
  Clock,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { OntologicalStore, PROGRAM_NODES } from '../services/store';
import { CronogramaEvent, ProgramNodeInfo } from '../types';

interface DynamicSpacesHubProps {
  onOpenVideoConference?: (roomName?: string) => void;
  onOpenMeetUrl?: (url: string) => void;
}

export const DynamicSpacesHub: React.FC<DynamicSpacesHubProps> = ({
  onOpenVideoConference,
  onOpenMeetUrl,
}) => {
  const [spaceType, setSpaceType] = useState<'workshops' | 'individual'>('workshops');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSpaceDetail, setSelectedSpaceDetail] = useState<any | null>(null);

  const workshops = OntologicalStore.getCronogramaEvents();
  const individualSessions = OntologicalStore.getProgramNodes();

  const filteredWorkshops = workshops.filter(
    (w) =>
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIndividual = individualSessions.filter((s) => {
    const matchesSearch =
      s.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.levelTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel =
      selectedLevel === 'all' || s.level.toLowerCase().includes(selectedLevel.toLowerCase());
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel-opal p-5 sm:p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-black text-white dark:bg-white dark:text-black">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight">
                Espacios Dinámicos de Transformación
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% Coherencia Datos</span>
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-neutral-300 font-light mt-1.5 max-w-2xl">
              Arquitectura modular unificada para los <strong>5 Talleres Grupales</strong> y las <strong>12 Sesiones Individuales 1 a 1</strong>. Garantiza consistencia absoluta entre la consola del Coach, la vista del Coachee y las respuestas asistidas por el Bot IA.
            </p>
          </div>

          {/* Toggle Type */}
          <div className="flex items-center p-1 bg-gray-100 dark:bg-neutral-800/80 rounded-2xl shrink-0 border border-gray-200/60 dark:border-white/5">
            <button
              type="button"
              onClick={() => {
                setSpaceType('workshops');
                setSelectedSpaceDetail(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                spaceType === 'workshops'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>5 Talleres Grupales</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSpaceType('individual');
                setSelectedSpaceDetail(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                spaceType === 'individual'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>12 Sesiones 1 a 1</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  spaceType === 'workshops'
                    ? 'Buscar en los 5 talleres grupales...'
                    : 'Buscar en las 12 sesiones ontológicas...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-neutral-800/80 border border-gray-200/80 dark:border-white/10 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {spaceType === 'individual' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase mr-1">
                Nivel:
              </span>
              {['all', 'Nivel I', 'Nivel II', 'Nivel III'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                    selectedLevel === lvl
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                      : 'bg-white/60 dark:bg-neutral-800/60 text-gray-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800'
                  }`}
                >
                  {lvl === 'all' ? 'Todos' : lvl}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Rendering: 5 Workshops Grid */}
      {spaceType === 'workshops' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkshops.map((w, index) => (
            <div
              key={w.id}
              className="glass-panel-opal rounded-2xl border border-white/60 dark:border-white/10 shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Header tag */}
                <div className="p-4 pb-3 flex items-start justify-between gap-2 border-b border-gray-100 dark:border-white/5">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                      Espacio {index + 1} de 5 • Grupal
                    </span>
                    <h3 className="text-sm font-bold text-black dark:text-white mt-1.5 leading-snug">
                      {w.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    {w.eventType || 'Taller'}
                  </span>
                </div>

                <div className="p-4 space-y-2.5 text-xs">
                  <p className="text-gray-600 dark:text-neutral-300 font-light line-clamp-3 leading-relaxed">
                    {w.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-neutral-900/60 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-neutral-300">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{w.displayDate} • {w.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-neutral-300">
                      <Video className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate">{w.mode}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-neutral-300">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Capacidad: {w.capacity} cupos ({w.spotsLeft} disponibles)</span>
                    </div>
                  </div>

                  {w.syllabus && w.syllabus.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                        Estructura de Bloques ({w.syllabus.length}):
                      </span>
                      <div className="space-y-1">
                        {w.syllabus.slice(0, 2).map((syl) => (
                          <div
                            key={syl.id}
                            className="text-[11px] text-gray-600 dark:text-neutral-400 flex items-center gap-1.5 truncate"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40 shrink-0" />
                            <span className="truncate">{syl.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-3 bg-gray-50/50 dark:bg-neutral-900/30 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSpaceDetail({ type: 'workshop', data: w })}
                  className="text-xs text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white font-medium cursor-pointer"
                >
                  Ver Detalles
                </button>
                <a
                  href={w.meetUrl || 'https://meet.google.com/rbc-conversatorio-ontologico'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <Video className="w-3 h-3" />
                  <span>Sala Meet</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Rendering: 12 Individual Sessions Grid */}
      {spaceType === 'individual' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIndividual.map((node) => (
            <div
              key={node.step}
              className="glass-panel-opal rounded-2xl border border-white/60 dark:border-white/10 shadow-2xs hover:shadow-xs transition-all p-4 sm:p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    Sesión {node.step} de 12 • {node.level}
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 dark:text-neutral-400">
                    {node.weekLabel}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-black dark:text-white leading-snug mb-1.5">
                  {node.sessionTitle}
                </h3>
                <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 block mb-2">
                  {node.levelTitle}
                </span>

                <p className="text-xs text-gray-600 dark:text-neutral-300 font-light line-clamp-3 mb-3 leading-relaxed">
                  {node.objective}
                </p>

                {/* Triple Dimension Pills */}
                <div className="space-y-1 text-[11px] mb-3">
                  <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-neutral-900/60 flex items-start gap-1.5">
                    <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">Lingüístico:</span>
                    <span className="text-gray-600 dark:text-neutral-400 truncate">{node.methodology?.linguistic}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-neutral-900/60 flex items-start gap-1.5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">Somático:</span>
                    <span className="text-gray-600 dark:text-neutral-400 truncate">{node.methodology?.somatic}</span>
                  </div>
                </div>

                {/* Micro practice */}
                {node.dailyMicroPractice && (
                  <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 text-[11px]">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block truncate">
                      {node.dailyMicroPractice.title}
                    </span>
                    <span className="text-amber-900/80 dark:text-amber-200/80 text-[10px] line-clamp-1 mt-0.5">
                      {node.dailyMicroPractice.frequency}
                    </span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-[10px] text-gray-400 dark:text-neutral-500">
                  {node.studyMaterials?.length || 0} recursos adjuntos
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSpaceDetail({ type: 'individual', data: node })}
                  className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Explorar Nodo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail View */}
      {selectedSpaceDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-neutral-800 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 uppercase">
                  {selectedSpaceDetail.type === 'workshop' ? 'Taller Grupal en Vivo' : `Sesión ${selectedSpaceDetail.data.step} de 12`}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-black dark:text-white mt-1">
                  {selectedSpaceDetail.type === 'workshop'
                    ? selectedSpaceDetail.data.title
                    : selectedSpaceDetail.data.sessionTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSpaceDetail(null)}
                className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-xs font-semibold text-black dark:text-white cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            {selectedSpaceDetail.type === 'workshop' ? (
              <div className="space-y-4 text-xs">
                <p className="text-gray-700 dark:text-neutral-300 leading-relaxed">
                  {selectedSpaceDetail.data.description}
                </p>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-white/5 space-y-1.5">
                  <div className="font-semibold text-black dark:text-white">Detalles Logísticos:</div>
                  <div className="text-gray-600 dark:text-neutral-400">Fecha: {selectedSpaceDetail.data.displayDate} ({selectedSpaceDetail.data.time})</div>
                  <div className="text-gray-600 dark:text-neutral-400">Modalidad: {selectedSpaceDetail.data.mode}</div>
                  <div className="text-gray-600 dark:text-neutral-400">Facilitador: {selectedSpaceDetail.data.facilitator}</div>
                </div>

                {selectedSpaceDetail.data.syllabus && (
                  <div>
                    <h4 className="font-bold text-black dark:text-white text-xs mb-2">Temario y Bloques de Facilitación:</h4>
                    <div className="space-y-2">
                      {selectedSpaceDetail.data.syllabus.map((s: any) => (
                        <div key={s.id} className="p-3 rounded-xl bg-gray-50/80 dark:bg-neutral-800/50">
                          <div className="flex items-center justify-between font-semibold text-black dark:text-white">
                            <span>{s.title}</span>
                            <span className="text-[10px] font-mono text-gray-400">{s.duration}</span>
                          </div>
                          <p className="text-gray-600 dark:text-neutral-400 mt-1 font-light">{s.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-black dark:text-white mb-1">Objetivo Ontológico Transformacional:</h4>
                  <p className="text-gray-700 dark:text-neutral-300 leading-relaxed">{selectedSpaceDetail.data.objective}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 space-y-2">
                  <h4 className="font-bold text-purple-900 dark:text-purple-300">Dimensiones del Proceso:</h4>
                  <div className="space-y-1 text-purple-950 dark:text-purple-200">
                    <div><strong>Lingüístico:</strong> {selectedSpaceDetail.data.methodology?.linguistic}</div>
                    <div><strong>Somático:</strong> {selectedSpaceDetail.data.methodology?.somatic}</div>
                    <div><strong>Emocional:</strong> {selectedSpaceDetail.data.methodology?.emotional}</div>
                  </div>
                </div>

                {selectedSpaceDetail.data.dailyMicroPractice && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                    <h4 className="font-bold text-amber-900 dark:text-amber-300">Micro-práctica Diaria: {selectedSpaceDetail.data.dailyMicroPractice.title}</h4>
                    <p className="text-amber-950/80 dark:text-amber-200/80 mt-1">{selectedSpaceDetail.data.dailyMicroPractice.description}</p>
                    <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-400 block mt-1">Frecuencia: {selectedSpaceDetail.data.dailyMicroPractice.frequency}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
