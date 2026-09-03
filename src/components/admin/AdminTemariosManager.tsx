import React, { useState } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Compass,
  Layers,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { ProgramNodeInfo } from '../../types';
import { OntologicalStore } from '../../services/store';

interface AdminTemariosManagerProps {
  onRefresh?: () => void;
}

export const AdminTemariosManager: React.FC<AdminTemariosManagerProps> = ({ onRefresh }) => {
  const [nodes, setNodes] = useState<ProgramNodeInfo[]>(() =>
    OntologicalStore.getProgramNodes()
  );
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const activeNode = nodes.find((n) => n.step === selectedStep) || nodes[0];
  const [formData, setFormData] = useState<ProgramNodeInfo>({ ...activeNode });

  const handleSelectNode = (step: number) => {
    setSelectedStep(step);
    const target = nodes.find((n) => n.step === step) || nodes[0];
    setFormData({ ...target });
  };

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    OntologicalStore.updateProgramNode(selectedStep, formData);
    const refreshed = OntologicalStore.getProgramNodes();
    setNodes(refreshed);
    if (onRefresh) onRefresh();
    showNotification(`Temario del Taller ${selectedStep} ("${formData.sessionTitle}") guardado exitosamente.`);
  };

  // Tangible outcomes management
  const handleAddOutcome = () => {
    const current = formData.tangibleOutcomes || [];
    setFormData({
      ...formData,
      tangibleOutcomes: [...current, 'Nuevo resultado tangible esperado'],
    });
  };

  const handleUpdateOutcome = (index: number, val: string) => {
    const current = [...(formData.tangibleOutcomes || [])];
    current[index] = val;
    setFormData({ ...formData, tangibleOutcomes: current });
  };

  const handleDeleteOutcome = (index: number) => {
    const current = (formData.tangibleOutcomes || []).filter((_, i) => i !== index);
    setFormData({ ...formData, tangibleOutcomes: current });
  };

  // Study materials management
  const handleAddStudyMaterial = () => {
    const current = formData.studyMaterials || [];
    setFormData({
      ...formData,
      studyMaterials: [
        ...current,
        {
          title: 'Nueva Guía de Indagación Ontológica',
          type: 'Guía de Trabajo',
          pages: '4 páginas',
          description: 'Herramienta descargable para profundizar la distinción del taller.',
        },
      ],
    });
  };

  const handleDeleteStudyMaterial = (index: number) => {
    const current = (formData.studyMaterials || []).filter((_, i) => i !== index);
    setFormData({ ...formData, studyMaterials: current });
  };

  const handleResetDefaults = () => {
    if (window.confirm('¿Deseas restablecer los temarios académicos a los valores estándar de fábrica?')) {
      const fresh = OntologicalStore.resetProgramNodesToDefault();
      setNodes(fresh);
      const target = fresh.find((n) => n.step === selectedStep) || fresh[0];
      setFormData({ ...target });
      if (onRefresh) onRefresh();
      showNotification('Temarios restablecidos al estándar original.');
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
            <FileText className="w-5 h-5 text-indigo-500" />
            <span>Formularios de Temarios (Syllabus Ontológico)</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
            Personaliza los objetivos, preguntas clave, metodologías en 3 dominios y materiales de cada módulo formativo.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 font-semibold text-xs hover:bg-gray-200 dark:hover:bg-neutral-700 flex items-center gap-1.5 shrink-0 cursor-pointer"
          title="Restablecer temarios estándar"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Estándar</span>
        </button>
      </div>

      {/* Step Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {nodes.map((n) => {
          const isSelected = n.step === selectedStep;
          return (
            <button
              key={n.step}
              onClick={() => handleSelectNode(n.step)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                isSelected
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                  : 'bg-white dark:bg-[#18181B] text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-800 hover:border-gray-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono ${
                  isSelected
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                {n.step}
              </span>
              <span>Taller {n.step}</span>
              <span className="text-[10px] opacity-70 hidden md:inline font-normal">({n.level})</span>
            </button>
          );
        })}
      </div>

      {/* Form Editor */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-xs space-y-6 text-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono">
              Nodo {formData.step} • {formData.level}
            </span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs font-medium text-gray-700 dark:text-neutral-300">{formData.weekLabel}</span>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-gray-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios del Temario</span>
          </button>
        </div>

        {/* Section 1: General Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-gray-700 dark:text-neutral-300">
              Título de la Sesión / Taller *
            </label>
            <input
              type="text"
              required
              value={formData.sessionTitle}
              onChange={(e) => setFormData({ ...formData, sessionTitle: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700 dark:text-neutral-300">
              Etiqueta de Semanas *
            </label>
            <input
              type="text"
              required
              value={formData.weekLabel}
              onChange={(e) => setFormData({ ...formData, weekLabel: e.target.value })}
              placeholder="Ej: Semanas 1-2"
              className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700 dark:text-neutral-300">
              Nivel Académico *
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
            >
              <option value="Nivel I">Nivel I</option>
              <option value="Nivel II">Nivel II</option>
              <option value="Nivel III">Nivel III</option>
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-gray-700 dark:text-neutral-300">
              Título del Nivel
            </label>
            <input
              type="text"
              value={formData.levelTitle}
              onChange={(e) => setFormData({ ...formData, levelTitle: e.target.value })}
              placeholder="Ej: Fundamentos & Transparencia"
              className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
            />
          </div>
        </div>

        {/* Section 2: Pedagogical Objective & Key Questions */}
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
          <div className="space-y-1">
            <label className="font-semibold text-gray-700 dark:text-neutral-300">
              Objetivo Pedagógico Central *
            </label>
            <textarea
              rows={3}
              required
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                <span>Pregunta Clave Ontológica *</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.keyQuestion}
                onChange={(e) => setFormData({ ...formData, keyQuestion: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Consigna / Prompt de Introspección</span>
              </label>
              <textarea
                rows={2}
                value={formData.levelPrompt}
                onChange={(e) => setFormData({ ...formData, levelPrompt: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Tangible Outcomes */}
        <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <label className="font-bold text-black dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Resultados Tangibles Esperados</span>
            </label>
            <button
              type="button"
              onClick={handleAddOutcome}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Agregar Resultado</span>
            </button>
          </div>

          <div className="space-y-2">
            {(formData.tangibleOutcomes || []).map((outcome, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 text-[10px] flex items-center justify-center font-mono shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => handleUpdateOutcome(idx, e.target.value)}
                  className="flex-1 p-2 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteOutcome(idx)}
                  className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: 3 Domains of Methodology */}
        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
          <h4 className="font-bold text-black dark:text-white flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Metodología en los 3 Dominios Ontológicos</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
              <span className="font-bold text-blue-900 dark:text-blue-200 block text-[11px]">
                1. Dimensión Lingüística
              </span>
              <textarea
                rows={3}
                value={formData.methodology?.linguistic || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    methodology: { ...(formData.methodology || { somatic: '', emotional: '' }), linguistic: e.target.value },
                  })
                }
                placeholder="Distinciones del habla y actos de lenguaje..."
                className="w-full p-2 rounded-lg bg-white dark:bg-neutral-800 border border-blue-200 dark:border-blue-800 text-black dark:text-white"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
              <span className="font-bold text-purple-900 dark:text-purple-200 block text-[11px]">
                2. Dimensión Somática
              </span>
              <textarea
                rows={3}
                value={formData.methodology?.somatic || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    methodology: { ...(formData.methodology || { linguistic: '', emotional: '' }), somatic: e.target.value },
                  })
                }
                placeholder="Disposición corporal, respiración y registro visceral..."
                className="w-full p-2 rounded-lg bg-white dark:bg-neutral-800 border border-purple-200 dark:border-purple-800 text-black dark:text-white"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-1.5">
              <span className="font-bold text-amber-900 dark:text-amber-200 block text-[11px]">
                3. Dimensión Emocional
              </span>
              <textarea
                rows={3}
                value={formData.methodology?.emotional || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    methodology: { ...(formData.methodology || { linguistic: '', somatic: '' }), emotional: e.target.value },
                  })
                }
                placeholder="Estados de ánimo y gestión del quiebre..."
                className="w-full p-2 rounded-lg bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-800 text-black dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Daily Micro-Practice */}
        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
          <h4 className="font-bold text-black dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Micro-Práctica Diaria</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-gray-700 dark:text-neutral-300">
                Título de la Micro-Práctica
              </label>
              <input
                type="text"
                value={formData.dailyMicroPractice?.title || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dailyMicroPractice: {
                      ...(formData.dailyMicroPractice || { description: '', frequency: '' }),
                      title: e.target.value,
                    },
                  })
                }
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-gray-700 dark:text-neutral-300">
                Frecuencia y Horario Sugerido
              </label>
              <input
                type="text"
                value={formData.dailyMicroPractice?.frequency || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dailyMicroPractice: {
                      ...(formData.dailyMicroPractice || { description: '', title: '' }),
                      frequency: e.target.value,
                    },
                  })
                }
                placeholder="Ej: Diaria (3 veces al día: 9:00 AM, 2:00 PM, 6:00 PM)"
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-medium text-gray-700 dark:text-neutral-300">
                Descripción e Instrucciones de la Práctica
              </label>
              <textarea
                rows={2}
                value={formData.dailyMicroPractice?.description || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dailyMicroPractice: {
                      ...(formData.dailyMicroPractice || { title: '', frequency: '' }),
                      description: e.target.value,
                    },
                  })
                }
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Study Materials */}
        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-black dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Materiales de Estudio y Guías Descargables</span>
            </h4>
            <button
              type="button"
              onClick={handleAddStudyMaterial}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Agregar Material</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(formData.studyMaterials || []).map((mat, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 relative space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black dark:text-white">{mat.title}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteStudyMaterial(idx)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 font-medium border border-gray-200 dark:border-neutral-700">
                    {mat.type}
                  </span>
                  <span>{mat.pages}</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-neutral-400 font-light">{mat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-gray-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios del Temario</span>
          </button>
        </div>
      </form>
    </div>
  );
};
