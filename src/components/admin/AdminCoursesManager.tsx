import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  DollarSign,
  Clock,
  Save,
  X,
  AlertCircle,
  Tag,
  BookOpen,
} from 'lucide-react';
import { OntologicalProgram } from '../../types';
import { OntologicalStore } from '../../services/store';

interface AdminCoursesManagerProps {
  onRefresh?: () => void;
}

export const AdminCoursesManager: React.FC<AdminCoursesManagerProps> = ({ onRefresh }) => {
  const [programs, setPrograms] = useState<OntologicalProgram[]>(() =>
    OntologicalStore.getPrograms()
  );
  const [editingProgram, setEditingProgram] = useState<OntologicalProgram | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const refreshList = () => {
    const list = OntologicalStore.getPrograms();
    setPrograms(list);
    if (onRefresh) onRefresh();
  };

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleAdjustSpots = (id: string, delta: number) => {
    const prog = programs.find((p) => p.id === id);
    if (!prog) return;
    const newAvailable = Math.max(0, (prog.availableSpots || 0) + delta);
    const newEnrolled = Math.max(0, (prog.totalCapacity || 15) - newAvailable);
    OntologicalStore.updateProgram(id, {
      availableSpots: newAvailable,
      enrolledCount: newEnrolled,
    });
    refreshList();
    showNotification(`Cupos de "${prog.name}" actualizados a ${newAvailable} disponibles.`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;

    // Validate capacities
    const totalCapacity = Number(editingProgram.totalCapacity) || 1;
    const availableSpots = Math.min(totalCapacity, Math.max(0, Number(editingProgram.availableSpots) || 0));
    const enrolledCount = Math.max(0, totalCapacity - availableSpots);

    const updatedData: Partial<OntologicalProgram> = {
      ...editingProgram,
      totalCapacity,
      availableSpots,
      enrolledCount,
    };

    if (isCreatingNew) {
      const newProg: OntologicalProgram = {
        ...editingProgram,
        id: `program-${Date.now()}`,
        totalCapacity,
        availableSpots,
        enrolledCount,
      };
      OntologicalStore.savePrograms([...programs, newProg]);
      showNotification(`Nuevo curso "${newProg.name}" creado con éxito.`);
    } else {
      OntologicalStore.updateProgram(editingProgram.id, updatedData);
      showNotification(`Curso "${editingProgram.name}" actualizado con éxito.`);
    }

    setEditingProgram(null);
    setIsCreatingNew(false);
    refreshList();
  };

  const handleDeleteProgram = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el curso "${name}"? Esta acción no se puede deshacer.`)) {
      OntologicalStore.deleteProgram(id);
      refreshList();
      showNotification(`Curso "${name}" eliminado.`);
    }
  };

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setEditingProgram({
      id: '',
      name: '',
      subtitle: '',
      category: 'Programa Directivo',
      format: 'Grupal / Cohorte',
      duration: '12 Semanas (6 Nodos)',
      totalCapacity: 15,
      availableSpots: 15,
      enrolledCount: 0,
      fee: '$1.500.000 COP',
      status: 'enrolling',
      description: 'Programa de intervención ontológica para ejecutivos y líderes conscientes.',
      keyOutcomes: [
        'Desmantelamiento de mandatos de autoexigencia',
        'Diseño de compromisos y quiebres directivos',
      ],
      displaySchedule: 'Jueves 6:30 PM - 8:30 PM COT',
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0],
      facilitator: 'John Fredy Rengifo Basto',
      totalNodes: 6,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 hover:text-emerald-800 text-xs">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span>Gestión de Cursos y Capacidad de Personas</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
            Configura el cupo máximo de participantes, plazas disponibles restantes, arancel de inversión y estado de inscripciones.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-gray-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Curso / Programa</span>
        </button>
      </div>

      {/* Grid of Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {programs.map((prog) => {
          const cap = prog.totalCapacity || 15;
          const avail = prog.availableSpots !== undefined ? prog.availableSpots : cap;
          const enrolled = prog.enrolledCount !== undefined ? prog.enrolledCount : cap - avail;
          const pct = Math.min(100, Math.round((enrolled / cap) * 100));

          return (
            <div
              key={prog.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-gray-300 dark:hover:border-neutral-700 transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                    {prog.category || 'Programa'}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      prog.status === 'Inscripciones Abiertas' || prog.status === 'Activo'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300'
                    }`}
                  >
                    {prog.status || 'Activo'}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-black dark:text-white line-clamp-1">{prog.name}</h4>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light line-clamp-2 mt-1">
                  {prog.subtitle || prog.description || 'Sin descripción'}
                </p>

                {/* Capacity Card & Progress */}
                <div className="mt-4 p-3.5 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-600 dark:text-neutral-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Capacidad Total:</span>
                    </span>
                    <span className="font-bold text-black dark:text-white font-mono">{cap} personas</span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        pct >= 90 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                    <span>
                      Inscritos: <strong className="font-semibold text-black dark:text-white">{enrolled}</strong>
                    </span>
                    <span>
                      Disponibles:{' '}
                      <strong
                        className={`font-semibold ${
                          avail <= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {avail} cupos
                      </strong>
                    </span>
                  </div>

                  {/* Fast Spot Adjusters */}
                  <div className="pt-2 border-t border-gray-200/60 dark:border-neutral-700/60 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-medium">Ajuste rápido de cupos:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAdjustSpots(prog.id, -1)}
                        disabled={avail <= 0}
                        title="Restar 1 cupo disponible"
                        className="w-6 h-6 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs font-bold flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-40 cursor-pointer"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleAdjustSpots(prog.id, 1)}
                        disabled={avail >= cap}
                        title="Sumar 1 cupo disponible"
                        className="w-6 h-6 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs font-bold flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-40 cursor-pointer"
                      >
                        +1
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800/80 text-gray-500 dark:text-neutral-400">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="truncate font-medium text-black dark:text-white">{prog.fee}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span className="truncate">{prog.duration}</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
                <button
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingProgram({ ...prog });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Editar Curso & Cupos</span>
                </button>
                <button
                  onClick={() => handleDeleteProgram(prog.id, prog.name)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Eliminar curso"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Editor / Creator */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#18181B] w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  {isCreatingNew ? 'Crear Nuevo Curso u Oferta Ontológica' : 'Editar Curso y Capacidad de Personas'}
                </h3>
                <p className="text-xs text-gray-400 font-light mt-0.5">
                  Ajusta los cupos máximos, arancel y características del programa.
                </p>
              </div>
              <button
                onClick={() => setEditingProgram(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Título del Curso / Programa *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProgram.name}
                    onChange={(e) => setEditingProgram({ ...editingProgram, name: e.target.value })}
                    placeholder="Ej: Certeza, Fronteras & Dirección Personal"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Subtítulo o Enfoque Ontológico
                  </label>
                  <input
                    type="text"
                    value={editingProgram.subtitle || ''}
                    onChange={(e) => setEditingProgram({ ...editingProgram, subtitle: e.target.value })}
                    placeholder="Ej: Programa de intervención directiva de 12 semanas"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Capacity & Spots - Explicit User Request */}
                <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Capacidad Total (Personas) *</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={500}
                      value={editingProgram.totalCapacity || 15}
                      onChange={(e) =>
                        setEditingProgram({
                          ...editingProgram,
                          totalCapacity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-indigo-200 dark:border-indigo-800 text-black dark:text-white font-mono font-bold"
                    />
                    <p className="text-[10px] text-gray-500">Cupo máximo de alumnos</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cupos Disponibles *</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={editingProgram.totalCapacity || 100}
                      value={editingProgram.availableSpots ?? 15}
                      onChange={(e) =>
                        setEditingProgram({
                          ...editingProgram,
                          availableSpots: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-emerald-800 text-black dark:text-white font-mono font-bold"
                    />
                    <p className="text-[10px] text-gray-500">Plazas libres restantes</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 dark:text-neutral-300">
                      Personas Inscritas
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingProgram.enrolledCount ?? 0}
                      onChange={(e) =>
                        setEditingProgram({
                          ...editingProgram,
                          enrolledCount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-mono"
                    />
                    <p className="text-[10px] text-gray-500">Alumnos ya matriculados</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Inversión / Fee (COP) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProgram.fee}
                    onChange={(e) => setEditingProgram({ ...editingProgram, fee: e.target.value })}
                    placeholder="$1.500.000 COP"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Estado del Curso *
                  </label>
                  <select
                    value={editingProgram.status || 'Inscripciones Abiertas'}
                    onChange={(e) => setEditingProgram({ ...editingProgram, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  >
                    <option value="Inscripciones Abiertas">Inscripciones Abiertas</option>
                    <option value="Activo">Activo (En curso)</option>
                    <option value="Cupos Agotados">Cupos Agotados</option>
                    <option value="Próximamente">Próximamente</option>
                    <option value="Borrador">Borrador</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Duración del Programa
                  </label>
                  <input
                    type="text"
                    value={editingProgram.duration}
                    onChange={(e) => setEditingProgram({ ...editingProgram, duration: e.target.value })}
                    placeholder="Ej: 12 Semanas (6 Nodos)"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Formato de Cursada
                  </label>
                  <input
                    type="text"
                    value={editingProgram.format}
                    onChange={(e) => setEditingProgram({ ...editingProgram, format: e.target.value })}
                    placeholder="Ej: Online en Vivo + Prácticas Somáticas"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Descripción Integral del Curso
                  </label>
                  <textarea
                    rows={3}
                    value={editingProgram.description || ''}
                    onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                    placeholder="Describe los alcances y la promesa ontológica del programa..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingProgram(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-gray-800 dark:hover:bg-neutral-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Datos y Cupos</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
