import React, { useState } from 'react';
import {
  ListOrdered,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle2,
  Save,
  X,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { WorkshopRoadmapStep, ProgramNodeInfo } from '../../types';
import { OntologicalStore, DEFAULT_ROADMAP_STEPS } from '../../services/store';

interface AdminRoadmapStepsManagerProps {
  onRefresh?: () => void;
}

export const AdminRoadmapStepsManager: React.FC<AdminRoadmapStepsManagerProps> = ({ onRefresh }) => {
  const [nodes, setNodes] = useState<ProgramNodeInfo[]>(() =>
    OntologicalStore.getProgramNodes()
  );
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [editingStep, setEditingStep] = useState<WorkshopRoadmapStep | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const activeNode = nodes.find((n) => n.step === selectedStep) || nodes[0];
  const steps: WorkshopRoadmapStep[] = activeNode.roadmapSteps || [];

  const totalMinutes = steps.reduce((acc, curr) => acc + (Number(curr.durationMinutes) || 0), 0);

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const refreshNodes = () => {
    const fresh = OntologicalStore.getProgramNodes();
    setNodes(fresh);
    if (onRefresh) onRefresh();
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingStep({
      id: '',
      stepNumber: steps.length + 1,
      title: '',
      durationMinutes: 15,
      phaseType: 'Dinámica Vivencial',
      description: '',
      keyInstructions: [''],
    });
  };

  const handleSaveStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStep) return;

    if (isCreating) {
      OntologicalStore.addRoadmapStep(selectedStep, {
        title: editingStep.title,
        durationMinutes: Number(editingStep.durationMinutes) || 15,
        phaseType: editingStep.phaseType,
        description: editingStep.description,
        keyInstructions: (editingStep.keyInstructions || []).filter((i) => i.trim().length > 0),
      });
      showNotification(`Paso "${editingStep.title}" agregado al Taller ${selectedStep}.`);
    } else {
      OntologicalStore.updateRoadmapStep(selectedStep, editingStep.id, {
        title: editingStep.title,
        durationMinutes: Number(editingStep.durationMinutes) || 15,
        phaseType: editingStep.phaseType,
        description: editingStep.description,
        keyInstructions: (editingStep.keyInstructions || []).filter((i) => i.trim().length > 0),
      });
      showNotification(`Paso "${editingStep.title}" actualizado.`);
    }

    setEditingStep(null);
    setIsCreating(false);
    refreshNodes();
  };

  const handleDeleteStep = (stepId: string, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el paso "${title}"?`)) {
      OntologicalStore.deleteRoadmapStep(selectedStep, stepId);
      refreshNodes();
      showNotification(`Paso eliminado.`);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...steps];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const ids = reordered.map((s) => s.id);
    OntologicalStore.reorderRoadmapSteps(selectedStep, ids);
    refreshNodes();
  };

  const handleResetRecommended = () => {
    if (window.confirm(`¿Restablecer los pasos del Taller ${selectedStep} al estándar recomendado?`)) {
      const defaultForThis = DEFAULT_ROADMAP_STEPS[selectedStep] || [];
      OntologicalStore.updateProgramNode(selectedStep, { roadmapSteps: defaultForThis });
      refreshNodes();
      showNotification(`Pasos del Taller ${selectedStep} restablecidos.`);
    }
  };

  const getPhaseBadgeColor = (phase: string) => {
    switch (phase) {
      case 'Centramiento & Apertura':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40';
      case 'Marco Teórico Ontológico':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/40';
      case 'Dinámica Vivencial':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/40';
      case 'Práctica Somática':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/40';
      case 'Cierre & Acuerdos':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/40';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-sm animate-fade-in text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-indigo-500" />
            <span>Pasos de Talleres y Sesiones</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
            Estructura la cronología de cada encuentro: fases de centramiento, marco teórico, dinámicas de quiebre y acuerdos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetRecommended}
            className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 font-semibold text-xs hover:bg-gray-200 cursor-pointer flex items-center gap-1.5"
            title="Restablecer pasos recomendados"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Pasos Recomendados</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-gray-800 dark:hover:bg-neutral-200 flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Nuevo Paso</span>
          </button>
        </div>
      </div>

      {/* Workshop Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {nodes.map((n) => {
          const isSelected = n.step === selectedStep;
          const count = (n.roadmapSteps || []).length;
          return (
            <button
              key={n.step}
              onClick={() => setSelectedStep(n.step)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                isSelected
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                  : 'bg-white dark:bg-[#18181B] text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-800 hover:border-gray-300'
              }`}
            >
              <span>Taller {n.step}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                {count} pasos
              </span>
            </button>
          );
        })}
      </div>

      {/* Workshop Meta Summary */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-black dark:text-white block text-sm">
            Taller {activeNode.step}: {activeNode.sessionTitle}
          </span>
          <span className="text-gray-500 dark:text-neutral-400 text-xs font-light">
            {activeNode.level} • {activeNode.weekLabel}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-indigo-100 dark:border-neutral-700 font-semibold text-black dark:text-white">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Duración Total Estimada: {totalMinutes} min</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-indigo-100 dark:border-neutral-700 font-semibold text-black dark:text-white font-mono">
            {steps.length} {steps.length === 1 ? 'Fase' : 'Fases'}
          </div>
        </div>
      </div>

      {/* Step by Step Timeline */}
      {steps.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#18181B] border border-dashed border-gray-200 dark:border-neutral-800 space-y-3">
          <ListOrdered className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-xs text-gray-500">Este taller aún no tiene pasos cronológicos configurados.</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold"
          >
            + Crear Primer Paso
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-300 dark:hover:border-neutral-700 transition-all text-xs"
            >
              <div className="flex items-start gap-3.5">
                <span className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {idx + 1}
                </span>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-sm text-black dark:text-white">{step.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPhaseBadgeColor(
                        step.phaseType
                      )}`}
                    >
                      {step.phaseType}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>{step.durationMinutes} min</span>
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-neutral-400 font-light leading-relaxed">
                    {step.description}
                  </p>

                  {step.keyInstructions && step.keyInstructions.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Pautas para el Facilitador:
                      </span>
                      <ul className="space-y-0.5">
                        {step.keyInstructions.map((ins, i) => (
                          <li key={i} className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-start gap-1.5">
                            <span className="text-indigo-500">•</span>
                            <span>{ins}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Step Controls */}
              <div className="flex items-center gap-1.5 self-end md:self-center shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                  title="Subir paso"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === steps.length - 1}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                  title="Bajar paso"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingStep({ ...step, keyInstructions: [...(step.keyInstructions || [])] });
                  }}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 cursor-pointer flex items-center gap-1 font-semibold text-xs px-2.5"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteStep(step.id, step.title)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                  title="Eliminar paso"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Step */}
      {editingStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#18181B] w-full max-w-lg rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  {isCreating ? `Nuevo Paso para Taller ${selectedStep}` : 'Editar Paso del Taller'}
                </h3>
                <p className="text-xs text-gray-400 font-light mt-0.5">
                  Define el objetivo, duración y pautas de esta etapa de la sesión.
                </p>
              </div>
              <button
                onClick={() => setEditingStep(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStep} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Título del Paso *
                </label>
                <input
                  type="text"
                  required
                  value={editingStep.title}
                  onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                  placeholder="Ej: Centramiento Somático y Apertura en Coherencia"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Duración (Minutos) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={180}
                    value={editingStep.durationMinutes}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, durationMinutes: parseInt(e.target.value) || 10 })
                    }
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Fase Ontológica *
                  </label>
                  <select
                    value={editingStep.phaseType}
                    onChange={(e) =>
                      setEditingStep({
                        ...editingStep,
                        phaseType: e.target.value as WorkshopRoadmapStep['phaseType'],
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  >
                    <option value="Centramiento & Apertura">Centramiento & Apertura</option>
                    <option value="Marco Teórico Ontológico">Marco Teórico Ontológico</option>
                    <option value="Dinámica Vivencial">Dinámica Vivencial</option>
                    <option value="Práctica Somática">Práctica Somática</option>
                    <option value="Cierre & Acuerdos">Cierre & Acuerdos</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Descripción y Alcance del Paso *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingStep.description}
                  onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                  placeholder="Describe qué ocurre durante esta fase y qué se busca activar en el participante..."
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Pautas Clave para el Facilitador (Una por línea)
                </label>
                <textarea
                  rows={3}
                  value={(editingStep.keyInstructions || []).join('\n')}
                  onChange={(e) =>
                    setEditingStep({
                      ...editingStep,
                      keyInstructions: e.target.value.split('\n'),
                    })
                  }
                  placeholder="Ej: Guiar 5 minutos de respiración diafragmática&#10;Diferenciar entre fáctico y juicio automático"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingStep(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-gray-800 dark:hover:bg-neutral-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Paso</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
